
import React, { useState, useRef } from 'react';
import { Palette, Play, Sun, Moon, Info, Music2, Sparkles } from 'lucide-react';

const ModesLesson: React.FC = () => {
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Parallel modes on C for clear comparison
  // Brightness Order: Lydian > Ionian > Mixolydian > Dorian > Aeolian > Phrygian > Locrian
  const modes = [
    { 
      id: 'lydian', 
      name: 'Lydian', 
      label: '利底亚', 
      brightness: 100,
      color: 'bg-yellow-400', 
      textColor: 'text-yellow-700',
      desc: '比大调更明亮、梦幻、神奇。常用于电影中表达奇迹或太空场景。', 
      characteristic: '升四级音 (#4)',
      charIndex: 3, // Index in the notes array
      notes: [261.6, 293.7, 329.6, 370.0, 392.0, 440.0, 493.9, 523.3] // C D E F# G A B C
    }, 
    { 
      id: 'ionian', 
      name: 'Ionian', 
      label: '自然大调 (Major)', 
      brightness: 80,
      color: 'bg-amber-500', 
      textColor: 'text-amber-800',
      desc: '快乐、稳定、标准。这是我们最熟悉的“Do Re Mi”。', 
      characteristic: '基准 (Reference)',
      charIndex: -1,
      notes: [261.6, 293.7, 329.6, 349.2, 392.0, 440.0, 493.9, 523.3] // C D E F G A B C
    }, 
    { 
      id: 'mixolydian', 
      name: 'Mixolydian', 
      label: '混合利底亚', 
      brightness: 60,
      color: 'bg-orange-500', 
      textColor: 'text-orange-800',
      desc: '酷、布鲁斯感、摇滚。大调的明亮中带有一丝离经叛道。', 
      characteristic: '降七级音 (b7)',
      charIndex: 6,
      notes: [261.6, 293.7, 329.6, 349.2, 392.0, 440.0, 466.2, 523.3] // C D E F G A Bb C
    }, 
    { 
      id: 'dorian', 
      name: 'Dorian', 
      label: '多利安', 
      brightness: 40,
      color: 'bg-purple-500', 
      textColor: 'text-purple-200',
      desc: '爵士、感伤但不悲惨。比小调更“明亮”一点。', 
      characteristic: '还原六级音 (Nat 6)',
      charIndex: 5,
      notes: [261.6, 293.7, 311.1, 349.2, 392.0, 440.0, 466.2, 523.3] // C D Eb F G A Bb C
    }, 
    { 
      id: 'aeolian', 
      name: 'Aeolian', 
      label: '自然小调 (Minor)', 
      brightness: 20,
      color: 'bg-indigo-600', 
      textColor: 'text-indigo-200',
      desc: '悲伤、严肃、深沉。标准的悲伤色彩。', 
      characteristic: '降六级音 (b6)',
      charIndex: 5,
      notes: [261.6, 293.7, 311.1, 349.2, 392.0, 415.3, 466.2, 523.3] // C D Eb F G Ab Bb C
    }, 
    { 
      id: 'phrygian', 
      name: 'Phrygian', 
      label: '弗里几亚', 
      brightness: 0,
      color: 'bg-rose-900', 
      textColor: 'text-rose-200',
      desc: '异域风情、西班牙风格、黑暗、压抑。', 
      characteristic: '降二级音 (b2)',
      charIndex: 1,
      notes: [261.6, 277.2, 311.1, 349.2, 392.0, 415.3, 466.2, 523.3] // C Db Eb F G Ab Bb C
    }, 
  ];

  const currentMode = modes.find(m => m.id === activeMode) || modes[1]; // Default Ionian

  const playMode = (mode: typeof modes[0]) => {
    setActiveMode(mode.id);
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    // Visual animation sync
    const duration = 0.4;

    mode.notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + i * duration;

        osc.frequency.value = freq;
        osc.type = 'triangle';
        osc.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration + 0.1);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.2);
    });
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 3</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            教会调式 <span className="text-stone-300 font-light">|</span> Musical Modes
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
           如果说大调和小调是黑白照片，那么调式就是彩色滤镜。通过稍微改变音阶中的一个音，我们就能瞬间从“快乐”切换到“梦幻”或“异域”。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-200 overflow-hidden animate-slideUp stagger-1 flex flex-col lg:flex-row min-h-[600px]">
          
          {/* LEFT: Mode Selector List */}
          <div className="lg:w-1/3 bg-stone-50 border-r border-stone-100 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-3">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 px-2">Select a Mode</h3>
              {modes.map((mode) => (
                  <button 
                    key={mode.id}
                    onClick={() => playMode(mode)}
                    className={`relative p-4 rounded-2xl text-left transition-all duration-300 group overflow-hidden ${
                        activeMode === mode.id 
                        ? `${mode.color} text-white shadow-lg scale-[1.02]` 
                        : 'bg-white border border-stone-200 hover:border-stone-300 hover:shadow-md'
                    }`}
                  >
                      <div className="flex justify-between items-center relative z-10">
                          <div>
                              <div className={`font-bold text-lg ${activeMode === mode.id ? 'text-white' : 'text-stone-800'}`}>{mode.name}</div>
                              <div className={`text-xs font-medium ${activeMode === mode.id ? 'text-white/80' : 'text-stone-400'}`}>{mode.label}</div>
                          </div>
                          {activeMode === mode.id ? <Play size={20} fill="currentColor" /> : <Music2 size={18} className="text-stone-300" />}
                      </div>
                      
                      {/* Brightness Bar Mini */}
                      <div className="mt-3 h-1 w-full bg-black/10 rounded-full overflow-hidden">
                          <div className={`h-full bg-current opacity-50`} style={{ width: `${mode.brightness}%` }}></div>
                      </div>
                  </button>
              ))}
          </div>

          {/* RIGHT: Detailed Visualization */}
          <div className="lg:w-2/3 p-8 md:p-12 flex flex-col relative">
              {/* Background Glow */}
              <div className={`absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 pointer-events-none transition-colors duration-700 ${currentMode.color}`}></div>

              {/* 1. Header Info */}
              <div className="mb-12 relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-4xl font-serif font-bold transition-colors duration-300 text-stone-900`}>
                          {currentMode.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${currentMode.color} bg-opacity-20 text-stone-600`}>
                          {currentMode.brightness > 50 ? 'Major Family' : 'Minor Family'}
                      </span>
                  </div>
                  <p className="text-lg text-stone-600 leading-relaxed max-w-lg transition-all duration-300">
                      {currentMode.desc}
                  </p>
              </div>

              {/* 2. Scale Visualizer */}
              <div className="flex-1 flex flex-col justify-center mb-12">
                  <div className="relative h-32 flex items-center justify-between px-4">
                      {/* Connection Line */}
                      <div className="absolute left-4 right-4 h-0.5 bg-stone-200 top-1/2 -translate-y-1/2 -z-10"></div>
                      
                      {currentMode.notes.map((_, i) => {
                          const isChar = i === currentMode.charIndex;
                          // Don't show last note (octave) as separate distinctive step usually, but keeping 8 notes is fine for scale
                          return (
                              <div key={i} className="relative group">
                                  <div 
                                    className={`w-4 h-4 rounded-full transition-all duration-500 ${
                                        isChar 
                                        ? `${currentMode.color} scale-150 ring-4 ring-white shadow-lg z-20` 
                                        : 'bg-stone-300'
                                    }`}
                                  ></div>
                                  
                                  {/* Note Label */}
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-mono font-bold text-stone-400">
                                      {i+1}
                                  </div>

                                  {/* Characteristic Label */}
                                  {isChar && (
                                      <div className={`absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm animate-bounce-gentle bg-white border border-stone-100 text-stone-800`}>
                                          {currentMode.characteristic}
                                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white transform rotate-45 border-t border-l border-stone-100"></div>
                                      </div>
                                  )}
                              </div>
                          )
                      })}
                  </div>
                  <p className="text-center text-xs text-stone-400 font-medium mt-2">
                      <Sparkles size={12} className="inline mr-1 text-amber-500"/>
                      Highlight shows the distinctive note
                  </p>
              </div>

              {/* 3. Brightness Spectrum Meter */}
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
                  <div className="flex justify-between text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
                      <span className="flex items-center gap-1"><Moon size={14}/> Dark (Darkest)</span>
                      <span className="flex items-center gap-1">Bright (Brightest) <Sun size={14}/></span>
                  </div>
                  
                  <div className="relative h-4 bg-stone-200 rounded-full overflow-hidden">
                      {/* Gradient Background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-stone-800 via-stone-400 to-yellow-400 opacity-30"></div>
                      
                      {/* Indicator */}
                      <div 
                        className="absolute top-0 h-full w-2 bg-stone-900 shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all duration-700 ease-out"
                        style={{ left: `${currentMode.brightness}%` }}
                      ></div>
                  </div>
                  
                  <div className="flex justify-between mt-2 text-[10px] font-mono text-stone-400">
                      <span>Phrygian</span>
                      <span>Aeolian</span>
                      <span>Dorian</span>
                      <span>Mixolydian</span>
                      <span>Ionian</span>
                      <span>Lydian</span>
                  </div>
              </div>

          </div>
      </div>
      
      {/* Detailed Explanation Section */}
      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2 text-xl">
                  <Palette className="text-amber-500" />
                  听觉指南：亮度的秘密
              </h3>
              <p className="text-stone-600 leading-relaxed text-sm mb-4">
                 音乐的“亮度”取决于大音程的数量，特别是三度、六度和七度。
              </p>
              <ul className="space-y-3 text-sm text-stone-600">
                  <li className="flex gap-3 items-start">
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold text-xs shrink-0 mt-0.5">Lydian</span>
                      <span>最亮。因为它把一般大调中的第4级音升高了（#4）。这个升号产生了一种想往上飞的浮力。</span>
                  </li>
                  <li className="flex gap-3 items-start">
                      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold text-xs shrink-0 mt-0.5">Dorian</span>
                      <span>中性偏亮。它是小调（有小三度），但它有一个还原的六级音（大六度）。这让它听起来既有小调的深沉，又没有那么悲伤，充满希望。</span>
                  </li>
                  <li className="flex gap-3 items-start">
                      <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold text-xs shrink-0 mt-0.5">Phrygian</span>
                      <span>最暗。因为它的一开始就是半音（b2）。这种压抑的开头营造出强烈的紧张感和异域色彩。</span>
                  </li>
              </ul>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2 text-xl">
                  <Info className="text-indigo-500" />
                  如何记忆？
              </h3>
              <p className="text-stone-600 leading-relaxed text-sm mb-4">
                 不要死记硬背每个音。试着把它们看作是“大调”或“小调”的变体：
              </p>
              <div className="space-y-4">
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                      <div className="text-xs font-bold text-stone-400 uppercase mb-2">Major Family (大调家族)</div>
                      <div className="text-sm font-mono text-stone-700 space-y-1">
                          <div>Lydian = Major + <span className="text-yellow-600 font-bold">#4</span></div>
                          <div>Ionian = Major (Standard)</div>
                          <div>Mixolydian = Major + <span className="text-orange-600 font-bold">b7</span></div>
                      </div>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                      <div className="text-xs font-bold text-stone-400 uppercase mb-2">Minor Family (小调家族)</div>
                      <div className="text-sm font-mono text-stone-700 space-y-1">
                          <div>Dorian = Minor + <span className="text-purple-600 font-bold">#6</span> (Nat 6)</div>
                          <div>Aeolian = Minor (Standard)</div>
                          <div>Phrygian = Minor + <span className="text-rose-600 font-bold">b2</span></div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <style>{`
        .animate-bounce-gentle {
            animation: bounceGentle 2s infinite ease-in-out;
        }
        @keyframes bounceGentle {
            0%, 100% { transform: translate(-50%, 0); }
            50% { transform: translate(-50%, -5px); }
        }
      `}</style>
    </div>
  );
};

export default ModesLesson;
