
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Play, Pause, Trophy, Zap, RefreshCw, AudioWaveform, Star, Crown, MonitorPlay } from 'lucide-react';

// --- Types & Constants ---

interface NoteData {
  id: number;
  time: number; // Time in beats
  type: 'note' | 'rest';
  pitch: 'high' | 'mid' | 'low'; // Visualization lane
  status: 'pending' | 'hit' | 'miss';
}

interface LevelData {
  id: number;
  title: string;
  subtitle: string;
  bpm: number;
  difficulty: 'Hard' | 'Expert' | 'Master';
  description: string;
  color: string;
  notes: NoteData[];
}

// Helper to generate notes
const generatePattern = (length: number, density: number, syncopation: boolean): NoteData[] => {
    const notes: NoteData[] = [];
    for (let i = 0; i < length; i += 0.5) { // 8th note grid
        if (Math.random() < density) {
            // Logic for syncopation: prioritize off-beats
            const isOffBeat = i % 1 !== 0;
            if (syncopation && !isOffBeat && Math.random() > 0.3) continue; // Skip strong beats sometimes

            notes.push({
                id: Math.random(),
                time: i,
                type: 'note',
                pitch: isOffBeat ? 'high' : (i % 2 === 0 ? 'low' : 'mid'),
                status: 'pending'
            });
        }
    }
    return notes.sort((a,b) => a.time - b.time);
};

// Advanced Level Data
const LEVELS: LevelData[] = [
  {
    id: 1, title: "Quantum Sync", subtitle: "切分音入门", bpm: 90, difficulty: 'Hard',
    description: "重音经常落在反拍上。不要被强拍欺骗，保持你的内在时钟。",
    color: 'text-cyan-400',
    notes: generatePattern(16, 0.6, true)
  },
  {
    id: 2, title: "Neon Drive", subtitle: "极速十六分音符", bpm: 110, difficulty: 'Expert',
    description: "像霓虹灯一样闪烁的快速音流。考验手指的反应速度。",
    color: 'text-fuchsia-400',
    notes: generatePattern(32, 0.8, false) // Dense 
  },
  {
    id: 3, title: "Polyrhythm Chaos", subtitle: "复合节奏挑战", bpm: 100, difficulty: 'Master',
    description: "大脑分裂术。尝试在 3 对 4 的错位中找到平衡。",
    color: 'text-amber-400',
    notes: generatePattern(24, 0.7, true)
  }
];

