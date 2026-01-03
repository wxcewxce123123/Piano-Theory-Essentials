
import React, { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, Disc, ArrowRight, CornerRightDown, AlignCenter, Moon, Zap, Coffee } from 'lucide-react';

const JazzBasicsLesson: React.FC = () => {
  const [swingMode, setSwingMode] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChordIdx, setActiveChordIdx] = useState(-1); // 0: ii, 1: V, 2: I
  const [rhythmProgress, setRhythmProgress] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const isPlayingRef = useRef(false); // Track playing state for RAF
  const prevProgressRef = useRef(1); // Start at 1 (end of loop) to ensure first beat (0) triggers
  const swingModeRef = useRef(swingMode); // REF TO FIX STALE CLOSURE IN LOOP

  // Update Ref when state changes
  useEffect(() => {
      swingModeRef.current = swingMode;
  }, [swingMode]);

  // --- Constants ---
  const BPM = 100; // Tempo
  const BEAT_DURATION = 60 / BPM;
  const BAR_DURATION = BEAT_DURATION * 4;

  // --- Rhythm Patterns (in beats) ---
  const ridePattern = [0, 1, 1.5, 2, 3, 3.5]; 
  const bassPattern = [0, 1, 2, 3]; 
  const hihatPattern = [1, 3]; // Beats 2 and 4

  // --- Audio Engine ---
  const playSound = (type: 'ride' | 'bass' | 'hat') => {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      if (type === 'ride') {
          // Cymbal: High bandpass noise-like square
          osc.type = 'square';
          osc.frequency.setValueAtTime(800, t);
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 8000;
          osc.connect(filter);
          filter.connect(gain);
          
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.1, t + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
          osc.start(t);
          osc.stop(t + 0.4);
      } else if (type === 'bass') {
          // Bass: Sine with punch
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(100, t);
          osc.frequency.exponentialRampToValueAtTime(60, t + 0.1);
          osc.connect(gain);
          
          gain.gain.setValueAtTime(0.5, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
          osc.start(t);
          osc.stop(t + 0.4);
      } else {
          // Hi-hat: Short high burst
          osc.type = 'sawtooth';
          osc.frequency.value = 2000;
          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = 5000;
          osc.connect(filter);
          filter.connect(gain);
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.05, t + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
          osc.start(t);
          osc.stop(t + 0.1);
      }

      gain.connect(ctx.destination);
  };

  const playChord = (chordIdx: number) => {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      setActiveChordIdx(chordIdx);
      
      const chords = [
          [293.7, 349.2, 440.0, 523.3], // Dm7
          [196.0, 246.9, 293.7, 349.2], // G7
          [261.6, 329.6, 392.0, 493.9]  // Cmaj7
      ];
      
      const now = ctx.currentTime;
      chords[chordIdx].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 1500;

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

          osc.start(now);
          osc.stop(now + 1.6);
      });
  };

  // --- Animation Loop ---
  const togglePlayback = () => {
      if (isPlayingRef.current) {
          // Stop
          isPlayingRef.current = false;
          setIsPlaying(false);
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          setRhythmProgress(0); // Reset visual position
      } else {
          // Start
          if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
          
          isPlayingRef.current = true;
          setIsPlaying(true);
          
          startTimeRef.current = performance.now();
          prevProgressRef.current = 1; // Pretend we just finished a loop to catch index 0
          rafRef.current = requestAnimationFrame(animate);
      }
  };

  const animate = (time: number) => {
      if (!isPlayingRef.current) return;

      const elapsed = (time - startTimeRef.current) / 1000;
      const progress = (elapsed % BAR_DURATION) / BAR_DURATION; // 0 to 1
      const prevProgress = prevProgressRef.current;

      setRhythmProgress(progress);

      // --- Trigger Logic ---
      const checkAndPlay = (pattern: number[], sound: 'ride'|'bass'|'hat') => {
          pattern.forEach(beat => {
              // Calculate adjusted trigger point (0-1) based on swing
              // FIX: Use ref to get fresh swingMode value in loop
              const isSwing = swingModeRef.current;
              
              let triggerPoint = beat / 4;
              const isOffbeat = beat % 1 !== 0;
              if (isOffbeat && isSwing) {
                  // Swing: delay offbeat from 0.5 to ~0.66
                  const whole = Math.floor(beat);
                  triggerPoint = (whole + 0.66) / 4;
              }

              // Check crossing: Did progress pass triggerPoint?
              const crossed = (progress < prevProgress) 
                  ? (triggerPoint >= prevProgress || triggerPoint < progress)
                  : (triggerPoint >= prevProgress && triggerPoint < progress);

              if (crossed) {
                  playSound(sound);
                  // Visual Flash
                  const elId = sound === 'ride' ? `ride-visual-${beat}` : null;
                  if (elId) {
                      const el = document.getElementById(elId);
                      if (el) {
                          // Flash animation reset
                          el.style.animation = 'none';
                          void el.offsetWidth;
                          el.style.animation = 'flash 0.2s ease-out';
                      }
                  }
              }
          });
      };

      checkAndPlay(ridePattern, 'ride');
      checkAndPlay(bassPattern, 'bass');
      checkAndPlay(hihatPattern, 'hat');

      prevProgressRef.current = progress;
      rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
      // Inject keyframes for flash
      const style = document.createElement('style');
      style.textContent = `
        @keyframes flash {
            0% { transform: translate(-50%, -50%) scale(1.5); filter: brightness(2); }
            100% { transform: translate(-50%, -50%) scale(1); filter: none; }
        }
      `;
      document.head.appendChild(style);
      
      return () => { 
          if(rafRef.current) cancelAnimationFrame(rafRef.current); 
          document.head.removeChild(style);
      };
  }, []);

  return (
    <div className="space-y-8">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-stone-900 text-stone-100 rounded-full text-xs font-bold tracking-wider uppercase mb-3 shadow-lg flex items-center gap-2 w-fit border border-stone-700">
            <Moon size={12} className="text-indigo-400" />
            Level 6 - Style Lab
        </div>
        <h2 className="text-3xl md:text-4xl font-bold serif text-stone-900 mb-4 tracking-tight">
            爵士基础 <span className="text-stone-400 font-light italic">|</span> Jazz Essentials
        </h2>
        <p className="text-lg text-stone-600 font-light max-w-3xl leading-relaxed">
          爵士乐的灵魂在于两点：**时间 (Time)** 的弹性与**和声 (Harmony)** 的连接。
        </p>
      </header>

      {/* Main Container - Compacted */}
      <div className="bg-[#0f0f10] rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden animate-slideUp stagger-1 border-4 border-stone-800 flex flex-col gap-10 max-w-4xl mx-auto">
          
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

          {/* --- RHYTHM SECTION --- */}
          <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                      <Disc className={`text-amber-500 ${isPlaying ? 'animate-spin-slow' : ''}`} />
                      Swing 律动 (The Groove)
                  </h3>
                  
                  <div className="flex bg-stone-800 p-1 rounded-xl border border-stone-700">
                      <button 
                        onClick={() => setSwingMode(false)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!swingMode ? 'bg-stone-600 text-white' : 'text-stone-400 hover:text-white'}`}
                      >
                          <span className="flex items-center gap-2"><AlignCenter size={12} className="rotate-90"/> 直拍</span>
                      </button>
                      <button 
                        onClick={() => setSwingMode(true)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${swingMode ? 'bg-indigo-600 text-white' : 'text-stone-400 hover:text-white'}`}
                      >
                          <span className="flex items-center gap-2"><Music size={12}/> 摇摆</span>
                      </button>
                  </div>
              </div>

              {/* Timeline Track - Compacted Height */}
              <div className="relative w-full h-32 bg-stone-900/50 rounded-2xl border border-stone-800 overflow-hidden flex items-center px-4">
                  {/* Grid Lines */}
                  {[0, 1, 2, 3].map(i => (
                      <div key={i} className="absolute top-0 bottom-0 w-px bg-white/10" style={{ left: `${(i/4)*100}%` }}>
                          <span className="absolute bottom-2 left-2 text-[10px] font-mono text-stone-600">Beat {i+1}</span>
                      </div>
                  ))}

                  {/* Playhead */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-30 shadow-[0_0_15px_#f59e0b]"
                    style={{ left: `${rhythmProgress * 100}%`, transition: isPlaying ? 'none' : 'left 0.2s' }}
                  ></div>

                  {/* Ride Notes */}
                  <div className="relative w-full h-full">
                      {ridePattern.map((beat) => {
                          const floor = Math.floor(beat);
                          const isOffbeat = beat % 1 !== 0;
                          
                          // Visual Position Logic (matches Trigger Logic)
                          let posPct = (beat / 4) * 100;
                          if (isOffbeat && swingMode) {
                              posPct = ((floor + 0.66) / 4) * 100;
                          }

                          return (
                              <div 
                                key={beat}
                                id={`ride-visual-${beat}`}
                                className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-300 ease-spring`}
                                style={{ left: `${posPct}%` }}
                              >
                                  <div className={`
                                      rounded-full border-2 shadow-lg transition-all
                                      ${isOffbeat 
                                          ? 'w-5 h-5 border-indigo-500 bg-indigo-500/20 text-indigo-300' 
                                          : 'w-8 h-8 border-amber-500 bg-amber-500/20 text-amber-300'
                                      }
                                      flex items-center justify-center font-bold text-[9px]
                                  `}>
                                      {isOffbeat ? (swingMode ? 'Let' : '&') : floor+1}
                                  </div>
                                  <div className="w-0.5 h-8 bg-stone-700 -z-10"></div>
                              </div>
                          )
                      })}
                  </div>
              </div>

              <div className="mt-6 flex justify-center">
                  <button 
                    onClick={togglePlayback}
                    className={`flex items-center gap-3 px-8 py-3 rounded-full font-bold transition-all active:scale-95 ${
                        isPlaying 
                        ? 'bg-stone-800 text-stone-400 border border-stone-700' 
                        : 'bg-white text-stone-900 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                    }`}
                  >
                      {isPlaying ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}
                      <span>{isPlaying ? '停止律动' : '播放律动'}</span>
                  </button>
              </div>
          </div>

          <div className="h-px w-full bg-stone-800"></div>

          {/* --- HARMONY SECTION --- */}
          <div className="relative z-10 w-full">
              <div className="flex justify-between items-end mb-8">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                      <Zap className={`text-emerald-500`} />
                      II-V-I 导音流向
                  </h3>
                  <div className="text-[10px] font-mono text-stone-500 uppercase">Guide Tones (3rd & 7th)</div>
              </div>

              <div className="flex flex-col md:flex-row justify-center items-stretch gap-4 md:gap-6 relative">
                  {/* Cards */}
                  {[
                      { idx: 0, label: 'ii', name: 'Dm7', notes: ['C (b7)', 'A (5)', 'F (b3)', 'D (1)'], color: 'indigo' },
                      { idx: 1, label: 'V', name: 'G7', notes: ['D (5)', 'B (3)', 'F (b7)', 'G (1)'], color: 'amber' },
                      { idx: 2, label: 'I', name: 'Cmaj7', notes: ['B (7)', 'G (5)', 'E (3)', 'C (1)'], color: 'emerald' }
                  ].map((item) => (
                      <div key={item.idx} className="flex-1 flex flex-col items-center group">
                          <button 
                            onClick={() => playChord(item.idx)}
                            className={`w-full p-4 rounded-2xl border-2 transition-all text-center mb-3 ${activeChordIdx === item.idx ? `bg-${item.color}-900/50 border-${item.color}-500 shadow-[0_0_30px_rgba(0,0,0,0.5)]` : 'bg-stone-900 border-stone-800 hover:border-stone-700'}`}
                          >
                              <div className="text-2xl font-bold text-white mb-1">{item.label}</div>
                              <div className={`text-${item.color}-400 font-mono text-sm`}>{item.name}</div>
                          </button>
                          
                          {/* Note Stack */}
                          <div className="flex flex-col gap-1.5 w-full max-w-[120px]">
                              {item.notes.map((n, i) => {
                                  // Highlight Guide Tones logic
                                  const isGuide = n.includes('3') || n.includes('7');
                                  return (
                                      <div key={i} className={`h-6 w-full rounded flex items-center justify-center text-[10px] border ${isGuide ? `bg-${item.color}-500/20 border-${item.color}-500/50 text-${item.color}-300 font-bold` : 'bg-stone-800 border-stone-800 text-stone-500'}`}>
                                          {n}
                                      </div>
                                  )
                              })}
                          </div>
                      </div>
                  ))}
                  
                  {/* Arrows overlay (simplified for layout) */}
                  <div className="absolute top-1/2 left-[30%] w-6 h-6 hidden md:block text-stone-600"><ArrowRight size={20}/></div>
                  <div className="absolute top-1/2 left-[66%] w-6 h-6 hidden md:block text-stone-600"><ArrowRight size={20}/></div>
              </div>
          </div>

      </div>

      {/* Explanations */}
      <div className="grid md:grid-cols-2 gap-6 animate-slideUp stagger-2">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <Coffee className="text-stone-800" size={18} />
                  Swing 的秘密
              </h3>
              <p className="text-stone-600 text-xs leading-relaxed">
                  在乐谱上，Swing 通常被记为普通的八分音符。但如果你照着谱子直弹，听起来就像机器人。
                  <br/><br/>
                  真正的 Swing 是基于<strong>三连音</strong>的感觉。第一拍占前 2/3，第二拍占后 1/3。这种“长-短”的律动让音乐产生了向前滚动的动力。
              </p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <CornerRightDown className="text-amber-500" size={18} />
                  Guide Tones (导音线)
              </h3>
              <p className="text-stone-600 text-xs leading-relaxed">
                  爵士乐手即兴时并不是在乱弹。他们在寻找“Guide Tones”——通常是和弦的<strong>3音</strong>和<strong>7音</strong>。
                  <br/><br/>
                  观察上方的方块：Dm7 的 7音 (C) 只需要下行半音，就变成了 G7 的 3音 (B)。这种平滑的连接是好听的关键。
              </p>
          </div>
      </div>
    </div>
  );
};

export default JazzBasicsLesson;
