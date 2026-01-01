import React, { useState, useRef } from 'react';
import { Disc, Music2 } from 'lucide-react';

const KeySignaturesLesson: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string>('C');
  const audioCtxRef = useRef<AudioContext | null>(null);

  const keys = [
    { note: 'C',  sharps: 0, angle: 0,   type: 'natural', label: 'C Major', accidentals: [] },
    { note: 'G',  sharps: 1, angle: 30,  type: 'sharp',   label: 'G Major', accidentals: ['F#'] },
    { note: 'D',  sharps: 2, angle: 60,  type: 'sharp',   label: 'D Major', accidentals: ['F#', 'C#'] },
    { note: 'A',  sharps: 3, angle: 90,  type: 'sharp',   label: 'A Major', accidentals: ['F#', 'C#', 'G#'] },
    { note: 'E',  sharps: 4, angle: 120, type: 'sharp',   label: 'E Major', accidentals: ['F#', 'C#', 'G#', 'D#'] },
    { note: 'B',  sharps: 5, angle: 150, type: 'sharp',   label: 'B Major', accidentals: ['F#', 'C#', 'G#', 'D#', 'A#'] },
    { note: 'F#', sharps: 6, angle: 180, type: 'sharp',   label: 'F# Major', accidentals: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'] },
    { note: 'Db', sharps: -5, angle: 210, type: 'flat',   label: 'Db Major', accidentals: ['Bb', 'Eb', 'Ab', 'Db', 'Gb'] },
    { note: 'Ab', sharps: -4, angle: 240, type: 'flat',   label: 'Ab Major', accidentals: ['Bb', 'Eb', 'Ab', 'Db'] },
    { note: 'Eb', sharps: -3, angle: 270, type: 'flat',   label: 'Eb Major', accidentals: ['Bb', 'Eb', 'Ab'] },
    { note: 'Bb', sharps: -2, angle: 300, type: 'flat',   label: 'Bb Major', accidentals: ['Bb', 'Eb'] },
    { note: 'F',  sharps: -1, angle: 330, type: 'flat',   label: 'F Major',  accidentals: ['Bb'] },
  ];

  const currentKey = keys.find(k => k.note === activeKey) || keys[0];

  const playChord = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    // Simple frequencies for demo (Root, Major 3rd, Perfect 5th) based roughly on key
    let baseFreq = 261.63; // C
    switch(activeKey) {
        case 'G': baseFreq = 392.00; break;
        case 'D': baseFreq = 293.66; break;
        case 'A': baseFreq = 220.00; break;
        case 'E': baseFreq = 329.63; break;
        case 'F': baseFreq = 349.23; break;
        case 'Bb': baseFreq = 233.08; break;
        case 'Eb': baseFreq = 311.13; break;
        default: baseFreq = 261.63;
    }

    [baseFreq, baseFreq * 1.2599, baseFreq * 1.4983].forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        osc.start(now);
        osc.stop(now + 1.6);
    });
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 3</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            调号与五度圈 <span className="text-stone-300 font-light">|</span> Key Signatures
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          乐谱开头的那些升降号，决定了音乐的“基地”。五度圈（Circle of Fifths）是破解它的地图。
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 animate-slideUp stagger-1">
          {/* Interactive Circle */}
          <div className="flex-1 bg-white rounded-[2.5rem] shadow-xl border border-stone-200 p-8 flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-stone-50/50 -z-10"></div>
             
             {/* The Wheel */}
             <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px]">
                {/* Connecting Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </svg>

                {keys.map((k) => {
                    const radius = 40; // percent
                    const x = 50 + radius * Math.sin(k.angle * Math.PI / 180);
                    const y = 50 - radius * Math.cos(k.angle * Math.PI / 180);
                    
                    const isActive = activeKey === k.note;

                    return (
                        <button
                            key={k.note}
                            onClick={() => { setActiveKey(k.note); playChord(); }}
                            className={`absolute w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-sm md:text-lg font-bold shadow-sm transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 ${
                                isActive 
                                ? 'bg-amber-500 text-white scale-110 shadow-lg shadow-amber-200 z-20' 
                                : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-300 hover:text-amber-600 z-10'
                            }`}
                            style={{ left: `${x}%`, top: `${y}%` }}
                        >
                            {k.note}
                        </button>
                    )
                })}

                {/* Center Hub */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full shadow-inner border border-stone-100 flex flex-col items-center justify-center text-center p-4 z-0">
                    <div className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">Current Key</div>
                    <div className="text-2xl font-serif font-bold text-amber-600">{currentKey.label}</div>
                    <div className="text-xs text-stone-500 mt-2 font-mono bg-stone-100 px-2 py-1 rounded">
                        {currentKey.sharps > 0 ? `${currentKey.sharps} Sharps (#)` : 
                         currentKey.sharps < 0 ? `${Math.abs(currentKey.sharps)} Flats (b)` : 'No Accidentals'}
                    </div>
                </div>
             </div>
          </div>

          {/* Details Panel */}
          <div className="lg:w-1/3 space-y-6">
              <div className="bg-stone-900 text-stone-100 p-8 rounded-3xl shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-[50px]"></div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                     <Disc size={20} className="text-amber-400" /> 
                     什么是五度圈？
                  </h3>
                  <p className="text-sm text-stone-400 leading-relaxed mb-4">
                     它是音乐的“时钟”。
                     <br/>
                     往右走（顺时针），每跨一步就是纯五度，并且<strong>增加一个升号 (#)</strong>。
                     <br/>
                     往左走（逆时针），每跨一步是纯四度，并且<strong>增加一个降号 (b)</strong>。
                  </p>
                  <div className="h-px bg-white/10 my-4"></div>
                  <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-widest text-stone-500">Key Signature for {currentKey.note}</div>
                      <div className="flex flex-wrap gap-2">
                          {currentKey.accidentals.length > 0 ? currentKey.accidentals.map(acc => (
                              <span key={acc} className="px-3 py-1 bg-white/10 rounded-lg font-mono font-bold text-amber-300 border border-white/5">
                                  {acc}
                              </span>
                          )) : (
                              <span className="text-stone-500 italic">Natural (C Major has no sharps/flats)</span>
                          )}
                      </div>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                  <h4 className="font-bold text-stone-800 mb-2">快速记忆法</h4>
                  <ul className="text-sm text-stone-600 space-y-2">
                      <li className="flex gap-2">
                          <span className="text-amber-500 font-bold">#</span>
                          <span>升号调：最后一个升号<strong>再升半音</strong>就是主音 (Do)。</span>
                      </li>
                      <li className="flex gap-2">
                          <span className="text-indigo-500 font-bold">b</span>
                          <span>降号调：<strong>倒数第二个</strong>降号就是主音 (Do)。</span>
                      </li>
                  </ul>
              </div>
          </div>
      </div>
    </div>
  );
};

export default KeySignaturesLesson;