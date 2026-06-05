
// ... existing imports ...
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BookOpen, Music, MessageCircle, Clock, Activity, Volume2, Ruler, LayoutGrid, Sparkles, Menu, X, ChevronRight, Hash, PauseCircle, Gauge, AlignCenterVertical, Disc, RefreshCw, Waves, Zap, Flower2, Wind, Hourglass, StopCircle, Layers, MoveRight, ChevronDown, Palette, MousePointerClick, ArrowUp, Music3, ArrowLeftRight, GitMerge, Calculator, SplitSquareHorizontal, Infinity, CloudFog, Ear, Route, Crown, Check, Lock, CreditCard, Ticket, Star, Zap as ZapIcon, Dices, FlipHorizontal, AudioWaveform, AlignVerticalSpaceAround, Network, Divide, Radar, Radio, Clock as ClockIcon, Eye, Grid, ListMusic, Mic2, Piano, Layout, Headphones, Coffee, User as UserIcon, LogIn, Upload, Camera, Trophy, Image as ImageIcon, ZoomIn, RotateCw, Move, Mail, Save, BadgeCheck, ShieldCheck, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// ... rest of imports ...
import Explanation from './components/Explanation';
import SlurVsTie from './components/SlurVsTie';
import TimeSignatureLesson from './components/TimeSignatureLesson';
import DynamicsLesson from './components/DynamicsLesson';
import IntervalsLesson from './components/IntervalsLesson';
import ChordsLesson from './components/ChordsLesson';
import ScalesLesson from './components/ScalesLesson';
import RestsLesson from './components/RestsLesson';
import TempoLesson from './components/TempoLesson';
import ClefsLesson from './components/ClefsLesson';
import KeySignaturesLesson from './components/KeySignaturesLesson';
import InversionsLesson from './components/InversionsLesson';
import ArpeggiosLesson from './components/ArpeggiosLesson';
import PolyrhythmsLesson from './components/PolyrhythmsLesson';
import OrnamentationLesson from './components/OrnamentationLesson';
import PedalingLesson from './components/PedalingLesson';
import RubatoLesson from './components/RubatoLesson';
import CadencesLesson from './components/CadencesLesson';
import SyncopationLesson from './components/SyncopationLesson';
import SeventhChordsLesson from './components/SeventhChordsLesson';
import AccidentalsLesson from './components/AccidentalsLesson';
import ArticulationsLesson from './components/ArticulationsLesson';
import ModesLesson from './components/ModesLesson';
import TripletsLesson from './components/TripletsLesson';
import EnharmonicsLesson from './components/EnharmonicsLesson';
import CounterpointLesson from './components/CounterpointLesson';
import TwelveToneLesson from './components/TwelveToneLesson';
import BitonalityLesson from './components/BitonalityLesson';
import MinimalismLesson from './components/MinimalismLesson';
import ImpressionismLesson from './components/ImpressionismLesson';
import ConsonanceLesson from './components/ConsonanceLesson';
import VoiceLeadingLesson from './components/VoiceLeadingLesson';
import JazzExtensionsLesson from './components/JazzExtensionsLesson';
import AleatoricLesson from './components/AleatoricLesson';
import NegativeHarmonyLesson from './components/NegativeHarmonyLesson';
import OvertoneSeriesLesson from './components/OvertoneSeriesLesson';
import QuartalHarmonyLesson from './components/QuartalHarmonyLesson';
import NeoRiemannianLesson from './components/NeoRiemannianLesson';
import MicrotonalityLesson from './components/MicrotonalityLesson';
import SpectralismLesson from './components/SpectralismLesson';
import PitchClassSetLesson from './components/PitchClassSetLesson';
import FormBinaryTernaryLesson from './components/FormBinaryTernaryLesson';
import FormSonataLesson from './components/FormSonataLesson';
import FormRondoLesson from './components/FormRondoLesson';
import JazzBasicsLesson from './components/JazzBasicsLesson';
import PopStylesLesson from './components/PopStylesLesson';
import SightReadingLesson from './components/SightReadingLesson';
import SymbolDictionary from './components/SymbolDictionary';
import AITutor from './components/AITutor';
import GenericLesson from './components/GenericLesson';
import SplashScreen from './components/SplashScreen';
import StartPage, { UserSettings, UserProfile, Achievement } from './components/StartPage'; 

const INITIAL_ACHIEVEMENTS: Achievement[] = [
    { id: 'first_lesson', title: '初入琴房', desc: '完成你的第 1 个课程', icon: '🎵', unlocked: false, progress: 0, maxProgress: 1 },
    { id: 'pro_member', title: '尊贵会员', desc: '成为 Pro 用户', icon: '👑', unlocked: false, progress: 0, maxProgress: 1 },
    { id: 'night_owl', title: '夜猫子', desc: '在晚上 10 点后学习', icon: '🌙', unlocked: false, progress: 0, maxProgress: 1 },
    { id: 'master', title: '理论大师', desc: '解锁所有高级课程', icon: '🎓', unlocked: false, progress: 0, maxProgress: 10 },
];

