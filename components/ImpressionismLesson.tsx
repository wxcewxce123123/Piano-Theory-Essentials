import React, { useState, useRef, useEffect } from 'react';
import { CloudFog, Play, Palette, Sun } from 'lucide-react';

const ImpressionismLesson: React.FC = () => {
  const [scaleType, setScaleType] = useState<'major' | 'wholeTone'>('major');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // C Major: C D E F G A B C
  const majorFreqs = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
  
  // C Whole Tone: C D E F# G# A# C
  const wholeToneFreqs = [261.63, 293.66, 329.63, 369.99, 415.30, 466.16, 523.25];

  const playSequence = () => {
    setIsPlaying(true);
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const freqs = scaleType === 'major' ? majorFreqs : wholeToneFreqs;
    const duration = scaleType === 'major' ? 0.3 : 0.4; // Whole tone slightly slower/dreamier

    freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.frequency.value = freq;
        osc.type = 'triangle'; // Soft tone
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        const startTime = ctx.currentTime + i * duration;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration + 1.5); // Long release for impressionism
        
        osc.start(startTime);
        osc.stop(startTime + duration + 1.6);
    });

    // Reset visual
    setTimeout(() => setIsPlaying(false), freqs.length * duration * 1000 + 1000);
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-stone-900 text-stone-100 rounded-full text-xs font-bold tracking-wider uppercase mb-3 shadow-lg">Level 5 - Master Class</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            印象主义 <span className="text-stone-300 font-light">|</span> Impressionism
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          德彪西 (Debussy) 想要描绘光影的模糊边界，而不是物体的清晰轮廓。他抛弃了指向性明确的大调音阶，拥抱了漂浮不定的全音阶。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className={`rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden animate-slideUp stagger-1 transition-all duration-1000 border border-stone-200 ${scaleType === 'major' ? 'bg-sky-50' : 'bg-teal-900'}`}>
          
          {/* Background Visuals */}
          <div className="absolute inset-0 transition-opacity duration-1000">
              {/* Major: Clear, crisp shapes */}
              <div className={`absolute inset-0 ${scaleType === 'major' ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-400 rounded-full blur-sm opacity-50"></div>
                  <div className="absolute bottom-20 left-20 w-full h-px bg-sky-300"></div>
                  <div className="absolute top-1/2 right-1/4 w-20 h-20 border-4 border-sky-400 transform rotate-45 opacity-30"></div>
              </div>

              {/* Whole Tone: Blurry, water-like */}
              <div className={`absolute inset-0 ${scaleType === 'wholeTone' ? 'opacity-100' : 'opacity-0'}`}>
                  {/* Ripples */}
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-emerald-900 to-indigo-950"></div>
                  <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px] ${isPlaying ? 'animate-pulse-slow' : ''}`}></div>
                  <div className="absolute top-20 right-20 w-20 h-20 bg-pink-400/30 rounded-full blur-[40px]"></div>
                  <div className="absolute bottom-10 left-10 w-32 h-32 bg-indigo-400/20 rounded-full blur-[60px]"></div>
              </div>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center min-h-[400px] gap-12">
              
              {/* Visualization Circle */}
              <div className="relative">
                  <div className={`w-48 h-48 rounded-full flex items-center justify-center border-4 transition-all duration-700 ${scaleType === 'major' ? 'border-sky-500 bg-white shadow-xl' : 'border-emerald-400/50 bg-white/10 backdrop-blur-md shadow-[0_0_50px_rgba(52,211,153,0.3)]'}`}>
                      {scaleType === 'major' ? (
                          <Sun size={64} className="text-yellow-500 animate-spin-slow" />
                      ) : (
                          <CloudFog size={64} className="text-emerald-200 animate-pulse" />
                      )}
                  </div>
                  
                  {/* Floating Notes */}
                  {isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center">
                          {Array.from({length: 6}).map((_, i) => (
                              <div 
                                key={i}
                                className={`absolute w-4 h-4 rounded-full ${scaleType === 'major' ? 'bg-sky-500' : 'bg-emerald-400 blur-sm'}`}
                                style={{
                                    transform: `rotate(${i * 60}deg) translate(120px)`,
                                    animation: `orbit 3s linear infinite`,
                                    animationDelay: `${i * 0.2}s`
                                }}
                              ></div>
                          ))}
                      </div>
                  )}
              </div>

              {/* Controls */}
              <div className="flex bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
                  <button 
                    onClick={() => { setScaleType('major'); setIsPlaying(false); }}
                    className={`px-8 py-3 rounded-xl font-bold transition-all ${scaleType === 'major' ? 'bg-white text-sky-700 shadow-lg' : 'text-stone-400 hover:text-white'}`}
                  >
                      大调 (明确)
                  </button>
                  <button 
                    onClick={() => { setScaleType('wholeTone'); setIsPlaying(false); }}
                    className={`px-8 py-3 rounded-xl font-bold transition-all ${scaleType === 'wholeTone' ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/50 shadow-lg' : 'text-stone-400 hover:text-white'}`}
                  >
                      全音阶 (朦胧)
                  </button>
              </div>

              <button 
                onClick={playSequence}
                className={`flex items-center gap-3 px-10 py-4 rounded-full font-bold transition-all active:scale-95 shadow-xl ${
                    scaleType === 'major' 
                    ? 'bg-sky-600 text-white hover:bg-sky-500' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-500 ring-4 ring-emerald-900/50'
                }`}
              >
                  <Play fill="currentColor" />
                  <span>{isPlaying ? 'Dreaming...' : 'Play Scale'}</span>
              </button>

          </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Palette className="text-amber-500" />
                  全音阶 (Whole Tone Scale)
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                  大调音阶里有“半音”（E-F, B-C），这些半音就像引力，让音乐有方向感（想要回家）。
                  <br/><br/>
                  全音阶剔除了所有半音，每个音之间的距离都是全音。结果就是：<strong>没有引力，没有中心，没有家</strong>。音乐像是在太空中漂浮。
              </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <CloudFog className="text-indigo-500" />
                  听觉意象
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                  想象莫奈的《睡莲》或者伦敦的雾。你看不清具体的线条，只看到光影的色彩在流动。这就是印象派音乐追求的境界。
              </p>
          </div>
      </div>

      <style>{`
        @keyframes orbit {
            0% { opacity: 0; transform: rotate(0deg) translateX(80px) scale(0.5); }
            50% { opacity: 1; transform: rotate(180deg) translateX(120px) scale(1); }
            100% { opacity: 0; transform: rotate(360deg) translateX(80px) scale(0.5); }
        }
        .animate-pulse-slow {
            animation: pulseSlow 4s infinite ease-in-out;
        }
        @keyframes pulseSlow {
            0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.4; transform: translate(-50%, -50%) scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default ImpressionismLesson;