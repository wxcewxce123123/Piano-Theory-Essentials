import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Music, Sparkles, Gamepad2, Check, RefreshCw, 
  Trophy, BookOpen, Volume2, Sliders, Activity, Award, Star,
  Smartphone, Eye, HelpCircle, AlertCircle
} from 'lucide-react';

type PolyrhythmType = '2vs3' | '3vs4';
type SoundKit = 'bell' | 'marimba' | 'synth';

interface Masterpiece {
  title: string;
  composer: string;
  meter: string;
  description: string;
  tripletUsage: string;
  rhythmTip: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const TripletsLesson: React.FC = () => {
  // Config states
  const [polyrhythm, setPolyrhythm] = useState<PolyrhythmType>('2vs3');
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(70);
  const [soundKit, setSoundKit] = useState<SoundKit>('bell');
  const [volume, setVolume] = useState(70);
  const [showHelperGrid, setShowHelperGrid] = useState(true);

  // Mnemonic interactive game state
  const [lastLeftTap, setLastLeftTap] = useState<number>(0);
  const [lastRightTap, setLastRightTap] = useState<number>(0);
  const [tapHistory, setTapHistory] = useState<{ time: number; hand: 'left' | 'right' }[]>([]);
  const [gameScore, setGameScore] = useState<number>(0);
  const [gameFeedback, setGameFeedback] = useState<string>('使用键盘 [A键] 敲击左手(两连音)，[L键] 敲击右手(三连音)！一起对齐下拍子！');
  const [accuracyRating, setAccuracyRating] = useState<string>('');

  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Canvas and audio engine refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  const timerIDRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  // State refs for multi-threaded sound synchronization
  const bpmRef = useRef(bpm);
  const polyrhythmRef = useRef(polyrhythm);
  const soundKitRef = useRef(soundKit);
  const volumeRef = useRef(volume);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { polyrhythmRef.current = polyrhythm; }, [polyrhythm]);
  useEffect(() => { soundKitRef.current = soundKit; }, [soundKit]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  const startTimeRef = useRef<number>(0);
  const nextAlignTimeRef = useRef<number>(0); // Time for the next common beat cycle (beat 1 align)
  
  // Custom synth frequencies based on SoundKit
  const playPulseSwell = (time: number, frequency: number, secondary: boolean = false) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const masterVolume = (volumeRef.current / 100) * 0.15;

    if (soundKitRef.current === 'bell') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, time);
      // Bell physical envelope: instantaneous surge, slow decay with partial metallic overtones
      gain.gain.setValueAtTime(masterVolume * 1.5, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + (secondary ? 0.3 : 0.6));
      
