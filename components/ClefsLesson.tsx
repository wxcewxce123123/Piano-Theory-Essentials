import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Compass, 
  Brain, 
  Activity, 
  Volume2, 
  Heart, 
  Trophy, 
  Sparkles, 
  RotateCcw, 
  Check, 
  X, 
  ArrowRight, 
  Play, 
  Award,
  BookMarked,
  Music,
  Tv
} from 'lucide-react';

interface NoteDef {
  step: number;        // Diatonic step relative to Middle C (C4 = 0, D4 = 1, B3 = -1, G2 = -10, etc.)
  name: string;        // "C4"
  letter: string;      // "C"
  solfege: string;     // "Do"
  displayName: string; // Group and pitch description
}

// Diatonic white notes covering G2 (deep bass) up to C6 (high treble)
const NOTES: NoteDef[] = [
  { step: -10, name: 'G2', letter: 'G', solfege: 'Sol', displayName: '大字组 G2' },
  { step: -9, name: 'A2', letter: 'A', solfege: 'La', displayName: '大字组 A2' },
  { step: -8, name: 'B2', letter: 'B', solfege: 'Si', displayName: '大字组 B2' },
  { step: -7, name: 'C3', letter: 'C', solfege: 'Do', displayName: '小字组 C3 (C3)' },
  { step: -6, name: 'D3', letter: 'D', solfege: 'Re', displayName: '小字组 D3' },
  { step: -5, name: 'E3', letter: 'E', solfege: 'Mi', displayName: '小字组 E3' },
  { step: -4, name: 'F3', letter: 'F', solfege: 'Fa', displayName: '小字组 F3' },
  { step: -3, name: 'G3', letter: 'G', solfege: 'Sol', displayName: '小字组 G3' },
  { step: -2, name: 'A3', letter: 'A', solfege: 'La', displayName: '小字组 A3' },
  { step: -1, name: 'B3', letter: 'B', solfege: 'Si', displayName: '小字组 B3' },
  { step: 0, name: 'C4', letter: 'C', solfege: 'Do', displayName: '中央 C4 (Middle C)' },
  { step: 1, name: 'D4', letter: 'D', solfege: 'Re', displayName: '小字一组 D4' },
  { step: 2, name: 'E4', letter: 'E', solfege: 'Mi', displayName: '小字一组 E4' },
  { step: 3, name: 'F4', letter: 'F', solfege: 'Fa', displayName: '小字一组 F4' },
  { step: 4, name: 'G4', letter: 'G', solfege: 'Sol', displayName: '小字一组 G4' },
  { step: 5, name: 'A4', letter: 'A', solfege: 'La', displayName: '小字一组 A4' },
  { step: 6, name: 'B4', letter: 'B', solfege: 'Si', displayName: '小字一组 B4' },
  { step: 7, name: 'C5', letter: 'C', solfege: 'Do', displayName: '小字二组 C5' },
  { step: 8, name: 'D5', letter: 'D', solfege: 'Re', displayName: '小字二组 D5' },
  { step: 9, name: 'E5', letter: 'E', solfege: 'Mi', displayName: '小字二组 E5' },
  { step: 10, name: 'F5', letter: 'F', solfege: 'Fa', displayName: '小字二组 F5' },
  { step: 11, name: 'G5', letter: 'G', solfege: 'Sol', displayName: '小字二组 G5' },
  { step: 12, name: 'A5', letter: 'A', solfege: 'La', displayName: '小字二组 A5' },
  { step: 13, name: 'B5', letter: 'B', solfege: 'Si', displayName: '小字二组 B5' },
  { step: 14, name: 'C6', letter: 'C', solfege: 'Do', displayName: '小字三组 C6' }
];

const DIATONIC_TO_SEMITONE = [0, 2, 4, 5, 7, 9, 11];

// Helper to calculate exact grand piano frequencies corresponding to steps
const getFrequencyByStep = (step: number) => {
  const octave = Math.floor(step / 7);
  const index = ((step % 7) + 7) % 7;
  const semitones = octave * 12 + DIATONIC_TO_SEMITONE[index];
  // 440Hz standard is A4 (which is 5 steps above C4, or 9 semitones)
  return 440 * Math.pow(2, (semitones - 9) / 12);
};

const playPianoTone = (freq: number, isError = false) => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0, now);
    
    if (isError) {
      // Dull, slightly out of tune / dampened buzzer-like warning pluck
      masterGain.gain.linearRampToValueAtTime(0.2, now + 0.005);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq * 0.75, now); // Detune down
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      
      osc.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);
      osc.start(now);
      
      setTimeout(() => {
        try {
          osc.stop();
          osc.disconnect();
          filter.disconnect();
          masterGain.disconnect();
          ctx.close();
        } catch(e){}
      }, 400);
      return;
    }

    // High fidelity acoustic piano emulation
    masterGain.gain.linearRampToValueAtTime(0.24, now + 0.004); // Instant mallet transient
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6); // Acoustic ringing room decay Profile
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1700, now);
    filter.frequency.exponentialRampToValueAtTime(360, now + 0.85);
    
    // Grand piano multi-string harmonic overtones definition
    const partials = [
      { ratio: 1.0, gain: 0.8, decay: 1.0 },      // Fundamental frequency
      { ratio: 2.0018, gain: 0.38, decay: 0.7 },  // First stretch-tuned octave
      { ratio: 3.0035, gain: 0.16, decay: 0.45 }, // Fifth overtone
      { ratio: 4.0070, gain: 0.09, decay: 0.28 }, // Second octave
      { ratio: 5.0110, gain: 0.03, decay: 0.18 }, // Major third overtone
    ];

    const oscillators: OscillatorNode[] = [];
    const partialGains: GainNode[] = [];

    partials.forEach(p => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * p.ratio, now);
      
      const pGain = ctx.createGain();
      pGain.gain.setValueAtTime(p.gain, now);
      pGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4 * p.decay);
      
      osc.connect(pGain);
      pGain.connect(filter);
      osc.start(now);
      oscillators.push(osc);
      partialGains.push(pGain);
    });

    // Percussive hammer attack element (wooden shock strike)
    const hammer = ctx.createOscillator();
    hammer.type = 'sine';
    hammer.frequency.setValueAtTime(freq * 5.9, now);
    
    const hammerGain = ctx.createGain();
    hammerGain.gain.setValueAtTime(0.32, now);
    hammerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);
    
    hammer.connect(hammerGain);
    hammerGain.connect(filter);
    hammer.start(now);

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    setTimeout(() => {
      try {
        oscillators.forEach(o => { o.stop(); o.disconnect(); });
        partialGains.forEach(g => g.disconnect());
        hammer.stop();
        hammer.disconnect();
        hammerGain.disconnect();
        filter.disconnect();
        masterGain.disconnect();
        ctx.close();
      } catch (err) {}
    }, 1800);
  } catch (e) {}
};

