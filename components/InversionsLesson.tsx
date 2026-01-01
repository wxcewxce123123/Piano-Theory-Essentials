
import React, { useState, useRef } from 'react';
import { Layers, ArrowUpCircle, RefreshCw, Shuffle, MoveUp } from 'lucide-react';

const InversionsLesson: React.FC = () => {
  const [inversion, setInversion] = useState<0 | 1 | 2>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Note Definitions
  // We track "C", "E", "G" blocks.
  // Their vertical position depends on the inversion state.
  // 0 (Root): C(0), E(1), G(2)
  // 1 (1st):  E(0), G(1), C(2)
  // 2 (2nd):  G(0), C(1), E(2)
  
  const getPosition = (note: 'C' | 'E' | 'G') => {
      if (inversion === 0) {
          if (note === 'C') return 0;
          if (note === 'E') return 1;
          if (note === 'G') return 2;
      }
      if (inversion === 1) {
          if (note === 'E') return 0;
          if (note === 'G') return 1;
          if (note === 'C') return 2;
      }
      if (inversion === 2) {
          if (note === 'G') return 0;
          if (note === 'C') return 1;
          if (note === 'E') return 2;
      }
      return 0;
  };

  const getOctaveLabel = (note: 'C' | 'E' | 'G') => {
      // Logic to determine if note is "high" octave based on inversion
      if (inversion === 0) return ''; // All base
      if (inversion === 1) return note === 'C' ? '(High)' : '';
      if (inversion === 2) return note === 'G' ? '' : '(High)';
      return '';
  };

  const playChord = (inv: 0 | 1 | 2) => {
    setInversion(inv);
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    
    // C Major Notes
    let freqs = [261.63, 329.63, 392.00]; // Root: C4 E4 G4
    if (inv === 1) freqs = [329.63, 392.00, 523.25]; // 1st: E4 G4 C5
    if (inv === 2) freqs = [392.00, 523.25, 659.25]; // 2nd: G4 C5 E5

    // Play as chord
    freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = 'triangle';
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        
        osc.start(now);
        osc.stop(now + 1.3);
    });
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 4</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            和弦转位 <span className="text-stone-300 font-light">|</span> Inversions
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          就像搭积木，我们可以把底下的积木搬到最上面。成分没变，但结构变了。
        </p>
      </header>

      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-stone-200 animate-slideUp stagger-1 relative overflow-hidden flex flex-col md:flex-row gap-16 min-h-[500px]">
          
          {/* Background Grid */}
          <div className="absolute inset-0 bg-stone-50 opacity-50 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#a8a29e 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          {/* LEFT: The Chord Tower Visualization */}
          <div className="flex-1 flex flex-col items-center justify-center relative z-10">
             
             {/* The Container Area */}
             <div className="relative w-48 h-64 border-b-4 border-stone-300 flex justify-center mb-8">
                 
                 {/* Block C (Amber) */}
                 <div 
                    className="absolute w-32 h-16 rounded-xl flex items-center justify-center font-bold text-white shadow-lg transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] border-2 border-amber-600 bg-amber-500 z-10"
                    style={{ bottom: `${getPosition('C') * 70}px` }} // 70px step
                 >
                     <span className="flex flex-col items-center leading-none">
                         <span className="text-2xl">C</span>
                         <span className="text-[10px] opacity-70 uppercase tracking-widest">Root</span>
                     </span>
                     {/* Jump Indicator */}
                     {inversion === 1 && <div className="absolute -right-8 text-amber-500 animate-bounce"><MoveUp/></div>}
                 </div>

                 {/* Block E (Indigo) */}
                 <div 
                    className="absolute w-32 h-16 rounded-xl flex items-center justify-center font-bold text-white shadow-lg transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] border-2 border-indigo-600 bg-indigo-500 z-20"
                    style={{ bottom: `${getPosition('E') * 70}px` }}
                 >
                     <span className="flex flex-col items-center leading-none">
                         <span className="text-2xl">E</span>
                         <span className="text-[10px] opacity-70 uppercase tracking-widest">3rd</span>
                     </span>
                     {/* Jump Indicator */}
                     {inversion === 2 && <div className="absolute -right-8 text-indigo-500 animate-bounce"><MoveUp/></div>}
                 </div>

                 {/* Block G (Emerald) */}
                 <div 
                    className="absolute w-32 h-16 rounded-xl flex items-center justify-center font-bold text-white shadow-lg transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] border-2 border-emerald-600 bg-emerald-500 z-30"
                    style={{ bottom: `${getPosition('G') * 70}px` }}
                 >
                     <span className="flex flex-col items-center leading-none">
                         <span className="text-2xl">G</span>
                         <span className="text-[10px] opacity-70 uppercase tracking-widest">5th</span>
                     </span>
                 </div>

             </div>

             {/* Mini Keyboard Display */}
             <div className="w-full max-w-sm h-28 bg-stone-900 p-2 rounded-xl shadow-inner relative select-none">
                 <div className="relative w-full h-full bg-white rounded-lg overflow-hidden flex">
                     {/* White Keys: 10 keys (C to E) */}
                     {/* Indices: 0(C), 2(D), 4(E), 5(F), 7(G), 9(A), 11(B), 12(C), 14(D), 16(E) */}
                     {[0, 2, 4, 5, 7, 9, 11, 12, 14, 16].map((noteIndex, i) => {
                         const activeIndices = 
                              inversion === 0 ? [0, 4, 7] : 
                              inversion === 1 ? [4, 7, 12] : 
                              [7, 12, 16];
                         const isActive = activeIndices.includes(noteIndex);
                         
                         let colorClass = 'bg-stone-100'; 
                         if (isActive) {
                             const semitone = noteIndex % 12;
                             if (semitone === 0) colorClass = 'bg-amber-400 shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]'; // C
                             else if (semitone === 4) colorClass = 'bg-indigo-400 shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]'; // E
                             else if (semitone === 7) colorClass = 'bg-emerald-400 shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]'; // G
                         } else {
                             colorClass = 'bg-white hover:bg-stone-50';
                         }

                         return (
                             <div key={i} className={`flex-1 border-r border-stone-200 last:border-0 flex items-end justify-center pb-2 transition-colors duration-200 ${colorClass}`}>
                                 {isActive && <span className="text-[10px] font-bold text-stone-900 mb-1">{
                                     ['C','D','E','F','G','A','B','C','D','E'][i]
                                 }</span>}
                             </div>
                         )
                     })}
                 </div>
                 
                 {/* Black Keys */}
                 {/* Placed relative to 10 white keys (10% each) */}
                 {[
                     { idx: 1, left: '10%' },  // C#
                     { idx: 3, left: '20%' },  // Eb
                     { idx: 6, left: '40%' },  // F#
                     { idx: 8, left: '50%' },  // G#
                     { idx: 10, left: '60%' }, // Bb
                     { idx: 13, left: '80%' }, // High C#
                     { idx: 15, left: '90%' }  // High Eb
                 ].map(k => (
                     <div 
                        key={k.idx}
                        className="absolute top-2 w-[6%] h-[60%] bg-stone-900 rounded-b-md border-x border-b border-stone-800 z-10 shadow-md"
                        style={{ left: k.left, transform: 'translateX(-50%)' }}
                     ></div>
                 ))}
             </div>

          </div>

          {/* RIGHT: Controls & Buttons */}
          <div className="flex-1 flex flex-col justify-center gap-6 relative z-10">
              <button 
                onClick={() => playChord(0)}
                className={`p-6 rounded-2xl border-2 text-left transition-all group hover:scale-[1.02] ${
                    inversion === 0 
                    ? 'border-amber-500 bg-amber-50 shadow-lg ring-2 ring-amber-200' 
                    : 'border-stone-200 bg-white hover:border-amber-300'
                }`}
              >
                 <div className="flex justify-between items-center mb-2">
                     <span className="text-xl font-bold text-stone-900">原位 (Root Position)</span>
                     <span className="text-amber-500 font-mono text-sm bg-amber-100 px-2 py-1 rounded">C - E - G</span>
                 </div>
                 <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
                     <div className={`h-full bg-amber-500 transition-all duration-500 ${inversion === 0 ? 'w-full' : 'w-0'}`}></div>
                 </div>
                 <p className="text-xs text-stone-500 mt-3">
                     最稳定的形态。根音 C 在最底部，像大树的根基。
                 </p>
              </button>

              <button 
                onClick={() => playChord(1)}
                className={`p-6 rounded-2xl border-2 text-left transition-all group hover:scale-[1.02] ${
                    inversion === 1 
                    ? 'border-indigo-500 bg-indigo-50 shadow-lg ring-2 ring-indigo-200' 
                    : 'border-stone-200 bg-white hover:border-indigo-300'
                }`}
              >
                 <div className="flex justify-between items-center mb-2">
                     <span className="text-xl font-bold text-stone-900">第一转位 (1st Inv)</span>
                     <span className="text-indigo-500 font-mono text-sm bg-indigo-100 px-2 py-1 rounded">E - G - C</span>
                 </div>
                 <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
                     <div className={`h-full bg-indigo-500 transition-all duration-500 ${inversion === 1 ? 'w-full' : 'w-0'}`}></div>
                 </div>
                 <p className="text-xs text-stone-500 mt-3">
                     C 搬到了楼顶。现在最底下是三音 E。听起来稍微不稳定，更轻盈。
                 </p>
              </button>

              <button 
                onClick={() => playChord(2)}
                className={`p-6 rounded-2xl border-2 text-left transition-all group hover:scale-[1.02] ${
                    inversion === 2 
                    ? 'border-emerald-500 bg-emerald-50 shadow-lg ring-2 ring-emerald-200' 
                    : 'border-stone-200 bg-white hover:border-emerald-300'
                }`}
              >
                 <div className="flex justify-between items-center mb-2">
                     <span className="text-xl font-bold text-stone-900">第二转位 (2nd Inv)</span>
                     <span className="text-emerald-500 font-mono text-sm bg-emerald-100 px-2 py-1 rounded">G - C - E</span>
                 </div>
                 <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
                     <div className={`h-full bg-emerald-500 transition-all duration-500 ${inversion === 2 ? 'w-full' : 'w-0'}`}></div>
                 </div>
                 <p className="text-xs text-stone-500 mt-3">
                     E 也搬到了楼顶。现在最底下是五音 G。这种形态非常不稳定，通常需要解决。
                 </p>
              </button>
          </div>
      </div>

      {/* Deep Dive Text */}
      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
         <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
            <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
               <Shuffle className="text-amber-500" />
               字谜游戏 (Anagrams)
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed mb-4">
               转位就像英语里的字谜。用同样的字母，可以拼出不同的单词：
            </p>
            <div className="flex gap-4 justify-center bg-stone-50 p-4 rounded-xl mb-4 border border-stone-100">
                <div className="text-center"><div className="font-bold text-lg text-amber-600">EAT</div><div className="text-[10px] text-stone-400">吃</div></div>
                <div className="text-stone-300">↔</div>
                <div className="text-center"><div className="font-bold text-lg text-indigo-600">TEA</div><div className="text-[10px] text-stone-400">茶</div></div>
                <div className="text-stone-300">↔</div>
                <div className="text-center"><div className="font-bold text-lg text-emerald-600">ATE</div><div className="text-[10px] text-stone-400">吃过</div></div>
            </div>
            <p className="text-stone-600 text-sm leading-relaxed">
               虽然它们的意思不同（就像不同转位的听感不同），但它们的<strong>核心成分</strong>是完全一样的。
            </p>
         </div>

         <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
            <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
               <RefreshCw className="text-indigo-500" />
               为什么要学转位？
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed mb-4">
               主要是为了<strong>顺滑连接</strong>（Voice Leading）。
            </p>
            <div className="space-y-2 text-sm text-stone-600 bg-stone-50 p-4 rounded-xl border border-stone-100">
                <p>想象你要从 <strong>C和弦</strong> 换到 <strong>F和弦</strong>：</p>
                <ul className="list-disc pl-4 space-y-1">
                    <li><strong>笨办法：</strong>整个手抬起来，移动很远去按 F-A-C。</li>
                    <li><strong>聪明办法（转位）：</strong> C-E-G 保持 C 不动，E和G只需稍微动一下手指变成 F和A。这就构成了 C-F-A（F和弦的第二转位）。</li>
                </ul>
            </div>
         </div>
      </div>
    </div>
  );
};

export default InversionsLesson;