      // Ring metallic chime harmonic overlay
      const overtone = ctx.createOscillator();
      const overtoneGain = ctx.createGain();
      overtone.connect(overtoneGain);
      overtoneGain.connect(ctx.destination);
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(frequency * 2.51, time); // Non-musical overtone
      overtoneGain.gain.setValueAtTime(masterVolume * 0.4, time);
      overtoneGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
      overtone.start(time);
      overtone.stop(time + 0.2);

    } else if (soundKitRef.current === 'marimba') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency * 0.5, time); // Rich warm fundamental
      gain.gain.setValueAtTime(masterVolume * 1.8, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
      
      // Quick wooden stick thud click transient
      const woodthud = ctx.createOscillator();
      const woodgain = ctx.createGain();
      woodthud.connect(woodgain);
      woodgain.connect(ctx.destination);
      woodthud.type = 'sine';
      woodthud.frequency.setValueAtTime(1400, time);
      woodgain.gain.setValueAtTime(masterVolume * 0.5, time);
      woodgain.gain.exponentialRampToValueAtTime(0.001, time + 0.015);
      woodthud.start(time);
      woodthud.stop(time + 0.02);

    } else if (soundKitRef.current === 'synth') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(frequency * 0.75, time);
      // Soft modern low-pass filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, time);
      filter.Q.setValueAtTime(5, time);
      
      osc.disconnect(gain);
      osc.connect(filter);
      filter.connect(gain);

      gain.gain.setValueAtTime(masterVolume * 1.0, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
    }

    osc.start(time);
    osc.stop(time + 0.7);
  };

  // Standard scheduler for synchronous Web Audio API events
  const scheduler = () => {
    if (!audioCtxRef.current || !isPlayingRef.current) return;

    const scheduleAheadTime = 0.2;
    const secondsPerFullCycle = (60.0 / bpmRef.current) * 2; // Time to complete 1 cycle of polyrhythm

    while (nextAlignTimeRef.current < audioCtxRef.current.currentTime + scheduleAheadTime) {
      const cycleStart = nextAlignTimeRef.current;
      
      if (polyrhythmRef.current === '2vs3') {
        // Duplet (Left Hand): Hits at 0, 1.0/2 (middle of cycle)
        playPulseSwell(cycleStart, 261.63, false); // C4: Bottom base Anchor
        playPulseSwell(cycleStart + secondsPerFullCycle / 2, 261.63, true);

        // Triplet (Right Hand): Hits at 0, 1/3, 2/3 of cycle
        // Beat 1 aligns at 0 (C5 Bell chime)
        playPulseSwell(cycleStart, 523.25, false); // C5: Top aligned pure chime
        playPulseSwell(cycleStart + secondsPerFullCycle / 3, 392.00, true); // G4
        playPulseSwell(cycleStart + (secondsPerFullCycle * 2) / 3, 392.00, true); // G4
      } else {
        // 3 vs 4 Polyrhythm
        // Left hand (3 divisions): 0, 1/3, 2/3 of cycle
        playPulseSwell(cycleStart, 261.63, false);
        playPulseSwell(cycleStart + secondsPerFullCycle / 3, 293.66, true); // D4
        playPulseSwell(cycleStart + (secondsPerFullCycle * 2) / 3, 293.66, true); // D4

        // Right hand (4 divisions): 0, 1/4, 2/4, 3/4 of division cycle
        playPulseSwell(cycleStart, 523.25, false);
        playPulseSwell(cycleStart + secondsPerFullCycle / 4, 440.00, true); // A4
        playPulseSwell(cycleStart + (secondsPerFullCycle * 2) / 4, 440.00, true); // A4
        playPulseSwell(cycleStart + (secondsPerFullCycle * 3) / 4, 440.00, true); // A4
      }

      nextAlignTimeRef.current += secondsPerFullCycle;
    }

    timerIDRef.current = window.setTimeout(scheduler, 40.0);
  };

  // --- ORBITAL MANDALA HIGH-PERFORMANCE CANVAS RENDER ---
  const drawOrbitalSystem = () => {
    if (!canvasRef.current || !audioCtxRef.current || !isPlayingRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(centerX, centerY) - 25;

    const currentTime = audioCtxRef.current.currentTime;
    const secondsPerFullCycle = (60.0 / bpmRef.current) * 2;
    const elapsed = Math.max(0, currentTime - startTimeRef.current);
    const progress = (elapsed % secondsPerFullCycle) / secondsPerFullCycle; // Cycle progress [0 - 1]

    // 1. Draw central core star (Align moment pulse)
    const isAlignMoment = (progress < 0.04) || (progress > 0.96);
    const corePulse = isAlignMoment ? 18 + Math.sin(Date.now() / 30) * 4 : 10;
    
    // Draw background grid rays (alignments sectors)
    ctx.strokeStyle = '#334155'; // Slate 700
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);

    const raysCount = polyrhythm === '2vs3' ? 6 : 12; // Common multiple of sectors
    for (let r = 0; r < raysCount; r++) {
      const angle = (r * Math.PI * 2) / raysCount - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(angle) * maxRadius, centerY + Math.sin(angle) * maxRadius);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw orbital path tracks
    const innerTrackRad = maxRadius * 0.55;
    const outerTrackRad = maxRadius * 0.90;

    // Track 1: Inner (Left Hand)
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerTrackRad, 0, Math.PI * 2);
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Track 2: Outer (Right Hand)
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerTrackRad, 0, Math.PI * 2);
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 2. Draw static alignment targets (Top alignment point is -PI/2 or 12 o'clock)
    ctx.beginPath();
    ctx.arc(centerX, centerY - innerTrackRad, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#1E293B';
    ctx.fill();
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY - outerTrackRad, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#1E293B';
    ctx.fill();
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Text label for alignment hub
    ctx.font = 'bold 9px font-mono';
    ctx.fillStyle = '#94A3B8';
    ctx.textAlign = 'center';
    ctx.fillText('合拍起点 (ALIGN)', centerX, centerY - outerTrackRad - 12);

    // 3. Draw Subdiv impact markers around tracks
    const divLeft = polyrhythm === '2vs3' ? 2 : 3;
    const divRight = polyrhythm === '2vs3' ? 3 : 4;

    // Draw Left hand subdivisions (Inner Ring)
    for (let l = 0; l < divLeft; l++) {
      const angle = (l * Math.PI * 2) / divLeft - Math.PI / 2;
      const x = centerX + Math.cos(angle) * innerTrackRad;
      const y = centerY + Math.sin(angle) * innerTrackRad;
      
      // Flash glowing ring on impact
      const isOver = Math.abs(((progress * divLeft) % 1)) < 0.08 && Math.floor(progress * divLeft) === l;
      
      ctx.beginPath();
      ctx.arc(x, y, isOver ? 9 : 5, 0, Math.PI * 2);
      ctx.fillStyle = isOver ? '#60A5FA' : '#1E293B';
      ctx.fill();
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (showHelperGrid) {
        ctx.font = '8px font-mono';
        ctx.fillStyle = '#60A5FA';
        ctx.fillText(`左-${l + 1}`, x, y + (l === 0 ? -12 : 14));
      }
    }

    // Draw Right hand subdivisions (Outer Ring)
    for (let r = 0; r < divRight; r++) {
      const angle = (r * Math.PI * 2) / divRight - Math.PI / 2;
      const x = centerX + Math.cos(angle) * outerTrackRad;
      const y = centerY + Math.sin(angle) * outerTrackRad;
      
      const isOver = Math.abs(((progress * divRight) % 1)) < 0.08 && Math.floor(progress * divRight) === r;

      ctx.beginPath();
      ctx.arc(x, y, isOver ? 9 : 5, 0, Math.PI * 2);
      ctx.fillStyle = isOver ? '#FBBF24' : '#1E293B';
      ctx.fill();
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (showHelperGrid) {
        ctx.font = '8px font-mono';
        ctx.fillStyle = '#FBBF24';
        ctx.fillText(`右-${r + 1}`, x, y + (r === 0 ? -12 : 14));
      }
    }

    // 4. Draw Orbiting Planet Dots representing running playheads
    // Dynamic angle of planets based on progressive rotation
    const angleLeftVal = progress * Math.PI * 2 - Math.PI / 2;
    const xLeft = centerX + Math.cos(angleLeftVal) * innerTrackRad;
    const yLeft = centerY + Math.sin(angleLeftVal) * innerTrackRad;

    // Outer playhead
    const angleRightVal = progress * Math.PI * 2 - Math.PI / 2;
    // Outer rotates at same angular speed in full cycle, but will hit nodes at divRight locations
    const xRight = centerX + Math.cos(angleRightVal) * outerTrackRad;
    const yRight = centerY + Math.sin(angleRightVal) * outerTrackRad;

    // Draw Left hand playhead
    ctx.beginPath();
    ctx.arc(xLeft, yLeft, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#3B82F6';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw Right hand playhead
    ctx.beginPath();
    ctx.arc(xRight, yRight, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#F59E0B';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 5. Drawing connecting elastic spring wire between playheads
    ctx.beginPath();
    ctx.moveTo(xLeft, yLeft);
    ctx.lineTo(xRight, yRight);
    ctx.strokeStyle = isAlignMoment ? 'rgba(255,255,255,0.7)' : 'rgba(96, 165, 250, 0.2)';
    ctx.lineWidth = isAlignMoment ? 3.5 : 1.5;
    ctx.stroke();

    // Beautiful glowing central engine core
    const coreGrad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, corePulse);
    coreGrad.addColorStop(0, '#FFFFFF');
    coreGrad.addColorStop(0.3, isAlignMoment ? '#EF4444' : '#6366F1');
    coreGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, corePulse, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();

    // Kinetic energy concentric rays
    ctx.strokeStyle = isAlignMoment ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.05)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerTrackRad * 0.4, 0, Math.PI * 2);
    ctx.stroke();

    animationRef.current = requestAnimationFrame(drawOrbitalSystem);
  };

  const startEngine = async () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    setIsPlaying(true);
    isPlayingRef.current = true;

    const now = audioCtxRef.current.currentTime;
    nextAlignTimeRef.current = now + 0.05;
    startTimeRef.current = nextAlignTimeRef.current;

    scheduler();
    
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(drawOrbitalSystem);
  };

  const stopEngine = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;

    if (timerIDRef.current) {
      window.clearTimeout(timerIDRef.current);
      timerIDRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Refresh Canvas layout to pristine initial look
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      stopEngine();
    } else {
      startEngine();
    }
  };

  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      if (timerIDRef.current) window.clearTimeout(timerIDRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // --- INTERACTIVE TAP GAME: POLURYTHM CORE MNEMONIC SIMULATOR ---
  // Users press A (left hand, 2 hits) and L (right hand, 3 hits)
  // Let's build a real calculator that records the duration and checks polyrhythm sync!
  const tapLeftHand = () => {
    setLastLeftTap(Date.now());
    triggerKeyboardBeep(261.63);
    recordGamePlay('left');
  };

  const tapRightHand = () => {
    setLastRightTap(Date.now());
    triggerKeyboardBeep(523.25);
    recordGamePlay('right');
  };

  const triggerKeyboardBeep = (freq: number) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  };

  const recordGamePlay = (hand: 'left' | 'right') => {
    const now = Date.now();
    setTapHistory(prev => {
      const updated = [...prev, { time: now, hand }].slice(-16);
      
      // Analyze timing and check accuracy if we have multiple taps
      if (updated.length >= 4) {
        // Let's filter left/right to find interval gaps
        const lefts = updated.filter(item => item.hand === 'left');
        const rights = updated.filter(item => item.hand === 'right');

        if (lefts.length >= 2 && rights.length >= 3) {
          const lGap = lefts[lefts.length - 1].time - lefts[lefts.length - 2].time;
          const rGap = rights[rights.length - 1].time - rights[rights.length - 2].time;
          
          // Ratio comparison
          // Ideal ratio for 2 vs 3 is Left Gap to Right Gap ratio being 1.5 (as right is 3 per cycle, left is 2 per cycle).
          // Left takes longer (3/2) times of Right.
          const actualRatio = lGap / rGap;
          const errorPercent = Math.abs(actualRatio - 1.5) / 1.5;

          if (errorPercent < 0.12) {
            setGameScore(s => s + 25);
            setGameFeedback('🔥 完美的“二对三”星际共振！左右声音齿轮丝丝入扣对齐，你弹出了肖邦般的舒洒节奏！');
            setAccuracyRating('完美 ratio: 1.50 (误差极小)');
          } else if (errorPercent < 0.28) {
            setGameScore(s => s + 10);
            setGameFeedback('👍 保持住！二对三律动比例基本端正。嘴中念记口诀：【爸-爸在小(中)桥】，右手要略微灵动。');
            setAccuracyRating(`优秀 ratio: ${actualRatio.toFixed(2)} (误差微弱)`);
          } else {
            setGameFeedback('🐢 双手好像散架了。注意：两手不是轮流打。第一大拍时左右【双手重合一起拍】，然后右-左-右。');
            setAccuracyRating(`有些散架 ratio: ${actualRatio.toFixed(2)}`);
          }
        }
      }
      return updated;
    });
  };

  // Bind A and L keyboards for fun
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'a' || key === 'ф') {
        e.preventDefault();
        tapLeftHand();
      } else if (key === 'l' || key === 'д') {
        e.preventDefault();
        tapRightHand();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const resetGameHistory = () => {
    setTapHistory([]);
    setGameScore(0);
    setGameFeedback('记录已被清空。重振旗鼓，再次用双手击打出浪漫的 2:3 织体吧！');
    setAccuracyRating('');
  };

  // Quiz helper actions
  const quizQuestions: QuizQuestion[] = [
    {
      question: '在钢琴演奏中，什么是“Polyrhythm (复合律动/多声部对位律动)”？',
      options: [
        '一种速度忽快忽慢的变速弹奏风格，毫无规律可循',
        '在相同时间内，两个不同声部弹奏互成奇数对比的均等音符（例如左手2音，右手3音）',
        '双手弹奏一模一样节奏和音高，俗称齐奏',
        '一种通过脚踩踏板让钢琴发出电子鼓声的技巧'
      ],
      correctIndex: 1,
      explanation: '复合律动(Polyrhythm)是多声部协作极富艺术感的方式：它同时让两个比例不同的均分音符叠合在一起，呈现出“你中有我，我中无你”的奇秒咬合。'
    },
    {
      question: '练习德彪西《第一号阿拉伯风华丽曲》中经典的 “二对三(2 vs 3)” 时，最简明口诀是？',
      options: [
        '“一二三四，大家排队”',
        '“爸 - 爸在小 (中) 桥”，双手在第一个“爸”位齐奏合拍',
        '“左边一下，右边三下”',
        '“快速狂弹三千遍”'
      ],
      correctIndex: 1,
      explanation: '二对三的敲击顺序和均分对齐极度巧妙：1. “爸” (左右双手一齐下砸)  2. “爸在” (右手单独击响第二音，由于卡在左首第一第二之间)  3. “小” (左手在中间落下) 4. “桥” (右手落下第三音)。这正是“爸、爸、在、小、桥”的完美切分律动！'
    },
    {
      question: '为什么数三连音（Triplets）不能随便跟着正拍走，必须要内心有一个均分的意识？',
      options: [
        '因为三连音不是把一拍“随便弹三下”，它是把一拍的物理时间绝妙均分成1:1:1的三等份',
        '因为三连音通常是肖邦用来炫技的，越乱越好，不需要任何内心对齐',
        '因为三连音弹长了会破坏休止符的声音',
        '因为键盘上面的键太重，不均分手指会抽筋'
      ],
      correctIndex: 0,
      explanation: '三连音的核心精髓是“绝对均分（Equal Division）”。它把原本对称解构的拍子打碎，以极度摇摆对称的 1:1:1 时间呈现，给平静的水流背景带来微妙生动的流动感。'
    }
  ];

  const handleAnswerSubmit = (optionIdx: number) => {
    if (showAnswer) return;
    setSelectedOption(optionIdx);
    setShowAnswer(true);
    if (optionIdx === quizQuestions[currentQuestion].correctIndex) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setShowAnswer(false);
    if (currentQuestion + 1 < quizQuestions.length) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setShowAnswer(false);
    setQuizScore(0);
    setQuizFinished(false);
  };

  const masterpieces: Masterpiece[] = [
    {
      title: '《月光奏鸣曲》 (Moonlight Sonata)',
      composer: '路德维希·凡·贝多芬',
      meter: '2/2 拍',
      description: '古典乐最凄美流淌的三连音。右手持续弹奏八分三连音（由琶音组成），铺陈出黑夜里平静湖水的微波涟漪，上方托载沉宛歌唱的旋律。',
      tripletUsage: '铺平的低沉流动，作为托举高音旋律的一汪深湖。',
      rhythmTip: '切勿将前两拍砸得过硬！三连音的右手伴奏应如同呼吸，极其轻柔，让低音部分在底层主宰大局。'
    },
    {
      title: '《阿拉伯风华丽曲》 (Deux Arabesques)',
      composer: '阿希尔-克劳德·德彪西',
      meter: '4/4 拍',
      description: '印象派神级巨篇。左手弹奏着如微风抚平落叶的二连音，右手则是清凉曼妙的三连音溪水。双手交汇，模糊了呆板的时间线，如雨雾水汽般迷蒙。',
      tripletUsage: '整篇铺陈 2 vs 3 复合律动，实现绝伦的朦胧朦胧之美。',
      rhythmTip: '绝对不可像打桩一样，死扣对位。双手必须各自获得流畅惯性，再在各大拍的正拍合二为一！'
    }
  ];

  return (
    <div className="space-y-8 pb-12 animate-fadeIn max-w-5xl mx-auto">
      {/* Dynamic unique premium Header section */}
      <header className="relative p-6 rounded-3xl bg-slate-950 text-white overflow-hidden border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-black tracking-widest uppercase">
              <Star size={10} className="fill-current text-blue-400 animate-spin" /> Triplets Polyrhythm Stage
            </span>
            <h2 className="text-3xl md:text-5xl font-black font-serif tracking-tight text-white flex items-center gap-3">
              多声部三连音：星轨复合对位律动房
            </h2>
            <p className="text-sm md:text-base text-slate-300 font-light max-w-3xl leading-relaxed">
              体验古典和印象派钢琴家最迷恋的“高阶重心游戏”。在这间<strong>星轨对位实验室</strong>，你将解开均分三连音与双连音（Polyrhythm）奇妙咬合的全部艺术奥秘。
            </p>
          </div>
          
          <div className="shrink-0 flex md:flex-col gap-2 bg-slate-900/85 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 tracking-wider">星轨选择 (Select Ratio)</span>
            <div className="flex bg-slate-950 p-1 rounded-xl">
              <button 
                onClick={() => { stopEngine(); setPolyrhythm('2vs3'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  polyrhythm === '2vs3' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2 vs 3 (德彪西)
              </button>
              <button 
                onClick={() => { stopEngine(); setPolyrhythm('3vs4'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  polyrhythm === '3vs4' 
                    ? 'bg-amber-500 text-slate-950 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                3 vs 4 (肖邦)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid: Star orbital simulator on left, Controls & Details on Right */}
      <div className="grid lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column (Canvas Orbital Mandala): Takes 7 slots */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-3xl p-6 relative flex flex-col justify-between shadow-2xl min-h-[26rem] overflow-hidden">
          
          {/* Top header on canvas */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-2 z-10">
            <div className="flex items-center gap-2">
              <Activity className="text-blue-500 animate-pulse" size={18} />
              <span className="font-mono text-xs text-slate-400 font-bold uppercase">
                {polyrhythm === '2vs3' ? '星际双连环 (Ratio 2 : 3)' : '星际四连轨 (Ratio 3 : 4)'}
              </span>
            </div>
            
            <button
              onClick={() => setShowHelperGrid(!showHelperGrid)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                showHelperGrid 
                  ? 'border-blue-500/40 bg-blue-500/10 text-blue-400' 
                  : 'border-slate-800 hover:text-white text-slate-400'
              }`}
            >
              辅助指法：{showHelperGrid ? '开启中' : '已隐藏'}
            </button>
          </div>

          {/* MAIN CANVAS */}
          <div className="flex-1 flex items-center justify-center relative my-4">
            <canvas 
              ref={canvasRef} 
              className="w-full h-64 block bg-transparent"
              style={{ touchAction: 'none' }}
            />

            {!isPlaying && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-[2.5px] rounded-2xl flex flex-col items-center justify-center p-6 text-center select-none z-10">
                <div 
                  onClick={startEngine} 
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer ring-4 ring-blue-500/20"
                >
                  <Play size={32} fill="currentColor" className="ml-1.5" />
                </div>
                <h3 className="text-white font-bold text-base mt-4">启动星轨对位齿轮仪</h3>
                <p className="text-slate-400 text-xs mt-1.5 max-w-sm leading-relaxed">
                  在对齐时刻，代表不同均分比率的星球在“12点方向”交融重合。耳中听到纯净的 C 大调完美八度。
                </p>
              </div>
            )}
          </div>

          {/* Footer of the canvas */}
          <div className="grid grid-cols-2 gap-4 bg-slate-900/50 p-3.5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
              <div className="leading-tight">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">左手底脉冲 (Left Base Pulse)</span>
                <span className="block text-xs text-white font-mono font-bold">2 均分段 (C4 Piano)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></span>
              <div className="leading-tight">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">右手三连波 (Right Triplet)</span>
                <span className="block text-xs text-white font-mono font-bold">3 均分段 (G4 Bell)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Controls & Sonic Settings): Takes 5 slots */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
          
          {/* Sound Controls Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md space-y-5">
            <h3 className="text-lg font-black text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
              <Sliders size={18} className="text-blue-600" />
              星轨声音与速度控制
            </h3>

            {/* Sound Kit select */}
            <div>
              <span className="block text-xs font-bold text-stone-500 mb-2">声部音色 (Sound Font Preset)</span>
              <div className="grid grid-cols-3 gap-2">
                {(['bell', 'marimba', 'synth'] as SoundKit[]).map((kit) => (
                  <button
                    key={kit}
                    onClick={() => setSoundKit(kit)}
                    className={`py-2 rounded-xl border text-xs font-black transition-all ${
                      soundKit === kit 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {kit === 'bell' ? '水晶八度铃' : kit === 'marimba' ? '温暖木琴' : '复古温和锯齿'}
                  </button>
                ))}
              </div>
            </div>

            {/* BPM Slider */}
            <div>
              <div className="flex justify-between text-xs text-stone-600 font-bold mb-2">
                <span>对位速度 (Speed Tempo)</span>
                <span className="font-mono text-blue-600 text-sm font-black">{bpm} BPM</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-stone-400">40</span>
                <input
                  type="range"
                  min="40"
                  max="120"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-xs font-mono text-stone-400">120</span>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handlePlayToggle}
              className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border transition-all active:scale-[0.98] ${
                isPlaying 
                  ? 'bg-slate-950 border-slate-950 text-white hover:bg-slate-800 shadow-lg' 
                  : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-500 shadow-lg'
              }`}
            >
              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              <span>{isPlaying ? '停止星际轨鸣器' : '一键启动宇宙合鸣'}</span>
            </button>
          </div>

          {/* Theoretical Deep-dive widget */}
          <div className="bg-blue-50/60 rounded-3xl p-6 border border-blue-100 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-widest text-blue-600 font-extrabold">Debussy 印象主义</span>
              <h4 className="text-base font-black text-slate-900">“二对三”纵向错落美学</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                古典音乐中，如果左右手老是规规矩矩齐奏对齐，就会像士兵走路。
                德彪西巧妙地打破这个教条，将<strong>右手的三均分</strong>投射到<strong>左手的双均分</strong>上。
                两只手在非主干交汇点时绝对错开，造成了如落木萧萧、水汽弥漫的流动感。
              </p>
            </div>
            
            <div className="bg-white/80 border border-blue-150 p-3 rounded-2xl mt-4 flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-[9px]">i</div>
              <p className="text-[10px] text-slate-500 leading-tight">
                <strong>学习要领：</strong>不要试图用铅笔在线段上硬性对格。双手彻底松绑，在空中画平滑圆弧。
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 2: Interactive Papa-At-The-Bridge Duplet-Triplet Game */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-100 pb-4 mb-6 gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Rhythm Mnemonic Sandbox</span>
            <h3 className="text-2xl font-bold font-serif text-stone-950">
              双手“爸在小桥”复合律动力度仪
            </h3>
            <p className="text-xs text-stone-400 leading-tight mt-1">
              通过键盘或按钮来模拟左右对位敲击。系统将通过实时延迟分析计算出你是否成功演奏了 2 : 3。
            </p>
          </div>
          
          <button 
            onClick={resetGameHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-500 border border-stone-200 rounded-xl hover:bg-stone-50"
          >
            <RefreshCw size={13} /> 重置记录
          </button>
        </div>

        {/* Play interface: Dual Hands Tap Buttons */}
        <div className="grid md:grid-cols-12 gap-6">
          
          {/* Tap Play buttons on the left */}
          <div className="md:col-span-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              
              {/* Left Hand Button [A] */}
              <button
                onClick={tapLeftHand}
                className="group relative h-40 rounded-3xl bg-blue-50 hover:bg-blue-100 active:scale-95 border border-blue-200 flex flex-col items-center justify-center text-center p-6 transition-all select-none"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform font-bold text-lg">
                  A
                </div>
                <span className="block font-black text-slate-900 text-sm">左手 (L-Hand)</span>
                <span className="block text-[10px] text-blue-600 font-bold mt-1">Duplet 均分双下</span>
              </button>

              {/* Right Hand Button [L] */}
              <button
                onClick={tapRightHand}
                className="group relative h-40 rounded-3xl bg-amber-50 hover:bg-amber-100 active:scale-95 border border-amber-200 flex flex-col items-center justify-center text-center p-6 transition-all select-none"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform font-bold text-lg">
                  L
                </div>
                <span className="block font-black text-slate-900 text-sm">右手 (R-Hand)</span>
                <span className="block text-[10px] text-amber-600 font-bold mt-1">Triplet 三分流波</span>
              </button>

            </div>

            {/* Accuracy Visual Timeline */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <span className="text-[10px] font-bold text-stone-400 block mb-3 uppercase tracking-wider">
                最近敲击对位事件 (Real-time Tap Log - Limit 16)
              </span>
              
              {tapHistory.length === 0 ? (
                <div className="py-6 text-center text-xs text-stone-400">
                  没有击键记录。点击上方蓝色/黄色琴块或直接在物理键盘上按 A键 / L键 试试！
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tapHistory.map((tap, idx) => (
                    <span 
                      key={idx}
                      className={`px-3 py-1.5 rounded-xl font-bold font-mono text-xs shadow-sm border animate-slideUp animate-duration-100 ${
                        tap.hand === 'left' 
                          ? 'bg-blue-600 text-white border-blue-500' 
                          : 'bg-amber-500 text-slate-950 border-amber-400'
                      }`}
                    >
                      {tap.hand === 'left' ? '👈 左 [A]' : '👉 右 [L]'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Feedback score & Mnemonic analysis on right */}
          <div className="md:col-span-4 bg-stone-900 text-white p-6 rounded-3xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-widest text-stone-400 font-bold uppercase">对位得分仪</span>
                {accuracyRating && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black font-mono">
                    {accuracyRating}
                  </span>
                )}
              </div>

              <div className="text-4xl font-extrabold font-mono text-amber-400 flex items-baseline gap-1">
                {gameScore} <span className="text-xs text-stone-400 font-medium">pts</span>
              </div>

              {/* Mnemonic helper details */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-amber-500 block uppercase tracking-tight">中文古典终极口诀 Mnemonic:</span>
                <div className="flex gap-1 text-center font-bold text-xs select-none">
                  <div className="flex-1 bg-slate-800 text-white py-1.5 rounded-lg">爸<br/><span className="text-[9px] text-stone-400">(双)</span></div>
                  <div className="flex-1 bg-amber-600 text-white py-1.5 rounded-lg">爸在<br/><span className="text-[9px] text-stone-200">(右)</span></div>
                  <div className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg">小<br/><span className="text-[9px] text-stone-200">(左)</span></div>
                  <div className="flex-1 bg-amber-600 text-white py-1.5 rounded-lg">桥<br/><span className="text-[9px] text-stone-200">(右)</span></div>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal pt-1.5">
                  念这5个字，时间间距分别要极度均等！你弹下后将惊喜地达成完美 2:3 摇摆！
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-normal mt-6 italic border-t border-stone-800 pt-4">
              💬 {gameFeedback}
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 3: Chopin vs Beethoven Masterpieces and Quiz Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Masterpieces showcases cards */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md space-y-4">
          <h3 className="text-xl font-bold font-serif text-stone-950 border-b border-stone-100 pb-3 flex items-center gap-2">
            <BookOpen size={18} className="text-blue-600" />
            钢琴巨匠三连音对位作品
          </h3>
          
          <div className="space-y-4">
            {masterpieces.map((item, idx) => (
              <div key={idx} className="bg-stone-50 p-4 rounded-2xl border border-stone-150 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-stone-900 text-sm">{item.title}</h4>
                  <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-600 font-mono text-[9px] font-bold">
                    {item.composer}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>
                <div className="p-2 bg-blue-50 border border-blue-100 text-[10px] text-blue-700 rounded-lg">
                  <strong>指尖心法：</strong>{item.rhythmTip}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real Quiz Challenges */}
        <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold font-serif border-b border-stone-800 pb-3 flex items-center gap-2 text-amber-400">
              <Trophy size={18} />
              对位脑力终极水平测试
            </h3>

            {!quizFinished ? (
              <div className="mt-4 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>对位考题 {currentQuestion + 1} / {quizQuestions.length}</span>
                  <span className="font-mono text-amber-400">准确率: {quizScore} 分</span>
                </div>

                <h4 className="font-bold text-sm text-white leading-relaxed">
                  {quizQuestions[currentQuestion].question}
                </h4>

                <div className="space-y-2 pt-2">
                  {quizQuestions[currentQuestion].options.map((option, idx) => {
                    const isSelectedVal = selectedOption === idx;
                    const isCorrectVal = idx === quizQuestions[currentQuestion].correctIndex;
                    
                    let btnStyle = 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-200';
                    if (showAnswer) {
                      if (isCorrectVal) {
                        btnStyle = 'bg-green-900/60 border-green-500 text-white font-bold';
                      } else if (isSelectedVal) {
                        btnStyle = 'bg-rose-900/60 border-rose-500 text-slate-100';
                      } else {
                        btnStyle = 'opacity-40 bg-stone-800 text-stone-500';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={showAnswer}
                        onClick={() => handleAnswerSubmit(idx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs leading-relaxed transition-all flex items-center justify-between gap-2 cursor-pointer ${btnStyle}`}
                      >
                        <span>{option}</span>
                        {showAnswer && isCorrectVal && <Check size={14} className="text-green-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {showAnswer && (
                  <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-[10px] text-stone-400 leading-relaxed animate-slideUp">
                    <span className="block font-bold text-amber-500 mb-0.5">💡 对位秘笈解析：</span>
                    {quizQuestions[currentQuestion].explanation}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-6 text-center space-y-4 animate-scaleUp">
                <Award size={48} className="mx-auto text-amber-400 animate-bounce" />
                <h4 className="text-lg font-black text-white">考研通过！星外对位勋章已解锁</h4>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  恭喜你成功答完考题。你成功夺得 <strong>{quizScore} 点</strong>（满分 {quizQuestions.length}）
                </p>
                <button
                  onClick={resetQuiz}
                  className="px-6 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-xl text-xs font-black shadow-lg transition-transform hover:scale-105"
                >
                  重考一次
                </button>
              </div>
            )}
          </div>

          {!quizFinished && showAnswer && (
            <button
              onClick={handleNextQuestion}
              className="mt-6 w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl text-xs font-bold font-mono transition-transform hover:scale-[1.01]"
            >
              下一道题
            </button>
          )}
        </div>

      </div>

    </div>
  );
};

export default TripletsLesson;