// Success feedback arpeggio chord series
const playSuccessArpeggio = () => {
  const root = 261.63; // C4
  setTimeout(() => playPianoTone(root), 0);
  setTimeout(() => playPianoTone(root * 1.25), 80);  // E4
  setTimeout(() => playPianoTone(root * 1.5), 160);  // G4
  setTimeout(() => playPianoTone(root * 2.0), 240);  // C5
};

// Helper to draw customized ledger lines depending on staff borders
const getLedgerLines = (y: number, top: number, bottom: number): number[] => {
  const lines: number[] = [];
  if (y <= top - 15) {
    for (let ly = top - 20; ly >= y - 5; ly -= 20) {
      lines.push(ly);
    }
  } else if (y >= bottom + 15) {
    for (let ly = bottom + 20; ly <= y + 5; ly += 20) {
      lines.push(ly);
    }
  }
  return lines;
};

const ClefsLesson: React.FC = () => {
  // Tabs: explorer (理论探索) vs. game (识谱训练)
  const [subTab, setSubTab] = useState<'explorer' | 'game'>('explorer');

  // EXPLORER STATE
  const [explorerClef, setExplorerClef] = useState<'treble' | 'bass' | 'alto' | 'grand'>('treble');
  const [selectedNote, setSelectedNote] = useState<NoteDef>(NOTES.find(n => n.step === 0)!); // Default to C4 Middle C

  // GAME CHALLENGE STATE
  const [gameClef, setGameClef] = useState<'treble' | 'bass' | 'alto' | 'mixed'>('treble');
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [currentQuestion, setCurrentQuestion] = useState<NoteDef | null>(null);
  const [currentQuestionClef, setCurrentQuestionClef] = useState<'treble' | 'bass' | 'alto'>('treble');
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(0);

  // Load hiscore on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('pt_clefs_highscore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // --- COORDINATE SYSTEMS IN SINGLE STAFF PREVIEW AND GRAND STAFF ---
  // Viewport center line representing ledger/staff line offsets
  // Single staff displays centered at Y=160 (Lines at 100, 120, 140, 160, 180)
  // Grand staff displays: Treble staff lines (Y=80, 100, 120, 140, 160) and Bass staff lines (Y=240, 260, 280, 300, 320)
  
  const getNoteY = (step: number, clef: 'treble' | 'bass' | 'alto' | 'grand') => {
    if (clef === 'grand') {
      if (step >= 0) {
        // Render on Treble Staff of Grand Staff (Top line Y=80, Bottom line Y=160, Middle Line 3=120 which represents B4 (step 6))
        return 120 - (step - 6) * 10;
      } else {
        // Render on Bass Staff of Grand Staff (Top line Y=240, Bottom line Y=320, Middle Line 3=280 which represents D3 (step -6))
        return 280 - (step - (-6)) * 10;
      }
    }

    // Single Staff coordinates (Line 3 is always Y=160)
    if (clef === 'treble') {
      // Middle line 3 is B4 (step = 6)
      return 160 - (step - 6) * 10;
    } else if (clef === 'bass') {
      // Middle line 3 is D3 (step = -6)
      return 160 - (step + 6) * 10;
    } else {
      // Alto clef: Middle line 3 is C4 Middle C (step = 0)
      return 160 - step * 10;
    }
  };

  const handleKeyClick = (note: NoteDef) => {
    setSelectedNote(note);
    playPianoTone(getFrequencyByStep(note.step));
  };

  // --- GAME TRAINING CORE LOGIC ---
  const launchGame = () => {
    setScore(0);
    setStreak(0);
    setLives(3);
    setGameStatus('playing');
    generateQuestion(gameClef);
  };

  const generateQuestion = (mode: 'treble' | 'bass' | 'alto' | 'mixed') => {
    setSelectedAnswer(null);
    setFeedback(null);

    // Pick active clef for this specific question
    let activeClefType: 'treble' | 'bass' | 'alto' = 'treble';
    if (mode === 'mixed') {
      const modes: ('treble' | 'bass' | 'alto')[] = ['treble', 'bass', 'alto'];
      activeClefType = modes[Math.floor(Math.random() * modes.length)];
    } else {
      activeClefType = mode;
    }

    setCurrentQuestionClef(activeClefType);

    // Range constraints to keep notations realistic and cleanly printable on the staff
    let filteredNotes = NOTES;
    if (activeClefType === 'treble') {
      // Treble core: Middle C4 up to A5 (steps 0 to 12)
      filteredNotes = NOTES.filter(n => n.step >= 0 && n.step <= 12);
    } else if (activeClefType === 'bass') {
      // Bass core: G2 up to Middle C4 (steps -10 to 0)
      filteredNotes = NOTES.filter(n => n.step >= -10 && n.step <= 0);
    } else if (activeClefType === 'alto') {
      // Alto core: C3 up to C5 (steps -7 to 7)
      filteredNotes = NOTES.filter(n => n.step >= -7 && n.step <= 7);
    }

    const correctNote = filteredNotes[Math.floor(Math.random() * filteredNotes.length)];
    setCurrentQuestion(correctNote);

    // Form answers choices list (including correct guess with 3 random distractors)
    const options = new Set<string>();
    options.add(correctNote.letter);
    while (options.size < 4) {
      const randomNote = NOTES[Math.floor(Math.random() * NOTES.length)];
      options.add(randomNote.letter);
    }
    setAnswers(Array.from(options).sort(() => Math.random() - 0.5));
  };

  const checkAnswer = (letter: string) => {
    if (feedback !== null || !currentQuestion) return;

    setSelectedAnswer(letter);
    const isCorrect = letter === currentQuestion.letter;

    if (isCorrect) {
      setFeedback('correct');
      playSuccessArpeggio();
      
      const newScore = score + 10;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);

      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('pt_clefs_highscore', newScore.toString());
      }

      setTimeout(() => {
        generateQuestion(gameClef);
      }, 1500);
    } else {
      setFeedback('incorrect');
      playPianoTone(130, true); // Play warning tone

      const newLives = lives - 1;
      setLives(newLives);
      setStreak(0);

      if (newLives <= 0) {
        setTimeout(() => {
          setGameStatus('ended');
        }, 1500);
      } else {
        setTimeout(() => {
          generateQuestion(gameClef);
        }, 1500);
      }
    }
  };

  // Keyboard definitions for active rendering
  const whiteKeys = NOTES.filter(n => n.step >= -10 && n.step <= 14);

  return (
    <div className="space-y-8 select-none">
      
      {/* HEADER SECTION */}
      <header className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-full text-xs font-semibold tracking-wider uppercase mb-3">
          <BookMarked size={12} />
          <span>阶段一：乐理基石 Foundation</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-serif font-black text-stone-900 tracking-tight flex items-center gap-3">
          五线谱与谱号大挑战 <span className="text-stone-300 font-light font-sans">|</span> <span className="text-amber-500">Clefs & Staff Masterclass</span>
        </h2>
        <p className="text-base text-stone-600 font-medium max-w-3xl leading-relaxed mt-2.5">
          五线谱是跨越时空的音乐“定位GPS”。谱号（Clefs）给纯白抽象的线条烙印上高度和音名的身份证，将绝对物理频率精确绑定在音阶世界中。
        </p>
      </header>

      {/* PRIMARY TRANSITION CONTROLS */}
      <div className="flex bg-stone-100 rounded-2xl p-1.5 w-fit gap-2 border border-stone-200">
        <button
          onClick={() => { setSubTab('explorer'); playPianoTone(261.63); }}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${subTab === 'explorer' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}
        >
          <Compass size={16} />
          <span>音标探索 Sandbox</span>
        </button>
        <button
          onClick={() => { setSubTab('game'); playPianoTone(392.0); }}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${subTab === 'game' ? 'bg-white text-stone-900 shadow-sm relative overflow-visible' : 'text-stone-500 hover:text-stone-900'}`}
        >
          <Brain size={16} />
          <span>识谱训练 Challege</span>
          <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
          </span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* TAB 1: INTERACTIVE EXPLORER */}
        {subTab === 'explorer' && (
          <motion.div
            key="tab-explorer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            
            {/* Visualizer and Piano Module */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              <div className="bg-white rounded-[2rem] border border-stone-200 p-6 md:p-8 relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[450px]">
                
                {/* Visualizer Background */}
                <div className={`absolute inset-0 transition-colors duration-700 pointer-events-none opacity-40 ${
                  explorerClef === 'treble' ? 'bg-amber-50/50' :
                  explorerClef === 'bass' ? 'bg-blue-50/50' :
                  explorerClef === 'alto' ? 'bg-emerald-50/50' : 'bg-stone-50/60'
                }`} />

                {/* Clef selection secondary bar inside workspace */}
                <div className="relative z-10 flex flex-wrap justify-between items-center gap-4 mb-6 border-b border-stone-100 pb-4">
                  <div>
                    <h3 className="font-serif font-black text-stone-900 text-lg flex items-center gap-2">
                      <Music className="text-amber-500 animate-pulse-slow" size={18} />
                      <span>学理探索五线谱刻度盘</span>
                    </h3>
                    <p className="text-xs text-stone-400 font-medium mt-0.5">点击下方钢琴琴键，观察乐谱的实时投射投影</p>
                  </div>
                  
                  {/* Clef Mode Selection */}
                  <div className="flex bg-stone-100 rounded-xl p-1 gap-1 border border-stone-200">
                    {['treble', 'bass', 'alto', 'grand'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => { setExplorerClef(mode as any); playPianoTone(329.63); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wide transition-all ${explorerClef === mode ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}
                      >
                        {mode === 'treble' && ' 高音 (G) '}
                        {mode === 'bass' && ' 低音 (F) '}
                        {mode === 'alto' && ' 中音 (C) '}
                        {mode === 'grand' && ' 大谱表 '}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG RENDERING AREA */}
                <div className="relative z-10 flex-1 flex items-center justify-center min-h-[220px]">
                  <svg width="100%" height="280" viewBox="0 0 600 280" className="overflow-visible select-none max-w-xl">
                    
                    {/* SVG Filters for glowing and drop shadow */}
                    <defs>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {explorerClef !== 'grand' ? (
                      /* SINGLE STAFF VIEWPORT (Note Center line is middle line Y=140) */
                      <g>
                        {/* Reference Line Background Highlighters */}
                        {explorerClef === 'treble' && (
                          <rect x="35" y="150" width="530" height="20" fill="rgba(217, 119, 6, 0.08)" className="animate-pulse" />
                        )}
                        {explorerClef === 'bass' && (
                          <rect x="35" y="110" width="530" height="20" fill="rgba(59, 130, 246, 0.08)" className="animate-pulse" />
                        )}
                        {explorerClef === 'alto' && (
                          <rect x="35" y="130" width="530" height="20" fill="rgba(16, 185, 129, 0.08)" className="animate-pulse" />
                        )}

                        {/* Five Staff Lines */}
                        {[0, 1, 2, 3, 4].map((i) => {
                          const ly = 100 + i * 20;
                          let lineColor = "#78716c";
                          let widthMultiplier = 1.5;

                          // Dynamic highlighting logic for GPS target anchor lines
                          if (explorerClef === 'treble' && i === 3) { lineColor = "#d97706"; widthMultiplier = 2.5; }
                          if (explorerClef === 'bass' && i === 1) { lineColor = "#3b82f6"; widthMultiplier = 2.5; }
                          if (explorerClef === 'alto' && i === 2) { lineColor = "#10b981"; widthMultiplier = 2.5; }

                          return (
                            <g key={`l-${i}`}>
                              <line 
                                x1="35" y1={ly} x2="565" y2={ly} 
                                stroke={lineColor} strokeWidth={widthMultiplier} 
                                className="transition-all duration-300"
                              />
                              {/* Reference labels on the edge of staves */}
                              {i === 0 && <text x="25" y={ly + 4} fontSize="9" fill="#a8a29e" textAnchor="end" className="font-mono">线 5</text>}
                              {i === 4 && <text x="25" y={ly + 4} fontSize="9" fill="#a8a29e" textAnchor="end" className="font-mono">线 1</text>}
                            </g>
                          );
                        })}

                        {/* Clef Icons Drawing */}
                        {explorerClef === 'treble' && (
                          <text x="75" y="150" dominantBaseline="central" fontSize="85" fill="#1c1917" className="font-serif font-black" textAnchor="middle">𝄞</text>
                        )}
                        {explorerClef === 'bass' && (
                          <text x="75" y="130" dominantBaseline="central" fontSize="80" fill="#1c1917" className="font-serif font-black" textAnchor="middle">𝄢</text>
                        )}
                        {explorerClef === 'alto' && (
                          <text x="75" y="140" dominantBaseline="central" fontSize="80" fill="#1c1917" className="font-serif font-black" textAnchor="middle">𝄡</text>
                        )}

                        {/* GPS Reference Anchors Indicator overlays */}
                        {explorerClef === 'treble' && (
                          <g opacity="0.8">
                            <circle cx="75" cy="160" r="5" fill="#d97706" className="animate-ping" />
                            <circle cx="75" cy="160" r="3.5" fill="#d97706" />
                            <text x="96" y="163" fontSize="10" fill="#d97706" fontWeight="bold">第二线: G4锚点</text>
                          </g>
                        )}
                        {explorerClef === 'bass' && (
                          <g opacity="0.8">
                            <circle cx="95" cy="120" r="5" fill="#3b82f6" className="animate-ping" />
                            <circle cx="95" cy="120" r="3.5" fill="#3b82f6" />
                            <text x="116" y="123" fontSize="10" fill="#3b82f6" fontWeight="bold">第四线: F3锚点</text>
                          </g>
                        )}
                        {explorerClef === 'alto' && (
                          <g opacity="0.8">
                            <circle cx="75" cy="140" r="5" fill="#10b981" className="animate-ping" />
                            <circle cx="75" cy="140" r="3.5" fill="#10b981" />
                            <text x="96" y="143" fontSize="10" fill="#10b981" fontWeight="bold">第三线: C4中央C锚点</text>
                          </g>
                        )}

                        {/* Draw Ledger Lines and Note Head with transition animations */}
                        {(() => {
                          const noteY = getNoteY(selectedNote.step, explorerClef);
                          const ledgerLines = getLedgerLines(noteY, 100, 180);
                          
                          return (
                            <g key={selectedNote.name} className="transition-all duration-300">
                              {/* Ledger lines */}
                              {ledgerLines.map((ly, idx) => (
                                <line key={`lg-${idx}`} x1="215" y1={ly} x2="265" y2={ly} stroke="#1c1917" strokeWidth="2" />
                              ))}

                              {/* Glowing target reticle indicator */}
                              <ellipse cx="240" cy={noteY} rx="18" ry="14" fill="none" stroke={
                                explorerClef === 'treble' ? '#d97706' : explorerClef === 'bass' ? '#3b82f6' : '#10b981'
                              } strokeWidth="1" className="animate-ping" opacity="0.25" />

                              {/* Note Head drawing with dynamic rotative angle */}
                              <ellipse cx="240" cy={noteY} rx="11" ry="8" transform={`rotate(-15 240 ${noteY})`} fill="#1c1917" filter="url(#glow)" />
                              
                              {/* Stem drawing depends on high/low position */}
                              {noteY >= 140 ? (
                                <line x1="250" y1={noteY} x2="250" y2={noteY - 65} stroke="#1c1917" strokeWidth="2" />
                              ) : (
                                <line x1="230" y1={noteY} x2="230" y2={noteY + 65} stroke="#1c1917" strokeWidth="2" />
                              )}

                              {/* Dynamic details tag floating over note */}
                              <g transform={`translate(265, ${noteY})`}>
                                <rect x="5" y="-14" width="100" height="28" rx="8" fill="#1c1917" opacity="0.9" />
                                <text x="55" y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="extrabold">{selectedNote.name} ({selectedNote.solfege})</text>
                              </g>
                            </g>
                          );
                        })()}
                      </g>
                    ) : (
                      /* GRAND STAFF MAJESTIC CONNECTED VIEW (Treble:80-160, Bass:240-320) */
                      <g>
                        {/* Braces and Left Bar Connector */}
                        <line x1="40" y1="80" x2="40" y2="320" stroke="#1c1917" strokeWidth="4" />
                        <path d="M40 80 Q 0 80 0 130 Q 0 190 25 190 Q 0 190 0 250 Q 0 300 40 300" fill="none" stroke="#1c1917" strokeWidth="2.5" />
                        
                        {/* Treble lines */}
                        {[0, 1, 2, 3, 4].map((i) => (
                          <line key={`gt-${i}`} x1="40" y1={80 + i * 20} x2="560" y2={80 + i * 20} stroke="#78716c" strokeWidth="1.5" />
                        ))}
                        <text x="80" y="115" dominantBaseline="central" fontSize="75" fill="#1c1917" className="font-serif font-black" textAnchor="middle">𝄞</text>

                        {/* Bass lines */}
                        {[0, 1, 2, 3, 4].map((i) => (
                          <line key={`gb-${i}`} x1="40" y1={220 + i * 20} x2="560" y2={220 + i * 20} stroke="#78716c" strokeWidth="1.5" />
                        ))}
                        <text x="80" y="250" dominantBaseline="central" fontSize="70" fill="#1c1917" className="font-serif font-black" textAnchor="middle">𝄢</text>

                        {/* Dynamically drawing selected note and its ledger bridge */}
                        {(() => {
                          const noteY = getNoteY(selectedNote.step, 'grand');
                          const isTrebleStaff = selectedNote.step >= 0;
                          
                          // Custom ledger generator for Grand Staff limits
                          // Treble bottom is 160, top is 80. Bass top is 220, bottom is 300
                          let ledgerLines: number[] = [];
                          if (selectedNote.step === 0) {
                            // Middle C standard bridge ledger line at Y=190
                            ledgerLines = [190];
                          } else if (isTrebleStaff) {
                            ledgerLines = getLedgerLines(noteY, 80, 160);
                          } else {
                            ledgerLines = getLedgerLines(noteY, 220, 300);
                          }

                          return (
                            <g key={`grand-${selectedNote.name}`}>
                              {/* Ledger bridge bars */}
                              {ledgerLines.map((ly, idx) => (
                                <line key={`lg-${idx}`} x1="215" y1={ly} x2="265" y2={ly} stroke="#1c1917" strokeWidth="2" />
                              ))}

                              {/* Highlight ledger guides */}
                              {selectedNote.step === 0 && (
                                <g opacity="0.6">
                                  <line x1="40" y1="190" x2="215" y2="190" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3"/>
                                  <line x1="265" y1="190" x2="560" y2="190" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3"/>
                                  <text x="50" y="185" fontSize="9" fill="#10b981" fontWeight="bold">中央 C (C4) 虚拟轨道桥梁</text>
                                </g>
                              )}

                              {/* Note Head ellipse */}
                              <ellipse cx="240" cy={noteY} rx="11" ry="8" transform={`rotate(-15 240 ${noteY})`} fill={selectedNote.step === 0 ? "#10b981" : "#1c1917"} filter="url(#glow)" />
                              
                              {/* Stem drawing bounds */}
                              {noteY >= 190 ? (
                                <line x1="250" y1={noteY} x2="250" y2={noteY - 65} stroke="#1c1917" strokeWidth="2" />
                              ) : (
                                <line x1="230" y1={noteY} x2="230" y2={noteY + 65} stroke="#1c1917" strokeWidth="2" />
                              )}

                              {/* Detail layout Box */}
                              <g transform={`translate(265, ${noteY})`}>
                                <rect x="5" y="-14" width="100" height="28" rx="8" fill="#1c1917" opacity="0.9" />
                                <text x="55" y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="extrabold">{selectedNote.name} ({selectedNote.solfege})</text>
                              </g>
                            </g>
                          );
                        })()}
                      </g>
                    )}
                  </svg>
                </div>

                {/* VISUAL RANGE LEGEND DETAILS */}
                <div className="relative z-10 flex flex-wrap justify-between items-center gap-4 bg-stone-50 border border-stone-200/50 p-4 rounded-2xl mt-4">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-stone-900 rounded-sm"></div>
                      <span className="text-xs font-semibold text-stone-500">实体谱线 5 Lines</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-0.5 bg-stone-900"></div>
                      <span className="text-xs font-semibold text-stone-500">臨時加线 Ledger Line</span>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                    物理频率: {getFrequencyByStep(selectedNote.step).toFixed(2)} Hz
                  </div>
                </div>
              </div>

              {/* INTERACTIVE HARMONIOUS PIANO COMPONENT */}
              <div className="bg-white rounded-[2rem] border border-stone-200 p-6 shadow-sm overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-stone-400 tracking-widest uppercase">钢琴联动琴键 / Acoustic Octave Range Map (G2 ~ C6)</span>
                  <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">白键: {whiteKeys.length} 个音度</span>
                </div>
                
                {/* Scrollable White and Black Key layout */}
                <div className="relative overflow-x-auto pb-4 pt-1 flex justify-center">
                  <div className="relative flex select-none min-w-[560px]" style={{ height: '180px' }}>
                    {whiteKeys.map((note, index) => {
                      const isSelected = selectedNote.step === note.step;
                      
                      // Highlight matching clef colors
                      let activeBg = 'bg-amber-400 border-amber-500 text-stone-950 font-black';
                      if (explorerClef === 'bass') activeBg = 'bg-blue-500 border-blue-600 text-white font-black';
                      if (explorerClef === 'alto') activeBg = 'bg-emerald-500 border-emerald-600 text-white font-black';
                      if (note.step === 0 && explorerClef === 'grand') activeBg = 'bg-emerald-500 border-emerald-600 text-white font-black';

                      return (
                        <div 
                          key={note.step}
                          onClick={() => handleKeyClick(note)}
                          className={`relative select-none w-8 h-full border-r border-stone-200 border-b border-l rounded-b-lg flex flex-col justify-end pb-3 items-center cursor-pointer transition-all ${
                            isSelected 
                              ? `${activeBg} shadow-inner -translate-y-1 scale-95` 
                              : 'bg-white hover:bg-stone-50 text-stone-400 active:bg-stone-100 hover:shadow-md'
                          }`}
                        >
                          {/* Note Label Letter */}
                          <span className="text-[10px] font-black">{note.letter}</span>
                          <span className="text-[8px] opacity-75 font-mono">{note.name}</span>

                          {/* Extra black key drawing behind overlay */}
                          {['C', 'D', 'F', 'G', 'A'].includes(note.letter) && index < whiteKeys.length - 1 && (
                            <div 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                playPianoTone(getFrequencyByStep(note.step) * 1.05946); // chromatic shift sharp
                              }}
                              className="absolute top-0 -right-2 w-4 h-24 bg-stone-950 hover:bg-stone-800 active:bg-amber-500 rounded-b-md z-30 transition-colors shadow-md border-b border-stone-800"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Educational Sidebar / Accordion */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Clever anchor explanation */}
              <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-[-30%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[50px] rounded-full pointer-events-none" />
                <h3 className="font-serif font-black text-xl text-amber-400 mb-2">GPS 定位锚原理</h3>
                <p className="text-xs text-stone-300 leading-relaxed font-normal mb-4">
                  为什么五线谱能够记录无穷变幻的音乐？因为有了谱号锁定的黄金锚点！
                </p>
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-3 items-start">
                    <span className="text-xl leading-none">𝄞</span>
                    <div>
                      <h4 className="text-xs font-extrabold text-amber-300 uppercase">G谱号 (高音阶)</h4>
                      <p className="text-[10.5px] text-stone-300 mt-1">花体花纹字母 G 演变，其螺线腹部盘旋环绕在第二线，将<b>第二线锁定为 G4音高 (392Hz)</b>。</p>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-3 items-start">
                    <span className="text-xl leading-none">𝄢</span>
                    <div>
                      <h4 className="text-xs font-extrabold text-blue-300 uppercase">F谱号 (低音阶)</h4>
                      <p className="text-[10.5px] text-stone-300 mt-1">花体花纹字母 F 衍生，右侧两个对称的小圆球圆圈包围着夹护着<b>第四线，将它强制设为 F3音值 (174Hz)</b>。</p>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-3 items-start">
                    <span className="text-xl leading-none">𝄡</span>
                    <div>
                      <h4 className="text-xs font-extrabold text-emerald-300 uppercase">C谱号 (中音阶)</h4>
                      <p className="text-[10.5px] text-stone-300 mt-1">花体字母 C 组成，中心三角缺口对称指向第几线，其便作为<b>C4 (中央C，261Hz) 的定线锚点</b>。</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informational FAQ Grid */}
              <div className="bg-white rounded-[2rem] border border-stone-200 p-6 shadow-sm">
                <h3 className="font-serif font-black text-stone-900 text-lg mb-4 flex items-center gap-1.5 border-b border-stone-100 pb-2">
                  <BookOpen size={16} className="text-amber-500" />
                  <span>核心乐理小课堂</span>
                </h3>
                
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-stone-900 flex items-center gap-1.5"><Sparkles size={11} className="text-amber-500" /> 什么是“加线” (Ledger Lines)?</h4>
                    <p className="text-stone-500 leading-relaxed mt-1">当音符太高或太低超出五条主线时，我们会在线上或线下额外画一截临时小短横，称为加线。它就像临时搭建的空中阁楼或阶梯地下室。</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-900 flex items-center gap-1.5"><Sparkles size={11} className="text-amber-500" /> 什么是“大谱表” (Grand Staff)?</h4>
                    <p className="text-stone-500 leading-relaxed mt-1">钢琴专用的联合谱表。利用左侧的花括号（Brace）将一个高音五线谱（右手弹奏）和一个低音五线谱（左手弹奏）牢牢绑在一起组合而成，两者中间恰好对称悬停着“中央C”。</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-900 flex items-center gap-1.5"><Sparkles size={11} className="text-amber-500" /> 音符在线和在间有什么区别？</h4>
                    <p className="text-stone-500 leading-relaxed mt-1">五线谱通过“音阶交错”模式记录。即一个落在<b>线（Line）</b>上的音到与其相邻最近的落在<b>间（Space）</b>上的音，物理属性上代表距离为二度音（仅一步之遥）。</p>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: GAME TRAINING SIGHT SIGHT READING CHALLENGE */}
        {subTab === 'game' && (
          <motion.div
            key="tab-game"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6"
          >
            {/* Setting up Game parameters before clicking Start */}
            {gameStatus === 'idle' && (
              <div className="bg-white rounded-[2.5rem] border border-stone-200 p-8 text-center max-w-2xl mx-auto flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
                <div className="absolute top-[-30%] left-[-20%] w-[60%] h-[60%] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="w-16 h-16 bg-amber-400/10 text-amber-500 rounded-full flex items-center justify-center mb-6">
                  <Brain size={32} className="animate-bounce" />
                </div>

                <h3 className="text-3xl font-serif font-black text-stone-900 mb-3">识谱速读特特训营</h3>
                <p className="text-stone-500 text-sm max-w-md leading-relaxed mb-6">
                  你将面对随机丢出的五线谱音符，在有限的 3 颗心心生命值限制下，尽可能快和准地认出音名字母，挑战并刷新你的世界最高纪录吧！
                </p>

                {/* Training Mode configuration */}
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-widest block mb-3">特训谱号范围</span>
                <div className="flex gap-2 flex-wrap justify-center mb-8">
                  {['treble', 'bass', 'alto', 'mixed'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => { setGameClef(mode as any); playPianoTone(329.63); }}
                      className={`px-5 py-2.5 rounded-2xl text-xs font-black select-none tracking-wide transition-all ${
                        gameClef === mode 
                          ? 'bg-amber-400 hover:bg-amber-500 text-stone-950 scale-105 shadow-md border-2 border-stone-50' 
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                      }`}
                    >
                      {mode === 'treble' && '𝄞 高音谱号特训'}
                      {mode === 'bass' && '𝄢 低音谱号特训'}
                      {mode === 'alto' && '𝄡 中音谱号特训'}
                      {mode === 'mixed' && '🛡️ 全能大乱斗'}
                    </button>
                  ))}
                </div>

                <div className="flex justify-center gap-6 mb-8 w-full border-t border-stone-100 pt-6">
                  <div className="flex flex-col items-center gap-1">
                    <Trophy size={18} className="text-amber-500" />
                    <span className="text-xs font-extrabold text-stone-400 uppercase">最高纪录</span>
                    <span className="text-lg font-black text-stone-900 font-mono">{highScore} Pts</span>
                  </div>
                  <div className="w-px bg-stone-200"></div>
                  <div className="flex flex-col items-center gap-1">
                    <Heart size={18} className="text-red-500" />
                    <span className="text-xs font-extrabold text-stone-400 uppercase">特训生命值</span>
                    <span className="text-lg font-black text-stone-900">3 颗爱心</span>
                  </div>
                </div>

                <button
                  onClick={launchGame}
                  className="px-8 py-4 bg-stone-900 text-white rounded-2xl font-serif font-black hover:bg-stone-850 transform active:scale-95 transition-all text-sm flex items-center gap-2 shadow-xl shadow-stone-950/10 cursor-pointer"
                >
                  <Play size={16} fill="white" />
                  <span>开启识谱挑战之旅</span>
                </button>
              </div>
            )}

            {/* Core active Quiz panel */}
            {gameStatus === 'playing' && currentQuestion && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto w-full">
                
                {/* Score Stats and Lives */}
                <div className="lg:col-span-3 flex flex-col justify-between bg-stone-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
                  <div className="absolute top-[-30%] left-[-20%] w-[60%] h-[60%] bg-amber-500/10 blur-[50px] rounded-full pointer-events-none" />
                  
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                      <Tv size={16} className="text-amber-400" />
                      <span className="text-xs font-bold uppercase tracking-widest text-amber-400">实时特训控制面板</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold tracking-widest block">当前谱号</span>
                      <span className="text-xl font-serif font-black mt-1 block">
                        {currentQuestionClef === 'treble' && '𝄞 高音谱表'}
                        {currentQuestionClef === 'bass' && '𝄢 低音谱表'}
                        {currentQuestionClef === 'alto' && '𝄡 中音谱表'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase font-bold tracking-widest block">系统得分</span>
                        <span className="text-2xl font-black font-mono text-amber-300">{score} </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase font-bold tracking-widest block">答题连击</span>
                        <span className="text-2xl font-black font-mono text-orange-400">⚡{streak}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold tracking-widest block mb-1">健康值 HP</span>
                      <div className="flex gap-1.5">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Heart
                            key={i}
                            size={16}
                            className={`transition-colors duration-300 ${i < lives ? 'text-red-500 fill-red-500' : 'text-stone-700'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { setGameStatus('idle'); playPianoTone(196); }}
                    className="mt-8 border border-white/10 hover:bg-white/5 text-xs text-stone-300 py-2.5 rounded-xl transition-all cursor-pointer font-bold select-none text-center block w-full uppercase font-mono tracking-wider z-10"
                  >
                    退出特训 EXIT TRIAL
                  </button>
                </div>

                {/* Staff Presentation Board */}
                <div className="lg:col-span-9 flex flex-col gap-6">
                  
                  <div className="bg-white rounded-[2.5rem] border border-stone-200 p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-sm h-[320px]">
                    
                    {/* Glowing colored mask on right/wrong answers */}
                    <AnimatePresence>
                      {feedback === 'correct' && (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 0.08 }} 
                          exit={{ opacity: 0 }} 
                          className="absolute inset-0 bg-emerald-500 pointer-events-none z-0" 
                        />
                      )}
                      {feedback === 'incorrect' && (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 0.08 }} 
                          exit={{ opacity: 0 }} 
                          className="absolute inset-0 bg-red-500 pointer-events-none z-0" 
                        />
                      )}
                    </AnimatePresence>

                    {/* Standardized single staff viewport */}
                    <svg width="100%" height="240" viewBox="0 0 500 240" className="overflow-visible select-none max-w-sm relative z-10">
                      
                      {/* Anchor Helper line overlays when answering */}
                      {feedback && (
                        <g opacity="0.3" className="animate-pulse">
                          {currentQuestionClef === 'treble' && <rect x="35" y="150" width="430" height="20" fill="#d97706" />}
                          {currentQuestionClef === 'bass' && <rect x="35" y="110" width="430" height="20" fill="#3b82f6" />}
                          {currentQuestionClef === 'alto' && <rect x="35" y="130" width="430" height="20" fill="#10b981" />}
                        </g>
                      )}

                      {/* Staff Horizontal lines */}
                      {[0, 1, 2, 3, 4].map((i) => {
                        const ly = 80 + i * 20;
                        return (
                          <line key={`gl-${i}`} x1="35" y1={ly} x2="465" y2={ly} stroke="#78716c" strokeWidth="1.5" />
                        );
                      })}

                      {/* Respective Clefs */}
                      {currentQuestionClef === 'treble' && (
                        <text x="75" y="130" dominantBaseline="central" fontSize="85" fill="#1c1917" className="font-serif font-black" textAnchor="middle">𝄞</text>
                      )}
                      {currentQuestionClef === 'bass' && (
                        <text x="75" y="110" dominantBaseline="central" fontSize="80" fill="#1c1917" className="font-serif font-black" textAnchor="middle">𝄢</text>
                      )}
                      {currentQuestionClef === 'alto' && (
                        <text x="75" y="120" dominantBaseline="central" fontSize="80" fill="#1c1917" className="font-serif font-black" textAnchor="middle">𝄡</text>
                      )}

                      {/* Flash feedback animations */}
                      {feedback && (
                        <g transform="translate(140, 120)">
                          {feedback === 'correct' ? (
                            <g className="animate-pop-in">
                              <circle cx="0" cy="0" r="22" fill="#10b981" />
                              <Check cx="0" cy="0" size={24} className="text-white relative left-[-12px] top-[-12px]" strokeWidth={4} />
                            </g>
                          ) : (
                            <g className="animate-pop-in">
                              <circle cx="0" cy="0" r="22" fill="#ef4444" />
                              <X cx="0" cy="0" size={24} className="text-white relative left-[-12px] top-[-12px]" strokeWidth={4} />
                            </g>
                          )}
                        </g>
                      )}

                      {/* Question note painting with ledger computation */}
                      {(() => {
                        const qY = getNoteY(currentQuestion.step, currentQuestionClef);
                        const ledgerLines = getLedgerLines(qY, 80, 160);

                        return (
                          <g className="animate-pop-in">
                            {/* Generates necessary ledger overlays */}
                            {ledgerLines.map((ly, idx) => (
                              <line key={`qlg-${idx}`} x1="215" y1={ly} x2="265" y2={ly} stroke="#1c1917" strokeWidth="2" />
                            ))}

                            {/* Note Head ellipse (glowing on feedback) */}
                            <ellipse 
                              cx="240" 
                              cy={qY} 
                              rx="11" 
                              ry="8" 
                              transform={`rotate(-15 240 ${qY})`} 
                              fill={feedback === 'correct' ? '#10b981' : feedback === 'incorrect' ? '#ef4444' : '#1c1917'} 
                              className="transition-colors duration-300"
                            />

                            {/* Stem directionality depending on height */}
                            {qY >= 120 ? (
                              <line x1="250" y1={qY} x2="250" y2={qY - 65} stroke="#1c1917" strokeWidth="2" />
                            ) : (
                              <line x1="230" y1={qY} x2="230" y2={qY + 65} stroke="#1c1917" strokeWidth="2" />
                            )}
                          </g>
                        );
                      })()}
                    </svg>

                    {/* Hint overlay tags */}
                    {feedback === null && (
                      <span className="text-xs font-bold text-stone-400 bg-stone-100 px-4 py-1.5 rounded-full select-none absolute bottom-4 animate-bounce">
                        请认出上图中的音名 C / D / E / F ...
                      </span>
                    )}

                    {/* Solfege answer helper showing up on failure only */}
                    {feedback === 'incorrect' && (
                      <span className="text-xs font-black text-red-500 bg-red-50 px-4 py-1.5 rounded-full z-10 absolute bottom-4">
                        正确解是: {currentQuestion.letter}（{currentQuestion.displayName}）
                      </span>
                    )}
                  </div>

                  {/* Multiple Input Selection Grid */}
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                    {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((letter) => {
                      const isChosen = selectedAnswer === letter;
                      const isCorrectAnswer = currentQuestion.letter === letter;
                      
                      let btnColor = 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200 active:scale-95';
                      if (feedback && isChosen) {
                        btnColor = isCorrectAnswer 
                          ? 'bg-emerald-500 text-white border-emerald-600 scale-105 shadow-md shadow-emerald-500/20' 
                          : 'bg-red-500 text-white border-red-600 scale-95';
                      } else if (feedback && isCorrectAnswer) {
                        btnColor = 'bg-emerald-500 text-white border-emerald-600 scale-105 shadow';
                      }

                      return (
                        <button
                          key={letter}
                          disabled={feedback !== null}
                          onClick={() => checkAnswer(letter)}
                          className={`py-5 rounded-2xl border text-xl font-bold font-serif transition-all duration-300 disabled:cursor-not-allowed cursor-pointer flex flex-col items-center justify-center ${btnColor}`}
                        >
                          <span>{letter}</span>
                          <span className="text-[9px] uppercase tracking-wider opacity-60 font-sans mt-1">
                            {letter === 'C' && 'Do'}
                            {letter === 'D' && 'Re'}
                            {letter === 'E' && 'Mi'}
                            {letter === 'F' && 'Fa'}
                            {letter === 'G' && 'Sol'}
                            {letter === 'A' && 'La'}
                            {letter === 'B' && 'Si'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                </div>

              </div>
            )}

            {/* Game Over Screen */}
            {gameStatus === 'ended' && (
              <div className="bg-white rounded-[2.5rem] border border-stone-200 p-10 text-center max-w-md mx-auto flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
                <style>{`
                  @keyframes successConfetti {
                    0% { transform: scale(0.9); opacity: 0; }
                    100% { transform: scale(1.1); opacity: 1; }
                  }
                  .confetti-glow { animation: successConfetti 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                `}</style>
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="w-20 h-20 bg-amber-400 text-stone-950 rounded-full flex items-center justify-center mb-6 shadow-xl confetti-glow">
                  <Award size={40} strokeWidth={2} />
                </div>

                <h3 className="text-3xl font-serif font-black text-stone-900 mb-2">特训挑战结束</h3>
                <p className="text-xs uppercase tracking-widest font-extrabold text-amber-600 mb-6 bg-amber-50 px-4 py-1.5 rounded-full">
                  SIGHT SIGHT-READING COMPLETED
                </p>

                <div className="grid grid-cols-2 gap-4 w-full bg-stone-50 border border-stone-200/50 rounded-2xl p-4 mb-8">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-stone-400 uppercase font-black tracking-wider">特训得分</span>
                    <span className="text-3xl font-black font-mono text-stone-900 mt-1">{score} Pts</span>
                  </div>
                  <div className="flex flex-col items-center border-l border-stone-200">
                    <span className="text-[10px] text-stone-400 uppercase font-black tracking-wider">世界最高纪录</span>
                    <span className="text-3xl font-black font-mono text-amber-600 mt-1">{highScore} Pts</span>
                  </div>
                </div>

                <div className="flex gap-4 w-full">
                  <button
                    onClick={launchGame}
                    className="flex-1 py-4 bg-stone-900 hover:bg-stone-850 text-white rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={14} />
                    <span>重新进入特训</span>
                  </button>
                  <button
                    onClick={() => { setGameStatus('idle'); playPianoTone(261); }}
                    className="flex-1 py-4 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-2xl text-xs font-bold transition-all border border-stone-200 active:scale-95 cursor-pointer"
                  >
                    返回主界面
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        )}

      </AnimatePresence>

      <style>{`
        .animate-pop-in { animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.25) forwards; transform-origin: center; }
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.6); } 100% { opacity: 1; transform: scale(1); } }
        .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

    </div>
  );
};

export default ClefsLesson;
