
import React, { useState, useRef } from 'react';
import { Play, Sparkles, History, Feather } from 'lucide-react';

const OrnamentationLesson: React.FC = () => {
  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeNoteIndex, setActiveNoteIndex] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const ornaments = [
    {
      id: 'trill',
      name: '颤音 (Trill)',
      symbol: 'tr',
      notes: ['D', 'C', 'D', 'C', 'D', 'C', 'D', 'C'], // Oscillating
      durations: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.5],
      path: "M 15 30 Q 20 10 25 30 T 35 30 T 45 30 T 55 30 T 65 30", // Wavy line
      desc: "像鸟儿振翅般快速交替。在巴洛克时期，这是延长长音的主要手段。"
    },
    {
      id: 'turn',
      name: '回音 (Turn)',
      symbol: '∽',
      notes: ['D', 'C', 'B', 'C'], // Upper, Main, Lower, Main
      durations: [0.15, 0.15, 0.15, 0.8],
      path: "M 20 20 Q 35 0 45 20 Q 55 40 70 20", // S shape loop
      desc: "优雅的转身。围绕主音画出一个完美的 S 形曲线：上-主-下-主。"
    },
    {
      id: 'mordent',
      name: '波音 (Mordent)',
      symbol: 'M', // Simplified visual representation
      notes: ['C', 'B', 'C'], // Main, Lower, Main
      durations: [0.1, 0.1, 0.8],
      path: "M 25 30 L 32 15 L 40 30 L 48 15 L 55 30", // Zigzag
      desc: "短促的起伏。像宝石闪烁了一下，常用来给音符增加果断的重音。"
    }
  ];

  const playOrnament = (ornament: typeof ornaments[0]) => {
    if (activeType) return; // Prevent overlap
    setActiveType(ornament.id);
    setActiveNoteIndex(null);
    
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    let currentTime = ctx.currentTime;
    let visualTimeAccumulator = 0;
    
    // Base frequency for C4 is ~261.63
    // D4 ~ 293.66, B3 ~ 246.94
    const freqs: {[key: string]: number} = { 'C': 261.63, 'D': 293.66, 'B': 246.94 };

    ornament.notes.forEach((noteName, i) => {
        const dur = ornament.durations[i];
        
        // Audio
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.frequency.value = freqs[noteName];
        osc.type = 'triangle'; // Clear tone
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        gain.gain.setValueAtTime(0, currentTime);
        gain.gain.linearRampToValueAtTime(0.3, currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, currentTime + dur - 0.02);
        
        osc.start(currentTime);
        osc.stop(currentTime + dur);
        
        // Visual Sync
        setTimeout(() => {
            setActiveNoteIndex(i);
        }, visualTimeAccumulator * 1000);

        currentTime += dur;
        visualTimeAccumulator += dur;
    });

    // Reset active state after animation
    setTimeout(() => {
        setActiveType(null);
        setActiveNoteIndex(null);
    }, visualTimeAccumulator * 1000 + 300);
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 4</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            装饰音 <span className="text-stone-300 font-light">|</span> Ornamentation
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
           音乐的珠宝。如果说和弦是骨架，旋律是肌肉，那么装饰音就是精致的项链与戒指。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200/50 border border-stone-100 p-8 md:p-12 relative overflow-hidden animate-slideUp stagger-1 min-h-[400px] flex flex-col items-center">
         
         {/* Background Paper Texture */}
         <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#a8a29e 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

         {/* The Stage */}
         <div className="relative w-full max-w-2xl flex-1 flex items-center justify-center">
             
             {/* Staff Lines - Centered Vertically */}
             <div className="absolute w-full flex flex-col gap-4 opacity-20 pointer-events-none top-1/2 transform -translate-y-1/2">
                 {[1,2,3,4,5].map(i => <div key={i} className="w-full h-px bg-stone-800"></div>)}
             </div>

             {/* The Main Note Container */}
             <div className="relative z-10 flex items-center justify-center h-48 w-full">
                 
                 {/* The Static Note Head (Ghost) - Fades out when playing */}
                 <div className={`transition-all duration-500 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${activeType ? 'opacity-0 scale-50 blur-md pointer-events-none' : 'opacity-100 scale-100'}`}>
                    <div className="w-8 h-6 bg-stone-900 rounded-[50%] transform -rotate-12"></div>
                    <div className="w-1 h-20 bg-stone-900 absolute right-0 bottom-2"></div>
                 </div>

                 {/* Dynamic Realization Visualization */}
                 {activeType && (
                     <div className="absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none">
                         {/* This mimics the "blooming" of notes */}
                         <div className="flex items-center justify-center animate-expand-width relative h-full">
                             
                             {ornaments.find(o => o.id === activeType)?.notes.map((n, i) => {
                                 // Calculate relative height offset based on pitch C, D, B
                                 // C is center. D is up (-20px). B is down (+20px).
                                 const offset = n === 'D' ? -20 : (n === 'B' ? 20 : 0);
                                 const isCurrent = activeNoteIndex === i;
                                 
                                 return (
                                     <div 
                                        key={i} 
                                        className="flex flex-col items-center justify-center animate-fade-in-stagger transition-all duration-100 w-8" 
                                        style={{ 
                                            animationDelay: `${i * 0.05}s`,
                                            transform: `translateY(${offset}px) ${isCurrent ? 'scale(1.3)' : 'scale(1)'}`
                                        }}
                                     >
                                         <div 
                                            className={`w-4 h-3 rounded-[50%] transform -rotate-12 shadow-sm transition-colors duration-100 ${isCurrent ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-stone-800'}`}
                                         ></div>
                                         <div 
                                            className={`w-0.5 h-10 -mt-2 transition-colors duration-100 ${isCurrent ? 'bg-amber-600' : 'bg-stone-700'}`}
                                         ></div>
                                     </div>
                                 )
                             })}
                         </div>
                     </div>
                 )}

                 {/* The Symbol Overlay (Trill, Turn, etc.) */}
                 {/* Adjusted position to avoid clipping: Starts at top-6, moves up to -translate-y-6 */}
                 <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${activeType ? 'scale-150 -translate-y-6 opacity-20' : 'scale-100 opacity-100'}`}>
                     <div className="font-serif font-bold italic text-4xl text-stone-800">
                         {activeType ? ornaments.find(o => o.id === activeType)?.symbol : null}
                     </div>
                 </div>

             </div>
         </div>

         {/* Controls */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12 relative z-20">
             {ornaments.map((o) => (
                 <button
                    key={o.id}
                    onClick={() => playOrnament(o)}
                    disabled={activeType !== null}
                    className={`group relative p-6 rounded-2xl border text-left transition-all duration-300 overflow-hidden ${
                        activeType === o.id 
                        ? 'bg-stone-900 border-stone-900 text-white shadow-xl scale-105' 
                        : 'bg-white border-stone-200 text-stone-600 hover:border-amber-300 hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                 >
                    <div className="flex justify-between items-start mb-4">
                        <span className={`font-serif text-3xl font-bold italic ${activeType === o.id ? 'text-amber-400' : 'text-stone-800'}`}>
                            {o.symbol}
                        </span>
                        {activeType === o.id && <Sparkles size={20} className="text-amber-400 animate-spin-slow" />}
                    </div>
                    <h3 className={`font-bold text-lg mb-2 ${activeType === o.id ? 'text-white' : 'text-stone-800'}`}>{o.name}</h3>
                    <p className={`text-xs leading-relaxed ${activeType === o.id ? 'text-stone-400' : 'text-stone-500'}`}>{o.desc}</p>
                    
                    {/* Animated Stroke Background on Hover/Active */}
                    <svg className="absolute bottom-0 right-0 w-24 h-24 opacity-10 pointer-events-none transform translate-x-4 translate-y-4" viewBox="0 0 100 50">
                        <path d={o.path} stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                 </button>
             ))}
         </div>
      </div>

      {/* Theory & History Cards */}
      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
          
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <History className="text-stone-400" />
                  历史的必然 (History)
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  在巴洛克时期，主要键盘乐器是<strong>羽管键琴 (Harpsichord)</strong>。这种乐器拨弦发声，声音无法像现代钢琴那样延长。
              </p>
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 text-xs text-stone-500">
                  <strong className="text-stone-700 block mb-1">解决方案：</strong>
                  既然无法把一个音拉长，作曲家就发明了<strong>颤音 (Trill)</strong>。通过快速在两个音之间来回弹奏，制造出一种“声音在持续”的错觉。这不仅是装饰，更是为了维持声音的物理手段。
              </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Feather className="text-amber-500" />
                  情感的调味 (Expression)
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  装饰音就像烹饪中的香料。
                  <br/>
                  一个简单的旋律可能显得平淡无奇（像白开水），但加上<strong>波音 (Mordent)</strong> 就像挤入了一滴柠檬汁，瞬间增加了重音的脆度和光泽；加上<strong>回音 (Turn)</strong> 则像丝绸一样，让旋律的转折变得圆润柔滑。
              </p>
          </div>

      </div>

      <style>{`
        .animate-expand-width {
            animation: expandWidth 0.5s ease-out forwards;
        }
        @keyframes expandWidth {
            from { gap: 0px; opacity: 0; transform: scale(0.8); }
            to { gap: 4px; opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-stagger {
            opacity: 0;
            animation: fadeInStagger 0.3s ease-out forwards;
        }
        @keyframes fadeInStagger {
            to { opacity: 1; } 
        }
      `}</style>
    </div>
  );
};

export default OrnamentationLesson;