const RhythmPractice: React.FC = () => {
  // --- State ---
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [health, setHealth] = useState(100);
  const [gameNotes, setGameNotes] = useState<NoteData[]>([]);
  const [playbackTime, setPlaybackTime] = useState(0); // Current time in beats
  const [hitFeedback, setHitFeedback] = useState<{id: number, text: string, x: number, y: number}[]>([]);

  // --- Refs ---
  const audioCtxRef = useRef<AudioContext | null>(null);
  const startTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const noteContainerRef = useRef<HTMLDivElement>(null);

  const level = useMemo(() => LEVELS.find(l => l.id === currentLevelId) || LEVELS[0], [currentLevelId]);
  
  // Viewport Settings
  const VIEW_BEATS = 4; // How many beats are visible on screen
  const NOTE_SPEED = 200; // Pixels per beat (Speed of scroll)

  // --- Audio Engine ---
  const initAudio = () => {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
      return audioCtxRef.current;
  };

  const playSynthSound = (type: 'kick' | 'snare' | 'hihat' | 'hit' | 'miss') => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'kick') {
          osc.frequency.setValueAtTime(150, t);
          osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.5);
          gain.gain.setValueAtTime(0.8, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
          osc.start(t);
          osc.stop(t + 0.5);
      } else if (type === 'snare') {
          // Noise burst logic simplified for React component
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(200, t);
          gain.gain.setValueAtTime(0.5, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          osc.start(t);
          osc.stop(t + 0.2);
      } else if (type === 'hit') {
          // Sci-fi ping
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, t);
          osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
          gain.gain.setValueAtTime(0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
          osc.start(t);
          osc.stop(t + 0.3);
      } else if (type === 'miss') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(100, t);
          osc.frequency.linearRampToValueAtTime(50, t + 0.3);
          gain.gain.setValueAtTime(0.3, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.3);
          osc.start(t);
          osc.stop(t + 0.3);
      }
  };

  // --- Game Loop ---
  const startGame = () => {
      const ctx = initAudio();
      setGameState('playing');
      setScore(0);
      setCombo(0);
      setHealth(100);
      setGameNotes(JSON.parse(JSON.stringify(level.notes))); // Deep copy
      startTimeRef.current = ctx.currentTime + 2; // 2 Seconds count in
      setHitFeedback([]);

      // Start Metronome Loop logic (Simplified for visuals driven)
      // Real implementation would schedule ahead. Here we drive visuals by time.
      rafRef.current = requestAnimationFrame(gameLoop);
  };

  const gameLoop = () => {
      if (gameState === 'finished') return;
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const now = ctx.currentTime;
      const elapsed = now - startTimeRef.current;
      const currentBeat = elapsed * (level.bpm / 60);
      setPlaybackTime(currentBeat);

      // Auto-miss logic
      setGameNotes(prev => {
          let hasChanges = false;
          const updated = prev.map(n => {
              if (n.status === 'pending' && currentBeat > n.time + 0.3) {
                  hasChanges = true;
                  setCombo(0);
                  setHealth(h => Math.max(0, h - 10));
                  return { ...n, status: 'miss' as const };
              }
              return n;
          });
          return hasChanges ? updated : prev;
      });

      // End Condition
      const lastNoteTime = gameNotes[gameNotes.length - 1]?.time || 0;
      if (currentBeat > lastNoteTime + 2 || health <= 0) {
          setGameState('finished');
          return;
      }

      rafRef.current = requestAnimationFrame(gameLoop);
  };

  // --- Interaction ---
  const handleHit = useCallback(() => {
      if (gameState !== 'playing') return;
      
      const hitWindow = 0.25; // beats
      // Find closest pending note
      const target = gameNotes.find(n => n.status === 'pending' && Math.abs(n.time - playbackTime) < hitWindow);

      if (target) {
          const diff = Math.abs(target.time - playbackTime);
          let points = 0;
          let text = '';
          
          if (diff < 0.08) { points = 300; text = 'PERFECT'; }
          else if (diff < 0.15) { points = 100; text = 'GREAT'; }
          else { points = 50; text = 'GOOD'; }

          setScore(s => s + points + combo * 10);
          setCombo(c => c + 1);
          setHealth(h => Math.min(100, h + 5));
          playSynthSound('hit');

          // Visual Feedback
          setHitFeedback(prev => [...prev, { id: Date.now(), text, x: 100, y: 150 }]); // Fixed pos for now
          
          // Mark note
          setGameNotes(prev => prev.map(n => n.id === target.id ? { ...n, status: 'hit' } : n));
      } else {
          // Penalty for spamming?
          playSynthSound('miss');
          setHealth(h => Math.max(0, h - 2));
      }
  }, [gameState, gameNotes, playbackTime, combo]);

  useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
          if (e.code === 'Space' || e.key === 'j' || e.key === 'f') {
              e.preventDefault();
              if (gameState === 'idle') startGame();
              else if (gameState === 'playing') handleHit();
          }
      };
      window.addEventListener('keydown', handleKey);
      return () => {
          window.removeEventListener('keydown', handleKey);
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
  }, [gameState, handleHit]);

  // Clean up feedback
  useEffect(() => {
      if (hitFeedback.length > 0) {
          const timer = setTimeout(() => {
              setHitFeedback(prev => prev.slice(1));
          }, 500);
          return () => clearTimeout(timer);
      }
  }, [hitFeedback]);


  return (
    <div className="space-y-8 animate-slideUp pb-20 w-full">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
        <div>
            <div className="inline-block px-3 py-1 bg-stone-900 text-cyan-400 border border-cyan-900/50 rounded-full text-xs font-bold tracking-wider uppercase mb-3 shadow-lg flex items-center gap-2">
                <Crown size={12} /> Master Class
            </div>
            <h2 className="text-4xl md:text-6xl font-black italic text-stone-900 tracking-tighter mb-2">
                RHYTHM <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">MASTER</span>
            </h2>
            <p className="text-stone-500 font-medium">进入“心流”状态。用指尖感受时间的微观粒子。</p>
        </div>
        
        <div className="flex gap-2">
            {LEVELS.map(l => (
                <button 
                    key={l.id}
                    onClick={() => setCurrentLevelId(l.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        currentLevelId === l.id 
                        ? 'bg-stone-900 text-white border-stone-900' 
                        : 'bg-white text-stone-400 border-stone-200 hover:border-stone-400'
                    }`}
                >
                    {l.difficulty}
                </button>
            ))}
        </div>
      </header>

      {/* --- ARCADE CABINET --- */}
      <div className="bg-[#09090b] rounded-[2rem] border-4 border-stone-800 shadow-2xl relative overflow-hidden h-[500px] flex flex-col select-none">
          
          {/* Header Stats */}
          <div className="h-16 bg-stone-900/80 backdrop-blur-md border-b border-stone-800 flex justify-between items-center px-8 z-20">
              <div className="flex items-center gap-6">
                  <div className="text-stone-400 text-xs font-bold uppercase tracking-widest">
                      <span className={level.color}>{level.title}</span> <span className="text-stone-600 mx-2">|</span> {level.bpm} BPM
                  </div>
              </div>
              <div className="flex items-center gap-8">
                  <div className="text-right">
                      <div className="text-[10px] text-stone-500 font-bold uppercase">Score</div>
                      <div className="text-2xl font-mono font-bold text-white leading-none">{score.toString().padStart(6, '0')}</div>
                  </div>
                  <div className="text-right">
                      <div className="text-[10px] text-stone-500 font-bold uppercase">Combo</div>
                      <div className={`text-2xl font-mono font-bold leading-none ${combo > 10 ? 'text-cyan-400 animate-pulse' : 'text-stone-600'}`}>{combo}x</div>
                  </div>
                  {/* Health Bar */}
                  <div className="w-32 h-2 bg-stone-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${health > 50 ? 'bg-green-500' : (health > 20 ? 'bg-amber-500' : 'bg-red-500 animate-pulse')}`} 
                        style={{ width: `${health}%` }}
                      ></div>
                  </div>
              </div>
          </div>

          {/* GAME VIEWPORT */}
          <div className="flex-1 relative overflow-hidden" ref={noteContainerRef}>
              
              {/* Grid / Horizon */}
              <div className="absolute inset-0 opacity-20" 
                   style={{ 
                       backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
                       backgroundSize: '40px 40px',
                       transform: 'perspective(500px) rotateX(20deg) scale(1.5)'
                   }}>
              </div>

              {/* The Track Lines */}
              <div className="absolute top-1/2 w-full h-px bg-stone-700"></div> {/* Center */}
              <div className="absolute top-[30%] w-full h-px bg-stone-800 border-t border-dashed border-stone-700 opacity-50"></div>
              <div className="absolute top-[70%] w-full h-px bg-stone-800 border-t border-dashed border-stone-700 opacity-50"></div>

              {/* Target Line (The Hit Zone) */}
              <div className="absolute left-32 top-0 bottom-0 w-1 bg-cyan-500/50 z-10 shadow-[0_0_20px_cyan]"></div>
              <div className="absolute left-32 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-cyan-400 rounded-full opacity-50 animate-pulse-soft"></div>

              {/* --- NOTES --- */}
              {gameNotes.map(note => {
                  if (note.status === 'hit' || note.status === 'miss') return null; // Or render explosion/fade

                  // Calculate position
                  // playbackTime is in beats. note.time is in beats.
                  // We want target (x=128px) to be at time = playbackTime
                  // Notes appear from right. x = 128 + (note.time - playbackTime) * SPEED
                  
                  const x = 128 + (note.time - playbackTime) * NOTE_SPEED;
                  
                  // Don't render if off screen
                  if (x < -50 || x > 2000) return null;

                  const y = note.pitch === 'high' ? '30%' : (note.pitch === 'mid' ? '50%' : '70%');
                  const color = note.pitch === 'high' ? 'bg-fuchsia-500' : (note.pitch === 'mid' ? 'bg-cyan-500' : 'bg-amber-500');

                  return (
                      <div 
                        key={note.id}
                        className={`absolute w-8 h-8 rounded-lg shadow-lg border-2 border-white/20 transform -translate-y-1/2 -translate-x-1/2 ${color}`}
                        style={{ left: x, top: y }}
                      >
                          <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                      </div>
                  );
              })}

              {/* Hit Feedback Text */}
              {hitFeedback.map(fb => (
                  <div 
                    key={fb.id} 
                    className="absolute left-32 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-black italic text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-float-up pointer-events-none z-30"
                  >
                      {fb.text}
                  </div>
              ))}

              {/* Start Overlay */}
              {gameState === 'idle' && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-40">
                      <button 
                        onClick={startGame}
                        className="group relative px-16 py-8 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black text-2xl tracking-widest shadow-[0_0_30px_rgba(8,145,178,0.6)] hover:shadow-[0_0_50px_rgba(6,182,212,0.8)] transition-all active:scale-95 border border-cyan-400"
                      >
                          <div className="flex items-center gap-4">
                              <MonitorPlay size={32} /> START SYSTEM
                          </div>
                      </button>
                      <div className="mt-8 text-stone-400 font-mono text-sm">
                          PRESS <span className="text-white border border-stone-600 px-2 py-1 rounded mx-1">SPACE</span> TO HIT
                      </div>
                  </div>
              )}

              {/* Game Over Overlay */}
              {gameState === 'finished' && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fadeIn">
                      <div className="text-6xl mb-6">{score > 5000 ? '🏆' : '💀'}</div>
                      <h3 className="text-5xl font-black text-white italic mb-2 tracking-tighter">
                          {health <= 0 ? 'SYSTEM FAILURE' : 'MISSION COMPLETE'}
                      </h3>
                      <div className="text-cyan-400 font-mono text-xl mb-8">FINAL SCORE: {score}</div>
                      
                      <div className="flex gap-4">
                          <button onClick={startGame} className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform flex items-center gap-2">
                              <RefreshCw size={18} /> RETRY
                          </button>
                      </div>
                  </div>
              )}
          </div>
          
          {/* Timeline / Progress Bar */}
          <div className="h-2 bg-stone-900 relative">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 transition-all duration-100 ease-linear"
                style={{ width: `${Math.min(100, (playbackTime / (level.notes[level.notes.length-1]?.time || 1)) * 100)}%` }}
              ></div>
          </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-stone-900 text-white rounded-xl">
                  <Zap size={24} />
              </div>
              <div>
                  <h4 className="font-bold text-stone-900 mb-1">视觉引导</h4>
                  <p className="text-sm text-stone-600 leading-relaxed">
                      传统的乐谱是静止的，但音乐是流动的。这个模式模拟了“视奏”时的眼动过程：你的视线必须永远走在手指前面。
                  </p>
              </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-stone-900 text-white rounded-xl">
                  <AudioWaveform size={24} />
              </div>
              <div>
                  <h4 className="font-bold text-stone-900 mb-1">听觉同步</h4>
                  <p className="text-sm text-stone-600 leading-relaxed">
                      不要只看屏幕。闭上眼睛，感受 Kick (底鼓) 和 Snare (军鼓) 的律动。你的身体比你的眼睛反应更快。
                  </p>
              </div>
          </div>
      </div>

      <style>{`
        .animate-float-up {
            animation: floatUpFade 0.5s ease-out forwards;
        }
        @keyframes floatUpFade {
            0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
            50% { transform: translate(-50%, -100%) scale(1.2); }
            100% { opacity: 0; transform: translate(-50%, -120%) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default RhythmPractice;
