
import React, { useState, useEffect, useRef } from 'react';
import { Zap, Play, Pause, Activity, Footprints } from 'lucide-react';

const SyncopationLesson: React.FC = () => {
  const [activePattern, setActivePattern] = useState<'straight' | 'syncopated' | 'tresillo'>('straight');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Use a smooth progress ref instead of stepping state for animation
  const [smoothProgress, setSmoothProgress] = useState(0); 
  const [currentStepInt, setCurrentStepInt] = useState(-1); // For triggering visuals

  const audioCtxRef = useRef<AudioContext | null>(null);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const lastScheduledStep = useRef<number>(-1);

  // 1 Bar = 4 Beats = 16 Sixteenth notes
  const totalSteps = 16;
  const bpm = 100;
  const secondsPerBeat = 60 / bpm;
  const loopDuration = secondsPerBeat * 4; // 4 beats per bar
  const stepTime = loopDuration / totalSteps;

  const getActivePattern = () => {
      if (activePattern === 'straight') return [
          {i:0, t:'strong'}, {i:4, t:'strong'}, {i:8, t:'strong'}, {i:12, t:'strong'}
      ];
      if (activePattern === 'syncopated') return [
          {i:0, t:'strong'}, {i:6, t:'accent'}, {i:12, t:'strong'} // 1, 2&, 4
      ];
      if (activePattern === 'tresillo') return [
          {i:0, t:'strong'}, {i:3, t:'accent'}, {i:6, t:'accent'}, {i:10, t:'weak'}, {i:12, t:'weak'} // 3-3-2 feel
      ];
      return [];
  };

  const playSound = (type: 'kick' | 'snare' | 'hihat') => {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'kick') {
          osc.frequency.setValueAtTime(150, t);
          osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.5);
          gain.gain.setValueAtTime(0.8, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
          osc.start(t);
          osc.stop(t + 0.5);
      } else if (type === 'snare') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(250, t);
          gain.gain.setValueAtTime(0.4, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          osc.start(t);
          osc.stop(t + 0.2);
      } else { // hihat
          osc.type = 'square';
          osc.frequency.setValueAtTime(800, t);
          gain.gain.setValueAtTime(0.1, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
          osc.start(t);
          osc.stop(t + 0.05);
      }
  };

  const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = (timestamp - startTimeRef.current) / 1000;
      
      const progress = (elapsed % loopDuration) / loopDuration; // 0 to 1
      setSmoothProgress(progress);

      // Audio Scheduling Logic (Quantized)
      const currentTotalSteps = Math.floor(elapsed / stepTime);
      
      if (currentTotalSteps > lastScheduledStep.current) {
          const stepInLoop = currentTotalSteps % totalSteps;
          setCurrentStepInt(stepInLoop);

          // Metronome on downbeats
          if (stepInLoop % 4 === 0) {
              playSound('hihat');
          }

          // Pattern Triggers
          const pattern = getActivePattern();
          const hit = pattern.find(p => p.i === stepInLoop);
          if (hit) {
              if (hit.t === 'strong') playSound('kick');
              else playSound('snare');
              
              const el = document.getElementById(`beat-${stepInLoop}`);
              if (el) {
                  el.classList.remove('animate-ping-once');
                  void el.offsetWidth;
                  el.classList.add('animate-ping-once');
              }
          }
          lastScheduledStep.current = currentTotalSteps;
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
          lastScheduledStep.current = -1;
          rafRef.current = requestAnimationFrame(animate);
      } else {
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          setSmoothProgress(0);
          setCurrentStepInt(-1);
      }
      return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }
  }, [isPlaying, activePattern]);

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 4</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            切分音 <span className="text-stone-300 font-light">|</span> Syncopation
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          节奏的“反叛者”。它故意避开强拍，去强调弱拍（Off-beat），制造出一种“想动”的失衡感。
        </p>
      </header>

      {/* Interactive Visualizer */}
      <div className="bg-stone-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl animate-slideUp stagger-1 relative overflow-hidden min-h-[400px] flex flex-col justify-between">
          
          {/* Timeline Visual - Using Flexbox for layout */}
          <div className="flex-1 flex flex-col justify-center gap-12 relative z-10 w-full max-w-5xl mx-auto px-4">
              
              {/* Row 1: The Expectation (Pulse) */}
              <div className="flex items-center gap-6">
                  {/* Label Column */}
                  <div className="w-24 text-right hidden md:block">
                      <div className="text-xs font-bold text-stone-500 uppercase tracking-widest">Pulse</div>
                      <div className="text-[10px] text-stone-600">(预期)</div>
                  </div>
                  
                  {/* Track Column */}
                  <div className="flex-1 relative h-16">
                      {/* Grid Lines inside track */}
                      <div className="absolute top-0 bottom-0 left-0 right-0 flex justify-between pointer-events-none opacity-20">
                          {[0,1,2,3,4].map(i => <div key={i} className="w-px h-full bg-white"></div>)}
                      </div>

                      <div className="w-full relative h-full">
                          {/* Pulse Dots */}
                          {[0, 4, 8, 12].map(i => (
                              <div 
                                key={i} 
                                className={`absolute top-1/2 w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100 ${currentStepInt >= i && currentStepInt < i+4 ? 'bg-stone-400 scale-125' : 'bg-stone-700'}`}
                                style={{ left: `${(i/16)*100}%` }}
                              ></div>
                          ))}
                          {/* Connecting Line */}
                          <div className="w-full h-0.5 bg-stone-700 absolute top-1/2 -translate-y-1/2 -z-10"></div>
                      </div>
                  </div>
              </div>

              {/* Row 2: The Reality (Rhythm) */}
              <div className="flex items-center gap-6">
                  {/* Label Column */}
                  <div className="w-24 text-right hidden md:block">
                      <div className="text-xs font-bold text-amber-500 uppercase tracking-widest">Rhythm</div>
                      <div className="text-[10px] text-amber-900/60">(实际)</div>
                  </div>

                  {/* Track Column */}
                  <div className="flex-1 relative h-24 flex items-center">
                      <div className="w-full relative h-full flex items-center">
                          <div className="w-full h-1 bg-stone-800 absolute top-1/2 -translate-y-1/2 -z-10 rounded-full"></div>
                          
                          {/* Smooth Playhead */}
                          <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-stone-500 z-0 transition-opacity duration-75"
                            style={{ left: `${smoothProgress * 100}%`, opacity: isPlaying ? 1 : 0 }}
                          ></div>

                          {getActivePattern().map((note, idx) => {
                              const isOffBeat = note.i % 4 !== 0;
                              return (
                                  <div 
                                    key={idx}
                                    id={`beat-${note.i}`}
                                    className={`
                                        absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg border-2 transition-all duration-200
                                        ${isOffBeat ? 'bg-amber-500 border-amber-400 text-stone-900 z-20' : 'bg-stone-800 border-stone-600 text-stone-500 z-10'}
                                        ${currentStepInt === note.i ? 'scale-110 brightness-125' : 'scale-100'}
                                    `}
                                    style={{ left: `${(note.i / 16) * 100}%`, transform: 'translate(-50%, -50%)' }}
                                  >
                                      {isOffBeat && <Zap size={16} className="absolute -top-6 text-amber-500 animate-bounce" />}
                                      {isOffBeat ? '>' : ''}
                                  </div>
                              )
                          })}
                      </div>
                  </div>
              </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-8 z-20">
              <div className="flex bg-stone-800 p-1.5 rounded-2xl border border-stone-700">
                  <button 
                    onClick={() => { setActivePattern('straight'); setIsPlaying(true); }}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activePattern === 'straight' ? 'bg-stone-200 text-stone-900' : 'text-stone-400 hover:text-white'}`}
                  >
                      正拍 (Straight)
                  </button>
                  <button 
                    onClick={() => { setActivePattern('syncopated'); setIsPlaying(true); }}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activePattern === 'syncopated' ? 'bg-amber-500 text-stone-900 shadow-lg' : 'text-stone-400 hover:text-white'}`}
                  >
                      流行切分 (Pop Sync)
                  </button>
                  <button 
                    onClick={() => { setActivePattern('tresillo'); setIsPlaying(true); }}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activePattern === 'tresillo' ? 'bg-rose-500 text-white shadow-lg' : 'text-stone-400 hover:text-white'}`}
                  >
                      Tresillo (3-3-2)
                  </button>
              </div>

              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-stone-700 text-stone-400' : 'bg-white text-stone-900 hover:scale-105'}`}
              >
                  {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
              </button>
          </div>
      </div>

      {/* Theory Cards */}
      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
          
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Activity className="text-amber-500" />
                  惊奇感 (Surprise)
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  大脑喜欢预测。当听到稳定的 1-2-3-4 脉冲时，大脑预测下一个重音会在强拍上。
                  <br/><br/>
                  切分音打破了这个预测。它在弱拍（比如 2 的后半拍）突然给出一个重音。这种<strong>“预期的落空”</strong>会让大脑产生轻微的兴奋感，这就是 Groove（律动）的来源。
              </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Footprints className="text-rose-500" />
                  向前滚动的动力
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  切分音往往会抹去强拍（比如上面的 "流行切分" 模式中，第 3 拍是空的）。
                  <br/><br/>
                  因为重音提前出现了，音乐感觉像是被“推”着向前走，而不是稳稳地落在地上。这给音乐带来了一种急切的、想要继续前进的动能。
              </p>
          </div>

      </div>

      {/* CSS for custom ping */}
      <style>{`
        .animate-ping-once {
            animation: pingVisual 0.4s cubic-bezier(0, 0, 0.2, 1);
        }
        @keyframes pingVisual {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
            100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; box-shadow: 0 0 0 20px rgba(245, 158, 11, 0); }
        }
      `}</style>
    </div>
  );
};

export default SyncopationLesson;
