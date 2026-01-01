
import React, { useState, useRef } from 'react';
import { Layers, Zap, Waves, Info } from 'lucide-react';

// Fundamental C2 = 65.41 Hz
const fundamental = 65.41;
const partialsData = Array.from({length: 8}, (_, i) => ({
    number: i + 1,
    freq: fundamental * (i + 1),
    name: ['C2', 'C3', 'G3', 'C4', 'E4', 'G4', 'Bb4', 'C5'][i], // Approx
    cents: [0, 0, 2, 0, -14, 2, -31, 0][i], // Detuning from equal temperament
    color: ['#3b82f6', '#3b82f6', '#f59e0b', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'][i]
}));

const OvertoneSeriesLesson: React.FC = () => {
  const [activePartials, setActivePartials] = useState<number[]>([1]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<Map<number, OscillatorNode>>(new Map());
  const gainNodesRef = useRef<Map<number, GainNode>>(new Map());

  const togglePartial = (pNumber: number) => {
      const isActive = activePartials.includes(pNumber);
      const newActive = isActive 
        ? activePartials.filter(n => n !== pNumber)
        : [...activePartials, pNumber];
      
      setActivePartials(newActive);
      updateAudio(newActive);
  };

  const updateAudio = (active: number[]) => {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      // Stop removed
      oscillatorsRef.current.forEach((osc, num) => {
          if (!active.includes(num)) {
              const gain = gainNodesRef.current.get(num);
              if (gain) {
                  gain.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
                  setTimeout(() => {
                      osc.stop();
                      oscillatorsRef.current.delete(num);
                      gainNodesRef.current.delete(num);
                  }, 200);
              }
          }
      });

      // Start new
      active.forEach(num => {
          if (!oscillatorsRef.current.has(num)) {
              const pData = partialsData.find(d => d.number === num);
              if (!pData) return;

              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              
              osc.frequency.value = pData.freq;
              osc.type = 'sine';
              
              osc.connect(gain);
              gain.connect(ctx.destination);
              
              // Volume decreases as partials go higher (natural physics)
              const volume = 0.5 / num; 
              gain.gain.setValueAtTime(0, ctx.currentTime);
              gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1);
              
              osc.start();
              oscillatorsRef.current.set(num, osc);
              gainNodesRef.current.set(num, gain);
          }
      });
  };

  const stopAll = () => {
      setActivePartials([]);
      updateAudio([]);
  };

  // Generate String Wave Path
  const generateStringPath = (harmonic: number) => {
      const width = 600;
      const height = 100;
      const points = [];
      for (let x = 0; x <= width; x+=5) {
          // Standing wave equation: sin(n * pi * x / L)
          const y = 50 + 40 * Math.sin((harmonic * Math.PI * x) / width);
          points.push(`${x},${y}`);
      }
      return points.join(' ');
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-stone-900 text-stone-100 rounded-full text-xs font-bold tracking-wider uppercase mb-3 shadow-lg">Level 5 - Master Class</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            泛音列 <span className="text-stone-300 font-light">|</span> Overtone Series
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          每一个音符其实都是一个和弦。当我们弹下一个琴键，无数个“分音”同时在振动，这种物理现象构成了音色（Timbre）和和声的基础。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-stone-200 animate-slideUp stagger-1 flex flex-col gap-10 min-h-[500px]">
          
          {/* String Visualization Area */}
          <div className="w-full h-64 bg-stone-50 rounded-3xl border border-stone-100 relative overflow-hidden flex items-center justify-center shadow-inner">
               <div className="absolute top-4 left-4 flex items-center gap-2 text-stone-400">
                   <Waves size={16} />
                   <span className="text-xs font-bold uppercase tracking-widest">String Vibration Modes</span>
               </div>

               {/* Render Active Strings */}
               <svg width="100%" height="100%" viewBox="0 0 600 200" className="absolute inset-0 w-full h-full overflow-visible">
                   {/* Base String Line */}
                   <line x1="0" y1="100" x2="600" y2="100" stroke="#e7e5e4" strokeWidth="2" strokeDasharray="4 4" />

                   {activePartials.map(num => (
                       <g key={num} className="animate-vibrate-string">
                           <polyline 
                             points={generateStringPath(num)} 
                             fill="none" 
                             stroke={partialsData[num-1].color} 
                             strokeWidth="3" 
                             strokeOpacity="0.6"
                             className="drop-shadow-md"
                           />
                           {/* Nodes */}
                           {Array.from({length: num-1}).map((_, i) => (
                               <circle 
                                 key={i} 
                                 cx={(600/num) * (i+1)} 
                                 cy="100" 
                                 r="4" 
                                 fill="white" 
                                 stroke={partialsData[num-1].color} 
                                 strokeWidth="2" 
                               />
                           ))}
                       </g>
                   ))}
               </svg>

               {activePartials.length === 0 && (
                   <div className="text-stone-300 font-bold text-lg">点击下方按钮激活泛音</div>
               )}
          </div>

          {/* Controls - Partials Grid */}
          <div>
              <div className="flex justify-between items-end mb-4">
                  <h3 className="font-bold text-stone-900 flex items-center gap-2">
                      <Layers size={18} className="text-amber-500"/>
                      Additive Synthesis (加法合成)
                  </h3>
                  <button onClick={stopAll} className="text-xs font-bold text-red-500 hover:text-red-600 underline">Reset Silence</button>
              </div>
              
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                  {partialsData.map((p) => {
                      const isActive = activePartials.includes(p.number);
                      return (
                          <button
                             key={p.number}
                             onClick={() => togglePartial(p.number)}
                             className={`relative h-28 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-end pb-4 group ${
                                 isActive 
                                 ? 'bg-stone-900 border-stone-900 text-white shadow-lg translate-y-[-4px]' 
                                 : 'bg-white border-stone-200 text-stone-500 hover:border-amber-300 hover:shadow-md'
                             }`}
                          >
                              {/* Frequency Bar Visual */}
                              <div className="absolute top-0 w-full px-3 pt-3 flex flex-col items-center gap-1">
                                  <div className="text-[10px] font-mono opacity-50">{p.number}x</div>
                                  <div className={`w-1.5 rounded-full transition-all duration-500 ${isActive ? 'bg-amber-400' : 'bg-stone-200'}`} style={{ height: `${40 - p.number * 4}px` }}></div>
                              </div>

                              <div className="text-lg font-bold font-serif leading-none">{p.name}</div>
                              <div className={`text-[9px] font-mono mt-1 ${isActive ? 'text-amber-400' : 'text-stone-300'}`}>{p.cents > 0 ? `+${p.cents}` : p.cents}c</div>
                          </button>
                      )
                  })}
              </div>
          </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Info className="text-blue-500" />
                  大三和弦的物理必然性
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                  看前5个泛音：C, C, G, C, E。
                  <br/>
                  这构成了 <strong>C - E - G</strong>（大三和弦）。
                  <br/>
                  这意味着，大三和弦不是人类发明的，而是深深植根于物理宇宙中的。当我们听到一个低音C时，我们的大脑其实已经隐约听到了E和G。
              </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Zap className="text-amber-500" />
                  自然律 vs 平均律
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                  注意看第7泛音 (Bb) 偏差了 -31 音分。
                  <br/>
                  钢琴使用的“十二平均律”为了方便转调，牺牲了音程的纯净度。真正的自然泛音列中的音，往往比钢琴上的音更“怪异”但也更“协和”。
              </p>
          </div>
      </div>

      <style>{`
        @keyframes vibrate {
            0% { transform: scaleY(1); }
            50% { transform: scaleY(-1); }
            100% { transform: scaleY(1); }
        }
        .animate-vibrate-string {
            animation: vibrate 0.1s linear infinite;
            transform-origin: center;
        }
      `}</style>
    </div>
  );
};

export default OvertoneSeriesLesson;
