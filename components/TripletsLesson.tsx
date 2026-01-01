
import React, { useState, useRef, useEffect } from 'react';
import { LayoutGrid, Music3, Play, Pause, Square, Circle, Utensils } from 'lucide-react';

const TripletsLesson: React.FC = () => {
  const [activeType, setActiveType] = useState<'straight' | 'triplet'>('straight');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Animation Config
  const duration = 2; // seconds per loop (e.g. 2 beats)
  
  const playClick = (time: number, type: 'strong' | 'sub') => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.frequency.value = type === 'strong' ? 880 : 440; 
      osc.type = type === 'strong' ? 'square' : 'triangle';
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(type === 'strong' ? 0.3 : 0.15, time + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      
      osc.start(time);
      osc.stop(time + 0.15);
  };

  const lastScheduledBeat = useRef(-1);

  const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = (timestamp - startTimeRef.current) / 1000;
      const loopTime = elapsed % duration;
      const progress = loopTime / duration; // 0 to 1

      // Visual Update
      const ball = document.getElementById('rhythm-ball');
      const container = document.getElementById('rhythm-track');
      
      if (ball && container) {
          const width = container.clientWidth;
          // X Position: Linear scan (0 to width)
          const x = progress * width;
          
          // Y Position: Bouncing physics simulation
          const bounces = activeType === 'straight' ? 4 : 6;
          
          // Current bounce cycle (0 to 1 within a single bounce)
          const bounceProgress = (progress * bounces) % 1;
          
          // Parabolic arc: y = sin(p * PI)
          const height = 80; 
          const y = Math.sin(bounceProgress * Math.PI) * height;

          // Apply transform
          // Note: The ball is absolutely positioned at (0,0) inside the track.
          // translateX moves it to 'x'. translateY moves it up by 'y'.
          // We also center the ball on the x-axis using -50% in CSS, so x corresponds to the center.
          ball.style.transform = `translate(${x}px, ${-y}px)`;
      }

      // Audio Scheduler (Lookahead)
      const ctx = audioCtxRef.current;
      if (ctx) {
          const subdivisions = activeType === 'straight' ? 4 : 6;
          const stepTime = duration / subdivisions;

          const totalTicks = Math.floor(elapsed / stepTime);
          
          if (totalTicks > lastScheduledBeat.current) {
              const tickInLoop = totalTicks % subdivisions;
              const isBeat = activeType === 'straight' ? (tickInLoop % 2 === 0) : (tickInLoop % 3 === 0);

              playClick(ctx.currentTime, isBeat ? 'strong' : 'sub');
              
              // Flash visual marker
              const marker = document.getElementById(`marker-${tickInLoop}`);
              if (marker) {
                  marker.style.backgroundColor = activeType === 'straight' ? '#f59e0b' : '#3b82f6';
                  marker.style.transform = 'translate(-50%, -50%) scale(1.5)';
                  setTimeout(() => {
                      if(marker) {
                          marker.style.backgroundColor = '#e5e7eb';
                          marker.style.transform = 'translate(-50%, -50%) scale(1)';
                      }
                  }, 150);
              }

              lastScheduledBeat.current = totalTicks;
          }
      }

      if (isPlaying) {
          rafRef.current = requestAnimationFrame(animate);
      }
  };

  useEffect(() => {
      if (isPlaying) {
          if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
          
          startTimeRef.current = performance.now();
          lastScheduledBeat.current = -1;
          rafRef.current = requestAnimationFrame(animate);
      } else {
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          const ball = document.getElementById('rhythm-ball');
          if (ball) ball.style.transform = `translate(0px, 0px)`;
      }
      return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }
  }, [isPlaying, activeType]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const subdivisionCount = activeType === 'straight' ? 4 : 6;

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 2</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            三连音 <span className="text-stone-300 font-light">|</span> Triplets
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          把一拍平均分成三份。它打破了“二分法”的方正，将音乐从“行走”变成了“圆舞”。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-200 p-8 md:p-12 animate-slideUp stagger-1 flex flex-col gap-12 relative overflow-hidden min-h-[500px]">
          
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
              <div className="flex bg-stone-100 p-1.5 rounded-2xl">
                  <button 
                    onClick={() => { setActiveType('straight'); setIsPlaying(false); }}
                    className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 ${activeType === 'straight' ? 'bg-white shadow-md text-amber-600' : 'text-stone-500 hover:text-stone-700'}`}
                  >
                      <Square size={18} /> 八分音符 (Straight)
                  </button>
                  <button 
                    onClick={() => { setActiveType('triplet'); setIsPlaying(false); }}
                    className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 ${activeType === 'triplet' ? 'bg-white shadow-md text-blue-600' : 'text-stone-500 hover:text-stone-700'}`}
                  >
                      <Circle size={18} /> 三连音 (Triplet)
                  </button>
              </div>

              <div className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-colors ${activeType === 'straight' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                  {activeType === 'straight' ? '1 & 2 &' : '1-trip-let 2-trip-let'}
              </div>
          </div>

          {/* Visualizer Canvas */}
          <div className="relative h-64 bg-stone-50 rounded-3xl border border-stone-200 flex flex-col justify-end overflow-hidden px-8 md:px-12">
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px)', backgroundSize: '100% 40px' }}></div>
              
              {/* The Track Container */}
              <div id="rhythm-track" className="relative w-full h-12 mb-12">
                  
                  {/* Floor Line */}
                  <div className="absolute bottom-0 w-full h-1 bg-stone-300 rounded-full"></div>

                  {/* Timeline Markers */}
                  {Array.from({ length: subdivisionCount + 1 }).map((_, i) => {
                      const isEnd = i === subdivisionCount;
                      const isBeat = activeType === 'straight' ? (i % 2 === 0) : (i % 3 === 0);
                      const pct = (i / subdivisionCount) * 100;
                      
                      return (
                          <div 
                            key={i} 
                            className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1/2 flex flex-col items-center justify-center overflow-visible"
                            style={{ left: `${pct}%` }}
                          >
                              {/* The Dot Marker */}
                              <div 
                                id={isEnd ? 'marker-end' : `marker-${i}`}
                                className={`rounded-full transition-all duration-100 ${
                                    isEnd 
                                    ? 'w-3 h-3 bg-stone-300 opacity-50' 
                                    : (isBeat ? 'w-4 h-4 bg-stone-400' : 'w-2 h-2 bg-stone-300')
                                }`}
                              ></div>
                              
                              {/* Label */}
                              {!isEnd && (
                                  <div className="absolute top-6 text-xs font-mono text-stone-400 font-bold whitespace-nowrap">
                                      {activeType === 'straight' 
                                        ? (i%2===0 ? (i/2 + 1) : '&') 
                                        : (i%3===0 ? (i/3 + 1) : (i%3===1 ? 'trip' : 'let'))
                                      }
                                  </div>
                              )}
                          </div>
                      )
                  })}

                  {/* The Ball */}
                  {/* Centered initially at (0,0) relative to track. -translate-x-1/2 centers the ball horizontally on its x coordinate */}
                  <div 
                    id="rhythm-ball"
                    className={`absolute bottom-0 left-0 w-12 h-12 rounded-full shadow-lg border-4 border-white flex items-center justify-center transition-colors duration-300 transform -translate-x-1/2 translate-y-0 z-20 ${activeType === 'straight' ? 'bg-amber-500' : 'bg-blue-500'}`}
                  >
                      {activeType === 'straight' ? <Square size={16} fill="white" className="text-white"/> : <Circle size={16} fill="white" className="text-white"/>}
                  </div>

              </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
              <button 
                onClick={togglePlay}
                className={`flex items-center gap-3 px-12 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all transform active:scale-95 ${
                    isPlaying 
                    ? 'bg-stone-800 text-stone-400 cursor-default border border-stone-700' 
                    : (activeType === 'straight' ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-blue-500 text-white hover:bg-blue-600')
                }`}
              >
                  {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
                  <span>{isPlaying ? 'Stop Loop' : 'Start Rhythm'}</span>
              </button>
          </div>
      </div>

      {/* Mnemonic & Theory Section */}
      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
          
          {/* Mnemonic Card */}
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover group">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Utensils className="text-stone-400 group-hover:text-amber-500 transition-colors" />
                  水果记忆法 (Mnemonics)
              </h3>
              <p className="text-stone-600 text-sm mb-6 leading-relaxed">
                  不知道怎么数？试着念出这些单词：
              </p>
              
              <div className="space-y-4">
                  <div className={`p-4 rounded-xl border-l-4 transition-colors ${activeType === 'straight' ? 'bg-amber-50 border-amber-500' : 'bg-stone-50 border-stone-200'}`}>
                      <div className="flex justify-between font-bold text-stone-800 mb-1">
                          <span>八分音符 (2)</span>
                          <span className="text-amber-600">Ap - ple</span>
                      </div>
                      <div className="flex gap-1 text-xs font-mono text-stone-400">
                          <div className="flex-1 bg-stone-200 h-1 rounded"></div>
                          <div className="flex-1 bg-stone-200 h-1 rounded"></div>
                      </div>
                  </div>

                  <div className={`p-4 rounded-xl border-l-4 transition-colors ${activeType === 'triplet' ? 'bg-blue-50 border-blue-500' : 'bg-stone-50 border-stone-200'}`}>
                      <div className="flex justify-between font-bold text-stone-800 mb-1">
                          <span>三连音 (3)</span>
                          <span className="text-blue-600">Pine - ap - ple</span>
                      </div>
                      <div className="flex gap-1 text-xs font-mono text-stone-400">
                          <div className="flex-1 bg-stone-200 h-1 rounded"></div>
                          <div className="flex-1 bg-stone-200 h-1 rounded"></div>
                          <div className="flex-1 bg-stone-200 h-1 rounded"></div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Feel Card */}
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <LayoutGrid className="text-stone-400" />
                  方与圆 (Square vs Round)
              </h3>
              <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
                  <p>
                      <strong>直拍 (Straight)</strong> 就像正方形。它是二分法的，像行军一样稳健、棱角分明。流行音乐、摇滚乐大多基于这种“方正”的节奏。
                  </p>
                  <p>
                      <strong>三连音 (Triplet)</strong> 就像圆形或三角形。它是三分法的，带有一种滚动的、旋转的动能。它是华尔兹 (Waltz)、蓝调 (Blues) 和爵士摇摆 (Swing) 的灵魂。
                  </p>
              </div>
          </div>

      </div>
    </div>
  );
};

export default TripletsLesson;
