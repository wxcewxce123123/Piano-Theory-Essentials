
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GitMerge, Play, Pause, Layers, ArrowRight, Activity, Music, TrendingUp, TrendingDown, MoveRight, X } from 'lucide-react';

const CounterpointLesson: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeVoice, setActiveVoice] = useState<'both' | 'cantus' | 'counter'>('both');
  const [currentInterval, setCurrentInterval] = useState<string | null>(null);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const startTimeRef = useRef<number>(0);
  const requestRef = useRef<number | null>(null);

  // Total duration of the phrase in seconds
  const totalDuration = 8; 

  // --- Music Data ---
  // Cantus Firmus (Fixed Voice - Bottom): C4, D4, E4, C4 (Whole notes, 2s each)
  const cantusNotes = [
      { start: 0, end: 2, note: 'C4', freq: 261.63 },
      { start: 2, end: 4, note: 'D4', freq: 293.66 },
      { start: 4, end: 6, note: 'E4', freq: 329.63 },
      { start: 6, end: 8, note: 'C4', freq: 261.63 },
  ];

  // Counterpoint (Moving Voice - Top): More active rhythm
  // Adjusted for better consonance demonstration (3rds, 6ths, 8ves)
  const counterNotes = [
      { start: 0, end: 1, note: 'E5', freq: 659.25 }, // 10th (3rd)
      { start: 1, end: 2, note: 'C5', freq: 523.25 }, // 8ve
      { start: 2, end: 3, note: 'B4', freq: 493.88 }, // 6th
      { start: 3, end: 4, note: 'A4', freq: 440.00 }, // 5th
      { start: 4, end: 5, note: 'G4', freq: 392.00 }, // 3rd
      { start: 5, end: 6, note: 'G5', freq: 783.99 }, // 10th (3rd)
      { start: 6, end: 8, note: 'C5', freq: 523.25 }, // 8ve
  ];

  const setupAudio = () => {
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
    }
  };

  const scheduleAudio = () => {
      const ctx = audioCtxRef.current!;
      const now = ctx.currentTime;

      const scheduleNote = (freq: number, startOffset: number, duration: number, type: 'sine' | 'triangle', vol: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = freq;
          osc.type = type;
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          gain.gain.setValueAtTime(0, now + startOffset);
          gain.gain.linearRampToValueAtTime(vol, now + startOffset + 0.05);
          gain.gain.setValueAtTime(vol, now + startOffset + duration - 0.05);
          gain.gain.linearRampToValueAtTime(0, now + startOffset + duration);
          
          osc.start(now + startOffset);
          osc.stop(now + startOffset + duration + 0.1);
      };

      if (activeVoice === 'both' || activeVoice === 'cantus') {
          cantusNotes.forEach(n => scheduleNote(n.freq, n.start, n.end - n.start, 'triangle', 0.25));
      }
      if (activeVoice === 'both' || activeVoice === 'counter') {
          counterNotes.forEach(n => scheduleNote(n.freq, n.start, n.end - n.start, 'sine', 0.2));
      }
  };

  // Helper to determine interval name at current time
  const getIntervalAtTime = (time: number) => {
      const cf = cantusNotes.find(n => time >= n.start && time < n.end);
      const cp = counterNotes.find(n => time >= n.start && time < n.end);
      if (!cf || !cp) return null;

      // Approximate interval calculation based on frequency ratio or note names
      // Simplified mapping for this specific melody
      const ratio = cp.freq / cf.freq;
      if (Math.abs(ratio - 2) < 0.05) return { name: '纯八度 (P8)', quality: 'perfect' };
      if (Math.abs(ratio - 1.5) < 0.05) return { name: '纯五度 (P5)', quality: 'perfect' };
      if (Math.abs(ratio - 1.25) < 0.1) return { name: '大三度 (M3)', quality: 'consonant' }; // approx
      if (Math.abs(ratio - 1.66) < 0.1) return { name: '大六度 (M6)', quality: 'consonant' }; // approx
      if (Math.abs(ratio - 2.5) < 0.1) return { name: '十度 (M10)', quality: 'consonant' }; // 3rd + 8ve
      
      return { name: 'Consonant', quality: 'consonant' };
  };

  const animate = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = (time - startTimeRef.current) / 1000;
      
      if (elapsed > totalDuration) {
          setIsPlaying(false);
          setCurrentInterval(null);
          return;
      }

      // Update Playhead Position
      const playhead = document.getElementById('cp-playhead');
      if (playhead) {
          const progress = (elapsed / totalDuration) * 100;
          playhead.style.left = `${progress}%`;
      }

      // Update Interval Display
      const interval = getIntervalAtTime(elapsed);
      if (interval) {
          setCurrentInterval(interval.name);
          const badge = document.getElementById('interval-badge');
          if (badge) {
              badge.textContent = interval.name;
              badge.style.opacity = '1';
              badge.style.backgroundColor = interval.quality === 'perfect' ? '#4f46e5' : '#059669'; // Indigo or Emerald
          }
      }

      requestRef.current = requestAnimationFrame(animate);
  };

  const togglePlay = () => {
      if (isPlaying) {
          setIsPlaying(false);
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
          audioCtxRef.current?.suspend();
      } else {
          setupAudio();
          scheduleAudio();
          setIsPlaying(true);
          startTimeRef.current = performance.now();
          requestRef.current = requestAnimationFrame(animate);
      }
  };

  // SVG Path Generators
  const generatePath = (notes: typeof cantusNotes, maxFreq: number, minFreq: number, height: number) => {
      let d = "";
      notes.forEach((n, i) => {
          const x1 = (n.start / totalDuration) * 100;
          const x2 = (n.end / totalDuration) * 100;
          // Normalize freq to Y (inverted)
          const y = height - ((n.freq - minFreq) / (maxFreq - minFreq)) * (height * 0.8) - (height * 0.1);
          
          if (i === 0) d += `M ${x1}% ${y}`;
          else d += ` L ${x1}% ${y}`;
          d += ` L ${x2}% ${y}`;
      });
      return d;
  };

  return (
    <div className="space-y-16">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-stone-900 text-stone-100 rounded-full text-xs font-bold tracking-wider uppercase mb-3 shadow-lg flex items-center gap-2 w-fit">
            <GitMerge size={12} className="text-amber-400" />
            Level 5 - Master Class
        </div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            对位法 <span className="text-stone-300 font-light">|</span> Counterpoint
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-3xl leading-relaxed">
          "Punctum contra punctum"（点对点）。这是音乐中最精妙的对话艺术：如何让两条独立的旋律线既保持各自的个性，又能和谐地结合在一起？
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-[#1c1917] rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden animate-slideUp stagger-1 flex flex-col gap-8 border border-stone-800">
          
          {/* Background Gradient */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

          {/* Visualization Canvas */}
          <div className="relative h-80 w-full bg-black/40 rounded-3xl border border-white/10 overflow-hidden shadow-inner flex items-center">
              
              {/* Playhead */}
              <div id="cp-playhead" className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-30 shadow-[0_0_15px_#f59e0b]" style={{ left: '0%', transition: isPlaying ? 'none' : 'left 0.2s' }}>
                  {/* Floating Interval Badge */}
                  <div id="interval-badge" className="absolute top-4 left-2 px-2 py-1 rounded text-[10px] font-bold text-white whitespace-nowrap opacity-0 transition-opacity bg-indigo-600 shadow-md transform translate-x-2">
                      Interval
                  </div>
              </div>

              <svg width="100%" height="100%" className="overflow-visible absolute inset-0 z-10" preserveAspectRatio="none">
                  <defs>
                      <linearGradient id="grad-cantus" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#38bdf8" />
                          <stop offset="100%" stopColor="#818cf8" />
                      </linearGradient>
                      <linearGradient id="grad-counter" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#fbbf24" />
                          <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                      <filter id="glow-line">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                      </filter>
                  </defs>

                  {/* Cantus Firmus (Voice 1) - Blue */}
                  <path 
                    d={generatePath(cantusNotes, 800, 200, 320)} 
                    fill="none" 
                    stroke="url(#grad-cantus)" 
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow-line)"
                    className={`transition-opacity duration-500 ${activeVoice === 'counter' ? 'opacity-20' : 'opacity-100'}`}
                  />
                  {/* Labels for CF */}
                  {activeVoice !== 'counter' && cantusNotes.map((n, i) => (
                      <g key={`cf-${i}`}>
                          <circle cx={`${(n.start/totalDuration)*100}%`} cy={320 - ((n.freq-200)/600)*256 - 32} r="4" fill="#38bdf8" />
                          {isPlaying && <text x={`${(n.start/totalDuration)*100}%`} y={320 - ((n.freq-200)/600)*256 - 50} fill="#38bdf8" fontSize="10" className="font-mono">CF</text>}
                      </g>
                  ))}

                  {/* Counterpoint (Voice 2) - Amber */}
                  <path 
                    d={generatePath(counterNotes, 800, 200, 320)} 
                    fill="none" 
                    stroke="url(#grad-counter)" 
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow-line)"
                    className={`transition-opacity duration-500 ${activeVoice === 'cantus' ? 'opacity-20' : 'opacity-100'}`}
                  />
                  {/* Labels for CP */}
                  {activeVoice !== 'cantus' && counterNotes.map((n, i) => (
                      <g key={`cp-${i}`}>
                          <circle cx={`${(n.start/totalDuration)*100}%`} cy={320 - ((n.freq-200)/600)*256 - 32} r="4" fill="#fbbf24" />
                      </g>
                  ))}
                  
                  {/* Connector Lines (Dynamic) */}
                  {isPlaying && activeVoice === 'both' && (
                      <line 
                        x1="0" y1="0" x2="0" y2="320" 
                        stroke="white" strokeWidth="1" strokeDasharray="4 4" opacity="0.3"
                        id="interval-connector"
                      />
                  )}
              </svg>
          </div>

          {/* Controls Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 z-20">
              {/* Voice Selector */}
              <div className="flex bg-stone-800 p-1.5 rounded-2xl border border-stone-700">
                  <button 
                    onClick={() => setActiveVoice('cantus')}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeVoice === 'cantus' ? 'bg-sky-600 text-white shadow-lg' : 'text-stone-400 hover:text-white hover:bg-stone-700'}`}
                  >
                      定旋律 (CF)
                  </button>
                  <button 
                    onClick={() => setActiveVoice('counter')}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeVoice === 'counter' ? 'bg-amber-600 text-white shadow-lg' : 'text-stone-400 hover:text-white hover:bg-stone-700'}`}
                  >
                      对位旋律 (CP)
                  </button>
                  <button 
                    onClick={() => setActiveVoice('both')}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeVoice === 'both' ? 'bg-white text-stone-900 shadow-lg' : 'text-stone-400 hover:text-white hover:bg-stone-700'}`}
                  >
                      双声部 (Both)
                  </button>
              </div>

              {/* Play Button */}
              <button 
                onClick={togglePlay}
                className={`flex items-center gap-3 px-12 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-xl ${
                    isPlaying 
                    ? 'bg-stone-800 text-stone-400 border border-stone-700' 
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:scale-105'
                }`}
              >
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                  <span>{isPlaying ? '暂停 (Pause)' : '聆听对位 (Play)'}</span>
              </button>
          </div>
      </div>

      {/* --- THEORY SECTION --- */}
      
      {/* 1. Motion Types Interactive Cards */}
      <section className="animate-slideUp stagger-2">
          <div className="flex items-center gap-4 mb-6">
              <Activity className="text-amber-500" size={24} />
              <h3 className="text-2xl font-bold text-stone-900">四大行进 (The Four Motions)</h3>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Contrary */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all group">
                  <div className="h-16 flex items-center justify-center gap-4 mb-4 bg-stone-50 rounded-xl group-hover:bg-amber-50 transition-colors">
                      <TrendingUp className="text-amber-500 transform scale-125" />
                      <TrendingDown className="text-sky-500 transform scale-125" />
                  </div>
                  <h4 className="font-bold text-stone-900 mb-1">反向 (Contrary)</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">最理想的行进。一声部上升，另一声部下降。这最大化了声部的独立性。</p>
              </div>

              {/* Oblique */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all group">
                  <div className="h-16 flex items-center justify-center gap-4 mb-4 bg-stone-50 rounded-xl group-hover:bg-sky-50 transition-colors">
                      <MoveRight className="text-stone-400 transform scale-125" />
                      <TrendingUp className="text-sky-500 transform scale-125" />
                  </div>
                  <h4 className="font-bold text-stone-900 mb-1">斜向 (Oblique)</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">一声部保持不动，另一声部移动。非常安全且常用，能产生有趣的摩擦感。</p>
              </div>

              {/* Parallel */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all group">
                  <div className="h-16 flex items-center justify-center gap-4 mb-4 bg-stone-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                      <TrendingUp className="text-stone-400 transform scale-125" />
                      <TrendingUp className="text-stone-400 transform scale-125 translate-y-2" />
                  </div>
                  <h4 className="font-bold text-stone-900 mb-1">平行 (Parallel)</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">同向移动且音程保持不变。需小心使用，<strong>平行五/八度</strong>是严禁的！</p>
              </div>

              {/* Similar */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all group">
                  <div className="h-16 flex items-center justify-center gap-4 mb-4 bg-stone-50 rounded-xl group-hover:bg-emerald-50 transition-colors">
                      <TrendingUp className="text-stone-400 transform scale-125" />
                      <TrendingUp className="text-stone-400 transform scale-125 -rotate-12 translate-y-1" />
                  </div>
                  <h4 className="font-bold text-stone-900 mb-1">同向 (Similar)</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">同向移动但音程改变。比平行灵活，但也容易失去独立感。</p>
              </div>
          </div>
      </section>

      {/* 2. Deep Dive Cards */}
      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-3">
          <div className="bg-stone-900 text-stone-300 p-8 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none"></div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Music className="text-amber-400" />
                  独立与和谐的悖论
              </h3>
              <p className="text-sm leading-relaxed mb-4">
                  对位法的终极目标是解决一个哲学矛盾：
                  <br/><br/>
                  <strong className="text-white">1. 独立性 (Independence):</strong> 每条旋律都必须好听、完整，有自己的走向和节奏，仿佛不需要另一条旋律存在。
                  <br/>
                  <strong className="text-white">2. 和谐性 (Harmony):</strong> 当它们同时奏响时，纵向的每一个瞬间都必须构成协和的音程（如三度、五度、六度）。
              </p>
              <div className="h-px bg-white/10 w-full my-4"></div>
              <p className="text-xs italic text-stone-500">
                  "就像两个有教养的人在交谈：他们各抒己见（独立），但从不打断对方，并在关键观点上达成共识（和谐）。"
              </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <X className="text-red-500" />
                  为什么禁止平行五度？
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  如果你在对位法课上写了平行五度，老师可能会给你不及格。为什么？
              </p>
              <ul className="space-y-3 text-sm text-stone-600">
                  <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></div>
                      <span><strong>声音融合度太高：</strong> 五度和八度是非常协和的音程（物理上频率高度重合）。当两个声部平行移动这些音程时，它们听起来就像这<strong>变成了一个声部</strong>。</span>
                  </li>
                  <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></div>
                      <span><strong>丧失独立性：</strong> 对位法的核心是“多声部”。平行五度让两个声部瞬间“合并”，破坏了复调音乐最宝贵的特质——丰富性与独立性。</span>
                  </li>
              </ul>
          </div>
      </div>
    </div>
  );
};

export default CounterpointLesson;