const AchievementToast: React.FC<{ achievement: Achievement | null, onClose: () => void }> = ({ achievement, onClose }) => {
    useEffect(() => {
        if (achievement) {
            const timer = setTimeout(onClose, 3500);
            return () => clearTimeout(timer);
        }
    }, [achievement, onClose]);

    return (
        <AnimatePresence>
            {achievement && (
                <motion.div 
                    initial={{ opacity: 0, y: -50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="fixed top-8 left-1/2 -translate-x-1/2 z-[150]"
                >
                    <div className="relative bg-white/95 backdrop-blur-xl text-stone-900 px-6 py-4 rounded-[2rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.2)] flex items-center gap-5 border border-stone-100 ring-1 ring-stone-900/5 min-w-[340px] max-w-[90vw] overflow-hidden">
                        
                        {/* Shine Animation */}
                        <div className="absolute inset-0 w-full h-full overflow-hidden rounded-[2rem] pointer-events-none">
                            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine" style={{ animationDuration: '1.5s' }}></div>
                        </div>

                        {/* Icon */}
                        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                            <div className="absolute inset-0 bg-amber-400 rounded-full opacity-20 animate-pulse-soft"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full shadow-inner border-2 border-white flex items-center justify-center text-2xl relative z-10">
                                {achievement.icon}
                            </div>
                            <div className="absolute -top-1 -right-1 text-amber-500 z-20 animate-bounce">
                                <Star size={14} fill="currentColor" />
                            </div>
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0 relative z-10">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Achievement Unlocked</span>
                            </div>
                            <div className="font-serif font-bold text-lg leading-tight truncate text-stone-900">
                                {achievement.title}
                            </div>
                            <div className="text-xs text-stone-500 truncate font-medium mt-0.5">
                                {achievement.desc}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Full-Screen Mandatory Authentication & Registration Experience with hyper-detailed animated interactions
const MandatoryAuthScreen: React.FC<{ onLogin: (profile: UserProfile) => void }> = ({ onLogin }) => {
    const [isLoginTab, setIsLoginTab] = useState(false); // Default to registration ("欢迎加入") for a magnificent onboarding welcome
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('🎹');
    const [customAvatar, setCustomAvatar] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Synthesis loading state
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [synthProgress, setSynthProgress] = useState(0);
    const [synthChecked, setSynthChecked] = useState(false);

    // Live typing music notes popping animation
    const [typingNotes, setTypingNotes] = useState<{ id: number; char: string; left: number; delay: number }[]>([]);
    const noteIdRef = useRef(0);

    const handleNameChange = (val: string) => {
        setName(val);
        // Spawn floating note character periodically when typing
        if (val.length > 0) {
            const chars = ['♪', '♫', '♩', '♬', '∮', '♭', '♯'];
            const randomChar = chars[Math.floor(Math.random() * chars.length)];
            const id = noteIdRef.current++;
            const newNote = {
                id,
                char: randomChar,
                left: Math.random() * 80 + 10, // random percentage bounds
                delay: Math.random() * 0.1
            };
            setTypingNotes(prev => [...prev, newNote]);
            // Auto clean up after animation finishes to prevent DOM bloat
            setTimeout(() => {
                setTypingNotes(prev => prev.filter(n => n.id !== id));
            }, 1200);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => { 
        setIsDragging(true); 
        dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y }; 
    };
    const handleMouseMove = (e: React.MouseEvent) => { 
        if (!isDragging) return; 
        setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y }); 
    };
    const handleMouseUp = () => setIsDragging(false);

    const defaultAvatars = ['🎹', '🎵', '🎼', '🎻', '🎷', '🎸', '🎺', '🥁', '👑', '🌟', '🕊️', '🦉'];
    
    // Synth audio engine for interactive tactile keys with rich grand piano string modeling
    const playPianoKeySound = (freq: number) => {
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;
            
            // Master dynamic volume envelope with natural physical piano decay profile
            const masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(0.0, now);
            masterGain.gain.linearRampToValueAtTime(0.24, now + 0.005); // immediate transient strike
            masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8); // elegant acoustic ringout
            
            // Lowpass resonance sweep for dynamic warmth and tone filtration
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1600, now);
            filter.frequency.exponentialRampToValueAtTime(380, now + 0.82);
            
            // Grand piano string overtone model utilizing multiple harmonic wave layers
            const partials = [
                { ratio: 1.0, gain: 0.75, decay: 1.0 },      // Fundamental string frequency (C4, etc)
                { ratio: 2.0016, gain: 0.38, decay: 0.65 },  // Octave overtone with slight natural inharmonic tuner stretch
                { ratio: 3.0035, gain: 0.18, decay: 0.44 },  // Fifth partial above octave
                { ratio: 4.0075, gain: 0.11, decay: 0.28 },  // Second octave partial
                { ratio: 5.0120, gain: 0.04, decay: 0.16 },  // Warm major third partial
            ];

            const oscillators: OscillatorNode[] = [];
            const partialGains: GainNode[] = [];

            partials.forEach(p => {
                const osc = ctx.createOscillator();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq * p.ratio, now);
                
                const pGain = ctx.createGain();
                pGain.gain.setValueAtTime(p.gain, now);
                pGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6 * p.decay);
                
                osc.connect(pGain);
                pGain.connect(filter);
                osc.start(now);
                oscillators.push(osc);
                partialGains.push(pGain);
            });

            // "Hammer Strike Transient": replicates the sharp percussion shock from a wooden hammer strike hitting metal strings
            const hammer = ctx.createOscillator();
            hammer.type = 'sine';
            hammer.frequency.setValueAtTime(freq * 6.33, now); // percussive tone
            
            const hammerGain = ctx.createGain();
            hammerGain.gain.setValueAtTime(0.35, now);
            hammerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025); // super-fast mechanical decay (25ms)
            
            hammer.connect(hammerGain);
            hammerGain.connect(filter);
            hammer.start(now);
            
            filter.connect(masterGain);
            masterGain.connect(ctx.destination);

            // Complete lifecycle cleanup
            const duration = 2000;
            setTimeout(() => {
                try {
                     oscillators.forEach(osc => { osc.stop(); osc.disconnect(); });
                     partialGains.forEach(g => g.disconnect());
                     hammer.stop();
                     hammer.disconnect();
                     hammerGain.disconnect();
                     filter.disconnect();
                     masterGain.disconnect();
                     ctx.close();
                } catch (err) {}
            }, duration);
        } catch(e){}
    };

    const pianoKeys = [
        { note: 'C4', freq: 261.63, label: 'C' },
        { note: 'D4', freq: 293.66, label: 'D' },
        { note: 'E4', freq: 329.63, label: 'E' },
        { note: 'F4', freq: 349.23, label: 'F' },
        { note: 'G4', freq: 392.00, label: 'G' },
        { note: 'A4', freq: 440.00, label: 'A' },
        { note: 'B4', freq: 493.88, label: 'B' }
    ];

    const getCroppedImage = () => { 
        if (!customAvatar) return selectedAvatar; 
        const canvas = document.createElement('canvas'); 
        const ctx = canvas.getContext('2d'); 
        const img = new Image(); 
        img.src = customAvatar; 
        canvas.width = 200; 
        canvas.height = 200; 
        if (ctx) { 
            ctx.fillStyle = '#1c1917'; // warm stone background
            ctx.fillRect(0, 0, 200, 200); 
            ctx.translate(100, 100); 
            ctx.translate(position.x, position.y); 
            ctx.rotate((rotation * Math.PI) / 180); 
            ctx.scale(zoom, zoom); 
            ctx.drawImage(img, -100, -100, 200, 200); 
            return canvas.toDataURL('image/jpeg'); 
        } 
        return customAvatar; 
    };
    
    const triggerSynthesisFlow = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !password.trim()) return;

        // Custom high-tech Synthesis loading animation
        setIsSynthesizing(true);
        setSynthProgress(0);
        setSynthChecked(false);

        // Sound effect sweep arpeggio
        playPianoKeySound(261.63); // C4
        setTimeout(() => playPianoKeySound(329.63), 150); // E4
        setTimeout(() => playPianoKeySound(392.00), 300); // G4
        setTimeout(() => playPianoKeySound(523.25), 450); // C5 harmonic sound check

        const interval = setInterval(() => {
            setSynthProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setSynthChecked(true);
                    
                    // Success pitch sequence
                    setTimeout(() => playPianoKeySound(783.99), 100); 
                    setTimeout(() => playPianoKeySound(1046.50), 250); 

                    setTimeout(() => {
                        const finalAvatar = customAvatar ? getCroppedImage() : selectedAvatar; 
                        onLogin({ 
                            name: name.trim(), 
                            avatar: finalAvatar, 
                            level: 'Level 1', 
                            isGuest: false, 
                            isCustomAvatar: !!customAvatar 
                        }); 
                    }, 800);
                    return 100;
                }
                return prev + Math.floor(Math.random() * 8) + 6;
            });
        }, 80);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
        const file = e.target.files?.[0]; 
        if (file) { 
            const reader = new FileReader(); 
            reader.onloadend = () => { 
                setCustomAvatar(reader.result as string); 
                setZoom(1); 
                setRotation(0); 
                setPosition({ x: 0, y: 0 }); 
            }; 
            reader.readAsDataURL(file); 
        } 
    };

    const installDemoUser = () => {
        // Play charming visual typewriter chord
        playPianoKeySound(329.63); 
        setTimeout(() => playPianoKeySound(392.00), 120);
        setTimeout(() => playPianoKeySound(440.00), 240);

        setName('');
        setPassword('');
        const demoName = 'Classic Mozart';
        const demoPass = 'sonatafacile';
        
        let idx = 0;
        const typeInterval = setInterval(() => {
            if (idx < demoName.length) {
                handleNameChange(demoName.substring(0, idx + 1));
                idx++;
            } else {
                clearInterval(typeInterval);
                setPassword(demoPass);
            }
        }, 60);
    };

    // Diagnostics message calculated from current progress percent
    const getSynthMessage = () => {
        if (synthProgress < 25) return '正在检索钢琴声学矩阵结构...';
        if (synthProgress < 75) return '正在建立高阶多重采样音符关联...';
        return '完美合成，正在载入键盘组件...';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950 px-4 overflow-hidden select-none">
            {/* Custom styles for typing notes animations to be clean and high performing */}
            <style>{`
                @keyframes floatUpNote {
                    0% { transform: translateY(0) scale(0.6) rotate(0deg); opacity: 0; }
                    20% { opacity: 0.9; }
                    100% { transform: translateY(-130px) scale(1.2) rotate(36deg); opacity: 0; }
                }
                .floating-typing-note {
                    animation: floatUpNote 1.2s cubic-bezier(0.21, 1.02, 0.43, 1.01) forwards;
                }
            `}</style>
            
            {/* Ambient Concert Hall Dark Lights Glowing */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-stone-500/10 blur-[150px] rounded-full pointer-events-none"></div>

            <motion.div 
                layout="position"
                transition={{ type: "spring", stiffness: 180, damping: 24 }}
                className="w-full max-w-xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 relative z-15 shadow-2xl overflow-hidden flex flex-col justify-between max-h-[96vh]"
            >
                
                {/* Upper Status Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-amber-400 p-1.5 rounded-lg text-stone-950 shadow-md">
                            <Piano size={16} />
                        </div>
                        <span className="font-serif font-black text-white text-sm tracking-widest uppercase">Piano Studio</span>
                    </div>
                    <button 
                        type="button"
                        onClick={installDemoUser}
                        className="text-[10px] uppercase font-mono tracking-widest font-bold bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1.5 rounded-xl transition-all duration-300"
                    >
                        ⚡ 极速体验 Demo
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {isSynthesizing ? (
                        /* Cinematic Profile Synthesis Screen */
                        <motion.div 
                            key="loader"
                            initial={{ opacity: 0, scale: 0.92, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                            className="flex-1 flex flex-col items-center justify-center py-10 text-center"
                        >
                            <div className="relative w-36 h-36 mb-6 flex items-center justify-center">
                                {/* Double Orbit Ring Scanner */}
                                <div className="absolute inset-0 rounded-full border-4 border-dashed border-white/5 animate-[spin_12s_linear_infinite]" />
                                <div className="absolute inset-2 rounded-full border-2 border-dashed border-amber-400/30 animate-[spin_6s_linear_infinite_reverse]" />
                                
                                {/* Dynamic Scanning bar */}
                                <div className="absolute inset-0 rounded-full border-t-4 border-amber-400/80 animate-[spin_1.5s_linear_infinite]" />

                                <div className="z-10 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-mono font-black text-white">{synthProgress}%</span>
                                    <span className="text-[9px] text-stone-400 font-mono tracking-widest uppercase mt-1">Matrix Calc</span>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {synthChecked ? (
                                    <motion.div 
                                        key="success-prompt"
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className="flex flex-col items-center gap-2"
                                    >
                                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-stone-950 shadow-lg mb-2">
                                            <Check size={20} strokeWidth={3} />
                                        </div>
                                        <h3 className="text-lg font-bold text-white font-serif">配置完毕，欢迎演奏！</h3>
                                        <p className="text-xs text-emerald-400 font-mono">SYNTHESIS SUCCESSFUL</p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key={synthProgress}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="h-10 text-xs text-amber-300/80 font-mono tracking-wide max-w-sm"
                                    >
                                        {getSynthMessage()}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        /* Beautiful Login/Onboarding Form Screen */
                        <motion.div 
                            key="auth-form"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                            className="flex-1 flex flex-col overflow-y-auto pr-1 select-none"
                        >
                            {/* Title block with elegant slide transitions */}
                            <div className="mb-6 relative min-h-[76px] flex flex-col justify-center">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={isLoginTab ? 'login-header' : 'register-header'}
                                        initial={{ opacity: 0, y: -12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 12 }}
                                        transition={{ duration: 0.25, ease: "easeInOut" }}
                                    >
                                        <h1 className="text-2xl md:text-3xl font-serif font-black text-stone-55 tracking-tight leading-none">
                                            {isLoginTab ? '音律快捷登录' : '创建音乐档案'}
                                        </h1>
                                        <p className="text-xs text-stone-400 font-medium tracking-wide mt-2">
                                            {isLoginTab ? '琴键跃动，唤醒专属于您的钢琴理论伴侣' : '设置个性化音乐属性，开启一段充满仪式感的钢琴探索之旅'}
                                        </p>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Deluxe Sliding Tab Control */}
                            <div className="relative bg-stone-900 border border-white/10 rounded-2xl p-1 mb-6 flex h-12 items-center">
                                <button 
                                    type="button"
                                    onClick={() => { setIsLoginTab(false); playPianoKeySound(261.63); }}
                                    className={`relative flex-1 py-2.5 text-center text-xs font-bold transition-all duration-300 h-full flex items-center justify-center rounded-xl z-10 ${!isLoginTab ? 'text-white font-black' : 'text-stone-400 hover:text-white'}`}
                                >
                                    {!isLoginTab && (
                                        <motion.div 
                                            layoutId="activeTabGlow"
                                            className="absolute inset-0 bg-white/[0.08] border border-white/10 rounded-xl z-0"
                                            transition={{ type: "spring", stiffness: 300, damping: 26 }}
                                        />
                                    )}
                                    <span className="relative z-10">🎵 注册新音乐档案</span>
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => { setIsLoginTab(true); playPianoKeySound(392.00); }}
                                    className={`relative flex-1 py-2.5 text-center text-xs font-bold transition-all duration-300 h-full flex items-center justify-center rounded-xl z-10 ${isLoginTab ? 'text-white font-black' : 'text-stone-400 hover:text-white'}`}
                                >
                                    {isLoginTab && (
                                        <motion.div 
                                            layoutId="activeTabGlow"
                                            className="absolute inset-0 bg-white/[0.08] border border-white/10 rounded-xl z-0"
                                            transition={{ type: "spring", stiffness: 300, damping: 26 }}
                                        />
                                    )}
                                    <span className="relative z-10">🔑 成员快捷登录</span>
                                </button>
                            </div>

                            <form onSubmit={triggerSynthesisFlow} className="space-y-4">
                                {/* Name Input Container with relative popping notes animation */}
                                <div className="relative">
                                    <label className="block text-[10px] font-bold text-stone-300 uppercase tracking-widest mb-1.5 ml-1 font-mono">昵称 / Identifier</label>
                                    <div className="relative overflow-visible">
                                        {/* Typing notes spawning sandbox */}
                                        <div className="absolute inset-x-0 -top-8 h-8 pointer-events-none overflow-visible">
                                            {typingNotes.map(n => (
                                                <span 
                                                    key={n.id}
                                                    className="absolute floating-typing-note text-amber-300 text-sm font-bold opacity-0"
                                                    style={{ left: `${n.left}%`, animationDelay: `${n.delay}s` }}
                                                >
                                                    {n.char}
                                                </span>
                                            ))}
                                        </div>
                                        <input 
                                            type="text" 
                                            value={name} 
                                            onChange={e => handleNameChange(e.target.value)} 
                                            placeholder={isLoginTab ? "输入音乐档案大名" : "例如: 肖邦小传人"} 
                                            className="w-full bg-stone-900/50 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm font-black text-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-stone-900 transition-all font-serif" 
                                            required
                                            autoFocus 
                                        />
                                        <UserIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                                    </div>
                                </div>

                                {/* Password Input with hide/show toggle */}
                                <div className="relative">
                                    <label className="block text-[10px] font-bold text-stone-300 uppercase tracking-widest mb-1.5 ml-1 font-mono">密匙 / Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            value={password} 
                                            onChange={e => setPassword(e.target.value)} 
                                            placeholder="输入登录安全密码" 
                                            className="w-full bg-stone-900/50 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm font-bold text-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-stone-900 transition-all" 
                                            required
                                        />
                                        <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white transition-colors"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Intelligent, super smooth slider transition for Avatar list */}
                                <AnimatePresence initial={false}>
                                    {!isLoginTab && (
                                        <motion.div 
                                            key="avatar-section-wrapper"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ 
                                                opacity: 1, 
                                                height: "auto",
                                                transition: {
                                                    height: { type: "spring", stiffness: 220, damping: 25 },
                                                    opacity: { duration: 0.25, delay: 0.05 }
                                                }
                                            }}
                                            exit={{ 
                                                opacity: 0, 
                                                height: 0,
                                                transition: {
                                                    height: { type: "spring", stiffness: 220, damping: 25 },
                                                    opacity: { duration: 0.15 }
                                                }
                                            }}
                                            className="pt-2 overflow-hidden"
                                        >
                                            <span className="block text-[10px] font-bold text-stone-300 uppercase tracking-widest mb-2 ml-1 text-center font-mono">自定义声学档案头像 Avatar</span>
                                            
                                            <AnimatePresence mode="wait">
                                                {customAvatar ? (
                                                    <motion.div 
                                                        key="cropper-editor"
                                                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                                        transition={{ duration: 0.22 }}
                                                        className="flex flex-col items-center bg-stone-900/30 p-3 rounded-2xl border border-white/5"
                                                    >
                                                        <div 
                                                            className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-amber-400/50 shadow-inner cursor-move bg-stone-800"
                                                            onMouseDown={handleMouseDown} 
                                                            onMouseMove={handleMouseMove} 
                                                            onMouseUp={handleMouseUp} 
                                                            onMouseLeave={handleMouseUp}
                                                        >
                                                            <img 
                                                                src={customAvatar} 
                                                                alt="Custom Avatar Preview" 
                                                                className="w-full h-full object-cover origin-center pointer-events-none" 
                                                                style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)` }} 
                                                            />
                                                        </div>
                                                        <div className="w-full mt-3 space-y-2 text-stone-300">
                                                            <div className="flex items-center gap-2">
                                                                <ZoomIn size={12} className="text-stone-400 shrink-0" />
                                                                <input 
                                                                    type="range" 
                                                                    min="0.5" 
                                                                    max="3" 
                                                                    step="0.1" 
                                                                    value={zoom} 
                                                                    onChange={e => setZoom(parseFloat(e.target.value))} 
                                                                    className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400" 
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <RotateCw size={12} className="text-stone-400 shrink-0" />
                                                                <input 
                                                                    type="range" 
                                                                    min="-180" 
                                                                    max="180" 
                                                                    step="5" 
                                                                    value={rotation} 
                                                                    onChange={e => setRotation(parseFloat(e.target.value))} 
                                                                    className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400" 
                                                                />
                                                            </div>
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => fileInputRef.current?.click()} 
                                                            className="text-[10px] text-amber-300 hover:underline mt-2 font-mono font-bold tracking-wider"
                                                        >
                                                            更换照片 CHANGE IMAGE
                                                        </button>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div 
                                                        key="emoji-and-upload-grid"
                                                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                                        transition={{ duration: 0.22 }}
                                                    >
                                                        <div className="flex justify-center gap-2 flex-wrap mb-3.5">
                                                            {defaultAvatars.map(emoji => (
                                                                <button 
                                                                    key={emoji} 
                                                                    type="button" 
                                                                    onClick={() => { setSelectedAvatar(emoji); playPianoKeySound(349.23); }} 
                                                                    className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${selectedAvatar === emoji ? 'bg-amber-400 text-stone-950 shadow-md scale-110 font-bold border-2 border-stone-50' : 'bg-white/5 hover:bg-white/15 text-stone-300'}`}
                                                                >
                                                                    {emoji}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <div className="flex justify-center">
                                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                                            <button 
                                                                type="button" 
                                                                onClick={() => fileInputRef.current?.click()} 
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] uppercase font-mono font-bold border border-dashed border-white/20 text-stone-400 hover:border-amber-400 hover:text-white hover:bg-white/5 transition-all"
                                                            >
                                                                <Camera size={12} /> <span>上传自定义头像 / Upload Avatar</span>
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Submit button with animated label text */}
                                <div className="pt-2 relative">
                                    <button 
                                        type="submit" 
                                        disabled={!name.trim() || !password.trim()} 
                                        className="w-full py-3.5 bg-amber-400 disabled:bg-stone-800 disabled:text-stone-500 font-serif font-black text-stone-950 rounded-xl relative overflow-hidden shadow-lg shadow-amber-400/10 hover:shadow-amber-400/30 hover:scale-[1.01] active:scale-95 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed group"
                                    >
                                        <LogIn size={15} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
                                        <div className="relative h-5 overflow-hidden flex items-center justify-center">
                                            <AnimatePresence mode="wait">
                                                <motion.span
                                                    key={isLoginTab ? 'btn-login' : 'btn-register'}
                                                    initial={{ opacity: 0, y: -6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 6 }}
                                                    transition={{ duration: 0.18, ease: "easeInOut" }}
                                                    className="whitespace-nowrap"
                                                >
                                                    {isLoginTab ? '快捷登录进入 Studio' : '音律同步，配置专属档案'}
                                                </motion.span>
                                            </AnimatePresence>
                                        </div>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom Interactive Piano keyboard for beautiful micro animations & acoustic awareness */}
                <div className="mt-6 border-t border-white/10 pt-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] text-stone-400 font-mono tracking-widest uppercase">🎼 实感和弦试音 (Hover & Tap to Play)</span>
                        <span className="text-[8px] bg-white/5 text-stone-400 font-mono border border-white/5 px-2 py-0.5 rounded-md">Sine Oscillator Synth</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 h-12">
                        {pianoKeys.map(k => (
                            <button
                                key={k.note}
                                type="button"
                                onMouseEnter={() => playPianoKeySound(k.freq)}
                                onClick={() => playPianoKeySound(k.freq)}
                                className="group/key bg-white hover:bg-stone-100 rounded-b-lg flex flex-col justify-end items-center pb-1 shadow-inner relative transition-all active:h-11 active:pb-0.5"
                            >
                                <span className="text-[10px] font-black text-stone-800 font-mono scale-90 group-hover/key:scale-110 group-hover/key:text-amber-500 transition-all">{k.label}</span>
                                <div className="absolute top-0 inset-x-0 h-1 bg-stone-300 group-hover/key:bg-amber-400 rounded-b" />
                            </button>
                        ))}
                    </div>
                </div>

            </motion.div>
        </div>
    );
};

