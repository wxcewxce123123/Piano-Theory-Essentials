
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, BookOpen, Swords, Handshake, ArrowRight, Zap, RefreshCw, Flag } from 'lucide-react';

const FormSonataLesson: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSection, setActiveSection] = useState<'none' | 'expo_a' | 'expo_b' | 'dev' | 'recap_a' | 'recap_b'>('none');
  const [progress, setProgress] = useState(0);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Time markers (seconds)
  const T_EXPO_A = 0;
  const T_EXPO_B = 4;
  const T_DEV = 8;
  const T_RECAP_A = 14;
  const T_RECAP_B = 18;
  const TOTAL_DURATION = 22;

  const stopAudio = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setIsPlaying(false);
      setActiveSection('none');
      setProgress(0);
  };

  const playTone = (ctx: AudioContext, freq: number, start: number, dur: number, type: 'square' | 'triangle' | 'sine' | 'sawtooth' = 'triangle', vol: number = 0.2) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = type;
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(vol, start + 0.05);
      gain.gain.setValueAtTime(vol, start + dur - 0.05);
      gain.gain.linearRampToValueAtTime(0, start + dur);
      
      osc.start(start);
      osc.stop(start + dur + 0.1);
  };

  const startPlayback = () => {
      if (isPlaying) { stopAudio(); return; }

      setIsPlaying(true);
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      startTimeRef.current = performance.now();

      // --- 1. EXPOSITION ---
      // Theme A (Masculine, Tonic C Major): Powerful, rhythmic
      // C G E C
      playTone(ctx, 261.63, now + 0.0, 0.5, 'square', 0.15);
      playTone(ctx, 392.00, now + 0.5, 0.5, 'square', 0.15);
      playTone(ctx, 329.63, now + 1.0, 0.5, 'square', 0.15);
      playTone(ctx, 261.63, now + 1.5, 2.0, 'square', 0.15); // Long

      // Theme B (Feminine, Dominant G Major): Lyrical, smooth
      // D E F# G
      playTone(ctx, 293.66, now + 4.0, 0.8, 'triangle', 0.2);
      playTone(ctx, 329.63, now + 4.8, 0.8, 'triangle', 0.2);
      playTone(ctx, 370.00, now + 5.6, 0.8, 'triangle', 0.2); // F# (Dominant Color)
      playTone(ctx, 392.00, now + 6.4, 1.5, 'triangle', 0.2);

      // --- 2. DEVELOPMENT ---
      // Chaos, Modulation, Fragmentation
      // Minor keys, unstable intervals
      playTone(ctx, 329.63, now + 8.0, 0.3, 'sawtooth', 0.1); // E
      playTone(ctx, 311.13, now + 8.3, 0.3, 'sawtooth', 0.1); // Eb (Conflict)
      playTone(ctx, 293.66, now + 8.6, 0.3, 'sawtooth', 0.1); // D
      
      playTone(ctx, 440.00, now + 9.5, 0.3, 'square', 0.1); // A (Fragment of Theme A)
      playTone(ctx, 415.30, now + 9.8, 0.3, 'square', 0.1); // Ab
      
      playTone(ctx, 196.00, now + 11.0, 0.5, 'sawtooth', 0.2); // Low G tension
      playTone(ctx, 246.94, now + 11.5, 0.5, 'sawtooth', 0.2); // B tension
      playTone(ctx, 392.00, now + 12.0, 1.5, 'sawtooth', 0.2); // G (Dominant pedal preparation)

      // --- 3. RECAPITULATION ---
      // Theme A (Tonic C Major) - Same as before
      playTone(ctx, 261.63, now + 14.0, 0.5, 'square', 0.15);
      playTone(ctx, 392.00, now + 14.5, 0.5, 'square', 0.15);
      playTone(ctx, 329.63, now + 15.0, 0.5, 'square', 0.15);
      playTone(ctx, 261.63, now + 15.5, 2.0, 'square', 0.15);

      // Theme B (Tonic C Major) - RESOLVED! (Transposed down)
      // G A B C (instead of D E F# G)
      playTone(ctx, 196.00, now + 18.0, 0.8, 'triangle', 0.2); // G3
      playTone(ctx, 220.00, now + 18.8, 0.8, 'triangle', 0.2); // A3
      playTone(ctx, 246.94, now + 19.6, 0.8, 'triangle', 0.2); // B3
      playTone(ctx, 261.63, now + 20.4, 1.5, 'triangle', 0.2); // C4 (Home!)

      rafRef.current = requestAnimationFrame(animate);
  };

  const animate = (time: number) => {
      const elapsed = (time - startTimeRef.current) / 1000;
      
      if (elapsed >= TOTAL_DURATION) {
          stopAudio();
          return;
      }

      setProgress((elapsed / TOTAL_DURATION) * 100);

      // Set Active Section Logic
      if (elapsed < T_EXPO_B) setActiveSection('expo_a');
      else if (elapsed < T_DEV) setActiveSection('expo_b');
      else if (elapsed < T_RECAP_A) setActiveSection('dev');
      else if (elapsed < T_RECAP_B) setActiveSection('recap_a');
      else setActiveSection('recap_b');

      rafRef.current = requestAnimationFrame(animate);
  };

  // Helper for rendering the curve
  const getSectionStyle = (section: string) => {
      if (activeSection === section) return 'opacity-100 scale-105 brightness-110 shadow-lg';
      return 'opacity-50 scale-100 grayscale';
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-stone-900 text-stone-100 rounded-full text-xs font-bold tracking-wider uppercase mb-3 shadow-lg">Level 5</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            奏鸣曲式 <span className="text-stone-300 font-light">|</span> Sonata Form
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-3xl leading-relaxed">
          这是古典音乐最宏大的叙事结构，如同好莱坞电影的三幕剧：冲突的建立、冲突的激化、冲突的解决。
        </p>
      </header>

      {/* Main Narrative Stage */}
      <div className="bg-gradient-to-br from-stone-50 to-white rounded-[2.5rem] p-4 md:p-12 shadow-2xl border border-stone-200 relative overflow-hidden animate-slideUp stagger-1 min-h-[500px] flex flex-col max-w-4xl mx-auto">
          
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-stone-200">
              <div className="h-full bg-amber-500 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
          </div>

          {/* VISUALIZATION AREA */}
          <div className="flex-1 flex flex-col md:flex-row gap-4 items-stretch justify-center relative py-10">
              
              {/* 1. EXPOSITION (呈示部) */}
              <div className={`flex-1 rounded-3xl border-2 border-blue-100 bg-blue-50/50 p-6 flex flex-col items-center justify-between relative transition-all duration-500 ${activeSection.startsWith('expo') ? 'ring-4 ring-blue-100 bg-white' : ''}`}>
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <BookOpen size={14}/> Exposition
                  </div>
                  
                  {/* Theme A Visual */}
                  <div className={`w-full p-4 rounded-xl bg-blue-500 text-white mb-4 transition-all duration-300 ${activeSection === 'expo_a' ? 'scale-110 shadow-xl' : 'scale-100'}`}>
                      <div className="font-bold text-lg">Theme A</div>
                      <div className="text-xs opacity-80">主调 (Tonic)</div>
                      <div className="mt-2 h-2 bg-white/30 rounded-full w-2/3"></div>
                  </div>

                  {/* Bridge Arrow */}
                  <div className="text-stone-300 transform rotate-90 md:rotate-0 my-2"><ArrowRight /></div>

                  {/* Theme B Visual (Higher = Unstable/Dominant) */}
                  <div className={`w-full p-4 rounded-xl bg-indigo-500 text-white transition-all duration-300 transform ${activeSection === 'expo_b' ? 'scale-110 shadow-xl -translate-y-4' : 'scale-100 -translate-y-4'}`}>
                      <div className="font-bold text-lg">Theme B</div>
                      <div className="text-xs opacity-80">属调 (Dominant)</div>
                      <div className="mt-2 h-2 bg-white/30 rounded-full w-full"></div>
                  </div>
                  
                  {activeSection.startsWith('expo') && <div className="absolute inset-0 border-2 border-blue-400 rounded-3xl animate-pulse pointer-events-none"></div>}
              </div>

              {/* 2. DEVELOPMENT (展开部) */}
              <div className={`flex-1 rounded-3xl border-2 border-amber-100 bg-amber-50/50 p-6 flex flex-col items-center justify-center relative transition-all duration-500 overflow-hidden ${activeSection === 'dev' ? 'ring-4 ring-amber-100 bg-white' : ''}`}>
                  <div className="absolute top-6 text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                      <Swords size={14}/> Development
                  </div>

                  {/* Chaos Visuals */}
                  <div className="relative w-full h-40 flex items-center justify-center">
                      {/* Fragment A */}
                      <div className={`absolute w-12 h-12 bg-blue-400 rounded-lg transition-all duration-100 ${activeSection === 'dev' ? 'animate-shake opacity-100' : 'opacity-20'}`} style={{ left: '20%', top: '30%' }}></div>
                      {/* Fragment B */}
                      <div className={`absolute w-12 h-12 bg-indigo-400 rounded-full transition-all duration-100 ${activeSection === 'dev' ? 'animate-shake opacity-100' : 'opacity-20'}`} style={{ right: '20%', bottom: '30%', animationDelay: '0.1s' }}></div>
                      {/* Lightning */}
                      {activeSection === 'dev' && <Zap size={48} className="text-amber-500 absolute animate-ping" />}
                  </div>
                  
                  <p className={`text-center text-xs text-amber-700 font-bold transition-opacity ${activeSection === 'dev' ? 'opacity-100' : 'opacity-0'}`}>
                      Conflict! Modulation!
                  </p>
              </div>

              {/* 3. RECAPITULATION (再现部) */}
              <div className={`flex-1 rounded-3xl border-2 border-emerald-100 bg-emerald-50/50 p-6 flex flex-col items-center justify-between relative transition-all duration-500 ${activeSection.startsWith('recap') ? 'ring-4 ring-emerald-100 bg-white' : ''}`}>
                  <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Handshake size={14}/> Recapitulation
                  </div>

                  {/* Theme A Visual */}
                  <div className={`w-full p-4 rounded-xl bg-blue-500 text-white mb-4 transition-all duration-300 ${activeSection === 'recap_a' ? 'scale-110 shadow-xl' : 'scale-100'}`}>
                      <div className="font-bold text-lg">Theme A</div>
                      <div className="text-xs opacity-80">主调 (Tonic)</div>
                  </div>

                  {/* Unity Symbol */}
                  <div className="text-stone-300 transform rotate-90 md:rotate-0 my-2"><RefreshCw size={16} /></div>

                  {/* Theme B Visual (Now Grounded/Resolved) */}
                  <div className={`w-full p-4 rounded-xl bg-indigo-600 text-white transition-all duration-300 transform ${activeSection === 'recap_b' ? 'scale-110 shadow-xl translate-y-0 bg-emerald-500' : 'scale-100 translate-y-0'}`}>
                      <div className="font-bold text-lg">Theme B</div>
                      <div className="text-xs opacity-80 font-bold text-yellow-200">主调回归 (Resolved!)</div>
                      <div className="mt-2 h-2 bg-white/30 rounded-full w-full"></div>
                  </div>
                  
                  {activeSection.startsWith('recap') && <div className="absolute inset-0 border-2 border-emerald-400 rounded-3xl animate-pulse pointer-events-none"></div>}
              </div>

          </div>

          {/* Controls */}
          <div className="flex justify-center mt-8 relative z-20">
              <button 
                onClick={startPlayback}
                className={`flex items-center gap-3 px-12 py-5 rounded-full font-bold text-lg transition-all active:scale-95 shadow-xl ${
                    isPlaying 
                    ? 'bg-stone-800 text-stone-400 border border-stone-600' 
                    : 'bg-stone-900 text-white hover:scale-105'
                }`}
              >
                  {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
                  <span>{isPlaying ? '演绎中 (Playing)...' : '开始剧情 (Start Drama)'}</span>
              </button>
          </div>
      </div>

      {/* Narrative Explanation */}
      <div className="grid md:grid-cols-3 gap-6 animate-slideUp stagger-2">
          
          <div className={`p-6 rounded-2xl border transition-all duration-500 ${activeSection.startsWith('expo') ? 'bg-blue-50 border-blue-200 shadow-md' : 'bg-white border-stone-200'}`}>
              <h3 className="font-bold text-lg mb-2 text-stone-900">第一幕：矛盾的确立</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                  <strong>呈示部</strong>就像介绍电影的两位主角。
                  <br/>
                  <span className="text-blue-600 font-bold">主角A</span> 在家里（主调），性格刚毅。
                  <br/>
                  <span className="text-indigo-600 font-bold">主角B</span> 在外地（属调），性格柔美。
                  <br/>
                  两者的<strong>调性差异</strong>制造了最初的剧情张力。
              </p>
          </div>

          <div className={`p-6 rounded-2xl border transition-all duration-500 ${activeSection === 'dev' ? 'bg-amber-50 border-amber-200 shadow-md' : 'bg-white border-stone-200'}`}>
              <h3 className="font-bold text-lg mb-2 text-stone-900">第二幕：混乱的战场</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                  <strong>展开部</strong>是剧情的高潮。
                  <br/>
                  两个主题的片段在这里碰撞、撕裂、重组。调性频繁变化（转调），让听众感到不稳定和焦虑。这是英雄的试炼时刻。
              </p>
          </div>

          <div className={`p-6 rounded-2xl border transition-all duration-500 ${activeSection.startsWith('recap') ? 'bg-emerald-50 border-emerald-200 shadow-md' : 'bg-white border-stone-200'}`}>
              <h3 className="font-bold text-lg mb-2 text-stone-900">第三幕：大团圆</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                  <strong>再现部</strong>不仅是简单的重复。
                  <br/>
                  最大的变化发生了：<span className="text-emerald-600 font-bold">主角B</span> 放弃了它的属调身份，跟随着主角A回到了主调（Home Key）。
                  <br/>
                  冲突解决了，两人从此幸福地生活在同一个调性里。
              </p>
          </div>

      </div>

      <style>{`
        @keyframes shake {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            10% { transform: translate(-1px, -2px) rotate(-1deg); }
            20% { transform: translate(-3px, 0px) rotate(1deg); }
            30% { transform: translate(3px, 2px) rotate(0deg); }
            40% { transform: translate(1px, -1px) rotate(1deg); }
            50% { transform: translate(-1px, 2px) rotate(-1deg); }
            60% { transform: translate(-3px, 1px) rotate(0deg); }
            70% { transform: translate(3px, 1px) rotate(-1deg); }
            80% { transform: translate(-1px, -1px) rotate(1deg); }
            90% { transform: translate(1px, 2px) rotate(0deg); }
            100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .animate-shake {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) infinite;
        }
      `}</style>
    </div>
  );
};

export default FormSonataLesson;
