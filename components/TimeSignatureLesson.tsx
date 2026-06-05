import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Zap, Info, Music, BookOpen, Divide, Hash, Mic2, 
  Sparkles, Volume2, Gamepad2, Check, RefreshCw, Trophy, 
  ChevronRight, Award, HelpCircle, AlertCircle
} from 'lucide-react';

type MeterType = '2/4' | '3/4' | '4/4' | '6/8';
type SoundKit = 'classic' | 'electronic' | 'acoustic';

interface SongExample {
  title: string;
  composer: string;
  meter: MeterType;
  description: string;
  rhythmSchema: string; // Visual text representation of rhythm
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const TimeSignatureLesson: React.FC = () => {
  // Navigation tabs within lesson: 'visual' | 'game' | 'library' | 'quiz'
  const [activeSubTab, setActiveSubTab] = useState<'visual' | 'game' | 'library' | 'quiz'>('visual');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [meter, setMeter] = useState<MeterType>('4/4');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [bpm, setBpm] = useState(90);
  const [soundKit, setSoundKit] = useState<SoundKit>('classic');
  const [volume, setVolume] = useState(70); // 0 to 100

  // Quiz State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Rhythm Game State
  const [gameActive, setGameActive] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameStreak, setGameStreak] = useState(0);
  const [gameFeedback, setGameFeedback] = useState<string>('准备好了吗？点击开始！');
  const [feedbackColor, setFeedbackColor] = useState<string>('text-stone-500');
  const lastTapTimeRef = useRef<number>(0);

