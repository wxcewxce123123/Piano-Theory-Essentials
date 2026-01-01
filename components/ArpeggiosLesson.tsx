
import React, { useState, useRef } from 'react';
import { Waves, Play, ArrowUp, ArrowDown, Music, Wind, Layers } from 'lucide-react';

const ArpeggiosLesson: React.FC = () => {
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNoteIndex, setActiveNoteIndex] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // C Major 2 Octaves
  const notes = [
    { id: 0, name: 'C3', freq: 130.81, percent: 10 },
    { id: 1, name: 'E3', freq: 164.81, percent: 23 },
    { id: 2, name: 'G3', freq: 196.00, percent: 36 },
    { id: 3, name: 'C4', freq: 261.63, percent: 50 },
    { id: 4, name: 'E4', freq: 329.63, percent: 63 },
    { id: 5, name: 'G4', freq: 392.00, percent: 76 },
    { id: 6, name: 'C5', freq: 523.25, percent: 90 },
  ];

  const playSequence = (dir: 'up' | 'down') => {
    if (isPlaying) return;
    setIsPlaying(true);
    setDirection(dir);
    setActiveNoteIndex(null);

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const sequence = dir === 'up' ? notes : [...notes].reverse();
    const noteDuration = 0.15; // Fast flow

    sequence.forEach((note, i) => {
        const startTime = ctx.currentTime + i * noteDuration;
        
        // Audio
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = note.freq;
        osc.type = 'triangle';
        
        // Lowpass filter for warmer, harp-like tone
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5); // Long sustain
        
        osc.start(startTime);
        osc.stop(startTime + 1.6);

        // Visual Trigger
        setTimeout(() => {
            setActiveNoteIndex(note.id);
        }, i * noteDuration * 1000);
    });

    setTimeout(() => {
        setIsPlaying(false);
        setActiveNoteIndex(null);
    }, sequence.length * noteDuration * 1000 + 500);
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 4</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            琶音 <span className="text-stone-300 font-light">|</span> Arpeggios
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          来源于意大利语 "Arpeggiare" (像竖琴一样演奏)。它是将和弦的音符“拆解”开来，像流水一样依次奏出。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl animate-slideUp stagger-1 relative overflow-hidden flex flex-col md:flex-row gap-12 min-h-[500px]">
          {/* Decorative Glows */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]"></div>

          {/* Left: Controls */}
          <div className="md:w-1/3 flex flex-col justify-center gap-6 relative z-10">
              <div className="text-stone-400 text-sm font-bold uppercase tracking-widest mb-2">Controls</div>
              <button 
                onClick={() => playSequence('up')}
                disabled={isPlaying}
                className={`flex items-center justify-between px-6 py-4 rounded-xl font-bold transition-all border-2 ${
                    isPlaying && direction === 'up'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                    : 'bg-stone-800/50 border-stone-700 text-stone-300 hover:bg-stone-800 hover:border-stone-500'
                }`}
              >
                  <span className="flex items-center gap-3"><ArrowUp size={20}/> 上行 (Ascending)</span>
                  {isPlaying && direction === 'up' && <Waves size={18} className="animate-pulse" />}
              </button>

              <button 
                onClick={() => playSequence('down')}
                disabled={isPlaying}
                className={`flex items-center justify-between px-6 py-4 rounded-xl font-bold transition-all border-2 ${
                    isPlaying && direction === 'down'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                    : 'bg-stone-800/50 border-stone-700 text-stone-300 hover:bg-stone-800 hover:border-stone-500'
                }`}
              >
                  <span className="flex items-center gap-3"><ArrowDown size={20}/> 下行 (Descending)</span>
                  {isPlaying && direction === 'down' && <Waves size={18} className="animate-pulse" />}
              </button>

              <div className="mt-4 p-4 bg-stone-800/30 rounded-xl border border-stone-700/50 text-stone-400 text-xs leading-relaxed">
                  <Music className="mb-2 text-cyan-500" size={16} />
                  琶音可以极大地扩展音乐的音域。一只手无法同时按下跨越两个八度的和弦，但通过琶音，我们可以轻松覆盖整个键盘。
              </div>
          </div>

          {/* Right: The Harp Visualizer */}
          <div className="flex-1 relative flex items-center justify-center">
              {/* String Lines Background */}
              <div className="absolute inset-0 flex flex-col justify-between py-12 px-8 opacity-20 pointer-events-none">
                  {notes.map(n => (
                      <div key={`line-${n.id}`} className="w-full h-px bg-stone-500"></div>
                  ))}
              </div>

              {/* The Wave Path (SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                  <path 
                    d={`M 10% ${100 - notes[0].percent}% 
                        C 30% ${100 - notes[1].percent}%, 30% ${100 - notes[2].percent}%, 50% ${100 - notes[3].percent}% 
                        S 70% ${100 - notes[5].percent}%, 90% ${100 - notes[6].percent}%`}
                    fill="none" 
                    stroke={isPlaying ? "url(#gradient-flow)" : "rgba(255,255,255,0.1)"}
                    strokeWidth="4" 
                    strokeLinecap="round"
                    className={`transition-all duration-300 ${isPlaying ? 'animate-draw-path opacity-100' : 'opacity-20'}`}
                    style={{ 
                        strokeDasharray: 1000, 
                        strokeDashoffset: isPlaying ? 0 : 1000,
                        animationDirection: direction === 'down' ? 'reverse' : 'normal' // SVG path direction trick or simpler JS logic? Let's rely on dashoffset 
                    }}
                  />
                  <defs>
                    <linearGradient id="gradient-flow" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
              </svg>

              {/* Notes */}
              <div className="relative w-full h-full">
                  {notes.map((n, i) => {
                      const isActive = activeNoteIndex === n.id;
                      // Calculate X position based on simple spread
                      const xPos = 10 + (i / (notes.length - 1)) * 80;
                      
                      return (
                          <div 
                            key={n.id}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all duration-300
                                ${isActive 
                                    ? 'bg-white border-transparent text-stone-900 scale-125 shadow-[0_0_30px_white] z-20' 
                                    : 'bg-stone-800 border-stone-600 text-stone-600 scale-100 z-10'
                                }
                            `}
                            style={{ 
                                left: `${xPos}%`, 
                                bottom: `${n.percent}%` 
                            }}
                          >
                              {n.name.replace(/\d/, '')}
                              <span className="text-[10px] align-top opacity-60 ml-0.5">{n.name.slice(-1)}</span>
                              
                              {/* Ripple Ring */}
                              {isActive && (
                                  <div className="absolute inset-0 border-2 border-white rounded-full animate-ping opacity-50"></div>
                              )}
                          </div>
                      )
                  })}
              </div>
          </div>
      </div>

      {/* Deep Dive Text */}
      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Wind className="text-cyan-500" />
                  折扇的比喻 (The Fan Analogy)
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  想象一把折扇。
              </p>
              <ul className="space-y-3 text-sm text-stone-600">
                  <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-1.5 shrink-0"></div>
                      <span><strong>和弦 (Block Chord)：</strong> 是合拢的折扇。所有颜色叠加在一起，也是一种美，但你看不清图案的全貌。</span>
                  </li>
                  <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0"></div>
                      <span><strong>琶音 (Arpeggio)：</strong> 是慢慢展开这把扇子。通过时间（横向）的流动，将和声（纵向）的色彩一层层铺开，展现出完整的画面。</span>
                  </li>
              </ul>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Layers className="text-purple-500" />
                  从静态到动态
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  在伴奏中，如果你一直用力敲击柱式和弦，音乐会显得呆板、沉重。
                  <br/><br/>
                  使用琶音，你可以把原本静止的和声变成流动的背景（Texture）。就像平静的湖面泛起波纹，虽然水的本质（和弦成分）没有变，但它看起来充满了生命力和动感。
              </p>
          </div>
      </div>

      <style>{`
        .animate-draw-path {
            animation: drawPath 1s ease-out forwards;
        }
        @keyframes drawPath {
            to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

export default ArpeggiosLesson;
