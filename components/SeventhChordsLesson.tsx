
import React, { useState, useRef } from 'react';
import { Layers, ArrowUp, Music, Star, Zap, Moon } from 'lucide-react';

const SeventhChordsLesson: React.FC = () => {
  const [activeChord, setActiveChord] = useState<'maj7' | 'dom7' | 'min7' | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playChord = (type: 'maj7' | 'dom7' | 'min7') => {
    setActiveChord(type);
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    
    // Root C4 = 261.63
    let freqs = [];
    if (type === 'maj7') freqs = [261.63, 329.63, 392.00, 493.88]; // C E G B
    if (type === 'dom7') freqs = [261.63, 329.63, 392.00, 466.16]; // C E G Bb
    if (type === 'min7') freqs = [261.63, 311.13, 392.00, 466.16]; // C Eb G Bb

    freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = 'triangle';
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Staggered entrance (Arpeggiated feel) to match visual stacking
        const startTime = now + i * 0.1;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05); 
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 2.0);
        
        osc.start(startTime);
        osc.stop(startTime + 2.1);
    });
  };

  // Helper to determine block styling
  const getNoteStyle = (chordType: string | null, level: number) => {
      // level: 0=root, 1=3rd, 2=5th, 3=7th
      if (!chordType) return 'bg-stone-100 border-stone-200 text-stone-300 scale-95 opacity-50 translate-y-8'; // Added translate-y for hidden state
      
      const isMaj7 = chordType === 'maj7';
      const isDom7 = chordType === 'dom7';
      const isMin7 = chordType === 'min7';

      // Colors
      const majColor = 'bg-indigo-500 border-indigo-400 text-white';
      const domColor = 'bg-amber-500 border-amber-400 text-white';
      const minColor = 'bg-emerald-500 border-emerald-400 text-white';
      const baseColor = 'bg-stone-800 border-stone-700 text-stone-400'; // For stable intervals

      // Logic
      if (level === 0) return 'bg-stone-900 border-stone-800 text-white translate-y-0 opacity-100 scale-100'; // Root always dark
      if (level === 2) return `${baseColor} translate-y-0 opacity-100 scale-100`; // 5th usually stable

      if (level === 1) { // 3rd
          if (isMin7) return 'bg-emerald-600 border-emerald-500 text-white translate-y-0 opacity-100 scale-100'; // Minor 3rd
          return 'bg-stone-700 border-stone-600 text-white translate-y-0 opacity-100 scale-100'; // Major 3rd (Standard)
      }

      if (level === 3) { // 7th (The Penthouse)
          if (isMaj7) return `${majColor} translate-y-0 opacity-100 scale-100`;
          if (isDom7) return `${domColor} translate-y-0 opacity-100 scale-100`;
          if (isMin7) return `${minColor} translate-y-0 opacity-100 scale-100`;
      }
      return 'translate-y-0';
  };

  const getNoteLabel = (chordType: string | null, level: number) => {
      if (!chordType) return ['?', '?', '?', '?'][level];
      if (level === 0) return 'C (Root)';
      if (level === 2) return 'G (5th)';
      
      if (chordType === 'maj7') return level === 1 ? 'E (Maj 3rd)' : 'B (Maj 7th)';
      if (chordType === 'dom7') return level === 1 ? 'E (Maj 3rd)' : 'Bb (Min 7th)';
      if (chordType === 'min7') return level === 1 ? 'Eb (Min 3rd)' : 'Bb (Min 7th)';
      return '';
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 4</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            七和弦 <span className="text-stone-300 font-light">|</span> Seventh Chords
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          在三和弦的地基上，加盖一层“顶楼”。这多出来的一个音（七音），赋予了和弦复杂的性格与色彩，是通往爵士乐的桥梁。
        </p>
      </header>

      {/* Interactive Stage */}
      <div className="flex flex-col lg:flex-row gap-12 animate-slideUp stagger-1">
          
          {/* Left: Visualizer (Skyscraper) */}
          <div className="lg:w-5/12 flex flex-col items-center justify-end bg-stone-50 rounded-[2.5rem] border border-stone-200 p-8 min-h-[500px] relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#a8a29e 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              
              <div className="relative z-10 w-full max-w-xs space-y-2">
                  <div className="text-center text-stone-400 text-xs font-bold uppercase tracking-widest mb-4">Chord Structure</div>
                  
                  {/* The Stack (Reversed order visually: 7th on top) */}
                  {[3, 2, 1, 0].map((level) => (
                      <div 
                        key={level}
                        className={`
                            h-20 w-full rounded-2xl flex items-center justify-between px-6 font-bold shadow-sm border-b-4 transition-all duration-500 ease-out
                            ${getNoteStyle(activeChord, level)}
                        `}
                        style={{ transitionDelay: `${level * 50}ms` }}
                      >
                          <span>{getNoteLabel(activeChord, level)}</span>
                          <span className="text-xs opacity-60 font-mono tracking-wider">
                              {level === 3 ? 'THE PENTHOUSE' : (level === 0 ? 'FOUNDATION' : '')}
                          </span>
                      </div>
                  ))}
              </div>
              
              {/* Floor reflection shadow */}
              <div className="w-48 h-4 bg-stone-900/10 rounded-[100%] blur-md mt-4"></div>
          </div>

          {/* Right: Controls */}
          <div className="lg:w-7/12 grid gap-6 content-center">
              
              {/* Maj7 Card */}
              <button 
                 onClick={() => playChord('maj7')}
                 className={`relative p-6 rounded-3xl border-2 text-left transition-all duration-500 group overflow-hidden ${activeChord === 'maj7' ? 'border-indigo-500 bg-indigo-50 shadow-xl' : 'border-stone-100 bg-white hover:border-indigo-200 hover:shadow-lg'}`}
              >
                 <div className="flex justify-between items-start relative z-10">
                    <div>
                        <h3 className={`text-2xl font-bold mb-1 transition-colors duration-300 ${activeChord === 'maj7' ? 'text-indigo-900' : 'text-stone-800'}`}>Cmaj7</h3>
                        <div className="text-xs font-bold uppercase tracking-widest text-stone-400">大七和弦 (Major 7th)</div>
                    </div>
                    <div className={`p-3 rounded-xl transition-colors duration-300 ${activeChord === 'maj7' ? 'bg-indigo-500 text-white' : 'bg-stone-100 text-stone-400'}`}>
                        <Star size={24} fill={activeChord==='maj7'?"currentColor":"none"} />
                    </div>
                 </div>
                 <p className="mt-4 text-stone-600 text-sm leading-relaxed relative z-10">
                     <strong>听感：</strong> 梦幻、漂浮、浪漫。像躺在云端，或者看着都市夜景。<br/>
                     <strong>结构：</strong> 大三和弦 + 大七度 (B)。那个 B 音想要往上解决到 C，但又停在半空，制造了甜美的张力。
                 </p>
                 <div className={`absolute inset-0 bg-gradient-to-r from-indigo-100/50 to-transparent pointer-events-none transition-opacity duration-500 ${activeChord === 'maj7' ? 'opacity-100' : 'opacity-0'}`}></div>
              </button>

              {/* Dom7 Card */}
              <button 
                 onClick={() => playChord('dom7')}
                 className={`relative p-6 rounded-3xl border-2 text-left transition-all duration-500 group overflow-hidden ${activeChord === 'dom7' ? 'border-amber-500 bg-amber-50 shadow-xl' : 'border-stone-100 bg-white hover:border-amber-200 hover:shadow-lg'}`}
              >
                 <div className="flex justify-between items-start relative z-10">
                    <div>
                        <h3 className={`text-2xl font-bold mb-1 transition-colors duration-300 ${activeChord === 'dom7' ? 'text-amber-900' : 'text-stone-800'}`}>C7</h3>
                        <div className="text-xs font-bold uppercase tracking-widest text-stone-400">属七和弦 (Dominant 7th)</div>
                    </div>
                    <div className={`p-3 rounded-xl transition-colors duration-300 ${activeChord === 'dom7' ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-400'}`}>
                        <Zap size={24} fill={activeChord==='dom7'?"currentColor":"none"} />
                    </div>
                 </div>
                 <p className="mt-4 text-stone-600 text-sm leading-relaxed relative z-10">
                     <strong>听感：</strong> 不稳定、充满动力、布鲁斯味道。它迫切地想要“回家”（解决到 F 和弦）。<br/>
                     <strong>结构：</strong> 大三和弦 + 小七度 (Bb)。大三度(E)和小七度(Bb)之间形成了“三全音”冲突，这是动力的源泉。
                 </p>
              </button>

              {/* Min7 Card */}
              <button 
                 onClick={() => playChord('min7')}
                 className={`relative p-6 rounded-3xl border-2 text-left transition-all duration-500 group overflow-hidden ${activeChord === 'min7' ? 'border-emerald-500 bg-emerald-50 shadow-xl' : 'border-stone-100 bg-white hover:border-emerald-200 hover:shadow-lg'}`}
              >
                 <div className="flex justify-between items-start relative z-10">
                    <div>
                        <h3 className={`text-2xl font-bold mb-1 transition-colors duration-300 ${activeChord === 'min7' ? 'text-emerald-900' : 'text-stone-800'}`}>Cm7</h3>
                        <div className="text-xs font-bold uppercase tracking-widest text-stone-400">小七和弦 (Minor 7th)</div>
                    </div>
                    <div className={`p-3 rounded-xl transition-colors duration-300 ${activeChord === 'min7' ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-400'}`}>
                        <Moon size={24} fill={activeChord==='min7'?"currentColor":"none"} />
                    </div>
                 </div>
                 <p className="mt-4 text-stone-600 text-sm leading-relaxed relative z-10">
                     <strong>听感：</strong> 柔和、都市、深夜咖啡馆。比纯粹的小三和弦更圆润，没有那么悲伤，更多的是一种“酷”和“内省”。<br/>
                     <strong>结构：</strong> 小三和弦 + 小七度 (Bb)。结构非常平稳，常用于爵士乐的 ii-V-I 进行中。
                 </p>
              </button>

          </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm animate-slideUp stagger-2">
          <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
              <Layers className="text-stone-400" />
              为什么叫“七”和弦？
          </h3>
          <p className="text-stone-600 text-sm leading-relaxed">
              这个名字来源于音程。从根音（1）开始数，加上三音（3）、五音（5），最后再叠加一个<strong>七度音（7）</strong>。
              <br/><br/>
              如果把三和弦比作“黑白照片”，那么七和弦就是“彩色照片”。它并没有改变和弦的基本功能（Cmaj7 依然是 C 和弦），但它极大地丰富了和声的<strong>情感维度</strong>。
          </p>
      </div>
    </div>
  );
};

export default SeventhChordsLesson;
