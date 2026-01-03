
import React, { useState, useRef, useEffect } from 'react';
import { Radio, AudioWaveform, Sliders, BookOpen, Microscope, Atom, Activity, Zap } from 'lucide-react';

const SpectralismLesson: React.FC = () => {
  const [inharmonicity, setInharmonicity] = useState(0); // 0 (Harmonic) to 1 (Noisy)
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false); // Ref to track playing state synchronously for animation loop
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  // Fundamental C2 = 65.41 Hz
  const fundamental = 65.41;
  const numPartials = 24; 

  // Initialize Canvas Grid on Mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#1c1917'; // stone-900
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Initial Grid
            ctx.strokeStyle = '#292524'; // stone-800
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < canvas.width; i+=50) { ctx.moveTo(i,0); ctx.lineTo(i, canvas.height); }
            for (let i = 0; i < canvas.height; i+=50) { ctx.moveTo(0,i); ctx.lineTo(canvas.width, i); }
            ctx.stroke();
            
            // Baseline
            ctx.beginPath();
            ctx.moveTo(0, canvas.height - 2);
            ctx.lineTo(canvas.width, canvas.height - 2);
            ctx.strokeStyle = '#fcd34d';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
  }, []);

  const startSound = () => {
      if (isPlaying) return;
      
      // Update State and Ref
      setIsPlaying(true);
      isPlayingRef.current = true;

      if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      // Master Gain & Analyser
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.25; 
      
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096; 
      analyser.smoothingTimeConstant = 0.85;
      analyserRef.current = analyser;

      masterGain.connect(analyser);
      analyser.connect(ctx.destination);

      // Create additive oscillators
      oscillatorsRef.current = [];
      gainNodesRef.current = [];

      for (let i = 1; i <= numPartials; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.frequency.value = fundamental * i;
          osc.type = 'sine';
          
          // Amplitude roughly 1/n
          gain.gain.value = 1 / Math.pow(i, 0.8);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start();

          oscillatorsRef.current.push(osc);
          gainNodesRef.current.push(gain);
      }

      drawSpectrogram();
  };

  const stopSound = () => {
      if (audioCtxRef.current) {
          const now = audioCtxRef.current.currentTime;
          gainNodesRef.current.forEach(g => {
              g.gain.cancelScheduledValues(now);
              g.gain.setTargetAtTime(0, now, 0.05);
          });
          
          setTimeout(() => {
              oscillatorsRef.current.forEach(osc => osc.stop());
              oscillatorsRef.current = [];
              gainNodesRef.current = [];
              
              // Update State and Ref
              setIsPlaying(false);
              isPlayingRef.current = false;
              
              if (rafRef.current) cancelAnimationFrame(rafRef.current);
          }, 200);
      }
  };

  useEffect(() => {
      if (!isPlaying) return;
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      oscillatorsRef.current.forEach((osc, index) => {
          const n = index + 1; 
          const harmonicFreq = fundamental * n;
          
          // Physics Model: Stiff String / Bar Inharmonicity
          // Higher partials stretch further away from integer multiples
          const stretchFactor = 1 + (inharmonicity * 0.5 * (n * n * 0.01)); 
          const targetFreq = harmonicFreq * stretchFactor;
          
          osc.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.1);
      });
  }, [inharmonicity, isPlaying]);

  const drawSpectrogram = () => {
      if (!canvasRef.current || !analyserRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
          // Use Ref to check playing state to avoid closure staleness
          if (!isPlayingRef.current) return;
          
          rafRef.current = requestAnimationFrame(draw);
          analyserRef.current!.getByteFrequencyData(dataArray);

          // Dark background typical of analyzers
          ctx.fillStyle = '#1c1917'; // stone-900
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Grid Lines (Subtle)
          ctx.strokeStyle = '#292524'; // stone-800
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let i = 0; i < canvas.width; i+=50) { ctx.moveTo(i,0); ctx.lineTo(i, canvas.height); }
          for (let i = 0; i < canvas.height; i+=50) { ctx.moveTo(0,i); ctx.lineTo(canvas.width, i); }
          ctx.stroke();

          const barWidth = (canvas.width / bufferLength) * 20; 
          let x = 0;

          ctx.beginPath();
          ctx.moveTo(0, canvas.height);

          for (let i = 0; i < bufferLength; i++) {
              const v = dataArray[i] / 255.0; 
              const y = canvas.height - (v * canvas.height);

              if (x > canvas.width) break;
              ctx.lineTo(x, y);
              x += barWidth; 
          }
          
          ctx.lineTo(canvas.width, canvas.height);
          ctx.closePath();

          // Amber Gradient Fill (Classic Oscilloscope feel)
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, 'rgba(245, 158, 11, 0.1)'); // Amber-500 low alpha
          gradient.addColorStop(1, 'rgba(245, 158, 11, 0.8)'); // Amber-500 high alpha

          ctx.fillStyle = gradient;
          ctx.fill();
          
          // Crisp Top Line
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#fcd34d'; // Amber-300
          ctx.stroke();
      };
      draw();
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-stone-900 text-stone-100 rounded-full text-xs font-bold tracking-wider uppercase mb-3 shadow-lg flex items-center gap-2 w-fit">
            <Atom size={12} className="text-amber-400" />
            Level 5 - Master Class
        </div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            频谱主义 <span className="text-stone-300 font-light">|</span> Spectralism
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-3xl leading-relaxed">
          "和声就是垂直的音色，音色就是水平的和声。" —— Gérard Grisey
          <br/>
          欢迎来到声音的微观世界。在这里，我们不再编写旋律，而是雕刻声音内部的基因结构。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-stone-200 relative overflow-hidden animate-slideUp stagger-1 flex flex-col gap-10 max-w-4xl mx-auto">
          
          {/* Spectrogram Display */}
          <div className="relative w-full h-80 bg-stone-900 rounded-3xl border-4 border-stone-200 overflow-hidden shadow-inner group">
              <canvas ref={canvasRef} width={1200} height={400} className="w-full h-full opacity-90"></canvas>
              
              {/* Overlay HUD */}
              <div className="absolute top-4 left-6 flex items-center gap-4 opacity-70 pointer-events-none">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-amber-500 uppercase tracking-widest font-bold">
                      <Activity size={12} /> Spectrum Analysis
                  </div>
                  <div className="h-px w-12 bg-stone-700"></div>
                  <div className="text-[10px] font-mono text-stone-500 uppercase">
                      {isPlaying ? 'Processing' : 'Standby'}
                  </div>
              </div>

              {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm transition-all duration-300">
                      <button 
                        onClick={startSound} 
                        className="group relative px-8 py-4 bg-amber-500 text-white rounded-xl font-bold shadow-lg hover:bg-amber-600 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3"
                      >
                          <Zap fill="currentColor" />
                          <span>启动分析仪 (Activate)</span>
                      </button>
                  </div>
              )}
          </div>

          {/* Controls Section */}
          <div className="flex flex-col lg:flex-row gap-10 items-end">
              
              {/* Inharmonicity Slider */}
              <div className="flex-1 w-full bg-stone-50 p-8 rounded-3xl border border-stone-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <Microscope size={120} className="text-stone-900" />
                  </div>

                  <div className="relative z-10">
                      <div className="flex justify-between items-end mb-6">
                          <div>
                              <h3 className="text-stone-900 font-bold text-lg flex items-center gap-2 mb-1">
                                  <Sliders className="text-amber-500" size={20} />
                                  泛音失谐度 (Inharmonicity)
                              </h3>
                              <p className="text-stone-500 text-xs">调整泛音列的物理拉伸程度</p>
                          </div>
                          <span className={`text-sm font-mono px-3 py-1 rounded border ${inharmonicity === 0 ? 'text-stone-500 border-stone-200 bg-white' : 'text-amber-600 border-amber-200 bg-amber-50'}`}>
                              {(inharmonicity * 100).toFixed(0)}%
                          </span>
                      </div>
                      
                      <div className="relative h-12 flex items-center">
                          {/* Track Background */}
                          <div className="absolute w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                              <div className="h-full bg-stone-400" style={{ width: `${inharmonicity * 100}%` }}></div>
                          </div>
                          
                          <input 
                            type="range" 
                            min="0" max="1" step="0.001" 
                            value={inharmonicity}
                            onChange={(e) => setInharmonicity(parseFloat(e.target.value))}
                            disabled={!isPlaying}
                            className="absolute w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                          />
                          
                          {/* Custom Thumb Visual */}
                          <div 
                            className="absolute h-6 w-6 bg-white rounded-full shadow-md border-2 border-stone-300 pointer-events-none transition-transform duration-75 ease-out flex items-center justify-center"
                            style={{ left: `calc(${inharmonicity * 100}% - 12px)` }}
                          >
                              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          </div>
                      </div>

                      <div className="flex justify-between mt-4 text-[10px] text-stone-400 font-bold uppercase tracking-widest font-mono">
                          <div className="text-center">
                              <span className="block mb-1 text-stone-600">● Harmonic</span>
                              String / Voice
                          </div>
                          <div className="text-center transform translate-x-4">
                              <span className="block mb-1 text-stone-500">● Stretching</span>
                              Bell / Plate
                          </div>
                          <div className="text-center">
                              <span className="block mb-1 text-stone-400">● Chaotic</span>
                              Gong / Noise
                          </div>
                      </div>
                  </div>
              </div>

              {/* Stop Button */}
              {isPlaying && (
                  <button 
                    onClick={stopSound} 
                    className="h-20 px-8 bg-white border-2 border-stone-200 text-stone-500 hover:border-red-200 hover:text-red-500 hover:bg-red-50 rounded-2xl font-bold transition-all flex flex-col items-center justify-center gap-1 shrink-0 shadow-sm hover:shadow-md"
                  >
                      <span className="text-2xl">■</span>
                      <span className="text-[10px] uppercase tracking-widest">Stop</span>
                  </button>
              )}
          </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover relative overflow-hidden">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2 relative z-10">
                  <AudioWaveform className="text-amber-500" />
                  微观听觉 (Microscopic Listening)
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed relative z-10">
                  在频谱主义之前，音乐家关注的是音符之间的关系（音程）。频谱主义者则关注<strong>音符内部</strong>的世界。
                  <br/><br/>
                  就像牛顿用棱镜把白光分解成彩虹，频谱主义者用电脑分析声音的物理构成（泛音列），发现所谓的“音色”其实就是一种复杂的“和声”。
                  当你拖动上面的滑块时，你其实是在改变这个声音内部的 DNA。
              </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover relative overflow-hidden">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <BookOpen className="text-indigo-500" />
                  从自然到人工
              </h3>
              <ul className="space-y-4 text-sm text-stone-600 leading-relaxed">
                  <li className="flex gap-3">
                      <span className="text-emerald-600 font-bold shrink-0">0% (Harmonic)</span>
                      <span><strong>自然界：</strong> 琴弦、管乐、人声。泛音按整数倍排列 (1f, 2f, 3f...)，听起来和谐、纯净。</span>
                  </li>
                  <li className="flex gap-3">
                      <span className="text-amber-600 font-bold shrink-0">50%+ (Inharmonic)</span>
                      <span><strong>物理碰撞：</strong> 钟、锣、金属板。泛音被物理刚性“拉伸”了，不再是整数倍。这种微小的频率偏移（Beating）创造了那种闪烁、神秘、甚至恐怖的金属质感。</span>
                  </li>
              </ul>
          </div>
      </div>
    </div>
  );
};

export default SpectralismLesson;
