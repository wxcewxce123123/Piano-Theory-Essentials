import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Music, BookOpen, Volume2, Sparkles, Gamepad2, 
  Check, RefreshCw, Trophy, ChevronRight, Award, HelpCircle, 
  AlertCircle, Sliders, Layers, Activity
} from 'lucide-react';

type TripletSubdivision = 'eighth' | 'quarter' | 'sixteenth';
type SoundKit = 'classic' | 'electronic' | 'acoustic';

interface Masterpiece {
  title: string;
  composer: string;
  meter: string;
  description: string;
  tripletUsage: string;
  rhythmTip: string;
}

interface TripletQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const TripletsLesson: React.FC = () => {
  // Navigation tabs: 'visual' | 'trainer' | 'masterpieces' | 'quiz'
  const [activeTab, setActiveTab] = useState<'visual' | 'trainer' | 'masterpieces' | 'quiz'>('visual');
  
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(80);
  const [tripletMode, setTripletMode] = useState<'straight' | 'triplet'>('triplet');
  const [subdivision, setSubdivision] = useState<TripletSubdivision>('eighth');
  const [soundKit, setSoundKit] = useState<SoundKit>('classic');
  const [volume, setVolume] = useState(70);
  
  // Trainer state
  const [trainerActive, setTrainerActive] = useState(false);
  const [trainerScore, setTrainerScore] = useState(0);
  const [trainerStreak, setTrainerStreak] = useState(0);
  const [trainerFeedback, setTrainerFeedback] = useState('点击开始，尝试在心里数 1-2-3 按节奏拍击！');
  const [feedbackColor, setFeedbackColor] = useState('text-stone-500');
  const [feedbackOffset, setFeedbackOffset] = useState<string>('');
  const lastTrainerTapRef = useRef<number>(0);

  // Quiz State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Audio and Animation refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerIDRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);
  
  // Thread-safe Audio state tracking refs
  const bpmRef = useRef(bpm);
  const tripletModeRef = useRef(tripletMode);
  const subdivisionRef = useRef(subdivision);
  const soundKitRef = useRef(soundKit);
  const volumeRef = useRef(volume);

  const startTimeRef = useRef<number>(0);
  const nextNoteTimeRef = useRef<number>(0);
  const tickIndexRef = useRef<number>(0);

