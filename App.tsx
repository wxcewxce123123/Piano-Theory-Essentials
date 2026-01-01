
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BookOpen, Music, MessageCircle, Clock, Activity, Volume2, Ruler, LayoutGrid, Sparkles, Menu, X, ChevronRight, Hash, PauseCircle, Gauge, AlignCenterVertical, Disc, RefreshCw, Waves, Zap, Flower2, Wind, Hourglass, StopCircle, Layers, MoveRight, ChevronDown, Palette, MousePointerClick, ArrowUp, Music3, ArrowLeftRight, GitMerge, Calculator, SplitSquareHorizontal, Infinity, CloudFog, Ear, Route, Crown, Check, Lock, CreditCard, Ticket, Star, Zap as ZapIcon, Dices, FlipHorizontal, AudioWaveform, AlignVerticalSpaceAround, Network, Divide,  Radar, Radio, Clock as ClockIcon } from 'lucide-react';
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
import AITutor from './components/AITutor';

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

// --- Subscription Modal Component ---
interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  useEffect(() => {
    if (isOpen) {
      setInviteCode('');
      setError('');
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerify = () => {
    if (inviteCode === '8888') {
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        // Don't close immediately, let user see animation
        // onClose(); 
      }, 1000);
    } else {
      setError('无效的邀请码。请重试。');
    }
  };

  const handlePurchase = () => {
      // Mock purchase
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        // onClose();
      }, 1000);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl relative overflow-hidden animate-fadeIn transform transition-all scale-100 border border-stone-200 flex flex-col md:flex-row">
        
        {/* Left: Benefits & Header */}
        <div className="md:w-5/12 bg-stone-900 text-white p-8 flex flex-col relative overflow-hidden">
           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
           <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-[60px] -mr-20 -mt-20"></div>
           
           <div className="relative z-10 flex-1">
               <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/10">
                   <Crown size={24} className="text-amber-400" fill="currentColor" />
               </div>
               <h2 className="text-3xl font-bold font-serif mb-2">Piano Theory <span className="text-amber-400">Pro</span></h2>
               <p className="text-stone-400 text-sm mb-8">解锁所有高级课程，掌握音乐的深层逻辑。</p>

               <ul className="space-y-4">
                   <li className="flex items-start gap-3">
                       <div className="mt-0.5 bg-amber-500/20 p-1 rounded-full"><Check size={12} className="text-amber-400" /></div>
                       <span className="text-sm text-stone-300"><strong>Level 5 大师课程</strong> (对位法、十二音等)</span>
                   </li>
                   <li className="flex items-start gap-3">
                       <div className="mt-0.5 bg-amber-500/20 p-1 rounded-full"><Check size={12} className="text-amber-400" /></div>
                       <span className="text-sm text-stone-300"><strong>无限 AI 助教</strong> 对话与测验</span>
                   </li>
                   <li className="flex items-start gap-3">
                       <div className="mt-0.5 bg-amber-500/20 p-1 rounded-full"><Check size={12} className="text-amber-400" /></div>
                       <span className="text-sm text-stone-300"><strong>深度互动图谱</strong> Tonnetz 网络与频谱分析</span>
                   </li>
               </ul>
           </div>
           
           <div className="relative z-10 mt-8 pt-6 border-t border-white/10 text-center">
               <p className="text-[10px] text-stone-500 uppercase tracking-widest">Trusted by 10,000+ Musicians</p>
           </div>
        </div>

        {/* Right: Plans & Actions */}
        <div className="md:w-7/12 bg-white p-8 flex flex-col overflow-y-auto max-h-[80vh] custom-scrollbar relative">
           <button 
             onClick={onClose}
             className="absolute top-4 right-4 bg-stone-100 hover:bg-stone-200 text-stone-500 p-2 rounded-full transition-colors z-20"
           >
             <X size={20} />
           </button>

           {!isSuccess ? (
             <>
               <h3 className="text-lg font-bold text-stone-900 mb-6">选择订阅计划</h3>
               
               <div className="grid gap-4 mb-8">
                   {/* Yearly Plan */}
                   <button 
                      onClick={() => setSelectedPlan('yearly')}
                      className={`relative p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${selectedPlan === 'yearly' ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-stone-200 hover:border-stone-300'}`}
                   >
                       <div className="absolute -top-3 left-4 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">BEST VALUE</div>
                       <div>
                           <div className="font-bold text-stone-900">年度会员 (Yearly)</div>
                           <div className="text-xs text-stone-500">¥19.00 / 月</div>
                       </div>
                       <div className="text-right">
                           <div className="text-2xl font-bold text-stone-900">¥228</div>
                           <div className="text-[10px] text-green-600 font-bold bg-green-100 px-1.5 py-0.5 rounded">省 32%</div>
                       </div>
                   </button>

                   {/* Monthly Plan */}
                   <button 
                      onClick={() => setSelectedPlan('monthly')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${selectedPlan === 'monthly' ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-stone-200 hover:border-stone-300'}`}
                   >
                       <div>
                           <div className="font-bold text-stone-900">月度会员 (Monthly)</div>
                           <div className="text-xs text-stone-500">灵活订阅，随时取消</div>
                       </div>
                       <div className="text-right">
                           <div className="text-2xl font-bold text-stone-900">¥28</div>
                           <div className="text-xs text-stone-400">/ 月</div>
                       </div>
                   </button>
               </div>

               <button 
                  onClick={handlePurchase}
                  className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold shadow-xl hover:bg-stone-800 active:scale-[0.98] transition-all mb-6 flex items-center justify-center gap-2"
               >
                   <CreditCard size={18} />
                   立即订阅 {selectedPlan === 'yearly' ? '¥228' : '¥28'}
               </button>

               <div className="border-t border-stone-100 pt-6">
                  <div className="flex items-center gap-2 mb-4 cursor-pointer group" onClick={() => document.getElementById('invite-input')?.focus()}>
                      <Ticket size={16} className="text-stone-400 group-hover:text-amber-500 transition-colors" />
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-widest group-hover:text-stone-700">使用邀请码 (Redeem Code)</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <input 
                      id="invite-input"
                      type="text" 
                      value={inviteCode}
                      onChange={(e) => { setInviteCode(e.target.value); setError(''); }}
                      placeholder="输入代码 (如: 8888)"
                      className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono tracking-wider uppercase"
                    />
                    <button 
                      onClick={handleVerify}
                      disabled={!inviteCode}
                      className="bg-white border border-stone-200 text-stone-600 px-4 rounded-xl font-bold hover:bg-stone-50 hover:text-stone-900 transition-colors text-sm disabled:opacity-50"
                    >
                      兑换
                    </button>
                  </div>
                  {error && <p className="text-red-500 text-xs mt-2 font-medium animate-pulse">{error}</p>}
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center py-8 relative z-10">
                 {/* Animation Styles */}
                 <style>{`
                   @keyframes explode {
                      0% { transform: rotate(var(--angle)) translateX(0) rotate(0deg); opacity: 0; }
                      10% { opacity: 1; }
                      100% { transform: rotate(var(--angle)) translateX(var(--dist)) rotate(720deg); opacity: 0; }
                   }
                   .animate-explode {
                      animation: explode 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                   }
                   @keyframes scale-in-elastic {
                      0% { transform: scale(0); opacity: 0; }
                      60% { transform: scale(1.1); opacity: 1; }
                      100% { transform: scale(1); opacity: 1; }
                   }
                   .animate-scale-in {
                      animation: scale-in-elastic 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                   }
                   @keyframes slide-up-fade {
                      0% { opacity: 0; transform: translateY(20px); }
                      100% { opacity: 1; transform: translateY(0); }
                   }
                   .animate-slide-up-fade {
                      animation: slide-up-fade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                      opacity: 0; /* Ensure hidden initially */
                   }
                 `}</style>
                 
                 {/* Confetti Explosion - Delay slightly to match the crown impact */}
                 <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible z-0">
                    {Array.from({ length: 50 }).map((_, i) => {
                        const angle = Math.random() * 360;
                        const dist = 100 + Math.random() * 200;
                        const size = 4 + Math.random() * 6;
                        // Delay logic: start after icon appears
                        const delay = 0.2 + Math.random() * 0.2;
                        return (
                          <div 
                              key={i}
                              className="absolute animate-explode"
                              style={{
                                  '--angle': `${angle}deg`,
                                  '--dist': `${dist}px`,
                                  color: ['#f59e0b', '#fbbf24', '#fcd34d', '#3b82f6', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)],
                                  fontSize: `${size}px`,
                                  animationDelay: `${delay}s`,
                                  top: '50%',
                                  left: '50%'
                              } as React.CSSProperties}
                          >
                              {['★', '●', '▲', '♪', '✦', '✿'][Math.floor(Math.random() * 6)]}
                          </div>
                        )
                    })}
                 </div>

                 {/* Success Icon Container */}
                 <div className="relative mb-8 z-10">
                     <div className="w-32 h-32 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full flex items-center justify-center shadow-2xl shadow-amber-200 animate-scale-in relative z-20">
                        <Crown size={64} className="text-white drop-shadow-md" strokeWidth={2.5} />
                        <Sparkles className="absolute -top-4 -right-4 text-amber-500 animate-spin-slow" size={32} />
                     </div>
                     {/* Ping ring effect delayed */}
                     <div className="absolute inset-0 bg-amber-400/30 rounded-full animate-ping opacity-0 z-10" style={{ animationDelay: '0.6s', animationDuration: '2s' }}></div>
                 </div>
                 
                 {/* Text Content - Sequenced */}
                 <div className="relative z-10">
                     <h2 className="text-4xl font-serif font-bold text-stone-900 mb-3 animate-slide-up-fade" style={{ animationDelay: '0.4s' }}>Welcome to Pro</h2>
                     
                     <div className="flex justify-center mb-6 animate-slide-up-fade" style={{ animationDelay: '0.5s' }}>
                        <div className="h-1.5 w-16 bg-amber-400 rounded-full opacity-80"></div>
                     </div>
                     
                     <p className="text-stone-500 max-w-xs mx-auto text-sm leading-relaxed mb-8 animate-slide-up-fade" style={{ animationDelay: '0.6s' }}>
                         大师之路已为您开启。<br/>
                         现在，您可以无限畅享所有高级课程与 AI 助教服务。
                     </p>
                     
                     <button 
                       onClick={onClose} 
                       className="bg-stone-900 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all animate-slide-up-fade flex items-center gap-2 mx-auto group"
                       style={{ animationDelay: '0.8s' }}
                     >
                         <span>开始探索</span>
                         <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                     </button>
                 </div>
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
  // Level 1: Foundations
  CLEFS = 'clefs',
  ACCIDENTALS = 'accidentals',
  RHYTHM = 'rhythm',
  RESTS = 'rests',
  
  // Level 2: Expression
  TEMPO = 'tempo',
  DYNAMICS = 'dynamics',
  ARTICULATIONS = 'articulations',
  SLUR = 'slur',
  PEDALING = 'pedaling',
  RUBATO = 'rubato',

  // Level 3: Theory
  INTERVALS = 'intervals',
  CONSONANCE = 'consonance',
  SCALES = 'scales',
  KEY_SIGNATURES = 'key_signatures',
  ENHARMONICS = 'enharmonics', 
  MODES = 'modes',

  // Level 4: Harmony & Advanced
  CHORDS = 'chords',
  INVERSIONS = 'inversions',
  VOICE_LEADING = 'voice_leading',
  SEVENTH_CHORDS = 'seventh_chords',
  JAZZ_EXTENSIONS = 'jazz_extensions', 
  CADENCES = 'cadences',
  ARPEGGIOS = 'arpeggios',
  ORNAMENTATION = 'ornamentation',
  
  // Rhythm Advanced
  TRIPLETS = 'triplets', 
  SYNCOPATION = 'syncopation',

  // Level 5: Master Class
  POLYRHYTHMS = 'polyrhythms', 
  COUNTERPOINT = 'counterpoint',
  NEGATIVE_HARMONY = 'negative_harmony',
  OVERTONE_SERIES = 'overtone_series', 
  QUARTAL_HARMONY = 'quartal_harmony', 
  ALEATORIC = 'aleatoric', 
  IMPRESSIONISM = 'impressionism',
  TWELVE_TONE = 'twelve_tone',
  BITONALITY = 'bitonality',
  MINIMALISM = 'minimalism',
  NEO_RIEMANNIAN = 'neo_riemannian',
  MICROTONALITY = 'microtonality', 
  SPECTRALISM = 'spectralism', // New
  PITCH_CLASS_SETS = 'pitch_class_sets', // New
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.LESSON);
  const [activeLesson, setActiveLesson] = useState<LessonTopic>(LessonTopic.CLEFS); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  
  // Subscription States
  const [isPro, setIsPro] = useState<boolean>(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  
  const [openGroupIndex, setOpenGroupIndex] = useState<number | null>(0);

  // Check Local Storage for Pro status
  useEffect(() => {
    const savedProStatus = localStorage.getItem('pianoTheoryPro');
    if (savedProStatus === 'true') {
      setIsPro(true);
    }
  }, []);

  const handleProSuccess = () => {
    setIsPro(true);
    localStorage.setItem('pianoTheoryPro', 'true');
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
      title: "阶段一：识谱与基础 (Foundations)",
      description: "零基础起步，读懂乐谱地图",
      items: [
        { id: LessonTopic.CLEFS, icon: AlignCenterVertical, label: '谱号 (Clefs)', desc: '高音与低音的定位' },
        { id: LessonTopic.ACCIDENTALS, icon: ArrowUp, label: '升降号 (Accidentals)', desc: '黑键的秘密' },
        { id: LessonTopic.RHYTHM, icon: Clock, label: '节拍 (Rhythm)', desc: '4/4 与 6/8 的律动' },
        { id: LessonTopic.RESTS, icon: PauseCircle, label: '休止符 (Rests)', desc: '沉默的艺术' },
      ]
    },
    { 
      title: "阶段二：表情与呼吸 (Expression)",
      description: "让演奏不再像机器人",
      items: [
        { id: LessonTopic.TEMPO, icon: Gauge, label: '速度 (Tempo)', desc: 'BPM 与意大利术语' },
        { id: LessonTopic.DYNAMICS, icon: Volume2, label: '强弱 (Dynamics)', desc: '力度的色彩变化' },
        { id: LessonTopic.ARTICULATIONS, icon: MousePointerClick, label: '运音法 (Articulations)', desc: '跳音、重音与保持音' },
        { id: LessonTopic.SLUR, icon: Activity, label: '连音线 (Slur)', desc: '连奏与乐句呼吸' },
        { id: LessonTopic.PEDALING, icon: Wind, label: '踏板 (Pedaling)', desc: '钢琴的灵魂呼吸' },
        { id: LessonTopic.RUBATO, icon: Hourglass, label: '弹性速度 (Rubato)', desc: '时间的魔法' },
      ]
    },
    { 
      title: "阶段三：音高与调性 (Pitch & Theory)",
      description: "理解音乐的物理与逻辑",
      items: [
        { id: LessonTopic.INTERVALS, icon: Ruler, label: '音程 (Intervals)', desc: '音符之间的距离' },
        { id: LessonTopic.CONSONANCE, icon: Ear, label: '协和感 (Consonance)', desc: '为什么有些音好听？' },
        { id: LessonTopic.SCALES, icon: Hash, label: '音阶 (Scales)', desc: '全全半的排列智慧' },
        { id: LessonTopic.KEY_SIGNATURES, icon: Disc, label: '调号 (Key Signatures)', desc: '五度圈的奥秘' },
        { id: LessonTopic.ENHARMONICS, icon: ArrowLeftRight, label: '同音异名 (Enharmonics)', desc: '升C 还是 降D？' },
        { id: LessonTopic.MODES, icon: Palette, label: '调式 (Modes)', desc: '多利安与利底亚色彩' },
      ]
    },
    { 
      title: "阶段四：和声与织体 (Harmony)",
      description: "构建丰富立体的声音",
      items: [
        { id: LessonTopic.CHORDS, icon: LayoutGrid, label: '和弦 (Chords)', desc: '大小三和弦色彩' },
        { id: LessonTopic.INVERSIONS, icon: RefreshCw, label: '转位 (Inversions)', desc: '平滑的和声连接' },
        { id: LessonTopic.VOICE_LEADING, icon: Route, label: '声部连接 (Voice Leading)', desc: '懒惰是美德' },
        { id: LessonTopic.SEVENTH_CHORDS, icon: Layers, label: '七和弦 (7th Chords)', desc: '爵士乐的基石' },
        { id: LessonTopic.JAZZ_EXTENSIONS, icon: ZapIcon, label: '爵士扩展音 (Extensions)', desc: '9/11/13和弦的色彩' },
        { id: LessonTopic.CADENCES, icon: StopCircle, label: '终止式 (Cadences)', desc: '音乐的标点符号' },
        { id: LessonTopic.ARPEGGIOS, icon: Waves, label: '琶音 (Arpeggios)', desc: '流动的分解和弦' },
        { id: LessonTopic.TRIPLETS, icon: Music3, label: '三连音 (Triplets)', desc: '一拍分三份' },
        { id: LessonTopic.SYNCOPATION, icon: MoveRight, label: '切分音 (Syncopation)', desc: '反拍的摇摆感' },
        { id: LessonTopic.ORNAMENTATION, icon: Flower2, label: '装饰音 (Ornamentation)', desc: '音乐的珠宝' },
      ]
    },
    { 
      title: "阶段五：大师之路 (Master Class)",
      description: "探索现代音乐的深层逻辑",
      isPro: true, 
      items: [
        { id: LessonTopic.SPECTRALISM, icon: Radio, label: '频谱主义 (Spectralism)', desc: '音色即和声的物理本质' },
        { id: LessonTopic.PITCH_CLASS_SETS, icon: ClockIcon, label: '音级集合 (Pitch Class Sets)', desc: '后调性音乐的数学语言' },
        { id: LessonTopic.NEO_RIEMANNIAN, icon: Network, label: '新黎曼理论 (Tonnetz)', desc: '和弦的几何变换 (PLR)' },
        { id: LessonTopic.MICROTONALITY, icon: Divide, label: '微分音 (Microtonality)', desc: '打破十二平均律的限制' },
        { id: LessonTopic.NEGATIVE_HARMONY, icon: FlipHorizontal, label: '负面和声 (Negative Harmony)', desc: '音乐的镜像宇宙' },
        { id: LessonTopic.OVERTONE_SERIES, icon: AudioWaveform, label: '泛音列 (Overtone Series)', desc: '音色的物理本源' },
        { id: LessonTopic.QUARTAL_HARMONY, icon: AlignVerticalSpaceAround, label: '四度和声 (Quartal)', desc: '现代爵士的空灵感' },
        { id: LessonTopic.POLYRHYTHMS, icon: Zap, label: '复合节奏 (Polyrhythms)', desc: '3对4的数学舞蹈' },
        { id: LessonTopic.COUNTERPOINT, icon: GitMerge, label: '对位法 (Counterpoint)', desc: '旋律的独立与对话' },
        { id: LessonTopic.ALEATORIC, icon: Dices, label: '偶然音乐 (Aleatoric)', desc: '掷骰子决定的音乐' },
        { id: LessonTopic.IMPRESSIONISM, icon: CloudFog, label: '印象主义 (Impressionism)', desc: '全音阶的朦胧色彩' },
        { id: LessonTopic.TWELVE_TONE, icon: Calculator, label: '十二音序列 (12-Tone)', desc: '勋伯格的数学游戏' },
        { id: LessonTopic.BITONALITY, icon: SplitSquareHorizontal, label: '双调性 (Bitonality)', desc: '斯特拉文斯基的冲突' },
        { id: LessonTopic.MINIMALISM, icon: Infinity, label: '极简主义 (Minimalism)', desc: '相位的移动与微变' },
      ]
    }
  ];

  const toggleGroup = (index: number) => {
    setOpenGroupIndex(openGroupIndex === index ? null : index);
  };

  const handleLessonSelect = (lessonId: LessonTopic, isProLesson: boolean) => {
      if (isProLesson && !isPro) {
          setShowSubscribeModal(true);
          return;
      }
      setActiveLesson(lessonId);
      setIsMobileMenuOpen(false);
  };

  const renderLessonContent = () => {
    return (
      <div key={activeLesson} className="max-w-5xl mx-auto w-full pb-20 relative z-10">
        {activeLesson === LessonTopic.SLUR && (
          <div className="space-y-8">
            <header className="mb-10 animate-slideUp">
               <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 2 - Expression</div>
               <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6 leading-tight">
                 连音线 <span className="text-stone-300 font-light">|</span> Slur
               </h2>
               <p className="text-xl text-stone-600 font-light leading-relaxed max-w-2xl">
                 学会用手指“歌唱”。连音线不仅仅是一个符号，它代表了音乐如水流般的连贯性与乐句的自然呼吸。
               </p>
            </header>
            
            <div className="animate-slideUp stagger-1">
              <Explanation />
            </div>

            <div className="grid md:grid-cols-2 gap-6 animate-slideUp stagger-2 mt-8">
              <div className="bg-gradient-to-br from-blue-50/80 to-white p-8 rounded-3xl border border-blue-100/50 card-hover group">
                <h3 className="font-bold text-blue-900 flex items-center mb-4 text-xl">
                  <div className="bg-white p-2 rounded-xl mr-3 shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                    <Music size={22}/>
                  </div>
                  演奏技巧
                </h3>
                <p className="text-blue-900/70 leading-relaxed">
                  想象你的手指在键盘上“行走”而不是“跳跃”。力量从一个指尖平滑地传递到下一个指尖，就像接力跑一样，声音之间不能有缝隙。
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-50/80 to-white p-8 rounded-3xl border border-amber-100/50 card-hover group">
                <h3 className="font-bold text-amber-900 flex items-center mb-4 text-xl">
                  <div className="bg-white p-2 rounded-xl mr-3 shadow-sm text-amber-600 group-hover:scale-110 transition-transform">
                    <Sparkles size={22}/>
                  </div>
                  乐句感 (Phrasing)
                </h3>
                <p className="text-amber-900/70 leading-relaxed">
                  连音线勾勒出音乐的句子。就像说话需要换气，连音线的结束通常意味着一个乐思的自然停顿，此时手腕应柔和地“提起”呼吸。
                </p>
              </div>
            </div>

            <section className="mt-16 animate-slideUp stagger-3">
               <div className="flex items-center gap-6 mb-8">
                 <div className="h-px bg-stone-200 flex-1"></div>
                 <h2 className="text-2xl font-bold serif text-stone-800 flex items-center gap-2">
                   <Activity size={24} className="text-amber-500" />
                   易混淆概念辨析
                 </h2>
                 <div className="h-px bg-stone-200 flex-1"></div>
               </div>
               <SlurVsTie />
            </section>
          </div>
        )}
        
        {/* Foundations */}
        {activeLesson === LessonTopic.CLEFS && <ClefsLesson />}
        {activeLesson === LessonTopic.ACCIDENTALS && <AccidentalsLesson />}
        {activeLesson === LessonTopic.RHYTHM && <TimeSignatureLesson />}
        {activeLesson === LessonTopic.RESTS && <RestsLesson />}
        
        {/* Expression */}
        {activeLesson === LessonTopic.TEMPO && <TempoLesson />}
        {activeLesson === LessonTopic.TRIPLETS && <TripletsLesson />}
        {activeLesson === LessonTopic.ARTICULATIONS && <ArticulationsLesson />}
        {activeLesson === LessonTopic.RUBATO && <RubatoLesson />}
        {activeLesson === LessonTopic.SYNCOPATION && <SyncopationLesson />}
        {activeLesson === LessonTopic.DYNAMICS && <DynamicsLesson />}
        {activeLesson === LessonTopic.PEDALING && <PedalingLesson />}
        
        {/* Theory */}
        {activeLesson === LessonTopic.INTERVALS && <IntervalsLesson />}
        {activeLesson === LessonTopic.CONSONANCE && <ConsonanceLesson />}
        {activeLesson === LessonTopic.SCALES && <ScalesLesson />}
        {activeLesson === LessonTopic.ENHARMONICS && <EnharmonicsLesson />}
        {activeLesson === LessonTopic.MODES && <ModesLesson />}
        {activeLesson === LessonTopic.KEY_SIGNATURES && <KeySignaturesLesson />}
        
        {/* Advanced Harmony */}
        {activeLesson === LessonTopic.CHORDS && <ChordsLesson />}
        {activeLesson === LessonTopic.VOICE_LEADING && <VoiceLeadingLesson />}
        {activeLesson === LessonTopic.SEVENTH_CHORDS && <SeventhChordsLesson />}
        {activeLesson === LessonTopic.JAZZ_EXTENSIONS && <JazzExtensionsLesson />}
        {activeLesson === LessonTopic.CADENCES && <CadencesLesson />}
        {activeLesson === LessonTopic.INVERSIONS && <InversionsLesson />}
        {activeLesson === LessonTopic.ARPEGGIOS && <ArpeggiosLesson />}
        {activeLesson === LessonTopic.ORNAMENTATION && <OrnamentationLesson />}
        
        {/* Master Class */}
        {activeLesson === LessonTopic.NEGATIVE_HARMONY && <NegativeHarmonyLesson />}
        {activeLesson === LessonTopic.OVERTONE_SERIES && <OvertoneSeriesLesson />}
        {activeLesson === LessonTopic.QUARTAL_HARMONY && <QuartalHarmonyLesson />}
        {activeLesson === LessonTopic.POLYRHYTHMS && <PolyrhythmsLesson />}
        {activeLesson === LessonTopic.COUNTERPOINT && <CounterpointLesson />}
        {activeLesson === LessonTopic.ALEATORIC && <AleatoricLesson />}
        {activeLesson === LessonTopic.TWELVE_TONE && <TwelveToneLesson />}
        {activeLesson === LessonTopic.BITONALITY && <BitonalityLesson />}
        {activeLesson === LessonTopic.MINIMALISM && <MinimalismLesson />}
        {activeLesson === LessonTopic.IMPRESSIONISM && <ImpressionismLesson />}
        {activeLesson === LessonTopic.NEO_RIEMANNIAN && <NeoRiemannianLesson />}
        {activeLesson === LessonTopic.MICROTONALITY && <MicrotonalityLesson />}
        {activeLesson === LessonTopic.SPECTRALISM && <SpectralismLesson />}
        {activeLesson === LessonTopic.PITCH_CLASS_SETS && <PitchClassSetLesson />}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#FAFAF9] overflow-hidden font-sans">
      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={showSubscribeModal} 
        onClose={() => setShowSubscribeModal(false)}
        onSuccess={handleProSuccess}
      />

      {/* Mobile Header */}
      <div className="md:hidden glass px-4 py-3 flex justify-between items-center z-50 sticky top-0 border-b border-stone-200/50">
         <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-amber-500 to-orange-400 p-1.5 rounded-lg text-white shadow-md shadow-amber-500/20">
              <Music size={18} />
            </div>
            <span className="font-bold serif text-stone-900 tracking-tight">Piano Theory</span>
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg active:scale-95 transition-transform">
            {isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
         </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-80 bg-white/95 md:bg-white border-r border-stone-200/60 flex flex-col backdrop-blur-xl md:backdrop-blur-none
        transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 hidden md:flex items-center gap-3 mb-2">
           <div className="bg-gradient-to-tr from-amber-500 to-orange-400 p-3 rounded-xl shadow-lg shadow-amber-500/30 text-white transform hover:rotate-3 transition-transform duration-300">
             <Music size={26} strokeWidth={2.5} />
           </div>
           <div>
             <h1 className="text-lg font-bold serif tracking-wide text-stone-900 leading-none">Piano Theory</h1>
             <p className="text-stone-400 text-sm uppercase tracking-[0.2em] font-bold mt-1.5 ml-0.5">Interactive Guide</p>
           </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 py-2">
          <div className="bg-stone-100/80 p-1.5 rounded-2xl flex font-medium text-sm relative">
             <button
               onClick={() => { setActiveTab(Tab.LESSON); setIsMobileMenuOpen(false); }}
               className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 z-10 relative ${
                 activeTab === Tab.LESSON 
                  ? 'bg-white text-stone-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)] font-bold' 
                  : 'text-stone-500 hover:text-stone-700 hover:bg-white/50'
               }`}
             >
               <BookOpen size={16} /> 课程
             </button>
             <button
               onClick={() => { setActiveTab(Tab.TUTOR); setIsMobileMenuOpen(false); }}
               className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 z-10 relative ${
                 activeTab === Tab.TUTOR 
                  ? 'bg-white text-stone-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)] font-bold' 
                  : 'text-stone-500 hover:text-stone-700 hover:bg-white/50'
               }`}
             >
               <MessageCircle size={16} /> 助教
             </button>
          </div>
        </div>

        {/* Lesson List */}
        {activeTab === Tab.LESSON && (
          <nav className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar z-10 relative">
            {lessons.map((group, groupIdx) => {
              const isOpen = openGroupIndex === groupIdx;
              return (
                <div key={groupIdx} className="mb-2">
                  <button 
                    onClick={() => toggleGroup(groupIdx)}
                    className="w-full px-4 py-3 flex items-center justify-between group hover:bg-stone-50 rounded-xl transition-colors outline-none"
                  >
                    <div className="text-left">
                        <div className={`text-[11px] font-black uppercase tracking-wide flex items-center gap-2 transition-colors ${isOpen ? 'text-amber-600' : 'text-stone-900'}`}>
                            {group.title}
                            {/* Pro Badge for Level 5 */}
                            {(group as any).isPro && !isPro && (
                                <span className="bg-stone-900 text-white text-[9px] px-1.5 py-0.5 rounded ml-2 flex items-center gap-1">
                                    <Lock size={8} /> PRO
                                </span>
                            )}
                            {(group as any).isPro && isPro && (
                                <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded ml-2 flex items-center gap-1 font-bold">
                                    UNLOCKED
                                </span>
                            )}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-1 font-medium">{group.description}</div>
                    </div>
                    <div className={`p-1.5 rounded-lg transition-transform duration-300 ${isOpen ? 'bg-amber-100 text-amber-600 rotate-180' : 'text-stone-400 group-hover:bg-stone-200'}`}>
                       <ChevronDown size={14} strokeWidth={3} />
                    </div>
                  </button>

                  <div 
                    className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-1.5 mt-1 pb-4 relative pl-2">
                        {/* Visual connector line for the group */}
                        <div className="absolute left-6 top-0 bottom-2 w-px bg-stone-100 -z-10"></div>
                        
                        {group.items.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => handleLessonSelect(lesson.id, (group as any).isPro)}
                            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                              activeLesson === lesson.id
                                ? 'bg-amber-50 text-amber-900 shadow-sm ring-1 ring-amber-100 translate-x-1'
                                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900 hover:translate-x-1'
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                              activeLesson === lesson.id 
                                ? 'bg-amber-100 text-amber-600' 
                                : 'bg-white border border-stone-100 text-stone-400 group-hover:border-amber-100 group-hover:text-amber-500'
                            }`}>
                              <lesson.icon size={16} strokeWidth={activeLesson === lesson.id ? 2.5 : 2} />
                            </div>
                            <div className="flex-1 z-10 flex justify-between items-center">
                              <div className={`font-bold text-[13px] ${activeLesson === lesson.id ? 'text-stone-900' : 'text-stone-700'}`}>
                                {lesson.label}
                              </div>
                              {/* Lock Icon for individual items if needed, mostly group based now */}
                              {(group as any).isPro && !isPro && <Lock size={12} className="text-stone-300" />}
                            </div>
                            {activeLesson === lesson.id && (
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        )}
        
        {/* Tutor Info Side Panel View */}
        {activeTab === Tab.TUTOR && (
           <div className="px-6 py-10 text-center animate-fadeIn relative z-10">
              <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-500 shadow-inner">
                 <MessageCircle size={40} />
              </div>
              <h3 className="font-bold text-stone-900 text-lg">AI 钢琴助教</h3>
              <p className="text-sm text-stone-500 mt-3 leading-relaxed px-4">
                {isPro ? "您已解锁无限 AI 辅导功能。" : "免费版限制 5 条消息。升级以解锁无限对话。"}
              </p>
              {!isPro && (
                  <button 
                    onClick={() => setShowSubscribeModal(true)}
                    className="mt-6 px-6 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-stone-800 transition-colors"
                  >
                      升级 Pro
                  </button>
              )}
           </div>
        )}

        <div className="p-4 border-t border-stone-100/80 text-center relative z-10 bg-white">
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
            <div className="w-full bg-amber-50 border border-amber-100 text-amber-700 py-3 rounded-xl flex items-center justify-center gap-2 mb-4 cursor-default">
                <Crown size={16} fill="currentColor" className="text-amber-500" />
                <span className="font-bold text-sm">Pro 会员已激活</span>
            </div>
          )}
          <p className="text-[10px] text-stone-400 font-medium tracking-wide">© 2024 Music Theory Interactive</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        id="main-content"
        className="flex-1 h-full overflow-hidden flex flex-col relative"
      >
         {/* Background pattern */}
         <div className="absolute inset-0 opacity-[0.3] pointer-events-none z-0" 
              style={{ 
                backgroundImage: 'radial-gradient(#d6d3d1 1px, transparent 1px)', 
                backgroundSize: '32px 32px' 
              }}>
         </div>

         {/* Immersive Background Particles */}
         <BackgroundParticles />
         
         {/* Gradient overlay for soft top/bottom fade */}
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
                    {isPro && (
                        <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Crown size={12} fill="currentColor" /> Pro Unlocked
                        </div>
                    )}
                  </header>
                  <div className="flex-1 bg-white rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-200 overflow-hidden flex flex-col">
                     <AITutor isPro={isPro} onRequestUpgrade={() => setShowSubscribeModal(true)} />
                  </div>
               </div>
            )}
         </div>
      </main>
      
      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-30 md:hidden animate-fadeIn"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default App;