interface SubscriptionModalProps { 
    isOpen: boolean; 
    onClose: () => void; 
    onSuccess: (plan: 'monthly' | 'yearly') => void; 
    themeColor: string; 
    customColor?: string; 
}

// Extracted PremiumCard Component to prevent re-renders
const PremiumCard: React.FC<{ selectedPlan: 'monthly' | 'yearly' }> = ({ selectedPlan }) => (
    <div className="relative group perspective-[1000px]">
        <div className="w-64 h-40 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 rounded-2xl shadow-2xl relative overflow-hidden transform transition-all duration-[1200ms] animate-card-entrance border border-white/10 flex flex-col justify-between p-5">
            {/* Shine Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-40 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-[150%] animate-shine-slow"></div>
            {/* Texture */}
            <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, #fbbf24 0%, transparent 40%), url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.2\'/%3E%3C/svg%3E")' }}></div>
            {/* Content */}
            <div className="flex justify-between items-start z-10">
                <div className="flex items-center gap-2 text-amber-400">
                    <div className="p-1 bg-amber-400/20 rounded backdrop-blur-sm"><Crown size={14} fill="currentColor"/></div>
                    <span className="font-bold text-[10px] tracking-[0.2em] uppercase">Pro Member</span>
                </div>
                <div className="text-white/20 font-mono text-[9px]">ID: 888888</div>
            </div>
            <div className="z-10 relative">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl"></div>
                <div className="text-lg font-serif font-bold text-white mb-0.5">Piano Theory</div>
                <div className="text-amber-400/80 text-[9px] font-medium tracking-wide uppercase flex items-center gap-1">
                    <Sparkles size={8} /> {selectedPlan === 'yearly' ? 'Yearly Access' : 'Monthly Access'}
                </div>
            </div>
        </div>
        {/* Glow behind card */}
        <div className="absolute -inset-2 bg-amber-500/30 blur-xl -z-10 rounded-full animate-pulse-slow opacity-60"></div>
    </div>
);

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSuccess, themeColor, customColor }) => { 
    const [inviteCode, setInviteCode] = useState(''); 
    const [error, setError] = useState(''); 
    const [isSuccess, setIsSuccess] = useState(false); 
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly'); 

    // Generate random particles for success effect
    const particles = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100 + 10,
        size: Math.random() * 6 + 3,
        duration: Math.random() * 1.5 + 1.5,
        delay: Math.random() * 0.5,
        type: Math.random() > 0.6 ? 'circle' : (Math.random() > 0.5 ? 'square' : 'star'),
        color: ['#fbbf24', '#f59e0b', '#d97706', '#ffffff'][Math.floor(Math.random() * 4)]
    })), []);

    useEffect(() => { 
        if (isOpen) { 
            setInviteCode(''); 
            setError(''); 
            setIsSuccess(false); 
        }
    }, [isOpen]); 

    const handleSuccess = () => {
        setIsSuccess(true);
        setTimeout(() => onSuccess(selectedPlan), 1500);
    };

    const handleVerify = () => { 
        if (inviteCode === '8888') { 
            handleSuccess();
        } else { 
            setError('无效的邀请码。请重试。'); 
        } 
    }; 

    const handlePurchase = () => { 
        handleSuccess();
    }; 

    return ( 
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4"> 
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
                    />
                    <style>{`
                        @keyframes floatUpParticle {
                            0% { transform: translateY(0) rotate(0deg) scale(0); opacity: 0; }
                            20% { opacity: 1; transform: translateY(-20px) rotate(45deg) scale(1); }
                            100% { transform: translateY(-150px) rotate(180deg) scale(0); opacity: 0; }
                        }
                        .animate-float-up-particle { animation: floatUpParticle ease-out forwards; }
                    `}</style>

                    <motion.div 
                        layout
                        initial={{ scale: 0.9, opacity: 0, y: 50, rotateX: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 50, rotateX: 10 }}
                        transition={{ 
                            layout: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.3 }
                        }}
                        className={`
                            bg-white shadow-2xl relative overflow-hidden flex
                            ${isSuccess ? 'w-[360px] h-[500px] rounded-[2.5rem]' : 'w-[800px] h-[520px] rounded-[2rem]'}
                        `}
                    > 
                        <button onClick={onClose} className={`absolute top-5 right-5 p-2 rounded-full z-50 transition-colors ${isSuccess ? 'text-white/30 hover:bg-white/10' : 'text-stone-400 hover:bg-stone-100'}`}><X size={20} /></button>

                        {/* LEFT PANEL */}
                        <motion.div 
                            layout="position"
                            className={`relative bg-stone-900 text-white overflow-hidden flex-shrink-0 ${isSuccess ? 'w-0' : 'w-[38%]'}`}
                            style={{ opacity: isSuccess ? 0 : 1 }}
                        >
                            <div className={`w-[300px] h-full flex flex-col p-8 relative`}> {/* Fixed width container */}
                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fbbf24 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-amber-500/20 rounded-full blur-[60px]"></div>
                                
                                <div className="relative z-10 flex-1 flex flex-col justify-center">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 w-fit mb-6 text-[10px] font-bold uppercase tracking-wider text-amber-400 shadow-sm">
                                        <Sparkles size={10} fill="currentColor" /> Pro Access
                                    </div>
                                    <h2 className="text-3xl font-serif font-bold mb-4 leading-tight">Unlock <br/><span className="text-amber-400">Mastery</span></h2>
                                    <div className="space-y-4 mb-8"> 
                                        {["全套高级乐理课程","AI 智能助教无限对话","高清图谱与音频示例","专属 Pro 身份徽章"].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm font-medium text-stone-300"> 
                                                <div className="w-5 h-5 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-500 shrink-0"><Check size={10} strokeWidth={4} /></div> 
                                                <span>{item}</span> 
                                            </div> 
                                        ))}
                                    </div>
                                    <div className="mt-auto pt-6 border-t border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-stone-700 border-2 border-stone-900 flex items-center justify-center"><UserIcon size={12} className="text-stone-500"/></div>)}
                                            </div>
                                            <div className="text-[10px] text-stone-400 leading-tight">
                                                <strong className="text-white block">10,000+ 学员</strong> 已加入 Pro 计划
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* RIGHT PANEL */}
                        <motion.div 
                            layout="position"
                            className={`relative flex-1 flex flex-col ${isSuccess ? 'bg-stone-950' : 'bg-white'}`}
                        >
                            {!isSuccess ? ( 
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    exit={{ opacity: 0 }}
                                    className="flex-1 p-8 flex flex-col h-full relative"
                                > 
                                    <h3 className="text-xl font-bold text-stone-900 mb-6 font-serif flex items-center gap-2">选择订阅计划 <span className="text-xs bg-stone-100 text-stone-500 px-2 py-1 rounded-md font-sans font-normal ml-auto">限时特惠</span></h3>
                                    <div className="space-y-3 mb-auto"> 
                                        <button onClick={() => setSelectedPlan('yearly')} className={`w-full p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden group ${selectedPlan === 'yearly' ? 'border-stone-900 bg-stone-50 shadow-md' : 'border-stone-100 hover:border-stone-300 hover:bg-stone-50'}`}> 
                                            {selectedPlan === 'yearly' && <div className="absolute top-0 right-0 w-16 h-16 bg-stone-900 rotate-45 transform translate-x-8 -translate-y-8 z-10"><Check size={14} className="text-white absolute bottom-1 left-6 -rotate-45" strokeWidth={4}/></div>}
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="font-bold text-stone-900 text-base">年度会员</div>
                                                <div className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded">省 35%</div>
                                            </div>
                                            <div className="flex items-end gap-1">
                                                <span className="text-2xl font-bold text-stone-900">¥228</span>
                                                <span className="text-xs text-stone-400 mb-1 line-through">¥348</span>
                                                <span className="text-xs text-stone-500 mb-1 ml-auto">¥19.00 / 月</span>
                                            </div>
                                        </button> 
                                        <button onClick={() => setSelectedPlan('monthly')} className={`w-full p-4 rounded-xl border-2 text-left transition-all relative group ${selectedPlan === 'monthly' ? 'border-stone-900 bg-stone-50 shadow-md' : 'border-stone-100 hover:border-stone-300 hover:bg-stone-50'}`}> 
                                            <div className="flex justify-between items-center mb-1"><div className="font-bold text-stone-900 text-base">月度会员</div></div>
                                            <div className="flex items-end gap-1">
                                                <span className="text-2xl font-bold text-stone-900">¥29</span>
                                                <span className="text-xs text-stone-500 mb-1 ml-auto">灵活订阅，随时取消</span>
                                            </div>
                                        </button> 
                                    </div> 
                                    <div className="mt-6 space-y-4"> 
                                        <div className="relative">
                                            <input type="text" value={inviteCode} onChange={(e) => { setInviteCode(e.target.value); setError(''); }} placeholder="输入兑换代码..." className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all font-mono uppercase placeholder-stone-400" /> 
                                            <button onClick={handleVerify} disabled={!inviteCode} className="absolute right-2 top-2 bottom-2 px-3 bg-white border border-stone-200 rounded-lg text-xs font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-50 transition-colors">兑换</button>
                                        </div>
                                        {error && <p className="text-red-500 text-xs font-bold animate-pulse px-1">{error}</p>} 
                                        <button onClick={handlePurchase} className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold text-base shadow-xl hover:bg-stone-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"> 
                                            <CreditCard size={18} className="text-amber-400 group-hover:rotate-12 transition-transform"/> 立即开通
                                        </button> 
                                        <div className="flex items-center justify-center gap-4 text-[10px] text-stone-400 font-medium">
                                            <span className="flex items-center gap-1"><ShieldCheck size={12}/> SSL 安全支付</span>
                                            <span className="flex items-center gap-1"><RefreshCw size={12}/> 7天无理由退款</span>
                                        </div>
                                    </div> 
                                </motion.div> 
                            ) : ( 
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    className="flex-1 flex flex-col items-center justify-center relative w-full h-full overflow-hidden p-6"
                                > 
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-800 via-stone-950 to-black opacity-80"></div>
                                    {particles.map((p) => (
                                        <div key={p.id} className={`absolute animate-float-up-particle opacity-0 ${p.type === 'circle' ? 'rounded-full' : (p.type === 'square' ? 'rounded-none' : 'clip-path-star')}`} style={{ left: `${p.x}%`, width: p.size, height: p.size, backgroundColor: p.color, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s`, top: '100%', clipPath: p.type === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : undefined }}></div>
                                    ))}
                                    <div className="relative z-10 flex flex-col items-center w-full">
                                        <div className="mb-8 scale-110"><PremiumCard selectedPlan={selectedPlan} /></div>
                                        <div className="text-center space-y-2 animate-slideUpFade" style={{ animationDelay: '0.6s' }}>
                                            <h2 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400">Welcome Aboard</h2>
                                            <p className="text-stone-400 text-xs font-medium">所有特权已激活，尽情享受吧。</p>
                                        </div>
                                        <button onClick={onClose} className="mt-8 bg-white text-stone-900 px-8 py-3 rounded-full font-bold shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group animate-slideUpFade text-sm" style={{ animationDelay: '0.8s' }}> 
                                            <span>进入 Pro 空间</span> <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /> 
                                        </button> 
                                    </div>
                                </motion.div> 
                            )} 
                        </motion.div> 
                    </motion.div> 
                </div> 
            )}
        </AnimatePresence>
    ); 
};

// ... (LogoutOverlay Component added here)
const LogoutOverlay = () => (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-stone-950 flex flex-col items-center justify-center"
    >
        <div className="relative">
            <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full animate-pulse-slow"></div>
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 bg-stone-900 border border-stone-800 rounded-[2rem] flex items-center justify-center shadow-2xl relative z-10 mb-8"
            >
                <Music size={40} className="text-amber-500" />
            </motion.div>
        </div>
        <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-serif text-white font-bold mb-2"
        >
            Goodbye
        </motion.h2>
        <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-stone-500"
        >
            期待您的下一次练习
        </motion.p>
        <div className="mt-8 w-48 h-1 bg-stone-900 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-full bg-amber-500"
            />
        </div>
    </motion.div>
);

// Welcome Overlay for Login
const WelcomeOverlay: React.FC<{ user: UserProfile | null }> = ({ user }) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 opacity-50"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center p-8">
                {/* Avatar with Glow */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-amber-400 rounded-full blur-xl opacity-30 animate-pulse-slow"></div>
                    <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", duration: 0.6 }}
                        className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-stone-100 flex items-center justify-center text-5xl relative z-10"
                    >
                        {user?.isCustomAvatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            user?.avatar || <UserIcon size={48} className="text-stone-400" />
                        )}
                    </motion.div>
                </div>

                <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-3"
                >
                    Welcome, <span className="text-amber-600">{user?.name}</span>
                </motion.h2>
                <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-stone-500 font-medium tracking-wide"
                >
                    正在为你准备专属课程...
                </motion.p>

                {/* Loading Indicator */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 w-16 h-16 relative flex items-center justify-center"
                >
                    <div className="absolute inset-0 border-4 border-stone-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
                </motion.div>
            </div>
        </motion.div>
    );
};

enum Tab {
  LESSON = 'lesson',
  TUTOR = 'tutor',
  DICTIONARY = 'dictionary'
}

enum LessonTopic {
  HOME = 'home', 
  CLEFS = 'clefs', ACCIDENTALS = 'accidentals', RESTS = 'rests', RHYTHM = 'rhythm', TRIPLETS = 'triplets', SYNCOPATION = 'syncopation', POLYRHYTHMS = 'polyrhythms', SIGHT_READING = 'sight_reading', 
  INTERVALS = 'intervals', CONSONANCE = 'consonance', SCALES = 'scales', KEY_SIGNATURES = 'key_signatures', ENHARMONICS = 'enharmonics', MODES = 'modes', EAR_TRAINING = 'ear_training', 
  TEMPO = 'tempo', DYNAMICS = 'dynamics', SLUR = 'slur', ARTICULATIONS = 'articulations', PEDALING = 'pedaling', RUBATO = 'rubato', ORNAMENTATION = 'ornamentation',
  CHORDS = 'chords', INVERSIONS = 'inversions', ARPEGGIOS = 'arpeggios', SEVENTH_CHORDS = 'seventh_chords', VOICE_LEADING = 'voice_leading', CADENCES = 'cadences', COUNTERPOINT = 'counterpoint',
  FORM_BINARY_TERNARY = 'form_binary_ternary', FORM_SONATA = 'form_sonata', FORM_RONDO = 'form_rondo',
  STYLE_JAZZ_BASIC = 'style_jazz_basic', STYLE_POP = 'style_pop', JAZZ_EXTENSIONS = 'jazz_extensions',
  IMPRESSIONISM = 'impressionism', TWELVE_TONE = 'twelve_tone', PITCH_CLASS_SETS = 'pitch_class_sets', MICROTONALITY = 'microtonality', SPECTRALISM = 'spectralism', MINIMALISM = 'minimalism', BITONALITY = 'bitonality', ALEATORIC = 'aleatoric', NEGATIVE_HARMONY = 'negative_harmony', NEO_RIEMANNIAN = 'neo_riemannian', QUARTAL_HARMONY = 'quartal_harmony', OVERTONE_SERIES = 'overtone_series',
}

const BackgroundParticles: React.FC<{ style?: 'notes' | 'stars' | 'sakura' | 'bubbles' }> = ({ style = 'notes' }) => {
  const particles = useMemo(() => {
    const symbolsMap = {
      notes: ['♪', '♫', '♩', '♭', '♯', '𝄞', '𝄢', '𝄡'],
      stars: ['★', '☆', '✦', '✧', '✨', '✵', '✷'],
      sakura: ['🌸', '💮', '✿', '❀', '🍃', '🏵️'],
      bubbles: ['🫧', '◌', '⚬', '⚪', '🫧']
    };
    const symbols = symbolsMap[style] || symbolsMap.notes;
    const count = 22; // Increased count for richer visual depth
    
    return Array.from({ length: count }).map((_, i) => {
      const leftRandom = Math.random() * 105 - 5; // allow slightly out of bounds starting
      const topRandom = Math.random() * 105 - 5;
      const delay = Math.random() * 20;
      const duration = style === 'stars' ? 8 + Math.random() * 10 : 12 + Math.random() * 16;
      const size = style === 'sakura' || style === 'bubbles' ? 16 + Math.random() * 18 : 12 + Math.random() * 24;
      
      return {
        id: i,
        left: leftRandom,
        top: topRandom,
        delay,
        duration,
        size,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        rotationSpeed: 5 + Math.random() * 15,
        driftWidth: 20 + Math.random() * 40
      };
    });
  }, [style]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {particles.map((p) => {
        let textClass = "";
        let inlineStyle: React.CSSProperties = {
          position: 'absolute',
          fontSize: `${p.size}px`,
          animationDelay: `-${p.delay}s`,
          animationDuration: `${p.duration}s`,
          animationIterationCount: 'infinite',
          animationTimingFunction: style === 'stars' ? 'ease-in-out' : 'linear',
          transformOrigin: 'center',
          willChange: 'transform, opacity',
        };

        if (style === 'notes') {
          textClass = "text-amber-800/25 md:text-amber-800/20 font-serif";
          inlineStyle.left = `${p.left}%`;
          inlineStyle.top = '105%';
          inlineStyle.animationName = 'floatUpNotes';
        } else if (style === 'stars') {
          // Stars are scattered around and twinkle in place or drift micro amounts
          textClass = "text-amber-500/40 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]";
          inlineStyle.left = `${p.left}%`;
          inlineStyle.top = `${p.top}%`;
          inlineStyle.animationName = 'twinkleStars';
        } else if (style === 'sakura') {
          textClass = "text-rose-400/55 drop-shadow-[0_2px_4px_rgba(244,63,94,0.3)] animate-bounce-gentle";
          inlineStyle.left = `${p.left - 20}%`; // start off-screen left to drift right
          inlineStyle.top = '-10%';
          inlineStyle.animationName = 'fallSakura';
        } else if (style === 'bubbles') {
          textClass = "text-sky-400/50 drop-shadow-[0_2px_6px_rgba(56,189,248,0.45)]";
          inlineStyle.left = `${p.left}%`;
          inlineStyle.top = '105%';
          inlineStyle.animationName = 'riseBubbles';
        }

        return (
          <div
            key={p.id}
            className={`${textClass} transition-colors duration-1000`}
            style={inlineStyle}
          >
            {p.symbol}
          </div>
        );
      })}
      <style>{`
        @keyframes floatUpNotes {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-115vh) translateX(40px) rotate(270deg); opacity: 0; }
        }
        @keyframes twinkleStars {
          0%, 100% { opacity: 0.15; transform: scale(0.7) rotate(0deg); }
          50% { opacity: 0.75; transform: scale(1.2) rotate(180deg); }
        }
        @keyframes fallSakura {
          0% { transform: translate(0, 0) rotate(0deg) scale(0.8); opacity: 0; }
          15% { opacity: 0.75; }
          85% { opacity: 0.45; }
          100% { transform: translate(60vw, 115vh) rotate(540deg) scale(1.1); opacity: 0; }
        }
        @keyframes riseBubbles {
          0% { transform: translateY(0) translateX(0) scale(0.8); opacity: 0; }
          12% { opacity: 0.65; }
          50% { transform: translateY(-50vh) translateX(25px) scale(1.1); opacity: 0.75; }
          88% { opacity: 0.4; }
          100% { transform: translateY(-115vh) translateX(-15px) scale(0.9); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const useAmbience = (settings: UserSettings) => {
    const type = settings.ambience;
    const volume = settings.volume;
    const rainIntensity = settings.rainIntensity ?? 50;
    const binauralBeats = settings.binauralBeats ?? false;
    const cafeChatter = settings.cafeChatter ?? false;

    const audioCtxRef = useRef<AudioContext | null>(null);
    const nodesRef = useRef<any[]>([]);
    const chatterIntervalRef = useRef<any>(null);
    
    useEffect(() => {
        if (type === 'off' || volume === 0) {
            stopAmbience();
            return;
        }

        const init = async () => {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const ctx = audioCtxRef.current;
            if (ctx?.state === 'suspended') await ctx.resume();
            
            stopAmbience(); 

            const gainNode = ctx!.createGain();
            gainNode.gain.value = (volume / 100) * 0.15; // Adjusted calibration 
            gainNode.connect(ctx!.destination);

            if (type === 'white' || type === 'rain') {
                const bufferSize = 2 * ctx!.sampleRate;
                const buffer = ctx!.createBuffer(1, bufferSize, ctx!.sampleRate);
                const output = buffer.getChannelData(0);
                let lastOut = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    output[i] = (lastOut + (0.02 * white)) / 1.02; 
                    lastOut = output[i];
                    output[i] *= 3.5; 
                }
                const noise = ctx!.createBufferSource();
                noise.buffer = buffer;
                noise.loop = true;
                
                const filter = ctx!.createBiquadFilter();
                filter.type = 'lowpass';
                // Rain intensity adjusts lowpass frequency: from 150Hz to 1200Hz
                filter.frequency.value = type === 'rain' ? (150 + (rainIntensity * 10)) : 1000;
                
                noise.connect(filter);
                filter.connect(gainNode);
                noise.start();
                nodesRef.current.push(noise, filter);
            } 
            else if (type === 'cafe') {
                const bufferSize = 2 * ctx!.sampleRate;
                const buffer = ctx!.createBuffer(1, bufferSize, ctx!.sampleRate);
                const output = buffer.getChannelData(0);
                let lastOut = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    output[i] = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = output[i];
                    output[i] *= 3.5; 
                }
                const noise = ctx!.createBufferSource();
                noise.buffer = buffer;
                noise.loop = true;
                
                const filter = ctx!.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 1500; 
                
                noise.connect(filter);
                filter.connect(gainNode);
                noise.start();
                nodesRef.current.push(noise, filter);

                if (cafeChatter) {
                    const chatterInterval = setInterval(() => {
                        try {
                            if (!ctx || ctx.state === 'suspended') return;
                            const osc = ctx.createOscillator();
                            const gain = ctx.createGain();
                            osc.type = 'sine';
                            osc.frequency.value = 800 + Math.random() * 1200; // high bell tone
                            gain.gain.setValueAtTime(0, ctx.currentTime);
                            gain.gain.linearRampToValueAtTime(0.012 * (volume / 100), ctx.currentTime + 0.01);
                            gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.8 + Math.random() * 0.4);
                            
                            osc.connect(gain);
                            gain.connect(ctx.destination);
                            osc.start();
                            
                            setTimeout(() => {
                                try { osc.stop(); osc.disconnect(); gain.disconnect(); } catch(e){}
                            }, 1500);
                        } catch(e) {}
                    }, 4000 + Math.random() * 5000);
                    chatterIntervalRef.current = chatterInterval;
                }
            }

            if (binauralBeats && type === 'white') {
                const oscL = ctx!.createOscillator();
                const oscR = ctx!.createOscillator();
                
                oscL.frequency.value = 200; // Carrier L
                oscR.frequency.value = 210; // Carrier R - 10Hz binaural delta (Alpha Wave)
                
                const panL = ctx!.createStereoPanner ? ctx!.createStereoPanner() : null;
                const panR = ctx!.createStereoPanner ? ctx!.createStereoPanner() : null;
                
                const beatGain = ctx!.createGain();
                beatGain.gain.value = 0.08 * (volume / 100); 
                
                if (panL && panR) {
                    panL.pan.value = -1;
                    panR.pan.value = 1;
                    oscL.connect(panL).connect(beatGain);
                    oscR.connect(panR).connect(beatGain);
                } else {
                    oscL.connect(beatGain);
                    oscR.connect(beatGain);
                }
                
                beatGain.connect(ctx!.destination);
                oscL.start();
                oscR.start();
                nodesRef.current.push(oscL, oscR, beatGain);
                if (panL) nodesRef.current.push(panL);
                if (panR) nodesRef.current.push(panR);
            }
            
            nodesRef.current.push(gainNode);
        };

        init();

        return () => {
            stopAmbience();
        };
    }, [type, volume, rainIntensity, binauralBeats, cafeChatter]); 

    const stopAmbience = () => {
        if (chatterIntervalRef.current) {
            clearInterval(chatterIntervalRef.current);
            chatterIntervalRef.current = null;
        }
        nodesRef.current.forEach(node => {
            try {
                if (node.stop) node.stop();
                node.disconnect();
            } catch (e) {}
        });
        nodesRef.current = [];
    };
};


const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true); 
  const [isAppVisible, setIsAppVisible] = useState(false); 
  const [isLoggingOut, setIsLoggingOut] = useState(false); // New state for logout animation
  const [isLoggingIn, setIsLoggingIn] = useState(false); // New state for login animation
  const [tempUserProfile, setTempUserProfile] = useState<UserProfile | null>(null); // For Welcome Overlay

  const [activeTab, setActiveTab] = useState<Tab>(Tab.LESSON);
  const [activeLesson, setActiveLesson] = useState<LessonTopic>(LessonTopic.HOME); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [userSettings, setUserSettings] = useState<UserSettings>({
      themeColor: 'amber',
      customColor: '', 
      volume: 80,
      dailyGoal: 15,
      ambience: 'off',
      instrumentSound: 'grand',
      particlesStyle: 'notes',
      keyboardStyle: 'minimal',
      binauralBeats: false,
      rainIntensity: 50,
      cafeChatter: false
  });

  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [unlockedToast, setUnlockedToast] = useState<Achievement | null>(null);

  const [isPro, setIsPro] = useState<boolean>(false);
  const [proPlan, setProPlan] = useState<'monthly' | 'yearly' | null>(null); // New State
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  
  const [openGroupIndex, setOpenGroupIndex] = useState<number | null>(0);

  // New State for "Last Active Lesson" and "Real Minutes"
  const [lastActiveLessonId, setLastActiveLessonId] = useState<string | null>(null);
  const [studyMinutes, setStudyMinutes] = useState(0);

  useAmbience(userSettings);

  // Load Saved Authenticated Session on Mount
  useEffect(() => {
    const storedUser = localStorage.getItem('pt_user');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
  }, []);

  // Synchronize and Load User-Specific Progress / Settings / Pro Status on User change
  useEffect(() => {
    if (!user) {
        setIsPro(false);
        setProPlan(null);
        setCompletedLessons([]);
        setAchievements(INITIAL_ACHIEVEMENTS);
        setLastActiveLessonId(null);
        setStudyMinutes(0);
        setUserSettings({
            themeColor: 'amber',
            customColor: '', 
            volume: 80,
            dailyGoal: 15,
            ambience: 'off',
            instrumentSound: 'grand',
            particlesStyle: 'notes',
            keyboardStyle: 'minimal',
            binauralBeats: false,
            rainIntensity: 50,
            cafeChatter: false
        });
        return;
    }

    const username = user.name;

    const savedPro = localStorage.getItem(`pt_pro_${username}`);
    setIsPro(savedPro === 'true');

    const savedPlan = localStorage.getItem(`pt_pro_plan_${username}`);
    setProPlan(savedPlan ? (savedPlan as any) : null);

    const savedProgress = localStorage.getItem(`pt_progress_${username}`);
    setCompletedLessons(savedProgress ? JSON.parse(savedProgress) : []);

    const savedAchievements = localStorage.getItem(`pt_achievements_${username}`);
    setAchievements(savedAchievements ? JSON.parse(savedAchievements) : INITIAL_ACHIEVEMENTS);

    const savedLastLesson = localStorage.getItem(`pt_last_lesson_${username}`);
    setLastActiveLessonId(savedLastLesson || null);

    const savedMinutes = localStorage.getItem(`pt_study_minutes_${username}`);
    setStudyMinutes(savedMinutes ? parseInt(savedMinutes, 10) : 0);

    const savedSettings = localStorage.getItem(`pt_settings_${username}`);
    if (savedSettings) {
        setUserSettings(JSON.parse(savedSettings));
    } else {
        setUserSettings({
            themeColor: 'amber',
            customColor: '', 
            volume: 80,
            dailyGoal: 15,
            ambience: 'off',
            instrumentSound: 'grand',
            particlesStyle: 'notes',
            keyboardStyle: 'minimal',
            binauralBeats: false,
            rainIntensity: 50,
            cafeChatter: false
        });
    }
  }, [user]);

  // Persist User-Specific Settings
  useEffect(() => {
      if (!user) return;
      localStorage.setItem(`pt_settings_${user.name}`, JSON.stringify(userSettings));
  }, [userSettings, user]);

  // Persist User-Specific Progress and Achievements
  useEffect(() => {
      if (!user) return;
      const username = user.name;
      localStorage.setItem(`pt_progress_${username}`, JSON.stringify(completedLessons));
      localStorage.setItem(`pt_achievements_${username}`, JSON.stringify(achievements));
      
      const checkUnlock = (id: string, condition: boolean) => {
          setAchievements(prev => {
              const target = prev.find(a => a.id === id);
              if (target && !target.unlocked && condition) {
                  setUnlockedToast({ ...target, unlocked: true });
                  const updated = prev.map(a => a.id === id ? { ...a, unlocked: true, progress: a.maxProgress } : a);
                  localStorage.setItem(`pt_achievements_${username}`, JSON.stringify(updated));
                  return updated;
              }
              return prev;
          });
      };

      if (completedLessons.length >= 1) checkUnlock('first_lesson', true);
      if (isPro) checkUnlock('pro_member', true);
      
      const hour = new Date().getHours();
      if (hour >= 22 || hour < 4) checkUnlock('night_owl', true);

  }, [completedLessons, isPro, user]);

  // Study Timer Logic with scoped storage writing
  useEffect(() => {
      let interval: number;
      // Only count time if user is logged in and actually on a lesson (not home dashboard)
      if (user && activeTab === Tab.LESSON && activeLesson !== LessonTopic.HOME) {
          interval = window.setInterval(() => {
              setStudyMinutes(prev => {
                  const newVal = prev + 1;
                  localStorage.setItem(`pt_study_minutes_${user.name}`, newVal.toString());
                  return newVal;
              });
          }, 60000); // 1 minute
      }
      return () => clearInterval(interval);
  }, [user, activeTab, activeLesson]);


  const handleLogin = (profile: UserProfile) => {
      setShowAuthModal(false);
      setTempUserProfile(profile);
      setIsLoggingIn(true);
      
      // Double-buffered background rendering:
      // Pre-renders and mounts the workspace behind the WelcomeOverlay after 400ms
      // so there is absolutely zero rendering cost when the visual overlay exits.
      setTimeout(() => {
          setUser(profile);
          localStorage.setItem('pt_user', JSON.stringify(profile));
      }, 400);

      // Finish welcome animation and fade out overlay after 2500ms
      setTimeout(() => {
          setIsLoggingIn(false);
          setTempUserProfile(null);
      }, 2500);
  };

  const handleUpdateProfile = (profile: UserProfile) => {
      setUser(profile);
      localStorage.setItem('pt_user', JSON.stringify(profile));
  };

  const handleLogout = () => {
      setIsLoggingOut(true);
      // Wait for animation to finish
      setTimeout(() => {
          setUser(null);
          setIsPro(false);
          setProPlan(null);
          setCompletedLessons([]);
          setAchievements(INITIAL_ACHIEVEMENTS);
          setLastActiveLessonId(null);
          setStudyMinutes(0);
          setUserSettings({
              themeColor: 'amber',
              customColor: '', 
              volume: 80,
              dailyGoal: 15,
              ambience: 'off',
              instrumentSound: 'grand',
              particlesStyle: 'notes',
              keyboardStyle: 'minimal',
              binauralBeats: false,
              rainIntensity: 50,
              cafeChatter: false
          }); 
          setActiveLesson(LessonTopic.HOME);
          localStorage.removeItem('pt_user');
          setIsLoggingOut(false);
      }, 1500);
  };

  const handleProSuccess = (plan: 'monthly' | 'yearly') => {
    setIsPro(true);
    setProPlan(plan);
    if (user) {
        localStorage.setItem(`pt_pro_${user.name}`, 'true');
        localStorage.setItem(`pt_pro_plan_${user.name}`, plan);
    }
  };

  const checkAccess = (isProFeature: boolean) => {
      if (!user) {
          setShowAuthModal(true);
          return false;
      }
      if (isProFeature && !isPro) {
          setShowSubscribeModal(true);
          return false;
      }
      return true;
  };

  useEffect(() => {
    const handleScroll = (e: Event) => {
        const target = e.target as HTMLElement;
        setHasScrolled(target.scrollTop > 20);
    };
    const mainElement = document.getElementById('main-content');
    if (mainElement) mainElement.addEventListener('scroll', handleScroll);
    return () => mainElement?.removeEventListener('scroll', handleScroll);
  }, []);

  // ... (lessons array same as before) ...
  const lessons = [
    { 
      title: "阶段一：识谱与节奏基础 (Foundations)",
      description: "读谱核心技能与节奏律动",
      items: [
        { id: LessonTopic.CLEFS, icon: AlignCenterVertical, label: '谱号 (Clefs)', desc: '乐谱的GPS定位' },
        { id: LessonTopic.ACCIDENTALS, icon: ArrowUp, label: '升降号 (Accidentals)', desc: '黑键的语法' },
        { id: LessonTopic.RHYTHM, icon: Clock, label: '拍号 (Time Signatures)', desc: '4/4 与 6/8' },
        { id: LessonTopic.RESTS, icon: PauseCircle, label: '休止符 (Rests)', desc: '沉默的艺术' },
        { id: LessonTopic.TRIPLETS, icon: Music3, label: '三连音 (Triplets)', desc: '一拍分三份' },
        { id: LessonTopic.SYNCOPATION, icon: MoveRight, label: '切分音 (Syncopation)', desc: '反拍的律动' },
        { id: LessonTopic.POLYRHYTHMS, icon: Zap, label: '复合节奏 (Polyrhythms)', desc: '3对4的数学舞蹈' },
        { id: LessonTopic.SIGHT_READING, icon: Eye, label: '视奏入门 (Sight Reading)', desc: '即时读谱能力' },
      ]
    },
    { 
      title: "阶段二：音高与调性 (Pitch & Tonality)",
      description: "构建音乐的音高逻辑",
      items: [
        { id: LessonTopic.INTERVALS, icon: Ruler, label: '音程 (Intervals)', desc: '音符的距离' },
        { id: LessonTopic.CONSONANCE, icon: Ear, label: '协和感 (Consonance)', desc: '和谐与冲突' },
        { id: LessonTopic.SCALES, icon: Hash, label: '音阶 (Scales)', desc: '全全半的排列' },
        { id: LessonTopic.KEY_SIGNATURES, icon: Disc, label: '调号 (Key Signatures)', desc: '五度圈的奥秘' },
        { id: LessonTopic.ENHARMONICS, icon: ArrowLeftRight, label: '同音异名 (Enharmonics)', desc: '拼写规则' },
        { id: LessonTopic.MODES, icon: Palette, label: '调式 (Modes)', desc: '多利安与利底亚色彩' },
        { id: LessonTopic.EAR_TRAINING, icon: Radio, label: '练耳基础 (Ear Training)', desc: '听辨音程与和弦' },
      ]
    },
    { 
      title: "阶段三：表情与演奏法 (Expression)",
      description: "赋予音乐情感与呼吸",
      items: [
        { id: LessonTopic.TEMPO, icon: Gauge, label: '速度 (Tempo)', desc: 'BPM 与术语' },
        { id: LessonTopic.DYNAMICS, icon: Volume2, label: '强弱 (Dynamics)', desc: '力度的色彩' },
        { id: LessonTopic.SLUR, icon: Activity, label: '连音线 (Slur)', desc: '乐句呼吸' },
        { id: LessonTopic.ARTICULATIONS, icon: MousePointerClick, label: '运音法 (Articulations)', desc: '跳音与保持音' },
        { id: LessonTopic.PEDALING, icon: Wind, label: '踏板 (Pedaling)', desc: '钢琴的灵魂' },
        { id: LessonTopic.RUBATO, icon: Hourglass, label: '弹性速度 (Rubato)', desc: '时间的伸缩' },
        { id: LessonTopic.ORNAMENTATION, icon: Flower2, label: '装饰音 (Ornamentation)', desc: '颤音与回音' },
      ]
    },
    { 
      title: "阶段四：和声与织体 (Harmony)",
      description: "纵向叠置与横向编织",
      items: [
        { id: LessonTopic.CHORDS, icon: LayoutGrid, label: '三和弦 (Triads)', desc: '大/小/增/减' },
        { id: LessonTopic.INVERSIONS, icon: RefreshCw, label: '转位 (Inversions)', desc: '和弦变形' },
        { id: LessonTopic.ARPEGGIOS, icon: Waves, label: '琶音 (Arpeggios)', desc: '流动的和弦' },
        { id: LessonTopic.SEVENTH_CHORDS, icon: Layers, label: '七和弦 (7th Chords)', desc: '丰富的色彩' },
        { id: LessonTopic.VOICE_LEADING, icon: Route, label: '声部连接 (Voice Leading)', desc: '最近路径原则' },
        { id: LessonTopic.CADENCES, icon: StopCircle, label: '终止式 (Cadences)', desc: '音乐的标点' },
        { id: LessonTopic.COUNTERPOINT, icon: GitMerge, label: '对位法 (Counterpoint)', desc: '旋律的对话' },
      ]
    },
    {
      title: "阶段五：曲式与分析 (Form)",
      description: "宏观结构与设计图",
      isPro: true,
      items: [
        { id: LessonTopic.FORM_BINARY_TERNARY, icon: SplitSquareHorizontal, label: '二部/三部曲式', desc: 'A-B 与 A-B-A' },
        { id: LessonTopic.FORM_SONATA, icon: BookOpen, label: '奏鸣曲式 (Sonata)', desc: '呈示-展开-再现' },
        { id: LessonTopic.FORM_RONDO, icon: RefreshCw, label: '回旋曲式 (Rondo)', desc: 'A-B-A-C-A' },
      ]
    },
    {
      title: "阶段六：风格与流派 (Styles)",
      description: "从古典到爵士流行",
      isPro: true,
      items: [
        { id: LessonTopic.STYLE_JAZZ_BASIC, icon: Music, label: '爵士基础 (Jazz Basics)', desc: 'Swing 与 II-V-I' },
        { id: LessonTopic.STYLE_POP, icon: Star, label: '流行伴奏 (Pop)', desc: '和弦织体模式' },
        { id: LessonTopic.JAZZ_EXTENSIONS, icon: ZapIcon, label: '爵士扩展音 (Extensions)', desc: '9/11/13和弦' },
      ]
    },
    { 
      title: "阶段七：现代音乐 (Modernism)",
      description: "打破传统，探索声音极限",
      isPro: true, 
      items: [
        { id: LessonTopic.IMPRESSIONISM, icon: CloudFog, label: '印象主义 (Impressionism)', desc: '全音阶色彩' },
        { id: LessonTopic.TWELVE_TONE, icon: Calculator, label: '十二音序列 (12-Tone)', desc: '勋伯格的矩阵' },
        { id: LessonTopic.PITCH_CLASS_SETS, icon: ClockIcon, label: '音级集合 (Set Theory)', desc: '[0,4,7] 数学分析' },
        { id: LessonTopic.MICROTONALITY, icon: Divide, label: '微分音 (Microtonality)', desc: '半音之间的缝隙' },
        { id: LessonTopic.SPECTRALISM, icon: AudioWaveform, label: '频谱主义 (Spectralism)', desc: '泛音列的微观世界' },
        { id: LessonTopic.MINIMALISM, icon: Infinity, label: '极简主义 (Minimalism)', desc: '相位移动' },
        { id: LessonTopic.BITONALITY, icon: SplitSquareHorizontal, label: '双调性 (Bitonality)', desc: '调性的碰撞' },
        { id: LessonTopic.ALEATORIC, icon: Dices, label: '偶然音乐 (Aleatoric)', desc: '随机与概率' },
        { id: LessonTopic.NEGATIVE_HARMONY, icon: FlipHorizontal, label: '负面和声 (Negative)', desc: '调性的镜像' },
        { id: LessonTopic.NEO_RIEMANNIAN, icon: Network, label: '新黎曼理论 (Tonnetz)', desc: 'PLR 变换' },
        { id: LessonTopic.QUARTAL_HARMONY, icon: AlignVerticalSpaceAround, label: '四度和声 (Quartal)', desc: '悬浮的空间感' },
        { id: LessonTopic.OVERTONE_SERIES, icon: Radar, label: '泛音列 (Overtones)', desc: '物理声学基础' },
      ]
    }
  ];

  // --- Dynamic Color Styles Helper ---
  // ... (keep helper functions)
  const getThemeStyle = (type: 'text' | 'bg' | 'border' | 'gradient-from' | 'gradient-to' | 'activeBg' | 'sidebarBg') => {
      const { themeColor, customColor } = userSettings;
      
      // If Custom Color
      if (themeColor === 'custom' && customColor) {
          if (type === 'text') return { color: customColor };
          if (type === 'bg') return { backgroundColor: customColor };
          if (type === 'activeBg') return { backgroundColor: `${customColor}20` }; // 20 hex alpha (~12%)
          if (type === 'border') return { borderColor: customColor };
          if (type === 'gradient-from') return { stopColor: customColor }; // For SVG gradients potentially, but here used for CSS vars? 
          // Note: CSS gradients with inline styles are tricky. We'll use solid color for custom to be safe.
          if (type === 'sidebarBg') return { backgroundColor: '#ffffff' };
      }

      // If Preset Color, return empty object (rely on Tailwind classes)
      return {};
  };

  const getThemeClass = (type: 'text' | 'bg' | 'border' | 'gradient' | 'hoverBg' | 'activeBg' | 'sidebarBg') => {
      const { themeColor } = userSettings;
      
      // If custom, return generic classes that will be overridden by style prop
      if (themeColor === 'custom') {
          if (type === 'gradient') return ''; // Disable gradient class
          if (type === 'sidebarBg') return 'bg-white';
          return ''; 
      }

      const map: Record<string, any> = {
          'amber': { text: 'text-amber-600', bg: 'bg-amber-500', border: 'border-amber-200', gradient: 'from-amber-500 to-orange-400', hoverBg: 'hover:bg-amber-50', activeBg: 'bg-amber-100', sidebarBg: 'bg-white' },
          'rose': { text: 'text-rose-600', bg: 'bg-rose-500', border: 'border-rose-200', gradient: 'from-rose-500 to-pink-400', hoverBg: 'hover:bg-rose-50', activeBg: 'bg-rose-100', sidebarBg: 'bg-white' },
          'sky': { text: 'text-sky-600', bg: 'bg-sky-500', border: 'border-sky-200', gradient: 'from-sky-500 to-blue-400', hoverBg: 'hover:bg-sky-50', activeBg: 'bg-sky-100', sidebarBg: 'bg-white' },
          'emerald': { text: 'text-emerald-600', bg: 'bg-emerald-500', border: 'border-emerald-200', gradient: 'from-emerald-500 to-teal-400', hoverBg: 'hover:bg-emerald-50', activeBg: 'bg-emerald-100', sidebarBg: 'bg-white' },
          'violet': { text: 'text-violet-600', bg: 'bg-violet-500', border: 'border-violet-200', gradient: 'from-violet-500 to-purple-400', hoverBg: 'hover:bg-violet-50', activeBg: 'bg-violet-100', sidebarBg: 'bg-white' },
      };
      const theme = map[themeColor] || map['amber'];
      return theme[type];
  };

  const toggleGroup = (index: number) => {
    setOpenGroupIndex(openGroupIndex === index ? null : index);
  };

  const handleLessonSelect = (lessonId: LessonTopic | string, isProLesson: boolean) => {
      if (!checkAccess(false)) return;
      if (!checkAccess(isProLesson)) return;

      // Persist Last Active Lesson with user-scoped key
      setLastActiveLessonId(lessonId);
      if (user) {
          localStorage.setItem(`pt_last_lesson_${user.name}`, lessonId);
      }

      if (!completedLessons.includes(lessonId)) {
          setCompletedLessons(prev => [...prev, lessonId]);
      }

      setActiveLesson(lessonId as LessonTopic);
      setIsMobileMenuOpen(false);
  };

  const renderLessonContent = () => {
    // ... (same as before)
    if (activeLesson === LessonTopic.HOME) {
        return <StartPage 
            onNavigate={handleLessonSelect} 
            lessons={lessons} 
            isPro={isPro} 
            proPlan={proPlan} // Pass new prop
            onUpgrade={() => setShowSubscribeModal(true)} 
            userSettings={userSettings}
            onUpdateSettings={setUserSettings}
            user={user}
            achievements={achievements}
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
            completedLessons={completedLessons}
            onLoginRequest={() => setShowAuthModal(true)}
            lastActiveLessonId={lastActiveLessonId}
            studyMinutes={studyMinutes}
        />;
    }

    if (activeLesson === LessonTopic.SIGHT_READING) return <SightReadingLesson settings={userSettings} />;
    if (activeLesson === LessonTopic.EAR_TRAINING) return <GenericLesson level="Level 2" title="练耳基础" subtitle="Ear Training" sections={[{ title: "音程色彩", content: "分辨大三度（快乐）和小三度（悲伤）。", icon: Mic2 }]} />

    if (activeLesson === LessonTopic.FORM_BINARY_TERNARY) return <FormBinaryTernaryLesson />;
    if (activeLesson === LessonTopic.FORM_SONATA) return <FormSonataLesson />;
    if (activeLesson === LessonTopic.FORM_RONDO) return <FormRondoLesson />;

    if (activeLesson === LessonTopic.STYLE_JAZZ_BASIC) return <JazzBasicsLesson />;
    if (activeLesson === LessonTopic.STYLE_POP) return <PopStylesLesson />;

    return (
      <div key={activeLesson} className="max-w-5xl mx-auto w-full pb-20 relative z-10">
        {activeLesson === LessonTopic.SLUR && (
          <div className="space-y-8">
            <header className="mb-10 animate-slideUp">
               <div className={`inline-block px-3 py-1 ${getThemeClass('activeBg')} ${getThemeClass('text')} rounded-full text-xs font-bold tracking-wider uppercase mb-3 transition-colors duration-500`} style={{...getThemeStyle('activeBg'), ...getThemeStyle('text')}}>Level 3 - Expression</div>
               <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6 leading-tight">
                 连音线 <span className="text-stone-300 font-light">|</span> Slur
               </h2>
               <p className="text-xl text-stone-600 font-light leading-relaxed max-w-2xl">
                 学会用手指“歌唱”。连音线不仅仅是一个符号，它代表了音乐如水流般的连贯性与乐句的自然呼吸。
               </p>
            </header>
            <div className="animate-slideUp stagger-1"><Explanation /></div>
            <section className="mt-16 animate-slideUp stagger-3">
               <div className="flex items-center gap-6 mb-8">
                 <div className="h-px bg-stone-200 flex-1"></div>
                 <h2 className="text-2xl font-bold serif text-stone-800 flex items-center gap-2"><Activity size={24} className={`${getThemeClass('text')} transition-colors duration-500`} style={getThemeStyle('text')} /> 易混淆概念辨析</h2>
                 <div className="h-px bg-stone-200 flex-1"></div>
               </div>
               <SlurVsTie />
            </section>
          </div>
        )}
        
        {activeLesson === LessonTopic.CLEFS && <ClefsLesson />}
        {activeLesson === LessonTopic.ACCIDENTALS && <AccidentalsLesson />}
        {activeLesson === LessonTopic.RHYTHM && <TimeSignatureLesson />}
        {activeLesson === LessonTopic.RESTS && <RestsLesson />}
        {activeLesson === LessonTopic.TRIPLETS && <TripletsLesson />}
        {activeLesson === LessonTopic.SYNCOPATION && <SyncopationLesson />}
        {activeLesson === LessonTopic.POLYRHYTHMS && <PolyrhythmsLesson />}
        
        {activeLesson === LessonTopic.INTERVALS && <IntervalsLesson />}
        {activeLesson === LessonTopic.CONSONANCE && <ConsonanceLesson />}
        {activeLesson === LessonTopic.SCALES && <ScalesLesson />}
        {activeLesson === LessonTopic.KEY_SIGNATURES && <KeySignaturesLesson />}
        {activeLesson === LessonTopic.ENHARMONICS && <EnharmonicsLesson />}
        {activeLesson === LessonTopic.MODES && <ModesLesson />}
        
        {activeLesson === LessonTopic.TEMPO && <TempoLesson />}
        {activeLesson === LessonTopic.DYNAMICS && <DynamicsLesson />}
        {activeLesson === LessonTopic.ARTICULATIONS && <ArticulationsLesson />}
        {activeLesson === LessonTopic.PEDALING && <PedalingLesson />}
        {activeLesson === LessonTopic.RUBATO && <RubatoLesson />}
        {activeLesson === LessonTopic.ORNAMENTATION && <OrnamentationLesson />}
        
        {activeLesson === LessonTopic.CHORDS && <ChordsLesson />}
        {activeLesson === LessonTopic.INVERSIONS && <InversionsLesson />}
        {activeLesson === LessonTopic.ARPEGGIOS && <ArpeggiosLesson />}
        {activeLesson === LessonTopic.SEVENTH_CHORDS && <SeventhChordsLesson />}
        {activeLesson === LessonTopic.VOICE_LEADING && <VoiceLeadingLesson />}
        {activeLesson === LessonTopic.CADENCES && <CadencesLesson />}
        {activeLesson === LessonTopic.COUNTERPOINT && <CounterpointLesson />}
        
        {activeLesson === LessonTopic.JAZZ_EXTENSIONS && <JazzExtensionsLesson />}
        
        {activeLesson === LessonTopic.IMPRESSIONISM && <ImpressionismLesson />}
        {activeLesson === LessonTopic.TWELVE_TONE && <TwelveToneLesson />}
        {activeLesson === LessonTopic.PITCH_CLASS_SETS && <PitchClassSetLesson />}
        {activeLesson === LessonTopic.MICROTONALITY && <MicrotonalityLesson />}
        {activeLesson === LessonTopic.SPECTRALISM && <SpectralismLesson />}
        {activeLesson === LessonTopic.MINIMALISM && <MinimalismLesson />}
        {activeLesson === LessonTopic.BITONALITY && <BitonalityLesson />}
        {activeLesson === LessonTopic.ALEATORIC && <AleatoricLesson />}
        {activeLesson === LessonTopic.NEGATIVE_HARMONY && <NegativeHarmonyLesson />}
        {activeLesson === LessonTopic.NEO_RIEMANNIAN && <NeoRiemannianLesson />}
        {activeLesson === LessonTopic.QUARTAL_HARMONY && <QuartalHarmonyLesson />}
        {activeLesson === LessonTopic.OVERTONE_SERIES && <OvertoneSeriesLesson />}
      </div>
    );
  };

  return (
    <>
    <style>{`
      .sidebar-open-anim { transform: translateX(0); transition: transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1); }
      .sidebar-closed-anim { transform: translateX(-100%); transition: transform 500ms cubic-bezier(0.6, -0.28, 0.735, 0.045); }
      @media (min-width: 768px) { .sidebar-desktop-reset { transform: translateX(0) !important; transition: none !important; } }
      .animate-card-flip { animation: cardFlip 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      @keyframes cardFlip { 0% { transform: rotateY(90deg); opacity: 0; } 100% { transform: rotateY(0deg); opacity: 1; } }
    `}</style>
    {showSplash && (
      <SplashScreen 
        onStartExiting={() => setIsAppVisible(true)} 
        onFinish={() => setShowSplash(false)} 
      />
    )}
    
    <AnimatePresence>
        {isLoggingOut && <LogoutOverlay key="logout" />}
        {isLoggingIn && <WelcomeOverlay key="welcome" user={tempUserProfile} />}
    </AnimatePresence>

    <AnimatePresence mode="wait">
      {!showSplash && !user ? (
        <MandatoryAuthScreen key="mandatory" onLogin={handleLogin} />
      ) : (
        <div className={`h-screen flex flex-col md:flex-row bg-[#FAFAF9] overflow-hidden font-sans transition-[opacity,transform] duration-500 ease-out ${isAppVisible && !isLoggingOut && !isLoggingIn ? 'opacity-100 scale-100' : (isLoggingOut || isLoggingIn ? 'opacity-30 scale-[0.995]' : 'opacity-0 scale-[0.995]')}`}>

      <AchievementToast achievement={unlockedToast} onClose={() => setUnlockedToast(null)} />

      <SubscriptionModal 
        isOpen={showSubscribeModal} 
        onClose={() => setShowSubscribeModal(false)}
        onSuccess={handleProSuccess}
        themeColor={userSettings.themeColor}
        customColor={userSettings.customColor}
      />

      {/* Mobile Header */}
      <div className="md:hidden glass px-4 py-3 flex justify-between items-center z-50 sticky top-0 border-b border-stone-200/50">
         <div className="flex items-center gap-2">
            <div className={`bg-gradient-to-tr ${getThemeClass('gradient')} p-1.5 rounded-lg text-white shadow-md transition-colors duration-500`} style={{ backgroundColor: userSettings.themeColor === 'custom' ? userSettings.customColor : undefined }}><Music size={18} /></div>
            <span className="font-bold serif text-stone-900 tracking-tight">Piano Theory</span>
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg active:scale-95 transition-transform">
            {isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
         </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-80 bg-white border-r border-stone-200/60 flex flex-col backdrop-blur-xl md:backdrop-blur-none shadow-2xl md:shadow-none
        ${isMobileMenuOpen ? 'sidebar-open-anim' : 'sidebar-closed-anim'}
        sidebar-desktop-reset transition-colors duration-500
      `}>
        <div 
            onClick={() => { setActiveLesson(LessonTopic.HOME); setIsMobileMenuOpen(false); }}
            className="p-8 hidden md:flex items-center gap-3 mb-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
           {/* Sidebar Logo: Use solid background for smooth transition */}
           <div 
             className={`p-3 rounded-xl shadow-lg text-white transform hover:rotate-3 transition-all duration-500 ${userSettings.themeColor === 'custom' ? '' : getThemeClass('bg')}`} 
             style={getThemeStyle('bg')}
           >
             <Music size={26} strokeWidth={2.5} />
           </div>
           <div>
             <h1 className={`text-lg font-bold serif tracking-wide leading-none text-stone-900`}>Piano Theory</h1>
             <p className={`text-sm uppercase tracking-[0.2em] font-bold mt-1.5 ml-0.5 text-stone-400`}>Interactive Guide</p>
           </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 py-2">
          <div className={`bg-stone-100/80 p-1.5 rounded-2xl flex font-medium text-sm relative`}>
             <button
               onClick={() => { setActiveTab(Tab.LESSON); setIsMobileMenuOpen(false); }}
               className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 z-10 relative ${
                 activeTab === Tab.LESSON 
                 ? 'bg-white text-stone-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)]' 
                 : 'text-stone-500 hover:text-stone-700 hover:bg-white/50'
               } ${activeTab === Tab.LESSON ? 'font-bold' : ''}`}
             >
               <BookOpen size={16} /> 课程
             </button>
             <button
               onClick={() => { setActiveTab(Tab.DICTIONARY); setIsMobileMenuOpen(false); }}
               className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 z-10 relative ${
                 activeTab === Tab.DICTIONARY 
                 ? 'bg-white text-stone-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)]' 
                 : 'text-stone-500 hover:text-stone-700 hover:bg-white/50'
               } ${activeTab === Tab.DICTIONARY ? 'font-bold' : ''}`}
             >
               <BookOpen size={16} /> 字典
             </button>
             <button
               onClick={() => { setActiveTab(Tab.TUTOR); setIsMobileMenuOpen(false); }}
               className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 z-10 relative ${
                 activeTab === Tab.TUTOR 
                 ? 'bg-white text-stone-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)]' 
                 : 'text-stone-500 hover:text-stone-700 hover:bg-white/50'
               } ${activeTab === Tab.TUTOR ? 'font-bold' : ''}`}
             >
               <MessageCircle size={16} /> 助教
             </button>
          </div>
        </div>

        {/* Lesson List */}
        {activeTab === Tab.LESSON && (
          <nav className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar z-10 relative">
            <div className="mb-2">
                <button 
                    onClick={() => { setActiveLesson(LessonTopic.HOME); setIsMobileMenuOpen(false); }}
                    className={`w-full px-4 py-3 flex items-center gap-3 rounded-xl transition-all duration-500 group ${
                        activeLesson === LessonTopic.HOME 
                        ? 'bg-stone-900 text-white shadow-md'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                >
                    <Layout size={18} className={`transition-colors duration-500 ${activeLesson === LessonTopic.HOME ? (userSettings.themeColor==='custom' ? 'text-white' : getThemeClass('text')) : 'text-stone-400 group-hover:text-stone-600'}`} style={activeLesson === LessonTopic.HOME ? {color: userSettings.customColor || undefined} : {}} />
                    <span className="font-bold text-sm">首页 (Dashboard)</span>
                </button>
            </div>

            <div className={`h-px my-2 mx-2 bg-stone-100`}></div>

            {lessons.map((group, groupIdx) => {
              const isOpen = openGroupIndex === groupIdx;
              return (
                <div key={groupIdx} className="mb-2">
                  <button 
                    onClick={() => toggleGroup(groupIdx)}
                    className={`w-full px-4 py-3 flex items-center justify-between group rounded-xl transition-colors outline-none hover:bg-stone-50`}
                  >
                    <div className="text-left">
                        <div className={`text-[11px] font-black uppercase tracking-wide flex items-center gap-2 transition-colors duration-500 ${isOpen ? getThemeClass('text') : 'text-stone-900'}`} style={isOpen ? getThemeStyle('text') : {}}>
                            {group.title}
                            {(group as any).isPro && !isPro && <span className={`text-[9px] px-1.5 py-0.5 rounded ml-2 flex items-center gap-1 bg-stone-900 text-white`}><Lock size={8} /> PRO</span>}
                            {(group as any).isPro && isPro && <span className={`${getThemeClass('bg')}/10 ${getThemeClass('text')} text-[9px] px-1.5 py-0.5 rounded ml-2 flex items-center gap-1 font-bold transition-colors duration-500`} style={{...getThemeStyle('activeBg'), ...getThemeStyle('text')}}>UNLOCKED</span>}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-1 font-medium">{group.description}</div>
                    </div>
                    <div className={`p-1.5 rounded-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isOpen ? 'bg-stone-100 text-stone-900 rotate-180' : 'text-stone-400 group-hover:bg-stone-200'}`}>
                       <ChevronDown size={14} strokeWidth={3} />
                    </div>
                  </button>

                  <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      <div className={`space-y-1.5 mt-1 pb-4 relative pl-2 transition-all duration-500 ease-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                        <div className={`absolute left-6 top-0 bottom-2 w-px -z-10 bg-stone-100`}></div>
                        {group.items.map((lesson) => {
                            const isLocked = (group as any).isPro && !isPro;
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => handleLessonSelect(lesson.id, (group as any).isPro)}
                                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-500 group relative ${
                                  activeLesson === lesson.id 
                                  ? `${getThemeClass('activeBg')} text-stone-900 shadow-sm ring-1 ring-black/5 translate-x-1` 
                                  : `text-stone-600 hover:bg-stone-50 hover:text-stone-900 hover:translate-x-1`
                                }`}
                                style={activeLesson === lesson.id ? getThemeStyle('activeBg') : {}}
                              >
                                <div className={`p-1.5 rounded-lg transition-all duration-500 ${activeLesson === lesson.id ? `${getThemeClass('bg')}/20 text-stone-900` : 'bg-white border border-stone-100 text-stone-400 group-hover:border-stone-200 group-hover:text-stone-500'}`} style={activeLesson === lesson.id ? {backgroundColor: userSettings.themeColor==='custom'?`${userSettings.customColor}40`:undefined, color: userSettings.themeColor==='custom'?userSettings.customColor:undefined} : {}}>
                                  <lesson.icon size={16} strokeWidth={activeLesson === lesson.id ? 2.5 : 2} />
                                </div>
                                <div className="flex-1 z-10 flex justify-between items-center">
                                  <div className={`font-bold text-[13px]`}>{lesson.label}</div>
                                  {isLocked && <Lock size={12} className="text-stone-300" />}
                                </div>
                                {activeLesson === lesson.id && <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${getThemeClass('bg')}`} style={getThemeStyle('bg')}></div>}
                              </button>
                            )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        )}
        
        {activeTab === Tab.TUTOR && (
           <div className="px-6 py-10 text-center animate-fadeIn relative z-10">
              <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-500 shadow-inner">
                 <MessageCircle size={40} />
              </div>
              <h3 className="font-bold text-stone-900 text-lg">AI 钢琴助教</h3>
              <p className="text-sm text-stone-500 mt-3 leading-relaxed px-4">
                {isPro ? "您已解锁无限 AI 辅导功能。" : "免费版限制 5 条消息。升级以解锁无限对话。"}
              </p>
              {!user ? (
                  <button onClick={() => setShowAuthModal(true)} className="mt-6 px-6 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-stone-800">
                      登录使用
                  </button>
              ) : !isPro && (
                  <button 
                    onClick={() => setShowSubscribeModal(true)}
                    className="mt-6 px-6 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-stone-800 transition-colors"
                  >
                      升级 Pro
                  </button>
              )}
           </div>
        )}

        <div className={`p-4 border-t border-stone-100/80 bg-white text-center relative z-10`}>
          {user ? (
              <div className={`flex items-center gap-3 mb-4 p-3 rounded-xl border border-stone-200 bg-stone-50 overflow-hidden`}>
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-stone-200 shrink-0">
                      {user.isCustomAvatar ? (
                          <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                          <span className="text-xl">{user.avatar}</span>
                      )}
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                      <div className={`font-bold text-sm truncate text-stone-900`}>{user.name}</div>
                      <div className="text-xs text-stone-500 flex items-center gap-1">
                          <Trophy size={10} className="text-amber-500"/> {achievements.filter(a => a.unlocked).length} / {achievements.length}
                      </div>
                  </div>
              </div>
          ) : (
              <button 
                  onClick={() => setShowAuthModal(true)}
                  className="w-full bg-white border-2 border-stone-200 text-stone-600 py-3 rounded-xl font-bold mb-4 hover:border-stone-400 hover:text-stone-800 transition-all flex items-center justify-center gap-2"
              >
                  <UserIcon size={16}/> 登录 / 注册
              </button>
          )}

          {!isPro ? (
            <button 
                onClick={() => user ? setShowSubscribeModal(true) : setShowAuthModal(true)}
                className="w-full bg-gradient-to-r from-stone-900 to-stone-800 text-amber-400 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group overflow-hidden relative mb-4"
            >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                <Crown size={18} fill="currentColor" />
                <div className="text-left">
                    <div className="text-xs font-bold uppercase tracking-widest text-amber-500">Upgrade</div>
                    <div className="font-bold text-sm text-white leading-none">获取 Pro 会员</div>
                </div>
            </button>
          ) : (
            <div className={`w-full ${getThemeClass('bg')}/10 border ${getThemeClass('border')} ${getThemeClass('text')} py-3 rounded-xl flex items-center justify-center gap-2 mb-4 cursor-default transition-all duration-500`} style={{...getThemeStyle('activeBg'), ...getThemeStyle('border'), ...getThemeStyle('text')}}>
                <Crown size={16} fill="currentColor" />
                <span className="font-bold text-sm">Pro {proPlan === 'monthly' ? '月度' : '年度'}会员</span>
            </div>
          )}
          
          {userSettings.ambience !== 'off' && (
              <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400 mb-2 animate-pulse-soft">
                  <Headphones size={10} /> Ambience Active: {userSettings.ambience.toUpperCase()}
              </div>
          )}
          
          <p className="text-[10px] text-stone-400 font-medium tracking-wide">© 2024 Music Theory Interactive</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 h-full overflow-hidden flex flex-col relative transition-colors duration-500">
         <div className="absolute inset-0 opacity-[0.3] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#d6d3d1 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
         <BackgroundParticles key={userSettings.particlesStyle} style={userSettings.particlesStyle} />
         <div className={`absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#FAFAF9] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${hasScrolled ? 'opacity-100' : 'opacity-0'}`}></div>

         <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 lg:px-20 w-full z-10 scroll-smooth relative">
            <AnimatePresence mode="wait">
                {activeTab === Tab.LESSON ? (
                    <motion.div 
                        key={activeLesson}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="w-full"
                        style={{ willChange: "opacity" }}
                    >
                        {renderLessonContent()}
                    </motion.div>
                ) : activeTab === Tab.DICTIONARY ? (
                    <motion.div
                        key="dictionary"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="h-full w-full"
                        style={{ willChange: "opacity" }}
                    >
                        <SymbolDictionary />
                    </motion.div>
                ) : (
                    <motion.div
                        key="tutor"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="h-full w-full"
                        style={{ willChange: "opacity" }}
                    >
                        <div className="h-full flex flex-col max-w-4xl mx-auto pb-6">
                           <header className="mb-6 flex items-baseline justify-between">
                             <div>
                                 <h2 className="text-3xl font-bold serif text-stone-900">智能助教</h2>
                                 <p className="text-stone-500 text-sm mt-1">基于 Gemini 2.5 Flash 模型</p>
                             </div>
                             {isPro && <div className={`${getThemeClass('bg')}/10 ${getThemeClass('text')} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border ${getThemeClass('border')} transition-colors duration-500`} style={{...getThemeStyle('activeBg'), ...getThemeStyle('text'), ...getThemeStyle('border')}}><Crown size={12} fill="currentColor" /> Pro Unlocked</div>}
                           </header>
                           <div className="flex-1 bg-white rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-200 overflow-hidden flex flex-col">
                              {!user ? (
                                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                      <div className="bg-stone-100 p-4 rounded-full mb-4"><Lock size={32} className="text-stone-400"/></div>
                                      <h3 className="text-xl font-bold text-stone-800">请先登录</h3>
                                      <p className="text-stone-500 mt-2 mb-6">您需要登录账户才能使用 AI 助教功能。</p>
                                      <button onClick={() => setShowAuthModal(true)} className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg">立即登录</button>
                                  </div>
                              ) : (
                                  <AITutor isPro={isPro} onRequestUpgrade={() => setShowSubscribeModal(true)} />
                              )}
                           </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
         </div>
      </main>
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-30 md:hidden animate-fadeIn"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
    )}
    </AnimatePresence>
    </>
  );
};

export default App;
