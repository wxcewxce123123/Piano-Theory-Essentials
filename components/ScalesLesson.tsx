
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { ArrowRight, Ruler, TrendingUp, Music, ArrowLeftRight } from 'lucide-react';

const ScalesLesson: React.FC = () => {
  const [rootNoteIndex, setRootNoteIndex] = useState(0); // 0 = C
  const [scaleType, setScaleType] = useState<'major' | 'minor'>('major');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // --- Music Theory Data ---
  const ROOTS = [
    { label: 'C', idx: 0 }, { label: 'Db', idx: 1 }, { label: 'D', idx: 2 }, 
    { label: 'Eb', idx: 3 }, { label: 'E', idx: 4 }, { label: 'F', idx: 5 }, 
    { label: 'F#', idx: 6 }, { label: 'G', idx: 7 }, { label: 'Ab', idx: 8 }, 
    { label: 'A', idx: 9 }, { label: 'Bb', idx: 10 }, { label: 'B', idx: 11 }
  ];

  const CHROMATIC_NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  // Formulas (Semitones from root)
  const FORMULAS = {
      major: { 
          name: 'Major',
          intervals: [0, 2, 4, 5, 7, 9, 11, 12], 
          pattern: ['W', 'W', 'H', 'W', 'W', 'W', 'H'],
          mood: '明亮、开阔、积极 (Bright)',
          desc: '全 - 全 - 半 - 全 - 全 - 全 - 半'
      },
      minor: { 
          name: 'Minor',
          intervals: [0, 2, 3, 5, 7, 8, 10, 12], 
          pattern: ['W', 'H', 'W', 'W', 'H', 'W', 'W'],
          mood: '忧伤、内敛、柔和 (Melancholic)',
          desc: '全 - 半 - 全 - 全 - 半 - 全 - 全'
      }
  };

  // Generate Current Scale Data
  const activeScale = useMemo(() => {
      const formula = FORMULAS[scaleType];
      const rootBaseFreq = 261.63 * Math.pow(2, rootNoteIndex / 12); // Calculate root freq relative to C4
      
      const notes = formula.intervals.map((interval, i) => {
          const chromaticIndex = (rootNoteIndex + interval) % 12;
          const noteName = CHROMATIC_NOTES[chromaticIndex];
          
          // Calculate frequency
          const freq = rootBaseFreq * Math.pow(2, interval / 12);
          
          return {
              name: noteName,
              intervalFromRoot: interval,
              freq: freq,
              stepType: i > 0 ? formula.pattern[i-1] : null
          };
      });

      return {
          ...formula,
          rootLabel: ROOTS.find(r => r.idx === rootNoteIndex)?.label,
          notes
      };
  }, [rootNoteIndex, scaleType]);

  const playScale = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setActiveIndex(-1);
    
    // Scroll to start if needed
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
    
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    activeScale.notes.forEach((note, index) => {
      const startTime = ctx.currentTime + index * 0.4;
      
      // Schedule visual update
      setTimeout(() => setActiveIndex(index), index * 400);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.frequency.value = note.freq;
      osc.type = 'triangle';
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
      
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });

    setTimeout(() => {
        setIsPlaying(false);
        setActiveIndex(-1);
    }, activeScale.notes.length * 400);
  };

  return (
    <div className="space-y-8">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 3</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-4">
            音阶 <span className="text-stone-300 font-light">|</span> Scales
        </h2>
        <p className="text-lg text-stone-600 font-light max-w-2xl">
          选择一个根音，观察全音与半音如何构建出音乐的DNA。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-stone-200 overflow-hidden animate-slideUp stagger-1 flex flex-col">
        
        {/* 1. Top Controls: Root & Type */}
        <div className="bg-stone-50 border-b border-stone-100 p-4 md:p-6 flex flex-col gap-4">
            {/* Root Note Scroller */}
            <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2 mask-linear-fade">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest shrink-0">Root:</span>
                {ROOTS.map((r) => (
                    <button
                        key={r.idx}
                        onClick={() => { setRootNoteIndex(r.idx); setIsPlaying(false); setActiveIndex(-1); }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                            rootNoteIndex === r.idx 
                            ? 'bg-stone-900 text-white shadow-lg scale-110' 
                            : 'bg-white border border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-600'
                        }`}
                    >
                        {r.label}
                    </button>
                ))}
            </div>

            {/* Type Toggle & Info */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-3 rounded-2xl border border-stone-100 shadow-sm">
                <div className="flex bg-stone-100 p-1 rounded-xl relative w-full md:w-auto">
                    <button 
                        onClick={() => { setScaleType('major'); setIsPlaying(false); setActiveIndex(-1); }}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold text-sm transition-all duration-300 z-10 ${scaleType === 'major' ? 'bg-white text-amber-600 shadow-md' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        大调 (Major)
                    </button>
                    <button 
                        onClick={() => { setScaleType('minor'); setIsPlaying(false); setActiveIndex(-1); }}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold text-sm transition-all duration-300 z-10 ${scaleType === 'minor' ? 'bg-white text-indigo-600 shadow-md' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        小调 (Minor)
                    </button>
                </div>
                
                <div className="text-right flex-1 hidden md:block">
                    <div className={`font-bold transition-colors ${scaleType === 'major' ? 'text-amber-600' : 'text-indigo-600'}`}>
                        {activeScale.rootLabel} {activeScale.name}
                    </div>
                    <div className="text-xs text-stone-400 font-mono mt-0.5">{activeScale.desc}</div>
                </div>
            </div>
        </div>

        {/* 2. Middle: Staircase Visualization (Scrollable) */}
        <div 
            ref={scrollContainerRef}
            className="relative h-[280px] w-full bg-white overflow-x-auto custom-scrollbar scroll-smooth"
        >
            {/* 
               Changes for narrow screens: 
               1. Removed 'min-w-[600px]'. 
               2. Added 'w-max mx-auto' to ensure it takes required width (doesn't wrap) and centers if space allows. 
               3. If it overflows, it aligns left so start isn't clipped. 
            */}
            <div className="h-full flex items-end px-4 md:px-8 pb-10 pt-12 relative w-max mx-auto">
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: 'linear-gradient(to top, #000 1px, transparent 1px)', backgroundSize: '100% 20px' }}>
                </div>

                <div className="flex items-end gap-1 md:gap-2">
                    {activeScale.notes.map((note, i) => {
                        // Visual Height: Base + Semitones * Step
                        const barHeight = 40 + note.intervalFromRoot * 12; 
                        const isActive = activeIndex === i;
                        const interval = note.stepType;

                        return (
                            <React.Fragment key={i}>
                                {/* Connector (Interval Label) */}
                                {interval && (
                                    <div className="flex flex-col justify-end items-center pb-4 w-6 md:w-12 relative group">
                                        <div className={`h-1 w-full rounded-full mb-1 transition-colors ${interval === 'W' ? 'bg-stone-200' : 'bg-red-200'}`}></div>
                                        <span className={`text-[9px] md:text-[10px] font-bold px-1 md:px-1.5 rounded ${interval === 'W' ? 'text-stone-400' : 'bg-red-50 text-red-500'}`}>
                                            {interval === 'W' ? '全' : '半'}
                                        </span>
                                    </div>
                                )}

                                {/* Note Column */}
                                <div className="flex flex-col items-center group relative">
                                    {/* The Bar - Slightly narrower on mobile (w-9) */}
                                    <div 
                                        className={`
                                            w-9 md:w-14 rounded-t-xl transition-all duration-300 relative border-x border-t flex flex-col justify-end items-center pb-2
                                            ${isActive 
                                                ? (scaleType === 'major' ? 'bg-gradient-to-b from-amber-400 to-amber-500 border-amber-600 shadow-lg translate-y-[-4px]' : 'bg-gradient-to-b from-indigo-400 to-indigo-500 border-indigo-600 shadow-lg translate-y-[-4px]')
                                                : 'bg-gradient-to-b from-white to-stone-50 border-stone-200 hover:bg-stone-50'
                                            }
                                        `}
                                        style={{ height: `${barHeight}px` }}
                                    >
                                        <div className={`font-bold text-sm md:text-base transition-colors ${isActive ? 'text-white' : 'text-stone-400 group-hover:text-stone-600'}`}>
                                            {note.name}
                                        </div>
                                    </div>
                                    
                                    {/* Bouncing Ball */}
                                    {isActive && (
                                        <div className="absolute -top-8 w-6 h-6 rounded-full bg-stone-900 border-2 border-white shadow-xl animate-bounce-short z-20"></div>
                                    )}
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* 3. Bottom: Play Action (Piano Removed) */}
        <div className="bg-stone-50 border-t border-stone-200 relative p-6 flex justify-center z-10">
             <button 
                onClick={playScale}
                className={`flex items-center gap-3 px-12 py-3 rounded-full font-bold text-lg shadow-xl transition-all transform active:scale-95 ${
                    isPlaying 
                    ? 'bg-stone-200 text-stone-400 cursor-default' 
                    : (scaleType === 'major' ? 'bg-stone-900 text-white hover:bg-stone-800' : 'bg-stone-900 text-white hover:bg-stone-800')
                }`}
             >
                 {isPlaying ? '播放中...' : '聆听音阶'} <ArrowRight size={18} />
             </button>
        </div>
      </div>

      {/* Theory Content */}
      <div className="grid md:grid-cols-2 gap-6 animate-slideUp stagger-2">
         <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm card-hover">
            <h3 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
                <Ruler className="text-amber-500" size={20} />
                大调公式：全全半，全全全半
            </h3>
            <p className="text-stone-500 text-sm mb-4 leading-relaxed">
                这是大调音阶的通用密码。无论你从哪个键（根音）开始，只要按照这个步数走，就能弹出大调。
            </p>
            <div className="flex gap-2 text-xs">
                <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded border border-stone-200">W = Whole (全音)</span>
                <span className="bg-red-50 text-red-500 px-2 py-1 rounded border border-red-100">H = Half (半音)</span>
            </div>
         </div>

         <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm card-hover">
            <h3 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
                <TrendingUp className="text-indigo-500" size={20} />
                自然小调 vs 大调
            </h3>
            <p className="text-stone-500 text-sm leading-relaxed mb-3">
                观察上方的阶梯，你会发现小调的<strong>第三级音</strong>离主音更近（小三度）。这种“压低”的色彩是忧伤感的来源。
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-400 bg-stone-50 px-3 py-2 rounded-lg">
                <ArrowLeftRight size={12}/>
                <span>尝试切换大/小调，观察第三级台阶的高度变化。</span>
            </div>
         </div>
      </div>

      <style>{`
        @keyframes bounce-short {
            0%, 100% { transform: translateY(0); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
            50% { transform: translateY(-10px); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
        }
        .animate-bounce-short {
            animation: bounce-short 0.5s infinite;
        }
        .mask-linear-fade {
            mask-image: linear-gradient(to right, transparent, black 10px, black 90%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, black 10px, black 90%, transparent);
        }
      `}</style>
    </div>
  );
};

export default ScalesLesson;
