
import React, { useState, useRef, useEffect } from 'react';
import { Clock as ClockIcon, RotateCw, FlipHorizontal, Calculator, Hash, ArrowRight, Play, Volume2, Fingerprint, RefreshCcw } from 'lucide-react';

const PitchClassSetLesson: React.FC = () => {
  const [selectedNotes, setSelectedNotes] = useState<number[]>([0, 4, 7]); // Default C Major
  const [transformation, setTransformation] = useState<'none' | 'transposed' | 'inverted'>('none');
  const [tValue, setTValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);

  const notes = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const colors = ['#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

  const toggleNote = (i: number) => {
      setSelectedNotes(prev => 
          prev.includes(i) ? prev.filter(n => n !== i) : prev.concat(i).sort((a,b) => a-b)
      );
      // Reset transforms when modifying the core set
      setTransformation('none');
      setTValue(0);
  };

  // --- Logic ---
  
  // Calculate the actual pitch classes being displayed/played
  const activeSet: number[] = selectedNotes.map((n: number) => {
      let val = n;
      if (transformation === 'inverted') {
          val = (12 - val) % 12; // Inversion around 0
      }
      val = (val + tValue) % 12; // Transposition
      return val;
  }).sort((a: number, b: number) => a - b);

  // Interval Vector (Simplified visualization)
  const getIntervalString = () => {
      if (selectedNotes.length < 2) return "-";
      const intervals = [];
      for(let i=0; i<activeSet.length; i++) {
          const next = activeSet[(i+1)%activeSet.length];
          let dist = Math.abs(next - activeSet[i]);
          if (i === activeSet.length -1) dist = 12 - activeSet[i] + activeSet[0];
          intervals.push(dist);
      }
      return intervals.join('-');
  };

  // --- Audio ---
  const playSet = () => {
      if (isPlaying) return;
      setIsPlaying(true);
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const baseFreq = 261.63; // C4
      
      activeSet.forEach((pc, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          // Calculate frequency based on Pitch Class (in 4th octave)
          const freq = baseFreq * Math.pow(2, pc / 12);
          
          osc.frequency.value = freq;
          osc.type = 'triangle';
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          const now = ctx.currentTime;
          const start = now + i * 0.1; // Staggered arpeggio
          
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.2, start + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 1.5);
          
          osc.start(start);
          osc.stop(start + 1.6);
      });

      setTimeout(() => setIsPlaying(false), 1500);
  };

  // --- Handlers ---
  const handleTranspose = (delta: number) => {
      setTransformation('transposed');
      setTValue(prev => (prev + delta + 12) % 12);
  };

  const handleInvert = () => {
      if (transformation === 'inverted') {
          setTransformation('none');
          setTValue(0);
      } else {
          setTransformation('inverted');
          setTValue(0); // Reset T when inverting first
      }
  };

  const reset = () => {
      setTransformation('none');
      setTValue(0);
      setSelectedNotes([0, 4, 7]);
  }

  // --- Rendering Helpers ---
  // Rotation angle for the visual container
  const rotationAngle = tValue * 30; // 30 deg per semitone
  const mirrorScale = transformation === 'inverted' ? -1 : 1;

  return (
    <div className="space-y-16">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-stone-900 text-stone-100 rounded-full text-xs font-bold tracking-wider uppercase mb-3 shadow-lg flex items-center gap-2 w-fit">
            <Calculator size={12} className="text-emerald-400" />
            阶段五：大师之路 (Master Class)
        </div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            音级集合理论 <span className="text-stone-300 font-light">|</span> Pitch Class Set Theory
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-3xl leading-relaxed">
          欢迎来到音乐的数学内核。艾伦·福特 (Allen Forte) 提出了一项革命性的观点：如果我们剥离掉“调性”、“功能”这些外衣，音乐只剩下纯粹的<strong>数字结构</strong>。
          <br/>
          在这里，C大调不再是 C-E-G，而是集合 <code>[0, 4, 7]</code>。
        </p>
      </header>

      {/* Main Interactive Stage - White Theme */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-2xl border border-stone-200 relative overflow-hidden animate-slideUp stagger-1 flex flex-col xl:flex-row items-center gap-20 max-w-4xl mx-auto">
          
          {/* Background Grid - Subtle Light */}
          <div className="absolute inset-0 opacity-40 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
          </div>

          {/* LEFT: The Clock Visualizer */}
          <div className="relative w-[360px] h-[360px] flex-shrink-0 select-none group">
              
              {/* Outer Ring Labels (Static Reference) */}
              {Array.from({length: 12}).map((_, i) => {
                  const angle = (i * 30 - 90) * (Math.PI / 180);
                  const r = 170;
                  return (
                      <div 
                        key={i}
                        className="absolute text-stone-400 font-mono text-xs font-bold transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: 180 + r * Math.cos(angle), top: 180 + r * Math.sin(angle) }}
                      >
                          {i}
                      </div>
                  )
              })}

              {/* ROTATING CONTAINER: This holds the polygon and active dots */}
              <div 
                className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{ 
                    transform: `rotate(${rotationAngle}deg) scaleX(${mirrorScale})` 
                }}
              >
                  {/* Connection Lines (Polygon) - Sky Blue */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                      <polygon 
                        points={selectedNotes.map(n => {
                            const angle = (n * 30 - 90) * (Math.PI / 180);
                            const r = 140; 
                            return `${180 + r * Math.cos(angle)},${180 + r * Math.sin(angle)}`;
                        }).join(' ')}
                        fill="rgba(14, 165, 233, 0.1)" // sky-500 with opacity
                        stroke="#0ea5e9" // sky-500
                        strokeWidth="2"
                        strokeLinejoin="round"
                        className="transition-all duration-300 ease-in-out drop-shadow-md"
                      />
                  </svg>

                  {/* Note Nodes (The Shape) */}
                  {Array.from({length: 12}).map((_, i) => {
                      const angleDeg = i * 30 - 90;
                      const angleRad = angleDeg * (Math.PI / 180);
                      const radius = 140;
                      const x = 180 + radius * Math.cos(angleRad);
                      const y = 180 + radius * Math.sin(angleRad);
                      
                      const isActive = selectedNotes.includes(i);

                      return isActive ? (
                          <div
                            key={i}
                            className={`absolute w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-lg bg-sky-500 border-2 border-white`}
                            style={{ 
                                left: x, top: y 
                            }}
                          >
                          </div>
                      ) : null
                  })}
              </div>

              {/* INTERACTIVE LAYER: Static Click Targets (Invisible but clickable) */}
              {Array.from({length: 12}).map((_, i) => {
                  const angle = (i * 30 - 90) * (Math.PI / 180);
                  const r = 140;
                  return (
                      <button
                        key={i}
                        onClick={() => toggleNote(i)}
                        className="absolute w-10 h-10 rounded-full bg-stone-100/0 hover:bg-stone-100/50 transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer transition-colors border border-transparent hover:border-stone-200"
                        style={{ left: 180 + r * Math.cos(angle), top: 180 + r * Math.sin(angle) }}
                        title={`Toggle Note ${i}`}
                      ></button>
                  )
              })}

              {/* Center Info - Light Theme */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-30">
                  <div className={`text-5xl font-bold font-serif tracking-tighter transition-colors duration-300 ${transformation !== 'none' ? 'text-sky-600' : 'text-stone-300'}`}>
                      {transformation === 'none' ? 'Prime' : (transformation === 'transposed' ? `T${tValue}` : `T${tValue}I`)}
                  </div>
                  <div className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mt-2 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                      集合类 (Set Class)
                  </div>
              </div>
          </div>

          {/* RIGHT: Control Panel */}
          <div className="flex-1 w-full max-w-xl space-y-8">
              
              {/* Data Display */}
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200">
                      <div className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Hash size={12}/> 整数记谱 (Integer)
                      </div>
                      <div className="font-mono text-xl text-sky-600 break-words leading-tight">
                          [{activeSet.join(',')}]
                      </div>
                  </div>
                  <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200">
                      <div className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Fingerprint size={12}/> 音程向量 (Structure)
                      </div>
                      <div className="font-mono text-xl text-fuchsia-600 tracking-widest">
                          &lt;{getIntervalString()}&gt;
                      </div>
                  </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                  <div className="flex gap-4">
                      <button 
                        onClick={() => handleTranspose(1)}
                        className="flex-1 bg-white hover:bg-stone-50 text-stone-800 p-4 rounded-xl border border-stone-200 shadow-sm transition-all active:scale-95 group flex items-center justify-center gap-3"
                      >
                          <RotateCw size={20} className="text-sky-500 group-hover:rotate-90 transition-transform duration-500" />
                          <div className="text-left">
                              <div className="font-bold text-sm">移调 (Transpose)</div>
                              <div className="text-[10px] text-stone-400">Tn: 顺时针旋转</div>
                          </div>
                      </button>

                      <button 
                        onClick={handleInvert}
                        className="flex-1 bg-white hover:bg-stone-50 text-stone-800 p-4 rounded-xl border border-stone-200 shadow-sm transition-all active:scale-95 group flex items-center justify-center gap-3"
                      >
                          <FlipHorizontal size={20} className="text-fuchsia-500 group-hover:scale-x-[-1] transition-transform duration-500" />
                          <div className="text-left">
                              <div className="font-bold text-sm">倒影 (Invert)</div>
                              <div className="text-[10px] text-stone-400">TnI: 镜像翻转</div>
                          </div>
                      </button>
                  </div>

                  <div className="flex gap-4">
                      <button 
                        onClick={playSet}
                        disabled={isPlaying}
                        className="flex-1 bg-stone-900 hover:bg-stone-800 text-white p-4 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                          {isPlaying ? <Volume2 className="animate-pulse" /> : <Play fill="currentColor" />}
                          <span>聆听集合色彩</span>
                      </button>
                      <button 
                        onClick={reset}
                        className="w-16 bg-white hover:bg-stone-50 text-stone-500 hover:text-stone-900 p-4 rounded-xl border border-stone-200 shadow-sm flex items-center justify-center"
                        title="重置 (Reset)"
                      >
                          <RefreshCcw size={20} />
                      </button>
                  </div>
              </div>

              {/* Mini Lesson Text */}
              <div className="text-xs text-stone-600 leading-relaxed bg-sky-50/50 p-4 rounded-xl border border-sky-100">
                  <p>
                      <strong className="text-stone-800">为什么用数字？</strong> 
                      传统的音名 (C, D, E) 带有强烈的调性暗示。而数字 (0-11) 是民主的，消除了主音的层级。
                      <br/><br/>
                      <strong className="text-stone-800">同一性 (Identity):</strong> 
                      试着旋转或翻转左侧的图形。你会发现，无论怎么操作，这个“三角形”的形状（内部结构）是不变的。
                      这就解释了为什么大三和弦和小三和弦听起来如此相似——它们在几何上是<strong>同构</strong>的。
                  </p>
              </div>
          </div>
      </div>

      {/* Detailed Concept Cards */}
      <div className="grid md:grid-cols-3 gap-6 animate-slideUp stagger-2">
          
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <ClockIcon className="text-sky-500" size={20} />
                  模12运算 (Modulo 12)
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                  音乐就像时钟。11点再过2小时是1点，而不是13点。
                  <br/>
                  同理，音符 11 (B) 向上移 2 个半音，就变成了 1 (C#)。
                  <br/>
                  <span className="font-mono bg-stone-100 px-1 rounded text-sky-700">(11 + 2) mod 12 = 1</span>。
                  这就是为什么无论怎么移调，音符永远在 0-11 之间循环。
              </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <Fingerprint className="text-fuchsia-500" size={20} />
                  标准型 (Normal Order)
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                  [0, 4, 7] (C大三) 和 [0, 3, 7] (C小三) 看起来不同。
                  但如果我们把 C小三 (C-Eb-G) 倒过来排 (G-Eb-C)，音程关系其实也是 3+4。
                  <br/><br/>
                  集合论不仅分析音高，更分析<strong>音程向量</strong>。它揭示了这两种和弦拥有完全相同的“DNA”（包含一个大三度、一个小三度、一个纯五度）。
              </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <ArrowRight className="text-amber-500" size={20} />
                  星座的隐喻
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                  把音级集合想象成天空中的<strong>星座</strong>。
                  <br/>
                  猎户座无论是在东边升起（移调），还是在湖水中倒影（倒影），或者是随着季节旋转，它那三颗亮星的<strong>相对位置</strong>永远不变。
                  <br/>
                  我们听到的，就是这个“形状”。
              </p>
          </div>

      </div>
    </div>
  );
};

export default PitchClassSetLesson;
