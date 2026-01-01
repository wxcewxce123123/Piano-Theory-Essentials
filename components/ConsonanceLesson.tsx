import React, { useState, useRef, useEffect } from 'react';
import { Ear, Activity, Volume2, TriangleAlert } from 'lucide-react';

const ConsonanceLesson: React.FC = () => {
  const [activeInterval, setActiveInterval] = useState<string>('unison');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  
  // Base frequency C4
  const baseFreq = 261.63;

  const intervals = [
    { id: 'unison', name: '纯一度 (Unison)', ratio: '1:1', freq: baseFreq, type: 'consonant', desc: '完全融合，像一个声音' },
    { id: 'octave', name: '纯八度 (Octave)', ratio: '2:1', freq: baseFreq * 2, type: 'consonant', desc: '完美的和谐，频率刚好翻倍' },
    { id: 'fifth', name: '纯五度 (Perfect 5th)', ratio: '3:2', freq: baseFreq * 1.5, type: 'consonant', desc: '非常稳定，强有力的支撑' },
    { id: 'major2', name: '大二度 (Major 2nd)', ratio: '9:8', freq: baseFreq * 1.122, type: 'dissonant', desc: '有颗粒感，轻微的摩擦' },
    { id: 'tritone', name: '三全音 (Tritone)', ratio: '45:32', freq: baseFreq * 1.414, type: 'dissonant', desc: '极度不稳定，魔鬼音程' },
  ];

  const stopAudio = () => {
      oscillatorsRef.current.forEach(osc => {
          try { osc.stop(); } catch(e) {}
      });
      oscillatorsRef.current = [];
      setIsPlaying(false);
  };

  const playSound = (intervalId: string) => {
      stopAudio(); // Stop previous
      setActiveInterval(intervalId);
      setIsPlaying(true);

      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const selected = intervals.find(i => i.id === intervalId)!;
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.value = baseFreq;
      osc2.frequency.value = selected.freq;
      
      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);

      osc1.start();
      osc2.start();
      
      oscillatorsRef.current = [osc1, osc2];
  };

  // Draw Waveform Logic
  const WaveVisualizer = ({ interval }: { interval: typeof intervals[0] }) => {
      const points = [];
      const width = 600;
      const height = 100;
      
      // We simulate the composite wave
      for(let x=0; x<=width; x++) {
          const t = x * 0.05;
          // Wave 1 (Base)
          const y1 = Math.sin(t);
          // Wave 2 (Interval) - ratio determines freq relative to base
          const ratioVal = interval.freq / baseFreq;
          const y2 = Math.sin(t * ratioVal);
          
          const compositeY = (y1 + y2) * 20 + 50; // Scale and center
          points.push(`${x},${compositeY}`);
      }

      return (
          <div className="w-full h-full overflow-hidden">
              <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                  {/* Grid */}
                  <line x1="0" y1="50" x2={width} y2="50" stroke="#e5e7eb" strokeWidth="1" />
                  
                  {/* The Wave */}
                  <polyline 
                    points={points.join(' ')} 
                    fill="none" 
                    stroke={interval.type === 'consonant' ? '#3b82f6' : '#ef4444'} 
                    strokeWidth="3"
                    className="drop-shadow-md"
                  />
              </svg>
          </div>
      )
  };

  const current = intervals.find(i => i.id === activeInterval)!;

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 3</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            协和与不协和 <span className="text-stone-300 font-light">|</span> Consonance
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          为什么有的音在一起像拥抱，有的像打架？这是一场关于频率比例的物理游戏。
        </p>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-stone-200 overflow-hidden animate-slideUp stagger-1 flex flex-col md:flex-row min-h-[500px]">
          
          {/* Controls Panel */}
          <div className="md:w-1/3 bg-stone-50 border-r border-stone-100 p-8 flex flex-col gap-3">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Select Interval</h3>
              {intervals.map((int) => (
                  <button 
                    key={int.id}
                    onClick={() => playSound(int.id)}
                    className={`p-4 rounded-xl text-left transition-all duration-300 border ${
                        activeInterval === int.id 
                        ? (int.type === 'consonant' ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-md' : 'bg-red-50 border-red-200 text-red-900 shadow-md')
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-white hover:border-stone-300 hover:shadow-sm'
                    }`}
                  >
                      <div className="flex justify-between items-center mb-1">
                          <span className="font-bold">{int.name}</span>
                          {int.type === 'consonant' 
                             ? <Activity size={16} className="text-blue-400" />
                             : <TriangleAlert size={16} className="text-red-400" />
                          }
                      </div>
                      <div className="text-xs opacity-60 font-mono">Ratio {int.ratio}</div>
                  </button>
              ))}
              <div className="mt-auto">
                  <button 
                    onClick={stopAudio} 
                    className="w-full py-3 rounded-lg border border-stone-300 text-stone-500 font-bold hover:bg-stone-200 transition-colors"
                  >
                      Stop Sound
                  </button>
              </div>
          </div>

          {/* Visualization Panel */}
          <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center relative bg-white">
              {/* Info Header */}
              <div className="text-center mb-10 z-10">
                  <h3 className={`text-4xl font-bold mb-2 transition-colors ${current.type === 'consonant' ? 'text-blue-600' : 'text-red-600'}`}>
                      {current.type === 'consonant' ? 'Consonant (协和)' : 'Dissonant (不协和)'}
                  </h3>
                  <p className="text-stone-500 text-lg">{current.desc}</p>
              </div>

              {/* Wave Window */}
              <div className="w-full h-48 bg-stone-50 rounded-2xl border border-stone-200 relative overflow-hidden flex items-center shadow-inner">
                  <div className="absolute top-2 left-4 text-xs font-bold text-stone-400 uppercase">Composite Waveform</div>
                  <WaveVisualizer interval={current} />
                  {/* Animation Overlay for playing state */}
                  {!isPlaying && (
                      <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
                          <button onClick={() => playSound(activeInterval)} className="bg-stone-900 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
                              <Volume2 size={18} /> Play Tone
                          </button>
                      </div>
                  )}
              </div>

              {/* Physics Explanation */}
              <div className="mt-8 grid grid-cols-2 gap-8 w-full">
                  <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                      <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Physics</div>
                      <p className="text-sm text-stone-600 leading-relaxed">
                          {current.type === 'consonant' 
                            ? "因为频率比例简单（如 2:1 或 3:2），波峰和波谷经常重合，产生稳定、平滑的周期性图案。"
                            : "频率比例复杂（如 45:32），波形很难对齐。耳朵会听到快速的振幅波动，这种现象叫“拍音”(Beats)，感觉像粗糙的沙纸。"
                          }
                      </p>
                  </div>
                  <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                      <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Feeling</div>
                      <p className="text-sm text-stone-600 leading-relaxed">
                          {current.type === 'consonant' 
                            ? "像回家一样。不需要移动，不需要解决。它给你一种休息、结束的感觉。"
                            : "像悬在半空。它制造紧张感，迫使音乐想要“动”起来，去寻找下一个协和音程。"
                          }
                      </p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ConsonanceLesson;