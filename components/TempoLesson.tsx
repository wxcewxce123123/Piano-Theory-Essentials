import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Zap, Gauge } from 'lucide-react';

const TempoLesson: React.FC = () => {
  const [bpm, setBpm] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatLight, setBeatLight] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const timerIDRef = useRef<number | null>(null);
  
  // Ref to store the latest BPM for the scheduler loop
  const bpmRef = useRef(bpm);
  
  const lookahead = 25.0; 
  const scheduleAheadTime = 0.1;

  const terms = [
    { name: 'Largo', range: [40, 60], desc: '广板 (Very Slow)', color: 'text-blue-900', bg: 'bg-blue-100', border: 'border-blue-200' },
    { name: 'Adagio', range: [66, 76], desc: '柔板 (Slow)', color: 'text-indigo-900', bg: 'bg-indigo-100', border: 'border-indigo-200' },
    { name: 'Andante', range: [76, 108], desc: '行板 (Walking Pace)', color: 'text-emerald-900', bg: 'bg-emerald-100', border: 'border-emerald-200' },
    { name: 'Moderato', range: [108, 120], desc: '中板 (Moderate)', color: 'text-amber-900', bg: 'bg-amber-100', border: 'border-amber-200' },
    { name: 'Allegro', range: [120, 168], desc: '快板 (Fast)', color: 'text-orange-900', bg: 'bg-orange-100', border: 'border-orange-200' },
    { name: 'Presto', range: [168, 208], desc: '急板 (Very Fast)', color: 'text-red-900', bg: 'bg-red-100', border: 'border-red-200' },
  ];

  // Sync ref with state whenever BPM changes
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  const getCurrentTerm = () => {
    return terms.find(t => bpm >= t.range[0] && bpm <= t.range[1]);
  };

  const scheduleNote = (time: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = 1200; // Sharp click sound
    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.6, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.start(time);
    osc.stop(time + 0.1);

    // Visual Flash Sync
    const drawTime = (time - ctx.currentTime) * 1000;
    setTimeout(() => {
        setBeatLight(true);
        setTimeout(() => setBeatLight(false), 100);
    }, Math.max(0, drawTime));
  };

  const scheduler = () => {
    if (!audioCtxRef.current) return;
    while (nextNoteTimeRef.current < audioCtxRef.current.currentTime + scheduleAheadTime) {
      scheduleNote(nextNoteTimeRef.current);
      // FIX: Use bpmRef.current instead of 'bpm' state directly to avoid stale closures
      const secondsPerBeat = 60.0 / bpmRef.current;
      nextNoteTimeRef.current += secondsPerBeat;
    }
    timerIDRef.current = window.setTimeout(scheduler, lookahead);
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (timerIDRef.current) clearTimeout(timerIDRef.current);
      setBeatLight(false);
    } else {
      setIsPlaying(true);
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
         audioCtxRef.current.resume();
      }
      nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.05;
      scheduler();
    }
  };

  useEffect(() => {
    return () => {
      if (timerIDRef.current) clearTimeout(timerIDRef.current);
    };
  }, []);

  const activeTerm = getCurrentTerm();

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Lesson 03</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            速度 <span className="text-stone-300 font-light">|</span> Tempo
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          BPM (Beats Per Minute) 决定了音乐的绝对物理速度，而术语决定了音乐的情感流速。
        </p>
      </header>

      {/* Metronome Interactive Card */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200/50 border border-stone-200 overflow-hidden flex flex-col md:flex-row animate-slideUp stagger-1 relative">
         {/* Decorative Background */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-amber-50 to-orange-50 rounded-full blur-3xl opacity-50 pointer-events-none -mr-32 -mt-32"></div>

         {/* Left: Controls */}
         <div className="p-8 md:p-12 md:w-5/12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-stone-100 bg-white/50 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2 mb-8 text-stone-400">
               <Gauge size={20} />
               <span className="text-xs font-bold uppercase tracking-widest">Metronome</span>
            </div>
            
            <div className="text-center mb-8">
               <div className="relative inline-block">
                   <div className="text-8xl font-bold text-stone-900 font-mono tracking-tighter tabular-nums leading-none">
                     {bpm}
                   </div>
                   {/* Beat Light Indicator */}
                   <div className={`absolute -top-2 -right-4 w-4 h-4 rounded-full transition-colors duration-100 ${beatLight ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'bg-stone-200'}`}></div>
               </div>
               <div className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-2">Beats Per Minute</div>
            </div>

            <div className="mb-10 px-2">
               <input 
                 type="range" 
                 min="40" 
                 max="208" 
                 value={bpm} 
                 onChange={(e) => setBpm(Number(e.target.value))}
                 className="w-full h-3 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
               />
               <div className="flex justify-between text-[10px] text-stone-400 mt-3 font-mono font-bold uppercase">
                  <span>Slow (40)</span>
                  <span>Fast (208)</span>
               </div>
            </div>

            <div className="flex justify-center">
               <button 
                 onClick={togglePlay}
                 className={`group relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                    isPlaying 
                    ? 'bg-white border-2 border-stone-100 text-amber-500 active:scale-95' 
                    : 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white hover:shadow-amber-200 hover:scale-105 active:scale-95'
                 }`}
               >
                  {isPlaying ? (
                      <Pause size={32} fill="currentColor" className="relative z-10" />
                  ) : (
                      <Play size={32} fill="currentColor" className="ml-1 relative z-10" />
                  )}
                  {isPlaying && <div className="absolute inset-0 rounded-full bg-amber-50 animate-ping opacity-20"></div>}
               </button>
            </div>
         </div>

         {/* Right: Pendulum Visual & Term */}
         <div className="p-8 md:p-12 md:w-7/12 bg-stone-50/50 flex flex-col items-center justify-between relative overflow-hidden">
             
             {/* Pendulum Container */}
             <div className="relative w-full h-48 flex justify-center items-start mt-4">
                 {/* Pivot Point */}
                 <div className="absolute top-0 w-4 h-4 bg-stone-300 rounded-full z-20 shadow-inner"></div>
                 
                 {/* The Pendulum Rod & Weight */}
                 <div 
                    className="origin-top flex flex-col items-center"
                    style={{ 
                        // CSS Animation logic for swing
                        animation: isPlaying ? `pendulumSwing ${60/bpm * 2}s infinite ease-in-out` : 'none',
                        transform: isPlaying ? 'none' : 'rotate(0deg)',
                        height: '180px',
                        transformOrigin: 'top center'
                    }}
                 >
                    <div className="w-1.5 h-full bg-stone-300 rounded-full shadow-sm"></div>
                    {/* Adjustable Weight (Visual only) */}
                    <div 
                        className="absolute w-8 h-10 bg-stone-800 rounded-md shadow-lg z-10 flex items-center justify-center"
                        style={{ top: `${Math.max(10, 100 - ((bpm-40)/(208-40))*90)}%` }} // Moves up as BPM increases
                    >
                        <div className="w-6 h-0.5 bg-stone-600/50"></div>
                    </div>
                    {/* Bob at bottom */}
                    <div className="w-6 h-6 bg-amber-500 rounded-full border-2 border-white shadow-md absolute bottom-0"></div>
                 </div>
             </div>

             {/* Active Term Display */}
             <div className="w-full text-center mt-8 z-10 h-24 flex items-center justify-center">
                {activeTerm ? (
                    <div className={`transform transition-all duration-500 ${isPlaying ? 'scale-110' : 'scale-100'}`}>
                        <div className={`inline-flex flex-col items-center px-8 py-4 rounded-3xl ${activeTerm.bg} border ${activeTerm.border} shadow-sm`}>
                            <h3 className={`text-3xl font-serif font-bold italic ${activeTerm.color} mb-1`}>{activeTerm.name}</h3>
                            <span className={`text-xs font-bold uppercase tracking-widest opacity-70 ${activeTerm.color}`}>{activeTerm.desc}</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-stone-400 font-medium bg-white px-6 py-3 rounded-2xl border border-stone-100 shadow-sm">
                        自定义速度 (Custom)
                    </div>
                )}
             </div>

             {/* Background Tick Marks for visual reference */}
             <svg className="absolute bottom-0 left-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 400 200">
                 <path d="M 50 180 Q 200 120 350 180" stroke="currentColor" fill="none" strokeWidth="2" strokeDasharray="5 5" />
             </svg>
         </div>
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-slideUp stagger-2">
         {terms.map((t) => {
             const isActive = activeTerm?.name === t.name;
             return (
                 <button 
                    key={t.name}
                    onClick={() => setBpm(Math.floor((t.range[0] + t.range[1])/2))}
                    className={`group relative p-5 rounded-2xl border text-left transition-all duration-300 overflow-hidden ${
                        isActive 
                        ? `${t.bg} ${t.border} shadow-md scale-[1.02]` 
                        : 'bg-white border-stone-200 hover:border-amber-200 hover:shadow-lg hover:-translate-y-1'
                    }`}
                 >
                    {isActive && <div className="absolute inset-0 bg-white/20 animate-pulse-soft"></div>}
                    <div className="relative z-10">
                        <div className={`font-serif font-bold text-xl mb-1 ${isActive ? t.color : 'text-stone-700'}`}>{t.name}</div>
                        <div className={`text-xs font-bold font-mono opacity-60 mb-3 ${isActive ? t.color : 'text-stone-400'}`}>
                            {t.range[0]}-{t.range[1]} BPM
                        </div>
                        <div className={`text-xs font-medium ${isActive ? t.color : 'text-stone-500'}`}>
                            {t.desc}
                        </div>
                    </div>
                    {isActive && (
                        <div className="absolute top-4 right-4">
                            <Zap size={16} className={`${t.color} opacity-50`} fill="currentColor" />
                        </div>
                    )}
                 </button>
             )
         })}
      </div>
      
      {/* Global CSS for Pendulum Keyframes */}
      <style>{`
        @keyframes pendulumSwing {
            0% { transform: rotate(-25deg); animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1); }
            50% { transform: rotate(25deg); animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1); }
            100% { transform: rotate(-25deg); }
        }
      `}</style>
    </div>
  );
};

export default TempoLesson;