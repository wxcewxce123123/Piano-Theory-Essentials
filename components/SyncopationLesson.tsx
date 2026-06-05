import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Play, Pause, Activity, Footprints, Sparkles, Gamepad2, 
  Trophy, RefreshCw, Layers, BookOpen, Volume2, Flame, 
  HelpCircle, AlertCircle, ChevronRight, Check
} from 'lucide-react';

type SyncopationType = 'classic' | 'anticipation' | 'tresillo';
type SoundKit = 'classic' | 'electronic' | 'acoustic';

interface SyncopationPattern {
  id: SyncopationType;
  name: string;
  chineseName: string;
  description: string;
  gridLabels: string[]; // Labels for sixteen slots
  hits: { index: number; type: 'strong' | 'accent' | 'weak'; label: string; duration: number }[];
}

interface Masterpiece {
  title: string;
  composer: string;
  style: string;
  description: string;
  syncUsage: string;
  rhythmTip: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const SyncopationLesson: React.FC = () => {
  // Tabs: 'visual' | 'trainer' | 'masterpieces' | 'quiz'
  const [activeTab, setActiveTab] = useState<'visual' | 'trainer' | 'masterpieces' | 'quiz'>('visual');

  // Metronome / Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(90);
  const [activePatternId, setActivePatternId] = useState<SyncopationType>('classic');
  const [soundKit, setSoundKit] = useState<SoundKit>('electronic');
  const [volume, setVolume] = useState(70);
  const [playMetronome, setPlayMetronome] = useState(true); // Ground steady pulse reference toggle

  // Trainer Game State
  const [trainerActive, setTrainerActive] = useState(false);
  const [trainerScore, setTrainerScore] = useState(0);
  const [trainerStreak, setTrainerStreak] = useState(0);
  const [trainerFeedback, setTrainerFeedback] = useState('点击下面按钮开始，准备在强拍之后的弱拍（切分点）按节奏拍击！');
  const [feedbackColor, setFeedbackColor] = useState('text-stone-500');
  const [feedbackOffset, setFeedbackOffset] = useState<string>('');
  const lastTrainerTapRef = useRef<number>(0);

  // Quiz State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Refs for Audio & Animation
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerIDRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);

