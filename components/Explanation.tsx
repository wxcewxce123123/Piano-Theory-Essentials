
import React, { useState, useRef, useEffect } from 'react';
import { Play, Music } from 'lucide-react';

const Explanation: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Note data: C4, D4, E4, F4
  const notes = [
    { note: 'C', freq: 261.63, y: 80, x: 50 },
    { note: 'D', freq: 293.66, y: 70, x: 130 },
    { note: 'E', freq: 329.63, y: 60, x: 210 },
    { note: 'F', freq: 349.23, y: 50, x: 290 },
  ];

  const [activeNoteIndex, setActiveNoteIndex] = useState<number | null>(null);

  const playPhrase = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setActiveNoteIndex(0);

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const duration = 0.5; // seconds per note
    
    notes.forEach((n, i) => {
        const startTime = now + i * duration;
        
        // Schedule visual update
        setTimeout(() => {
            setActiveNoteIndex(i);
        }, i * duration * 1000);

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.frequency.value = n.freq;
        osc.type = 'triangle';
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Legato Envelope: Overlap slightly and smooth attack/release
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        // Sustain full volume until the very end of the note to blend into next
        gain.gain.setValueAtTime(0.3, startTime + duration - 0.05); 
        gain.gain.linearRampToValueAtTime(0, startTime + duration + 0.05); // Small overlap release
        
        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);
    });

    // Reset
    setTimeout(() => {
        setIsPlaying(false);
        setActiveNoteIndex(null);
    }, notes.length * duration * 1000 + 200);
  };

  return (
    <div className="flex flex-col items-center w-full">
      
      {/* Interactive Canvas */}
      <div className="relative bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden w-full max-w-2xl h-64 select-none">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-white to-stone-50/50"></div>
          
          <div className="absolute top-6 left-6 flex items-center gap-2 text-stone-400">
             <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                <Music size={16} />
             </div>
             <span className="text-[10px] font-bold uppercase tracking-widest">Legato Phrasing</span>
          </div>

          <svg width="100%" height="100%" viewBox="0 0 340 160" className="absolute inset-0 z-10 overflow-visible">
              <defs>
                  <filter id="glow-slur">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <linearGradient id="slur-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
              </defs>

              {/* Staff Lines */}
              <g stroke="#e5e5e5" strokeWidth="1.5">
                  {[40, 60, 80, 100, 120].map(y => (
                      <line key={y} x1="20" y1={y} x2="320" y2={y} />
                  ))}
              </g>

              {/* The Slur Curve */}
              {/* Curve going under the notes for C-D-E-F usually, or over. Let's do UNDER for visual balance here since notes go up */}
              <path 
                d="M 50 100 Q 170 160 290 70" 
                fill="none" 
                stroke="#fcd34d" 
                strokeWidth="4" 
                strokeLinecap="round"
                className="opacity-50"
              />
              {/* Active Slur Progress Animation */}
              {isPlaying && (
                  <path 
                    d="M 50 100 Q 170 160 290 70" 
                    fill="none" 
                    stroke="#d97706" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    strokeDasharray="400"
                    strokeDashoffset="400"
                    className="animate-draw-slur"
                    filter="url(#glow-slur)"
                  />
              )}

              {/* Notes */}
              {notes.map((n, i) => {
                  const isActive = activeNoteIndex === i;
                  const isPast = activeNoteIndex !== null && activeNoteIndex > i;
                  
                  return (
                      <g key={i} className="transition-all duration-300">
                          {/* Note Head */}
                          <ellipse 
                            cx={n.x} cy={n.y} rx="10" ry="8" 
                            style={{ 
                                transformBox: 'fill-box', 
                                transformOrigin: 'center',
                                transform: isActive ? undefined : 'rotate(-15deg)'
                            }}
                            fill={isActive ? '#d97706' : (isPast ? '#fbbf24' : '#1c1917')}
                            className={isActive ? 'animate-pulse-fast' : ''}
                          />
                          {/* Stem */}
                          <line 
                            x1={n.x + 8} y1={n.y - 2} x2={n.x + 8} y2={n.y - 45} 
                            stroke={isActive ? '#d97706' : (isPast ? '#fbbf24' : '#1c1917')} 
                            strokeWidth="2" 
                          />
                          {/* Note Name Label */}
                          {isActive && (
                              <text x={n.x} y={n.y + 30} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#d97706" className="animate-float-up">
                                  {n.note}
                              </text>
                          )}
                      </g>
                  );
              })}
          </svg>

          {/* Play Button Overlay */}
          <div className="absolute bottom-6 right-6 z-20">
              <button 
                onClick={playPhrase}
                disabled={isPlaying}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg transition-all transform active:scale-95 ${
                    isPlaying 
                    ? 'bg-stone-100 text-stone-400 cursor-default' 
                    : 'bg-amber-500 text-white hover:bg-amber-600 hover:shadow-amber-200'
                }`}
              >
                 <Play size={18} fill={isPlaying ? 'none' : 'currentColor'} />
                 <span>{isPlaying ? '连奏中...' : '聆听连音 (Play Slur)'}</span>
              </button>
          </div>
      </div>

      <style>{`
        .animate-draw-slur {
            animation: drawSlur 2s linear forwards;
        }
        @keyframes drawSlur {
            to { stroke-dashoffset: 0; }
        }
        .animate-pulse-fast {
            animation: pulseFast 0.5s ease-in-out;
        }
        @keyframes pulseFast {
            0% { transform: scale(1) rotate(-15deg); }
            50% { transform: scale(1.3) rotate(-15deg); }
            100% { transform: scale(1) rotate(-15deg); }
        }
        .animate-float-up {
            animation: floatUpText 0.5s ease-out forwards;
        }
        @keyframes floatUpText {
            from { transform: translateY(5px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Explanation;
