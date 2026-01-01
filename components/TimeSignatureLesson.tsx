
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Zap, ArrowRight, Divide } from 'lucide-react';

const TimeSignatureLesson: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [meter, setMeter] = useState<'4/4' | '6/8'>('4/4');
  const [activeBeat, setActiveBeat] = useState(-1);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  const tempo = meter === '4/4' ? 600 : 300; 

  const ensureAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playTone = (frequency: number, type: 'strong' | 'medium' | 'weak') => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = 'sine';

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    const volume = type === 'strong' ? 0.7 : (type === 'medium' ? 0.4 : 0.2);
    const decay = type === 'strong' ? 0.2 : 0.1;

    gain.gain.linearRampToValueAtTime(volume, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + decay);

    osc.start(now);
    osc.stop(now + decay + 0.1);
  };

  const tick = useCallback(() => {
    setActiveBeat(prev => {
      const totalBeats = meter === '4/4' ? 4 : 6;
      const nextBeat = prev === -1 ? 0 : (prev + 1) % totalBeats;
      
      let freq = 440;
      let type: 'strong' | 'medium' | 'weak' = 'weak';

      if (meter === '4/4') {
        if (nextBeat === 0) { freq = 880; type = 'strong'; } 
        else if (nextBeat === 2) { freq = 550; type = 'medium'; }
      } else {
        if (nextBeat === 0) { freq = 880; type = 'strong'; } 
        else if (nextBeat === 3) { freq = 660; type = 'medium'; }
      }

      playTone(freq, type);
      return nextBeat;
    });
  }, [meter]);

  useEffect(() => {
    if (isPlaying) {
      if (activeBeat === -1) tick();
      timerRef.current = window.setInterval(tick, tempo);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setActiveBeat(-1);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, tempo, tick]);

  const togglePlay = () => {
      ensureAudioContext();
      setIsPlaying(!isPlaying);
  };

  const changeMeter = (m: '4/4' | '6/8') => {
    setMeter(m);
    setIsPlaying(false);
    setActiveBeat(-1);
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 1 - Foundations</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            节拍与拍号 <span className="text-stone-300 font-light">|</span> Time Signatures
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          乐谱开头那两个叠在一起的数字，就像乐曲的“心跳代码”。
        </p>
      </header>

      {/* Simulator Card */}
      <div className="bg-[#1c1917] rounded-[2rem] p-8 md:p-12 shadow-2xl text-stone-50 overflow-hidden relative animate-slideUp stagger-1 flex flex-col md:flex-row gap-16 min-h-[500px]">
        
        {/* Left: Fraction Visualization */}
        <div className="md:w-1/3 flex flex-col justify-center items-center relative z-20">
            <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/10 w-full max-w-xs text-center">
                <div className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-4">拍号解码</div>
                <div className="flex flex-col items-center gap-2">
                    {/* Top Number */}
                    <div className="relative group cursor-help">
                        <span className="text-8xl font-black leading-none text-amber-500">{meter === '4/4' ? '4' : '6'}</span>
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 w-32 text-left opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto bg-black/80 p-2 rounded z-50">
                            <div className="text-xs font-bold text-amber-500">数量 (Quantity)</div>
                            <div className="text-[10px] text-stone-300">每小节有几拍</div>
                        </div>
                    </div>
                    
                    {/* Separator */}
                    <div className="w-16 h-1 bg-stone-600 rounded-full"></div>
                    
                    {/* Bottom Number */}
                    <div className="relative group cursor-help">
                        <span className="text-8xl font-black leading-none text-stone-300">{meter === '4/4' ? '4' : '8'}</span>
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 w-32 text-left opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto bg-black/80 p-2 rounded z-50">
                            <div className="text-xs font-bold text-stone-300">单位 (Unit)</div>
                            <div className="text-[10px] text-stone-400">以几分音符为一拍</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right: Interactive Visualizer */}
        <div className="flex-1 flex flex-col items-center justify-start gap-12 relative z-10 pt-4">
            
            {/* Visualizer Header - Buttons - Increased z-index and margin to prevent overlap */}
            <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-md relative z-30">
                <button
                onClick={() => changeMeter('4/4')}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${meter === '4/4' ? 'bg-amber-500 text-stone-900 shadow-lg' : 'text-stone-400 hover:text-white hover:bg-white/10'}`}
                >
                4/4 (单拍子)
                </button>
                <button
                onClick={() => changeMeter('6/8')}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${meter === '6/8' ? 'bg-amber-500 text-stone-900 shadow-lg' : 'text-stone-400 hover:text-white hover:bg-white/10'}`}
                >
                6/8 (复拍子)
                </button>
            </div>

            {/* Conducting Pattern Visual (Simplified) */}
            <div className="relative w-72 h-72 border border-white/5 rounded-full bg-black/20 flex items-center justify-center z-10">
                {meter === '4/4' ? (
                    // 4/4 Conducting Pattern points
                    <div className="relative w-full h-full">
                        <div className={`absolute top-10 left-1/2 w-4 h-4 rounded-full -ml-2 transition-all duration-200 ${activeBeat === 0 ? 'bg-amber-500 scale-150 shadow-[0_0_20px_#f59e0b]' : 'bg-stone-700'}`}></div> {/* 1 Down */}
                        <div className={`absolute top-1/2 left-10 w-4 h-4 rounded-full -mt-2 transition-all duration-200 ${activeBeat === 1 ? 'bg-stone-300 scale-125' : 'bg-stone-700'}`}></div> {/* 2 Left */}
                        <div className={`absolute top-1/2 right-10 w-4 h-4 rounded-full -mt-2 transition-all duration-200 ${activeBeat === 2 ? 'bg-stone-300 scale-125' : 'bg-stone-700'}`}></div> {/* 3 Right */}
                        <div className={`absolute bottom-16 left-1/2 w-4 h-4 rounded-full -ml-2 transition-all duration-200 ${activeBeat === 3 ? 'bg-stone-300 scale-125' : 'bg-stone-700'}`}></div> {/* 4 Up */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                            <path d="M 144 40 L 144 216 L 40 144 L 248 144 L 144 40" fill="none" stroke="white" strokeWidth="2" strokeDasharray="6 6"/>
                        </svg>
                    </div>
                ) : (
                    // 6/8 Grouping Visual
                    <div className="flex gap-8 items-center justify-center h-full">
                        {/* Group 1 */}
                        <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${activeBeat >= 0 && activeBeat < 3 ? 'border-amber-500 bg-amber-500/10 scale-110 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'border-stone-700 bg-black/20'}`}>
                            <div className={`text-3xl font-bold ${activeBeat >= 0 && activeBeat < 3 ? 'text-amber-500' : 'text-stone-600'}`}>1.</div>
                        </div>
                        {/* Group 2 */}
                        <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${activeBeat >= 3 ? 'border-amber-500 bg-amber-500/10 scale-110 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'border-stone-700 bg-black/20'}`}>
                            <div className={`text-3xl font-bold ${activeBeat >= 3 ? 'text-amber-500' : 'text-stone-600'}`}>2.</div>
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={togglePlay}
                className={`flex items-center gap-3 px-12 py-4 rounded-full font-bold text-lg transition-all duration-300 transform active:scale-95 z-20 ${
                isPlaying 
                    ? 'bg-stone-800 text-stone-400 border border-stone-600' 
                    : 'bg-white text-stone-900 hover:scale-105'
                }`}
            >
                {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
                {isPlaying ? 'Stop' : 'Start Metronome'}
            </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
          <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center">
            <span className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center mr-3 text-stone-600 font-mono text-lg font-black">4</span>
            关于分母 (The Bottom Number)
          </h3>
          <p className="text-stone-600 mb-4 text-sm leading-relaxed">
            下面的数字代表<strong>“单位”</strong>。就像货币单位（美元、欧元），它告诉我们数拍子时用哪种音符作为“1”。
          </p>
          <ul className="text-sm space-y-2 text-stone-500">
              <li className="flex items-center gap-2"><div className="w-6 font-bold text-stone-900 text-center">4</div> = 四分音符 (Quarter Note)</li>
              <li className="flex items-center gap-2"><div className="w-6 font-bold text-stone-900 text-center">8</div> = 八分音符 (Eighth Note)</li>
              <li className="flex items-center gap-2"><div className="w-6 font-bold text-stone-900 text-center">2</div> = 二分音符 (Half Note)</li>
          </ul>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
          <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center">
            <Zap className="mr-2 text-amber-500" />
            6/8 拍的秘密
          </h3>
          <p className="text-stone-600 mb-4 text-sm leading-relaxed">
            虽然数学上 3/4 和 6/8 都包含 6 个八分音符，但它们的<strong>重音分组</strong>完全不同。
          </p>
          <div className="flex gap-4 text-xs font-mono">
             <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
                 <div className="font-bold mb-1 text-stone-900">3/4 拍</div>
                 <div>[强 弱] [强 弱] [强 弱]</div>
                 <div className="text-stone-400">1 & 2 & 3 &</div>
             </div>
             <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                 <div className="font-bold mb-1 text-amber-900">6/8 拍</div>
                 <div>[强 弱 弱] [次强 弱 弱]</div>
                 <div className="text-amber-700/60">1 2 3 - 4 5 6</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSignatureLesson;
