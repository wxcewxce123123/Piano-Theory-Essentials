
import React, { useState, useRef, useEffect } from 'react';
import { Infinity, Play, Pause, Disc, Waves, Layers, Zap, Repeat } from 'lucide-react';

const MinimalismLesson: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phaseOffset, setPhaseOffset] = useState(0); // 0 to 360 degrees (one full cycle)
  const startTimeRef = useRef<number>(0);
  const requestRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Pattern: C E G B (Cmaj7 arpeggio)
  // Frequency Map
  const pattern = [
      { note: 'C', freq: 261.63, color: 'bg-rose-500' }, 
      { note: 'E', freq: 329.63, color: 'bg-amber-500' }, 
      { note: 'G', freq: 392.00, color: 'bg-emerald-500' }, 
      { note: 'B', freq: 493.88, color: 'bg-indigo-500' }
  ];
  const loopDuration = 2; // seconds for one full loop of 4 notes

  const playNote = (freq: number, pan: number, velocity: number = 1) => {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner();

      osc.frequency.value = freq;
      osc.type = 'triangle'; // Clear, marimba-like woodiness

      panner.pan.value = pan; // -1 Left, 1 Right

      osc.connect(gain);
      gain.connect(panner);
      panner.connect(ctx.destination);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2 * velocity, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.start(now);
      osc.stop(now + 0.2);
  };

  const lastNoteRef = useRef({ left: -1, right: -1 });

  const animate = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = (time - startTimeRef.current) / 1000;
      
      // Calculate position in the loop (0 to 1)
      const baseProgress = (elapsed % loopDuration) / loopDuration;
      
      // Right hand shift (0 to 1 based on 360 deg)
      const shiftAmount = phaseOffset / 360; 
      const rightProgress = (baseProgress + shiftAmount) % 1;

      // --- CIRCULAR VISUALS ---
      const leftDot = document.getElementById('min-dot-left');
      const rightDot = document.getElementById('min-dot-right');
      const rightTrail = document.getElementById('min-trail-right');
      
      if (leftDot) {
          const angle = baseProgress * 360;
          leftDot.setAttribute('transform', `rotate(${angle}, 150, 150) translate(0, -100)`);
      }
      if (rightDot) {
          const angle = rightProgress * 360;
          rightDot.setAttribute('transform', `rotate(${angle}, 150, 150) translate(0, -70)`); // Inner circle
      }
      if (rightTrail) {
          // Visual arc showing the phase difference
          // This is complex to draw dynamically as SVG arc path without React state re-render
          // We'll skip complex path manipulation in RAF for performance or use simple rotation
          rightTrail.setAttribute('transform', `rotate(${baseProgress * 360}, 150, 150)`);
      }

      // --- LINEAR TAPE VISUALS ---
      const tapeLeft = document.getElementById('tape-left');
      const tapeRight = document.getElementById('tape-right');
      
      if (tapeLeft && tapeRight) {
          // Width of one loop cycle in pixels (e.g. 200px)
          const loopWidth = 200; 
          // Move left: progress * loopWidth
          // We show 2 cycles to allow seamless wrapping
          const leftX = -(baseProgress * loopWidth);
          const rightX = -(rightProgress * loopWidth);
          
          tapeLeft.style.transform = `translateX(${leftX}px)`;
          tapeRight.style.transform = `translateX(${rightX}px)`;
      }

      // --- AUDIO TRIGGERS ---
      const totalNotes = 4;
      const leftIndex = Math.floor(baseProgress * totalNotes);
      const rightIndex = Math.floor(rightProgress * totalNotes);

      if (leftIndex !== lastNoteRef.current.left) {
          playNote(pattern[leftIndex].freq, -0.6); // Left pan
          lastNoteRef.current.left = leftIndex;
          
          // Flash Left Tape Block
          const el = document.getElementById(`tape-block-left-${leftIndex}`);
          if(el) { el.style.filter = 'brightness(1.5)'; setTimeout(() => el.style.filter = 'brightness(1)', 100); }
      }

      if (rightIndex !== lastNoteRef.current.right) {
          playNote(pattern[rightIndex].freq, 0.6); // Right pan
          lastNoteRef.current.right = rightIndex;
          
          // Flash Right Tape Block
          const el = document.getElementById(`tape-block-right-${rightIndex}`);
          if(el) { el.style.filter = 'brightness(1.5)'; setTimeout(() => el.style.filter = 'brightness(1)', 100); }
      }

      requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
      if (isPlaying) {
          if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
          
          startTimeRef.current = performance.now();
          requestRef.current = requestAnimationFrame(animate);
      } else {
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
      }
      return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); }
  }, [isPlaying, phaseOffset]);

  // Snap function for interesting intervals
  const snapTo = (val: number) => {
      setPhaseOffset(val);
  };

  return (
    <div className="space-y-16">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-stone-900 text-stone-100 rounded-full text-xs font-bold tracking-wider uppercase mb-3 shadow-lg flex items-center gap-2 w-fit">
            <Infinity size={12} className="text-cyan-400" />
            Level 5 - Master Class
        </div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            极简主义 <span className="text-stone-300 font-light">|</span> Minimalism
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-3xl leading-relaxed">
          "我对此类音乐的兴趣在于，它们决定了你会听到什么细节，而这细节是我从未计划过的。" —— Steve Reich
          <br/><br/>
          <strong>相位移动 (Phasing)</strong> 是极简主义的核心技法之一。当两个完全相同的旋律循环以极其微小的速度差播放时，它们会逐渐错开，产生万花筒般不断变化的节奏图案。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-[#1c1917] rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden animate-slideUp stagger-1 flex flex-col lg:flex-row items-center gap-16 border border-stone-800">
          
          {/* Subtle Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          {/* LEFT: Visualizers */}
          <div className="flex-1 w-full flex flex-col items-center gap-12">
              
              {/* 1. Circular Phase Visualizer */}
              <div className="relative w-[300px] h-[300px] flex-shrink-0">
                  <svg width="100%" height="100%" viewBox="0 0 300 300" className="overflow-visible">
                      {/* Tracks */}
                      <circle cx="150" cy="150" r="100" fill="none" stroke="#333" strokeWidth="2" />
                      <circle cx="150" cy="150" r="70" fill="none" stroke="#333" strokeWidth="2" />
                      
                      {/* Compass Marks */}
                      {[0, 90, 180, 270].map(deg => (
                          <line key={deg} x1="150" y1="145" x2="150" y2="155" stroke="#444" strokeWidth="1" transform={`rotate(${deg}, 150, 150) translate(0, -100)`} />
                      ))}

                      {/* Moving Dots */}
                      {/* Left Channel (Fixed) - Cyan */}
                      <g id="min-dot-left">
                          <circle r="8" fill="#06b6d4" className="shadow-[0_0_15px_#06b6d4]" />
                          <text y="4" textAnchor="middle" fontSize="8" fill="black" fontWeight="bold">L</text>
                      </g>
                      
                      {/* Right Channel (Variable) - Fuchsia */}
                      <g id="min-dot-right">
                          <circle r="8" fill="#d946ef" className="shadow-[0_0_15px_#d946ef]" />
                          <text y="4" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">R</text>
                      </g>
                      
                      {/* Center Info */}
                      <text x="150" y="145" textAnchor="middle" fill="#666" fontSize="10" fontFamily="monospace" fontWeight="bold">PHASE</text>
                      <text x="150" y="165" textAnchor="middle" fill="white" fontSize="14" fontFamily="monospace" fontWeight="bold">{Math.round(phaseOffset)}°</text>
                  </svg>
              </div>

              {/* 2. Linear Tape Visualizer (New) */}
              <div className="w-full max-w-md relative">
                  <div className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Disc size={12} className="animate-spin-slow"/> Tape Loops
                  </div>
                  
                  {/* Container with Mask */}
                  <div className="w-full bg-black/40 rounded-xl border border-stone-700 overflow-hidden relative h-24 p-2 flex flex-col gap-2">
                      
                      {/* Center Highlight Line (The Playhead) */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 z-10"></div>

                      {/* Tape 1 (Left) */}
                      <div className="h-8 w-full relative overflow-hidden bg-stone-900/50 rounded">
                          <div id="tape-left" className="absolute top-0 left-1/2 h-full flex">
                              {/* Repeat pattern to allow infinite scroll illusion */}
                              {[0,1,2,3,4,5].map(loop => (
                                  <div key={loop} className="flex w-[200px] shrink-0">
                                      {pattern.map((n, i) => (
                                          <div key={i} id={`tape-block-left-${i}`} className={`flex-1 h-full border-r border-black/20 flex items-center justify-center text-[10px] font-bold text-white/80 ${n.color} opacity-80`}>
                                              {n.note}
                                          </div>
                                      ))}
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* Tape 2 (Right) */}
                      <div className="h-8 w-full relative overflow-hidden bg-stone-900/50 rounded">
                          <div id="tape-right" className="absolute top-0 left-1/2 h-full flex">
                              {[0,1,2,3,4,5].map(loop => (
                                  <div key={loop} className="flex w-[200px] shrink-0">
                                      {pattern.map((n, i) => (
                                          <div key={i} id={`tape-block-right-${i}`} className={`flex-1 h-full border-r border-black/20 flex items-center justify-center text-[10px] font-bold text-white/80 ${n.color} opacity-80`}>
                                              {n.note}
                                          </div>
                                      ))}
                                  </div>
                              ))}
                          </div>
                      </div>

                  </div>
              </div>
          </div>

          {/* RIGHT: Controls & Explanation */}
          <div className="flex-1 w-full max-w-md bg-stone-800/50 p-8 rounded-3xl border border-stone-700 backdrop-blur-sm h-full flex flex-col justify-center">
              
              <div className="mb-10">
                  <div className="flex justify-between items-end mb-4">
                      <label className="text-white font-bold text-lg flex items-center gap-2">
                          <Waves size={20} className="text-amber-500" />
                          相位偏移 (Phase Offset)
                      </label>
                      <span className="text-stone-400 font-mono text-xs">{phaseOffset}° / 360°</span>
                  </div>
                  
                  <input 
                    type="range" 
                    min="0" max="360" step="0.5"
                    value={phaseOffset}
                    onChange={(e) => setPhaseOffset(Number(e.target.value))}
                    className="w-full h-3 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-white hover:accent-amber-400 transition-all"
                  />
                  
                  <div className="flex justify-between mt-4">
                      <button onClick={() => snapTo(0)} className="text-[10px] bg-stone-700 text-stone-300 px-2 py-1 rounded hover:bg-stone-600">Unison (0°)</button>
                      <button onClick={() => snapTo(90)} className="text-[10px] bg-stone-700 text-stone-300 px-2 py-1 rounded hover:bg-stone-600">1/16 Note (90°)</button>
                      <button onClick={() => snapTo(180)} className="text-[10px] bg-stone-700 text-stone-300 px-2 py-1 rounded hover:bg-stone-600">1/8 Note (180°)</button>
                  </div>

                  <p className="text-xs text-stone-400 mt-6 leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5">
                      <strong>听觉实验：</strong> 
                      当滑块处于 <strong>0°</strong> 时，你听到的是齐奏。
                      试着慢慢拖动到 <strong>90°</strong>（十六分音符错位），你会听到一种新的“加倍”节奏，好像音符数量变多了。
                      这就是“衍生图案”诞生的时刻。
                  </p>
              </div>

              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`w-full py-5 rounded-xl font-bold flex items-center justify-center gap-3 transition-all text-lg shadow-xl active:scale-95 ${
                    isPlaying 
                    ? 'bg-stone-700 text-stone-400 border border-stone-600' 
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:scale-[1.02]'
                }`}
              >
                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                  {isPlaying ? '暂停实验' : '开始相位移动'}
              </button>
          </div>
      </div>

      {/* Deep Dive Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slideUp stagger-2">
          
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Repeat className="text-cyan-500" />
                  过程音乐 (Process Music)
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  Steve Reich 曾说：“我想听到过程发生。”
                  <br/><br/>
                  极简主义不是关于“简单”，而是关于<strong>可听见的结构变化</strong>。作曲家设定一个初始状态（如两个同步的循环）和一个规则（其中一个稍微加速），然后让音乐自己“运行”。听众的任务就是观察这个过程如何展开。
              </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Zap className="text-fuchsia-500" />
                  衍生图案 (Resultant Patterns)
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  当你听这段音乐时，你的大脑会试图寻找规律。
                  <br/><br/>
                  在某些相位点（如错开一个音符时），左右声道的音符会交织在一起，形成一条<strong>原本乐谱上没有写出来的</strong>新旋律。这就是“衍生图案”——一种从简单的相互作用中涌现出的复杂性。
              </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Layers className="text-emerald-500" />
                  钢琴相位 (Piano Phase)
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  1967年，Steve Reich 创作了著名的《Piano Phase》。
                  <br/><br/>
                  两位钢琴家弹奏完全相同的12音旋律。第一位保持速度，第二位稍微加速。大约需要15-20分钟，第二位钢琴家才会比第一位多弹整整一圈，回到同步状态。这期间产生的所有微观节奏变化，就是乐曲的全部内容。
              </p>
          </div>

      </div>
    </div>
  );
};

export default MinimalismLesson;