  // Keep references synchronized
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { tripletModeRef.current = tripletMode; }, [tripletMode]);
  useEffect(() => { subdivisionRef.current = subdivision; }, [subdivision]);
  useEffect(() => { soundKitRef.current = soundKit; }, [soundKit]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  // Configurations for Subdivisions
  const SUBDIVISION_CONFIG = {
    quarter: {
      title: '四分音符 vs 四分三连音',
      desc: '在常规两个正常拍时间里，“塞入”平均等宽的 3 个音，这是一种极为迷人且具备高级拉扯张力的节拍。',
      straightCount: 2, // 2 notes over 2 beats
      tripletCount: 3,  // 3 notes over 2 beats
      straightLabels: ['1 拍', '2 拍'],
      tripletLabels: ['1-da', 'da-2', '2-da'],
      straightCountStr: ['one', 'two'],
      tripletCountStr: ['one', 'tri', 'let']
    },
    eighth: {
      title: '八分音符 vs 八分三连音',
      desc: '最常用、最基础的三连音。把正常的一拍时间，从等分二部分（1 - &）升级为等分三部分（1 - trip - let）。',
      straightCount: 4, // 4 notes over 2 beats (2 per beat)
      tripletCount: 6,  // 6 notes over 2 beats (3 per beat)
      straightLabels: ['1 拍', '&', '2 拍', '&'],
      tripletLabels: ['1', 'trip', 'let', '2', 'trip', 'let'],
      straightCountStr: ['one', 'and', 'two', 'and'],
      tripletCountStr: ['one', 'la', 'li', 'two', 'la', 'li']
    },
    sixteenth: {
      title: '十六分音符 vs 六连音 (十六分三连音)',
      desc: '高频率的水流纹理。每半拍里塞入 3 个音，或者说一整拍里等距塞入 6 个音，充满流动感和绚烂色彩。',
      straightCount: 8, // 8 notes over 2 beats (4 per beat)
      tripletCount: 12, // 12 notes over 2 beats (6 per beat)
      straightLabels: ['1', 'e5', '&', 'ah', '2', 'e5', '&', 'ah'],
      tripletLabels: ['1', 'ti', 'ri', 'la', 'li', 'to', '2', 'ti', 'ri', 'la', 'li', 'to'],
      straightCountStr: ['1', 'e', '&', 'a', '2', 'e', '&', 'a'],
      tripletCountStr: ['1', 'la', 'li', 'da', 'di', 'do', '2', 'la', 'li', 'da', 'di', 'do']
    }
  };

  const masterpieces: Masterpiece[] = [
    {
      title: '《月光奏鸣曲》第一乐章 (Moonlight Sonata)',
      composer: '路德维希·凡·贝多芬 (Ludwig van Beethoven)',
      meter: '2/2 拍',
      description: '古典乐中最著名的三连音应用。右手持续演奏流淌的八分三连音，像夜晚平静湖面上轻微起伏的微光波浪，而左手和右手上方则演奏舒缓沉重的悲伤旋律，构成宏大的声部立体感。',
      tripletUsage: '全曲贯穿八分三连音，提供源源不断的低速流动背景。',
      rhythmTip: '不要弹得像时钟一样一板一眼，在三连音的流动中，右手伴奏应当极其轻柔，给左手的大跨度低音以及高声部歌唱让出空间。'
    },
    {
      title: '《第一号阿拉伯风华丽曲》 (Deux Arabesques No.1)',
      composer: '阿希尔-克劳德·德彪西 (Achille-Claude Debussy)',
      meter: '4/4 拍',
      description: '印象派标志性作品，极尽织体流动之美。乐曲中大量出现了“二对三”(Polyrhythm 2 vs 3) 的设计——左手弹奏均匀的双击八分音符，右手则是摇摆洒脱的八分三连音，二者交织汇聚成如梦似幻、流动的落水声。',
      tripletUsage: '利用三连音与双排键交织，彻底模糊纵向节奏线条。',
      rhythmTip: '“二对三”是高阶三连音练习。你可以嘴里念着：【爸 - 爸在小 (中) 桥】，即可完美吻合左右合拍的位置！'
    },
    {
      title: '《幻想即兴曲》 (Fantaisie-Impromptu, Op. 66)',
      composer: '弗雷德里克·肖邦 (Frédéric Chopin)',
      meter: '2/2 拍',
      description: '钢琴键盘上的速度与激情。肖邦最著名的标志乐章之一，全曲高潮迭起，核心由“三对四” (Polyrhythm 3 vs 4) 构成——左手是连绵不断的三连音伴奏（每拍 6 个精细细分），右手则是绚烂的十六分双击音符（每拍 8 个细分），呈现不可思议的自由律动。',
      tripletUsage: '左右手完全不同速。左手以强烈的重音分组，右手以流畅的十六分旋律飞奔。',
      rhythmTip: '弹奏时，千万不要企图用大脑去精确计算每个音符的纵向对齐，而是应当把双手分开练到完全自动化后，依靠各自的主干重拍在第一拍交汇对齐，实现宏观合拍。'
    },
    {
      title: '《耶稣，人类仰望的喜悦》 (Jesu, Joy of Man\'s Desiring)',
      composer: '约翰·塞巴斯蒂安·巴赫 (Johann Sebastian Bach)',
      meter: '9/8 拍',
      description: '神圣、安详且充满光芒的赞美歌。巴赫利用 9/8 复拍子，将整首曲子沉浸在连绵不断的 9 个八分音符流动中。听感上，就等同于每小节有 3 大拍，而每一大拍中，都拥有一个无比神圣饱满的“三连音细分”波形。',
      tripletUsage: '复拍子的天然三连音属性，每大拍均包含 3 个八分音符。',
      rhythmTip: '这比数学上的强制三连音更自然。弹奏时应当想象呼吸起伏：吸气-呼气-停顿，吸气-呼气-停顿，旋律就如同泉水，毫无干涩。'
    }
  ];

  const quizQuestions: TripletQuestion[] = [
    {
      question: '钢琴谱中，“三连音”上面的标记通常是什么样的？',
      options: [
        '音符上方写着一个数字 “5” 并在虚线弧内',
        '音符群上方有一个小括弧或连线，并在中央标上了数字 “3”',
        '音符旁边标有三角形的尖角符号',
        '音符符干上有两条粗斜线斜跨而过'
      ],
      correctIndex: 1,
      explanation: '在五线谱中，三连音（Triplet）通常以一个连线或括弧框住这三个音符，并且在旁边明显标注一个数字 “3” 来表示它们是等分三份。'
    },
    {
      question: '如果在一个标准的 4/4 拍小节中，只写了两个“四分三连音”音符群，那么这个小节总共包含了几个音符，弹奏的时长是多少？',
      options: [
        '共 4 个音符，等于 4 分钟',
        '共 3 个音符，等于 3 秒钟',
        '共 6 个音符，弹法是把每两拍平均等分成 3 份，合起来刚好填满 4 拍',
        '共 8 个音符，弹法是每拍平均弹 2 下，合起来填满 4 拍'
      ],
      correctIndex: 2,
      explanation: '一个 4/4 拍小节有 4 拍。我们可以将前 2 拍等分放入 3 个四分三连音，将后 2 拍也等分放入 3 个四分三连音，总共 6 个音符，这种称为“四分三连音”。'
    },
    {
      question: '在数节奏和哼唱三连音时，口诀中常用什么唱词来准确卡位三个音符的时间点？',
      options: [
        '唱 “1 - 哒 - 2 - 哒 - 3 - 哒”',
        '唱 “1 - trip - let - 2 - trip - let” 或者 “1 - 啦 - 哩 - 2 - 啦 - 哩”',
        '唱 “1 - 2 - 3 - 4 - 5 - 6”',
        '唱 “动 - 次 - 大 - 次 - 咚 - 次”'
      ],
      correctIndex: 1,
      explanation: '中英文教学中，唱三连音最有效的三等分发音词是 “1-trip-let, 2-trip-let” 或者 “1-啦-哩, 2-啦-哩”。这三个字音长、开口感极为近似，能天然帮助大脑卡着等距的时间。'
    },
    {
      question: '肖邦和德彪西作品中屡屡闪现的“二对三 polhythm (2 vs 3)” 究竟是指什么节拍张力？',
      options: [
        '曲子一会儿按照 2/4 拍弹，一会儿换成 3/4 拍弹',
        '左手在一个恒定的时间跨度里均匀弹 2 个音，而右手在【一模一样】的时间跨度里均匀弹 3 个音，双手在第一音和最后一音处重合对齐',
        '左手比右手弹得快两倍，右手比左手多弹 3 个音',
        '一首曲子需要有 2 台钢琴和 3 位演奏家同时弹奏才行'
      ],
      correctIndex: 1,
      explanation: '“二对三（2 vs 3）” 是一种极具魅力的复合节奏（Polyrhythm）。它是指在相同的整体时间框里，一只手弹奏均匀的 2 个音（通常为八份音符），另一手弹奏均匀的 3 个音（通常为三连音）。它是印象派以及浪漫派用来打破刚强骨架、营造梦幻飘逸感的经典手法。'
    }
  ];

  // --- Web Audio Metronome & click scheduler Engine ---
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSynthesizedClick = (time: number, isStrong: boolean, isSub: boolean) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const masterVolume = volumeRef.current / 100 * 0.22;
    const kit = soundKitRef.current;

    if (kit === 'classic') {
      osc.type = 'sine';
      if (isStrong) {
        osc.frequency.setValueAtTime(1000, time);
        gainNode.gain.setValueAtTime(masterVolume * 1.2, time);
      } else if (isSub) {
        osc.frequency.setValueAtTime(520, time);
        gainNode.gain.setValueAtTime(masterVolume * 0.4, time);
      } else {
        osc.frequency.setValueAtTime(700, time);
        gainNode.gain.setValueAtTime(masterVolume * 0.8, time);
      }
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
      osc.start(time);
      osc.stop(time + 0.15);

    } else if (kit === 'electronic') {
      // 808 style analog click & bass punch
      if (isStrong) {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, time);
        osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);
        gainNode.gain.setValueAtTime(masterVolume * 1.5, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
        osc.start(time);
        osc.stop(time + 0.18);
        
        // click sparkle layer
        const click = ctx.createOscillator();
        const clickGain = ctx.createGain();
        click.connect(clickGain);
        clickGain.connect(ctx.destination);
        click.type = 'sine';
        click.frequency.setValueAtTime(2500, time);
        clickGain.gain.setValueAtTime(masterVolume * 0.4, time);
        clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
        click.start(time);
        click.stop(time + 0.03);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isSub ? 1600 : 900, time);
        gainNode.gain.setValueAtTime(isSub ? masterVolume * 0.3 : masterVolume * 0.7, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
        osc.start(time);
        osc.stop(time + 0.08);
      }
    } else if (kit === 'acoustic') {
      // wood block and snare click
      osc.type = 'triangle';
      if (isStrong) {
        osc.frequency.setValueAtTime(800, time);
        gainNode.gain.setValueAtTime(masterVolume * 1.3, time);
      } else if (isSub) {
        osc.frequency.setValueAtTime(350, time);
        gainNode.gain.setValueAtTime(masterVolume * 0.5, time);
      } else {
        osc.frequency.setValueAtTime(550, time);
        gainNode.gain.setValueAtTime(masterVolume * 0.9, time);
      }
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
      osc.start(time);
      osc.stop(time + 0.09);
    }
  };

  const scheduleNextNotes = () => {
    if (!audioCtxRef.current || !isPlayingRef.current) return;

    const scheduleAheadTime = 0.12; 
    const secondsPerBeat = 60.0 / bpmRef.current;
    
    const config = SUBDIVISION_CONFIG[subdivisionRef.current];
    const totalTicksInHalfLoop = tripletModeRef.current === 'straight' ? config.straightCount : config.tripletCount;
    
    // total duration of loop (2 beats) = secondsPerBeat * 2
    // tickDuration = totalDuration / totalTicks
    const loopDuration = secondsPerBeat * 2;
    const tickDuration = loopDuration / totalTicksInHalfLoop;

    while (nextNoteTimeRef.current < audioCtxRef.current.currentTime + scheduleAheadTime) {
      const activeTick = tickIndexRef.current % totalTicksInHalfLoop;
      
      let isStrongBeat = false;
      let isSubBeat = false;

      if (tripletModeRef.current === 'straight') {
        const notesPerBeat = config.straightCount / 2;
        isStrongBeat = activeTick === 0; // Downbeat on loop 1
        const indexOnBeat = activeTick % notesPerBeat;
        isSubBeat = indexOnBeat !== 0; // subdiv notes are sub clicks
      } else {
        const notesPerBeat = config.tripletCount / 2;
        isStrongBeat = activeTick === 0;
        const indexOnBeat = activeTick % notesPerBeat;
        isSubBeat = indexOnBeat !== 0;
      }

      playSynthesizedClick(nextNoteTimeRef.current, isStrongBeat, isSubBeat);

      nextNoteTimeRef.current += tickDuration;
      tickIndexRef.current++;
    }

    timerIDRef.current = window.setTimeout(scheduleNextNotes, 25.0);
  };

  // --- Dynamic Canvas Render Loop (For perfect geometric trajectory preview) ---
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
    const loopDuration = secondsPerBeat * 2; // total duration of 2 beats loop

    const elapsed = Math.max(0, currentTime - startTimeRef.current);
    const progress = (elapsed % loopDuration) / loopDuration; // 0 to 1

    const config = SUBDIVISION_CONFIG[subdivisionRef.current];
    const ticksNum = tripletModeRef.current === 'straight' ? config.straightCount : config.tripletCount;

    const paddingX = 40;
    const drawingWidth = width - paddingX * 2;
    const baselineY = height - 44;
    const archMaxHeight = 70;

    // 1. Draw horizontal track baseline
    ctx.beginPath();
    ctx.moveTo(paddingX - 10, baselineY);
    ctx.lineTo(width - paddingX + 10, baselineY);
    ctx.strokeStyle = '#E2E8F0'; // slate-200
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.stroke();

    // 2. Draw pre-plotted dotted guide curves (Visual movement trajectory!)
    ctx.beginPath();
    ctx.strokeStyle = tripletModeRef.current === 'straight' ? 'rgba(217, 119, 6, 0.45)' : 'rgba(37, 99, 235, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);

    for (let i = 0; i < ticksNum; i++) {
      const archWidth = drawingWidth / ticksNum;
      const xStart = paddingX + i * archWidth;
      const xEnd = paddingX + (i + 1) * archWidth;

      // Draw sine-wave guided curve trajectory
      ctx.moveTo(xStart, baselineY);
      for (let xCoord = xStart; xCoord <= xEnd; xCoord++) {
        const localProgress = (xCoord - xStart) / archWidth;
        const curveY = baselineY - Math.sin(localProgress * Math.PI) * archMaxHeight;
        ctx.lineTo(xCoord, curveY);
      }
    }
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // 3. Draw tick impact node bubbles on the baseline
    for (let i = 0; i <= ticksNum; i++) {
      const xPoint = paddingX + i * (drawingWidth / ticksNum);
      const isBeatStart = tripletModeRef.current === 'straight' 
        ? (i % (config.straightCount / 2) === 0) 
        : (i % (config.tripletCount / 2) === 0);

      // Node background shadow glows
      ctx.beginPath();
      ctx.arc(xPoint, baselineY, isBeatStart ? 7 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isBeatStart ? '#1E293B' : '#94A3B8';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Labels below the baseline nodes
      if (i < ticksNum) {
        ctx.font = 'bold 11px font-sans, system-ui';
        ctx.fillStyle = tripletModeRef.current === 'straight' ? '#B45309' : '#1D4ED8';
        ctx.textAlign = 'center';

        const labelX = paddingX + (i + 0.5) * (drawingWidth / ticksNum);
        const textVal = tripletModeRef.current === 'straight' 
          ? config.straightLabels[i] 
          : config.tripletLabels[i];

        ctx.fillText(textVal, labelX, baselineY + 22);
      }
    }

    // 4. Draw glowing physical bouncing ball on the curve
    const currentArchIndex = Math.min(ticksNum - 1, Math.floor(progress * ticksNum));
    const archWidth = drawingWidth / ticksNum;
    const currentArchProgress = (progress * ticksNum) % 1;

    const ballX = paddingX + progress * drawingWidth;
    const ballY = baselineY - Math.sin(currentArchProgress * Math.PI) * archMaxHeight;

    // Glowing impact ripple under the ball
    const shadowColor = tripletModeRef.current === 'straight' ? '#F59E0B' : '#3B82F6';
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(ballX, ballY, 13, 0, Math.PI * 2);
    ctx.fillStyle = tripletModeRef.current === 'straight' ? '#F59E0B' : '#2563EB';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.shadowBlur = 0; // Reset shadow

    // Central core point representing note mode
    ctx.beginPath();
    ctx.arc(ballX, ballY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

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
      nextNoteTimeRef.current = now + 0.08;
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

    // Clean canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleModeToggle = (mode: 'straight' | 'triplet') => {
    if (mode === tripletMode) return;
    stopEngine();
    setTripletMode(mode);
  };

  const handleSubdivisionChange = (sub: TripletSubdivision) => {
    if (sub === subdivision) return;
    stopEngine();
    setSubdivision(sub);
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

  // --- Interactive Tap Game: Triplet Trainer Game ---
  const handleTrainerTap = () => {
    if (!trainerActive) return;
    initAudio();

    // Trigger instant beautiful keyboard click feedback sound
    if (audioCtxRef.current) {
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.frequency.setValueAtTime(880, audioCtxRef.current.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.06);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.08);
    }

    const currentBpm = bpm;
    // For Eighth Triplet, the target interval between triplet notes is (60 / BPM) / 3 seconds.
    // For other subdivisions, we scale appropriately. Here we assume classic Eighth Triplet timing Trainer!
    const targetIntervalSec = (60.0 / currentBpm) / 3.0;

    const nowSecs = performance.now() / 1000;
    if (lastTrainerTapRef.current === 0) {
      lastTrainerTapRef.current = nowSecs;
      setTrainerFeedback('很好！开始感知下一拍的三等分速率，连续均匀点按...');
      setFeedbackColor('text-blue-600 font-bold');
      setFeedbackOffset('');
      return;
    }

    const actualDiff = nowSecs - lastTrainerTapRef.current;
    lastTrainerTapRef.current = nowSecs;

    const errorSecs = actualDiff - targetIntervalSec;
    const absErrorPercent = Math.abs(errorSecs) / targetIntervalSec;

    let pointsEarned = 0;
    let desc = '';
    let col = '';
    let offsetMsg = `${(errorSecs * 1000).toFixed(0)} 毫秒`;

    if (absErrorPercent < 0.09) {
      pointsEarned = 15;
      desc = '✨ 完美! (Perfect) 极其惊艳的稳重身手！';
      col = 'text-emerald-600 font-black scale-105';
    } else if (absErrorPercent < 0.18) {
      pointsEarned = 8;
      desc = '👍 优秀! (Good) 稳重合拍，肌肉控制非常棒。';
      col = 'text-blue-500 font-semibold';
    } else {
      desc = errorSecs > 0 ? '🐢 慢了一点。要数得再匀称、紧实一一些。' : '🐇 快了一点点！平心静气。';
      col = 'text-stone-500';
      setTrainerStreak(0);
    }

    if (pointsEarned > 0) {
      setTrainerScore(prev => prev + pointsEarned);
      setTrainerStreak(prev => prev + 1);
    }

    setTrainerFeedback(desc);
    setFeedbackColor(col);
    setFeedbackOffset(errorSecs > 0 ? `偏慢 ${offsetMsg}` : `偏快 ${offsetMsg}`);
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
      setTrainerFeedback('嗒-啦-哩 嗒-啦-哩... 速度已锁定，请保持绝对均衡的拍速按下按钮！');
      setFeedbackColor('text-blue-600 font-bold');
      setFeedbackOffset('');
    }
  };

  // Keyboard Space Listener for Rhythmic tap timing training
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

  const activeSubConfig = SUBDIVISION_CONFIG[subdivision];

  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto px-1">
      {/* Dynamic Header */}
      <header className="animate-slideUp">
        <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-xs font-black tracking-widest uppercase mb-4 shadow-sm">
          LEVEL 2 - 节奏核心突破专题 (Triplets)
        </div>
        <h2 className="text-4xl md:text-5xl font-black serif text-stone-900 mb-4 tracking-tight flex items-center gap-3">
          <Layers className="text-blue-500" size={36} /> 三连音的数学之美：重塑刚硬，融入流水
        </h2>
        <p className="text-lg text-stone-600 font-light max-w-3xl leading-relaxed">
          把一拍或两拍时间平均分成<strong>等宽的三份</strong>。三连音彻底打破了西方古典二分法的一板一眼，它用圆润的奇数循环律，把严肃死板的“行走”变成充满张力的“起舞”与 “流波”。
        </p>
      </header>

      {/* Navigation SubTabs */}
      <div className="flex bg-stone-100 p-1.5 rounded-2xl md:max-w-md shadow-inner border border-stone-200">
        <button
          onClick={() => { setActiveTab('visual'); stopEngine(); }}
          className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'visual' ? 'bg-white text-stone-900 shadow-md scale-[1.02]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Sparkles size={15} /> 律动运动轨迹
        </button>
        <button
          onClick={() => { setActiveTab('trainer'); stopEngine(); }}
          className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'trainer' ? 'bg-white text-stone-900 shadow-md scale-[1.02]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Gamepad2 size={15} /> 感官肌肉测速
        </button>
        <button
          onClick={() => { setActiveTab('masterpieces'); stopEngine(); }}
          className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'masterpieces' ? 'bg-white text-stone-900 shadow-md scale-[1.02]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Music size={15} /> 巨匠名作解剖
        </button>
        <button
          onClick={() => { setActiveTab('quiz'); stopEngine(); }}
          className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'quiz' ? 'bg-white text-stone-900 shadow-md scale-[1.02]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Trophy size={15} /> 实力关卡挑战
        </button>
      </div>

      {/* TAB 1: Visual and Sound stage */}
      {activeTab === 'visual' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Main Visualizer Stage */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-lg relative overflow-hidden">
            {/* Background vector glow */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-stone-50 to-transparent opacity-60"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row gap-8">
              {/* Left Side: Traditional Fraction Display with explanations */}
              <div className="w-full lg:w-1/3 flex flex-col items-center justify-center bg-stone-50 p-6 rounded-2xl border border-stone-200 animate-slideUp">
                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-4">音符形态重构</span>
                
                <div className="flex flex-col items-center relative py-6 px-10 bg-white rounded-2xl border border-stone-100 shadow-sm w-full max-w-[14rem]">
                  {/* Molecular representation (Top) */}
                  <div className="text-1xl font-black text-rose-500 leading-none mb-1 select-none tracking-widest bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 text-xs">
                    多弹一个音
                  </div>
                  
                  <div className="text-7xl font-sans font-black text-blue-500 leading-none my-3 select-none">
                    3
                  </div>
                  
                  <div className="text-1xl font-black text-stone-700 leading-none mt-1 select-none tracking-widest bg-stone-100 px-3 py-1.5 rounded-full text-xs">
                    占 2 个音的时间
                  </div>
                </div>

                <div className="mt-6 w-full space-y-3.5 text-xs text-stone-600 leading-relaxed">
                  <div className="bg-white p-4 rounded-xl border border-stone-150 shadow-sm">
                    <span className="block font-bold text-stone-800 text-sm mb-1">“压缩”数学之美</span>
                    三连音的核心在于<strong>等比例匀称压缩</strong>。将 3 个音均分压缩到它们原本应该演奏 2 个音的总时值中。
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <span className="block font-bold text-blue-900 text-sm mb-1">音位唱音标定</span>
                    常采用：<strong>1 - 啦 - 哩，2 - 啦 - 哩</strong> 的英文 (1-trip-let) 哼唱卡定法，确保发音开口大小相同，肌肉等宽流动。
                  </div>
                </div>
              </div>

              {/* Right Column: High contrast Canvas-based visual bounce track & Synthesizer controllers */}
              <div className="w-full lg:w-2/3 flex flex-col gap-6 justify-between">
                <div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-200 pb-4 mb-4 gap-3">
                    <div>
                      <h3 className="text-2xl font-bold font-serif text-stone-900 flex items-center gap-2">
                        {activeSubConfig.title} 
                      </h3>
                      <p className="text-xs text-stone-400 font-medium mt-1 leading-relaxed max-w-md">{activeSubConfig.desc}</p>
                    </div>
                    {/* Triplets pills */}
                    <div className="flex bg-stone-100 p-1 rounded-xl shrink-0 self-start md:self-auto">
                      {(['eighth', 'quarter', 'sixteenth'] as TripletSubdivision[]).map((sub) => (
                        <button
                          key={sub}
                          onClick={() => handleSubdivisionChange(sub)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                            subdivision === sub 
                              ? 'bg-blue-500 text-white shadow-sm' 
                              : 'text-stone-500 hover:text-stone-900'
                          }`}
                        >
                          {sub === 'eighth' ? '经典八分音' : sub === 'quarter' ? '四分三连音' : '高频六连音'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* HIGH PERFORMANCE TRAJECTORY CANVAS STAGE */}
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 relative min-h-[17rem] flex flex-col items-center justify-center overflow-hidden">
                    <div className="absolute top-3 left-4 flex gap-1.5">
                      <button 
                        onClick={() => handleModeToggle('straight')}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                          tripletMode === 'straight' 
                            ? 'bg-amber-500 border-amber-500 text-white shadow-sm' 
                            : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-100'
                        }`}
                      >
                        常规直拍
                      </button>
                      <button 
                        onClick={() => handleModeToggle('triplet')}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                          tripletMode === 'triplet' 
                            ? 'bg-blue-500 border-blue-500 text-white shadow-sm' 
                            : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-100'
                        }`}
                      >
                        三连音
                      </button>
                    </div>

                    <canvas 
                      ref={canvasRef} 
                      className="w-full h-44 block bg-transparent"
                      style={{ touchAction: 'none' }}
                    />
                    
                    {/* Live Accent Guidance panel */}
                    <div className="w-full mt-4 flex items-center justify-between px-3 text-[11px] font-mono text-stone-500 select-none">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span> 强拍 (Strong Downbeat)
                      </span>
                      {tripletMode === 'triplet' ? (
                        <span className="flex items-center gap-1 text-blue-600 font-medium">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span> 三等分细分音 (Triplet Subdivisions)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600 font-medium">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 常规细分 (Straight Counts)
                        </span>
                      )}
                    </div>

                    {!isPlaying && (
                      <div className="absolute inset-0 bg-stone-100/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-center select-none">
                        <div className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer" onClick={startEngine}>
                          <Play size={28} fill="currentColor" className="ml-1" />
                        </div>
                        <p className="text-stone-700 font-bold text-sm mt-3">点击开始，眼见其形、耳听其声、尽显三连流动轨迹</p>
                        <p className="text-stone-400 text-xs mt-1">内置高保真 Web Audio 发生器，配合 Canvas 平滑弹力反弹抛物线</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Synth Instrument & BPM controllers */}
                <div className="grid md:grid-cols-2 gap-4 bg-stone-100/50 p-4 rounded-xl border border-stone-200 font-medium">
                  {/* Left Controls: Tone kit and volume */}
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="block text-stone-600 font-bold mb-1.5 text-xs">声音组 (Synth Sound Kits)</span>
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
                            {kit === 'classic' ? '经典蜂鸣' : kit === 'electronic' ? '鼓机 909' : '原木打棒'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="flex justify-between text-stone-600 font-bold mb-1 font-sans">
                        <span>音量控制</span>
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
                          className="w-full accent-blue-500 h-1 bg-stone-300 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Controls: Tempo (BPM) Slider and Master Start/Stop */}
                  <div className="space-y-4">
                    <div>
                      <span className="flex justify-between text-xs text-stone-600 font-bold mb-1.5">
                        <span>节拍速度 (BPM)</span>
                        <span className="font-mono text-blue-600 text-xs font-black">{bpm} 拍/分</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-stone-400">40</span>
                        <input
                          type="range"
                          min="40"
                          max="160"
                          value={bpm}
                          onChange={(e) => setBpm(Number(e.target.value))}
                          className="w-full h-1 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <span className="text-xs font-mono text-stone-400">160</span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={togglePlay}
                        className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 outline-none border transition-all active:scale-[0.98] ${
                          isPlaying 
                            ? 'bg-stone-900 border-stone-900 text-white shadow-lg hover:bg-stone-800' 
                            : 'bg-blue-600 border-blue-600 text-white shadow-lg hover:bg-blue-500'
                        }`}
                      >
                        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                        <span>{isPlaying ? '停止律动循环' : '开启律动观察'}</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
          
          {/* Square vs Circle comparison */}
          <div className="grid md:grid-cols-2 gap-6 leading-relaxed">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 border border-amber-100 text-amber-500">
                <Sliders size={22} />
              </div>
              <div>
                <h4 className="text-base font-black text-stone-900 mb-1">直拍 (Straight Rhythm) - 方块骨架</h4>
                <p className="text-xs text-stone-600">
                  像水泥砌出来的砖块。它是二分法的，每一次脚踏都有极其清零对称的强弱。流行乐、行军曲以此为框架。数拍公式： <strong>1 & 2 & 3 & 4 &</strong>。
                </p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 border border-blue-100 text-blue-500">
                <Music size={22} />
              </div>
              <div>
                <h4 className="text-base font-black text-stone-900 mb-1">三连音 (Triplet Rhythm) - 圆润流线</h4>
                <p className="text-xs text-stone-600">
                  像迎风旋转的落叶。由于一拍被均匀切分成了 3 个部分，天然具备了一种不倒翁式的推进动力。它是爵士乐、布鲁斯、圆舞曲、舒缓摇曳曲的绝对心弦。数拍公式：<strong>1-la-li, 2-la-li, 3-la-li, 4-la-li</strong>。
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
              <Gamepad2 className="text-blue-500 animate-bounce" /> 三连音肌肉感官测试仪
            </h3>
            <p className="text-xs text-stone-500 max-w-xl mx-auto">
              真正的节奏不留在乐谱，而在你的身体里。本器可以实时锁定当前的节拍速度 (BPM)，计算你按压按钮的时间距离，看看你敲出的每一次 1-2-3 等分精度误差有多少毫秒！
            </p>
          </div>

          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200-dotted flex flex-col items-center justify-center text-center py-10 relative">
            <div className="absolute top-4 right-4 flex items-center gap-3">
              <div className="text-left">
                <span className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider">训练速度</span>
                <span className="block text-sm font-mono text-stone-700 font-bold">{bpm} BPM</span>
              </div>
            </div>

            {/* Live Score & Streak */}
            <div className="flex gap-16 mb-8">
              <div className="text-center">
                <span className="block text-[11px] text-stone-400 font-bold uppercase tracking-wider mb-1">当前总得分</span>
                <span className="text-4xl font-mono font-black text-blue-600">{trainerScore}</span>
              </div>
              <div className="text-center">
                <span className="block text-[11px] text-stone-400 font-bold uppercase tracking-wider mb-1">连击 combo</span>
                <span className="text-4xl font-mono font-black text-rose-500 animate-pulse">{trainerStreak}</span>
              </div>
            </div>

            {/* Interactive Tap Button and Timing Output */}
            <div className="space-y-4 w-full max-w-md">
              <div className="h-16 flex flex-col items-center justify-center">
                <p className={`text-base font-bold transition-all duration-150 ${feedbackColor}`}>{trainerFeedback}</p>
                {feedbackOffset && (
                  <p className="text-xs text-stone-400 font-mono font-bold mt-1 bg-white px-2.5 py-0.5 rounded-full border border-stone-200">{feedbackOffset}</p>
                )}
              </div>

              <div className="flex justify-center pt-2">
                <button
                  disabled={!trainerActive}
                  onMouseDown={handleTrainerTap}
                  className="w-36 h-36 rounded-full bg-blue-600 border-8 border-blue-50 shadow-2xl hover:bg-blue-500 active:scale-90 transition-all flex items-center justify-center text-white font-black select-none cursor-pointer outline-none disabled:bg-stone-100 disabled:border-stone-50 disabled:text-stone-300 disabled:cursor-not-allowed"
                >
                  <span className="text-base tracking-widest">{trainerActive ? '按此处 1-2-3' : '未开启'}</span>
                </button>
              </div>

              <p className="text-[11px] text-stone-400 font-medium">支持按电脑键盘上的 【空格键】 进行节拍敲击</p>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={toggleTrainerGame}
              className={`px-8 py-3 rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 transition-all outline-none ${
                trainerActive 
                  ? 'bg-stone-900 hover:bg-stone-800 text-white' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <RefreshCw size={14} className={trainerActive ? 'animate-spin' : ''} />
              <span>{trainerActive ? '关闭测试仪 (结算成绩)' : '开启肌肉等宽测试'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Masterpieces Room */}
      {activeTab === 'masterpieces' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-lg animate-fadeIn">
          <div className="mb-6">
            <h3 className="text-2xl font-bold serif text-stone-950 flex items-center gap-2">
              <Music className="text-blue-500" /> 世界巨作里的三连音艺术解剖学
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-xl leading-relaxed">
              音乐不是死记公式，让我们倾听历史上最天才的头脑，看他们是如何在沉郁的钢琴键上运用三连音营造奇迹声场的：
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {masterpieces.map((piece, idx) => (
              <div 
                key={idx}
                className="bg-stone-50 p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-all group hover:bg-white"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-lg font-black text-stone-900 group-hover:text-blue-700 transition-colors">
                      {piece.title}
                    </h4>
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold font-mono rounded">
                      {piece.meter}
                    </span>
                  </div>
                  
                  <span className="block text-xs font-bold text-stone-400 mb-4 tracking-wider">
                    作曲家：{piece.composer}
                  </span>

                  <p className="text-xs text-stone-600 leading-relaxed min-h-[4rem]">
                    {piece.description}
                  </p>
                </div>

                <div className="space-y-2 mt-4 pt-4 border-t border-stone-200/60">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">三连音编排意图</span>
                  <p className="text-xs text-stone-700 leading-relaxed font-medium">
                    {piece.tripletUsage}
                  </p>
                  <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100/50 text-blue-900 text-[11px] leading-relaxed">
                    <strong>💡 演练指引：</strong>{piece.rhythmTip}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Quiz Challenge */}
      {activeTab === 'quiz' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-lg animate-fadeIn max-w-3xl mx-auto">
          {!quizFinished ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center text-xs font-bold text-stone-400 border-b border-stone-250 pb-3">
                <span className="uppercase tracking-widest text-blue-600 font-black">节奏理论进击</span>
                <span>进度：{currentQuestion + 1} / {quizQuestions.length}</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-300" 
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
                      <span className="text-sm">{opt}</span>
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
                  <p className="text-stone-700 text-xs leading-relaxed">{quizQuestions[currentQuestion].explanation}</p>
                  
                  <button
                    onClick={handleNextQuestion}
                    className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg flex items-center gap-1.5 ml-auto transition-colors"
                  >
                    <span>{currentQuestion + 1 === quizQuestions.length ? '查看成绩' : '下一关题'}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Quiz Results screen
            <div className="text-center py-8 space-y-6 animate-fadeIn">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-500 border border-blue-100 shadow-inner animate-pulse">
                <Award size={44} />
              </div>

              <div>
                <h3 className="text-3xl font-black text-stone-900 serif">
                  三连音闯关圆满达成！
                </h3>
                <p className="text-stone-500 text-sm mt-1">
                  您的综合成绩：
                </p>
              </div>

              <div className="text-center">
                <span className="text-6xl font-mono font-black text-blue-600">
                  {score * 25}
                </span>
                <span className="text-xl text-stone-400">/ 100 分</span>
              </div>

              <p className="text-stone-600 text-sm max-w-sm mx-auto leading-relaxed">
                {score === quizQuestions.length 
                  ? '🏅 天才！你对三连音的数学时值比、口诀发声卡位、以及复拍子的关系有着极为傲人的理解，尽显节律敏感度。' 
                  : '🔍 很好！可以再把 “三对四”、“二对三” 的复合音程错杂度稍微复习一下，你在钢琴上必将能驾轻就熟。'}
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetQuiz}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <RefreshCw size={14} /> 重新挑战
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TripletsLesson;
