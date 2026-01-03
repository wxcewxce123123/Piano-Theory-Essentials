
import React, { useState, useEffect, useMemo } from 'react';
import { Check, ArrowRight, Zap, Rocket, Music, Star, Heart, Sparkles, Cloud, Piano } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  onStartExiting?: () => void;
}

type Phase = 'landing' | 'question' | 'loading' | 'ready';

const QUESTIONS = [
  {
    id: 'goal',
    question: "你的终极目标是？",
    options: [
      { icon: '🌱', text: "随便玩玩", sub: "陶冶情操 (Hobby)", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", activeBorder: "border-emerald-500", activeBg: "bg-emerald-100" },
      { icon: '🎹', text: "成为大神", sub: "专业深造 (Pro)", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", activeBorder: "border-amber-500", activeBg: "bg-amber-100" },
      { icon: '🧠', text: "锻炼大脑", sub: "逻辑训练 (Brain)", color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200", activeBorder: "border-sky-500", activeBg: "bg-sky-100" },
      { icon: '✨', text: "创作音乐", sub: "写自己的歌 (Create)", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", activeBorder: "border-rose-500", activeBg: "bg-rose-100" },
    ]
  },
  {
    id: 'level',
    question: "现在的段位是？",
    options: [
      { icon: '🐣', text: "乐理小白", sub: "完全零基础 (Zero)", color: "text-stone-600", bg: "bg-white", border: "border-stone-200", activeBorder: "border-stone-400", activeBg: "bg-stone-50" },
      { icon: '🎼', text: "识谱苦手", sub: "只会一点点 (Basic)", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", activeBorder: "border-indigo-500", activeBg: "bg-indigo-100" },
      { icon: '🎹', text: "能弹两首", sub: "业余爱好者 (Inter)", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", activeBorder: "border-purple-500", activeBg: "bg-purple-100" },
      { icon: '🔥', text: "键盘杀手", sub: "专业级 (Advanced)", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", activeBorder: "border-red-500", activeBg: "bg-red-100" },
    ]
  },
  {
    id: 'time',
    question: "每天能肝多久？",
    options: [
      { icon: '☕', text: "5 分钟", sub: "佛系学习 (Chill)", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", activeBorder: "border-orange-500", activeBg: "bg-orange-100" },
      { icon: '🏃', text: "15 分钟", sub: "稳步前进 (Steady)", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", activeBorder: "border-blue-500", activeBg: "bg-blue-100" },
      { icon: '🏋️', text: "30 分钟", sub: "认真模式 (Serious)", color: "text-fuchsia-600", bg: "bg-fuchsia-50", border: "border-fuchsia-200", activeBorder: "border-fuchsia-500", activeBg: "bg-fuchsia-100" },
      { icon: '🚀', text: "1 小时+", sub: "狂热模式 (Hardcore)", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", activeBorder: "border-violet-500", activeBg: "bg-violet-100" },
    ]
  }
];

const LOADING_TEXTS = [
  "正在构建音乐知识图谱...",
  "正在打磨钢琴黑键...",
  "正在计算和声色彩...",
  "正在加载大师课程...",
  "正在为你量身定制...",
];

// --- Floating Particles Component ---
const FloatingParticles = () => {
  const particles = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 15 + Math.random() * 10,
    scale: 0.5 + Math.random() * 0.5,
    icon: [Music, Star, Sparkles][Math.floor(Math.random() * 3)]
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute text-white/10 animate-float-particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `scale(${p.scale})`,
          }}
        >
          <p.icon size={32} fill="currentColor" />
        </div>
      ))}
    </div>
  );
};

// --- App Logo Component ---
const AppLogo = ({ size = 'normal', className = '' }: { size?: 'normal' | 'large', className?: string }) => {
    // Dynamic sizing classes handled by parent or transition
    return (
        <div className={`relative flex items-center justify-center bg-stone-900 rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-700 ${className}`} style={{ width: size === 'large' ? '160px' : '80px', height: size === 'large' ? '160px' : '80px' }}>
            <div className="absolute inset-0 rounded-[2rem] border border-white/10"></div>
            {/* Piano Keys Abstract */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-stone-800 rounded-b-[2rem] flex px-4 pb-2 pt-1 justify-center gap-1 opacity-50">
                <div className="w-2 h-full bg-stone-950 rounded-b-sm"></div>
                <div className="w-2 h-full bg-stone-950 rounded-b-sm"></div>
                <div className="w-2 h-full bg-stone-950 rounded-b-sm"></div>
            </div>
            
            <Music className={`text-amber-400 relative z-10 drop-shadow-md transition-all duration-700`} size={size === 'large' ? 64 : 32} strokeWidth={2.5} />
            <Sparkles className="absolute top-4 right-4 text-white/20 animate-pulse" size={size === 'large' ? 32 : 16} />
        </div>
    );
};

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, onStartExiting }) => {
  const [phase, setPhase] = useState<Phase>('landing');
  const [qIndex, setQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadingText, setLoadingText] = useState(LOADING_TEXTS[0]);
  const [isExiting, setIsExiting] = useState(false);

  // --- Animation Handlers ---

  const handleStart = () => {
    setPhase('question');
  };

  const handleOptionSelect = (idx: number) => {
    if (selectedOption === idx) return;
    setSelectedOption(idx);
  };

  const handleNextQuestion = () => {
    if (qIndex < QUESTIONS.length - 1) {
        setTimeout(() => {
            setQIndex(prev => prev + 1);
            setSelectedOption(null);
        }, 300);
    } else {
        setPhase('loading');
        startLoadingSimulation();
    }
  };

  const startLoadingSimulation = () => {
      let p = 0;
      const interval = setInterval(() => {
          const increment = Math.random() * 2.5 + 0.8;
          p += increment;
          
          if (p > 100) {
              p = 100;
              clearInterval(interval);
              setTimeout(() => {
                  setPhase('ready');
              }, 800); // Wait a bit at 100%
          }
          setLoadProgress(p);
          const textIdx = Math.floor((p / 100) * LOADING_TEXTS.length);
          setLoadingText(LOADING_TEXTS[Math.min(textIdx, LOADING_TEXTS.length - 1)]);
      }, 30);
  };

  const handleFinalStart = () => {
      setIsExiting(true);
      if (onStartExiting) onStartExiting();
      setTimeout(onFinish, 1100);
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col font-sans overflow-hidden select-none transition-all duration-1000 ease-in-out
        ${isExiting ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'}
      `}
    >
      {/* Background */}
      <div className={`absolute inset-0 bg-gradient-to-br from-stone-50 via-amber-50 to-orange-100 animate-gradient-shift transition-opacity duration-1000 ${isExiting ? 'opacity-0' : 'opacity-100'}`}></div>
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a8a29e 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <FloatingParticles />

      {/* --- MAIN CONTENT --- */}
      <div className={`relative z-10 flex-1 flex flex-col items-center w-full max-w-lg mx-auto h-full transition-all duration-700 delay-100 ${isExiting ? 'opacity-0 translate-y-10 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}>
        
        {/* Top Progress Bar (Question Phase Only) */}
        <div className={`w-full px-8 pt-10 pb-2 transition-all duration-700 ease-out transform ${phase === 'question' ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'}`}>
            <div className="h-1.5 w-full bg-stone-200/50 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                    className="h-full bg-stone-800 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] rounded-full relative"
                    style={{ width: `${((qIndex + (selectedOption !== null ? 0.6 : 0)) / QUESTIONS.length) * 100}%` }}
                ></div>
            </div>
        </div>

        {/* Center Stage */}
        <div className="flex-1 w-full flex flex-col items-center justify-center px-6 relative pb-16">
            
            {/* PHASE 1: LANDING */}
            {phase === 'landing' && (
                <div className="text-center flex flex-col items-center animate-enter-up w-full">
                    <div className="mb-10 transform transition-transform hover:scale-105 duration-500 cursor-pointer" onClick={handleStart}>
                        <AppLogo size="large" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-stone-900 mb-4 tracking-tighter drop-shadow-sm font-serif">Piano Theory</h1>
                    <p className="text-stone-500 font-medium mb-12 text-sm tracking-[0.3em] uppercase">Interactive Masterclass</p>
                    <button onClick={handleStart} className="bg-stone-900 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-stone-900/20 active:scale-95 transition-all flex items-center gap-3 group hover:bg-stone-800">
                        <span>开始旅程</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}

            {/* PHASE 2: QUESTION */}
            {phase === 'question' && (
                <div key={qIndex} className="w-full flex flex-col items-center animate-card-enter">
                    <div className="text-center mb-8 w-full max-w-sm">
                        <h2 className="text-3xl font-black text-stone-900 leading-tight mb-2 font-serif">{QUESTIONS[qIndex].question}</h2>
                        <div className="h-1 w-12 bg-amber-400 mx-auto rounded-full"></div>
                    </div>
                    {/* Replaced 'custom-scrollbar' with no-scrollbar utilities to hide the white line/bar */}
                    <div className="grid grid-cols-1 gap-3 w-full px-2 max-h-[50vh] overflow-y-auto pb-20 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        {QUESTIONS[qIndex].options.map((opt, idx) => {
                            const isSelected = selectedOption === idx;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(idx)}
                                    className={`group relative w-full p-5 rounded-2xl border-2 flex items-center gap-5 transition-all duration-300 active:scale-[0.98] ${isSelected ? `${opt.activeBg} ${opt.activeBorder} ${opt.color} translate-y-0 shadow-none ring-1 ring-offset-1 ring-${opt.color.split('-')[1]}-300` : `bg-white ${opt.border} hover:bg-stone-50 text-stone-600 shadow-sm hover:shadow-md hover:-translate-y-0.5`}`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 ${isSelected ? 'scale-110 rotate-12 bg-white shadow-sm' : 'bg-stone-100 group-hover:scale-110 group-hover:bg-white'}`}>{opt.icon}</div>
                                    <div className="flex-1 text-left">
                                        <div className="font-bold text-lg leading-tight">{opt.text}</div>
                                        <div className={`text-xs font-medium uppercase tracking-wide mt-0.5 ${isSelected ? 'opacity-80' : 'text-stone-400'}`}>{opt.sub}</div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected ? `bg-current scale-100` : 'scale-0 opacity-0'}`}><Check size={14} className="text-white" strokeWidth={4} /></div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* PHASE 3 & 4: LOADING -> READY (Unified for smooth transition) */}
            {(phase === 'loading' || phase === 'ready') && (
                <div className="w-full text-center px-8 flex flex-col items-center absolute inset-0 justify-center">
                    
                    {/* Logo Transition */}
                    <div className={`mb-8 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${phase === 'ready' ? 'scale-110' : 'scale-100 animate-pulse-slow'}`}>
                        <AppLogo size={phase === 'ready' ? 'large' : 'normal'} />
                    </div>

                    {/* Text Container */}
                    <div className="relative h-20 w-full mb-8">
                        {/* Loading Text */}
                        <h3 className={`absolute inset-0 flex items-center justify-center text-lg font-bold text-stone-800 transition-all duration-500 ${phase === 'loading' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                            {loadingText}
                        </h3>
                        {/* Ready Text */}
                        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 delay-200 ${phase === 'ready' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            <h2 className="text-4xl font-black text-stone-900 mb-2 font-serif">All Set!</h2>
                            <p className="text-stone-500 text-sm">您的个性化课程已准备就绪</p>
                        </div>
                    </div>
                    
                    {/* Progress Bar Morphing into Button */}
                    {/* This container smoothly transitions from a thin bar to a large button */}
                    <div className="relative w-full max-w-xs h-16 flex items-center justify-center">
                        <div 
                            className={`absolute transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden shadow-xl
                                ${phase === 'ready' ? 'w-full h-14 rounded-2xl bg-stone-900 cursor-pointer hover:shadow-2xl hover:-translate-y-1' : 'w-full h-2 rounded-full bg-stone-200'}
                            `}
                            onClick={phase === 'ready' ? handleFinalStart : undefined}
                        >
                            {/* The Fill / Button Content */}
                            <div className="relative w-full h-full">
                                {/* Loading Fill */}
                                <div 
                                    className={`absolute left-0 top-0 bottom-0 bg-stone-900 transition-all duration-100 ease-linear ${phase === 'ready' ? 'opacity-0' : 'opacity-100'}`} 
                                    style={{ width: phase === 'ready' ? '100%' : `${loadProgress}%` }}
                                ></div>

                                {/* Button Content (Hidden during loading) */}
                                <div className={`absolute inset-0 flex items-center justify-center gap-3 text-white font-bold text-lg transition-all duration-500 delay-300 ${phase === 'ready' ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                                    <Rocket size={20} className="text-amber-400" />
                                    Let's Go
                                    <ArrowRight size={20} className="opacity-50" />
                                </div>
                            </div>
                        </div>
                        
                        {/* Percentage Text (Fades out when ready) */}
                        <div className={`absolute -bottom-8 text-xs font-mono text-stone-400 transition-opacity duration-300 ${phase === 'loading' ? 'opacity-100' : 'opacity-0'}`}>
                            {Math.floor(loadProgress)}%
                        </div>
                    </div>

                </div>
            )}

        </div>

        {/* Floating Continue Button (Question Phase Only) */}
        {/* FIX: Removed background completely to allow perfect blending via transparency. 
            The button now floats cleanly over the animated background. */}
        <div className={`fixed bottom-0 left-0 right-0 p-6 pb-8 z-50 transition-all duration-500 ease-out transform ${phase === 'question' ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
            <div className="max-w-lg mx-auto">
                <button
                    onClick={handleNextQuestion}
                    disabled={selectedOption === null}
                    className={`
                        w-full py-4 rounded-2xl font-bold text-lg tracking-wide shadow-lg transition-all duration-300 flex items-center justify-center gap-2
                        ${selectedOption !== null 
                            ? 'bg-stone-900 text-white hover:bg-stone-800 hover:scale-[1.01] active:scale-95' 
                            : 'bg-white/80 border-2 border-stone-100 text-stone-300 cursor-not-allowed backdrop-blur-sm'}
                    `}
                >
                    <span>{selectedOption !== null ? "继续 (Continue)" : "请选择一个选项"}</span>
                    {selectedOption !== null && <ArrowRight size={20} strokeWidth={3} className="animate-pulse-horizontal" />}
                </button>
            </div>
        </div>

      </div>

      {/* --- CSS ANIMATIONS & UTILS --- */}
      <style>{`
        @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .animate-gradient-shift {
            background-size: 300% 300%;
            animation: gradient-shift 20s ease infinite;
        }

        @keyframes float-particle {
            0% { transform: translateY(0) scale(var(--scale, 1)); opacity: 0; }
            20% { opacity: 0.4; }
            80% { opacity: 0.4; }
            100% { transform: translateY(-100vh) scale(var(--scale, 1)); opacity: 0; }
        }
        .animate-float-particle {
            animation-name: float-particle;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
        }
        
        .animate-card-enter {
            animation: cardEnter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes cardEnter {
            from { opacity: 0; transform: translateY(40px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .animate-enter-up {
            animation: enterUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes enterUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-pulse-horizontal {
            animation: pulseHorizontal 1s infinite;
        }
        @keyframes pulseHorizontal {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(3px); }
        }

        .animate-pulse-slow {
            animation: pulseSlow 3s infinite ease-in-out;
        }
        @keyframes pulseSlow {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
