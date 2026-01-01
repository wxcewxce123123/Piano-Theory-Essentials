
import React, { useState, useRef } from 'react';
import { StopCircle, ArrowRight, Home, HelpCircle, Pause, MoveRight, CornerDownRight } from 'lucide-react';

const CadencesLesson: React.FC = () => {
  const [activeCadence, setActiveCadence] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playChord = (notes: number[], duration: number, delay: number, vol: number = 0.2) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    notes.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = 'triangle'; // Smoother tone
        
        // Low pass for warmth
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1500;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
        
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration + 0.2);
    });
  };

  const playCadence = (type: string) => {
      if (activeCadence) return; // Prevent spamming
      setActiveCadence(type);
      
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

      // Better Voicings (Root positions + Inversions for smooth voice leading)
      // C Major Key
      const C_Maj = [261.63, 329.63, 392.00, 523.25]; // C4 E4 G4 C5
      const G_Dom = [196.00, 246.94, 293.66, 392.00]; // G3 B3 D4 G4 (Dominant)
      const F_Maj = [174.61, 261.63, 349.23, 440.00]; // F3 C4 F4 A4 (Subdominant)
      const A_Min = [220.00, 261.63, 329.63, 440.00]; // A3 C4 E4 A4 (Submediant)

      if (type === 'perfect') {
          playChord(G_Dom, 1.0, 0); // V
          playChord(C_Maj, 2.5, 1.0); // I
      } else if (type === 'plagal') {
          playChord(F_Maj, 1.0, 0); // IV
          playChord(C_Maj, 2.5, 1.0); // I
      } else if (type === 'half') {
          playChord(C_Maj, 1.0, 0); // I
          playChord(G_Dom, 2.0, 1.0); // V (Unresolved)
      } else if (type === 'deceptive') {
          playChord(G_Dom, 1.0, 0); // V
          playChord(A_Min, 2.0, 1.0); // vi (Surprise)
      }

      setTimeout(() => setActiveCadence(null), 3000);
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 4</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            终止式 <span className="text-stone-300 font-light">|</span> Cadences
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          音乐的标点符号。它们决定了一个乐句是完全结束了（句号），还是未完待续（逗号），或是给了你一个意外的惊喜（感叹号）。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-stone-50 rounded-[2.5rem] shadow-xl border border-stone-200 overflow-hidden animate-slideUp stagger-1 flex flex-col lg:flex-row min-h-[600px]">
          
          {/* Left: The Harmonic Map */}
          <div className="lg:w-1/2 p-8 md:p-12 relative flex items-center justify-center bg-white border-b lg:border-b-0 lg:border-r border-stone-200">
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#a8a29e 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
              
              {/* Map Container */}
              <div className="relative w-full max-w-sm aspect-square">
                  
                  {/* Connection Lines (SVG) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                      <defs>
                          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#d6d3d1" />
                          </marker>
                          <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
                          </marker>
                      </defs>

                      {/* V -> I (Perfect) */}
                      <path d="M 50% 20% L 50% 42%" stroke="#e7e5e4" strokeWidth="2" markerEnd="url(#arrowhead)" />
                      {activeCadence === 'perfect' && (
                          <path d="M 50% 20% L 50% 42%" stroke="#f59e0b" strokeWidth="4" className="animate-draw-path" markerEnd="url(#arrowhead-active)" />
                      )}

                      {/* IV -> I (Plagal) */}
                      <path d="M 20% 50% L 42% 50%" stroke="#e7e5e4" strokeWidth="2" markerEnd="url(#arrowhead)" />
                      {activeCadence === 'plagal' && (
                          <path d="M 20% 50% L 42% 50%" stroke="#10b981" strokeWidth="4" className="animate-draw-path" markerEnd="url(#arrowhead-active)" />
                      )}

                      {/* I -> V (Half) */}
                      <path d="M 55% 45% L 55% 25%" stroke="#e7e5e4" strokeWidth="2" strokeDasharray="4 4" />
                      {activeCadence === 'half' && (
                          <path d="M 50% 50% L 50% 25%" stroke="#6366f1" strokeWidth="4" className="animate-draw-path" markerEnd="url(#arrowhead-active)" />
                      )}

                      {/* V -> vi (Deceptive) */}
                      <path d="M 55% 20% Q 80% 20% 80% 42%" stroke="#e7e5e4" strokeWidth="2" strokeDasharray="4 4" />
                      {activeCadence === 'deceptive' && (
                          <path d="M 50% 20% Q 80% 20% 80% 45%" stroke="#f43f5e" strokeWidth="4" fill="none" className="animate-draw-path" markerEnd="url(#arrowhead-active)" />
                      )}
                  </svg>

                  {/* Nodes */}
                  {/* V (Dominant) */}
                  <div className={`absolute top-[10%] left-1/2 -translate-x-1/2 w-20 h-20 rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-4 transition-all z-10 ${activeCadence === 'perfect' || activeCadence === 'deceptive' || (activeCadence === 'half' && setTimeout(()=>true, 1000)) ? 'scale-110 bg-white border-amber-500 text-amber-600' : 'bg-stone-50 border-stone-200 text-stone-400'}`}>
                      V
                      <div className="absolute -top-6 text-[10px] uppercase font-bold tracking-widest text-stone-400">Tension</div>
                  </div>

                  {/* I (Tonic) */}
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full flex items-center justify-center font-bold text-3xl shadow-xl border-4 transition-all z-20 ${activeCadence === 'perfect' || activeCadence === 'plagal' ? 'scale-110 bg-amber-500 border-amber-300 text-white' : 'bg-white border-stone-200 text-stone-300'}`}>
                      I
                      <div className="absolute -bottom-8 text-[10px] uppercase font-bold tracking-widest text-stone-400">Home</div>
                  </div>

                  {/* IV (Subdominant) */}
                  <div className={`absolute top-1/2 left-[10%] -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg shadow-md border-4 transition-all z-10 ${activeCadence === 'plagal' ? 'scale-110 bg-white border-emerald-500 text-emerald-600' : 'bg-stone-50 border-stone-200 text-stone-400'}`}>
                      IV
                  </div>

                  {/* vi (Submediant) */}
                  <div className={`absolute top-1/2 right-[10%] -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg shadow-md border-4 transition-all z-10 ${activeCadence === 'deceptive' ? 'scale-110 bg-white border-rose-500 text-rose-600' : 'bg-stone-50 border-stone-200 text-stone-400'}`}>
                      vi
                  </div>

              </div>
          </div>

          {/* Right: Controls */}
          <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center gap-4 bg-stone-50">
              
              {/* Perfect */}
              <button 
                 onClick={() => playCadence('perfect')}
                 className={`group p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${
                     activeCadence === 'perfect' 
                     ? 'bg-amber-500 border-amber-500 text-white shadow-lg scale-[1.02]' 
                     : 'bg-white border-stone-200 hover:border-amber-400 hover:shadow-md'
                 }`}
              >
                 <div className="flex justify-between items-center relative z-10">
                     <div>
                         <h3 className="font-bold text-lg flex items-center gap-2">
                             正格终止 (Perfect)
                             <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">V → I</span>
                         </h3>
                         <p className={`text-xs mt-1 ${activeCadence === 'perfect' ? 'text-amber-100' : 'text-stone-500'}`}>
                             最强烈的结束。就像句号。回家了。
                         </p>
                     </div>
                     <StopCircle size={24} className={activeCadence === 'perfect' ? 'text-white' : 'text-stone-300'} />
                 </div>
              </button>

              {/* Plagal */}
              <button 
                 onClick={() => playCadence('plagal')}
                 className={`group p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${
                     activeCadence === 'plagal' 
                     ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg scale-[1.02]' 
                     : 'bg-white border-stone-200 hover:border-emerald-400 hover:shadow-md'
                 }`}
              >
                 <div className="flex justify-between items-center relative z-10">
                     <div>
                         <h3 className="font-bold text-lg flex items-center gap-2">
                             变格终止 (Plagal)
                             <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">IV → I</span>
                         </h3>
                         <p className={`text-xs mt-1 ${activeCadence === 'plagal' ? 'text-emerald-100' : 'text-stone-500'}`}>
                             温柔的结束。就像“阿门”。没有强烈的碰撞。
                         </p>
                     </div>
                     <Home size={24} className={activeCadence === 'plagal' ? 'text-white' : 'text-stone-300'} />
                 </div>
              </button>

              {/* Half */}
              <button 
                 onClick={() => playCadence('half')}
                 className={`group p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${
                     activeCadence === 'half' 
                     ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg scale-[1.02]' 
                     : 'bg-white border-stone-200 hover:border-indigo-400 hover:shadow-md'
                 }`}
              >
                 <div className="flex justify-between items-center relative z-10">
                     <div>
                         <h3 className="font-bold text-lg flex items-center gap-2">
                             半终止 (Half)
                             <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">? → V</span>
                         </h3>
                         <p className={`text-xs mt-1 ${activeCadence === 'half' ? 'text-indigo-100' : 'text-stone-500'}`}>
                             停在半空。就像逗号，话还没说完。需要继续。
                         </p>
                     </div>
                     <Pause size={24} className={activeCadence === 'half' ? 'text-white' : 'text-stone-300'} />
                 </div>
              </button>

              {/* Deceptive */}
              <button 
                 onClick={() => playCadence('deceptive')}
                 className={`group p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${
                     activeCadence === 'deceptive' 
                     ? 'bg-rose-500 border-rose-500 text-white shadow-lg scale-[1.02]' 
                     : 'bg-white border-stone-200 hover:border-rose-400 hover:shadow-md'
                 }`}
              >
                 <div className="flex justify-between items-center relative z-10">
                     <div>
                         <h3 className="font-bold text-lg flex items-center gap-2">
                             阻碍终止 (Deceptive)
                             <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">V → vi</span>
                         </h3>
                         <p className={`text-xs mt-1 ${activeCadence === 'deceptive' ? 'text-rose-100' : 'text-stone-500'}`}>
                             意外的转折！你以为要回家(I)，结果去了邻居家(vi)。
                         </p>
                     </div>
                     <HelpCircle size={24} className={activeCadence === 'deceptive' ? 'text-white' : 'text-stone-300'} />
                 </div>
              </button>

          </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
              <h3 className="text-xl font-bold text-stone-900 mb-4">为什么叫“正格”？</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                  在古典音乐中，V-I 被认为是最完美、最权威的结束方式。其中 <strong>V (属和弦)</strong> 包含导音（7音），它有强烈的倾向要解决到主音（1音）。这种半音解决的引力是音乐前进的主要动力。
              </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
              <h3 className="text-xl font-bold text-stone-900 mb-4">语法的艺术</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                  如果音乐是一篇文章，和弦进行就是句子。
                  <ul className="list-disc pl-4 mt-2 space-y-1">
                      <li><strong>正格终止</strong> = 句号 (.)</li>
                      <li><strong>半终止</strong> = 逗号 (,)</li>
                      <li><strong>阻碍终止</strong> = 问号或感叹号 (?!?)</li>
                  </ul>
              </p>
          </div>
      </div>

      <style>{`
        .animate-draw-path {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
            animation: drawPath 1s ease-out forwards;
        }
        @keyframes drawPath {
            to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

export default CadencesLesson;
