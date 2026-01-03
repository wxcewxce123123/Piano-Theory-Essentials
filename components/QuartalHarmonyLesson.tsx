
import React, { useState, useRef } from 'react';
import { AlignVerticalSpaceAround, AlignJustify, Play, Music4 } from 'lucide-react';

const QuartalHarmonyLesson: React.FC = () => {
  const [mode, setMode] = useState<'tertian' | 'quartal'>('tertian');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Tertian (3rds): C E G B D (Cmaj9)
  const tertianNotes = [
      { note: 'D5', freq: 587.33, color: 'bg-amber-200' },
      { note: 'B4', freq: 493.88, color: 'bg-amber-300' },
      { note: 'G4', freq: 392.00, color: 'bg-amber-400' },
      { note: 'E4', freq: 329.63, color: 'bg-amber-500' },
      { note: 'C4', freq: 261.63, color: 'bg-amber-600' },
  ];

  // Quartal (4ths): C F Bb Eb Ab (Pure Quartal) or Diatonic: E A D G C ("So What")
  // Let's use "So What" style (D Dorian context): D G C F A (wait, So What is Dm11)
  // Let's use a pure quartal stack on C for contrast: C F Bb Eb G (hybrid top) 
  // Standard Quartal: C F Bb Eb Ab
  const quartalNotes = [
      { note: 'Ab4', freq: 415.30, color: 'bg-sky-200' },
      { note: 'Eb4', freq: 311.13, color: 'bg-sky-300' },
      { note: 'Bb3', freq: 233.08, color: 'bg-sky-400' },
      { note: 'F3',  freq: 174.61, color: 'bg-sky-500' },
      { note: 'C3',  freq: 130.81, color: 'bg-sky-600' },
  ];

  const playChord = (type: 'tertian' | 'quartal') => {
      setMode(type);
      setIsPlaying(true);
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const notes = type === 'tertian' ? tertianNotes : quartalNotes;

      notes.forEach((n, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = n.freq;
          osc.type = 'triangle';
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          // Arpeggiate slightly
          const start = ctx.currentTime + i * 0.05;
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.2, start + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 2.0);
          
          osc.start(start);
          osc.stop(start + 2.1);
      });

      setTimeout(() => setIsPlaying(false), 2000);
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-stone-900 text-stone-100 rounded-full text-xs font-bold tracking-wider uppercase mb-3 shadow-lg">Level 5 - Master Class</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            四度和声 <span className="text-stone-300 font-light">|</span> Quartal Harmony
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          数百年来，西方音乐建立在“三度叠置”的基础上。但在20世纪，McCoy Tyner 等爵士大师开始堆叠“四度”，创造出一种开放、悬浮、充满现代感的音响。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-stone-200 animate-slideUp stagger-1 flex flex-col items-center gap-12 min-h-[500px] max-w-4xl mx-auto">
          
          <div className="flex flex-col md:flex-row gap-16 w-full max-w-4xl justify-center items-end h-[350px]">
              
              {/* Tertian Stack (Snowman) */}
              <div className="flex flex-col items-center gap-6">
                   <div className="relative flex flex-col-reverse items-center gap-1 group">
                       {tertianNotes.map((n, i) => (
                           <div 
                             key={i} 
                             className={`w-32 h-12 rounded-xl flex items-center justify-center font-bold text-amber-900 shadow-sm border border-white/20 transition-all duration-300 ${n.color} ${mode === 'tertian' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-40 scale-95 translate-y-4'}`}
                             style={{ transitionDelay: `${i * 50}ms` }}
                           >
                               {n.note}
                           </div>
                       ))}
                       <div className={`absolute -right-12 h-full w-px bg-stone-300 flex flex-col justify-around py-2 transition-opacity ${mode === 'tertian' ? 'opacity-100' : 'opacity-0'}`}>
                           <span className="absolute left-2 text-[10px] font-mono text-stone-400 whitespace-nowrap">3rd</span>
                           <span className="absolute left-2 top-1/4 text-[10px] font-mono text-stone-400 whitespace-nowrap">3rd</span>
                           <span className="absolute left-2 top-2/3 text-[10px] font-mono text-stone-400 whitespace-nowrap">3rd</span>
                       </div>
                   </div>
                   
                   <button 
                     onClick={() => playChord('tertian')}
                     className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all w-40 ${mode === 'tertian' ? 'border-amber-500 bg-amber-50' : 'border-stone-200 bg-white hover:bg-stone-50'}`}
                   >
                       <AlignJustify className="text-amber-600" />
                       <span className="font-bold text-amber-900">三度叠置</span>
                       <span className="text-xs text-stone-500">传统 · 温暖 · 饱满</span>
                   </button>
              </div>

              {/* VS */}
              <div className="text-stone-300 font-serif italic text-2xl pb-24">vs</div>

              {/* Quartal Stack (Tower) */}
              <div className="flex flex-col items-center gap-6">
                   <div className="relative flex flex-col-reverse items-center gap-4 group">
                       {quartalNotes.map((n, i) => (
                           <div 
                             key={i} 
                             className={`w-32 h-10 rounded-lg flex items-center justify-center font-bold text-sky-900 shadow-sm border border-white/20 transition-all duration-300 ${n.color} ${mode === 'quartal' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-40 scale-95 translate-y-4'}`}
                             style={{ transitionDelay: `${i * 50}ms` }}
                           >
                               {n.note}
                           </div>
                       ))}
                       {/* Connection Lines for wider spacing */}
                       <div className={`absolute inset-0 flex flex-col-reverse items-center justify-between py-5 -z-10 transition-opacity ${mode === 'quartal' ? 'opacity-100' : 'opacity-0'}`}>
                           <div className="w-px h-full bg-stone-200"></div>
                       </div>
                       
                       <div className={`absolute -right-12 h-full w-px bg-stone-300 flex flex-col justify-around py-2 transition-opacity ${mode === 'quartal' ? 'opacity-100' : 'opacity-0'}`}>
                           <span className="absolute left-2 text-[10px] font-mono text-stone-400 whitespace-nowrap">4th</span>
                           <span className="absolute left-2 top-1/4 text-[10px] font-mono text-stone-400 whitespace-nowrap">4th</span>
                           <span className="absolute left-2 top-2/3 text-[10px] font-mono text-stone-400 whitespace-nowrap">4th</span>
                       </div>
                   </div>
                   
                   <button 
                     onClick={() => playChord('quartal')}
                     className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all w-40 ${mode === 'quartal' ? 'border-sky-500 bg-sky-50' : 'border-stone-200 bg-white hover:bg-stone-50'}`}
                   >
                       <AlignVerticalSpaceAround className="text-sky-600" />
                       <span className="font-bold text-sky-900">四度叠置</span>
                       <span className="text-xs text-stone-500">现代 · 开放 · 悬浮</span>
                   </button>
              </div>

          </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Music4 className="text-amber-500" />
                  听觉特征
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                  三度叠置的和弦（如 Cmaj7）听起来非常明确，每个音都紧密咬合。
                  <br/><br/>
                  四度叠置的和弦因为音程跨度更大，听起来更加“空旷”和“中性”。它没有明确的大调或小调色彩，这给了即兴演奏者极大的自由空间。
              </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Play className="text-sky-500" />
                  经典应用：So What
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                  Miles Davis 的名曲《So What》中，Bill Evans 使用了著名的 "So What Voicing"：三个四度 + 一个大三度。这种和弦结构定义了调式爵士（Modal Jazz）的声音。
              </p>
          </div>
      </div>
    </div>
  );
};

export default QuartalHarmonyLesson;
