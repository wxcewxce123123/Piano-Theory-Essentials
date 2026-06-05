import React, { useState, useEffect, useRef } from 'react';
import { Eye, Play, Pause, RefreshCw, Zap, BrainCircuit, ScanEye, Hand, ArrowRight, Music, CheckCircle2, Target, Crown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SightReadingLessonProps {
    settings?: {
        instrumentSound?: 'grand' | 'upright' | 'rhodes' | 'synth';
        particlesStyle?: 'notes' | 'stars' | 'sakura' | 'bubbles';
        keyboardStyle?: 'minimal' | 'retro' | 'neon' | 'aurora';
    };
}

const SightReadingLesson: React.FC<SightReadingLessonProps> = ({ settings }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [speed, setSpeed] = useState(1); // 0.5x, 1x, 1.5x, 2x
  const [score, setScore] = useState(0);
  const [activeNoteIndex, setActiveNoteIndex] = useState(-1);
  const [pressedKeyName, setPressedKeyName] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Animation loop for the scrolling score
  useEffect(() => {
    let animationFrame: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      if (isPlaying) {
        const deltaTime = time - lastTime;
        lastTime = time;
        
        setProgress((prev) => {
          const next = prev + (deltaTime * 0.015 * speed); 
          if (next >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return next;
        });
        animationFrame = requestAnimationFrame(animate);
      }
    };

    if (isPlaying) {
      animationFrame = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, speed]);

  const reset = () => {
    setIsPlaying(false);
    setProgress(0);
    setScore(0);
    setActiveNoteIndex(-1);
    setPressedKeyName(null);
  };

  // Generate pleasant musical notes with defined keys and frequencies!
  const notes = useRef(Array.from({ length: 40 }).map((_, i) => {
    const pitches = [
      { name: 'C4', freq: 261.63, y: 70 },
      { name: 'D4', freq: 293.66, y: 65 },
      { name: 'E4', freq: 329.63, y: 60 },
      { name: 'F4', freq: 349.23, y: 55 },
      { name: 'G4', freq: 392.00, y: 50 },
      { name: 'A4', freq: 440.00, y: 45 },
      { name: 'B4', freq: 493.88, y: 40 },
      { name: 'C5', freq: 523.25, y: 35 },
      { name: 'D5', freq: 587.33, y: 30 },
      { name: 'E5', freq: 659.25, y: 25 },
    ];
    // Pleasant melodic pattern
    const pitch = pitches[Math.floor((Math.sin(i * 0.7) + 1) * 4.5) % pitches.length];
    return {
      id: i,
      y: pitch.y,
      x: (i / 40) * 100,
      name: pitch.name,
      freq: pitch.freq
    };
  })).current;

  // Synthesizer note player
  const playNoteSound = (freq: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      const inst = settings?.instrumentSound || 'grand';

      if (inst === 'grand') {
        // Classic acoustic grand representation
        osc.type = 'sine';
        
        // Soft 3rd harmonic
        const o3 = ctx.createOscillator();
        const g3 = ctx.createGain();
        o3.type = 'sine';
        o3.frequency.value = freq * 3;
        g3.gain.value = 0.04;
        o3.connect(g3).connect(ctx.destination);
        o3.start();
        setTimeout(() => { try { o3.stop(); o3.disconnect(); g3.disconnect(); } catch(e){} }, 500);

      } else if (inst === 'upright') {
        // Soft warm triangle with steep lowpass
        osc.type = 'triangle';
        filter.type = 'lowpass';
        filter.frequency.value = 550;
        osc.connect(filter);
      } else if (inst === 'rhodes') {
        // Warm Rhodes tines
        osc.type = 'sine';
        filter.type = 'peaking';
        filter.frequency.value = freq * 2;
        filter.Q.value = 3.5;
        filter.gain.value = 7;
        osc.connect(filter);
      } else if (inst === 'synth') {
        // Focusing ambient synth pad (resonant sweeps)
        osc.type = 'sawtooth';
        filter.type = 'lowpass';
        filter.Q.value = 5.0;
        filter.frequency.setValueAtTime(freq * 3.5, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(freq * 1.1, ctx.currentTime + 0.5);
        osc.connect(filter);
      }

      // Envelope amplitude
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.75);

      if (inst === 'upright' || inst === 'rhodes' || inst === 'synth') {
        osc.connect(filter).connect(gain);
      } else {
        osc.connect(gain);
      }

      // Reverb acoustics space synthesis
      const delay = ctx.createDelay();
      const feedback = ctx.createGain();

      if (inst === 'upright') {
        delay.delayTime.value = 0.08;
        feedback.gain.value = 0.22;
      } else if (inst === 'rhodes') {
        delay.delayTime.value = 0.22;
        feedback.gain.value = 0.44;
      } else if (inst === 'synth') {
        delay.delayTime.value = 0.38;
        feedback.gain.value = 0.58;
      } else {
        delay.delayTime.value = 0;
        feedback.gain.value = 0;
      }

      gain.connect(ctx.destination);
      if (feedback.gain.value > 0) {
        delay.connect(feedback);
        feedback.connect(delay);
        gain.connect(delay);
        delay.connect(ctx.destination);
      }

      osc.frequency.value = freq;
      osc.start();
      
      setTimeout(() => {
        try {
          osc.stop();
          osc.disconnect();
          filter.disconnect();
          gain.disconnect();
          if (feedback.gain.value > 0) {
            delay.disconnect();
            feedback.disconnect();
          }
        } catch(e){}
      }, 1200); // slight delay padding to let sound fade organically
    } catch(e) {}
  };

  // Check notes entering hands zone & trigger playback
  useEffect(() => {
      if (!isPlaying) return;
      
      // Hands zone is at 20%
      const currentNoteIndex = notes.findIndex(note => {
          const currentPos = note.x - progress;
          return currentPos > 10 && currentPos < 20;
      });

      if (currentNoteIndex !== -1 && currentNoteIndex !== activeNoteIndex) {
          setActiveNoteIndex(currentNoteIndex);
          setScore(prev => prev + 1);
          setPressedKeyName(notes[currentNoteIndex].name);
          playNoteSound(notes[currentNoteIndex].freq);
          
          // clear key press state slightly later
          setTimeout(() => {
              setPressedKeyName(null);
          }, 400);
      }
  }, [progress, isPlaying, notes, activeNoteIndex]);

  // Define full piano keys
  const pianoKeys = [
    { name: 'C4', label: 'C', freq: 261.63, isBlack: false },
    { name: 'C#4', label: 'C#', freq: 277.18, isBlack: true },
    { name: 'D4', label: 'D', freq: 293.66, isBlack: false },
    { name: 'D#4', label: 'D#', freq: 311.13, isBlack: true },
    { name: 'E4', label: 'E', freq: 329.63, isBlack: false },
    { name: 'F4', label: 'F', freq: 349.23, isBlack: false },
    { name: 'F#4', label: 'F#', freq: 369.99, isBlack: true },
    { name: 'G4', label: 'G', freq: 392.00, isBlack: false },
    { name: 'G#4', label: 'G#', freq: 415.30, isBlack: true },
    { name: 'A4', label: 'A', freq: 440.00, isBlack: false },
    { name: 'A#4', label: 'A#', freq: 466.16, isBlack: true },
    { name: 'B4', label: 'B', freq: 493.88, isBlack: false },
    { name: 'C5', label: 'C5', freq: 523.25, isBlack: false },
    { name: 'C#5', label: 'C#', freq: 554.37, isBlack: true },
    { name: 'D5', label: 'D5', freq: 587.33, isBlack: false },
    { name: 'D#5', label: 'D#', freq: 622.25, isBlack: true },
    { name: 'E5', label: 'E5', freq: 659.25, isBlack: false },
  ];

  const handleKeyClick = (key: any) => {
    setPressedKeyName(key.name);
    playNoteSound(key.freq);
    setTimeout(() => setPressedKeyName(null), 300);
  };

  const kbStyle = settings?.keyboardStyle || 'minimal';

  return (
    <div className="space-y-8">
      <header className="mb-10 animate-slideUp">
         <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 1 - Foundations</div>
         <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6 leading-tight">
           视奏入门 <span className="text-stone-300 font-light">|</span> Sight Reading
         </h2>
         <p className="text-xl text-stone-600 font-light leading-relaxed max-w-2xl">
           视奏不是天生的魔法，而是可以通过科学训练掌握的技能。核心秘诀在于：<strong>眼睛永远走在手的前面</strong>。
         </p>
      </header>

      {/* Interactive Visualizer */}
      <section className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-stone-200 animate-slideUp stagger-1 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10 opacity-50 translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
              <ScanEye className="text-indigo-500" /> 
              重力感官 & 视奏乐谱同步
            </h3>
            <p className="text-stone-500 text-sm mt-1">乐曲流动时将实时驱动底层钢琴合成器，切换 Pro 会员选项体验不同美学效果。</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center bg-stone-100 rounded-xl p-1">
                {[0.5, 1, 1.5, 2].map(s => (
                    <button 
                        key={s}
                        onClick={() => setSpeed(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${speed === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        {s}x
                    </button>
                ))}
            </div>
            <button 
              onClick={reset}
              className="p-3 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors flex-shrink-0"
              title="重置"
            >
              <RefreshCw size={20} />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
            >
              {isPlaying ? <><Pause size={20} /> 暂停</> : <><Play size={20} /> 开始训练</>}
            </button>
          </div>
        </div>

        {/* The Score Area */}
        <div className="relative h-48 bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden mb-6">
          {/* Staff Lines */}
          <div className="absolute inset-0 flex flex-col justify-center py-8 z-0">
            {[1, 2, 3, 4, 5].map(line => (
              <div key={line} className="h-[1px] bg-stone-300 w-full my-1.5"></div>
            ))}
          </div>

          {/* Scrolling Notes Container */}
          <div 
            className="absolute inset-y-0 left-0 flex items-center z-10"
            style={{ 
              width: '300%', 
              transform: `translateX(-${progress}%)`,
              transition: isPlaying ? 'none' : 'transform 0.3s ease-out'
            }}
          >
            {notes.map((note, i) => {
                const isBeingRead = (note.x - progress) > 40 && (note.x - progress) < 55;
                const isBeingPlayed = i === activeNoteIndex;
                
                return (
                  <motion.div 
                    key={note.id}
                    className="absolute z-10 font-sans font-bold flex flex-col items-center"
                    style={{ 
                      left: `${note.x}%`,
                      top: `${note.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    animate={{
                        scale: isBeingPlayed ? 1.5 : isBeingRead ? 1.2 : 1,
                        filter: isBeingPlayed ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.8))' : isBeingRead ? 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.8))' : 'none'
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    <div className={`w-5 h-5 rounded-full shadow-sm flex items-center justify-center text-[8px] text-white font-bold transition-colors duration-200 ${isBeingPlayed ? 'bg-amber-500' : isBeingRead ? 'bg-indigo-500' : 'bg-stone-800'}`}>
                        {note.name[0]}
                    </div>
                    {/* Stem */}
                    <div className={`absolute ${note.y > 50 ? 'bottom-1/2 right-0' : 'top-1/2 left-0'} w-[2px] h-10 transition-colors duration-200 ${isBeingPlayed ? 'bg-amber-500' : isBeingRead ? 'bg-indigo-500' : 'bg-stone-800'}`}></div>
                  </motion.div>
                );
            })}
          </div>

          {/* Static Overlays (Eyes and Hands) */}
          <div className="absolute inset-y-0 left-0 w-full pointer-events-none z-20">
            {/* Hands Zone (Current playing) */}
            <div className={`absolute top-4 bottom-4 left-[10%] md:left-[20%] w-16 md:w-20 border-2 rounded-lg flex flex-col items-center justify-end pb-2 backdrop-blur-[1px] transition-all duration-300 ${activeNoteIndex !== -1 ? 'border-amber-400 bg-amber-400/20 shadow-[0_0_20px_rgba(251,191,36,0.3)]' : 'border-amber-400/50 bg-amber-400/5'}`}>
              <motion.div
                animate={activeNoteIndex !== -1 ? { y: [0, -5, 0] } : {}}
                transition={{ duration: 0.2 }}
              >
                  <Hand size={24} className={`mb-1 transition-colors ${activeNoteIndex !== -1 ? 'text-amber-500' : 'text-amber-600/50'}`} />
              </motion.div>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Hands</span>
            </div>

            {/* Eyes Zone (Looking ahead) */}
            <div className={`absolute top-4 bottom-4 left-[40%] md:left-[45%] w-24 md:w-32 border-2 rounded-lg flex flex-col items-center justify-start pt-2 backdrop-blur-[1px] transition-all duration-300 ${isPlaying ? 'border-indigo-400 bg-indigo-400/20 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'border-indigo-400/50 bg-indigo-400/5'}`}>
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1">Eyes</span>
              <motion.div
                animate={isPlaying ? { x: [-2, 2, -2] } : {}}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              >
                  <Eye size={24} className={`transition-colors ${isPlaying ? 'text-indigo-500' : 'text-indigo-600/50'}`} />
              </motion.div>
            </div>
            
            {/* Connection Arch */}
            <div className="absolute top-[20%] left-[15%] md:left-[25%] right-[50%] md:right-[45%] h-16 border-t-2 border-dashed border-indigo-400 rounded-t-[100%] opacity-60">
                <motion.div 
                    className="absolute -right-1 -top-1.5 text-indigo-400"
                    animate={isPlaying ? { x: [0, 5, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                >
                    <ArrowRight size={12} />
                </motion.div>
            </div>
          </div>
          
          {/* Score Display */}
          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-stone-200 font-mono text-sm font-bold text-stone-700 flex items-center gap-2 z-30">
              <Target size={14} className="text-amber-500" />
              {score}
          </div>
        </div>

        {/* Playable Piano Keyboard Block based on user personalizations */}
        <div className="mt-8 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-stone-800 flex items-center gap-2">
                        <Music size={14} className="text-stone-500" />
                        实键互动与指法反馈 
                    </span>
                    <span className="text-[11px] text-stone-400">适配定制肤色效果，点击键位亦可发声发乐</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-50 px-3 py-1 rounded-full border border-stone-200">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    键盘风格: <strong className="text-indigo-600 capitalize">{kbStyle}</strong>
                </div>
            </div>

            {/* Render customizable piano layout base */}
            <div className={`w-full overflow-x-auto p-4 flex justify-center rounded-3xl border transition-all duration-1000 ${
                kbStyle === 'minimal' ? 'bg-stone-50 border-stone-200 shadow-inner' :
                kbStyle === 'retro' ? 'bg-[#3d2719] border-amber-950 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' :
                kbStyle === 'neon' ? 'bg-neutral-950 border-neutral-800 p-6 shadow-[0_12px_40px_rgba(236,72,153,0.15)]' :
                'bg-gradient-to-br from-violet-100 to-indigo-100 border-indigo-200 shadow-md'
            }`}>
                <div className="flex relative h-40 max-w-xl w-full">
                    {/* White keys render */}
                    {pianoKeys.filter(k => !k.isBlack).map((key, idx) => {
                        const isPressed = pressedKeyName === key.name;
                        
                        let keyClass = "";
                        let keyStyle = {};
                        
                        if (kbStyle === 'minimal') {
                            keyClass = `flex-1 bg-white border-x border-b border-stone-200 rounded-b-lg flex flex-col justify-end pb-3 items-center z-10 transition-all ${
                                isPressed ? 'bg-amber-100 translate-y-1' : 'hover:bg-stone-50'
                            }`;
                        } else if (kbStyle === 'retro') {
                            keyClass = `flex-1 bg-[#fffdf0] border-x border-b border-[#ebd7b1] rounded-b-md flex flex-col justify-end pb-3 items-center z-10 transition-all font-serif ${
                                isPressed ? 'bg-amber-200 translate-y-1' : 'hover:bg-[#f6f0dd]'
                            }`;
                        } else if (kbStyle === 'neon') {
                            keyClass = `flex-1 bg-neutral-900 border-x border-b border-neutral-800 rounded-b-xl flex flex-col justify-end pb-3 items-center z-10 transition-all ${
                                isPressed ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_15px_#22d3ee] scale-95' : 'text-cyan-400/80 hover:bg-neutral-850'
                            }`;
                        } else {
                            // aurora
                            keyClass = `flex-1 bg-white/70 border-x border-b border-indigo-100/50 rounded-b-2xl flex flex-col justify-end pb-3 items-center z-10 transition-all backdrop-blur-md ${
                                isPressed ? 'bg-[#ecd8ff] border-violet-300 translate-y-1' : 'hover:bg-white/90'
                            }`;
                        }

                        return (
                            <button
                                key={key.name}
                                onClick={() => handleKeyClick(key)}
                                className={keyClass}
                                style={keyStyle}
                            >
                                <span className={`text-[10px] font-bold ${
                                    kbStyle === 'neon' ? (isPressed ? 'text-black' : 'text-cyan-400') :
                                    kbStyle === 'retro' ? 'text-amber-900' : 'text-stone-500'
                                }`}>{key.label}</span>
                            </button>
                        );
                    })}

                    {/* Black keys overlaid on top */}
                    {pianoKeys.map((key, idx) => {
                        if (!key.isBlack) return null;
                        
                        // Approximate horizontal offsets for standard piano keyboard feel
                        const leftPercent = (idx / pianoKeys.length) * 100 + 1.2;
                        const isPressed = pressedKeyName === key.name;
                        
                        let blackKeyClass = "";
                        
                        if (kbStyle === 'minimal') {
                            blackKeyClass = `absolute w-6 h-24 bg-stone-900 border-x border-b border-stone-950 rounded-b flex items-end justify-center pb-2 z-20 transition-all ${
                                isPressed ? 'bg-amber-600 scale-95' : 'hover:bg-stone-800'
                            }`;
                        } else if (kbStyle === 'retro') {
                            blackKeyClass = `absolute w-6 h-24 bg-[#21150c] border-x border-b border-[#3d2719] rounded-b-sm flex items-end justify-center pb-2 z-20 transition-all ${
                                isPressed ? 'bg-amber-700 scale-95 animate-pulse' : 'hover:bg-[#2b1f13]'
                            }`;
                        } else if (kbStyle === 'neon') {
                            blackKeyClass = `absolute w-6 h-24 bg-black border-x border-b border-pink-500 rounded-b-md flex items-end justify-center pb-2 z-20 transition-all ${
                                isPressed ? 'bg-pink-500 text-white shadow-[0_0_15px_#ec4899] scale-95' : 'text-pink-400 hover:bg-neutral-950'
                            }`;
                        } else {
                            blackKeyClass = `absolute w-6 h-24 bg-indigo-950 border-x border-b border-indigo-900 rounded-b-2xl flex items-end justify-center pb-2 z-20 transition-all backdrop-blur-md ${
                                isPressed ? 'bg-violet-600 scale-95' : 'hover:bg-indigo-900'
                            }`;
                        }

                        return (
                            <button
                                key={key.name}
                                onClick={() => handleKeyClick(key)}
                                className={blackKeyClass}
                                style={{ left: `${leftPercent}%`, transform: 'translateX(-50%)' }}
                            >
                                <span className={`text-[8px] font-mono font-bold ${
                                    kbStyle === 'neon' ? (isPressed ? 'text-black' : 'text-pink-400') : 'text-white/60'
                                }`}>{key.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div whileHover={{ y: -4 }} className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 transition-colors hover:bg-indigo-50">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
              <ScanEye size={20} />
            </div>
            <h4 className="font-bold text-stone-900 mb-2">1. 提前量 (Look Ahead)</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              眼睛至少要看在手的前面一到两拍，甚至一个小节。当手在弹奏当前音符时，大脑已经在处理下一组音符了。
            </p>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100 transition-colors hover:bg-amber-50">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-3">
              <BrainCircuit size={20} />
            </div>
            <h4 className="font-bold text-stone-900 mb-2">2. 模式识别 (Chunking)</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              不要一个音一个音地读。把音符看作“单词”：音阶、琶音、和弦。看到形状，直接反应出指法。
            </p>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 transition-colors hover:bg-emerald-50">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
              <Zap size={20} />
            </div>
            <h4 className="font-bold text-stone-900 mb-2">3. 保持节奏 (Keep Going)</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              视奏时，节奏大于音准。弹错音没关系，千万不要停下来纠正。保持律动，继续往下看。
            </p>
          </motion.div>
        </div>
      </section>

      {/* Interactive Pattern Recognition */}
      <section className="animate-slideUp stagger-2">
        <h3 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
          <BrainCircuit className="text-stone-400" /> 模式识别训练
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm group hover:border-indigo-300 transition-all cursor-pointer">
            <div className="h-32 bg-stone-50 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
              <div className="flex flex-col gap-1.5 items-center z-10">
                <motion.div initial={{ width: 0 }} whileInView={{ width: 40 }} transition={{ delay: 0.1 }} className="h-3 bg-stone-800 rounded-full"></motion.div>
                <motion.div initial={{ width: 0 }} whileInView={{ width: 40 }} transition={{ delay: 0.2 }} className="h-3 bg-stone-800 rounded-full"></motion.div>
                <motion.div initial={{ width: 0 }} whileInView={{ width: 40 }} transition={{ delay: 0.3 }} className="h-3 bg-stone-800 rounded-full"></motion.div>
              </div>
              <div className="absolute inset-0 flex flex-col justify-center py-4 opacity-30">
                {[1, 2, 3, 4, 5].map(line => (
                  <div key={line} className="h-[1px] bg-stone-400 w-full my-1.5"></div>
                ))}
              </div>
              <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px] z-20">
                <motion.span 
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  className="font-bold text-indigo-700 bg-white px-4 py-2 rounded-full shadow-md flex items-center gap-2"
                >
                  <CheckCircle2 size={16} /> C Major Triad
                </motion.span>
              </div>
            </div>
            <h4 className="font-bold text-stone-900 mb-2">纵向阅读：和弦块</h4>
            <p className="text-sm text-stone-600">一眼看出和弦的形状（如三度叠置的“雪人”形状），而不是分别去读 C, E, G 三个音。</p>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm group hover:border-amber-300 transition-all cursor-pointer">
            <div className="h-32 bg-stone-50 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
              <div className="flex gap-1.5 items-end h-20 z-10">
                {[1,2,3,4,5,6].map((i, idx) => (
                  <motion.div 
                    key={i} 
                    initial={{ height: 0 }} 
                    whileInView={{ height: `${i * 15}%` }} 
                    transition={{ delay: idx * 0.1 }}
                    className="w-3 bg-stone-800 rounded-full"
                  ></motion.div>
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col justify-center py-4 opacity-30">
                {[1, 2, 3, 4, 5].map(line => (
                  <div key={line} className="h-[1px] bg-stone-400 w-full my-1.5"></div>
                ))}
              </div>
              <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px] z-20">
                <motion.span 
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  className="font-bold text-amber-700 bg-white px-4 py-2 rounded-full shadow-md flex items-center gap-2"
                >
                  <CheckCircle2 size={16} /> Scale Run
                </motion.span>
              </div>
            </div>
            <h4 className="font-bold text-stone-900 mb-2">横向阅读：音阶走向</h4>
            <p className="text-sm text-stone-600">识别出连续的上行或下行级进，只需看清起点和终点，中间顺势弹奏即可。</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default SightReadingLesson;
