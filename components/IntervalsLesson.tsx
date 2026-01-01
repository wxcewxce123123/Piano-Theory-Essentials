
import React, { useRef, useState } from 'react';
import { Ruler, Play, Music, ArrowRight, Info, CheckCircle2, Ear } from 'lucide-react';

const IntervalsLesson: React.FC = () => {
  const [activeInterval, setActiveInterval] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const intervals = [
    { semitones: 0, name: '纯一度', en: 'Perfect Unison', note: 'C', mnemonic: '同一音高', desc: '完全融合，如同一个声音。' },
    { semitones: 2, name: '大二度', en: 'Major 2nd', note: 'D', mnemonic: 'Happy Birthday', desc: '快乐、充满希望的开头 (Hap-py)。' },
    { semitones: 4, name: '大三度', en: 'Major 3rd', note: 'E', mnemonic: 'When the Saints', desc: '明亮、稳定，大和弦的基础 (Oh when...)。' },
    { semitones: 5, name: '纯四度', en: 'Perfect 4th', note: 'F', mnemonic: 'Wedding March', desc: '庄严、号角感 (Here comes...)。' },
    { semitones: 7, name: '纯五度', en: 'Perfect 5th', note: 'G', mnemonic: 'Star Wars / Twinkle', desc: '空灵、宏大、最稳定的支撑 (Twin-kle)。' },
    { semitones: 9, name: '大六度', en: 'Major 6th', note: 'A', mnemonic: 'My Bonnie', desc: '温暖、渴望、田园风格 (My Bon-nie)。' },
    { semitones: 11, name: '大七度', en: 'Major 7th', note: 'B', mnemonic: 'Take on Me (Chorus)', desc: '极度渴望解决到八度，梦幻而紧张。' },
    { semitones: 12, name: '纯八度', en: 'Perfect Octave', note: 'C', mnemonic: 'Over the Rainbow', desc: '完美的回归，包含一切 (Some-where)。' },
  ];

  const playInterval = (semitones: number) => {
    setActiveInterval(semitones);
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const baseFreq = 261.63; // C4
    const intervalFreq = baseFreq * Math.pow(2, semitones / 12);

    // Play Melodically (Sequentially) then Harmonically (Together)
    const playTone = (f: number, t: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = f;
        osc.type = 'triangle';
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.start(t);
        osc.stop(t + dur + 0.1);
    };

    // Note 1
    playTone(baseFreq, now, 0.4);
    // Note 2
    playTone(intervalFreq, now + 0.4, 0.4);
    // Chord (Both)
    playTone(baseFreq, now + 0.9, 0.8);
    playTone(intervalFreq, now + 0.9, 0.8);
  };

  const getNoteY = (semitones: number) => {
    // Map semitones to staff Y positions
    // C4(0)=160, D4(2)=150, E4(4)=140, F4(5)=130, G4(7)=120, A4(9)=110, B4(11)=100, C5(12)=90
    const map: Record<number, number> = { 0:160, 2:150, 4:140, 5:130, 7:120, 9:110, 11:100, 12:90 };
    return map[semitones] || 160;
  };

  const currentInterval = intervals.find(i => i.semitones === activeInterval);

  // Piano Key rendering helper
  const renderKeys = () => {
      const keys = [];
      const whiteKeys = [0, 2, 4, 5, 7, 9, 11, 12]; // Semitones indices for C Major scale
      
      for(let i=0; i<13; i++) { // C4 to C5
          const isWhite = whiteKeys.includes(i);
          if(!isWhite) continue; 
          
          // Calculate x position purely for visualization
          const keyIdx = whiteKeys.indexOf(i);
          const x = 40 + keyIdx * 35;
          const isActive = (activeInterval !== null && (i === 0 || i === activeInterval));
          const isTarget = activeInterval === i;

          keys.push(
              <g key={i}>
                  <rect 
                    x={x} y="220" width="35" height="100" 
                    fill={isActive ? (isTarget ? '#dbeafe' : '#fef3c7') : 'white'} 
                    stroke="#d6d3d1" 
                    className={`transition-colors duration-200 ${isActive ? 'stroke-stone-400' : ''}`}
                  />
                  {isActive && (
                      <circle cx={x + 17.5} cy="300" r="4" fill={isTarget ? '#3b82f6' : '#d97706'} className="animate-bounce-gentle" />
                  )}
                  <text x={x + 17.5} y="315" textAnchor="middle" fontSize="10" fill="#78716c" fontWeight="bold">
                      {i === 0 ? 'C' : (i === 12 ? 'C' : intervals.find(v => v.semitones === i)?.note)}
                  </text>
              </g>
          );
      }
      // Black keys visual only (simplified)
      const blackKeyIndices = [1, 3, 6, 8, 10]; // C#, Eb, F#, Ab, Bb relative pos
      const whiteKeyOffsets = [40, 75, 145, 180, 215]; // Approx positions
      
      const blackKeys = blackKeyIndices.map((k, idx) => (
          <rect key={`b${k}`} x={whiteKeyOffsets[idx] + 25} y="220" width="20" height="60" fill="#1c1917" className="pointer-events-none" />
      ));

      return [...keys, ...blackKeys];
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 3</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            音程 <span className="text-stone-300 font-light">|</span> Intervals
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          音程是两个音符之间的“距离”。就像测量身高用厘米，我们测量音高用“度数” (Degrees) 和“半音” (Semitones)。
        </p>
      </header>

      <div className="flex flex-col xl:flex-row gap-8 animate-slideUp stagger-1">
        
        {/* Left: Visualization Stage */}
        <div className="xl:w-5/12 bg-white rounded-[2.5rem] shadow-2xl border border-stone-200 overflow-hidden flex flex-col relative min-h-[500px]">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#a8a29e 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <div className="flex-1 relative flex flex-col items-center justify-center p-6">
                <svg width="340" height="340" viewBox="0 0 340 340" className="overflow-visible">
                    {/* Staff Lines */}
                    <g stroke="#d6d3d1" strokeWidth="2" strokeLinecap="round">
                        {[60, 80, 100, 120, 140].map(y => <line key={y} x1="20" y1={y} x2="320" y2={y} />)}
                    </g>
                    {/* Clef */}
                    <text x="20" y="135" fontSize="60" fontFamily="serif" fill="#78716c">🎼</text>

                    {/* Root Note (C4) - Fixed */}
                    <g>
                        <line x1="60" y1="160" x2="100" y2="160" stroke="#f59e0b" strokeWidth="2" /> {/* Ledger */}
                        <ellipse cx="80" cy="160" rx="10" ry="8" fill="#f59e0b" className="animate-pulse-soft" />
                        <line x1="90" y1="160" x2="90" y2="110" stroke="#f59e0b" strokeWidth="2" />
                        <text x="80" y="190" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#d97706">Root (1)</text>
                    </g>

                    {/* Target Note (Dynamic) */}
                    {activeInterval !== null && (
                        <g className="animate-pop-in">
                            {/* Ledger line for C5 */}
                            {activeInterval === 12 && <line x1="200" y1="90" x2="240" y2="90" stroke="#3b82f6" strokeWidth="2" opacity="0.5"/>}
                            
                            <ellipse cx="220" cy={getNoteY(activeInterval)} rx="10" ry="8" fill="#3b82f6" />
                            <line x1="210" y1={getNoteY(activeInterval)} x2="210" y2={getNoteY(activeInterval) + 50} stroke="#3b82f6" strokeWidth="2" />
                            <text x="220" y="190" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#2563eb">Target</text>

                            {/* Distance Bracket */}
                            <path 
                                d={`M 80 40 Q 150 10 220 40`} 
                                fill="none" stroke="#a8a29e" strokeWidth="2" strokeDasharray="4 4" 
                            />
                            <rect x="130" y="10" width="40" height="24" rx="12" fill="#a8a29e" />
                            <text x="150" y="26" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
                                {activeInterval} ST
                            </text>
                        </g>
                    )}

                    {/* Piano Keys Layer */}
                    {renderKeys()}
                </svg>
            </div>
            
            {/* Info Box */}
            <div className="bg-stone-50 border-t border-stone-200 p-6 min-h-[120px]">
                {currentInterval ? (
                    <div className="animate-fadeIn">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-2xl font-bold text-stone-900">{currentInterval.name}</h3>
                            <span className="text-stone-400 font-serif italic">{currentInterval.en}</span>
                        </div>
                        <p className="text-stone-600 text-sm leading-relaxed">{currentInterval.desc}</p>
                        <div className="mt-3 inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-bold text-indigo-600 shadow-sm">
                            <Music size={14} /> 记忆旋律: {currentInterval.mnemonic}
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-stone-400 py-4 flex flex-col items-center">
                        <Info className="mb-2 opacity-50" />
                        <p>点击右侧列表，探索不同的音程距离</p>
                    </div>
                )}
            </div>
        </div>

        {/* Right: Interactive List */}
        <div className="xl:w-7/12 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
            {intervals.map((int, i) => (
                <button
                    key={i}
                    onClick={() => playInterval(int.semitones)}
                    className={`relative p-5 rounded-2xl border text-left transition-all duration-200 group hover:shadow-md flex items-start gap-4 ${
                        activeInterval === int.semitones 
                        ? 'bg-stone-900 border-stone-900 text-white shadow-xl scale-[1.02]' 
                        : 'bg-white border-stone-200 text-stone-600 hover:border-amber-400'
                    }`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm transition-colors ${
                        activeInterval === int.semitones ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-400 group-hover:bg-amber-100 group-hover:text-amber-600'
                    }`}>
                        {activeInterval === int.semitones ? <Ear size={18} className="animate-pulse" /> : int.semitones}
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-lg">{int.name}</span>
                            {activeInterval === int.semitones && <ArrowRight size={16} className="text-amber-500" />}
                        </div>
                        <div className={`text-xs font-medium mb-2 ${activeInterval === int.semitones ? 'text-stone-400' : 'text-stone-400'}`}>
                            {int.en}
                        </div>
                        <div className={`text-xs p-2 rounded-lg inline-block w-full ${activeInterval === int.semitones ? 'bg-white/10 text-stone-300' : 'bg-stone-50 text-stone-500'}`}>
                            🎵 {int.mnemonic}
                        </div>
                    </div>
                </button>
            ))}
        </div>

      </div>

      {/* Detailed Theory Cards */}
      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Ruler className="text-amber-500" />
                  度数 vs 半音数
              </h3>
              <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
                  <p>
                      <strong>度数 (Degree)</strong> 是“名字”上的距离。C 到 E，数字母 C-D-E，一共3个，所以是三度。
                  </p>
                  <p>
                      <strong>半音数 (Semitones)</strong> 是“物理”上的距离。C 到 E 在钢琴上要走 4 步（C-C#-D-D#-E），这决定了它是“大”三度还是“小”三度。
                  </p>
                  <div className="flex gap-2 mt-2">
                      <span className="bg-stone-100 px-2 py-1 rounded text-xs font-mono">大三度 = 4 Semitones</span>
                      <span className="bg-stone-100 px-2 py-1 rounded text-xs font-mono">小三度 = 3 Semitones</span>
                  </div>
              </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-indigo-500" />
                  完全协和 vs 不完全协和
              </h3>
              <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
                  <p>
                      <strong>纯 (Perfect) 音程</strong>：1度、4度、5度、8度。它们听起来非常空灵、纯净、没有杂质，像骨架一样支撑音乐。
                  </p>
                  <p>
                      <strong>大/小 (Major/Minor) 音程</strong>：3度、6度。它们听起来色彩丰富、有情感（快乐或悲伤），像肌肉和皮肤一样丰满音乐。
                  </p>
              </div>
          </div>
      </div>

      <style>{`
        .animate-bounce-gentle {
            animation: bounceGentle 2s infinite ease-in-out;
        }
        @keyframes bounceGentle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
        }
        .animate-pop-in {
            animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            opacity: 0;
            transform-origin: center;
        }
        @keyframes popIn {
            from { opacity: 0; transform: scale(0.8) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default IntervalsLesson;