  // Synchronized state refs for audio loop
  const bpmRef = useRef(bpm);
  const activePatternIdRef = useRef(activePatternId);
  const soundKitRef = useRef(soundKit);
  const volumeRef = useRef(volume);
  const playMetronomeRef = useRef(playMetronome);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { activePatternIdRef.current = activePatternId; }, [activePatternId]);
  useEffect(() => { soundKitRef.current = soundKit; }, [soundKit]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { playMetronomeRef.current = playMetronome; }, [playMetronome]);

  const startTimeRef = useRef<number>(0);
  const nextNoteTimeRef = useRef<number>(0);
  const tickIndexRef = useRef<number>(0);

  // 16 Sixteenth notes in 1 Bar of 4/4
  const TOTAL_STEPS = 16;

  // Pattern Configurations
  const PATTERNS: Record<SyncopationType, SyncopationPattern> = {
    classic: {
      id: 'classic',
      name: 'Classic Syncopation',
      chineseName: '经典八分切分音',
      description: '最基础的切分音。在第1拍和第3拍的“弱半拍”出重音，并延音拉长，故意让最稳定的下拍（第2、4拍）保持空洞，产生极强的失重与拉扯感。',
      gridLabels: ['1 拍', 'e', '&', 'ah', '2 拍', 'e', '&', 'ah', '3 拍', 'e', '&', 'ah', '4 拍', 'e', '&', 'ah'],
      hits: [
        { index: 0, type: 'strong', label: '1 拍正', duration: 2 },
        { index: 2, type: 'accent', label: '1 拍半 (切分音)', duration: 4 }, // Weak subdivision struck & held across beat 2
        { index: 6, type: 'weak', label: '2 拍半', duration: 2 },
        { index: 8, type: 'strong', label: '3 拍正', duration: 2 },
        { index: 10, type: 'accent', label: '3 拍半 (切分音)', duration: 4 }, // Struck & held across beat 4
        { index: 14, type: 'weak', label: '4 拍半', duration: 2 }
      ]
    },
    anticipation: {
      id: 'anticipation',
      name: 'Sixteenth Anticipation',
      chineseName: '十六分前推切分 (放克/流行)',
      description: '极为酷炫的放克(Funk)或拉丁风格节奏。重音被提前了整整一个十六分音符。感觉像把音乐猛地吸了一口，向前倾倒推移。',
      gridLabels: ['1 拍', 'e', '&', 'ah', '2 拍', 'e', '&', 'ah', '3 拍', 'e', '&', 'ah', '4 拍', 'e', '&', 'ah'],
      hits: [
        { index: 0, type: 'strong', label: '1 拍正', duration: 4 },
        { index: 4, type: 'weak', label: '2 拍正', duration: 3 },
        { index: 7, type: 'accent', label: '2 拍半后 (前推)', duration: 5 }, // Anticipated note before beat 3
        { index: 12, type: 'strong', label: '4 拍正', duration: 4 }
      ]
    },
    tresillo: {
      id: 'tresillo',
      name: 'Tresillo 3-3-2 Clave',
      chineseName: '拉丁塞西略 (3-3-2 律动)',
      description: '风靡全球的雷鬼(Reggaeton)和现代流行乐灵魂节奏（例如《Shape of You》）。将16个细分音符按 3+3+2 结构拆分。它的第二个和第三个重音恰好全部卡在弱拍空隙，充满弹性摇摆的律动。',
      gridLabels: ['1 拍', 'e', '&', 'ah', '2 拍', 'e', '&', 'ah', '3 拍', 'e', '&', 'ah', '4 拍', 'e', '&', 'ah'],
      hits: [
        { index: 0, type: 'strong', label: '1 (重)', duration: 3 },
        { index: 3, type: 'accent', label: '1& 后 (切分)', duration: 3 },
        { index: 6, type: 'accent', label: '2& (切分)', duration: 2 },
        { index: 8, type: 'strong', label: '3 (重)', duration: 3 },
        { index: 11, type: 'accent', label: '3& 后 (切分)', duration: 3 },
        { index: 14, type: 'accent', label: '4& (切分)', duration: 2 }
      ]
    }
  };

  const masterpieces: Masterpiece[] = [
    {
      title: '《枫叶拉格泰姆》 (Maple Leaf Rag)',
      composer: '斯科特·乔普林 (Scott Joplin)',
      style: '拉格泰姆 (Ragtime)',
      description: '切分音进入现代世俗音乐的始祖。左手演奏一板一眼的严整二分法重音，而右手几乎全部由跳跃的八分切分音符切碎。左右手完美地进行纵向“撕扯”，如同抹了黄油般轻快滑溜。',
      syncUsage: '利用切分音符重合和留空，形成右手永不停顿的非对称摇摆。',
      rhythmTip: '练习拉格泰姆时，大腿保持打一、二正拍，双手绝对独立演奏，右手重拍要准确落在“空中”。'
    },
    {
      title: '《蓝色狂想曲》 (Rhapsody in Blue)',
      composer: '乔治·格什温 (George Gershwin)',
      style: '交响爵士 (Symphonic Jazz)',
      description: '古典与爵士切分音交融的顶峰。开头黑管惊艳地拉长音滑上去之后，钢琴便奏出极具美国大都会街头气息的切分旋律。这些旋律大多在弱拍重音（Off-beat），充满朝气与戏剧性。',
      syncUsage: '利用十六分和八分切分连线，将音乐的重心彻底移位，带来摩登的力量。',
      rhythmTip: '这需要极致的“弱指力量”。不要压重正拍，而是通过微小的腕部跳动把“空中弱拍”弹得充满弹性。'
    },
    {
      title: '《赫比汉考克的西瓜人》 (Watermelon Man)',
      composer: '赫比·汉考克 (Herbie Hancock)',
      style: '融合爵士 (Jazz Funk)',
      description: '地道的放克灵魂舞动。贝斯和爵士鼓打出极致深邃的 3-3-2 塞西略变形与十六分前推切分(Sixteenth Anticipation)，听者浑身不自主地随着这个凹槽(Groove)进行前后晃动。',
      syncUsage: '整首曲子没有一拍是干瘪的正拍强击，旋律全部在前一个十六分音符瞬间爆发。',
      rhythmTip: '不要试图硬邦邦地数 1、2、3、4。要把自己想象成弹簧，把每一次十六分前推切分发力点，当作是释放弹力。'
    }
  ];

  const quizQuestions: QuizQuestion[] = [
    {
      question: '到底什么是“切分音 (Syncopation)”？它的本质作用是什么？',
      options: [
        '通过在正拍上狂弹重音，让节奏听起来像阅兵式那样刻板严整',
        '故意将重音从强拍移动到弱拍或弱分拍（Off-beat），打破原本稳定的预期，制造动能与 Groove',
        '一小节内塞入两个完全不同的速度，让左手慢、右手快，让听众完全听不懂节奏',
        '一种让所有音符都叠在一起强音齐奏的演奏技巧'
      ],
      correctIndex: 1,
      explanation: '切分音最本质的作用就是“颠覆强弱规则”。将原本属于强拍的重音转移到弱拍、或者将弱拍重音延长到强拍，从而在预期未满的地方产生奇妙的拉扯重心。'
    },
    {
      question: '为什么有些切分音符弹下后，原本应该重音击响的后一拍突然没声了，但却显得律动更强？',
      options: [
        '因为手太酸，漏弹了后面的音符',
        '因为延音线（Tie）将前一个弱拍上的切分重音延长了，使原本应该发声的正拍被“吃掉”了，形成了巨大的拉扯张力',
        '因为钢琴踏板坏了，没有办法继续传声音',
        '因为乐谱印刷错误，把后面的强拍音符漏印了'
      ],
      correctIndex: 1,
      explanation: '在切分音中，我们经常用延音线（Tie）将弱拍（或弱半拍）击响的重音，跨过后面的强拍。强拍因此保持悬空和静音，由于音响滞留（Syncopation Suspension），大脑会感到一种强烈的向前推涌动感！'
    },
    {
      question: '现代超级热门神曲（如 Reggaeton 音乐/流行舞曲）常说的 “3-3-2” 指的是什么？',
      options: [
        '一首曲子总共弹完花 3 分 3 角 2 秒',
        '三个歌手、三个乐手、两个领舞的组合',
        '将一个 4 拍小节的 16 个十六分音符等分，平均分成 3+3+2 脉冲结构，后两个重音落在弱拍上，散发热带摇摆气息',
        '钢琴上左手按 3 键、右手按 3 键、双脚踩 2 个踏板'
      ],
      correctIndex: 2,
      explanation: '3-3-2 Clave 是塞西略（Tresillo）节奏。它把 16 分音符框拆成 3(16分)-3(16分)-2(16分) 长度来打击。由于第二个重音踩在第 1 拍半的后边（弱半拍），第三个重音卡在第 2 拍半（弱半拍），形成了具有不可思议摇摆感的切分。'
    },
    {
      question: '在数节奏和拍击切分音时，保持什么样的心态最不容易被切分音“带偏”走音？',
      options: [
        '脑中和脚下必须有一个绝对平稳、不受任何干扰的核心“骨架律动（Pulse）”，切分重音反向拉扯它即可',
        '什么都不去数，凭直觉一顿乱拍，越乱切分力度越足',
        '每次拍击切分拍时，把脚踏的速度随时变快两倍',
        '只弹强拍，彻底抛弃所有的弱半拍'
      ],
      correctIndex: 0,
      explanation: '弹奏切分音最忌讳的就是“脚跟着切分音起跑”。我们必须保持大腿、身体或脚具有一个精准如铁律的恒定脉冲（Pulse）作为参考，身体知道“正拍在哪”，手指在“弱位（空中）”用力打击，才能体会到反作用力的切分美感。'
    }
  ];

  // --- METRONOME ENGINE (Web Audio API Direct scheduling) ---
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSynthesizedClick = (time: number, isStrong: boolean, isAccent: boolean, isMetronomePulse: boolean) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const masterVolume = (volumeRef.current / 100) * 0.18;
    const kit = soundKitRef.current;

    if (isMetronomePulse) {
      // Very dry, subtle click for metronome pulse background so user maintains pulse reference
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, time);
      gainNode.gain.setValueAtTime(masterVolume * 0.25, time);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
      osc.start(time);
      osc.stop(time + 0.06);
      return;
    }

    if (kit === 'classic') {
      osc.type = 'sine';
      if (isStrong) {
        osc.frequency.setValueAtTime(950, time);
        gainNode.gain.setValueAtTime(masterVolume * 1.2, time);
      } else if (isAccent) {
        // High, laser-like blip for syncopated accents 
        osc.frequency.setValueAtTime(1300, time);
        gainNode.gain.setValueAtTime(masterVolume * 1.3, time);
      } else {
        osc.frequency.setValueAtTime(600, time);
        gainNode.gain.setValueAtTime(masterVolume * 0.6, time);
      }
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      osc.start(time);
      osc.stop(time + 0.12);

    } else if (kit === 'electronic') {
      // 808 Style punchy sound kit
      osc.type = 'triangle';
      if (isStrong) {
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(30, time + 0.14);
        gainNode.gain.setValueAtTime(masterVolume * 1.5, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
        osc.start(time);
        osc.stop(time + 0.18);

        // Click crisp component on strong
        const clk = ctx.createOscillator();
        const clkG = ctx.createGain();
        clk.connect(clkG);
        clkG.connect(ctx.destination);
        clk.type = 'sine';
        clk.frequency.setValueAtTime(2200, time);
        clkG.gain.setValueAtTime(masterVolume * 0.3, time);
        clkG.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
        clk.start(time);
        clk.stop(time + 0.03);
      } else if (isAccent) {
        // Crisp 808 Snare blip on syncopated accent
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, time);
        osc.frequency.exponentialRampToValueAtTime(400, time + 0.08);
        gainNode.gain.setValueAtTime(masterVolume * 1.4, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        osc.start(time);
        osc.stop(time + 0.12);
        
        // Noise snap
        const noise = ctx.createOscillator();
        const noiseG = ctx.createGain();
        noise.connect(noiseG);
        noiseG.connect(ctx.destination);
        noise.type = 'triangle';
        noise.frequency.setValueAtTime(1800, time);
        noiseG.gain.setValueAtTime(masterVolume * 0.5, time);
        noiseG.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
        noise.start(time);
        noise.stop(time + 0.07);
      } else {
        // Simple synth tom tick
        osc.frequency.setValueAtTime(320, time);
        gainNode.gain.setValueAtTime(masterVolume * 0.6, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
        osc.start(time);
        osc.stop(time + 0.08);
      }
    } else if (kit === 'acoustic') {
      // Woodblock & Sidestick click
      osc.type = 'triangle';
      if (isStrong) {
        osc.frequency.setValueAtTime(650, time);
        gainNode.gain.setValueAtTime(masterVolume * 1.2, time);
      } else if (isAccent) {
        osc.frequency.setValueAtTime(1100, time);
        gainNode.gain.setValueAtTime(masterVolume * 1.4, time);
      } else {
        osc.frequency.setValueAtTime(450, time);
        gainNode.gain.setValueAtTime(masterVolume * 0.7, time);
      }
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
      osc.start(time);
      osc.stop(time + 0.09);
    }
  };

  const scheduleNextNotes = () => {
    if (!audioCtxRef.current || !isPlayingRef.current) return;

    const scheduleAheadTime = 0.15;
    const secondsPerBeat = 60.0 / bpmRef.current;
    
    // We are dividing a 4-beat bar into 16 steps (sixteenth subdivisions)
    const secondsPerStep = secondsPerBeat / 4.0;

    while (nextNoteTimeRef.current < audioCtxRef.current.currentTime + scheduleAheadTime) {
      const stepIndex = tickIndexRef.current % TOTAL_STEPS;
      
      const pattern = PATTERNS[activePatternIdRef.current];
      const matchHit = pattern.hits.find(hit => hit.index === stepIndex);

      // Play ground pulse reference (regular beats: 0, 4, 8, 12) if playMetronome is true
      if (playMetronomeRef.current && (stepIndex % 4 === 0)) {
        playSynthesizedClick(nextNoteTimeRef.current, false, false, true);
      }

      // Play pattern notes
      if (matchHit) {
        const isStrong = matchHit.type === 'strong';
        const isAccent = matchHit.type === 'accent';
        playSynthesizedClick(nextNoteTimeRef.current, isStrong, isAccent, false);
      }

      nextNoteTimeRef.current += secondsPerStep;
      tickIndexRef.current++;
    }

    timerIDRef.current = window.setTimeout(scheduleNextNotes, 25.0);
  };

  // --- GEOMETRIC SYNC PLAY ANIMATION LOOP ---
  const drawTrajectory = () => {
    if (!isPlayingRef.current || !canvasRef.current || !audioCtxRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (width === 0 || height === 0) {
      animationRef.current = requestAnimationFrame(drawTrajectory);
      return;
    }

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const currentTime = audioCtxRef.current.currentTime;
    const secondsPerBeat = 60.0 / bpmRef.current;
    const secondsPerBar = secondsPerBeat * 4.0;

    const elapsed = Math.max(0, currentTime - startTimeRef.current);
    const progress = (elapsed % secondsPerBar) / secondsPerBar; // 0 to 1 loop

    const pattern = PATTERNS[activePatternIdRef.current];

    const paddingX = 45;
    const drawingWidth = width - paddingX * 2;
    const baselineYTop = 64;       // Ground steady pulse reference track
    const baselineYBottom = 160;   // Dynamic syncopated bouncing wave track
    const animationAmplitude = 36;  // Height of bouncing curves

    // ---- TRACK 1: Reference Pulse Track (Top) ----
    ctx.beginPath();
    ctx.moveTo(paddingX - 10, baselineYTop);
    ctx.lineTo(width - paddingX + 10, baselineYTop);
    ctx.strokeStyle = '#CBD5E1'; // Slate-300
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot 4 steady rhythmic beats arches (Down-up-down-up)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const beatWidth = drawingWidth / 4;
      const xStart = paddingX + i * beatWidth;
      const xEnd = paddingX + (i + 1) * beatWidth;

      ctx.moveTo(xStart, baselineYTop);
      for (let xCoord = xStart; xCoord <= xEnd; xCoord++) {
        const localProg = (xCoord - xStart) / beatWidth;
        const curveY = baselineYTop - Math.sin(localProg * Math.PI) * 20;
        ctx.lineTo(xCoord, curveY);
      }
    }
    ctx.stroke();

    // Regular pulse dot indicators (1, 2, 3, 4 beats)
    for (let i = 0; i <= 4; i++) {
      const xPoint = paddingX + i * (drawingWidth / 4);
      ctx.beginPath();
      ctx.arc(xPoint, baselineYTop, i < 4 ? 5 : 4, 0, Math.PI * 2);
      ctx.fillStyle = i < 4 ? '#475569' : '#94A3B8';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (i < 4) {
        ctx.font = 'bold 9px font-sans';
        ctx.fillStyle = '#64748B';
        ctx.textAlign = 'center';
        ctx.fillText(`${i + 1} 拍`, xPoint, baselineYTop - 25);
      }
    }

    // Steady pulse ball
    const pulseBallX = paddingX + progress * drawingWidth;
    const currentPulseSegment = (progress * 4) % 1;
    const pulseBallY = baselineYTop - Math.sin(currentPulseSegment * Math.PI) * 20;

    ctx.beginPath();
    ctx.arc(pulseBallX, pulseBallY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#64748B';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();


    // ---- TRACK 2: The Syncopated Wave (Bottom - THE MAIN TRAJECTORY!) ----
    ctx.beginPath();
    ctx.moveTo(paddingX - 10, baselineYBottom);
    ctx.lineTo(width - paddingX + 10, baselineYBottom);
    ctx.strokeStyle = '#475569'; // Slate-600
    ctx.lineWidth = 3;
    ctx.stroke();

    // First draw pre-computed trajectory wave segments based on note durations
    ctx.beginPath();
    ctx.strokeStyle = activePatternId === 'tresillo' ? 'rgba(236, 72, 153, 0.4)' : 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 2]);

    for (let h = 0; h < pattern.hits.length; h++) {
      const hit = pattern.hits[h];
      const nextHit = pattern.hits[(h + 1) % pattern.hits.length];

      const stepWidth = drawingWidth / TOTAL_STEPS;
      const xStart = paddingX + hit.index * stepWidth;
      
      // Calculate where the note trajectory lands (either next hit or end of bar)
      let endIdx = hit.index + hit.duration;
      if (endIdx > TOTAL_STEPS) {
        endIdx = TOTAL_STEPS;
      }
      const xEnd = paddingX + endIdx * stepWidth;
      const currentWidth = xEnd - xStart;

      // Draw custom sine-arc representing note duration
      ctx.moveTo(xStart, baselineYBottom);
      for (let xCoord = xStart; xCoord <= xEnd; xCoord++) {
        const localProg = (xCoord - xStart) / currentWidth;
        const curveY = baselineYBottom - Math.sin(localProg * Math.PI) * animationAmplitude;
        ctx.lineTo(xCoord, curveY);
      }
    }
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // Draw the actual hits bubbles/impact positions on the baseline progress
    for (let i = 0; i < TOTAL_STEPS; i++) {
      const matchHit = pattern.hits.find(hit => hit.index === i);
      const xPoint = paddingX + i * (drawingWidth / TOTAL_STEPS);

      if (matchHit) {
        const isAccent = matchHit.type === 'accent';
        const isStrong = matchHit.type === 'strong';

        // Glowing shadow decoration for offbeats
        if (isAccent) {
          ctx.beginPath();
          ctx.arc(xPoint, baselineYBottom, 8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(xPoint, baselineYBottom, isAccent ? 8 : (isStrong ? 6 : 4), 0, Math.PI * 2);
        ctx.fillStyle = isAccent ? '#F59E0B' : (isStrong ? '#E2E8F0' : '#475569');
        ctx.fill();
        ctx.strokeStyle = isAccent ? '#FFFFFF' : '#1E293B';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Label above syncopated points
        ctx.font = `bold ${isAccent ? '10px' : '9px'} font-sans`;
        ctx.fillStyle = isAccent ? '#F59E0B' : '#94A3B8';
        ctx.textAlign = 'center';
        ctx.fillText(
          isAccent ? '★ 切分音' : (isStrong ? '【强】' : '•'), 
          xPoint, 
          baselineYBottom + 20
        );
      }
    }

    // Draw the glowing kinetic bouncing ball on the syncopated curve (calculated dynamically)
    // 1. Find which hit segment the playhead is currently on
    const currentStepNum = progress * TOTAL_STEPS;
    let activeHitIdx = 0;
    
    for (let h = 0; h < pattern.hits.length; h++) {
      const curr = pattern.hits[h];
      const start = curr.index;
      const end = curr.index + curr.duration;
      
      if (currentStepNum >= start && currentStepNum < end) {
        activeHitIdx = h;
        break;
      }
      // Overlap loop handle if playhead crosses the bar boundary
      if (curr.index + curr.duration > TOTAL_STEPS && currentStepNum < (curr.index + curr.duration) % TOTAL_STEPS) {
        activeHitIdx = h;
        break;
      }
    }

    const activeHitMark = pattern.hits[activeHitIdx];
    const segmentStartIdx = activeHitMark.index;
    let segmentEndIdx = segmentStartIdx + activeHitMark.duration;
    
    // Normalize progress index on this active segment stretch
    let segmentProgress = 0;
    const dur = activeHitMark.duration;

    if (currentStepNum >= segmentStartIdx) {
      segmentProgress = (currentStepNum - segmentStartIdx) / dur;
    } else {
      // Loop-around offset
      segmentProgress = (currentStepNum + TOTAL_STEPS - segmentStartIdx) / dur;
    }

    // Bound progressive safety between 0-1
    segmentProgress = Math.min(1.0, Math.max(0.0, segmentProgress));

    const stepWidth = drawingWidth / TOTAL_STEPS;
    const ballXSync = paddingX + progress * drawingWidth;
    const ballYSync = baselineYBottom - Math.sin(segmentProgress * Math.PI) * animationAmplitude;

    // Glowing halo for the Syncopated playhead
    const haloColor = activeHitMark.type === 'accent' ? '#F59E0B' : '#60A5FA';
    ctx.shadowColor = haloColor;
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.arc(ballXSync, ballYSync, 12, 0, Math.PI * 2);
    ctx.fillStyle = activeHitMark.type === 'accent' ? '#F59E0B' : (activeHitMark.type === 'strong' ? '#3B82F6' : '#94A3B8');
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.shadowBlur = 0; // Restore shadow defaults

    // Flash zap symbol if playhead is near the moment of hit (first 25% of note curve)
    if (activeHitMark.type === 'accent' && segmentProgress < 0.28) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px font-sans';
      ctx.fillText('⚡', ballXSync, ballYSync - 20);
    }

    animationRef.current = requestAnimationFrame(drawTrajectory);
  };

  const startEngine = async () => {
    initAudio();
    if (audioCtxRef.current?.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    if (audioCtxRef.current) {
      setIsPlaying(true);
      isPlayingRef.current = true;
      tickIndexRef.current = 0;

      const now = audioCtxRef.current.currentTime;
      nextNoteTimeRef.current = now + 0.1;
      startTimeRef.current = nextNoteTimeRef.current;

      scheduleNextNotes();

      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(drawTrajectory);
    }
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

    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handlePatternChange = (patId: SyncopationType) => {
    stopEngine();
    setActivePatternId(patId);
  };

  const togglePlay = () => {
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


  // --- INTERACTIVE TAP GAME: SYNCOPATION TRAINER ---
  const handleTrainerTap = () => {
    if (!trainerActive) return;
    initAudio();

    // Trigger instant beautiful playclick audio blip
    if (audioCtxRef.current) {
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.frequency.setValueAtTime(1100, audioCtxRef.current.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.05);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.07);
    }

    const currentBpm = bpm;
    // For Class Eighth Syncopation trainer: the TARGET of offbeats (Beats 1& / 3&) 
    // occurs at interval offset: (60 / BPM) / 2 = half-beat distance.
    const beatIntervalSec = 60.0 / currentBpm;
    const halfBeatIntervalSec = beatIntervalSec / 2.0;

    const nowSecs = performance.now() / 1000;
    if (lastTrainerTapRef.current === 0) {
      lastTrainerTapRef.current = nowSecs;
      setTrainerFeedback('很好！开始感知下一小节弱音切分拍，连续、匀称地在空位点按...');
      setFeedbackColor('text-blue-600 font-bold');
      setFeedbackOffset('');
      return;
    }

    const actualDiff = nowSecs - lastTrainerTapRef.current;
    lastTrainerTapRef.current = nowSecs;

    // Calculate error distance to the nearest target off-beat (half-beat or whole-beat syncopation)
    // In our trainer, we want the user to tap at the offbeat (half-beat interval, i.e., 1.5, 2.5 times beatInterval)
    const subdivisionFit = actualDiff / halfBeatIntervalSec;
    const roundedFit = Math.round(subdivisionFit);
    
    // We only reward click when they align to an ODD index of rounded fit (which are the Off-beats!)
    // For example: 1.0 is beat& (offbeat), 2.0 is beat (onbeat), 3.0 is offbeat etc.
    const isOffbeatHit = roundedFit % 2 !== 0;

    const targetInterval = roundedFit * halfBeatIntervalSec;
    const errorSecs = actualDiff - targetInterval;
    const errorPercent = Math.abs(errorSecs) / halfBeatIntervalSec;

    let pointsEarned = 0;
    let desc = '';
    let col = '';
    let offsetMsg = `${(errorSecs * 1000).toFixed(0)} 毫秒`;

    if (!isOffbeatHit) {
      desc = '❌ 踩在大重拍正拍上了！切分点应该打在两拍正拍之间的“半空卡位”中。';
      col = 'text-rose-500 font-semibold';
      setTrainerStreak(0);
    } else if (errorPercent < 0.12) {
      pointsEarned = 20;
      desc = '🔥 完美切分! (Perfect) 身体凹槽感与抗力堪称现场级！';
      col = 'text-amber-500 font-black scale-105';
    } else if (errorPercent < 0.24) {
      pointsEarned = 10;
      desc = '👍 优秀卡准! (Good) 抢位非常准，肢体平衡感绝佳！';
      col = 'text-green-600 font-bold';
    } else {
      desc = errorSecs > 0 ? '🐢 切分微慢，有点往下掉。' : '🐇 拍急了！平稳呼吸，把声音悬空在中间。';
      col = 'text-stone-500';
      setTrainerStreak(0);
    }

    if (pointsEarned > 0) {
      setTrainerScore(prev => prev + pointsEarned);
      setTrainerStreak(prev => prev + 1);
    }

    setTrainerFeedback(desc);
    setFeedbackColor(col);
    setFeedbackOffset(isOffbeatHit ? (errorSecs > 0 ? `偏慢 ${offsetMsg}` : `偏快 ${offsetMsg}`) : '完全偏离切分点');
  };

  const toggleTrainerGame = () => {
    if (trainerActive) {
      setTrainerActive(false);
      lastTrainerTapRef.current = 0;
      setTrainerStreak(0);
    } else {
      setTrainerActive(true);
      setTrainerScore(0);
      setTrainerStreak(0);
      lastTrainerTapRef.current = 0;
      setTrainerFeedback('嗒-（空）-嗒-（空）... 切分速度已锁定，请在每一次正拍弱拍边缘敲出切分力！');
      setFeedbackColor('text-amber-600 font-bold animate-pulse');
      setFeedbackOffset('');
    }
  };

  // Keyboard Space support for trainers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleTrainerTap();
      }
    };
    if (trainerActive) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [trainerActive, bpm]);


  // --- QUIZ GAME ACTIONS ---
  const handleAnswerSubmit = (optionIdx: number) => {
    if (showAnswer) return;
    setSelectedOption(optionIdx);
    setShowAnswer(true);
    if (optionIdx === quizQuestions[currentQuestion].correctIndex) {
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

  const currentPattern = PATTERNS[activePatternId];

  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto px-1">
      {/* Premium Header */}
      <header className="animate-slideUp">
        <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-amber-500 to-red-500 text-white rounded-full text-xs font-black tracking-widest uppercase mb-4 shadow-sm">
          LEVEL 4 - 节奏高级张力专题 (Syncopation)
        </div>
        <h2 className="text-4xl md:text-5xl font-black serif text-stone-900 mb-4 tracking-tight flex items-center gap-3">
          <Zap className="text-amber-500 animate-pulse" size={36} /> 切分音的重力转移：击碎规则，拥抱摇摆
        </h2>
        <p className="text-lg text-stone-600 font-light max-w-3xl leading-relaxed">
          切分音是音乐中的“反叛力”。它通过<strong>强行转移重拍位置</strong>、或是将重音放置于最意想不到的弱拍位，打破身体原本机械的重力平衡，产生一股想要不停起飞、跳跃的强烈律动动能。
        </p>
      </header>

      {/* Tabs Menu */}
      <div className="flex bg-stone-100 p-1.5 rounded-2xl md:max-w-md shadow-inner border border-stone-200">
        <button
          onClick={() => { setActiveTab('visual'); stopEngine(); }}
          className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'visual' ? 'bg-white text-stone-900 shadow-md scale-[1.02]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Sparkles size={15} /> 逆重力运动轨迹
        </button>
        <button
          onClick={() => { setActiveTab('trainer'); stopEngine(); }}
          className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'trainer' ? 'bg-white text-stone-900 shadow-md scale-[1.02]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Gamepad2 size={15} /> 体感强弱校对
        </button>
        <button
          onClick={() => { setActiveTab('masterpieces'); stopEngine(); }}
          className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'masterpieces' ? 'bg-white text-stone-900 shadow-md scale-[1.02]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <BookOpen size={15} /> 巨匠切分图谱
        </button>
        <button
          onClick={() => { setActiveTab('quiz'); stopEngine(); }}
          className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'quiz' ? 'bg-white text-stone-900 shadow-md scale-[1.02]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Trophy size={15} /> 实力水平挑战
        </button>
      </div>

      {/* TAB 1: Visual and sound stage */}
      {activeTab === 'visual' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Main Visualizer Stage */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-lg relative overflow-hidden">
            {/* Background luxury gradient glow */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-amber-50 to-transparent opacity-60"></div>

            <div className="relative z-10 flex flex-col lg:flex-row gap-8">
              {/* Left Side: Rhythmic displacement details & explanation */}
              <div className="w-full lg:w-1/3 flex flex-col items-center bg-stone-50 p-6 rounded-2xl border border-stone-200 animate-slideUp">
                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-4">重力中心横向移位</span>

                <div className="flex flex-col items-center relative py-6 px-10 bg-white rounded-2xl border border-stone-100 shadow-sm w-full max-w-[14rem]">
                  <div className="text-[10px] font-black text-amber-500 leading-none mb-1 select-none tracking-widest bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                    打破常规下拍
                  </div>

                  <div className="text-3xl font-sans font-black text-stone-800 leading-none my-4 select-none flex items-center">
                    弱拍 <ChevronRight size={20} className="text-amber-500 animate-ping" /> 强音
                  </div>

                  <div className="text-[10px] font-black text-stone-500 leading-none mt-1 select-none tracking-widest bg-stone-100 px-3 py-1.5 rounded-full">
                    延音跨越强拍骨架
                  </div>
                </div>

                <div className="mt-6 w-full space-y-3.5 text-xs text-stone-600 leading-relaxed">
                  <div className="bg-white p-4 rounded-xl border border-stone-150 shadow-sm">
                    <span className="block font-bold text-stone-800 text-xs mb-1">“悬空”心理学</span>
                    当乐音在强拍（1、3拍）前击响并廷时，原本该受到重击的强拍瞬间成了“空的”。大脑会体验到一种轻微的、由于重力未按时着陆而产生的<strong>悬空兴奋感</strong>。
                  </div>
                  <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-100">
                    <span className="block font-bold text-amber-900 text-xs mb-1">训练小窍门 (Anti-gravity)</span>
                    弹切分音时，手部可以极其松弛地在空中划一个弧线，反向去借用身体打拍子的下坠阻力。这就是爵士钢琴中的 “Air-Bounce” 感。
                  </div>
                </div>
              </div>

              {/* Right Column: Visual bounce curves & sound controls */}
              <div className="w-full lg:w-2/3 flex flex-col gap-6 justify-between">
                <div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-200 pb-4 mb-4 gap-3">
                    <div>
                      <h3 className="text-2xl font-bold font-serif text-stone-900">
                        {currentPattern.chineseName}
                      </h3>
                      <p className="text-xs text-stone-400 font-medium mt-1 leading-relaxed max-w-md">{currentPattern.description}</p>
                    </div>

                    <div className="flex bg-stone-100 p-1 rounded-xl shrink-0 self-start md:self-auto">
                      {(['classic', 'anticipation', 'tresillo'] as SyncopationType[]).map((pat) => (
                        <button
                          key={pat}
                          onClick={() => handlePatternChange(pat)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                            activePatternId === pat 
                              ? 'bg-amber-500 text-stone-950 shadow-sm' 
                              : 'text-stone-500 hover:text-stone-900'
                          }`}
                        >
                          {pat === 'classic' ? '经典切分' : pat === 'anticipation' ? '前推十六分' : '拉丁3-3-2'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* HIGH PERFORMANCE TRAJECTORY CANVAS STAGE */}
                  <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 relative min-h-[18rem] flex flex-col items-center justify-center overflow-hidden shadow-inner">
                    <div className="absolute top-3 left-4 flex gap-1.5 z-20">
                      <div className="text-[10px] text-white/50 bg-white/10 px-2.5 py-1 rounded-full font-mono font-bold select-none">
                        当前小节细分：16 步
                      </div>
                    </div>

                    <canvas 
                      ref={canvasRef} 
                      className="w-full h-48 block bg-transparent"
                      style={{ touchAction: 'none' }}
                    />

                    {/* Accent Guides panel */}
                    <div className="w-full mt-4 flex items-center justify-between px-3 text-[10px] font-mono text-stone-400 select-none">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-600"></span> 脉冲参考轨 (Steady Pulse Beat)
                      </span>
                      <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> 逆向切分波 (Syncopated Gravity Arc)
                      </span>
                    </div>

                    {!isPlaying && (
                      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center select-none z-10 transition-opacity">
                        <div className="w-14 h-14 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer" onClick={startEngine}>
                          <Play size={28} fill="currentColor" className="ml-1" />
                        </div>
                        <p className="text-white font-bold text-sm mt-3">点击开启切分引擎，眼观“流线逆行轨”、耳闻“错位拉扯”</p>
                        <p className="text-stone-400 text-xs mt-1 max-w-sm leading-relaxed">
                          采用高保真音频合成器与平滑贝塞尔极速反弹轨迹，提供最直观的强弱反弹切分对比
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Meter controls and Reference Metronome switch */}
                <div className="grid md:grid-cols-2 gap-4 bg-stone-100/50 p-4 rounded-xl border border-stone-200">
                  <div className="space-y-4 text-xs font-semibold">
                    <div>
                      <span className="block text-stone-600 font-bold mb-1.5 text-xs">主声音组 (Sound Kits)</span>
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
                            {kit === 'classic' ? '经典蜂鸣' : kit === 'electronic' ? '鼓机 808' : '实木侧击'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-stone-200">
                      <div className="leading-tight">
                        <span className="block text-stone-700 font-bold">参考正拍 metronome</span>
                        <span className="block text-[10px] text-stone-400 font-medium">开启后提供平稳的背景四拍骨架</span>
                      </div>
                      <button
                        onClick={() => setPlayMetronome(!playMetronome)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-colors ${
                          playMetronome 
                            ? 'bg-green-600 text-white shadow-sm' 
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {playMetronome ? '开启中' : '已关闭'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="flex justify-between text-xs text-stone-600 font-bold mb-1.5">
                        <span>节拍速度 (BPM)</span>
                        <span className="font-mono text-amber-600 text-xs font-black">{bpm} 拍/分</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-stone-400">50</span>
                        <input
                          type="range"
                          min="50"
                          max="130"
                          value={bpm}
                          onChange={(e) => setBpm(Number(e.target.value))}
                          className="w-full h-1 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <span className="text-xs font-mono text-stone-400">130</span>
                      </div>
                    </div>

                    <div className="pt-1 select-none">
                      <button
                        onClick={togglePlay}
                        className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 border transition-all active:scale-[0.98] cursor-pointer ${
                          isPlaying 
                            ? 'bg-stone-900 border-stone-900 text-white shadow-lg hover:bg-stone-800' 
                            : 'bg-amber-500 border-amber-500 text-stone-950 shadow-lg hover:bg-amber-400'
                        }`}
                      >
                        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                        <span>{isPlaying ? '暂停切分规律律动' : '开启切分观察'}</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Rhythmic Physics boxes */}
          <div className="grid md:grid-cols-2 gap-6 leading-relaxed">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex gap-4">
              <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center shrink-0 border border-stone-200 text-stone-600">
                <Footprints size={22} />
              </div>
              <div>
                <h4 className="text-base font-black text-stone-900 mb-1">正拍骨架 (The On-beats) - 恒定下沉重力</h4>
                <p className="text-xs text-stone-600">
                  像重力铁球。每一次重击均精准击打在 1、2、3、4 拍的重力垂直落地线上。它像大理石柱般稳固有力，是人体肢体感知时间跨度的底层心理防线。
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 border border-amber-100 text-amber-500">
                <Zap size={22} className="animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-black text-stone-900 mb-1">切分音 (Syncopated) - 凌空抓捕</h4>
                <p className="text-xs text-stone-600">
                  像空中飞人。故意让声音在重拍到来前弹响并且保持音量，逼迫正拍处于悬空。它和正拍重力形成了一股巨大的、向上飞扬的对抗张力，这也是 Groove 的核心成分。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Trainer Game stage */}
      {activeTab === 'trainer' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-lg animate-fadeIn max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold serif text-stone-950 flex items-center justify-center gap-2">
              <Gamepad2 className="text-amber-500 animate-bounce" /> 切分体感肌肉精度测试仪
            </h3>
            <p className="text-xs text-stone-500 max-w-xl mx-auto leading-relaxed">
              测试你是否能抵抗强拍重力的本能磁力！测试仪会提供平稳的背景常规脉冲鼓点（强拍），你要<strong>刻意在两个正拍的正中央半空位置（弱拍切分点）进行精准拍击</strong>，看看你敲出的切分误差是多少毫秒！
            </p>
          </div>

          <div className="bg-stone-950 p-6 md:p-8 rounded-2xl border border-stone-800 flex flex-col items-center justify-center text-center py-10 relative overflow-hidden shadow-inner">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-red-500"></div>

            <div className="absolute top-4 right-4 flex items-center gap-3 text-stone-400">
              <div className="text-left">
                <span className="block text-[9px] text-stone-500 font-bold uppercase tracking-wider">训练抗干扰速率</span>
                <span className="block text-xs font-mono text-amber-500 font-bold">{bpm} BPM</span>
              </div>
            </div>

            {/* Scoreboard */}
            <div className="flex gap-16 mb-8 relative z-10">
              <div className="text-center">
                <span className="block text-[11px] text-stone-400 font-bold uppercase tracking-wider mb-1">训练总得分</span>
                <span className="text-4xl font-mono font-black text-amber-400">{trainerScore}</span>
              </div>
              <div className="text-center">
                <span className="block text-[11px] text-stone-400 font-bold uppercase tracking-wider mb-1">连击 COMBO</span>
                <span className="text-4xl font-mono font-black text-rose-500 animate-pulse">{trainerStreak}</span>
              </div>
            </div>

            {/* Tap controls and ms timing delay output */}
            <div className="space-y-6 w-full max-w-md relative z-10">
              <div className="h-14 flex flex-col items-center justify-center select-none">
                <p className={`text-sm md:text-base font-bold transition-all duration-150 ${feedbackColor}`}>{trainerFeedback}</p>
                {feedbackOffset && (
                  <p className="text-xs text-stone-400 font-mono font-bold mt-1.5 bg-white/10 px-3 py-0.5 rounded-full border border-white/10">{feedbackOffset}</p>
                )}
              </div>

              <div className="flex justify-center pt-2">
                <button
                  disabled={!trainerActive}
                  onMouseDown={handleTrainerTap}
                  className="w-32 h-32 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 border-8 border-amber-950 shadow-2xl hover:brightness-110 active:scale-90 transition-all flex flex-col items-center justify-center text-stone-950 font-black select-none cursor-pointer outline-none disabled:from-stone-800 disabled:to-stone-900 disabled:border-stone-950 disabled:text-stone-600 disabled:cursor-not-allowed group"
                >
                  <Flame size={24} className="mb-1 text-stone-950/80 group-hover:scale-125 transition-transform" />
                  <span className="text-xs tracking-widest">{trainerActive ? '拍击：切分点!' : '未锁定'}</span>
                </button>
              </div>

              <p className="text-[11px] text-stone-500 font-medium">电脑端用户支持按键盘上的 【空格键】 直接拍击抗力切分点</p>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={toggleTrainerGame}
              className={`px-8 py-3.5 rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 transition-all outline-none ${
                trainerActive 
                  ? 'bg-stone-900 hover:bg-stone-800 text-white' 
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
              }`}
            >
              <RefreshCw size={14} className={trainerActive ? 'animate-spin' : ''} />
              <span>{trainerActive ? '关闭测试器 (查看精度成绩)' : '开启抗重力肌肉测试'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Masterpieces Gallery */}
      {activeTab === 'masterpieces' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-lg animate-fadeIn space-y-6">
          <div>
            <h3 className="text-2xl font-bold serif text-stone-950 flex items-center gap-2">
              <BookOpen className="text-amber-500" /> 世界传世巨献中的切分音图解
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-xl leading-relaxed">
              名作不单是音符的雕砌，天才们用切分音彻底释放了钢琴这台黑白打击乐器的野性动能：
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {masterpieces.map((piece, idx) => (
              <div 
                key={idx}
                className="bg-stone-50 border border-stone-200 p-6 rounded-2xl flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] bg-amber-500/10 text-amber-700 px-2.5 py-1 rounded-md font-bold uppercase">
                      {piece.style}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-stone-950 font-serif mb-1 group-hover:text-amber-600 transition-colors">
                    {piece.title}
                  </h4>
                  <p className="text-[11px] text-stone-400 font-medium mb-3">
                    作曲：{piece.composer}
                  </p>
                  
                  <p className="text-xs text-stone-600 leading-relaxed mb-4">
                    {piece.description}
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-stone-200/60 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-stone-150">
                    <span className="block font-bold text-stone-800 text-[11px] mb-0.5">⚡ 切分笔触</span>
                    <span className="text-[11px] text-stone-500 leading-relaxed block">{piece.syncUsage}</span>
                  </div>
                  <div className="bg-amber-50/40 p-2.5 rounded-lg border border-amber-100 text-amber-900/80">
                    <span className="block font-bold text-amber-950 text-[11px] mb-0.5">💡 钢琴手艺诀窍</span>
                    <span className="text-[11px] text-amber-700 leading-relaxed block">{piece.rhythmTip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Quiz Stage */}
      {activeTab === 'quiz' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-lg animate-fadeIn max-w-2xl mx-auto">
          {!quizFinished ? (
            <div className="space-y-6">
              {/* Question progress */}
              <div className="flex justify-between items-center text-xs text-stone-400 font-bold">
                <span>RHYTHMIC CHALLENGE</span>
                <span className="bg-stone-100 text-stone-700 px-2 py-1 rounded font-mono">
                  {currentQuestion + 1} / {quizQuestions.length}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                ></div>
              </div>

              {/* Question text */}
              <h3 className="text-lg md:text-xl font-bold font-serif text-stone-900 leading-relaxed">
                {quizQuestions[currentQuestion].question}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {quizQuestions[currentQuestion].options.map((opt, oIdx) => {
                  let btnStyle = 'border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-stone-700';
                  
                  if (showAnswer) {
                    if (oIdx === quizQuestions[currentQuestion].correctIndex) {
                      btnStyle = 'bg-green-50 border-green-400 text-green-900 font-bold';
                    } else if (selectedOption === oIdx) {
                      btnStyle = 'bg-rose-50 border-rose-300 text-rose-900';
                    } else {
                      btnStyle = 'opacity-50 border-stone-100';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={showAnswer}
                      onClick={() => handleAnswerSubmit(oIdx)}
                      className={`w-full p-4 rounded-xl border text-xs md:text-sm text-left transition-all flex justify-between items-center gap-3 ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {showAnswer && oIdx === quizQuestions[currentQuestion].correctIndex && (
                        <Check size={16} className="text-green-600 shrink-0" strokeWidth={3} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanations section */}
              {showAnswer && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 space-y-2 animate-fadeIn text-xs leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertCircle size={14} />
                    <span>切分功力深度解析</span>
                  </div>
                  <p className="text-amber-800">{quizQuestions[currentQuestion].explanation}</p>
                  
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-bold text-xs flex items-center gap-1"
                    >
                      <span>{currentQuestion + 1 === quizQuestions.length ? '完成挑战' : '下一题'}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 space-y-6 animate-fadeIn">
              <div className="inline-block p-4 bg-amber-50 text-amber-500 rounded-full border border-amber-100 shadow-sm animate-bounce">
                <Trophy size={48} />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black font-serif text-stone-900">切分抗力段位挑战完成！</h3>
                <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Your Rhythm Rank Results</p>
              </div>

              {/* Circular gauge */}
              <div className="flex flex-col items-center">
                <div className="relative w-28 h-28 flex items-center justify-center bg-stone-900 rounded-full shadow-lg border-4 border-amber-400">
                  <span className="text-4xl font-mono font-black text-amber-400 leading-none">
                    {Math.round((score / quizQuestions.length) * 100)}%
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-bold mt-4">
                  打对题数： {score} / {quizQuestions.length} 题
                </p>
              </div>

              <p className="text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                {score === quizQuestions.length 
                  ? '✨ 天生放客乐手！你具有极其顶尖的律动核心抵抗力，切分音的悬空格局在你脑中明镜如画！'
                  : '👍 表现不俗！你已经完全识破了切分拍的重拍转移欺骗，在经典钢琴独奏里你会对它的对抗性更为敏感。'
                }
              </p>

              <div>
                <button
                  onClick={resetQuiz}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
                >
                  重新进行测验
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SyncopationLesson;
