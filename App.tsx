
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BookOpen, Music, MessageCircle, Clock, Activity, Volume2, Ruler, LayoutGrid, Sparkles, Menu, X, ChevronRight, Hash, PauseCircle, Gauge, AlignCenterVertical, Disc, RefreshCw, Waves, Zap, Flower2, Wind, Hourglass, StopCircle, Layers, MoveRight, ChevronDown, Palette, MousePointerClick, ArrowUp, Music3, ArrowLeftRight, GitMerge, Calculator, SplitSquareHorizontal, Infinity, CloudFog, Ear, Route, Crown, Check, Lock, CreditCard, Ticket, Star, Zap as ZapIcon, Dices, FlipHorizontal, AudioWaveform, AlignVerticalSpaceAround, Network, Divide, Radar, Radio, Clock as ClockIcon, Eye, Grid, ListMusic, Mic2, Piano, Layout, Headphones, Coffee, User as UserIcon, LogIn, Upload, Camera, Trophy, Image as ImageIcon, ZoomIn } from 'lucide-react';
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
import AITutor from './components/AITutor';
import GenericLesson from './components/GenericLesson';
import SplashScreen from './components/SplashScreen';
import StartPage, { UserSettings, UserProfile, Achievement } from './components/StartPage'; 

// --- Constants ---
const INITIAL_ACHIEVEMENTS: Achievement[] = [
    { id: 'first_lesson', title: '初入琴房', desc: '完成你的第 1 个课程', icon: '🎵', unlocked: false, progress: 0, maxProgress: 1 },
    { id: 'scholar', title: '乐理学徒', desc: '完成 5 个课程', icon: '📚', unlocked: false, progress: 0, maxProgress: 5 },
    { id: 'pro_member', title: '尊贵会员', desc: '成为 Pro 用户', icon: '👑', unlocked: false, progress: 0, maxProgress: 1 },
    { id: 'night_owl', title: '夜猫子', desc: '在晚上 10 点后学习', icon: '🌙', unlocked: false, progress: 0, maxProgress: 1 },
    { id: 'master', title: '理论大师', desc: '解锁所有高级课程', icon: '🎓', unlocked: false, progress: 0, maxProgress: 10 },
];

// --- Achievement Toast Component ---
const AchievementToast: React.FC<{ achievement: Achievement | null, onClose: () => void }> = ({ achievement, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (achievement) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onClose, 500);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [achievement, onClose]);

    if (!achievement) return null;

    return (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[150] transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
            <div className="bg-stone-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-stone-700 min-w-[300px]">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-2xl animate-bounce">
                    {achievement.icon}
                </div>
                <div>
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Achievement Unlocked</div>
                    <div className="font-bold text-lg leading-none">{achievement.title}</div>
                </div>
            </div>
        </div>
    )
}

