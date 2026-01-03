
import React, { useState, useRef, useEffect } from 'react';
import { Divide, MoveHorizontal, Play, Sliders, AlertTriangle } from 'lucide-react';

const MicrotonalityLesson: React.FC = () => {
  const [cents, setCents] = useState(0); // 0 to 100
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Base C4
  const c4 = 261.63;
  
  const playTone = () => {
      if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (isPlaying) {
          stopTone();
          return;
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth'; // Sawtooth rich in harmonics makes microtones clearer
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      
      osc.start();
      oscRef.current = osc;
      gainRef.current = gain;
      setIsPlaying(true);
      
      updatePitch(cents);
  };

  const stopTone = () => {
      if (oscRef.current) {
          gainRef.current?.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current!.currentTime + 0.1);
          oscRef.current.stop(audioCtxRef.current!.currentTime + 0.1);
          oscRef.current = null;
          setIsPlaying(false);
      }
  };

  const updatePitch = (c: number) => {
      if (oscRef.current) {
          // Formula: freq = base * 2^(cents / 1200)
          const freq = c4 * Math.pow(2, c / 1200);
          oscRef.current.frequency.setTargetAtTime(freq, audioCtxRef.current!.currentTime, 0.05);
      }
  };

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      setCents(val);
      updatePitch(val);
  };

  useEffect(() => {
      return () => stopTone();
  }, []);

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-stone-900 text-stone-100 rounded-full text-xs font-bold tracking-wider uppercase mb-3 shadow-lg">Level 5 - Master Class</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            微分音 <span className="text-stone-300 font-light">|</span> Microtonality
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          钢琴的缝隙里藏着宇宙。西方音乐将八度分为 12 份，但这只是人为的妥协。真正的物理泛音列包含着更复杂的频率比例。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-stone-200 animate-slideUp stagger-1 flex flex-col items-center relative overflow-hidden min-h-[400px] max-w-4xl mx-auto">
          
          <div className="absolute inset-0 bg-stone-50" style={{ backgroundImage: 'linear-gradient(90deg, #e5e7eb 1px, transparent 1px)', backgroundSize: '20px 100%' }}></div>

          <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
              
              {/* Keyboard Visual */}
              <div className="flex relative mb-12 shadow-2xl rounded-b-lg overflow-hidden">
                  <div className="w-24 h-64 bg-white border border-stone-300 rounded-bl-lg relative flex items-end justify-center pb-4 font-bold text-stone-400">C</div>
                  <div className="w-24 h-64 bg-white border border-stone-300 rounded-br-lg relative flex items-end justify-center pb-4 font-bold text-stone-400">D</div>
                  
                  {/* Black Key */}
                  <div className="absolute top-0 left-16 w-16 h-40 bg-stone-900 z-10 rounded-b-lg shadow-lg flex items-end justify-center pb-4 text-xs font-bold text-stone-500">C#</div>

                  {/* The Microtone Indicator */}
                  <div 
                    className="absolute top-0 w-1 h-full bg-amber-500 shadow-[0_0_15px_#f59e0b] z-20 transition-all duration-100"
                    style={{ left: `${(cents / 200) * 100}%` }} 
                  >
                      <div className="absolute bottom-0 transform -translate-x-1/2 translate-y-full bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full mt-2">
                          {cents}¢
                      </div>
                  </div>
              </div>

              {/* Slider Control */}
              <div className="w-full bg-stone-100 p-8 rounded-3xl border border-stone-200">
                  <div className="flex justify-between mb-4 font-bold text-stone-500 text-sm">
                      <span>C Natural (0¢)</span>
                      <span className={`${Math.abs(cents - 50) < 5 ? 'text-amber-600 scale-110' : ''} transition-all`}>
                          Quarter Tone (50¢)
                      </span>
                      <span>C# (100¢)</span>
                  </div>
                  
                  <input 
                    type="range" 
                    min="0" max="100" step="1"
                    value={cents}
                    onChange={handleSlider}
                    className="w-full h-4 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400"
                  />
                  
                  <div className="mt-6 text-center">
                      <p className="text-xs text-stone-500 mb-2 font-mono uppercase tracking-widest">Pitch Deviation</p>
                      <div className="text-4xl font-serif font-bold text-stone-800 tabular-nums">
                          + {cents} <span className="text-lg text-stone-400">cents</span>
                      </div>
                  </div>
              </div>

              <div className="flex gap-4 mt-8">
                  <button 
                    onClick={() => { setCents(50); updatePitch(50); if(!isPlaying) playTone(); }}
                    className="px-6 py-3 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 font-bold text-sm"
                  >
                      设置到 1/4 音 (50¢)
                  </button>
                  <button 
                    onClick={playTone}
                    className={`px-12 py-3 rounded-xl font-bold flex items-center gap-3 transition-all shadow-lg ${
                        isPlaying 
                        ? 'bg-amber-500 text-white animate-pulse' 
                        : 'bg-stone-900 text-white hover:scale-105'
                    }`}
                  >
                      {isPlaying ? <Sliders size={18} /> : <Play size={18} fill="currentColor" />}
                      {isPlaying ? '正在播放...' : '播放音高'}
                  </button>
              </div>

          </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Divide className="text-amber-500" />
                  什么是音分 (Cents)?
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  19世纪亚历山大·埃利斯发明了“音分”概念。我们将一个半音（比如 C 到 C#）的距离定义为 <strong>100 音分</strong>。
              </p>
              <div className="bg-stone-50 p-4 rounded-xl text-xs text-stone-500 border border-stone-100">
                  <strong>冷知识：</strong> 大多数人能分辨出 5-10 音分的音高差异。专业的调律师甚至能听到 1-2 音分的差别。
              </div>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-red-500" />
                  残酷的真相：钢琴是跑调的
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  根据物理学上的<strong>纯律 (Just Intonation)</strong>，完美的大三度（如 C-E）应该是频率比 5:4，对应 386 音分。
                  <br/><br/>
                  但在钢琴的<strong>十二平均律</strong>中，E 被定义为 400 音分。这意味着钢琴上的大三度永远比“完美”要宽 14 音分！我们之所以觉得好听，纯粹是因为我们的耳朵已经被这种“跑调”驯化了几百年。
              </p>
          </div>
      </div>
    </div>
  );
};

export default MicrotonalityLesson;
