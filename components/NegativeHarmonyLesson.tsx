
import React, { useState, useRef } from 'react';
import { FlipHorizontal, ArrowRightLeft, Music, RotateCw } from 'lucide-react';

// Chromatic scale
const notes = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
// Frequencies (C4 to B4)
const freqs = [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88];

// Axis between Eb (3) and E (4) for C Major (C=0, G=7 -> C+G=7. Axis = 3.5)
const getNegativeIndex = (i: number) => {
    let res = (7 - i);
    while (res < 0) res += 12;
    return res % 12;
}

const NegativeHarmonyLesson: React.FC = () => {
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const [reflectedNote, setReflectedNote] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const handleNoteClick = (index: number) => {
    setActiveNote(index);
    const reflected = getNegativeIndex(index);
    setReflectedNote(reflected);

    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    // Play Original
    const t = ctx.currentTime;
    playTone(ctx, freqs[index], t, 'sine', 0.5);

    // Play Reflected after short delay
    playTone(ctx, freqs[reflected], t + 0.4, 'triangle', 0.5);
  };

  const playTone = (ctx: AudioContext, freq: number, time: number, type: 'sine' | 'triangle', vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = type;
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(vol, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
      
      osc.start(time);
      osc.stop(time + 0.6);
  }

  const playCadence = () => {
      // Demo: G7 -> C vs Dm7b5 -> C
      // G7: G B D F (7, 11, 2, 5)
      // C: C E G (0, 4, 7)
      
      // Negative G7 -> Dm7b5 (D F Ab C) -> (2, 5, 8, 0)
      
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const t = ctx.currentTime;

      // Original G7 -> C
      const g7 = [392.00, 493.88, 587.33, 698.46];
      const cMaj = [523.25, 659.25, 783.99];

      g7.forEach(f => playTone(ctx, f, t, 'sine', 0.15));
      cMaj.forEach(f => playTone(ctx, f, t + 1, 'sine', 0.15));

      // Negative Dm7b5 -> C
      // D F Ab C
      const neg = [293.66, 349.23, 415.30, 523.25];
      neg.forEach(f => playTone(ctx, f, t + 2.5, 'triangle', 0.15));
      cMaj.forEach(f => playTone(ctx, f, t + 3.5, 'sine', 0.15));
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-stone-900 text-stone-100 rounded-full text-xs font-bold tracking-wider uppercase mb-3 shadow-lg">Level 5 - Master Class</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            负面和声 <span className="text-stone-300 font-light">|</span> Negative Harmony
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          音乐的“镜像宇宙”。这是 Ernst Levy 提出的概念，通过一条中心轴，将光明的世界（大调）翻转为阴暗的世界（负面）。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-[#0f172a] rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden animate-slideUp stagger-1 flex flex-col md:flex-row items-center gap-12 border border-slate-800">
          
          {/* Background Stars */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]"></div>

          {/* The Circle */}
          <div className="relative w-[360px] h-[360px] flex-shrink-0">
             {/* The Axis Line (Eb - E) for C Major (index 3 and 4) */}
             {/* Standard axis is usually midpoint of C-G (3.5). So angle between 3 and 4. */}
             <div className="absolute top-0 left-1/2 h-full w-0.5 bg-gradient-to-b from-indigo-500 to-amber-500 transform -translate-x-1/2 rotate-[15deg] shadow-[0_0_10px_#6366f1]"></div>
             <div className="absolute top-2 right-10 text-xs text-amber-500 font-bold rotate-[15deg]">Positive</div>
             <div className="absolute bottom-2 left-10 text-xs text-indigo-500 font-bold rotate-[15deg]">Negative</div>

             {notes.map((note, i) => {
                 const angle = (i * 30) - 90; // Start at 12 o'clock (C)
                 const radius = 140;
                 const x = 180 + radius * Math.cos(angle * Math.PI / 180);
                 const y = 180 + radius * Math.sin(angle * Math.PI / 180);
                 
                 const isActive = activeNote === i;
                 const isReflected = reflectedNote === i;
                 
                 return (
                     <button
                        key={note}
                        onClick={() => handleNoteClick(i)}
                        className={`absolute w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 ${
                            isActive 
                            ? 'bg-amber-500 text-white scale-125 shadow-[0_0_20px_#f59e0b] z-20' 
                            : isReflected 
                                ? 'bg-indigo-500 text-white scale-110 shadow-[0_0_20px_#6366f1] z-20'
                                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white z-10'
                        }`}
                        style={{ left: x, top: y }}
                     >
                         {note}
                     </button>
                 )
             })}
             
             {/* Center Label */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                 <FlipHorizontal className="text-slate-600 mb-1 mx-auto" size={24} />
                 <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Mirror Axis</div>
             </div>
          </div>

          {/* Controls */}
          <div className="flex-1 w-full max-w-sm flex flex-col gap-6">
              <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 backdrop-blur-sm">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <ArrowRightLeft className="text-indigo-400" />
                      映射原理 (Mapping)
                  </h3>
                  <div className="space-y-3 text-sm text-slate-400 mb-6">
                      <div className="flex justify-between items-center p-2 rounded bg-slate-900/50">
                          <span className="text-amber-400 font-bold">{activeNote !== null ? notes[activeNote] : '-'}</span>
                          <span className="text-xs">reflects to</span>
                          <span className="text-indigo-400 font-bold">{reflectedNote !== null ? notes[reflectedNote] : '-'}</span>
                      </div>
                      <p className="leading-relaxed text-xs">
                          我们在 C 大调中使用 C-G 轴（由 C 和 G 的中点决定，即 E-Eb 之间）。这能够将主和弦 (C Major) 完美地映射为 C 小三和弦 (C Minor)。
                      </p>
                  </div>

                  <button 
                    onClick={playCadence}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                      <Music size={18} />
                      <span>对比：G7 vs Negative G7</span>
                  </button>
              </div>
          </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <RotateCw className="text-amber-500" />
                  引力的反转
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                  在正面的世界里，<strong>G7</strong>（属七）有一种强烈的动力想要解决到 <strong>C</strong>。
                  <br/>
                  在负面的世界里，这种引力被保留了，但方向变了。<strong>G7 的负面是 Dm7b5</strong>，它也能完美地解决到 C，但听起来更像是一种“变格终止”（Plagal Cadence）的变体，有一种深沉、宽广的回归感。
              </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4">Jacob Collier 的秘密武器</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                  负面和声能让你的编曲听起来既熟悉又陌生。它保留了原曲的和声功能（紧张->解决），但换了一套全新的色彩。就像把一张照片的底片拿出来看一样。
              </p>
          </div>
      </div>
    </div>
  );
};

export default NegativeHarmonyLesson;
