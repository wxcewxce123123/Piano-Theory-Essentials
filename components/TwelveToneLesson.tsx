
import React, { useState, useRef, useEffect } from 'react';
import { RefreshCcw, ArrowRight, Music, Calculator, BookOpen } from 'lucide-react';

const TwelveToneLesson: React.FC = () => {
  const [row, setRow] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [transformation, setTransformation] = useState<'prime' | 'retrograde' | 'inversion'>('prime');
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Chromatic scale starting at C4
  const notes = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const baseFreq = 261.63;

  useEffect(() => {
    generateRow();
  }, []);

  const generateRow = () => {
    // Fisher-Yates shuffle for 12 unique tones
    const newRow = Array.from({length: 12}, (_, i) => i);
    for (let i = newRow.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newRow[i], newRow[j]] = [newRow[j], newRow[i]];
    }
    setRow(newRow);
    setTransformation('prime');
    setActiveIndex(-1);
  };

  const getActiveSequence = () => {
      if (transformation === 'prime') return row;
      if (transformation === 'retrograde') return [...row].reverse();
      if (transformation === 'inversion') {
          const start = row[0];
          return row.map(n => {
              const interval = n - start;
              let inverted = start - interval;
              while(inverted < 0) inverted += 12;
              return inverted % 12;
          });
      }
      return row;
  };

  const playSequence = async () => {
      if (isPlaying) return;
      setIsPlaying(true);
      
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const sequence = getActiveSequence();

      for (let i = 0; i < sequence.length; i++) {
          setActiveIndex(i);
          const noteIndex = sequence[i];
          const freq = baseFreq * Math.pow(2, noteIndex / 12);
          
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.frequency.value = freq;
          osc.type = 'triangle';
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          const now = ctx.currentTime;
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          
          osc.start(now);
          osc.stop(now + 0.45);

          await new Promise(r => setTimeout(r, 400));
      }

      setIsPlaying(false);
      setActiveIndex(-1);
  };

  const currentSequence = getActiveSequence();

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-stone-900 text-stone-100 rounded-full text-xs font-bold tracking-wider uppercase mb-3 shadow-lg">Level 5 - Master Class</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            十二音序列 <span className="text-stone-300 font-light">|</span> Twelve-Tone Technique
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-3xl leading-relaxed">
          阿诺德·勋伯格 (Arnold Schoenberg) 在 20 世纪初提出了一项革命性的宣言：<strong>“不协和音的解放”</strong>。
          他认为传统的调性（以 Do 为中心）是一种束缚。在十二音体系中，钢琴上的 12 个半音是完全平等的“公民”。
          没有主音，没有属音，只有纯粹的结构关系。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-[#1c1917] rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden animate-slideUp stagger-1 flex flex-col gap-10 border border-stone-800">
          
          {/* Matrix Background Pattern */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
               style={{ 
                   backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
                   backgroundSize: '20px 20px' 
               }}>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center z-10 gap-6">
             <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                 <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
             </div>
             <div className="font-mono text-stone-500 text-xs uppercase tracking-[0.2em] font-bold">Serialism Generator v1.0</div>
          </div>

          {/* Visualization Graph - Glass Effect */}
          <div className="relative h-72 w-full bg-black/40 rounded-3xl border border-white/5 p-6 flex items-center justify-center backdrop-blur-sm">
              <svg width="100%" height="100%" viewBox="0 0 1200 120" className="overflow-visible">
                   {/* Horizontal Grid Lines */}
                   {Array.from({length: 12}).map((_, i) => (
                       <line key={i} x1="0" y1={i * 10} x2="1200" y2={i * 10} stroke="#ffffff" strokeOpacity="0.05" />
                   ))}

                   {/* Connecting Lines */}
                   <polyline 
                      points={currentSequence.map((n, i) => `${(i / 11) * 1200},${110 - (n / 11) * 110}`).join(' ')}
                      fill="none"
                      stroke={
                          transformation === 'prime' ? '#f59e0b' : 
                          transformation === 'retrograde' ? '#ef4444' : '#3b82f6'
                      }
                      strokeWidth="2"
                      strokeOpacity="0.6"
                      className="drop-shadow-lg"
                   />

                   {/* Notes Dots */}
                   {currentSequence.map((n, i) => (
                       <g key={i} className="transition-all duration-300">
                           {/* Guide Line Vertical */}
                           <line x1={(i / 11) * 1200} y1="0" x2={(i / 11) * 1200} y2="120" stroke="white" strokeOpacity="0.02" />
                           
                           {/* The Node */}
                           <circle 
                             cx={(i / 11) * 1200} 
                             cy={110 - (n / 11) * 110} 
                             r={activeIndex === i ? 10 : 5}
                             fill={activeIndex === i ? '#fff' : '#1c1917'}
                             stroke={
                                 transformation === 'prime' ? '#f59e0b' : 
                                 transformation === 'retrograde' ? '#ef4444' : '#3b82f6'
                             }
                             strokeWidth="2"
                             className="transition-all duration-100"
                           />
                           
                           {/* Note Label above/below */}
                           <text 
                             x={(i / 11) * 1200} 
                             y={110 - (n / 11) * 110 + (n > 6 ? 25 : -15)} 
                             fill="white" 
                             fontSize="12" 
                             fontWeight="bold" 
                             textAnchor="middle"
                             fontFamily="monospace"
                             className={`transition-opacity duration-300 ${activeIndex === i ? 'opacity-100' : 'opacity-40'}`}
                           >
                               {notes[n]}
                           </text>
                       </g>
                   ))}
              </svg>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col gap-6 z-10 bg-stone-800/50 p-4 rounded-2xl border border-stone-700/50 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  {/* Row Operations */}
                  <div className="flex gap-2">
                      <button 
                         onClick={() => { setTransformation('prime'); setIsPlaying(false); }}
                         className={`px-4 py-2 rounded-lg border transition-all text-xs font-bold uppercase tracking-wider ${transformation === 'prime' ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'border-stone-700 text-stone-500 hover:border-stone-500'}`}
                      >
                          原形 (Prime)
                      </button>
                      <button 
                         onClick={() => { setTransformation('retrograde'); setIsPlaying(false); }}
                         className={`px-4 py-2 rounded-lg border transition-all text-xs font-bold uppercase tracking-wider ${transformation === 'retrograde' ? 'bg-red-500/20 border-red-500 text-red-500' : 'border-stone-700 text-stone-500 hover:border-stone-500'}`}
                      >
                          逆行 (Retrograde)
                      </button>
                      <button 
                         onClick={() => { setTransformation('inversion'); setIsPlaying(false); }}
                         className={`px-4 py-2 rounded-lg border transition-all text-xs font-bold uppercase tracking-wider ${transformation === 'inversion' ? 'bg-blue-500/20 border-blue-500 text-blue-500' : 'border-stone-700 text-stone-500 hover:border-stone-500'}`}
                      >
                          倒影 (Inversion)
                      </button>
                  </div>

                  {/* Main Actions */}
                  <div className="flex gap-4">
                      <button 
                        onClick={generateRow}
                        className="p-3 bg-stone-700 text-stone-300 rounded-xl hover:bg-stone-600 transition-colors"
                        title="Generate New Row (Randomize)"
                      >
                          <RefreshCcw size={18} />
                      </button>
                      
                      <button 
                        onClick={playSequence}
                        className={`px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${
                            isPlaying 
                            ? 'bg-stone-700 text-stone-500' 
                            : 'bg-white text-stone-900 hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.15)]'
                        }`}
                      >
                          <Music size={18} />
                          <span className="text-sm">{isPlaying ? 'Sequencing...' : '播放序列'}</span>
                      </button>
                  </div>
              </div>
          </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Calculator className="text-amber-500" />
                  序列主义的三大操作
              </h3>
              <ul className="space-y-4 text-stone-600 text-sm leading-relaxed">
                  <li className="flex gap-3">
                      <span className="font-bold text-amber-600 shrink-0">原形 (Prime):</span>
                      <span>作曲家最初设定的一组 12 音排序，这就是乐曲的“基因”。</span>
                  </li>
                  <li className="flex gap-3">
                      <span className="font-bold text-red-600 shrink-0">逆行 (Retrograde):</span>
                      <span>从后往前演奏。就像把时间倒流，或者把磁带倒着放。</span>
                  </li>
                  <li className="flex gap-3">
                      <span className="font-bold text-blue-600 shrink-0">倒影 (Inversion):</span>
                      <span>以第一个音为轴，将所有音程上下颠倒。如果原形是“向上大三度”，倒影就是“向下大三度”。就像在湖面倒影中看风景。</span>
                  </li>
              </ul>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <BookOpen className="text-indigo-500" />
                  如何欣赏无调性音乐？
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  如果你试图在十二音音乐中寻找“动听的旋律”，你可能会失望。这种音乐的美感在于<strong>结构</strong>和<strong>质感</strong>。
              </p>
              <p className="text-stone-600 text-sm leading-relaxed">
                  想象你正在看一副抽象派的画作（如康定斯基的作品）。你不会问“这画的是什么物体？”，而是去感受线条的张力、色彩的对比以及几何形状之间的平衡。听勋伯格的音乐也是如此：去感受那种冰冷、晶莹剔透、如同数学公式般严密的逻辑美。
              </p>
          </div>
      </div>
    </div>
  );
};

export default TwelveToneLesson;
