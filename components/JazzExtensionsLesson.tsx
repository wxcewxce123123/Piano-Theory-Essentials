
import React, { useState, useRef } from 'react';
import { Layers, Music, Palette, Zap, AlertTriangle, Info } from 'lucide-react';

const JazzExtensionsLesson: React.FC = () => {
  const [extensions, setExtensions] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // C7 base: C E G Bb
  const baseChord = [
    { note: 'C', freq: 261.63 },
    { note: 'E', freq: 329.63 },
    { note: 'G', freq: 392.00 },
    { note: 'Bb', freq: 466.16 },
  ];

  // Extensions Data
  const availableExtensions = [
    { 
        id: '9', 
        note: 'D', 
        freq: 587.33, 
        label: '9th (九音)', 
        desc: '温暖、甜美、延展感。像给黑咖啡加了奶。',
        color: 'bg-rose-500', 
        shadow: 'shadow-rose-500/50',
        ring: 'ring-rose-200'
    }, 
    { 
        id: '#11', 
        note: 'F#', 
        freq: 739.99, 
        label: '#11th (升十一音)', 
        desc: '梦幻、漂浮、Lydian色彩。像加了神秘的香料。',
        color: 'bg-purple-500', 
        shadow: 'shadow-purple-500/50',
        ring: 'ring-purple-200'
    }, 
    { 
        id: '13', 
        note: 'A', 
        freq: 880.00, 
        label: '13th (十三音)', 
        desc: '都市、精致、圆满。像夜晚繁华的灯光。',
        color: 'bg-emerald-500', 
        shadow: 'shadow-emerald-500/50',
        ring: 'ring-emerald-200'
    }, 
  ];

  const toggleExtension = (id: string) => {
    setExtensions(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const playChord = () => {
    if (isPlaying) return;
    setIsPlaying(true);

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    
    // Combine base notes + selected extensions
    const notesToPlay = [
        ...baseChord.map(n => n.freq),
        ...availableExtensions.filter(e => extensions.includes(e.id)).map(e => e.freq)
    ];

    notesToPlay.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        // Complex waveform for richer "Jazz" piano-like tone
        const real = new Float32Array([0, 1, 0.2, 0.1, 0.05, 0.01]);
        const imag = new Float32Array([0, 0, 0, 0, 0, 0]);
        const wave = ctx.createPeriodicWave(real, imag);
        osc.setPeriodicWave(wave);
        
        // Low pass filter to mellow the sound (make it warm)
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2500;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        // Strum effect
        const startTime = now + i * 0.04;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2 / Math.sqrt(notesToPlay.length), startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 2.5);
        
        osc.start(startTime);
        osc.stop(startTime + 3.0);
    });

    setTimeout(() => setIsPlaying(false), 3000);
  };

  // Construct Chord Name
  const getChordName = () => {
      if (extensions.length === 0) return 'C7';
      const nums = extensions.map(e => e.replace('#','')); // simple logic
      const maxExt = Math.max(...nums.map(Number));
      
      let suffix = '';
      if (extensions.includes('#11')) suffix += '(#11)';
      
      // Simplified naming logic for demo
      if (maxExt === 13) return `C13${suffix.replace('(#11)','')}${extensions.includes('#11')?'(#11)':''}`;
      if (maxExt === 11) return `C7${suffix}`; // rare to just have #11 without 9 usually implied, but strictly C7#11
      if (maxExt === 9) return `C9${suffix}`;
      
      return 'C7...';
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 4</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            爵士扩展音 <span className="text-stone-300 font-light">|</span> Extensions
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          如果说七和弦是爵士乐的地基，那么 9、11、13 音就是摩天大楼的顶层景观。它们为和声增添了复杂的张力与色彩。
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-12 animate-slideUp stagger-1">
          
          {/* Left: The Visual Stack Builder */}
          <div className="flex-1 bg-stone-900 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden flex flex-col items-center justify-between min-h-[500px] shadow-2xl border border-stone-800">
              {/* Background Glows */}
              <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#555 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              {isPlaying && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-t from-amber-500/10 to-transparent animate-pulse-slow pointer-events-none"></div>
              )}

              {/* The Harmonic Stack Visual */}
              <div className="relative flex flex-col-reverse items-center gap-0 w-full max-w-xs z-10 flex-1 justify-center transition-all duration-500">
                  
                  {/* Base C7 */}
                  <div className="w-full p-6 bg-stone-800 rounded-2xl border-2 border-stone-700 text-center shadow-lg relative z-10 transition-all duration-500">
                      <div className="text-stone-500 text-[10px] font-bold uppercase tracking-widest mb-1">Foundation (1-3-5-b7)</div>
                      <div className="text-3xl font-bold text-stone-200">C7</div>
                      <div className="text-stone-600 text-xs mt-2 font-mono">Solid & Functional</div>
                  </div>

                  {/* Dynamic Extensions - Render ALL but animate presence */}
                  {availableExtensions.map((ext) => {
                      const isActive = extensions.includes(ext.id);
                      return (
                          <div 
                            key={ext.id}
                            className={`w-full flex flex-col items-center transition-all duration-500 ease-in-out overflow-hidden ${isActive ? 'max-h-32 opacity-100 translate-y-0 scale-100' : 'max-h-0 opacity-0 translate-y-10 scale-90'}`}
                          >
                              {/* Connector Line */}
                              <div className="h-4 w-0.5 bg-stone-700 shrink-0"></div>
                              
                              {/* The Block */}
                              <div className={`w-[90%] p-4 rounded-xl border-none text-center shadow-2xl relative ${ext.color} text-white shrink-0`}>
                                  <div className="font-bold text-xl flex items-center justify-center gap-2">
                                      {ext.label}
                                      {isPlaying && <Zap size={16} className="animate-bounce" fill="currentColor" />}
                                  </div>
                                  <div className="text-white/80 text-[10px] uppercase tracking-widest mt-1">Color Note</div>
                                  
                                  {/* Glow effect */}
                                  <div className={`absolute inset-0 rounded-xl ${ext.shadow} shadow-[0_0_30px_currentColor] opacity-40 animate-pulse`}></div>
                              </div>
                          </div>
                      )
                  })}
              </div>

              {/* Controls */}
              <div className="w-full z-20 mt-8">
                  <div className="flex justify-center gap-3 mb-8 flex-wrap">
                      {availableExtensions.map((ext) => {
                          const isActive = extensions.includes(ext.id);
                          return (
                              <button 
                                key={ext.id}
                                onClick={() => toggleExtension(ext.id)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 border-2 ${
                                    isActive 
                                    ? `${ext.color} border-transparent text-white shadow-lg scale-105` 
                                    : 'bg-stone-800 border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-200'
                                }`}
                              >
                                  + {ext.id}
                              </button>
                          )
                      })}
                  </div>

                  <button 
                    onClick={playChord}
                    disabled={isPlaying}
                    className={`w-full bg-white text-stone-900 font-bold py-4 rounded-xl shadow-xl hover:bg-stone-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${isPlaying ? 'opacity-80 cursor-default' : ''}`}
                  >
                      {isPlaying ? <Music className="animate-spin-slow" size={20}/> : <Music size={20} />}
                      <span className="text-lg">播放 {getChordName()}</span>
                  </button>
              </div>
          </div>

          {/* Right: Theory & Flavor */}
          <div className="lg:w-5/12 flex flex-col gap-6">
              
              {/* Flavor Profile */}
              <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
                  <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                      <Palette className="text-amber-500" />
                      和声调色盘
                  </h3>
                  <div className="space-y-4">
                      {availableExtensions.map((ext) => {
                          const isActive = extensions.includes(ext.id);
                          return (
                            <div key={ext.id} className={`group cursor-default transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                                <div className="flex items-baseline justify-between mb-1">
                                    <span className={`font-bold text-lg group-hover:${ext.color.replace('bg-', 'text-')} transition-colors`}>{ext.id}</span>
                                    <span className="text-xs text-stone-400 uppercase tracking-widest">{ext.label.split(' ')[0]}</span>
                                </div>
                                <p className="text-sm text-stone-600 leading-relaxed pl-4 border-l-2 border-stone-100 group-hover:border-amber-200 transition-colors">
                                    {ext.desc}
                                </p>
                            </div>
                          )
                      })}
                  </div>
              </div>

              {/* Deep Theory: Avoid Notes */}
              <div className="bg-gradient-to-br from-stone-50 to-white p-8 rounded-3xl border border-stone-200">
                  <h3 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="text-rose-500" size={20} />
                      为什么是 #11 而不是 11？
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed mb-4">
                      在大三和弦中，如果我们直接加 11 音 (F)，它会与大三音 (E) 形成尖锐的“小九度”冲突，听起来非常浑浊。这被称为<strong>“避音 (Avoid Note)”</strong>。
                  </p>
                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-stone-100 shadow-sm text-xs font-mono text-stone-700">
                      <div className="flex flex-col items-center">
                          <span className="text-rose-500 font-bold line-through decoration-2">F (11)</span>
                          <span className="text-[10px] text-stone-400">Avoid</span>
                      </div>
                      <span className="text-stone-300">→</span>
                      <div className="flex flex-col items-center">
                          <span className="text-purple-600 font-bold">F# (#11)</span>
                          <span className="text-[10px] text-stone-400">Lydian</span>
                      </div>
                      <span className="ml-auto text-stone-500 italic">升半音解决冲突！</span>
                  </div>
              </div>

          </div>
      </div>

      <style>{`
        .animate-spin-slow {
            animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default JazzExtensionsLesson;
