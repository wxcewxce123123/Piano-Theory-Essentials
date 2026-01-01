
import React, { useState, useRef, useEffect } from 'react';
import { Wind, Music, Layers, Zap, ArrowDown, Mic } from 'lucide-react';

const PedalingLesson: React.FC = () => {
  const [isPedalDown, setIsPedalDown] = useState(false);
  // Track visual active notes for bubbles
  const [visualNotes, setVisualNotes] = useState<{id: number, note: string, x: number}[]>([]);
  // Track currently vibrating strings (indices 0-6 corresponding to C-B)
  const [vibratingStrings, setVibratingStrings] = useState<number[]>([]);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noteIdCounter = useRef(0);
  
  // Audio nodes storage to handle sustain release
  const activeOscillators = useRef<Map<number, { osc: OscillatorNode, gain: GainNode, noteIndex: number }>>(new Map());

  const notesList = [
     {n:'C', f:261.6}, {n:'D', f:293.6}, {n:'E', f:329.6}, {n:'F', f:349.2}, {n:'G', f:392.0}, {n:'A', f:440.0}, {n:'B', f:493.8}
  ];

  const initAudio = () => {
     if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
     }
     if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
     }
  };

  const playNote = (noteIndex: number, freq: number, xPerc: number) => {
      initAudio();
      const ctx = audioCtxRef.current!;
      const now = ctx.currentTime;
      const id = noteIdCounter.current++;
      const noteName = notesList[noteIndex].n;

      // 1. Visuals
      setVisualNotes(prev => [...prev, { id, note: noteName, x: xPerc }]);
      setVibratingStrings(prev => [...prev, noteIndex]);

      // Auto remove bubble visual after delay if pedal is UP
      if (!isPedalDown) {
          setTimeout(() => {
              setVisualNotes(prev => prev.filter(n => n.id !== id));
              setVibratingStrings(prev => prev.filter(n => n !== noteIndex));
          }, 500); 
      }

      // 2. Audio
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = 'triangle';
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
      
      if (!isPedalDown) {
          // Staccato / Normal release
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.6);
      } else {
          // Sustain! Keep playing until pedal release
          osc.start(now);
          activeOscillators.current.set(id, { osc, gain, noteIndex });
      }
  };

  const togglePedal = () => {
      const newState = !isPedalDown;
      setIsPedalDown(newState);
      initAudio();
      
      if (newState) {
          // Pedal Pressed - Play a "Whoosh" damper lift sound
          playDamperSound(true);
      } else {
          // Pedal Released - Stop all sustaining notes
          playDamperSound(false);
          const ctx = audioCtxRef.current!;
          const now = ctx.currentTime;
          
          activeOscillators.current.forEach(({ osc, gain }) => {
              gain.gain.cancelScheduledValues(now);
              gain.gain.setValueAtTime(gain.gain.value, now);
              gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3); // Quick fade out
              osc.stop(now + 0.4);
          });
          activeOscillators.current.clear();
          
          setVisualNotes([]); // Clear bubbles
          setVibratingStrings([]); // Stop strings
      }
  };

  const playDamperSound = (lift: boolean) => {
      const ctx = audioCtxRef.current!;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      // Low thud/whoosh
      osc.frequency.value = lift ? 100 : 80; 
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 2 - Expression</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            踏板 <span className="text-stone-300 font-light">|</span> Pedaling
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          安东·鲁宾斯坦曾说：“踏板是钢琴的灵魂。”<br/>它通过抬起止音器，让所有琴弦自由共振，将独立的音符融合成一幅完整的水彩画。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-200 p-8 md:p-12 relative overflow-hidden animate-slideUp stagger-1 min-h-[600px] flex flex-col gap-8">
         
         {/* -- Internal Mechanism Visual (Strings & Dampers) -- */}
         <div className="relative w-full h-48 bg-stone-100/50 rounded-2xl border border-stone-200 flex flex-col justify-end px-4 md:px-12 overflow-hidden">
             <div className="absolute top-4 left-4 text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                 <Zap size={14}/> Internal Mechanism (内部结构)
             </div>
             
             <div className="flex justify-between items-end h-32 relative z-10 pb-4">
                 {notesList.map((_, i) => (
                     <div key={i} className="relative w-10 h-full flex flex-col justify-end items-center group">
                         {/* String */}
                         <div className={`w-0.5 bg-stone-300 rounded-full transition-all duration-100 ${vibratingStrings.includes(i) ? 'animate-vibrate bg-amber-400 h-full shadow-[0_0_10px_#f59e0b]' : 'h-full'}`}></div>
                         
                         {/* Damper Block */}
                         <div 
                            className={`absolute bottom-[40%] w-8 h-4 bg-stone-800 rounded shadow-md transition-all duration-300 ease-out z-20 ${isPedalDown ? '-translate-y-12 opacity-80' : 'translate-y-0'}`}
                         >
                             <div className="w-full h-1 bg-red-800/50 mt-3 rounded-b-sm"></div> {/* Felt */}
                         </div>
                     </div>
                 ))}
             </div>
             
             {/* Background decoration */}
             <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(90deg, transparent 49%, #000 50%, transparent 51%)', backgroundSize: '20px 100%' }}></div>
         </div>

         {/* -- Visual Canvas Area (Sound Shape) -- */}
         <div className="relative flex-1 w-full bg-gradient-to-b from-stone-50 to-white rounded-2xl border border-stone-100 overflow-hidden min-h-[200px]">
             {/* Pedal Indicator Background */}
             <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${isPedalDown ? 'opacity-100' : 'opacity-0'}`}>
                 <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-indigo-50/50 to-transparent"></div>
             </div>

             {/* Bubbles */}
             {visualNotes.map((n) => (
                 <div 
                    key={n.id}
                    className="absolute bottom-10 transform -translate-x-1/2 transition-all duration-1000"
                    style={{ left: `${n.x}%` }}
                 >
                    {/* The Ink Bleed Effect when pedal is down */}
                    {isPedalDown && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-40 h-40 -mb-16 bg-indigo-500/10 rounded-full blur-[40px] animate-pulse-slow"></div>
                    )}
                    
                    {/* The Note Bubble */}
                    <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-lg animate-float-up ${isPedalDown ? 'bg-indigo-500' : 'bg-stone-800'}`}>
                        {n.note}
                    </div>
                 </div>
             ))}

             {visualNotes.length === 0 && (
                 <div className="absolute inset-0 flex items-center justify-center text-stone-300 font-bold text-lg select-none">
                     试弹几个音符...
                 </div>
             )}
         </div>

         {/* -- Controls Area -- */}
         <div className="relative z-10 flex flex-col items-center">
             
             {/* Piano Keys Strip */}
             <div className="flex justify-between w-full px-4 md:px-12 mb-12 gap-2">
                 {notesList.map((note, i) => (
                     <button
                        key={i}
                        onClick={() => playNote(i, note.f, 15 + i * 11.5)} // Approximate X% pos
                        className="flex-1 h-24 bg-white border border-stone-300 rounded-b-xl shadow-sm hover:bg-stone-50 active:bg-amber-100 active:border-amber-400 transition-all flex items-end justify-center pb-4 group"
                     >
                         <span className="text-sm font-bold text-stone-400 group-hover:text-stone-600">{note.n}</span>
                     </button>
                 ))}
             </div>

             {/* The Pedal */}
             <div className="w-full flex justify-center items-end h-24 relative">
                 {/* Pedal Arm */}
                 <div className="absolute top-0 w-6 h-full bg-stone-200 left-1/2 -translate-x-1/2 -z-10 rounded-t-lg"></div>
                 
                 {/* Pedal Foot */}
                 <button 
                    onClick={togglePedal}
                    className={`w-40 h-20 rounded-t-[40%] rounded-b-xl border-b-8 shadow-2xl transition-all duration-200 transform origin-bottom active:scale-y-95 flex flex-col items-center justify-center gap-1 z-20 ${
                        isPedalDown 
                        ? 'bg-[#b45309] border-[#78350f] translate-y-3 shadow-inner' // Pressed
                        : 'bg-[#f59e0b] border-[#b45309] hover:bg-[#fbbf24] -translate-y-2' // Released
                    }`}
                 >
                    <Wind className={`text-white/50 ${isPedalDown ? 'opacity-90 scale-110' : 'opacity-50'}`} size={28} />
                    <span className="text-xs font-black text-white/80 uppercase tracking-widest mt-1">Sustain Pedal</span>
                 </button>

                 <div className="absolute top-8 right-0 md:right-20 flex flex-col items-end gap-2 text-right">
                     <div className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isPedalDown ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'bg-stone-100 text-stone-400'}`}>
                         {isPedalDown ? <span className="flex items-center gap-1"><ArrowDown size={14}/> Dampers Raised</span> : 'Dampers Down'}
                     </div>
                 </div>
             </div>

         </div>
      </div>

      {/* Detailed Theory Explanations */}
      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
          
          {/* Physics Card */}
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Zap className="text-stone-400" fill="currentColor" />
                  物理原理：止音器 (Dampers)
              </h3>
              <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
                  <p>
                      在钢琴内部，每个琴弦上都压着一块毛毡，叫做<strong>止音器</strong>。当你按下琴键时，止音器抬起，琴弦振动发声；当你松手时，止音器落下，声音立刻停止。
                  </p>
                  <p>
                      当你踩下<strong>延音踏板 (Sustain Pedal)</strong> 时，一根金属杆会将<strong>所有</strong>止音器同时抬起。这时，即使你松开琴键，琴弦依然会持续振动，直到能量耗尽或你松开踏板。
                  </p>
              </div>
          </div>

          {/* Art Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-3xl border border-indigo-100 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                  <Layers className="text-indigo-500" />
                  艺术效果：共振与混合
              </h3>
              <div className="space-y-4 text-indigo-900/80 text-sm leading-relaxed">
                  <p>
                      踏板不仅仅是“延长声音”。当所有止音器抬起时，你弹奏的一个音符会引发其他琴弦的<strong>共振 (Sympathetic Resonance)</strong>。这会让声音变得更加丰满、宏大，自带混响效果。
                  </p>
                  <p>
                      想象你在画水彩画。如果你在颜料未干时画上一笔新的颜色，它们会<strong>融合</strong>在一起。踏板就是让音符互相渗透、混合的“水”。
                  </p>
              </div>
          </div>

      </div>

      <style>{`
        @keyframes vibrate {
            0% { transform: translateX(0); }
            25% { transform: translateX(1px); }
            50% { transform: translateX(-1px); }
            75% { transform: translateX(1px); }
            100% { transform: translateX(0); }
        }
        .animate-vibrate {
            animation: vibrate 0.05s linear infinite;
        }
        @keyframes pulse-slow {
            0%, 100% { opacity: 0.1; transform: translate(-50%, 0) scale(1); }
            50% { opacity: 0.2; transform: translate(-50%, 0) scale(1.2); }
        }
        .animate-pulse-slow {
            animation: pulse-slow 3s infinite ease-in-out;
        }
        @keyframes float-up {
            0% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(-120px) scale(0.8); opacity: 0; }
        }
        .animate-float-up {
            animation: float-up 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PedalingLesson;
