
import React, { useState, useRef } from 'react';
import { Route, ArrowRight, Shuffle, GripHorizontal, Activity, Minimize2, Footprints } from 'lucide-react';

const VoiceLeadingLesson: React.FC = () => {
  const [method, setMethod] = useState<'jump' | 'smooth'>('jump');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Distances for visualization
  // Jump: C->F (5), E->A (5), G->C (5) = 15 Total
  // Smooth: C->C (0), E->F (1), G->A (2) = 3 Total

  const playProgression = async (selectedMethod: 'jump' | 'smooth') => {
      setMethod(selectedMethod);
      // Allow replay even if playing, just reset
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 10);

      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      // Chord 1: C Major (C4 E4 G4)
      const chord1 = [261.6, 329.6, 392.0];
      
      // Chord 2
      let chord2 = [];
      if (selectedMethod === 'jump') {
          // Jump up to F Root position
          chord2 = [349.2, 440.0, 523.3]; // F4 A4 C5
      } else {
          // Smooth: Inversion (C4 F4 A4)
          chord2 = [261.6, 349.2, 440.0];
      }

      const playChordNotes = (notes: number[], time: number) => {
          notes.forEach(f => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.frequency.value = f;
              osc.type = 'triangle';
              osc.connect(gain);
              gain.connect(ctx.destination);
              gain.gain.setValueAtTime(0, time);
              gain.gain.linearRampToValueAtTime(0.2, time + 0.05);
              gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);
              osc.start(time);
              osc.stop(time + 1.3);
          });
      };

      const now = ctx.currentTime;
      playChordNotes(chord1, now);
      playChordNotes(chord2, now + 1.5);

      setTimeout(() => setIsPlaying(false), 3000);
  };

  // Keyboard rendering helper
  const keys = [
      { n: 'C4', w: true, x: 0 }, { n: 'C#4', w: false, x: 10 },
      { n: 'D4', w: true, x: 14.3 }, { n: 'D#4', w: false, x: 24.3 },
      { n: 'E4', w: true, x: 28.6 },
      { n: 'F4', w: true, x: 42.9 }, { n: 'F#4', w: false, x: 52.9 },
      { n: 'G4', w: true, x: 57.1 }, { n: 'G#4', w: false, x: 67.1 },
      { n: 'A4', w: true, x: 71.4 }, { n: 'A#4', w: false, x: 81.4 },
      { n: 'B4', w: true, x: 85.7 },
      { n: 'C5', w: true, x: 100 }
  ];

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 4</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            声部连接 <span className="text-stone-300 font-light">|</span> Voice Leading
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          和声学的黄金法则：<strong>懒惰是美德</strong>。连接两个和弦时，手指移动的距离越短越好 (Path of Least Resistance)。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-200 p-8 md:p-12 animate-slideUp stagger-1 flex flex-col gap-12 relative overflow-hidden">
          
          {/* Top Section: Visualization */}
          <div className="flex flex-col md:flex-row gap-8 items-stretch h-full min-h-[300px]">
              
              {/* Left: Physical Distance Visualizer */}
              <div className="flex-1 bg-stone-50 rounded-3xl border border-stone-100 relative overflow-hidden flex flex-col p-6">
                  <div className="flex justify-between items-center mb-8">
                      <div className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                          <Footprints size={14} /> Physical Distance Cost
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors duration-500 ${method === 'jump' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {method === 'jump' ? 'High Cost (15 Semitones)' : 'Minimal Cost (3 Semitones)'}
                      </div>
                  </div>

                  {/* Energy Bars */}
                  <div className="flex-1 flex items-end justify-center gap-4 relative">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
                          <div className="w-full h-px bg-stone-900"></div>
                          <div className="w-full h-px bg-stone-900"></div>
                          <div className="w-full h-px bg-stone-900"></div>
                          <div className="w-full h-px bg-stone-900"></div>
                      </div>

                      {/* Bar 1: C -> F (or C->C) */}
                      <div className="flex flex-col items-center gap-2 w-16">
                          <div className="text-xs font-mono text-stone-400">Voice 1</div>
                          <div 
                            className={`w-full rounded-t-lg transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-end justify-center pb-2 text-white font-bold text-sm ${method === 'jump' ? 'bg-red-400 h-40' : 'bg-emerald-400 h-4'}`}
                          >
                              {method === 'jump' ? '+5' : '0'}
                          </div>
                      </div>
                      {/* Bar 2: E -> A (or E->F) */}
                      <div className="flex flex-col items-center gap-2 w-16">
                          <div className="text-xs font-mono text-stone-400">Voice 2</div>
                          <div 
                            className={`w-full rounded-t-lg transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-end justify-center pb-2 text-white font-bold text-sm ${method === 'jump' ? 'bg-red-400 h-40' : 'bg-emerald-400 h-12'}`}
                          >
                              {method === 'jump' ? '+5' : '+1'}
                          </div>
                      </div>
                      {/* Bar 3: G -> C (or G->A) */}
                      <div className="flex flex-col items-center gap-2 w-16">
                          <div className="text-xs font-mono text-stone-400">Voice 3</div>
                          <div 
                            className={`w-full rounded-t-lg transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-end justify-center pb-2 text-white font-bold text-sm ${method === 'jump' ? 'bg-red-400 h-40' : 'bg-emerald-400 h-20'}`}
                          >
                              {method === 'jump' ? '+5' : '+2'}
                          </div>
                      </div>
                  </div>
              </div>

              {/* Right: Keyboard Motion Map */}
              <div className="flex-1 bg-stone-900 rounded-3xl border border-stone-800 relative overflow-hidden flex flex-col p-6 shadow-inner">
                  <div className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Activity size={14} /> Motion Map
                  </div>
                  
                  {/* Keyboard Visual */}
                  <div className="relative flex-1 flex items-center justify-center">
                      <div className="relative w-full h-40">
                          {/* Keys Background */}
                          <div className="absolute inset-0 flex">
                              {/* White Keys */}
                              {['C4','D4','E4','F4','G4','A4','B4','C5'].map((k, i) => (
                                  <div key={k} className="flex-1 border-r border-stone-800 bg-stone-800/50 rounded-b-sm"></div>
                              ))}
                          </div>
                          
                          {/* Active Dots Animation */}
                          {/* Voice 1: C -> F/C */}
                          <div 
                            className={`absolute top-1/2 w-4 h-4 rounded-full shadow-[0_0_15px_currentColor] transition-all duration-[1500ms] ease-in-out z-20 ${isPlaying ? (method === 'jump' ? 'left-[42%] bg-red-500' : 'left-[0%] bg-emerald-500') : 'left-[0%] bg-amber-500'}`}
                            style={{ transitionDelay: '0ms' }}
                          >
                              {isPlaying && method==='smooth' && <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-emerald-400 font-bold whitespace-nowrap animate-fadeIn">Common Tone</div>}
                          </div>

                          {/* Voice 2: E -> A/F */}
                          <div 
                            className={`absolute top-1/2 w-4 h-4 rounded-full shadow-[0_0_15px_currentColor] transition-all duration-[1500ms] ease-in-out z-20 ${isPlaying ? (method === 'jump' ? 'left-[71%] bg-red-500' : 'left-[42%] bg-emerald-500') : 'left-[28%] bg-amber-500'}`}
                            style={{ transitionDelay: '100ms' }}
                          ></div>

                          {/* Voice 3: G -> C/A */}
                          <div 
                            className={`absolute top-1/2 w-4 h-4 rounded-full shadow-[0_0_15px_currentColor] transition-all duration-[1500ms] ease-in-out z-20 ${isPlaying ? (method === 'jump' ? 'left-[100%] bg-red-500' : 'left-[71%] bg-emerald-500') : 'left-[57%] bg-amber-500'}`}
                            style={{ transitionDelay: '200ms' }}
                          ></div>

                          {/* Connector Lines (Trails) */}
                          <svg className="absolute inset-0 w-full h-full pointer-events-none">
                              {/* Simple horizontal lines can be rendered here if needed, but css transition on dots is cleaner */}
                          </svg>
                      </div>
                  </div>
                  
                  <div className="flex justify-between text-[10px] font-mono text-stone-500 mt-2 uppercase">
                      <span>C4</span>
                      <span>E4</span>
                      <span>G4</span>
                      <span>C5</span>
                  </div>
              </div>
          </div>

          {/* Controls */}
          <div className="grid md:grid-cols-2 gap-6">
              <button 
                onClick={() => playProgression('jump')}
                className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 relative overflow-hidden group ${
                    method === 'jump' 
                    ? 'border-red-500 bg-red-50 shadow-lg' 
                    : 'border-stone-200 bg-white hover:border-red-300'
                }`}
              >
                  <div className="flex justify-between items-center mb-2 relative z-10">
                      <h3 className="text-xl font-bold text-stone-900">错误示范：平行跳跃 (Jumping)</h3>
                      <Shuffle className={`transition-colors ${method==='jump' ? 'text-red-500' : 'text-stone-300'}`} />
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed relative z-10">
                      所有手指都大幅度向右移动。就像搬家时把所有家具都搬到新房子，费力且笨重。这在和声学中通常被视为“糟糕的连接”，因为它破坏了声部的独立性。
                  </p>
                  {method === 'jump' && <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500 animate-pulse"></div>}
              </button>

              <button 
                onClick={() => playProgression('smooth')}
                className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 relative overflow-hidden group ${
                    method === 'smooth' 
                    ? 'border-emerald-500 bg-emerald-50 shadow-lg' 
                    : 'border-stone-200 bg-white hover:border-emerald-300'
                }`}
              >
                  <div className="flex justify-between items-center mb-2 relative z-10">
                      <h3 className="text-xl font-bold text-stone-900">正确示范：平滑连接 (Smooth)</h3>
                      <Minimize2 className={`transition-colors ${method==='smooth' ? 'text-emerald-500' : 'text-stone-300'}`} />
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed relative z-10">
                      <strong>共同音保持 (Common Tone)</strong>：C 音不动。其他两个音只移动最近的距离（E→F, G→A）。这种连接听起来如丝般顺滑，像液体一样流动。
                  </p>
                  {method === 'smooth' && <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 animate-pulse"></div>}
              </button>
          </div>
      </div>

      {/* Deep Dive */}
      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <GripHorizontal className="text-indigo-500" />
                  为什么要“懒惰”？
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  这不仅仅是为了省力。
              </p>
              <ul className="list-disc pl-4 text-sm text-stone-600 space-y-2">
                  <li><strong>听觉惯性：</strong> 人耳喜欢听到声音之间有逻辑的联系。平滑的连接让和弦变化听起来是“变形”而不是“断裂”。</li>
                  <li><strong>可唱性：</strong> 声部连接最初源于合唱。让一个男低音瞬间跳跃 5 度（Jump）远比让他只唱半音（Smooth）要难得多。</li>
              </ul>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Route className="text-amber-500" />
                  最近路径原则
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                  想象你要去超市。你会选择直线距离最近的路，还是绕远路？音乐也是如此。
                  <br/><br/>
                  当和声进行时，每个音符都在寻找它的<strong>最近邻居</strong>。C 和弦里的 G，看到 F 和弦里的 A 就在隔壁（大二度），它就会自然地滑过去，而不是跳到老远的 C 去。
              </p>
          </div>
      </div>
    </div>
  );
};

export default VoiceLeadingLesson;