// --- Auth Modal ---
interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (profile: UserProfile) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
    const [name, setName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('🎹');
    const [customAvatar, setCustomAvatar] = useState<string | null>(null);
    const [imageZoom, setImageZoom] = useState(1);
    
    // Animation States
    const [renderModal, setRenderModal] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Handle Opening/Closing Animation
    useEffect(() => {
        if (isOpen) {
            setRenderModal(true);
            // Small delay to allow render before opacity transition
            requestAnimationFrame(() => setIsVisible(true));
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setRenderModal(false), 300); // Wait for transition
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!renderModal) return null;

    const defaultAvatars = ['🎹', '🎵', '🎼', '🎻', '🎷', '🎸', '🎺', '🥁'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name.trim()) return;
        
        // Trigger exit animation first
        setIsVisible(false);
        
        // Then perform login after animation
        setTimeout(() => {
            onLogin({
                name: name,
                avatar: customAvatar || selectedAvatar,
                level: 'Level 1',
                isGuest: false,
                isCustomAvatar: !!customAvatar
            });
            onClose(); // Tell parent to close
        }, 300);
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomAvatar(reader.result as string);
                setImageZoom(1); // Reset zoom
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center px-4 transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={handleClose}></div>
            
            <div className={`bg-white w-full max-w-md rounded-[2rem] p-8 relative z-10 shadow-2xl transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) transform ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
                <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-stone-400 hover:bg-stone-100 rounded-full transition-colors"><X size={20}/></button>
                
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-serif font-bold text-stone-900">欢迎加入</h2>
                    <p className="text-stone-500 text-sm mt-1">创建您的音乐档案</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 1. Name Input - moved to top for better flow */}
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">昵称 (Nickname)</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="例如: Chopin Lover"
                                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-10 font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
                                autoFocus
                            />
                            <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        </div>
                    </div>

                    {/* 2. Avatar Selection */}
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 ml-1 text-center">选择头像</label>
                        
                        {/* Custom Image Preview & Crop Simulation */}
                        {customAvatar ? (
                            <div className="flex flex-col items-center mb-4 animate-fadeIn">
                                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-stone-100 shadow-inner mb-3 group bg-stone-100">
                                    <img 
                                        src={customAvatar} 
                                        alt="Avatar Preview" 
                                        className="w-full h-full object-cover transition-transform duration-100 origin-center" 
                                        style={{ transform: `scale(${imageZoom})` }}
                                    />
                                    {/* Overlay to change */}
                                    <button 
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold"
                                    >
                                        更换图片
                                    </button>
                                </div>
                                
                                {/* Zoom Control */}
                                <div className="flex items-center gap-2 w-2/3">
                                    <ImageIcon size={12} className="text-stone-400"/>
                                    <input 
                                        type="range" 
                                        min="1" max="2.5" step="0.1" 
                                        value={imageZoom}
                                        onChange={(e) => setImageZoom(parseFloat(e.target.value))}
                                        className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
                                    />
                                    <ZoomIn size={12} className="text-stone-400"/>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center gap-3 flex-wrap mb-4">
                                {defaultAvatars.map(emoji => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => setSelectedAvatar(emoji)}
                                        className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${selectedAvatar === emoji ? 'bg-stone-900 text-white shadow-md scale-110' : 'bg-stone-50 hover:bg-stone-100 text-stone-600'}`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        {/* Upload Button */}
                        {!customAvatar && (
                            <div className="flex justify-center">
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleFileChange} 
                                />
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-dashed border-stone-300 text-stone-500 hover:border-stone-400 hover:text-stone-800 hover:bg-stone-50 transition-all"
                                >
                                    <Camera size={14} />
                                    <span>上传自定义图片</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        disabled={!name.trim()}
                        className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-stone-800 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <LogIn size={18} /> 进入
                    </button>
                </form>
            </div>
        </div>
    )
};

// --- Subscription Modal Component (Updated High Contrast) ---
interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  themeColor: string;
  customColor?: string; 
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSuccess, themeColor, customColor }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setInviteCode('');
      setError('');
      setIsSuccess(false);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const handleVerify = () => {
    if (inviteCode === '8888') {
      setIsSuccess(true);
      setTimeout(() => { onSuccess(); }, 1000);
    } else {
      setError('无效的邀请码。请重试。');
    }
  };

  const handlePurchase = () => {
      setIsSuccess(true);
      setTimeout(() => { onSuccess(); }, 1000);
  }

  const modalBg = 'bg-stone-900 text-white';

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center px-4 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={onClose}></div>

      <div className={`bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl relative overflow-hidden transform transition-all duration-300 border border-stone-200 flex flex-col md:flex-row ${isAnimating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        {/* Left Side: Premium Branding */}
        <div className={`md:w-5/12 p-8 flex flex-col relative overflow-hidden ${modalBg}`}>
           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
           
           <div className="relative z-10 flex-1">
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/10 bg-white/10`}>
                   <Crown size={24} className="text-amber-400" fill="currentColor" />
               </div>
               <h2 className="text-3xl font-bold font-serif mb-2">Piano Theory <span className="text-amber-400">Pro</span></h2>
               <p className="text-white/60 text-sm mb-8">解锁大师级特权，定义你的音乐人格。</p>
                
               <ul className="space-y-4">
                   <li className="flex items-start gap-3">
                       <div className={`mt-0.5 p-1 rounded-full bg-white/10`}><Check size={12} className="text-white" /></div>
                       <span className="text-sm font-medium">解锁 <strong>Level 5-7 大师课程</strong></span>
                   </li>
                   <li className="flex items-start gap-3">
                       <div className={`mt-0.5 p-1 rounded-full bg-white/10`}><Check size={12} className="text-white" /></div>
                       <span className="text-sm font-medium">无限次 <strong>AI 助教</strong> 对话</span>
                   </li>
                   <li className="flex items-start gap-3">
                       <div className={`mt-0.5 p-1 rounded-full bg-white/10`}><Check size={12} className="text-white" /></div>
                       <span className="text-sm font-medium"><strong>自定义</strong> 主题色彩</span>
                   </li>
               </ul>
           </div>
        </div>

        {/* Right Side: Action */}
        <div className="md:w-7/12 bg-white p-8 flex flex-col overflow-y-auto max-h-[80vh] custom-scrollbar relative">
           <button onClick={onClose} className="absolute top-4 right-4 bg-stone-100 hover:bg-stone-200 text-stone-500 p-2 rounded-full transition-colors z-20"><X size={20} /></button>

           {!isSuccess ? (
             <>
               <h3 className="text-lg font-bold text-stone-900 mb-6">选择订阅计划</h3>
               <div className="grid gap-4 mb-8">
                   <button 
                      onClick={() => setSelectedPlan('yearly')}
                      className={`relative p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${selectedPlan === 'yearly' ? `border-stone-900 bg-stone-50 shadow-md` : 'border-stone-200 hover:border-stone-300'}`}
                   >
                       <div className={`absolute -top-3 left-4 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm bg-stone-900`}>BEST VALUE</div>
                       <div><div className="font-bold text-stone-900">年度会员</div><div className="text-xs text-stone-500">¥19.00 / 月</div></div>
                       <div className="text-right"><div className="text-2xl font-bold text-stone-900">¥228</div><div className="text-[10px] text-stone-400 line-through">¥348</div></div>
                   </button>

                   <button 
                      onClick={() => setSelectedPlan('monthly')}
                      className={`relative p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${selectedPlan === 'monthly' ? `border-stone-900 bg-stone-50 shadow-md` : 'border-stone-200 hover:border-stone-300'}`}
                   >
                       <div><div className="font-bold text-stone-900">月度会员</div><div className="text-xs text-stone-500">灵活订阅</div></div>
                       <div className="text-right"><div className="text-2xl font-bold text-stone-900">¥29</div></div>
                   </button>
               </div>
               
               {/* HIGH CONTRAST BUTTON FIX: Black background with White text */}
               <button onClick={handlePurchase} className={`w-full bg-black text-white py-4 rounded-xl font-bold shadow-xl hover:bg-stone-800 transition-all mb-6 flex items-center justify-center gap-2 active:scale-95`}>
                   <CreditCard size={18} /> 立即订阅
               </button>
               
               <div className="border-t border-stone-100 pt-6">
                  <div className="flex gap-2">
                    <input id="invite-input" type="text" value={inviteCode} onChange={(e) => { setInviteCode(e.target.value); setError(''); }} placeholder="输入兑换代码" className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-stone-900 focus:outline-none focus:ring-2 text-sm font-mono tracking-wider uppercase" />
                    <button onClick={handleVerify} disabled={!inviteCode} className="bg-white border border-stone-200 text-stone-600 px-4 rounded-xl font-bold hover:bg-stone-50 transition-colors text-sm">兑换</button>
                  </div>
                  {error && <p className="text-red-500 text-xs mt-2 font-medium animate-pulse">{error}</p>}
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center py-8 relative z-10">
                 <div className="relative mb-8 z-10">
                     <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-2xl animate-scale-in relative z-20 bg-stone-900">
                        <Crown size={64} className="text-amber-400 drop-shadow-md" strokeWidth={2.5} />
                        <Sparkles className="absolute -top-4 -right-4 text-amber-500 animate-spin-slow" size={32} />
                     </div>
                 </div>
                 <h2 className="text-4xl font-serif font-bold text-stone-900 mb-3 animate-slide-up-fade" style={{ animationDelay: '0.4s' }}>Welcome to Pro</h2>
                 <button onClick={onClose} className="bg-stone-900 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all animate-slide-up-fade flex items-center gap-2 mx-auto group mt-8">
                     <span>开始探索</span> <ChevronRight size={18} />
                 </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};


enum Tab {
  LESSON = 'lesson',
  TUTOR = 'tutor'
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

// --- Background Particles Component ---
const BackgroundParticles: React.FC = () => {
  const particles = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 20,
    duration: 15 + Math.random() * 20,
    size: 10 + Math.random() * 20,
    symbol: ['♪', '♫', '♩', '♭', '♯', '𝄞'][Math.floor(Math.random() * 6)]
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute text-stone-200/40 font-serif"
          style={{
            left: `${p.left}%`,
            top: '105%',
            fontSize: `${p.size}px`,
            animation: `floatUp ${p.duration}s linear infinite`,
            animationDelay: `-${p.delay}s`,
            opacity: 0, 
          }}
        >
          {p.symbol}
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// --- Procedural Ambience Hook ---
const useAmbience = (type: 'off' | 'rain' | 'cafe' | 'white', volume: number) => {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const nodesRef = useRef<any[]>([]);
    
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
            gainNode.gain.value = volume * 0.1; 
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
                filter.frequency.value = type === 'rain' ? 400 : 1000;
                
                noise.connect(filter);
                filter.connect(gainNode);
                noise.start();
                nodesRef.current.push(noise);
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
                filter.frequency.value = 150; 
                
                noise.connect(filter);
                filter.connect(gainNode);
                noise.start();
                nodesRef.current.push(noise);
            }
            
            nodesRef.current.push(gainNode);
        };

        init();

        return () => {
            stopAmbience();
        };
    }, [type, volume]); 

    const stopAmbience = () => {
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
  const [activeTab, setActiveTab] = useState<Tab>(Tab.LESSON);
  const [activeLesson, setActiveLesson] = useState<LessonTopic>(LessonTopic.HOME); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  
  // --- User & Auth State ---
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // --- Global User Settings ---
  const [userSettings, setUserSettings] = useState<UserSettings>({
      themeColor: 'amber',
      customColor: '', 
      volume: 80,
      dailyGoal: 15,
      ambience: 'off'
  });

  // --- Achievement System ---
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [unlockedToast, setUnlockedToast] = useState<Achievement | null>(null);

  // Subscription States
  const [isPro, setIsPro] = useState<boolean>(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  
  const [openGroupIndex, setOpenGroupIndex] = useState<number | null>(0);

  // Activate Ambience
  useAmbience(userSettings.ambience, userSettings.volume / 100);

  // Load User Data
  useEffect(() => {
    const storedUser = localStorage.getItem('pt_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    
    const savedPro = localStorage.getItem('pianoTheoryPro');
    if (savedPro === 'true') setIsPro(true);

    const savedProgress = localStorage.getItem('pt_progress');
    if (savedProgress) setCompletedLessons(JSON.parse(savedProgress));

    const savedAchievements = localStorage.getItem('pt_achievements');
    if (savedAchievements) setAchievements(JSON.parse(savedAchievements));
  }, []);

  // Save Progress & Check Achievements
  useEffect(() => {
      localStorage.setItem('pt_progress', JSON.stringify(completedLessons));
      localStorage.setItem('pt_achievements', JSON.stringify(achievements));
      
      // Check logic
      const checkUnlock = (id: string, condition: boolean) => {
          setAchievements(prev => {
              const target = prev.find(a => a.id === id);
              if (target && !target.unlocked && condition) {
                  setUnlockedToast({ ...target, unlocked: true });
                  return prev.map(a => a.id === id ? { ...a, unlocked: true, progress: a.maxProgress } : a);
              }
              return prev;
          });
      };

      if (completedLessons.length >= 1) checkUnlock('first_lesson', true);
      if (completedLessons.length >= 5) checkUnlock('scholar', true);
      if (isPro) checkUnlock('pro_member', true);
      
      const hour = new Date().getHours();
      if (hour >= 22 || hour < 4) checkUnlock('night_owl', true);

  }, [completedLessons, isPro]);


  const handleLogin = (profile: UserProfile) => {
      setUser(profile);
      localStorage.setItem('pt_user', JSON.stringify(profile));
      setShowAuthModal(false);
  };

  const handleLogout = () => {
      setUser(null);
      setIsPro(false);
      localStorage.removeItem('pt_user');
      localStorage.removeItem('pianoTheoryPro');
      setUserSettings(prev => ({ ...prev, themeColor: 'amber', customColor: '' })); 
      setActiveLesson(LessonTopic.HOME);
  };

  const handleProSuccess = () => {
    setIsPro(true);
    localStorage.setItem('pianoTheoryPro', 'true');
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
    // ... Other lessons
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

  // --- Dynamic Styling based on Theme ---
  const getThemeClass = (type: 'text' | 'bg' | 'border' | 'gradient' | 'hoverBg' | 'activeBg' | 'sidebarBg') => {
      const { themeColor, customColor } = userSettings;
      
      // Handle Custom Color
      if (themeColor === 'custom' && customColor) {
          // Dynamic styles can be tricky with Tailwind classes without arbitrary values.
          // We will return generic base classes and apply colors via style prop where needed, 
          // but for this helper, we'll use arbitrary values where possible.
          // Note: Full hex support requires standard format.
          const hex = customColor;
          
          if (type === 'text') return `text-[${hex}]`; // Arbitrary value
          if (type === 'bg') return `bg-[${hex}]`;
          if (type === 'border') return `border-[${hex}]`;
          if (type === 'gradient') return `from-[${hex}] to-[${hex}]/80`; // Approximate
          if (type === 'hoverBg') return `hover:bg-[${hex}]/10`; // Opacity modifier
          if (type === 'activeBg') return `bg-[${hex}]/20`;
          if (type === 'sidebarBg') return `bg-white`; 
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
      // 1. Check Login
      if (!checkAccess(false)) return;

      // 2. Check Pro
      if (!checkAccess(isProLesson)) return;

      // 3. Mark Progress
      if (!completedLessons.includes(lessonId)) {
          setCompletedLessons(prev => [...prev, lessonId]);
      }

      setActiveLesson(lessonId as LessonTopic);
      setIsMobileMenuOpen(false);
  };

  const renderLessonContent = () => {
    // Pass user settings to StartPage
    if (activeLesson === LessonTopic.HOME) {
        return <StartPage 
            onNavigate={handleLessonSelect} 
            lessons={lessons} 
            isPro={isPro} 
            onUpgrade={() => setShowSubscribeModal(true)} 
            userSettings={userSettings}
            onUpdateSettings={setUserSettings}
            user={user}
            achievements={achievements}
            onLogout={handleLogout}
        />;
    }

    // Phase 1
    if (activeLesson === LessonTopic.SIGHT_READING) return <GenericLesson level="Level 1" title="视奏入门" subtitle="Sight Reading" sections={[{ title: "看在前面", content: "眼睛永远走在手前面。", icon: Eye }]} />
    if (activeLesson === LessonTopic.EAR_TRAINING) return <GenericLesson level="Level 2" title="练耳基础" subtitle="Ear Training" sections={[{ title: "音程色彩", content: "分辨大三度（快乐）和小三度（悲伤）。", icon: Mic2 }]} />

    // Phase 5: Forms
    if (activeLesson === LessonTopic.FORM_BINARY_TERNARY) return <FormBinaryTernaryLesson />;
    if (activeLesson === LessonTopic.FORM_SONATA) return <FormSonataLesson />;
    if (activeLesson === LessonTopic.FORM_RONDO) return <FormRondoLesson />;

    // Phase 6: Styles
    if (activeLesson === LessonTopic.STYLE_JAZZ_BASIC) return <JazzBasicsLesson />;
    if (activeLesson === LessonTopic.STYLE_POP) return <PopStylesLesson />;

    // Standard Components
    return (
      <div key={activeLesson} className="max-w-5xl mx-auto w-full pb-20 relative z-10">
        {activeLesson === LessonTopic.SLUR && (
          <div className="space-y-8">
            <header className="mb-10 animate-slideUp">
               <div className={`inline-block px-3 py-1 ${getThemeClass('activeBg')} ${getThemeClass('text')} rounded-full text-xs font-bold tracking-wider uppercase mb-3`}>Level 3 - Expression</div>
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
                 <h2 className="text-2xl font-bold serif text-stone-800 flex items-center gap-2"><Activity size={24} className={getThemeClass('text')} /> 易混淆概念辨析</h2>
                 <div className="h-px bg-stone-200 flex-1"></div>
               </div>
               <SlurVsTie />
            </section>
          </div>
        )}
        
        {/* Phase 1 */}
        {activeLesson === LessonTopic.CLEFS && <ClefsLesson />}
        {activeLesson === LessonTopic.ACCIDENTALS && <AccidentalsLesson />}
        {activeLesson === LessonTopic.RHYTHM && <TimeSignatureLesson />}
        {activeLesson === LessonTopic.RESTS && <RestsLesson />}
        {activeLesson === LessonTopic.TRIPLETS && <TripletsLesson />}
        {activeLesson === LessonTopic.SYNCOPATION && <SyncopationLesson />}
        {activeLesson === LessonTopic.POLYRHYTHMS && <PolyrhythmsLesson />}
        
        {/* Phase 2 */}
        {activeLesson === LessonTopic.INTERVALS && <IntervalsLesson />}
        {activeLesson === LessonTopic.CONSONANCE && <ConsonanceLesson />}
        {activeLesson === LessonTopic.SCALES && <ScalesLesson />}
        {activeLesson === LessonTopic.KEY_SIGNATURES && <KeySignaturesLesson />}
        {activeLesson === LessonTopic.ENHARMONICS && <EnharmonicsLesson />}
        {activeLesson === LessonTopic.MODES && <ModesLesson />}
        
        {/* Phase 3 */}
        {activeLesson === LessonTopic.TEMPO && <TempoLesson />}
        {activeLesson === LessonTopic.DYNAMICS && <DynamicsLesson />}
        {activeLesson === LessonTopic.ARTICULATIONS && <ArticulationsLesson />}
        {activeLesson === LessonTopic.PEDALING && <PedalingLesson />}
        {activeLesson === LessonTopic.RUBATO && <RubatoLesson />}
        {activeLesson === LessonTopic.ORNAMENTATION && <OrnamentationLesson />}
        
        {/* Phase 4 */}
        {activeLesson === LessonTopic.CHORDS && <ChordsLesson />}
        {activeLesson === LessonTopic.INVERSIONS && <InversionsLesson />}
        {activeLesson === LessonTopic.ARPEGGIOS && <ArpeggiosLesson />}
        {activeLesson === LessonTopic.SEVENTH_CHORDS && <SeventhChordsLesson />}
        {activeLesson === LessonTopic.VOICE_LEADING && <VoiceLeadingLesson />}
        {activeLesson === LessonTopic.CADENCES && <CadencesLesson />}
        {activeLesson === LessonTopic.COUNTERPOINT && <CounterpointLesson />}
        
        {/* Phase 6 */}
        {activeLesson === LessonTopic.JAZZ_EXTENSIONS && <JazzExtensionsLesson />}
        
        {/* Phase 7 */}
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
    `}</style>
    {showSplash && (
      <SplashScreen 
        onStartExiting={() => setIsAppVisible(true)} 
        onFinish={() => setShowSplash(false)} 
      />
    )}
    <div className={`h-screen flex flex-col md:flex-row bg-[#FAFAF9] overflow-hidden font-sans transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isAppVisible ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-sm'}`}>
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />

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
            <div className={`bg-gradient-to-tr ${getThemeClass('gradient')} p-1.5 rounded-lg text-white shadow-md transition-colors duration-500`}><Music size={18} /></div>
            <span className="font-bold serif text-stone-900 tracking-tight">Piano Theory</span>
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg active:scale-95 transition-transform">
            {isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
         </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-80 ${getThemeClass('sidebarBg')} border-r border-stone-200/60 flex flex-col backdrop-blur-xl md:backdrop-blur-none shadow-2xl md:shadow-none
        ${isMobileMenuOpen ? 'sidebar-open-anim' : 'sidebar-closed-anim'}
        sidebar-desktop-reset transition-colors duration-500
      `}>
        <div 
            onClick={() => { setActiveLesson(LessonTopic.HOME); setIsMobileMenuOpen(false); }}
            className="p-8 hidden md:flex items-center gap-3 mb-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
           <div className={`bg-gradient-to-tr ${getThemeClass('gradient')} p-3 rounded-xl shadow-lg text-white transform hover:rotate-3 transition-transform duration-300`}>
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
                    <Layout size={18} className={`transition-colors duration-500 ${activeLesson === LessonTopic.HOME ? getThemeClass('text') : 'text-stone-400 group-hover:text-stone-600'}`} />
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
                        <div className={`text-[11px] font-black uppercase tracking-wide flex items-center gap-2 transition-colors duration-300 ${isOpen ? getThemeClass('text') : 'text-stone-900'}`}>
                            {group.title}
                            {(group as any).isPro && !isPro && <span className={`text-[9px] px-1.5 py-0.5 rounded ml-2 flex items-center gap-1 bg-stone-900 text-white`}><Lock size={8} /> PRO</span>}
                            {(group as any).isPro && isPro && <span className={`${getThemeClass('bg')}/10 ${getThemeClass('text')} text-[9px] px-1.5 py-0.5 rounded ml-2 flex items-center gap-1 font-bold`}>UNLOCKED</span>}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-1 font-medium">{group.description}</div>
                    </div>
                    <div className={`p-1.5 rounded-lg transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isOpen ? `${getThemeClass('bg')}/10 ${getThemeClass('text')} rotate-180` : 'text-stone-400 group-hover:bg-stone-200'}`}>
                       <ChevronDown size={14} strokeWidth={3} />
                    </div>
                  </button>

                  <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      <div className={`space-y-1.5 mt-1 pb-4 relative pl-2 transition-all duration-500 ease-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                        <div className={`absolute left-6 top-0 bottom-2 w-px -z-10 bg-stone-100`}></div>
                        {group.items.map((lesson) => {
                            const isLocked = (group as any).isPro && !isPro;
                            const isCompleted = completedLessons.includes(lesson.id);
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => handleLessonSelect(lesson.id, (group as any).isPro)}
                                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative ${
                                  activeLesson === lesson.id 
                                  ? `${getThemeClass('activeBg')} ${getThemeClass('text').replace('text-','text-emerald-').replace('emerald','stone-900')} shadow-sm ring-1 ring-black/5 translate-x-1` 
                                  : `text-stone-600 hover:bg-stone-50 hover:text-stone-900 hover:translate-x-1`
                                }`}
                              >
                                <div className={`p-1.5 rounded-lg transition-all duration-300 ${activeLesson === lesson.id ? `${getThemeClass('bg')}/20 ${getThemeClass('text')}` : (isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-white border border-stone-100 text-stone-400 group-hover:border-stone-200 group-hover:text-stone-500')}`}>
                                  {isCompleted ? <Check size={16} strokeWidth={2.5}/> : <lesson.icon size={16} strokeWidth={activeLesson === lesson.id ? 2.5 : 2} />}
                                </div>
                                <div className="flex-1 z-10 flex justify-between items-center">
                                  <div className={`font-bold text-[13px]`}>{lesson.label}</div>
                                  {isLocked && <Lock size={12} className="text-stone-300" />}
                                </div>
                                {activeLesson === lesson.id && <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${getThemeClass('bg')}`}></div>}
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
                onClick={() => setShowSubscribeModal(true)}
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
            <div className={`w-full ${getThemeClass('bg')}/10 border ${getThemeClass('border')} ${getThemeClass('text')} py-3 rounded-xl flex items-center justify-center gap-2 mb-4 cursor-default transition-all duration-500`}>
                <Crown size={16} fill="currentColor" />
                <span className="font-bold text-sm">Pro 会员已激活</span>
            </div>
          )}
          
          {/* Ambience Status Mini */}
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
         <BackgroundParticles />
         <div className={`absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#FAFAF9] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${hasScrolled ? 'opacity-100' : 'opacity-0'}`}></div>

         <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 lg:px-20 w-full z-10 scroll-smooth relative">
            {activeTab === Tab.LESSON ? (
               renderLessonContent()
            ) : (
               <div className="h-full flex flex-col max-w-4xl mx-auto pb-6 animate-slideUp">
                  <header className="mb-6 flex items-baseline justify-between">
                    <div>
                        <h2 className="text-3xl font-bold serif text-stone-900">智能助教</h2>
                        <p className="text-stone-500 text-sm mt-1">基于 Gemini 2.5 Flash 模型</p>
                    </div>
                    {isPro && <div className={`${getThemeClass('bg')}/10 ${getThemeClass('text')} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border ${getThemeClass('border')} transition-colors duration-500`}><Crown size={12} fill="currentColor" /> Pro Unlocked</div>}
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
            )}
         </div>
      </main>
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-30 md:hidden animate-fadeIn"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
    </>
  );
};

export default App;
