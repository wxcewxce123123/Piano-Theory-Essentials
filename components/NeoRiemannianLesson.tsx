
import React, { useState, useRef, useEffect } from 'react';
import { Network, ArrowRightLeft, Move, Info, Sparkles, Film, Anchor } from 'lucide-react';

const NeoRiemannianLesson: React.FC = () => {
  const [activeChord, setActiveChord] = useState<{root: number, type: 'maj'|'min'}>({root: 0, type: 'maj'}); // 0 = C
  const [lastOp, setLastOp] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const notes = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const baseFreq = 261.63; // C4

  // Operations
  const transform = (op: 'P' | 'L' | 'R') => {
      setLastOp(op);
      let newRoot = activeChord.root;
      let newType: 'maj' | 'min' = activeChord.type === 'maj' ? 'min' : 'maj';

      // Based on Neo-Riemannian Operations
      if (activeChord.type === 'maj') {
          if (op === 'P') newRoot = activeChord.root; // C Maj -> C Min
          if (op === 'L') newRoot = (activeChord.root + 4) % 12; // C Maj -> E Min
          if (op === 'R') newRoot = (activeChord.root + 9) % 12; // C Maj -> A Min
      } else {
          // Inverse for Minor
          if (op === 'P') newRoot = activeChord.root; // C Min -> C Maj
          if (op === 'L') newRoot = (activeChord.root - 4 + 12) % 12; // E Min -> C Maj
          if (op === 'R') newRoot = (activeChord.root - 9 + 12) % 12; // A Min -> C Maj
      }
      
      setActiveChord({ root: newRoot, type: newType });
      playChord(newRoot, newType);
  };

  const playChord = (root: number, type: 'maj' | 'min') => {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const intervals = type === 'maj' ? [0, 4, 7] : [0, 3, 7];
      // Use harmonic series spread for richer sound
      const freqs = intervals.map(semitone => baseFreq * Math.pow(2, (root + semitone) / 12));

      freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = f;
          osc.type = 'triangle';
          
          // Add some simple reverb-like decay
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          const now = ctx.currentTime;
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5); // Longer tail
          
          osc.start(now);
          osc.stop(now + 2.6);
      });
  };

  // Render Tonnetz Grid Animation
  const renderTonnetz = () => {
      const cx = 300;
      const cy = 130; // Moved up to allow space for badge at bottom
      const scale = 80; // Slightly smaller scale to ensure labels don't clip
      
      const n1 = activeChord.root;
      const n2 = (activeChord.root + (activeChord.type === 'maj' ? 4 : 3)) % 12;
      const n3 = (activeChord.root + 7) % 12;
      
      // Calculate simplified triangle positions
      // Upright for Major, Inverted for Minor
      const isMaj = activeChord.type === 'maj';
      
      // Coordinates
      const p1 = { x: cx - scale/2, y: cy + scale/2 * 0.8 }; // Bottom Left
      const p2 = { x: cx + scale/2, y: cy + scale/2 * 0.8 }; // Bottom Right
      const p3 = { x: cx, y: cy - scale/2 * 0.8 }; // Top Center
      
      // If Minor (Inverted), flip Y around center
      const finalP1 = isMaj ? p1 : { ...p1, y: cy - (p1.y - cy) };
      const finalP2 = isMaj ? p2 : { ...p2, y: cy - (p2.y - cy) };
      const finalP3 = isMaj ? p3 : { ...p3, y: cy - (p3.y - cy) };

      let v1 = { ...finalP1, note: notes[n1], label: '根音' };
      let v2 = { ...finalP2, note: notes[n2], label: '三音' };
      let v3 = { ...finalP3, note: notes[n3], label: '五音' };

      // SVG Path
      const pathD = `M ${v1.x} ${v1.y} L ${v2.x} ${v2.y} L ${v3.x} ${v3.y} Z`;

      return (
          <svg width="100%" height="100%" viewBox="0 0 600 320" className="overflow-visible transition-all duration-700">
              <defs>
                  <filter id="glow-tonnetz">
                      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <linearGradient id="grad-maj" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient id="grad-min" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.1" />
                  </linearGradient>
              </defs>

              {/* Background Web (Hint of the infinite grid) */}
              <g opacity="0.1" stroke="currentColor" strokeWidth="1" className="text-stone-500">
                  <path d={`M ${cx-200} ${cy} L ${cx+200} ${cy}`} />
                  <path d={`M ${cx-100} ${cy-120} L ${cx+100} ${cy+120}`} />
                  <path d={`M ${cx+100} ${cy-120} L ${cx-100} ${cy+120}`} />
              </g>

              {/* The Active Triangle */}
              <path 
                d={pathD}
                fill={isMaj ? "url(#grad-maj)" : "url(#grad-min)"}
                stroke={isMaj ? "#f59e0b" : "#4f46e5"}
                strokeWidth="3"
                filter="url(#glow-tonnetz)"
                className="transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              />

              {/* Vertices */}
              {[v1, v2, v3].map((v, i) => (
                  <g key={i} className="transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]" transform={`translate(${v.x}, ${v.y})`}>
                      <circle r="18" fill="white" stroke={isMaj ? "#f59e0b" : "#4f46e5"} strokeWidth="2.5" className="shadow-lg" />
                      <text dy="5" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1c1917">{v.note}</text>
                      
                      {/* Interval Label */}
                      <text dy="-26" textAnchor="middle" fontSize="10" fontWeight="bold" fill={isMaj ? "#d97706" : "#4338ca"} opacity="0.8" className="tracking-wide" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                          {v.label}
                      </text>
                  </g>
              ))}

              {/* Info Badge - Moved upwards to fit within bounds */}
              <g transform="translate(0, 0)">
                  {/* Chord Badge Background */}
                  <rect 
                      x={cx - 80} 
                      y={220} 
                      width="160" 
                      height="40" 
                      rx="10" 
                      fill={isMaj ? "rgba(245, 158, 11, 0.15)" : "rgba(79, 70, 229, 0.15)"} 
                      stroke={isMaj ? "#f59e0b" : "#4f46e5"} 
                      strokeWidth="1" 
                      className="transition-all duration-500"
                  />
                  
                  {/* Center Label */}
                  <text 
                      x={cx} 
                      y={246} 
                      textAnchor="middle" 
                      fontSize="18" 
                      fontWeight="bold" 
                      fill={isMaj ? "#fbbf24" : "#818cf8"} 
                      className="transition-colors duration-500 font-serif tracking-widest"
                      style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                  >
                      {notes[activeChord.root]} {isMaj ? '大调' : '小调'}
                  </text>
                  
                  {/* Operation Indicator */}
                  {lastOp && (
                      <text 
                          x={cx} 
                          y={278} 
                          textAnchor="middle" 
                          fontSize="10" 
                          fontWeight="bold" 
                          fill="#a8a29e" 
                          className="uppercase tracking-[0.2em] animate-fadeIn"
                      >
                          当前变换: {lastOp}
                      </text>
                  )}
              </g>
          </svg>
      );
  };

  return (
    <div className="space-y-16">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-stone-900 text-stone-100 rounded-full text-xs font-bold tracking-wider uppercase mb-3 shadow-lg flex items-center gap-2 w-fit">
            <Network size={12} className="text-amber-400" />
            Level 5 - Master Class
        </div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            新黎曼理论 <span className="text-stone-300 font-light">|</span> Neo-Riemannian
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-3xl leading-relaxed">
          欢迎来到和声的“奇异博士”宇宙。在这里，我们不再关心主属关系，而是关注和弦之间如何通过<strong>微小的移动</strong>实现变形。这就是好莱坞史诗配乐的秘密武器。
        </p>
      </header>

      {/* Interactive Stage */}
      <div className="bg-[#1c1917] rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden animate-slideUp stagger-1 border border-stone-800 flex flex-col items-center gap-10">
          
          {/* Grid Bg */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
          </div>

          {/* Visualizer Container - Adjusted Aspect Ratio for better fit */}
          <div className="relative z-10 w-full max-w-3xl aspect-[2/1] min-h-[300px] max-h-[350px] bg-black/20 rounded-3xl border border-white/5 overflow-hidden flex items-center justify-center backdrop-blur-sm shadow-inner">
              {renderTonnetz()}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap justify-center gap-4 z-10 w-full max-w-4xl">
              
              {/* P Transform */}
              <button 
                onClick={() => transform('P')}
                className="flex-1 min-w-[140px] max-w-[200px] bg-stone-800 hover:bg-stone-700 text-white p-1 rounded-2xl border border-stone-700 hover:border-amber-500/50 transition-all active:scale-95 group shadow-lg"
              >
                  <div className="bg-black/20 rounded-xl p-4 h-full flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <span className="text-xl font-bold font-serif">P</span>
                      </div>
                      <div className="text-xs font-bold text-stone-200 mb-1">平行 (Parallel)</div>
                      <div className="text-[9px] text-stone-500 leading-tight text-center">
                          保持 <span className="text-amber-500">五度</span> (C-G)
                      </div>
                  </div>
              </button>

              {/* L Transform */}
              <button 
                onClick={() => transform('L')}
                className="flex-1 min-w-[140px] max-w-[200px] bg-stone-800 hover:bg-stone-700 text-white p-1 rounded-2xl border border-stone-700 hover:border-indigo-500/50 transition-all active:scale-95 group shadow-lg"
              >
                  <div className="bg-black/20 rounded-xl p-4 h-full flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <span className="text-xl font-bold font-serif">L</span>
                      </div>
                      <div className="text-xs font-bold text-stone-200 mb-1">导音 (Leading)</div>
                      <div className="text-[9px] text-stone-500 leading-tight text-center">
                          保持 <span className="text-indigo-500">小三度</span> (E-G)
                      </div>
                  </div>
              </button>

              {/* R Transform */}
              <button 
                onClick={() => transform('R')}
                className="flex-1 min-w-[140px] max-w-[200px] bg-stone-800 hover:bg-stone-700 text-white p-1 rounded-2xl border border-stone-700 hover:border-emerald-500/50 transition-all active:scale-95 group shadow-lg"
              >
                  <div className="bg-black/20 rounded-xl p-4 h-full flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <span className="text-xl font-bold font-serif">R</span>
                      </div>
                      <div className="text-xs font-bold text-stone-200 mb-1">关系 (Relative)</div>
                      <div className="text-[9px] text-stone-500 leading-tight text-center">
                          保持 <span className="text-emerald-500">大三度</span> (C-E)
                      </div>
                  </div>
              </button>
          </div>
      </div>

      {/* Deep Dive Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slideUp stagger-2">
          
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Network className="text-amber-500" />
                  什么是 Tonnetz 音网?
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  Euler 在 1739 年首次提出。不同于传统的线性音阶，Tonnetz 是一个<strong>二维网络</strong>。
              </p>
              <ul className="text-xs text-stone-500 space-y-2 font-mono bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <li className="flex items-center gap-2"><span className="w-2 h-2 bg-stone-400 rounded-full"></span> 横向：连接纯五度 (C-G)</li>
                  <li className="flex items-center gap-2"><span className="w-2 h-2 bg-stone-400 rounded-full"></span> 对角 /：连接大三度 (C-E)</li>
                  <li className="flex items-center gap-2"><span className="w-2 h-2 bg-stone-400 rounded-full"></span> 对角 \：连接小三度 (E-G)</li>
              </ul>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Anchor className="text-indigo-500" />
                  平稳声部连接 (Parsimony)
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  新黎曼理论的核心美学是<strong>“懒惰”</strong>。
                  <br/><br/>
                  为什么 P, L, R 变换听起来如此顺滑？因为在三和弦的三个音中，<strong>有两个音保持不动</strong>，只有一个音移动了极小的距离（半音或全音）。这种“最大程度的保留”创造了如同流体般的听感。
              </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Film className="text-emerald-500" />
                  好莱坞的秘密武器
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  如果你觉得某个和弦进行听起来像《指环王》、《星际穿越》或者超级英雄电影，那很可能就是 <strong>PL 变换</strong>。
              </p>
              <div className="bg-stone-900 text-stone-300 p-4 rounded-xl text-xs leading-relaxed italic border border-stone-700">
                  "这种非功能的和声连接，瞬间将听众带入一个完全不同的调性宇宙，创造出一种宏大、奇幻、甚至史诗般的‘崇高感’ (Sublime)。"
              </div>
          </div>

      </div>
    </div>
  );
};

export default NeoRiemannianLesson;
