import React, { useState, useRef, useEffect } from 'react';
import { Hourglass, Play, Pause, RefreshCw } from 'lucide-react';

const RubatoLesson: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rubatoIntensity, setRubatoIntensity] = useState(0.5); // 0 to 1
  const audioCtxRef = useRef<AudioContext | null>(null);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Animation constants
  const duration = 4; // seconds for one phrase (e.g. 4 bars)
  const trackLength = 300; // visual width

  const setupAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playTick = (type: 'mechanical' | 'rubato') => {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Pitch distinction
      osc.frequency.value = type === 'mechanical' ? 880 : 660; 
      osc.type = 'triangle';
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(type === 'rubato' ? 0.3 : 0.1, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
  };

  const lastBeatRef = useRef({ mechanical: -1, rubato: -1 });

  const animate = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = (time - startTimeRef.current) / 1000;
      
      // Reset loop
      if (elapsed > duration) {
          startTimeRef.current = time;
          lastBeatRef.current = { mechanical: -1, rubato: -1 };
          return requestAnimationFrame(animate);
      }

      const progress = elapsed / duration;

      // 1. Mechanical: Linear progress
      const mechProgress = progress;

      // 2. Rubato: Ease-in-out curve (Slow start, fast middle, slow end)
      // Math: p + intensity * sin(p * 2PI) * something...
      // Let's use a Bezier-like curve or sine distortion
      // Rubato often means "stolen time": slow down then speed up to catch up.
      // Let's model: Slow -> Fast -> Slow (arriving at same time)
      const sineWave = -Math.sin(progress * Math.PI * 2); // 0 -> -1 -> 0 -> 1 -> 0
      // We want: progress + sine deviation
      const rubatoProgress = progress + (sineWave * 0.15 * rubatoIntensity);

      // Visual Updates
      const ballMech = document.getElementById('ball-mech');
      const ballRubato = document.getElementById('ball-rubato');
      
      if (ballMech) ballMech.style.left = `${mechProgress * 100}%`;
      if (ballRubato) ballRubato.style.left = `${Math.min(100, Math.max(0, rubatoProgress * 100))}%`;

      // Audio Triggers (Play 4 beats per cycle)
      const totalBeats = 4;
      const mechBeat = Math.floor(mechProgress * totalBeats);
      const rubatoBeat = Math.floor(rubatoProgress * totalBeats);

      if (mechBeat !== lastBeatRef.current.mechanical && mechBeat < totalBeats) {
          playTick('mechanical');
          lastBeatRef.current.mechanical = mechBeat;
          // Flash effect
          const el = document.getElementById(`beat-mech-${mechBeat}`);
          if(el) el.classList.add('animate-ping-once');
      }

      if (rubatoBeat !== lastBeatRef.current.rubato && rubatoBeat < totalBeats) {
          playTick('rubato');
          lastBeatRef.current.rubato = rubatoBeat;
           // Flash effect
           const el = document.getElementById(`beat-rubato-${rubatoBeat}`);
           if(el) el.classList.add('animate-ping-once');
      }

      requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      setupAudio();
      startTimeRef.current = performance.now();
      lastBeatRef.current = { mechanical: -1, rubato: -1 };
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, rubatoIntensity]);

  // CSS for flash
  useEffect(() => {
      const style = document.createElement('style');
      style.innerHTML = `
        .animate-ping-once { animation: ping 0.3s cubic-bezier(0, 0, 0.2, 1) forwards; }
        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
      `;
      document.head.appendChild(style);
      return () => { document.head.removeChild(style); }
  }, []);

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 2</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            弹性速度 <span className="text-stone-300 font-light">|</span> Rubato
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          直译为“被偷走的时间”。它允许演奏者在严格的节拍框架内，自由地加快或减慢速度，赋予音乐呼吸感。
        </p>
      </header>

      {/* Interactive Visualization */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-200 p-8 md:p-12 animate-slideUp stagger-1 relative overflow-hidden">
         {/* Background Grid */}
         <div className="absolute inset-0 bg-stone-50/50" style={{ backgroundImage: 'linear-gradient(to right, #e7e5e4 1px, transparent 1px)', backgroundSize: '25% 100%' }}></div>
         
         <div className="relative z-10 flex flex-col gap-16 py-8">
             
             {/* Track 1: Mechanical */}
             <div className="relative h-16 flex items-center">
                 <div className="absolute left-0 top-0 text-xs font-bold text-stone-400 uppercase tracking-widest -mt-6">机械模式 (Strict)</div>
                 {/* Track Line */}
                 <div className="w-full h-1 bg-stone-200 rounded-full relative">
                     {[0,1,2,3].map(i => (
                         <div key={i} id={`beat-mech-${i}`} className="absolute w-3 h-3 bg-stone-300 rounded-full -top-1" style={{ left: `${i*25}%` }}></div>
                     ))}
                     <div className="absolute right-0 w-3 h-3 bg-stone-300 rounded-full -top-1"></div>
                 </div>
                 {/* Ball */}
                 <div id="ball-mech" className="absolute w-8 h-8 bg-stone-800 rounded-full shadow-lg transform -translate-x-1/2 flex items-center justify-center text-stone-400 text-[10px]" style={{ left: '0%' }}>
                    M
                 </div>
             </div>

             {/* Track 2: Rubato */}
             <div className="relative h-16 flex items-center">
                 <div className="absolute left-0 top-0 text-xs font-bold text-amber-600 uppercase tracking-widest -mt-6">弹性模式 (Rubato)</div>
                 {/* Elastic Line Visual */}
                 <svg className="absolute w-full h-20 -top-8 pointer-events-none opacity-20">
                     {/* Simplified visual of elasticity - curved line? */}
                     <path d={`M0,40 Q50,${40 - rubatoIntensity*40} 100%,40`} fill="none" stroke="#f59e0b" strokeWidth="2" />
                 </svg>

                 {/* Track Line */}
                 <div className="w-full h-1 bg-amber-200/50 rounded-full relative">
                     {[0,1,2,3].map(i => (
                         <div key={i} id={`beat-rubato-${i}`} className="absolute w-3 h-3 bg-amber-300 rounded-full -top-1" style={{ left: `${i*25}%` }}></div>
                     ))}
                     <div className="absolute right-0 w-3 h-3 bg-amber-300 rounded-full -top-1"></div>
                 </div>
                 {/* Ball */}
                 <div id="ball-rubato" className="absolute w-10 h-10 bg-amber-500 rounded-full shadow-xl shadow-amber-500/30 transform -translate-x-1/2 flex items-center justify-center text-white font-serif italic" style={{ left: '0%' }}>
                    R
                 </div>
             </div>

             {/* Controls */}
             <div className="flex flex-col md:flex-row items-center justify-between gap-8 mt-4">
                 <div className="flex-1 w-full">
                     <label className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2 block">弹性强度 (Intensity)</label>
                     <input 
                       type="range" 
                       min="0" max="1" step="0.1" 
                       value={rubatoIntensity} 
                       onChange={(e) => setRubatoIntensity(parseFloat(e.target.value))}
                       className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                     />
                 </div>
                 
                 <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-8 py-4 bg-stone-900 text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-stone-800 transition-all active:scale-95 shadow-xl"
                 >
                     {isPlaying ? <Pause fill="currentColor"/> : <Play fill="currentColor"/>}
                     {isPlaying ? '暂停演示' : '开始对比'}
                 </button>
             </div>
         </div>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-white p-8 rounded-3xl border border-amber-100 shadow-sm animate-slideUp stagger-2">
          <h3 className="text-xl font-bold text-stone-900 mb-4">“我还回去”原则</h3>
          <p className="text-stone-600 leading-relaxed">
              Rubato 不是乱弹。如果你在乐句的前半部分“偷”了一些时间（慢下来），你通常需要在后半部分把时间“还回去”（快一点），
              以此保证整体的节奏框架不散架。就像上面的两个球，虽然过程不同，但它们总是<strong>同时到达终点</strong>。
          </p>
      </div>
    </div>
  );
};

export default RubatoLesson;