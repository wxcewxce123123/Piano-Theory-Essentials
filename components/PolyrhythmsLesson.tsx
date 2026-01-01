
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Zap, Activity } from 'lucide-react';

const PolyrhythmsLesson: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [ratio, setRatio] = useState<[number, number]>([2, 3]);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  const lastBeatRef = useRef<{[key: number]: number}>({1: -1, 2: -1});

  // Cycle Duration in seconds
  const cycleDuration = 4;

  const setupAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playTone = (pitch: 'high' | 'low') => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // High = Outer Ring (Amber), Low = Inner Ring (Indigo)
    osc.frequency.value = pitch === 'high' ? 523.25 : 329.63; // C5 vs E4
    osc.type = 'sine';

    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.start(now);
    osc.stop(now + 0.25);
  };

  const playSyncTone = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    // Sync tone (Low C3)
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = 130.81; 
    osc.type = 'triangle';

    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.start(now);
    osc.stop(now + 0.6);
  };

  const animate = (time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const elapsed = (time - startTimeRef.current) / 1000; 
    const progress = (elapsed % cycleDuration) / cycleDuration;
    
    const r1 = ratio[0]; // Outer (Amber)
    const r2 = ratio[1]; // Inner (Indigo)

    const angle1 = (progress * r1 * 360) % 360;
    const angle2 = (progress * r2 * 360) % 360;

    const dot1 = document.getElementById('poly-dot-1');
    const dot2 = document.getElementById('poly-dot-2');
    
    // Rotate dots
    if (dot1) dot1.setAttribute('transform', `rotate(${angle1}, 150, 150)`);
    if (dot2) dot2.setAttribute('transform', `rotate(${angle2}, 150, 150)`);

    // Update trails
    const trail1 = document.getElementById('poly-trail-1');
    const trail2 = document.getElementById('poly-trail-2');
    if (trail1) trail1.setAttribute('transform', `rotate(${angle1}, 150, 150)`);
    if (trail2) trail2.setAttribute('transform', `rotate(${angle2}, 150, 150)`);
    
    // --- Update Waveform Visualization ---
    const waveContainer = document.getElementById('wave-container');
    if (waveContainer) {
       // Just shift the group horizontally based on progress
       const waveGroup = document.getElementById('wave-scroller');
       if (waveGroup) {
           const shift = progress * 300; 
           waveGroup.setAttribute('transform', `translate(${-shift}, 0)`);
       }
    }

    // Audio Triggers
    const p1 = progress * r1;
    const p2 = progress * r2;
    
    checkTrigger(p1, 1, 'high');
    checkTrigger(p2, 2, 'low');
    
    requestRef.current = requestAnimationFrame(animate);
  };

  const checkTrigger = (progressVal: number, id: number, pitch: 'high'|'low') => {
      const beatIndex = Math.floor(progressVal);
      // Check for new beat
      if (beatIndex !== lastBeatRef.current[id]) {
          // Sync check (approximate start of cycle)
          if (progressVal < 0.05 && id === 1) {
             playSyncTone();
             triggerVisualPulse('core');
          } else {
             playTone(pitch);
             triggerVisualPulse(pitch === 'high' ? 'outer' : 'inner');
          }
          lastBeatRef.current[id] = beatIndex;
      }
  };

  const triggerVisualPulse = (type: 'outer' | 'inner' | 'core') => {
      let elId = '';
      if (type === 'outer') elId = 'strike-visual-1';
      else if (type === 'inner') elId = 'strike-visual-2';
      else elId = 'strike-core';

      const el = document.getElementById(elId);
      if (el) {
          // Force reflow
          el.style.animation = 'none';
          void el.offsetHeight; 
          el.style.animation = type === 'core' 
             ? 'rippleCore 0.6s cubic-bezier(0, 0, 0.2, 1) forwards' 
             : 'ripple 0.4s cubic-bezier(0, 0, 0.2, 1) forwards';
      }
  };

  useEffect(() => {
    if (isPlaying) {
      setupAudio();
      lastBeatRef.current = {1: -1, 2: -1}; 
      startTimeRef.current = performance.now(); 
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, ratio]);

  const changeRatio = (newRatio: [number, number]) => {
      setIsPlaying(false);
      setRatio(newRatio);
      // Reset visuals
      ['poly-dot-1', 'poly-dot-2', 'poly-trail-1', 'poly-trail-2'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.setAttribute('transform', `rotate(0, 150, 150)`);
      });
  };
  
  // Generate Waveform SVG Path Data
  const generateWavePath = (freq: number, amplitude: number, offsetY: number, color: string) => {
      const points = [];
      const width = 300; 
      for (let x = 0; x <= width * 2; x += 5) {
          const y = offsetY + Math.sin((x / width) * Math.PI * 2 * freq) * amplitude;
          points.push(`${x},${y}`);
      }
      return <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.5" />;
  };

  const generateWaveDots = (freq: number, amplitude: number, offsetY: number, color: string) => {
      const dots = [];
      const width = 300;
      for(let i=0; i<freq * 2; i++) {
          const x = (i / freq) * width; // Position in pixels
          const y = offsetY; 
          dots.push(<circle key={i} cx={x} cy={y} r="3" fill={color} />);
      }
      return dots;
  };


  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 5 - Master Class</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            复合节奏 <span className="text-stone-300 font-light">|</span> Polyrhythms
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-3xl">
          当两个独立的节奏齿轮以不同的速度咬合在一起，我们听到的不仅是错位，更是数学的舞蹈。
          这在非洲音乐、爵士乐和现代极简主义中无处不在。
        </p>
      </header>

      {/* Main Card - Light Paper Theme */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-stone-200 overflow-hidden relative animate-slideUp stagger-1 flex flex-col items-center gap-12 min-h-[600px]">
          
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d6d3d1 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>

          <div className="flex flex-col md:flex-row w-full gap-12 items-center z-10">
            {/* Left: Visualization */}
            <div className="relative w-[300px] h-[300px] md:w-[360px] md:h-[360px] flex-shrink-0">
                <svg width="100%" height="100%" viewBox="0 0 300 300" className="overflow-visible">
                    <defs>
                        <linearGradient id="grad-trail-amber" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.5" />
                        </linearGradient>
                        <linearGradient id="grad-trail-indigo" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.5" />
                        </linearGradient>
                        <filter id="glow-impact">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                        </filter>
                    </defs>

                    {/* --- Static Tracks (Subtle Rings) --- */}
                    <circle cx="150" cy="150" r="110" fill="none" stroke="#e7e5e4" strokeWidth="2" />
                    <circle cx="150" cy="150" r="70" fill="none" stroke="#e7e5e4" strokeWidth="2" />
                    
                    {/* --- The Strike Line (12 o'clock) --- */}
                    <line x1="150" y1="20" x2="150" y2="40" stroke="#78716c" strokeWidth="2" strokeLinecap="round" />
                    <path d="M 150 45 L 145 38 L 155 38 Z" fill="#78716c" />

                    {/* --- Impact Ripples --- */}
                    <circle id="strike-visual-1" cx="150" cy="40" r="10" fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0" />
                    <circle id="strike-visual-2" cx="150" cy="80" r="8" fill="none" stroke="#6366f1" strokeWidth="2" opacity="0" />
                    <circle id="strike-core" cx="150" cy="20" r="20" fill="none" stroke="#78716c" strokeWidth="2" opacity="0" />

                    {/* --- Moving Elements --- */}
                    <g id="poly-trail-1">
                        <path d="M 150 40 A 110 110 0 0 0 54 94" fill="none" stroke="url(#grad-trail-amber)" strokeWidth="4" strokeLinecap="round" className="opacity-0 transition-opacity duration-300" style={{ opacity: isPlaying ? 1 : 0 }} />
                    </g>
                    <g id="poly-dot-1">
                        <circle cx="150" cy="40" r="8" fill="#f59e0b" className="shadow-sm" filter="url(#glow-impact)" />
                        <circle cx="150" cy="40" r="3" fill="#fff" opacity="0.6" />
                    </g>

                    <g id="poly-trail-2">
                        <path d="M 150 80 A 70 70 0 0 0 89 115" fill="none" stroke="url(#grad-trail-indigo)" strokeWidth="4" strokeLinecap="round" className="opacity-0 transition-opacity duration-300" style={{ opacity: isPlaying ? 1 : 0 }} />
                    </g>
                    <g id="poly-dot-2">
                        <circle cx="150" cy="80" r="8" fill="#6366f1" className="shadow-sm" filter="url(#glow-impact)" />
                        <circle cx="150" cy="80" r="3" fill="#fff" opacity="0.6" />
                    </g>

                    <circle cx="150" cy="150" r="4" fill="#d6d3d1" />
                </svg>
            </div>

            {/* Right: Controls & Info */}
            <div className="flex-1 w-full max-w-md">
                <div className="mb-8">
                    <div className="flex items-baseline gap-4 mb-4">
                        <span className="text-6xl font-serif font-bold text-amber-500 tabular-nums">{ratio[0]}</span>
                        <span className="text-2xl text-stone-300 font-light">against</span>
                        <span className="text-6xl font-serif font-bold text-indigo-500 tabular-nums">{ratio[1]}</span>
                    </div>
                    <div className="h-1 w-24 bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full mb-6"></div>
                    
                    <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 text-stone-600 text-sm leading-relaxed shadow-inner">
                        {ratio[0] === 2 && ratio[1] === 3 && (
                            <>
                                <p className="mb-2"><strong>二对三 (2:3)</strong> - 最基础的复合节奏。</p>
                                <p>口诀: "Hot Cup of Tea" 或 "Not Dif-fi-cult"。</p>
                                <p className="text-xs text-stone-400 mt-1">一只手弹2下，另一只手在同样时间内弹3下。</p>
                            </>
                        )}
                        {ratio[0] === 3 && ratio[1] === 4 && (
                            <>
                                <p className="mb-2"><strong>三对四 (3:4)</strong> - 充满滚动动力。</p>
                                <p>口诀: "Pass the god-damn but-ter"。</p>
                                <p className="text-xs text-stone-400 mt-1">这种节奏在肖邦的《幻想即兴曲》中非常典型。</p>
                            </>
                        )}
                        {ratio[0] === 4 && ratio[1] === 5 && (
                            <>
                                <p className="mb-2"><strong>四对五 (4:5)</strong> - 极度流动的质感。</p>
                                <p>节拍点几乎消失在旋律线中，产生一种像液体一样没有棱角的听感。</p>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 mb-10">
                    {[{ r: [2, 3], label: '2 : 3' }, { r: [3, 4], label: '3 : 4' }, { r: [4, 5], label: '4 : 5' }].map((item) => {
                        const isActive = ratio[0] === item.r[0] && ratio[1] === item.r[1];
                        return (
                            <button
                                key={item.label}
                                onClick={() => changeRatio(item.r as [number, number])}
                                className={`flex-1 py-3 rounded-xl font-bold font-mono text-sm transition-all border ${
                                    isActive
                                    ? 'bg-stone-900 border-stone-900 text-white shadow-lg transform scale-105'
                                    : 'bg-white border-stone-200 text-stone-500 hover:border-amber-300 hover:text-amber-600'
                                }`}
                            >
                                {item.label}
                            </button>
                        )
                    })}
                </div>

                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl active:scale-95 ${
                        isPlaying 
                        ? 'bg-stone-100 text-stone-400 border border-stone-200' 
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-400 hover:to-amber-500'
                    }`}
                >
                    {isPlaying ? <Pause fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} />}
                    {isPlaying ? '停止实验' : '开始同步'}
                </button>
            </div>
          </div>

          {/* Bottom: Wave Visualization */}
          <div className="w-full h-32 border-t border-stone-100 bg-stone-50/50 mt-4 relative overflow-hidden flex items-center">
               <div className="absolute left-4 top-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest z-10 flex items-center gap-2">
                   <Activity size={14} /> Phase Interference Pattern
               </div>
               <svg id="wave-container" width="100%" height="100%" className="absolute inset-0">
                   {/* Center Line */}
                   <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#e7e5e4" strokeWidth="1" />
                   {/* Vertical Strike Line */}
                   <line x1="50" y1="0" x2="50" y2="100%" stroke="#78716c" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
                   
                   <g id="wave-scroller" transform="translate(0,0)">
                       {/* Wave 1 (Amber) */}
                       {generateWavePath(ratio[0], 20, 60, '#f59e0b')}
                       {generateWaveDots(ratio[0], 20, 60, '#f59e0b')}
                       
                       {/* Wave 2 (Indigo) */}
                       {generateWavePath(ratio[1], 20, 60, '#6366f1')}
                       {generateWaveDots(ratio[1], 20, 60, '#6366f1')}
                   </g>
               </svg>
               {/* Fade edges */}
               <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white pointer-events-none"></div>
          </div>
      </div>

      <style>{`
        @keyframes ripple {
            0% { opacity: 0.8; transform: scale(1); stroke-width: 2px; }
            100% { opacity: 0; transform: scale(3); stroke-width: 0px; }
        }
        @keyframes rippleCore {
            0% { opacity: 1; transform: scale(0.5); stroke-width: 4px; }
            100% { opacity: 0; transform: scale(2); stroke-width: 0px; }
        }
      `}</style>
    </div>
  );
};

export default PolyrhythmsLesson;