  // Refs for tracking animation & audio
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const timerIDRef = useRef<number | null>(null);
  const beatIndexRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const animationRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);

  const bpmRef = useRef(bpm);
  const meterRef = useRef(meter);
  const soundKitRef = useRef(soundKit);
  const volumeRef = useRef(volume);

  // Sync refs to avoid re-triggering audio loops
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { meterRef.current = meter; }, [meter]);
  useEffect(() => { soundKitRef.current = soundKit; }, [soundKit]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  // --- Configuration Data ---
  const METER_CONFIG: Record<MeterType, {
    top: number;
    bottom: number;
    name: string;
    desc: string;
    beats: ('S' | 'M' | 'W')[]; // S=Strong, M=Medium-Strong, W=Weak
    feel: string;
    meaning: string;
    patternDesc: string;
    examples: string;
    countStr: string[];
    accentStructure: string;
  }> = {
    '2/4': {
      top: 2, bottom: 4,
      name: '2/4拍 (二拍子)',
      desc: '进行曲风格，刚劲、利落、律动分明。',
      beats: ['S', 'W'],
      feel: '像行军：左右、左右、左右 (嗒、嗒)。',
      meaning: '每小节有 2 拍，以四分音符为一拍。',
      patternDesc: '【强 - 弱】。最直接的交替结构，没有任何拖泥带水，非常对称且容易辨认。',
      examples: '经典进行曲，如《拉德斯基进行曲》或许多动感的儿童歌曲。',
      countStr: ['ONE', 'two'],
      accentStructure: '强 (Strong) ➔ 弱 (Weak)'
    },
    '3/4': {
      top: 3, bottom: 4,
      name: '3/4拍 (三拍子)',
      desc: '圆舞曲风格，充满旋转轻盈感。',
      beats: ['S', 'W', 'W'],
      feel: '像华尔兹：嘭-恰-恰 (ONE-two-three)。',
      meaning: '每小节有 3 拍，以四分音符为一拍。',
      patternDesc: '【强 - 弱 - 弱】。奇数拍带来非平衡的推动力，自然促使音乐旋转向前。',
      examples: '《蓝色多瑙河》圆舞曲、萧邦圆舞曲。',
      countStr: ['ONE', 'two', 'three'],
      accentStructure: '强 (Strong) ➔ 弱 (Weak) ➔ 弱 (Weak)'
    },
    '4/4': {
      top: 4, bottom: 4,
      name: '4/4拍 (四拍子)',
      desc: '流行、摇滚及古典中最坚固平稳的节奏。',
      beats: ['S', 'W', 'M', 'W'],
      feel: '现代音乐：强、弱、次强、弱。',
      meaning: '每小节有 4 拍，以四分音符为一拍。',
      patternDesc: '【强 - 弱 - 次强 - 弱】。最稳定的常态，具有极其舒展的安全感。',
      examples: '90%的流行金曲、古典莫扎特或贝多芬慢板乐章。',
      countStr: ['ONE', 'two', 'Three', 'four'],
      accentStructure: '强 (Strong) ➔ 弱 (Weak) ➔ 次强 (Medium) ➔ 弱 (Weak)'
    },
    '6/8': {
      top: 6, bottom: 8,
      name: '6/8拍 (复二拍子)',
      desc: '摇摆的船歌，大摇晃中带有三连音微动捕风。',
      beats: ['S', 'W', 'W', 'M', 'W', 'W'],
      feel: '摇篮曲/民谣：(嗒-啦-啦) (咚-啦-啦)。',
      meaning: '每小节有 6 拍，以八分音符为一拍。',
      patternDesc: '【强-弱-弱-次强-弱-弱】。感觉上像大2拍，但每一大拍都包含着愉快的3个细分。',
      examples: '《希伯来奴隶合唱》、民谣老歌《绿袖子》、摇摆民谣。',
      countStr: ['ONE', 'la', 'li', 'TWO', 'la', 'li'],
      accentStructure: '强 (S) ➔ 弱 (W) ➔ 弱 (W) ➔ 次强 (M) ➔ 弱 (W) ➔ 弱 (W)'
    }
  };

  const songExamples: SongExample[] = [
    {
      title: '《拉德斯基进行曲》 (Radetzky March)',
      composer: '约翰·施特劳斯 (Johann Strauss I)',
      meter: '2/4',
      description: '经典的奥地利进行曲。强弱极其分明，适合全场掌声合拍。',
      rhythmSchema: '【强】 嗒嗒 | 【弱】 嗒 | 【强】 嗒嗒 | 【弱】 嗒'
    },
    {
      title: '《蓝色多瑙河》 (The Blue Danube)',
      composer: '小约翰·施特劳斯 (Johann Strauss II)',
      meter: '3/4',
      description: '华尔兹圆舞曲之王。第一拍为浑厚的重拍贝斯，后两拍为轻快的弦乐，产生如水微波的旋转感。',
      rhythmSchema: '【嘭(底音)】 | 恰(弦) | 恰(弦) || 【嘭】 | 恰 | 恰'
    },
    {
      title: '《欢乐颂》 (Ode to Joy)',
      composer: '贝多芬 (Ludwig van Beethoven)',
      meter: '4/4',
      description: '第九交响曲第四乐章的主题。端庄对称，稳定大气的旋律在4/4拍的平稳支撑下，散发宏大圣洁的光芒。',
      rhythmSchema: '【强】 登 | 弱 登 | 【次强】 登 | 弱 登'
    },
    {
      title: '《绿袖子》 (Greensleeves)',
      composer: '英国传统民谣 (Traditional)',
      meter: '6/8',
      description: '极富摇摆叙事感的古老民谣。6/8拍使平缓的音符拥有像船在水面轻悠飘扬的摇曳感。',
      rhythmSchema: '【大拍一】(咚 哒 哒) ➔ 【大拍二】(咚 哒 哒)'
    }
  ];

  const quizQuestions: QuizQuestion[] = [
    {
      question: '在 “3/4” 拍号中，分母位置的 “4” 具有什么具体含义？',
      options: [
        '表示一个小节里面总共唱 4 拍',
        '表示以 “四分音符” 作为基本的一拍',
        '表示音乐的速度为 40 BPM',
        '表示整首曲子一共有 4 个小节'
      ],
      correctIndex: 1,
      explanation: '分母代表计算基本单位音符的类型。分母是4，意指以“四分音符”为一拍；如果是8，则以“八分音符”为一拍。'
    },
    {
      question: '以下哪一个是 “4/4 拍” 标志性的古典强弱循环律律模式？',
      options: [
        '强 - 弱 - 强 - 弱',
        '强 - 次强 - 弱 - 弱',
        '强 - 弱 - 次强 - 弱',
        '弱 - 强 - 弱 - 次强'
      ],
      correctIndex: 2,
      explanation: '4/4 拍具有四个基本的骨架位置，其正统、平稳的律动模式为：第一拍最强(S)，第二拍最弱(W)，第三拍次强(M)，第四拍极弱(W)。'
    },
    {
      question: '6/8 拍号相较于其他 4 分音符拍子（如 2/4 拍），最独特的艺术律动特征是什么？',
      options: [
        '它是极速进行曲，只有强音',
        '它虽然数6下，但实际上是一大拍，不带任何细分',
        '它是复二拍子，每小节有大两拍，但每大拍自然包含3个清脆的细分部分，充满富有摇摆飘荡的特征',
        '它不能和任何乐器配合，只能纯人声哼唱'
      ],
      correctIndex: 2,
      explanation: '6/8 是复拍子（Compound meter），分母是 8 表示以八分音符为一拍，一小节 6 拍，从重音布局上看，刚好组合成两个等宽的三连节奏群，因此呈现出极为摇晃优雅的船歌律动。'
    },
    {
      question: '如果我们听见一首作品有非常有规律的 “嘭-恰-恰”、“嘭-恰-恰” 舞蹈旋转感，最可能对应什么拍号？',
      options: [
        '2/4 拍',
        '3/4 拍',
        '4/4 拍',
        '6/8 拍'
      ],
      correctIndex: 1,
      explanation: '3/4 拍是经典的圆舞曲（华尔兹）节奏，其第一拍是由底音乐器演奏的强拍（嘭），第二、三拍是由中音乐器或和声奏出的弱拍（恰，恰），让人听之欲翩翩起舞。'
    }
  ];

  const activeConfig = METER_CONFIG[meter];

  // --- Web Audio Synthesizer Engine ---
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSynthesizedClick = (time: number, strength: 'S' | 'M' | 'W') => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const currentVolume = volumeRef.current / 100 * 0.25; // Prevent clipping
    const currentKit = soundKitRef.current;

    if (currentKit === 'classic') {
      if (strength === 'S') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, time);
        gainNode.gain.setValueAtTime(currentVolume, time);
      } else if (strength === 'M') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(750, time);
        gainNode.gain.setValueAtTime(currentVolume * 0.7, time);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(550, time);
        gainNode.gain.setValueAtTime(currentVolume * 0.4, time);
      }
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
      osc.start(time);
      osc.stop(time + 0.15);

    } else if (currentKit === 'electronic') {
      // White noise snare/hi-hat simulation for weak, synthesized deep bass for strong
      if (strength === 'S') {
        // Kick drum sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);
        gainNode.gain.setValueAtTime(currentVolume * 1.5, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        osc.start(time);
        osc.stop(time + 0.16);
      } else {
        // Synthesized clean metallic beep/hi-hat
        osc.type = 'sine';
        osc.frequency.setValueAtTime(strength === 'M' ? 1400 : 2200, time);
        gainNode.gain.setValueAtTime(currentVolume * 0.5, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
        osc.start(time);
        osc.stop(time + 0.06);
      }
    } else if (currentKit === 'acoustic') {
      // Woodblock and stick representation
      if (strength === 'S') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(900, time);
        gainNode.gain.setValueAtTime(currentVolume * 1.2, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
        osc.start(time);
        osc.stop(time + 0.09);

        // Sub layer for click pop
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        clickOsc.connect(clickGain);
        clickGain.connect(ctx.destination);
        clickOsc.type = 'sawtooth';
        clickOsc.frequency.setValueAtTime(1500, time);
        clickGain.gain.setValueAtTime(currentVolume * 0.3, time);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.02);
        clickOsc.start(time);
        clickOsc.stop(time + 0.03);
      } else if (strength === 'M') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(700, time);
        gainNode.gain.setValueAtTime(currentVolume * 0.8, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
        osc.start(time);
        osc.stop(time + 0.09);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(500, time);
        gainNode.gain.setValueAtTime(currentVolume * 0.5, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
        osc.start(time);
        osc.stop(time + 0.07);
      }
    }
  };

  const scheduleNextNotes = () => {
    if (!audioCtxRef.current || !isPlayingRef.current) return;
    
    const scheduleAheadTime = 0.15; 
    const secondsPerBeat = 60.0 / bpmRef.current;
    
    // For 6/8, the tempo dictates 8th notes, so count is based on actual 8th subdivisions.
    const isCompound = meterRef.current === '6/8';
    const beatDuration = isCompound ? (secondsPerBeat * 0.5) : secondsPerBeat;

    while (nextNoteTimeRef.current < audioCtxRef.current.currentTime + scheduleAheadTime) {
      const config = METER_CONFIG[meterRef.current];
      const currentBeatIndex = beatIndexRef.current % config.beats.length;
      const strength = config.beats[currentBeatIndex];
      
      playSynthesizedClick(nextNoteTimeRef.current, strength);

      nextNoteTimeRef.current += beatDuration;
      beatIndexRef.current++;
    }
    
    timerIDRef.current = window.setTimeout(scheduleNextNotes, 25.0);
  };

  // --- Dynamic Canvas Render Loop (Eliminates DOM Jitter, high performance) ---
  const drawRhythmAnimation = () => {
    if (!isPlayingRef.current || !canvasRef.current || !audioCtxRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retrieve crisp device scaling
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width === 0 || height === 0) {
      animationRef.current = requestAnimationFrame(drawRhythmAnimation);
      return;
    }
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const currentTime = audioCtxRef.current.currentTime;
    const isCompound = meterRef.current === '6/8';
    const secondsPerBeat = 60.0 / bpmRef.current;
    const beatDuration = isCompound ? (secondsPerBeat * 0.5) : secondsPerBeat;
    
    const config = METER_CONFIG[meterRef.current];
    const totalBeats = config.beats.length;
    const loopDuration = totalBeats * beatDuration;
    
    const elapsed = Math.max(0, currentTime - startTimeRef.current);
    const loopProgress = (elapsed % loopDuration) / loopDuration;
    
    const exactBeat = loopProgress * totalBeats;
    const currentBeatIdx = Math.floor(exactBeat);
    const beatProgress = exactBeat % 1;

    // Dispatch beat switch safely inside requestAnimationFrame
    if (currentBeat !== currentBeatIdx) {
      setCurrentBeat(currentBeatIdx);
    }

    const centerX = width / 2;
    const centerY = height / 2;

    // Ensure colors are highly vibrant and visible
    const amberAccent = '#F59E0B';
    const indigoAccent = '#6366F1';
    const emeraldAccent = '#10B981';
    const lightSlate = '#E2E8F0';
    const grayLine = '#CBD5E1';

    if (meterRef.current === '2/4') {
      // 2/4: Beautiful Pendulum swing
      const swingAngle = Math.sin(loopProgress * Math.PI * 2) * (Math.PI / 4.5);
      const pendulumLength = height - 80;
      const pivotX = centerX;
      const pivotY = 30;

      // Draw anchor
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#475569';
      ctx.fill();

      // Draw string
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      const endX = pivotX + Math.sin(swingAngle) * pendulumLength;
      const endY = pivotY + Math.cos(swingAngle) * pendulumLength;
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = grayLine;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw path highlights at extreme points
      ctx.beginPath();
      ctx.arc(pivotX - Math.sin(Math.PI / 4.5) * pendulumLength, pivotY + Math.cos(Math.PI / 4.5) * pendulumLength, 15, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
      ctx.fill();
      ctx.fillText('强 1', pivotX - Math.sin(Math.PI / 4.5) * pendulumLength - 10, pivotY + Math.cos(Math.PI / 4.5) * pendulumLength + 32);

      ctx.beginPath();
      ctx.arc(pivotX + Math.sin(Math.PI / 4.5) * pendulumLength, pivotY + Math.cos(Math.PI / 4.5) * pendulumLength, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(71, 85, 105, 0.1)';
      ctx.fill();
      ctx.fillText('弱 2', pivotX + Math.sin(Math.PI / 4.5) * pendulumLength - 10, pivotY + Math.cos(Math.PI / 4.5) * pendulumLength + 30);

      // Draw glowing bob
      ctx.beginPath();
      ctx.arc(endX, endY, 24, 0, Math.PI * 2);
      const isStrongBeat = currentBeatIdx === 0;
      ctx.fillStyle = isStrongBeat ? amberAccent : '#334155';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Inner text
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isStrongBeat ? 'ONE (强)' : 'two (弱)', endX, endY);

    } else if (meterRef.current === '3/4') {
      // 3/4: Elegant Triangle Orbit
      const p1 = { x: centerX, y: 40 };
      const p2 = { x: centerX + 110, y: height - 50 };
      const p3 = { x: centerX - 110, y: height - 50 };

      // Draw guide path
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.lineWidth = 4;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // Beat markers on vertices
      const pts = [p1, p2, p3];
      pts.forEach((pt, idx) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, idx === 0 ? 14 : 10, 0, Math.PI * 2);
        ctx.fillStyle = idx === 0 ? amberAccent : (currentBeatIdx === idx ? indigoAccent : '#94A3B8');
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = idx === 0 ? '#B45309' : '#1E293B';
        ctx.textAlign = 'center';
        ctx.fillText(idx === 0 ? '1 (强)' : `${idx+1}`, pt.x, pt.y - 18);
      });

      // Calculate path along triangle edges
      let targetX = p1.x;
      let targetY = p1.y;
      
      const segment = Math.floor(loopProgress * 3);
      const segmentProgress = (loopProgress * 3) % 1;

      if (segment === 0) {
        targetX = p1.x + (p2.x - p1.x) * segmentProgress;
        targetY = p1.y + (p2.y - p1.y) * segmentProgress;
      } else if (segment === 1) {
        targetX = p2.x + (p3.x - p2.x) * segmentProgress;
        targetY = p2.y + (p3.y - p2.y) * segmentProgress;
      } else {
        targetX = p3.x + (p1.x - p3.x) * segmentProgress;
        targetY = p3.y + (p1.y - p3.y) * segmentProgress;
      }

      // Draw floating ball
      ctx.beginPath();
      ctx.arc(targetX, targetY, 20, 0, Math.PI * 2);
      ctx.fillStyle = segment === 0 ? amberAccent : indigoAccent;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Shadow glow
      ctx.shadowColor = segment === 0 ? amberAccent : indigoAccent;
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadows

    } else if (meterRef.current === '4/4') {
      // 4/4: Bouncing Square Track
      const pad = 60;
      const tW = width - pad * 2;
      const tH = height - 90;
      
      const tl = { x: pad, y: 40 };
      const tr = { x: width - pad, y: 40 };
      const br = { x: width - pad, y: height - 50 };
      const bl = { x: pad, y: height - 50 };

      // Guidelines
      ctx.beginPath();
      ctx.moveTo(tl.x, tl.y);
      ctx.lineTo(tr.x, tr.y);
      ctx.lineTo(br.x, br.y);
      ctx.lineTo(bl.x, bl.y);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
      ctx.lineWidth = 4;
      ctx.stroke();

      const cornerPoints = [tl, tr, br, bl];
      const titles = ['1 (强)', '2 (弱)', '3 (次强)', '4 (弱)'];
      const colors = [amberAccent, '#94A3B8', emeraldAccent, '#94A3B8'];

      cornerPoints.forEach((pt, idx) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, idx === 0 ? 14 : (idx === 2 ? 12 : 10), 0, Math.PI * 2);
        ctx.fillStyle = currentBeatIdx === idx ? colors[idx] : '#E2E8F0';
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText(titles[idx], pt.x, pt.y - 18);
      });

      // Linear motion along edges of the square
      let targetX = tl.x;
      let targetY = tl.y;
      const segment = Math.floor(loopProgress * 4);
      const segmentProgress = (loopProgress * 4) % 1;

      if (segment === 0) {
        targetX = tl.x + (tr.x - tl.x) * segmentProgress;
        targetY = tl.y + (tr.y - tl.y) * segmentProgress;
      } else if (segment === 1) {
        targetX = tr.x + (br.x - tr.x) * segmentProgress;
        targetY = tr.y + (br.y - tr.y) * segmentProgress;
      } else if (segment === 2) {
        targetX = br.x + (bl.x - br.x) * segmentProgress;
        targetY = br.y + (bl.y - br.y) * segmentProgress;
      } else {
        targetX = bl.x + (tl.x - bl.x) * segmentProgress;
        targetY = bl.y + (tl.y - bl.y) * segmentProgress;
      }

      ctx.beginPath();
      ctx.arc(targetX, targetY, 18, 0, Math.PI * 2);
      ctx.fillStyle = segment === 0 ? amberAccent : (segment === 2 ? emeraldAccent : indigoAccent);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.stroke();

    } else if (meterRef.current === '6/8') {
      // 6/8: Double Compound loop / Infinity wave symbol
      ctx.beginPath();
      // Draw a smooth infinity-like path for 6/8 oscillation
      const points: {x: number, y: number}[] = [];
      const steps = 120;
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2;
        // Lemniscate of Bernoulli
        const scale = width / 2.7;
        const x = centerX + (scale * Math.sin(t)) / (1 + Math.cos(t) * Math.cos(t));
        const y = centerY + (scale * Math.sin(t) * Math.cos(t)) / (1 + Math.cos(t) * Math.cos(t));
        points.push({ x, y });
      }

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Show large beat positions
      // Beat 1 (Left loop peak), Beat 4 (Right loop peak)
      const lp = Math.floor(loopProgress * points.length);
      const activePoint = points[Math.min(points.length - 1, lp)];

      // Mark main beats: 1, 2, 3 on left and 4, 5, 6 on right loop
      const indices = [0, 20, 40, 60, 80, 100];
      const labelColors = [amberAccent, '#94A3B8', '#94A3B8', emeraldAccent, '#94A3B8', '#94A3B8'];
      const labels68 = ['1 大强', '2 弱', '3 弱', '4 大次强', '5 弱', '6 弱'];

      indices.forEach((ptIdx, bIdx) => {
        const pt = points[ptIdx];
        if (!pt) return;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, bIdx === 0 ? 14 : (bIdx === 3 ? 12 : 8), 0, Math.PI * 2);
        ctx.fillStyle = currentBeatIdx === bIdx ? labelColors[bIdx] : '#F1F5F9';
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText(labels68[bIdx], pt.x, pt.y - 14);
      });

      // Rotating Ball
      ctx.beginPath();
      ctx.arc(activePoint.x, activePoint.y, 18, 0, Math.PI * 2);
      ctx.fillStyle = currentBeatIdx < 3 ? amberAccent : emeraldAccent;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    animationRef.current = requestAnimationFrame(drawRhythmAnimation);
  };

  // --- Play/Stop Controls ---
  const togglePlay = () => {
    if (isPlaying) {
      stopEngine();
    } else {
      startEngine();
    }
  };

  const startEngine = async () => {
    initAudio();
    if (audioCtxRef.current?.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    if (audioCtxRef.current) {
      setIsPlaying(true);
      isPlayingRef.current = true;
      beatIndexRef.current = 0;
      
      const now = audioCtxRef.current.currentTime;
      nextNoteTimeRef.current = now + 0.1;
      startTimeRef.current = nextNoteTimeRef.current;
      
      scheduleNextNotes();
      
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(drawRhythmAnimation);
    }
  };

  const stopEngine = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentBeat(-1);
    
    if (timerIDRef.current) {
      window.clearTimeout(timerIDRef.current);
      timerIDRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Clear canvas when stopped
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleMeterChange = (m: MeterType) => {
    if (m === meter) return;
    setIsTransitioning(true);
    stopEngine();
    setTimeout(() => {
      setMeter(m);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 200);
  };

  // Cleanup on dismount
  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      if (timerIDRef.current) window.clearTimeout(timerIDRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // --- Tap-To-Rhythm Game Logic ---
  const handleGameTap = () => {
    if (!gameActive) return;

    initAudio();
    const nowCtx = audioCtxRef.current ? audioCtxRef.current.currentTime : performance.now() / 1000;
    
    // Play feedback tap sound instantly for tactile response
    if (audioCtxRef.current) {
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.frequency.setValueAtTime(880, audioCtxRef.current.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.08);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.1);
    }

    const currentBpm = bpm;
    const isCompound = meter === '6/8';
    const targetBeatSec = isCompound ? (60 / currentBpm * 0.5) : (60 / currentBpm);

    const nowSeconds = performance.now() / 1000;
    if (lastTapTimeRef.current === 0) {
      lastTapTimeRef.current = nowSeconds;
      setGameFeedback('很好！开始感知下一个节拍，按住节奏连续敲击...');
      setFeedbackColor('text-indigo-600');
      return;
    }

    const diff = nowSeconds - lastTapTimeRef.current;
    lastTapTimeRef.current = nowSeconds;

    const error = Math.abs(diff - targetBeatSec);
    const tolerancePercent = error / targetBeatSec;

    let scoreAdd = 0;
    let text = '';
    let color = '';

    if (tolerancePercent < 0.10) {
      scoreAdd = 15;
      text = '✨ 完美! (Perfect) 完美的肌体默契！';
      color = 'text-emerald-600 font-black';
      setGameStreak(prev => prev + 1);
    } else if (tolerancePercent < 0.22) {
      scoreAdd = 8;
      text = '👍 优秀! (Good) 稳重合拍。';
      color = 'text-blue-500 font-bold';
      setGameStreak(prev => prev + 1);
    } else {
      text = diff > targetBeatSec ? '🐢 慢了一点慢。要紧跟呼吸速率！' : '🐇 快了一点点！请沉住气。';
      color = 'text-red-500';
      setGameStreak(0);
    }

    setGameScore(prev => prev + scoreAdd);
    setGameFeedback(text);
    setFeedbackColor(color);
  };

  const toggleRhythmGame = () => {
    if (gameActive) {
      setGameActive(false);
      lastTapTimeRef.current = 0;
      setGameStreak(0);
    } else {
      setGameActive(true);
      setGameScore(0);
      setGameStreak(0);
      lastTapTimeRef.current = 0;
      setGameFeedback('节拍开始流动...请依据当前选中的拍号节奏，稳定连续地敲击按钮或按【空格键】！');
      setFeedbackColor('text-indigo-600');
    }
  };

  // Keyboard Space Listener for Rhythmic tap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleGameTap();
      }
    };
    if (gameActive) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameActive, bpm, meter]);


  // --- Quiz Actions ---
  const handleAnswerSubmit = (optionIndex: number) => {
    if (showAnswer) return;
    setSelectedOption(optionIndex);
    setShowAnswer(true);
    if (optionIndex === quizQuestions[currentQuestion].correctIndex) {
      setScore(prev => prev + 1);
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
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto px-1">
      {/* Chapter Title block */}
      <header className="animate-slideUp">
        <div className="inline-block px-4 py-1.5 bg-amber-55 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full text-xs font-black tracking-widest uppercase mb-4 shadow-sm">
          LEVEL 1 - 基础入门专题 (Rhythm Basics)
        </div>
        <h2 className="text-4xl md:text-5xl font-black serif text-stone-900 mb-4 tracking-tight flex items-center gap-3">
          <BookOpen className="text-amber-500" size={36} /> 拍号的全能重塑：音乐的骨架与心跳
        </h2>
        <p className="text-lg text-stone-600 font-light max-w-3xl leading-relaxed">
          拍号（Time Signature）并不是数学分数，而是写给乐手用的<strong>物理心跳代码</strong>。它精确告诉我们每一小节的律动速度、轻重起伏，以及乐曲的呼吸方式。 Let's master it!
        </p>
      </header>

      {/* Visual Navigation SubTabs - Highly intuitive */}
      <div className="flex bg-stone-100 p-1.5 rounded-2xl md:max-w-md shadow-inner border border-stone-200">
        <button
          onClick={() => { setActiveSubTab('visual'); stopEngine(); }}
          className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'visual' ? 'bg-white text-stone-900 shadow-md scale-[1.02]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Sparkles size={16} /> 律动演示
        </button>
        <button
          onClick={() => { setActiveSubTab('game'); stopEngine(); }}
          className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'game' ? 'bg-white text-stone-900 shadow-md scale-[1.02]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Gamepad2 size={16} /> 身体感官互动
        </button>
        <button
          onClick={() => { setActiveSubTab('library'); stopEngine(); }}
          className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'library' ? 'bg-white text-stone-900 shadow-md scale-[1.02]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Music size={16} /> 名曲拆解室
        </button>
        <button
          onClick={() => { setActiveSubTab('quiz'); stopEngine(); }}
          className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'quiz' ? 'bg-white text-stone-900 shadow-md scale-[1.02]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Trophy size={16} /> 关卡冲刺
        </button>
      </div>

      {/* RENDER TAB 1: Visual and Sound stage */}
      {activeSubTab === 'visual' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Main Visualizer Container */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-lg relative overflow-hidden">
            {/* Background grid */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-stone-50 to-transparent opacity-60"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row gap-8">
              {/* Left Column: Traditional Fraction Display with dynamic explanations */}
              <div className="w-full lg:w-1/3 flex flex-col items-center justify-center bg-stone-50 p-6 rounded-2xl border border-stone-200">
                <span className="text-xs uppercase tracking-widest text-stone-400 font-bold mb-4">拍号形态分写</span>
                
                <div className="flex flex-col items-center relative py-6 px-10 bg-white rounded-2xl border border-stone-100 shadow-sm w-full max-w-[14rem]">
                  {/* Molecular representation (Top) */}
                  <div className="text-6xl md:text-7xl font-black text-amber-500 leading-none mb-2 select-none tracking-tighter">
                    {activeConfig.top}
                  </div>
                  
                  {/* Division line */}
                  <div className="w-24 h-1.5 bg-stone-700 rounded-full my-4 shadow-inner"></div>
                  
                  {/* Denominator (Bottom) */}
                  <div className="text-6xl md:text-7xl font-black text-stone-800 leading-none select-none tracking-tighter">
                    {activeConfig.bottom}
                  </div>

                  {/* Absolute helper label tags */}
                  <div className="absolute right-2 top-8 bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]" title="每小节一共有几拍">
                    分子 = {activeConfig.top} 拍
                  </div>
                  <div className="absolute right-2 bottom-8 bg-stone-100 text-stone-800 font-bold px-2 py-0.5 rounded text-[10px]" title="以几分音符为一拍">
                    分母 = {activeConfig.bottom} 分
                  </div>
                </div>

                <div className="mt-6 w-full space-y-3.5 text-xs text-stone-600">
                  <div className="bg-white p-3 rounded-xl border border-stone-150">
                    <span className="block font-bold text-stone-800 text-sm mb-1">分数的几何秘密</span>
                    {activeConfig.meaning}
                  </div>
                  <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                    <span className="block font-bold text-amber-900 text-sm mb-1">强弱骨架</span>
                    {activeConfig.patternDesc}
                  </div>
                </div>
              </div>

              {/* Right Column: High contrast Canvas-based geometric track and Synthesizer controllers */}
              <div className="w-full lg:w-2/3 flex flex-col gap-6 justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
                    <div>
                      <h3 className="text-2xl font-bold font-serif text-stone-900 flex items-center gap-2">
                        {activeConfig.name} <span className="font-light text-stone-400 text-sm border-l pl-2 border-stone-300">{activeConfig.desc}</span>
                      </h3>
                    </div>
                    {/* Meter pills */}
                    <div className="flex bg-stone-100 p-1 rounded-xl">
                      {(['2/4', '3/4', '4/4', '6/8'] as MeterType[]).map((m) => (
                        <button
                          key={m}
                          onClick={() => handleMeterChange(m)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                            meter === m 
                              ? 'bg-amber-500 text-white shadow-sm' 
                              : 'text-stone-500 hover:text-stone-900'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* HIGH CONTRAST CANVAS RENDERING STAGE */}
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 relative min-h-[16rem] flex flex-col items-center justify-center">
                    <canvas 
                      ref={canvasRef} 
                      className="w-full h-44 cursor-crosshair block bg-transparent"
                      style={{ touchAction: 'none' }}
                    />
                    
                    {/* Live Accent Guidance panel */}
                    <div className="w-full mt-4 flex items-center justify-between px-3 text-[11px] font-mono text-stone-500 select-none">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 强 (Strong)
                      </span>
                      {meter === '4/4' && (
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> 次强 (Medium)
                        </span>
                      )}
                      {meter === '6/8' && (
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 次重大拍
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-350 bg-[#94A3B8]"></span> 弱 (Weak)
                      </span>
                    </div>

                    {!isPlaying && (
                      <div className="absolute inset-0 bg-stone-100/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-center select-none">
                        <div className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer" onClick={startEngine}>
                          <Play size={28} fill="currentColor" className="ml-1" />
                        </div>
                        <p className="text-stone-700 font-bold text-sm mt-3">点击开始，即刻听到、并看到实时节奏运动轨迹</p>
                        <p className="text-stone-400 text-xs mt-1">内置 Web Audio API 发生器与高画质 Canvas 平滑动画</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Synth Instrument & BPM controllers - Pristine contrasts */}
                <div className="grid md:grid-cols-2 gap-4 bg-stone-55 border bg-stone-100/50 p-4 rounded-xl border-stone-200/60 font-medium">
                  {/* Left Controls: Tone kit and volume */}
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="block text-stone-600 font-bold mb-1.5 text-xs">音色预设 (Sound Kits)</span>
                      <div className="grid grid-cols-3 gap-2">
                        {(['classic', 'electronic', 'acoustic'] as SoundKit[]).map((kit) => (
                          <button
                            key={kit}
                            onClick={() => setSoundKit(kit)}
                            className={`py-1.5 rounded-lg border font-bold capitalize transition-all ${
                              soundKit === kit 
                                ? 'bg-stone-900 border-stone-900 text-white shadow-sm' 
                                : 'bg-white border-stone-300 text-stone-600 hover:bg-stone-100'
                            }`}
                          >
                            {kit === 'classic' ? '经典嘀嗒' : kit === 'electronic' ? '电音808' : '实木响板'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="flex justify-between text-stone-650 font-bold mb-1 font-sans">
                        <span>主音量 (Volume)</span>
                        <span className="font-mono">{volume}%</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <Volume2 size={16} className="text-stone-400" />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={(e) => setVolume(Number(e.target.value))}
                          className="w-full accent-amber-500 h-1 bg-stone-205 bg-stone-300 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Controls: Tempo (BPM) Slider and Master Start/Stop */}
                  <div className="space-y-4">
                    <div>
                      <span className="flex justify-between text-xs text-stone-600 font-bold mb-1.5">
                        <span>速度速率 (BPM)</span>
                        <span className="font-mono text-amber-55 text-amber-600 text-xs font-black">{bpm} 拍/分钟</span>
                      </span>
                      <input
                        type="range"
                        min="50"
                        max="180"
                        value={bpm}
                        onChange={(e) => setBpm(Number(e.target.value))}
                        className="w-full accent-amber-500 h-1 bg-stone-300 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                        <span>50 (极慢)</span>
                        <span>110 (行板)</span>
                        <span>180 (急速)</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={togglePlay}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm ${
                          isPlaying 
                            ? 'bg-red-500 text-white shadow-md shadow-red-200' 
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-200/50 hover:scale-[1.02] active:scale-[0.98]'
                        } transition-all`}
                      >
                        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                        <span>{isPlaying ? '停止发声' : '播放发声'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Accent Structure description - Large and extremely readable light colors */}
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3">
                  <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-600 shrink-0 mt-0.5">
                    <Info size={16} />
                  </div>
                  <div className="text-xs text-indigo-900 leading-relaxed">
                    <span className="block font-black text-indigo-950 text-sm mb-1">当下拍号循环的重音波浪模式：</span>
                    <strong className="font-mono bg-white px-2 py-0.5 rounded border border-indigo-150 inline-block mr-2 shadow-sm text-indigo-700">{activeConfig.accentStructure}</strong>
                    <span>在弹钢琴时，重拍（强拍）手指需要向下带有适度的重力放松，而弱拍手指则如同羽毛掠过。</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Theoretical Foundations Cards - Perfectly spaced, light and readable */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm leading-relaxed">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 border border-orange-100">
                <Divide size={20} className="font-extrabold" />
              </div>
              <h4 className="text-lg font-bold text-stone-900 mb-2">分子 (Top) 与小节</h4>
              <p className="text-xs text-stone-600">
                分子即分划线的上方字样。它宣告了<strong>隔开一个小节（Bar/Measure）内包含几次数拍心跳</strong>。如分子为 3，代表每数 1-2-3 就要划一下小节线。
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm leading-relaxed">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4 border border-violet-100">
                <Hash size={20} />
              </div>
              <h4 className="text-lg font-bold text-stone-900 mb-2">分母 (Bottom) 与基本音符</h4>
              <p className="text-xs text-stone-600">
                分母规定了以<strong>谁是参照单位一拍</strong>。如果是复分母为4，表明以【四分音符】为基，每拍价值等同一个四分音符长度；若是8，则以【八分音符】为准。
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm leading-relaxed">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
                <Zap size={20} />
              </div>
              <h4 className="text-lg font-bold text-stone-900 mb-2">单拍子 vs. 复拍子</h4>
              <p className="text-xs text-stone-600">
                2/4、3/4 和 4/4 是<strong>单拍子（Simple Meters）</strong>，基本拍可以平置划分成两半。而 6/8 是<strong>复拍子（Compound Meters）</strong>，它的每大拍子自带摇晃的三等分。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* RENDER TAB 2: Rhythm Tapping Game (Sensory experience) */}
      {activeSubTab === 'game' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-lg animate-fadeIn">
          <div className="max-w-2xl mx-auto space-y-6 text-center">
            <div className="flex justify-center mb-2">
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black rounded-full flex items-center gap-1">
                <Gamepad2 size={12} /> Live Sensory tapping Game
              </span>
            </div>
            
            <h3 className="text-3xl font-bold text-stone-950 font-serif">
              “节奏守恒者” 肌肉记忆大挑战
            </h3>
            
            <p className="text-sm text-stone-500 max-w-lg mx-auto">
              最棒的钢琴律动潜藏在体内，而非脑子。在下方选择一个目标拍号/速度，然后<strong>点击巨型触摸板</strong>或<strong>轻敲空格键（Space）</strong>，看你能否和心中的核心频率高度契合！
            </p>

            {/* Config chooser */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-500 font-bold">设定目标拍号：</span>
                <select 
                  value={meter} 
                  disabled={gameActive}
                  onChange={(e) => handleMeterChange(e.target.value as MeterType)}
                  className="bg-white border text-stone-800 border-stone-300 font-bold rounded p-1 shadow-sm"
                >
                  <option value="2/4">2/4拍 (行军二拍)</option>
                  <option value="3/4">3/4拍 (华尔兹三拍)</option>
                  <option value="4/4">4/4拍 (经典安定四拍)</option>
                  <option value="6/8">6/8拍 (秋千船歌六拍)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-500 font-bold">设定速度 (BPM)：</span>
                <input 
                  type="number" 
                  min="60" 
                  max="140" 
                  value={bpm}
                  disabled={gameActive}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-16 bg-white border font-mono text-center text-stone-800 border-stone-300 rounded font-bold p-1 shadow-sm"
                />
                <span className="text-stone-400">BPM</span>
              </div>
            </div>

            {/* Match Rate and Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-150">
                <span className="block text-[11px] font-bold text-stone-400 uppercase">精准挑战分 (Score)</span>
                <span className="text-4xl font-mono font-black text-indigo-600 block mt-1">{gameScore}</span>
              </div>
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-150">
                <span className="block text-[11px] font-bold text-stone-400 uppercase">完美合拍连击 (Streak)</span>
                <span className="text-4xl font-mono font-black text-amber-500 block mt-1">{gameStreak} 🔥</span>
              </div>
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-150 col-span-2 md:col-span-1">
                <span className="block text-[11px] font-bold text-stone-400 uppercase font-sans">目标时间差</span>
                <span className="text-lg font-mono font-black text-stone-700 block mt-3">
                  {(meter === '6/8' ? (60 / bpm * 0.5) : (60 / bpm)).toFixed(3)} 秒/拍
                </span>
              </div>
            </div>

            {/* Giant tactile tapping pad with animation */}
            <div 
              onClick={handleGameTap}
              className={`relative h-56 w-full max-w-md mx-auto rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all select-none border-2 active:scale-[0.98] ${
                gameActive 
                  ? 'bg-gradient-to-br from-indigo-550 to-purple-650 bg-indigo-600 text-white border-white/20 shadow-xl shadow-indigo-100 hover:shadow-2xl' 
                  : 'bg-stone-105 bg-stone-100 text-stone-400 border-dashed border-stone-300 pointer-events-none'
              }`}
            >
              {gameActive ? (
                <div className="space-y-2 pointer-events-none">
                  <div className="text-xl font-black tracking-widest animate-pulse">
                    🥁 正在感受节奏... 敲击我!
                  </div>
                  <p className="text-[11px] text-indigo-200">
                    可以在触摸板上点击，或者猛敲键盘【空格键】
                  </p>
                </div>
              ) : (
                <div className="space-y-1 text-stone-500">
                  <AlertCircle size={32} className="mx-auto text-amber-500" />
                  <p className="font-bold text-base text-stone-800">请点击下方的按钮初始化挑战</p>
                </div>
              )}
            </div>

            {/* Feedback log with highly visible contrast */}
            <div className="min-h-[4rem] flex flex-col justify-center items-center bg-stone-50 border border-stone-150 rounded-xl p-4">
              <p className={`text-base font-bold ${feedbackColor} transition-all`}>
                {gameFeedback}
              </p>
            </div>

            {/* Game controls */}
            <div className="flex gap-4 max-w-sm mx-auto">
              <button
                onClick={toggleRhythmGame}
                className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  gameActive 
                    ? 'bg-stone-900 hover:bg-stone-800 text-white shadow-lg' 
                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-100'
                }`}
              >
                {gameActive ? '结束挑战' : '点击开启挑战门票'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENDER TAB 3: Song Masterpieces Library */}
      {activeSubTab === 'library' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-lg animate-fadeIn">
          <div className="mb-6">
            <h3 className="text-2xl font-bold serif text-stone-950 flex items-center gap-2">
              <Music className="text-emerald-500" /> 钢琴传世金曲的拍号解剖学
            </h3>
            <p className="text-sm text-stone-550 mt-1 max-w-2xl leading-relaxed">
              音乐理论绝对不留在书本上。让我们去研究历史上最杰出的伟人，是如何将生硬的数字转化成摄人心魂的旋律的：
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {songExamples.map((song, idx) => (
              <div 
                key={idx}
                className="bg-stone-50 p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition-all group"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-black text-stone-900 group-hover:text-emerald-700 transition-colors">
                      {song.title}
                    </h4>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold font-mono rounded">
                      {song.meter} 拍
                    </span>
                  </div>
                  
                  <span className="block text-xs font-bold text-stone-400 mb-4 tracking-wider">
                    作曲：{song.composer}
                  </span>

                  <p className="text-xs text-stone-600 leading-relaxed min-h-[3.5rem] mb-4">
                    {song.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">音符极具象重音模式</span>
                  <div className="bg-white px-3 py-2.5 border rounded-lg font-sans text-xs border-stone-200/80 font-bold text-stone-700 shadow-inner">
                    {song.rhythmSchema}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-amber-50 p-6 rounded-2xl border border-amber-100 leading-relaxed text-xs">
            <h5 className="font-bold text-amber-950 text-sm mb-2 flex items-center gap-1.5">
              💡 听觉训练贴士：
            </h5>
            <p className="text-amber-900">
              听任何音乐（古典、流行、爵士）时，试着大声哼唱“ONE, two, three...”去找第一强拍。强音重击每一次像胶水般粘住我们的听觉，那就是新一个小节开端的起点标记。
            </p>
          </div>
        </div>
      )}

      {/* RENDER TAB 4: Quiz Challenge (Mastering tests) */}
      {activeSubTab === 'quiz' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-lg animate-fadeIn max-w-3xl mx-auto">
          {!quizFinished ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center text-xs font-bold text-stone-400 border-b border-stone-150 pb-3">
                <span className="uppercase tracking-widest text-[#B45309]">理论实力升华</span>
                <span>进度：{currentQuestion + 1} / {quizQuestions.length}</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full transition-all duration-300" 
                  style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                ></div>
              </div>

              {/* Question */}
              <h3 className="text-xl md:text-2xl font-black text-stone-900 font-serif leading-snug">
                {quizQuestions[currentQuestion].question}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {quizQuestions[currentQuestion].options.map((opt, oIdx) => {
                  let btnStyle = 'border-stone-200 text-stone-700 bg-white hover:bg-stone-50';
                  
                  if (showAnswer) {
                    if (oIdx === quizQuestions[currentQuestion].correctIndex) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                    } else if (selectedOption === oIdx) {
                      btnStyle = 'border-red-500 bg-red-50 text-red-900';
                    } else {
                      btnStyle = 'border-stone-100 bg-stone-50 text-stone-400 pointer-events-none';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={showAnswer}
                      onClick={() => handleAnswerSubmit(oIdx)}
                      className={`w-full text-left p-4 border rounded-xl flex items-center justify-between transition-all outline-none ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {showAnswer && oIdx === quizQuestions[currentQuestion].correctIndex && (
                        <Check size={18} className="text-emerald-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quiz Explanations block */}
              {showAnswer && (
                <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl animate-slideUp">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1.5">答案解析 (Explanation)</h4>
                  <p className="text-stone-700 text-sm leading-relaxed">{quizQuestions[currentQuestion].explanation}</p>
                  
                  <button
                    onClick={handleNextQuestion}
                    className="mt-4 px-6 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold shadow-lg flex items-center gap-1.5 ml-auto transition-colors"
                  >
                    <span>{currentQuestion + 1 === quizQuestions.length ? '查看最终战果' : '下一题'}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Quiz Results screen
            <div className="text-center py-8 space-y-6 animate-fadeIn">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500 border border-amber-100 shadow-inner animate-pulse">
                <Award size={44} />
              </div>

              <div>
                <h3 className="text-3xl font-black text-stone-900 serif">
                  拍号大关挑战圆满完工！
                </h3>
                <p className="text-stone-500 text-sm mt-1">
                  您的综合成绩：
                </p>
              </div>

              <div className="text-center">
                <span className="text-6xl font-mono font-black text-amber-500">
                  {score * 25}
                </span>
                <span className="text-xl text-stone-400">/ 100 分</span>
              </div>

              <p className="text-stone-600 text-sm max-w-sm mx-auto leading-relaxed">
                {score === quizQuestions.length 
                  ? '🏅 天才！你对分子、分母和复拍子的强弱细节有着绝对完美的把控，可以自信开启更高阶的课程。' 
                  : '🔍 很好！再把基础的“以几分音符为一拍”分母逻辑巩固一下，你会做得更加自如。'}
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetQuiz}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <RefreshCw size={14} /> 重刷一轮
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimeSignatureLesson;
