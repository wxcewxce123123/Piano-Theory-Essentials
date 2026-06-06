import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Play, Pause, Activity, RefreshCw, Sparkles, BookOpen, 
  Volume2, Flame, Sliders, ArrowRight, Check, Star, CheckCircle,
  Award, RefreshCw as ResetIcon, Info, HelpCircle, Music, Compass
} from 'lucide-react';

// Define core types for Music Theory representation
type SyncopationType = 'tie' | 'duration' | 'rest' | 'accent';

interface TheoryDemo {
  id: SyncopationType;
  title: string;
  subtitle: string;
  description: string;
  sheetFormula: string; // Solfege representation
  explanation: string;
  // Notes in the measure (for synthesis and visualization)
  // Each note: { pitch (Hz), step (16th note index), durationSteps, isTieEnd?, isAccent? }
  notes: Array<{
    pitch: number;
    step: number; 
    durationSteps: number;
    name: string;
    isTieStart?: boolean;
    isTieEnd?: boolean;
    isAccent?: boolean;
    isRestOutline?: boolean; // Represent silence inside downbeat
  }>;
}

const SyncopationLesson: React.FC = () => {
  // Navigation & playback controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(85);
  const [volume, setVolume] = useState(65);
  const [activeTab, setActiveTab] = useState<SyncopationType>('duration');
  
  // Interactive Score Playhead state
  const [active16thStep, setActive16thStep] = useState<number>(-1);
  const [beatPulse, setBeatPulse] = useState<number>(0); // 1, 2, 3, 4 downbeat pulses

  // --- Puzzle Builder State ---
  // Users drag/tap rhythmic blocks to form a mathematically legal 4/4 syncopated bar
  // Target: total of 16 sixteenth steps.
  // Blocks options
  const BLOCKS_CATALOG = [
    { id: 'sixteenth', name: '十六分音符', duration: 1, symbol: '𝅘𝅥𝅯', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'eighth', name: '八分音符', duration: 2, symbol: '𝅘𝅥𝅮', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { id: 'quarter', name: '四分音符', duration: 4, symbol: '𝅘𝅥', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 'dottedEighth', name: '附点八分', duration: 3, symbol: '𝅘𝅥𝅮.', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    { id: 'dottedQuarter', name: '附点四分', duration: 6, symbol: '𝅘𝅥.', color: 'bg-purple-50 text-purple-700 border-purple-200' }
  ];

  const [puzzleGrid, setPuzzleGrid] = useState<Array<typeof BLOCKS_CATALOG[0]>>([]);
  const [puzzleMessage, setPuzzleMessage] = useState<string>('小节虚位以待，请点击上方时值乐章，拼装出一个纯正的「切分律动」！目标总跨度：16 步（一小节）。');
  const [puzzleValid, setPuzzleValid] = useState<boolean | null>(null);
  const [puzzlePlaying, setPuzzlePlaying] = useState<boolean>(false);

  // Audio Context management
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  const timerIDRef = useRef<number | null>(null);
  const bpmRef = useRef(bpm);
  const volumeRef = useRef(volume);

  // Scheduler progress
  const stepIndexRef = useRef<number>(0);
  const nextStepTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Quiz state
  const [quizQuestion, setQuizQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Sync state refs to keep scheduler updated without re-triggers
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  // Clean-up on unmount
  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      if (timerIDRef.current) window.clearTimeout(timerIDRef.current);
    };
  }, []);

  // --- HARD-CORE MUSIC THEORY CRUCIBLE: DEMO NOTATIONS ---
  // Precise piano coordinates simulating beautiful syncopations with classical harmony
  const THEORY_DEMOS: Record<SyncopationType, TheoryDemo> = {
    duration: {
      id: 'duration',
      title: '时值重音切分 (Duration-Induced / 大切分)',
      subtitle: '时值跨越强拍产生的无形重力挪移',
      description: '乐理中最典型的「中置切分」。在 4/4 拍中，原本第1和第2拍都是常规下拍。时值切分故意在第1拍的「后半拍（弱分拍）」发声，且这个音符的时值长达一拍（四分音符），从而把第2拍的「正拍」重音位置全部跨越（覆盖）过去。听众大脑在第2拍踩空，强弱预期发生剧烈抗衡！',
      sheetFormula: '【 𝅘𝅥𝅮 (半拍) → 𝅘𝅥 (一拍切分音) → 𝅘𝅥𝅮 (半拍) 】 | 哒 (Down) 哒~ (Up, prolonging over Next Down) 哒 (Up)',
      explanation: '八分音符占1拍的一半，四分音符占1整拍。由于中间的四分音符过长，直接抹杀了第二拍本该落下的稳定地基，将势能强行挂在半空，极具跳跃感。',
      notes: [
        { pitch: 261.63, step: 0, durationSteps: 2, name: 'C4' }, // 8th note
        { pitch: 329.63, step: 2, durationSteps: 4, name: 'E4', isAccent: true }, // Quarter note (Syncopated) - starts on offbeat index 2, spans through step 5
        { pitch: 392.00, step: 6, durationSteps: 2, name: 'G4' }, // 8th note
        // Beat 3 & 4: standard reference
        { pitch: 349.23, step: 8, durationSteps: 4, name: 'F4' }, // Quarter note
        { pitch: 392.00, step: 12, durationSteps: 4, name: 'G4' } // Quarter note
      ]
    },
    tie: {
      id: 'tie',
      title: '延音线切分 (Tie-Induced Syncopation)',
      subtitle: '用跨拍连线强行吃掉下一拍的正拍能量',
      description: '钢琴键盘、弦乐重奏极度宠爱的顶级切分方式。在一个弱拍或弱分音符上击键，并用「延音线（Tie）」将其与下一个强拍的正拍音符牢牢连结在一起。在强拍到来时，钢琴琴槌不击弦，但由于连线的延音作用，声波依然在轰鸣，使原本应当在第一拍、第三拍落下的核心安定重心，变成一个奇妙的“真空静止”。',
      sheetFormula: '【 𝅘𝅥 (正拍响)  ￣￣ [ 连线延伸过第三正拍 ] ￣￣ 𝅘𝅥 (弱拍延音) 】',
      explanation: '连结不击发！在原本重音位置强迫大脑产生瞬间的“失重悬浮”，并在下一个弱拍得到解脱。',
      notes: [
        { pitch: 329.63, step: 0, durationSteps: 4, name: 'E4' }, // Quarter note
        { pitch: 392.00, step: 4, durationSteps: 4, name: 'G4', isTieStart: true }, // Quarter note leading into 3rd beat
        { pitch: 392.00, step: 8, durationSteps: 4, name: 'G4', isTieEnd: true }, // tied part, doesn't re-strike
        { pitch: 440.00, step: 12, durationSteps: 4, name: 'A4' } // Quarter
      ]
    },
    rest: {
      id: 'rest',
      title: '休止符切分 (Rest-Induced / 强起空拍)',
      subtitle: '以虚代实，强拍静默，灵魂于弱拍苏醒',
      description: '彻底的留白艺术。直接把第一拍或核心强音的正下拍换成一个「休止符」。正常情况下，人类本能会在小节最开头获得最强的脚部锚定音。此处故意“一脚踩空”，反面将所有的旋律和响度堆砌到随后的弱拍上，好似身体失去了惯性，往前扑倒，爆发出惊人的爵士与现代律动。',
      sheetFormula: '【 𝄾 (八分休止) → 𝅘𝅥 (强弹) → 𝅘𝅥𝅮 (常规弱) 】',
      explanation: '强拍处出现“无声的叹息（休止）”，而原本默默无闻的弱半拍却砸出了雷霆万钧的重音，反差极其震撼。',
      notes: [
        { pitch: 0, step: 0, durationSteps: 2, name: 'Rest', isRestOutline: true }, // Eighth rest
        { pitch: 349.23, step: 2, durationSteps: 4, name: 'F4', isAccent: true }, // Starts on step 2 (offbeat)
        { pitch: 392.00, step: 6, durationSteps: 2, name: 'G4' },
        { pitch: 440.00, step: 8, durationSteps: 4, name: 'A4' },
        { pitch: 523.25, step: 12, durationSteps: 4, name: 'C5' }
      ]
    },
    accent: {
      id: 'accent',
      title: '重音记号切分 (Accent-Induced Syncopation)',
      subtitle: '正牌力度对置：弱弱之地的核弹重击',
      description: '这是古典主义大师（如贝多芬）最震撼的乐理调遣手段。时值（音符家族的长度）与音符位置（小节节点）都是一模一样的平润状态。但作曲家故意在应当极其安静的弱拍（比如4/4拍的第二拍或第四拍，甚至那些极碎的十六分弱位）头上，盖下一个狂野怒吼的「重音记号 (＞, sfz)」。直接以暴力的力度颠覆重音序列。',
      sheetFormula: '【 𝅘𝅥 (常规弹) 𝅘𝅥 (＞ 爆裂重击) 𝅘𝅥 (常规弹) 𝅘𝅥 (＞ 爆裂重击) 】',
      explanation: '强弱强弱的经典架构，硬生生被扭成了：弱 - 强！ - 弱 - 强！这是敲碎宁静、点亮乐章爆发力的最直接乐理方式。',
      notes: [
        { pitch: 261.63, step: 0, durationSteps: 4, name: 'C4' }, 
        { pitch: 392.00, step: 4, durationSteps: 4, name: 'G4', isAccent: true }, // Hard Accent on beat 2
        { pitch: 329.63, step: 8, durationSteps: 4, name: 'E4' },
        { pitch: 440.00, step: 12, durationSteps: 4, name: 'A4', isAccent: true } // Hard Accent on beat 4
      ]
    }
  };

  // FM electric piano synthesiser simulating Rhodes metallic warm strings
  const playTheoryPianoTone = (ctx: AudioContext, freq: number, startTime: number, duration: number, isAccent: boolean = false) => {
    if (freq === 0) return; // Rest
    
    // Create FM structure
    const carrier = ctx.createOscillator();
    const modulator = ctx.createOscillator();
    const modGain = ctx.createGain();
    const mainGain = ctx.createGain();

    carrier.connect(mainGain);
    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    mainGain.connect(ctx.destination);

    // Warm, metallic attack
    const index = isAccent ? 450 : 180;
    const modFreq = freq * 1.5; // Harmonic multiplier

    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(freq, startTime);

    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(modFreq, startTime);

    modGain.gain.setValueAtTime(index, startTime);
    modGain.gain.exponentialRampToValueAtTime(1, startTime + duration * 0.5);

    // Dynamic Attack/Decay envelope
    const maxVolume = (volumeRef.current / 100) * (isAccent ? 0.35 : 0.2);
    mainGain.gain.setValueAtTime(0, startTime);
    mainGain.gain.linearRampToValueAtTime(maxVolume, startTime + 0.008); // responsive snap
    mainGain.gain.exponentialRampToValueAtTime(0.002, startTime + duration - 0.02);

    carrier.start(startTime);
    modulator.start(startTime);
    carrier.stop(startTime + duration);
    modulator.stop(startTime + duration);
  };

  // Play standard metronome "tick" to guide the user's ears to the "eating of downbeats"
  const playMetronomeTick = (ctx: AudioContext, time: number, beat: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const isDownbeat = beat === 0;
    osc.frequency.setValueAtTime(isDownbeat ? 1000 : 600, time);
    
    const metVolume = (volumeRef.current / 100) * 0.06; // Quiet background guide pulse
    gain.gain.setValueAtTime(metVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    
    osc.start(time);
    osc.stop(time + 0.05);
  };

  // Scheduler mechanism for Core Theory Demos
  const startDemoPlayback = async () => {
    // Lazy initialize AudioContext
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    setIsPlaying(true);
    isPlayingRef.current = true;
    stepIndexRef.current = 0;

    const secondsPer16th = (60.0 / bpmRef.current) / 4.0;
    nextStepTimeRef.current = ctx.currentTime + 0.05;
    startTimeRef.current = nextStepTimeRef.current;

    runSchedulerLoop();
  };

  const runSchedulerLoop = () => {
    if (!audioCtxRef.current || !isPlayingRef.current) return;
    const ctx = audioCtxRef.current;
    const scheduleAhead = 0.15; // Schedule 150ms ahead
    const secondsPer16th = (60.0 / bpmRef.current) / 4.0;

    const activeDemo = THEORY_DEMOS[activeTab];

    while (nextStepTimeRef.current < ctx.currentTime + scheduleAhead) {
      const stepIdx = stepIndexRef.current % 16;
      const beat = Math.floor(stepIdx / 4);
      const isFirst16thOfBeat = stepIdx % 4 === 0;

      // 1. Play background metronome click strictly on standard main beats (1, 2, 3, 4)
      if (isFirst16thOfBeat) {
        playMetronomeTick(ctx, nextStepTimeRef.current, beat);
      }

      // 2. Play active demo notes matching this 16th step
      activeDemo.notes.forEach((note) => {
        // If a standard note lands exactly on this 16th step index
        if (note.step === stepIdx) {
          // If it's a tie end, we do NOT restrike the note, because it's sustaining
          if (note.isTieEnd) {
            return;
          }
          const noteDurationSec = note.durationSteps * secondsPer16th;
          playTheoryPianoTone(ctx, note.pitch, nextStepTimeRef.current, noteDurationSec, note.isAccent);
        }
      });

      // Update UI thread synchronously via a delay trigger
      const currentStepToSync = stepIdx;
      const currentBeatToSync = beat + 1;
      const stepTimeDiff = nextStepTimeRef.current - ctx.currentTime;

      setTimeout(() => {
        if (isPlayingRef.current) {
          setActive16thStep(currentStepToSync);
          if (isFirst16thOfBeat) {
            setBeatPulse(currentBeatToSync);
          }
        }
      }, Math.max(0, stepTimeDiff * 1000));

      nextStepTimeRef.current += secondsPer16th;
      stepIndexRef.current++;
    }

    timerIDRef.current = window.setTimeout(runSchedulerLoop, 25);
  };

  const stopDemoPlayback = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    setActive16thStep(-1);
    setBeatPulse(0);
    if (timerIDRef.current) {
      window.clearTimeout(timerIDRef.current);
      timerIDRef.current = null;
    }
  };

  const handleDemoToggle = () => {
    if (isPlaying) {
      stopDemoPlayback();
    } else {
      startDemoPlayback();
    }
  };

  // When switching tabs, immediately halt playback to prevent bleed
  const selectTheoryTab = (tab: SyncopationType) => {
    stopDemoPlayback();
    setActiveTab(tab);
  };


  // --- PUZZLE: RHYTHMIC MATH BLOCK CONSTRUCTOR METHODS ---
  // Add a rhythmic brick to the measure
  const handleAddBlock = (block: typeof BLOCKS_CATALOG[0]) => {
    if (puzzlePlaying) return;
    
    // Calculate current total steps
    const currentTotal = puzzleGrid.reduce((sum, item) => sum + item.duration, 0);
    const newTotal = currentTotal + block.duration;

    if (newTotal > 16) {
      setPuzzleMessage(`🚫 警告：无法放入！放入此音符总时值将达到 ${newTotal} 步，超过了一小节 4/4 拍的最大容量（16 步六分音符 / 4个整拍）。`);
      setPuzzleValid(false);
      return;
    }

    const updatedGrid = [...puzzleGrid, block];
    setPuzzleGrid(updatedGrid);
    evaluateRhythmSyncopation(updatedGrid);
  };

  // Remove a block by index
  const handleRemoveBlock = (index: number) => {
    if (puzzlePlaying) return;
    const updatedGrid = [...puzzleGrid];
    updatedGrid.splice(index, 1);
    setPuzzleGrid(updatedGrid);
    evaluateRhythmSyncopation(updatedGrid);
  };

  const handleClearBlocks = () => {
    if (puzzlePlaying) return;
    setPuzzleGrid([]);
    setPuzzleValid(null);
    setPuzzleMessage('小节虚位以待，请点击上方时值乐章，拼装出一个纯正的「切分律动」！目标总跨度：16 步（一小节）。');
  };

  // Rhythmic validation algorithm assessing "Music Theory Authenticity"
  // Does this mathematical summation contain syncopation?
  const evaluateRhythmSyncopation = (grid: Array<typeof BLOCKS_CATALOG[0]>) => {
    const totalDuration = grid.reduce((sum, item) => sum + item.duration, 0);
    
    if (grid.length === 0) {
      setPuzzleMessage('搭积木：点击时值板块在小节内添加符号。时值之和必须精确等于 16。');
      setPuzzleValid(null);
      return;
    }

    if (totalDuration < 16) {
      setPuzzleMessage(`🎼 节拍时值拼装中：当前总厚度 ${totalDuration}/16 步（已填满 ${(totalDuration/4).toFixed(1)} 拍）。还需要 ${16 - totalDuration} 步来闭合此小节！`);
      setPuzzleValid(null);
      return;
    }

    // Exact measure closure (16 sixteenth steps)
    // Now execute music theory syncopative inspection:
    // Syncopation exists if an elongated note crosses a normal metric heavy division (8, or 4/12) without restrikes on those strong beats.
    // Let's map note entry steps in time:
    let currentStep = 0;
    const noteOnsets: number[] = [];
    const noteSpans: Array<{start: number, end: number, duration: number}> = [];

    grid.forEach((block) => {
      noteOnsets.push(currentStep);
      noteSpans.push({ start: currentStep, end: currentStep + block.duration, duration: block.duration });
      currentStep += block.duration;
    });

    // Check if intermediate notes trigger a "Crossover suspension"
    // Standard metric subdivisions for 4/4 are steps: 0 (beat 1), 4 (beat 2), 8 (beat 3), 12 (beat 4).
    // Specifically, steps 4, 8, 12 are heavy downbeats.
    // If a note starts on an offbeat (e.g. 2, 6, 10) and has a duration that goes *over* a heavy downbeat, it causes syncopation!
    let foundSyncopation = false;
    let syncTypeMsg = '';

    noteSpans.forEach((span) => {
      // Is start position an offbeat?
      const isStartOffbeat = span.start % 4 !== 0;
      
      // Does it scale over a main beat boundary?
      // Main boundaries inside a bar: 4, 8, 12.
      const boundaryCrossed = [4, 8, 12].some(boundary => 
        span.start < boundary && span.end > boundary
      );

      if (isStartOffbeat && boundaryCrossed) {
        foundSyncopation = true;
        syncTypeMsg = `在第 ${(span.start / 4 + 1).toFixed(1)} 拍检测到【时值前推跨拍切分】！本该在强拍落下的重音，提前在 ${span.start} 步击弦，并延音吞噬了接下来的整拍重心。`;
      }
    });

    // High level secondary check: Classical "3-3-2 Clave / Tresillo" pattern
    // Occurs when blocks have durations 3, 3, 2 or similar off-ratio structures.
    const durations = grid.map(b => b.duration);
    const hasTresilloRatio = durations.join('-').includes('3-3-2') || durations.join('-').includes('3-3-4-6') || durations.join('-').includes('3-3');
    
    if (hasTresilloRatio) {
      foundSyncopation = true;
      syncTypeMsg = '🧬 乐学系统惊叹：您拼出了风靡加勒比海与现代神曲的 3+3+2 特种复节奏切分！奇律切分判定完美通过！';
    }

    if (foundSyncopation) {
      setPuzzleValid(true);
      setPuzzleMessage(`🎉 乐理验证通过！${syncTypeMsg} 此乐谱具有绝佳弹性气场。点击下方「视听钢琴弹奏」体验你的杰作！`);
    } else {
      setPuzzleValid(false);
      setPuzzleMessage('🧐 小节闭合成功但并无切分音效：这组时值完全沿袭了「常规规整对齐」规则（强拍都在正下拍重新击发了），大脑无法感到任何抗重力失重。尝试在奇数位（例如八分音符后面拼接四分音符）打乱它！');
    }
  };

  // Play the user's custom created rhythmic math formula using beautiful piano tones!
  const playCustomRhythmScore = async () => {
    if (puzzleGrid.length === 0 || puzzlePlaying) return;
    
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    setPuzzlePlaying(true);
    let currentTime = ctx.currentTime + 0.1;
    const secondsPer16th = (60.0 / bpm) / 4.0;

    // Harmonic progression to make it sound like a beautiful piano cadence!
    const harmonicNotes = [
      261.63, // C4
      329.63, // E4
      392.00, // G4
      523.25, // C5
      440.00, // A4
      349.23, // F4
      329.63, // E4
      261.63  // C4
    ];

    let current16thStep = 0;
    
    puzzleGrid.forEach((block, idx) => {
      // Background metronome pulse
      const beatsCrossed = Math.floor(current16thStep / 4);
      playMetronomeTick(ctx, currentTime, beatsCrossed);

      // Play FM Piano note with shifting pitch from our harmonic array
      const pitch = harmonicNotes[idx % harmonicNotes.length];
      const durationSec = block.duration * secondsPer16th;
      
      // Is this note syncopated?
      const isStartOffbeat = current16thStep % 4 !== 0;
      const crossesMainBeat = [4, 8, 12].some(b => current16thStep < b && (current16thStep + block.duration) > b);
      const isSyncopatedAccent = isStartOffbeat && crossesMainBeat;

      playTheoryPianoTone(ctx, pitch, currentTime, durationSec - 0.01, isSyncopatedAccent);

      // Advance
      currentTime += durationSec;
      current16thStep += block.duration;
    });

    // Schedule stop state in UI
    setTimeout(() => {
      setPuzzlePlaying(false);
    }, (16 * secondsPer16th) * 1000 + 400);
  };


  // --- DEEP THEORY QUIZ: ADVANCED CONCEPTS ---
  const QUIZ_QUESTIONS = [
    {
      question: '在钢琴独奏中，如果我们把原属第4拍弱拍的八分音符，与下一个小节第1拍强拍用延音线（Tie）强行连结，在第1拍不重新击弦，这在乐理上称为什么？',
      options: [
        '跨小节切分 (Syncopation Across Bar-lines)，由于消融了小节线重音，带来极度自由的前冲感',
        '装饰性倚音 (Appoggiatura)，只是简单的和弦外音延沓作用',
        '阻碍终止 (Deceptive Cadence)，它强行改变了属和弦到主和弦的调性进行路线',
        '等音转换 (Enharmonic change)，只是在拼写上改变了音符而实际声音完全一样'
      ],
      correctIndex: 0,
      explanation: '当延音线横跨小节线（Bar-line）时，音乐最神圣的第一拍重音直接陷于无声，听众在最坚实的着陆点瞬间悬浮，把前一小节末尾的悬置力撕扯到了最大，这是李斯特、贝多芬极爱用的技法。'
    },
    {
      question: '经典的 𝅘𝅥𝅮 (八分) - 𝅘𝅥 (四分) - 𝅘𝅥𝅮 (八分) 形式的「大切分音符」，在数学和时值的内部契合上为什么能够颠覆重音序列？',
      options: [
        '因为它破坏了一小节的总节拍数，使小节塞进了超过正常范围的多余拍值',
        '因为中间的四分音符起奏于“弱分拍（第一拍的后半个八分音符）”，且时值长达整整一拍，完全跨越遮盖了第二正拍，吃掉了重位',
        '因为第二下打击发出了极速尖锐的高频噪音，迫使大脑无法接受',
        '因为中间的四分音符必须采用不协和的半音阶进行，从而瓦解阶名'
      ],
      correctIndex: 1,
      explanation: '八分音符占0.5拍，四分音符占1拍。序列起奏在 0.5 拍位置，由于时值是1拍，其保持长度一直到 1.5 拍处。因而第 1.0 拍（原本应当砸下第二声重音的大正拍）被这个持续发声的四分音符彻底强占，大脑在正拍踩空，切分音宣告诞生！'
    },
    {
      question: '以下关于「休止符切分」与「常规弱起拍（Anacrusis）」的乐理对比，哪一项是完全正确的？',
      options: [
        '休止符切分必须要求小节的第一拍强拍处于寂静中（休止），而旋律在弱位瞬间点亮重音；而常规弱起则是小节前的单独筹备性弱拍，不颠覆主拍重心',
        '两者完全没有区别，在德奥乐派的五线谱中它们采用同一套缩写记号',
        '休止符切分只适用于打击乐乐器，而在钢琴或大型协奏曲中是不被允许的',
        '常规弱起只有在弹奏黑色琴键时才能触发，属于转调乐理，而切分音是纯白旋律'
      ],
      correctIndex: 0,
      explanation: '弱起（Anacrusis / 起拍）一般是指在第一小节前多出的不成节拍的引子，强音依然会重重砸在第一小节的第一拍；而休止符切分发生于完整的小节内，故意在原本应该砸响重音的人类本脑预期点（正拍）安放寂静，让人重心前倾。'
    }
  ];

  const handleQuizAnswer = (idx: number) => {
    if (showAnswer) return;
    setSelectedOption(idx);
    setShowAnswer(true);
    if (idx === QUIZ_QUESTIONS[quizQuestion].correctIndex) {
      setQuizScore(s => s + 1);
    }
  };

  const handleNextQuiz = () => {
    setSelectedOption(null);
    setShowAnswer(false);
    if (quizQuestion + 1 < QUIZ_QUESTIONS.length) {
      setQuizQuestion(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setQuizQuestion(0);
    setSelectedOption(null);
    setShowAnswer(false);
    setQuizScore(0);
    setQuizFinished(false);
  };


  return (
    <div className="space-y-8 pb-16 animate-fadeIn max-w-6xl mx-auto px-4 text-stone-800">
      
      {/* HEADER: High-End Minimal Ivory & Charcoal Slate Banner */}
      <header className="p-8 md:p-12 rounded-3xl bg-neutral-900 border border-neutral-800 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-widest uppercase">
            <Compass size={13} className="text-amber-400" /> MUSIC THEORY ACADEMY • 乐理专精工坊
          </span>
          <h1 className="text-3xl md:text-5xl font-black font-serif text-white leading-snug tracking-wide">
            切分音乐理：失重悬浮与节拍的几何抗衡
          </h1>
          <p className="text-base text-neutral-300 font-light max-w-3xl leading-relaxed">
            切分音（Syncopation）并不是简单的把速度变快，而是<strong>乐理对听众大脑节拍重力的无形拆卸</strong>。本单通过五线谱视听对照、钢琴时值积木拼接验证、高级和弦延音拆解，帮您真正吃透「强拍缺失、弱拍称王」的钢琴美学奥理。
          </p>
        </div>
      </header>

      {/* SECTION 1: THE ACTIVE THEORY SCORE DEMO BOARD */}
      <section className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden grid lg:grid-cols-12">
        
        {/* Left Column (Theory Tab Navigation & Deep Descriptions): 4 slots */}
        <div className="lg:col-span-5 bg-stone-50 p-8 border-r border-stone-200 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-3 flex items-center gap-1.5">
                <BookOpen size={13} /> 切分音四大基本乐理架构
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(THEORY_DEMOS) as SyncopationType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => selectTheoryTab(type)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      activeTab === type 
                        ? 'bg-amber-500 border-amber-600 text-neutral-950 font-bold shadow-md shadow-amber-500/10' 
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100 hover:border-stone-300'
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-wider opacity-85">
                      {type === 'duration' ? '时值切分' : type === 'tie' ? '延音线切分' : type === 'rest' ? '休止切分' : '重音切分'}
                    </span>
                    <span className="text-xs font-black mt-1 line-clamp-1">
                      {type === 'duration' ? '大切分式' : type === 'tie' ? '跨拍延音' : type === 'rest' ? '留白呼吸' : '弱拍爆破'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 p-5 rounded-2xl bg-amber-50/50 border border-amber-100/80">
              <h3 className="text-sm font-black text-amber-900 flex items-center gap-1.5">
                <Flame size={15} className="text-amber-500" />
                {THEORY_DEMOS[activeTab].title}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-light">
                {THEORY_DEMOS[activeTab].description}
              </p>
            </div>
          </div>

          {/* Quick interactive stats & playback trigger */}
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-500 font-medium">乐理课节奏时速 (Tempo)</span>
              <span className="font-mono text-amber-600 font-bold">{bpm} BPM</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="60"
                max="125"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDemoToggle}
                className={`flex-1 py-3.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isPlaying 
                    ? 'bg-neutral-900 text-white shadow-inner' 
                    : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black shadow-lg shadow-amber-500/10'
                }`}
              >
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                <span>{isPlaying ? '停止乐谱播放' : '播放五线谱声学解析'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Pure Visual Notation Vector Score): 7 slots */}
        <div className="lg:col-span-7 p-8 flex flex-col justify-between space-y-8 bg-neutral-950 text-white">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-2">
              <Music className="text-amber-400" size={17} />
              <span className="text-xs font-mono font-bold tracking-widest text-stone-400 uppercase">
                高音谱号切分音律动分析仪 ({activeTab.toUpperCase()})
              </span>
            </div>
            {/* Metronome pulse beats marker */}
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((b) => (
                <div 
                  key={b} 
                  className={`w-8 py-1 rounded text-[10px] font-mono font-black text-center border transition-all ${
                    beatPulse === b 
                      ? 'bg-amber-500 border-amber-600 text-neutral-900 scale-105' 
                      : 'bg-neutral-900 border-neutral-800 text-stone-500'
                  }`}
                >
                  拍 {b}
                </div>
              ))}
            </div>
          </div>

          {/* DYNAMIC SVG SHEET MUSIC RENDERER */}
          <div className="relative py-4 px-2 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center min-h-[14rem]">
            
            {/* Playhead line scrolling across */}
            {isPlaying && active16thStep >= 0 && (
              <div 
                className="absolute top-4 bottom-4 w-0.5 bg-amber-500 shadow-lg shadow-amber-500/50 transition-all duration-75 z-20 pointer-events-none"
                style={{ left: `${14 + (active16thStep * 5.12)}%` }} // aligned mathematically with the 16 subdivisions
              />
            )}

            {/* Treble Clef and lines SVG */}
            <svg viewBox="0 0 450 120" className="w-full h-auto text-white fill-current overflow-visible">
              
              {/* Five Ledger Lines */}
              <line x1="20" y1="20" x2="430" y2="20" stroke="#444" strokeWidth="1.2" />
              <line x1="20" y1="35" x2="430" y2="35" stroke="#444" strokeWidth="1.2" />
              <line x1="20" y1="50" x2="430" y2="50" stroke="#444" strokeWidth="1.2" />
              <line x1="20" y1="65" x2="430" y2="65" stroke="#444" strokeWidth="1.2" />
              <line x1="20" y1="80" x2="430" y2="80" stroke="#444" strokeWidth="1.2" />

              {/* Bar Lines - Start & End */}
              <line x1="22" y1="20" x2="22" y2="80" stroke="#888" strokeWidth="2.5" />
              {/* Measure center subdivide */}
              <line x1="225" y1="20" x2="225" y2="80" stroke="#333" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="428" y1="20" x2="428" y2="80" stroke="#888" strokeWidth="2.5" />

              {/* Treble Clef (G谱号) - Simplified elegant Vector */}
              <path 
                d="M 32 85 C 34 85, 36 78, 36 72 C 36 60, 26 50, 26 42 C 26 32, 34 22, 40 10 C 42 6, 44 6, 44 14 C 44 26, 38 40, 38 48 C 38 60, 48 70, 48 78 C 48 86, 38 92, 32 92 C 26 92, 22 88, 22 83" 
                fill="none" 
                stroke="#d1d5db" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />

              {/* Time signature: 4/4 */}
              <text x="56" y="44" className="font-serif text-lg font-bold fill-neutral-300">4</text>
              <text x="56" y="74" className="font-serif text-lg font-bold fill-neutral-300">4</text>

              {/* DRAW NOTES DIRECTLY LINKED WITH activeTab DATA */}
              {THEORY_DEMOS[activeTab].notes.map((note, index) => {
                // Map the 16th step scale directly to X coordinates [75px to 410px]
                const startX = 85 + (note.step * 20);
                // Pitch determines Y coordinate
                // Standard Treble Staff lines are at 20, 35, 50, 65, 80:
                // C5 (523.25) -> y = 42.5 (Space 3)
                // A4 (440.00) -> y = 57.5 (Space 2)
                // G4 (392.00) -> y = 65 (Line 2)
                // F4 (349.23) -> y = 72.5 (Space 1)
                // E4 (329.63) -> y = 80 (Line 1, bottom line)
                // C4 (261.63) -> y = 95 (Ledger line below bottom line)
                let noteY = 65; 
                if (note.pitch === 261.63) noteY = 95; // C4
                else if (note.pitch === 329.63) noteY = 80; // E4
                else if (note.pitch === 349.23) noteY = 72.5; // F4
                else if (note.pitch === 392.00) noteY = 65; // G4
                else if (note.pitch === 440.00) noteY = 57.5; // A4
                else if (note.pitch === 523.25) noteY = 42.5; // C5

                const isActive = active16thStep >= note.step && active16thStep < (note.step + note.durationSteps);

                return (
                  <g key={index} className="transition-all duration-150">
                    
                    {/* Render REST symbol if marked */}
                    {note.isRestOutline ? (
                      <path 
                        d={`M ${startX} 40 L ${startX + 5} 55 L ${startX - 2} 62 L ${startX + 3} 68`} 
                        fill="none" 
                        stroke={isActive ? '#f59e0b' : '#ef4444'} 
                        strokeWidth="3.5"
                      />
                    ) : (
                      <>
                        {/* Render Ledger Line if note is below the staff (C4) */}
                        {note.pitch === 261.63 && (
                          <line
                            x1={startX - 12}
                            y1={95}
                            x2={startX + 12}
                            y2={95}
                            stroke={isActive ? '#f59e0b' : '#444'}
                            strokeWidth="1.2"
                          />
                        )}

                        {/* Note Head - Ellipse */}
                        <ellipse 
                          cx={startX} 
                          cy={noteY} 
                          rx="6" 
                          ry="4" 
                          transform={`rotate(-15 ${startX} ${noteY})`}
                          className={`cursor-pointer transition-all ${
                            isActive ? 'fill-amber-400 drop-shadow-[0_0_8px_#f59e0b]' : 'fill-stone-200'
                          }`}
                        />

                        {/* Note Stem - pointing upwards or downwards based on ledger position (Notes on/above B4 point down, notes below point up) */}
                        <line 
                          x1={startX + 6} 
                          y1={noteY} 
                          x2={startX + 6} 
                          y2={noteY >= 50 ? noteY - 28 : noteY + 28} 
                          stroke={isActive ? '#f59e0b' : '#9ca3af'} 
                          strokeWidth="1.5"
                        />

                        {/* Draw flags for eighth notes (duration 2) if not connected */}
                        {note.durationSteps === 2 && (
                          <path 
                            d={`M ${startX + 6} ${noteY >= 50 ? noteY - 28 : noteY + 28} C ${startX + 12} ${noteY >= 50 ? noteY - 20 : noteY + 20}, ${startX + 14} ${noteY >= 50 ? noteY - 14 : noteY + 14}, ${startX + 10} ${noteY >= 50 ? noteY - 10 : noteY + 10}`} 
                            fill="none" 
                            stroke={isActive ? '#f59e0b' : '#cbd5e1'} 
                            strokeWidth="1.5"
                          />
                        )}

                        {/* Draw Accents (>) underneath/above if marked */}
                        {note.isAccent && (
                          <path 
                            d={`M ${startX - 5} ${noteY - 12} L ${startX + 1} ${noteY - 15} L ${startX - 5} ${noteY - 18}`} 
                            fill="none" 
                            stroke="#f59e0b" 
                            strokeWidth="2"
                          />
                        )}

                        {/* Render TIE (弧线延音线) */}
                        {note.isTieStart && (
                          <path 
                            d={`M ${startX + 4} ${noteY + 7} Q ${startX + 44} ${noteY + 22} ${startX + 80} ${noteY + 7}`} 
                            fill="none" 
                            stroke="#10b981" 
                            strokeWidth="2.5" 
                            strokeDasharray="1,1" 
                            className="animate-pulse"
                          />
                        )}
                      </>
                    )}

                    {/* Trigger Text Labels right on top of notation notes */}
                    <text 
                      x={startX - 10} 
                      y={noteY - 33} 
                      className={`text-[9px] font-mono font-bold tracking-tight ${
                        isActive ? 'fill-amber-400' : 'fill-stone-500'
                      }`}
                    >
                      {note.isRestOutline ? '休止' : note.isTieEnd ? '(延音)' : note.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Live notation footer guide */}
            <div className="absolute bottom-2 text-[10px] font-mono text-stone-500 w-full text-center tracking-widest uppercase">
              16步高精细分微观扫描轨 ( 1格 = 半个八分音符 )
            </div>
          </div>

          {/* Deep theoretical solfege readout */}
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block">
              💡 视唱与节奏拆解口诀 (Rhythm Speech Solfege)
            </span>
            <div className="text-sm font-semibold font-serif text-stone-200">
              {THEORY_DEMOS[activeTab].sheetFormula}
            </div>
            <p className="text-xs text-stone-400 font-light leading-relaxed">
              <strong>乐理解析：</strong>{THEORY_DEMOS[activeTab].explanation} 试着跟随播放红线，在心里唱出这个极富弹性的停顿并感受失重。
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 2: THE INTERACTIVE RHYTHM CONSTRUCTOR CHALLENGE */}
      <section className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-100 pb-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-black uppercase">
                Challenge Arena
              </span>
              <h2 className="text-xl font-black text-stone-900 flex items-center gap-1.5">
                <Sliders size={20} className="text-amber-500" />
                时值拼装工匠：自定义切分音创作台
              </h2>
            </div>
            <p className="text-xs text-stone-500 font-light">
              利用科学的音符时值。点击下方音符积木，使一小节时值厚度之和精确契合 <strong>16 步六分音符</strong>，看你是否形成了符合乐理的“切分音”。
            </p>
          </div>
          
          <div className="shrink-0 flex gap-2">
            <button 
              onClick={handleClearBlocks}
              disabled={puzzlePlaying}
              className="px-4 py-2 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all flex items-center gap-1 hover:text-stone-900 disabled:opacity-40"
            >
              <ResetIcon size={13} />
              清空重置
            </button>
            <button 
              onClick={playCustomRhythmScore}
              disabled={puzzleGrid.length === 0 || puzzlePlaying}
              className={`px-5 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow ${
                puzzleGrid.length > 0 && !puzzlePlaying
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 hover:brightness-105' 
                  : 'bg-stone-100 text-stone-400 border border-stone-200'
              }`}
            >
              <Music size={13} />
              {puzzlePlaying ? '钢琴演奏示范中...' : '视听钢琴弹奏'}
            </button>
          </div>
        </div>

        {/* 1. BLOCKS CATALOG AVAILABLE TO POP IN */}
        <div className="space-y-3">
          <span className="text-[10px] font-black tracking-wider text-stone-400 uppercase block">
            请点击加进音符库 (音符积木时值一览)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {BLOCKS_CATALOG.map((block) => (
              <button
                key={block.id}
                disabled={puzzlePlaying}
                onClick={() => handleAddBlock(block)}
                className={`p-3.5 rounded-2xl border text-left transition-all active:scale-[0.97] hover:shadow flex flex-col justify-between h-20 disabled:opacity-40 cursor-pointer ${block.color}`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-xs font-bold">{block.name}</span>
                  <span className="text-base leading-none font-black">{block.symbol}</span>
                </div>
                <span className="text-[10px] font-mono font-black tracking-widest uppercase opacity-75">
                  长: {block.duration} 步 ({block.duration / 4} 拍)
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. THE CHOSEN GRID DISPLAY ROW (The Actual Music Score Board) */}
        <div className="space-y-3 pt-4">
          <span className="text-[10px] font-black tracking-wider text-stone-400 uppercase block">
            您拼装的一小节乐谱 (A 4/4 Bar Score Layout)
          </span>
          
          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 text-white min-h-[7rem] flex flex-wrap items-center gap-3 relative">
            {puzzleGrid.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center py-4 text-center select-none text-stone-500">
                <Music size={24} className="mb-1.5 opacity-40" />
                <span className="text-xs font-bold">小节尚空，点击上方板块，搭起您脑海中的乐谱吧！</span>
              </div>
            ) : (
              puzzleGrid.map((block, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleRemoveBlock(idx)}
                  className={`px-4 py-3 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:scale-105 active:scale-95 group relative overflow-hidden backdrop-blur-sm shadow`}
                  style={{ width: `${60 + (block.duration * 10)}px` }} // Width scales dynamically matching note length!
                >
                  <span className="text-lg leading-tight font-black">{block.symbol}</span>
                  <span className="text-[9px] font-mono opacity-80">{block.duration}步</span>
                  {/* Delete hovering cover */}
                  <div className="absolute inset-0 bg-red-600 text-white text-[10px] uppercase font-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    移除 ✕
                  </div>
                </div>
              ))
            )}

            {/* Metric total counter indicator bubble */}
            <div className="absolute top-2 right-3 px-3 py-1 bg-neutral-950 border border-neutral-800 text-[10px] font-mono font-black text-amber-400 rounded-lg">
              当前蓄水: {puzzleGrid.reduce((sum, item) => sum + item.duration, 0)} / 16 步
            </div>
          </div>
        </div>

        {/* 3. VALIDATION VERDICT BOARD */}
        <div className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors ${
          puzzleValid === true 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : puzzleValid === false 
              ? 'bg-amber-50 border-amber-200 text-amber-800' 
              : 'bg-stone-50 border-stone-200 text-stone-600'
        }`}>
          <div className="p-2 bg-white rounded-lg border border-current shrink-0">
            {puzzleValid === true ? (
              <CheckCircle size={18} className="text-emerald-600" />
            ) : puzzleValid === false ? (
              <Info size={18} className="text-amber-600" />
            ) : (
              <HelpCircle size={18} className="text-stone-500" />
            )}
          </div>
          <div className="space-y-1 text-xs">
            <span className="font-bold block uppercase tracking-wide">乐理评级室 (Theory Validation System)</span>
            <p className="font-light leading-relaxed">{puzzleMessage}</p>
          </div>
        </div>

        {/* Playful combination ideas */}
        <div className="bg-stone-50 p-4 rounded-xl text-xs text-stone-600 space-y-1.5 font-light leading-relaxed">
          <span className="font-bold text-stone-800 flex items-center gap-1">
            <Star size={13} className="text-amber-500 fill-current" /> 
            推荐的乐理切分拼法（在上面点击拼试）：
          </span>
          <ul className="list-disc pl-5 space-y-1.5 text-[11px]">
            <li>
              <strong>大切分典型进行式：</strong> 【八分 (2步)】 → 【四分 (4步) - 切分发生！】 → 【八分 (2步)】 → 【两个四分 (4+4步)】 = 16 步。
            </li>
            <li>
              <strong>雷鬼塞西略舞感型：</strong> 【附点八分 (3步)】 → 【附点八分 (3步)】 → 【八分 (2步)】 → 【接着循环或填四分】 3+3+2 完美的错位狂潮。
            </li>
          </ul>
        </div>
      </section>

      {/* SECTION 3: THE HIGH-LEVEL MUSIC THEORY EXAM */}
      <section className="grid lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Classical Masterpieces Analysis */}
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xl flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-stone-100 pb-3 flex items-center gap-2">
              <Award className="text-amber-500" size={20} />
              <h2 className="text-lg font-black font-serif text-stone-900">
                大师名谱剖析：切分乐理的德奥与爵士交锋
              </h2>
            </div>

            <div className="space-y-4">
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-150 space-y-2.5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-xs text-stone-900">
                      贝多芬《第三交响曲“英雄”(Eroica)》
                    </h3>
                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider font-mono">
                      德国古典交响乐理
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-800 text-[9px] font-black">
                    BEETHOVEN
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-normal font-light">
                  在第一乐章充满戏剧性的展开部中，贝多芬故意打破 3/4 拍（强、弱、弱）的平滑流逝，命令铜管乐手在第二和第三拍弱拍上，砸出极具毁灭性的爆裂重音 (sfz) 并在大正拍空着不弹。
                </p>
                <div className="p-2.5 bg-neutral-900 text-[10px] text-amber-400 rounded-lg font-mono">
                  <strong>重口理秘诀：</strong>打破节拍的天然骨架，从而模拟出法国大革命英雄浴血奋战中骨骼肌肉的不屈拉扯。
                </div>
              </div>

              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-150 space-y-2.5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-xs text-stone-900">
                      斯科特·乔普林《演艺人 (The Entertainer)》
                    </h3>
                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider font-mono">
                      爵士早期 Ragtime 舞曲乐理
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-800 text-[9px] font-black">
                    RAGTIME JAZZ
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-normal font-light">
                  拉格泰姆左手雷打不动地行进着像打字机一样机械的重音基柱，而右手高音区却频繁演奏着跨拍延音线或八分小切分。
                </p>
                <div className="p-2.5 bg-neutral-900 text-[10px] text-amber-400 rounded-lg font-mono">
                  <strong>重口理秘诀：</strong>“Ragtime”原意就是“切碎的时间”。通过高悬的切分，让庄严肃穆的古典钢琴瞬间充满调皮逗趣、轻佻摇摆的街头幽默。
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Syncopation mental quiz */}
        <div className="bg-neutral-900 text-white rounded-3xl p-8 shadow-2xl flex flex-col justify-between border border-neutral-800">
          <div>
            <h3 className="text-lg font-black font-serif border-b border-stone-800 pb-3 flex items-center gap-2 text-amber-400">
              <Award size={20} />
              切分乐理深度试炼 Crucible
            </h3>

            {!quizFinished ? (
              <div className="mt-6 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                  <span>理论题 {quizQuestion + 1} / {QUIZ_QUESTIONS.length}</span>
                  <span className="text-amber-400 font-black">答对积分: {quizScore} pts</span>
                </div>

                <h4 className="font-bold text-sm text-stone-100 leading-relaxed">
                  {QUIZ_QUESTIONS[quizQuestion].question}
                </h4>

                <div className="space-y-2.5 pt-2">
                  {QUIZ_QUESTIONS[quizQuestion].options.map((option, idx) => {
                    const isSelectedVal = selectedOption === idx;
                    const isCorrectVal = idx === QUIZ_QUESTIONS[quizQuestion].correctIndex;
                    
                    let style = 'bg-neutral-950 border-neutral-800 hover:bg-neutral-800/80 text-stone-300';
                    if (showAnswer) {
                      if (isCorrectVal) {
                        style = 'bg-green-950/60 border-green-500 text-white font-black';
                      } else if (isSelectedVal) {
                        style = 'bg-rose-950/60 border-rose-500 text-stone-200';
                      } else {
                        style = 'opacity-35 bg-neutral-950 text-stone-600';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={showAnswer}
                        onClick={() => handleQuizAnswer(idx)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs leading-normal transition-all flex items-center justify-between gap-3 cursor-pointer ${style}`}
                      >
                        <span className="flex-1">{option}</span>
                        {showAnswer && isCorrectVal && <CheckCircle size={15} className="text-green-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {showAnswer && (
                  <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] text-stone-400 leading-relaxed animate-slideUp">
                    <span className="block font-bold text-amber-400 mb-0.5">🧠 德奥名门考级解析录：</span>
                    {QUIZ_QUESTIONS[quizQuestion].explanation}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-8 text-center space-y-4 animate-scaleUp py-6">
                <Award size={52} className="mx-auto text-amber-400 animate-bounce" />
                <h4 className="text-lg font-black text-white">切分音高级理学者验证通过！</h4>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  恭喜你成功通过本次试炼！总积分： <strong>{quizScore} 分</strong>（满分 {QUIZ_QUESTIONS.length}）
                </p>
                <button
                  onClick={resetQuiz}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-black shadow-lg transition-transform hover:scale-105 cursor-pointer"
                >
                  重温一次试炼
                </button>
              </div>
            )}
          </div>

          {!quizFinished && showAnswer && (
            <button
              onClick={handleNextQuiz}
              className="mt-6 w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-black transition-transform hover:scale-[1.01] cursor-pointer"
            >
              继续下一题
            </button>
          )}
        </div>

      </section>

    </div>
  );
};

export default SyncopationLesson;
