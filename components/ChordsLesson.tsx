
import React, { useRef, useState } from 'react';
import { Volume2, Music, CheckCircle2, AlertCircle, Layers, ArrowUp } from 'lucide-react';

const ChordsLesson: React.FC = () => {
  const [activeChord, setActiveChord] = useState<'major' | 'minor' | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Keyboard definition
  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const blackKeys = [
    { note: 'C#', left: '14.3%' }, 
    { note: 'Eb', left: '28.6%' }, 
    { note: 'F#', left: '57.1%' }, 
    { note: 'Ab', left: '71.4%' }, 
    { note: 'Bb', left: '85.7%' }
  ];

  const playChord = (type: 'major' | 'minor') => {
    setActiveChord(type);
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    
    const root = 261.63; // C4
    const fifth = 392.00; // G4
    const third = type === 'major' ? 329.63 : 311.13; // E4 vs Eb4

    // Staggered entrance for arpeggiated feel (visuals match audio)
    [root, third, fifth].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.frequency.value = f;
      osc.type = 'triangle'; 
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const startTime = now + i * 0.1; // Slight arpeggio
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.05); 
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 2.0); 
      
      osc.start(startTime);
      osc.stop(startTime + 2.1);
    });
  };

  const getActiveNotes = () => {
    if (activeChord === 'major') return ['C', 'E', 'G'];
    if (activeChord === 'minor') return ['C', 'Eb', 'G'];
    return [];
  };

  const activeNotes = getActiveNotes();

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 4</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            和弦 <span className="text-stone-300 font-light">|</span> Chords
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          和弦是音乐的骨架。最基本的是<strong>三和弦 (Triad)</strong>，它由三个音按“三度叠置”的方式堆积而成。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-200 overflow-hidden animate-slideUp stagger-1 flex flex-col lg:flex-row min-h-[500px]">
        
        {/* Left: The Construction Tower (Visual Metaphor) */}
        <div className="lg:w-5/12 bg-stone-50 border-b lg:border-b-0 lg:border-r border-stone-100 p-8 flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d6d3d1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Layers size={14} /> Chord Structure
            </h3>

            {/* The Tower */}
            <div className="flex flex-col-reverse gap-1 w-40">
                {/* Root */}
                <div className={`h-16 w-full rounded-xl border-2 flex items-center justify-center font-bold text-lg shadow-sm transition-all duration-500 z-10 ${activeChord ? 'bg-stone-800 border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-300'}`}>
                    Root (1)
                    <span className="absolute right-[-60px] text-xs text-stone-400 font-mono">C</span>
                </div>

                {/* Third (Variable) */}
                <div className={`w-full rounded-xl border-2 flex items-center justify-center font-bold text-lg shadow-sm transition-all duration-500 relative z-20 ${
                    activeChord === 'major' 
                    ? 'h-24 bg-amber-500 border-amber-500 text-white translate-y-0 opacity-100' 
                    : (activeChord === 'minor' ? 'h-16 bg-indigo-500 border-indigo-500 text-white translate-y-0 opacity-100' : 'h-20 bg-white border-stone-200 text-stone-300 opacity-50')
                }`}>
                    3rd
                    {activeChord && (
                        <div className="absolute left-[-90px] text-xs font-bold bg-white px-2 py-1 rounded shadow-sm border border-stone-100 flex items-center gap-1">
                            <ArrowUp size={12} />
                            {activeChord === 'major' ? '4 Semitones' : '3 Semitones'}
                        </div>
                    )}
                    <span className="absolute right-[-60px] text-xs text-stone-400 font-mono">{activeChord === 'major' ? 'E' : (activeChord === 'minor' ? 'Eb' : '?')}</span>
                </div>

                {/* Fifth */}
                <div className={`h-16 w-full rounded-xl border-2 flex items-center justify-center font-bold text-lg shadow-sm transition-all duration-500 z-30 ${activeChord ? 'bg-stone-700 border-stone-700 text-white' : 'bg-white border-stone-200 text-stone-300'}`}>
                    5th
                    <span className="absolute right-[-60px] text-xs text-stone-400 font-mono">G</span>
                </div>
            </div>
            
            <p className="mt-8 text-sm text-stone-500 text-center max-w-xs">
                {activeChord === 'major' && "大三度 (4个半音) 撑起了明亮的听感。"}
                {activeChord === 'minor' && "小三度 (3个半音) 压缩了空间，带来忧郁色彩。"}
                {!activeChord && "点击右侧按钮构建和弦"}
            </p>
        </div>

        {/* Right: Keyboard & Controls */}
        <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center bg-white relative">
           
           {/* Piano Visual */}
           <div className="relative w-full max-w-md h-40 bg-stone-900 rounded-xl p-1.5 shadow-2xl mb-12 select-none">
              <div className="relative w-full h-full bg-white rounded flex overflow-hidden">
                 {whiteKeys.map((note) => {
                    const isActive = activeNotes.includes(note);
                    return (
                        <div key={note} className={`flex-1 border-r border-stone-200 last:border-r-0 h-full flex items-end justify-center pb-3 relative z-0 transition-colors duration-200 ${isActive ? 'bg-amber-100' : 'bg-white'}`}>
                            {isActive && <div className={`w-3 h-3 rounded-full mb-2 animate-bounce ${activeChord==='major'?'bg-amber-500':'bg-indigo-500'}`}></div>}
                            <span className={`text-xs font-bold ${isActive ? 'text-stone-900' : 'text-stone-300'}`}>{note}</span>
                        </div>
                    )
                 })}
                 <div className="absolute inset-0 pointer-events-none z-10 w-full h-full">
                    {blackKeys.map((key) => {
                        const isActive = activeNotes.includes(key.note);
                        return (
                            <div key={key.note} className={`absolute top-0 w-[10%] h-[60%] rounded-b-md shadow-lg transition-all duration-200 border border-stone-800 border-t-0 ${isActive ? 'bg-indigo-500 translate-y-1' : 'bg-stone-800'}`} style={{ left: `calc(${key.left} - 5%)` }}></div>
                        )
                    })}
                 </div>
              </div>
           </div>

           {/* Controls */}
           <div className="grid grid-cols-2 gap-6 w-full max-w-md">
              <button 
                onClick={() => playChord('major')}
                className={`group relative p-6 rounded-3xl border-2 transition-all overflow-hidden ${
                  activeChord === 'major' 
                    ? 'border-amber-500 bg-amber-50 shadow-inner ring-2 ring-amber-200 ring-offset-2' 
                    : 'border-stone-200 bg-white hover:border-amber-300 hover:shadow-xl hover:-translate-y-1'
                }`}
              >
                 <div className="relative z-10 text-center">
                    <div className="text-4xl mb-2">☀️</div>
                    <div className="text-2xl font-bold text-stone-900 group-hover:text-amber-700">Major</div>
                    <div className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">大三和弦</div>
                 </div>
              </button>

              <button 
                onClick={() => playChord('minor')}
                className={`group relative p-6 rounded-3xl border-2 transition-all overflow-hidden ${
                  activeChord === 'minor' 
                    ? 'border-indigo-500 bg-indigo-50 shadow-inner ring-2 ring-indigo-200 ring-offset-2' 
                    : 'border-stone-200 bg-white hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1'
                }`}
              >
                 <div className="relative z-10 text-center">
                    <div className="text-4xl mb-2">🌧️</div>
                    <div className="text-2xl font-bold text-stone-900 group-hover:text-indigo-700">Minor</div>
                    <div className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">小三和弦</div>
                 </div>
              </button>
           </div>

        </div>
      </div>

      {/* Deep Dive Text */}
      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
         <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
            <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
               <Music className="text-amber-500" />
               三明治理论 (The Sandwich Analogy)
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed mb-4">
               想象和弦是一个三明治：
            </p>
            <ul className="space-y-3 text-sm text-stone-600">
               <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center font-bold text-xs shrink-0">1</span>
                  <span><strong>面包 (根音 & 五音)：</strong> 无论大三还是小三和弦，最底下和最上面的音都是一样的（纯五度框架）。它们提供了和弦的稳定性。</span>
               </li>
               <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                  <span><strong>馅料 (三音)：</strong> 决定味道的关键！如果是大三度（距离远），味道是明亮甜美的；如果是小三度（距离近），味道是阴郁咸涩的。</span>
               </li>
            </ul>
         </div>

         <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
            <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
               <CheckCircle2 className="text-indigo-500" />
               如何通过听觉分辨？
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed mb-4">
               不要去数音符，而是去捕捉<strong>“情感色彩”</strong>。
            </p>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <div className="text-amber-800 font-bold text-xs uppercase mb-1">Major Feeling</div>
                    <p className="text-amber-900/70 text-xs">早晨的阳光、开门、胜利、自信、快乐。</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <div className="text-indigo-800 font-bold text-xs uppercase mb-1">Minor Feeling</div>
                    <p className="text-indigo-900/70 text-xs">阴雨天、关门、神秘、悲伤、思考。</p>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ChordsLesson;
