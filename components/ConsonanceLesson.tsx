
import React, { useState, useRef, useEffect } from 'react';
import { Ear, Activity, Zap, Heart, AlertTriangle, Waves, Music2, Info } from 'lucide-react';

const ConsonanceLesson: React.FC = () => {
  const [activeInterval, setActiveInterval] = useState<string>('perfect5');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // Base frequency (C4)
  const BASE_FREQ = 261.63;

  const intervals = [
    { 
        id: 'unison', 
        name: '纯一度 (P1)', 
        ratio: 1, 
        freq: BASE_FREQ, 
        type: 'perfect', 
        color: '#3b82f6', // Blue
        desc: '两个完全相同的波形叠加，振幅翻倍。听起来像一个更响亮的声音，完美融合，毫无杂质。',
        notes: [0, 0] // Semitones from C4
    },
    { 
        id: 'octave', 
        name: '纯八度 (P8)', 
        ratio: 2, 
        freq: BASE_FREQ * 2, 
        type: 'perfect', 
        color: '#6366f1', // Indigo
        desc: '频率正好是2倍。高音的波峰每一次都能踩中低音的节奏。这种2:1的完美比例让它们听起来像是一家人。',
        notes: [0, 12]
    },
    { 
        id: 'perfect5', 
        name: '纯五度 (P5)', 
        ratio: 1.5, 
        freq: BASE_FREQ * 1.5, 
        type: 'perfect', 
        color: '#10b981', // Emerald
        desc: '3:2 的黄金比例。每3个高音波对应2个低音波，形成稳定的循环。它是和声中最坚固的支柱。',
        notes: [0, 7]
    },
    { 
        id: 'major3', 
        name: '大三度 (M3)', 
        ratio: 1.25, 
        freq: BASE_FREQ * 1.25, 
        type: 'consonant', 
        color: '#f59e0b', // Amber
        desc: '5:4 的比例。波形虽然复杂一些，但依然能形成规律的图案。听起来温暖、明亮、令人愉悦。',
        notes: [0, 4]
    },
    { 
        id: 'major2', 
        name: '大二度 (M2)', 
        ratio: 1.122, 
        freq: BASE_FREQ * 1.12246, 
        type: 'dissonant', 
        color: '#f43f5e', // Rose
        desc: '极不协和。两个频率太接近了，波形互相挤压、打架，产生了快速的“嗡嗡”声，这就是“拍音”(Beats)。',
        notes: [0, 2]
    },
    { 
        id: 'tritone', 
        name: '三全音 (Tritone)', 
        ratio: 1.414, // Approx sqrt(2)
        freq: BASE_FREQ * 1.4142, 
        type: 'dissonant', 
        color: '#ef4444', // Red
        desc: '“音乐中的魔鬼”。波形极其混乱，几乎找不到重复的规律。这种极度的不稳定性迫使耳朵渴望“解决”到协和音程。',
        notes: [0, 6]
    },
  ];

  const activeData = intervals.find(i => i.id === activeInterval)!;

  // --- Audio Engine ---
  const stopAudio = () => {
      oscillatorsRef.current.forEach(osc => {
          try { osc.stop(); osc.disconnect(); } catch(e) {}
      });
      oscillatorsRef.current = [];
      setIsPlaying(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const playSound = (intervalId: string) => {
      // If clicking same button, toggle off
      if (isPlaying && activeInterval === intervalId) {
          stopAudio();
          return;
      }

      stopAudio(); // Reset previous
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
      
      // Use sine waves for clearest demonstration of interference
      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.value = BASE_FREQ;
      osc2.frequency.value = selected.freq;
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
      
      osc1.start(now);
      osc2.start(now);
      
      oscillatorsRef.current = [osc1, osc2];

      drawWaveform();
  };

  // --- Visual Engine: Waveform Superposition ---
  const drawWaveform = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      
      // Animation state
      let time = 0;
      const speed = 4; // Scrolling speed

      const draw = () => {
          if (!isPlaying) return;
          
          ctx.clearRect(0, 0, width, height);
          
          // Background Grid
          ctx.beginPath();
          ctx.strokeStyle = '#e5e7eb';
          ctx.lineWidth = 1;
          for(let i=0; i<width; i+=50) { ctx.moveTo(i, 0); ctx.lineTo(i, height); }
          ctx.stroke();

          // 1. Draw Fundamental Wave (Ghost)
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
          ctx.lineWidth = 2;
          for (let x = 0; x < width; x++) {
              const t = (x + time) * 0.05;
              const y = centerY + Math.sin(t) * 40;
              if (x===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();

          // 2. Draw Interval Wave (Ghost)
          const ratio = activeData.ratio;
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
          for (let x = 0; x < width; x++) {
              const t = (x + time) * 0.05;
              const y = centerY + Math.sin(t * ratio) * 40;
              if (x===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();

          // 3. Draw RESULTANT Wave (The interference pattern)
          ctx.beginPath();
          
          // Gradient based on consonance type
          const gradient = ctx.createLinearGradient(0, 0, width, 0);
          gradient.addColorStop(0, activeData.color);
          gradient.addColorStop(1, activeData.type === 'dissonant' ? '#ef4444' : activeData.color);
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 4;
          
          // Add glow
          ctx.shadowBlur = 10;
          ctx.shadowColor = activeData.color;

          for (let x = 0; x < width; x++) {
              const t = (x + time) * 0.05;
              
              // Superposition: Wave 1 + Wave 2
              const y1 = Math.sin(t);
              const y2 = Math.sin(t * ratio);
              const sum = y1 + y2;
              
              // Scale to fit canvas
              const y = centerY + sum * 35; // 35 * 2 (max amp) = 70px height
              
              if (x===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
          
          // Reset shadow
          ctx.shadowBlur = 0;

          // 4. Visualization of "Beats" (Amplitude Envelope)
          if (activeData.type === 'dissonant') {
              // Draw an envelope line to show the beating pulsating
              ctx.beginPath();
              ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)'; // Red-ish
              ctx.lineWidth = 1;
              ctx.setLineDash([5, 5]);
              for (let x = 0; x < width; x++) {
                  const t = (x + time) * 0.05;
                  // Envelope approximation equation for beating: 2 * cos((f1-f2)/2 * t)
                  const beatFreq = Math.abs(1 - ratio) / 2; 
                  const env = Math.abs(Math.cos(t * beatFreq)) * 2 * 35; 
                  ctx.moveTo(x, centerY - env);
                  ctx.lineTo(x, centerY + env);
              }
              ctx.stroke();
              ctx.setLineDash([]);
          }

          time += speed;
          animationRef.current = requestAnimationFrame(draw);
      };
      
      draw();
  };

  useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas) {
          canvas.width = 800; // High resolution
          canvas.height = 300;
      }
      return () => stopAudio();
  }, []);

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 3 - Pitch Relationship</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            协和与不协和 <span className="text-stone-300 font-light">|</span> Consonance
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl leading-relaxed">
          为什么有的音在一起像拥抱，有的像争吵？<br/>
          这不仅仅是审美问题，更是<strong>物理现象</strong>。当两个声波的波峰能够周期性地重合时，我们感到协和；当它们互相干扰、产生“拍音”时，我们感到不协和。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="flex flex-col lg:flex-row gap-8 animate-slideUp stagger-1">
          
          {/* Left: Controls & Staff */}
          <div className="lg:w-1/3 flex flex-col gap-6">
              
              {/* Staff Visualization Card */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm relative overflow-hidden">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Music2 size={14}/> Notation View
                  </div>
                  
                  <div className="relative h-32 flex items-center justify-center">
                      {/* Staff Lines */}
                      <div className="absolute w-full space-y-3 opacity-20">
                          {[1,2,3,4,5].map(i => <div key={i} className="h-0.5 bg-stone-900 w-full"></div>)}
                      </div>
                      <div className="absolute left-4 font-serif text-4xl text-stone-400">𝄞</div>

                      {/* Notes */}
                      <div className="relative z-10 flex gap-4 transition-all duration-500">
                          {/* Root C4 (Fixed) */}
                          <div className="flex flex-col items-center">
                              <div className="w-6 h-4 bg-stone-900 rounded-[50%] relative top-[18px]"> {/* Manually adjusted for C4 pos */}
                                  <div className="absolute top-[50%] left-[-20%] right-[-20%] h-0.5 bg-stone-900"></div> {/* Ledger line */}
                              </div>
                              <div className="w-0.5 h-10 bg-stone-900 absolute top-[-10px] right-0"></div>
                          </div>

                          {/* Interval Note (Dynamic) */}
                          <div 
                            className="flex flex-col items-center transition-transform duration-500"
                            style={{ transform: `translateY(${-activeData.notes[1] * 5}px)` }} // 5px per semitone approx visual shift
                          >
                              <div className={`w-6 h-4 rounded-[50%] transition-colors duration-300 ${isPlaying ? activeData.color.replace('text','bg').replace('bg','bg') : 'bg-stone-900'}`} style={{ backgroundColor: isPlaying ? activeData.color : undefined }}></div>
                              <div className="w-0.5 h-10 bg-stone-900 absolute top-[-30px] left-0"></div>
                          </div>
                      </div>
                  </div>
                  <div className="text-center font-bold text-lg text-stone-800 transition-all key={activeData.name}">
                      {activeData.name}
                  </div>
              </div>

              {/* Interval Buttons */}
              <div className="bg-stone-50 rounded-3xl p-4 border border-stone-100 flex flex-col gap-2 h-full overflow-y-auto custom-scrollbar">
                  {intervals.map((int) => {
                      const isActive = activeInterval === int.id;
                      return (
                          <button 
                            key={int.id}
                            onClick={() => playSound(int.id)}
                            className={`w-full p-4 rounded-xl text-left transition-all duration-200 border-2 flex items-center justify-between group ${
                                isActive 
                                ? `bg-white border-${int.color.replace('#','')} shadow-md scale-[1.02]` 
                                : 'bg-white border-transparent hover:border-stone-200 hover:bg-stone-100'
                            }`}
                            style={{ borderColor: isActive ? int.color : undefined }}
                          >
                              <div className="flex items-center gap-3">
                                  <div 
                                    className={`w-3 h-3 rounded-full ${isActive ? 'animate-pulse' : 'opacity-50'}`}
                                    style={{ backgroundColor: int.color }}
                                  ></div>
                                  <span className={`font-bold ${isActive ? 'text-stone-900' : 'text-stone-500'}`}>{int.name}</span>
                              </div>
                              {isActive && isPlaying && <Activity size={16} className="text-stone-400 animate-pulse" />}
                          </button>
                      )
                  })}
              </div>
          </div>

          {/* Right: Wave Physics Visualization */}
          <div className="lg:w-2/3 bg-stone-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col border border-stone-800">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                      <div className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                          <Waves size={14}/> Physics Lab
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1" style={{ color: activeData.color }}>
                          {activeData.type === 'perfect' ? '完全协和 (Perfect)' : (activeData.type === 'consonant' ? '协和 (Consonant)' : '不协和 (Dissonant)')}
                      </h3>
                      <div className="text-stone-400 text-sm font-mono">
                          Frequency Ratio: <span className="text-white">{activeData.ratio} : 1</span>
                      </div>
                  </div>
                  
                  {isPlaying && (
                      <button onClick={stopAudio} className="bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors">
                          停止 (Stop)
                      </button>
                  )}
              </div>

              {/* The Oscilloscope Canvas */}
              <div className="flex-1 bg-black/50 rounded-2xl border border-stone-800 relative overflow-hidden shadow-inner">
                  <canvas 
                    ref={canvasRef} 
                    className="w-full h-full object-cover"
                  />
                  
                  {!isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                          <p className="text-stone-500 font-mono text-sm">点击左侧音程开始分析波形...</p>
                      </div>
                  )}
              </div>

              {/* Physics Explanation Text */}
              <div className="mt-6 p-4 bg-stone-800/50 rounded-xl border border-stone-700/50">
                  <p className="text-stone-300 text-sm leading-relaxed">
                      <Info size={14} className="inline mr-2 -mt-0.5 text-stone-500" />
                      {activeData.desc}
                  </p>
              </div>

          </div>
      </div>

      {/* Concept Cards */}
      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
          
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover group">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
                      <Heart size={20} />
                  </div>
                  协和的本质：简单比率
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  如果两个频率的比率是简单的整数比（如 2:1 或 3:2），它们的波形就会频繁地“对齐”。这种周期性的重合让大脑感到舒适和稳定。这就像两个舞者，虽然步幅不同，但每隔几步就能踩在同一个点上。
              </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover group">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <div className="p-2 bg-red-100 rounded-lg text-red-600 group-hover:scale-110 transition-transform">
                      <AlertTriangle size={20} />
                  </div>
                  不协和的本质：声波干涉
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  当频率比率变得复杂（如 45:32），波形很久才能对齐一次。更重要的是，相近的频率会产生<strong>拍音 (Beats)</strong> —— 声音忽大忽小的脉冲感。这种物理上的“粗糙感”会让耳朵感到紧张，从而产生“需要解决”的心理期待。
              </p>
          </div>

      </div>
    </div>
  );
};

export default ConsonanceLesson;
