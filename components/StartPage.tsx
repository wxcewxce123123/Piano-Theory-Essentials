
// ... existing imports ...
import React, { useRef, useState, useEffect } from 'react';
import { Play, Lock, ArrowRight, Zap, Crown, ChevronRight, BookOpen, Headphones, Settings, Bell, Volume2, LogOut, ChevronLeft, Shield, Volume1, VolumeX, Clock, Trophy, Palette, Target, Flame, Sparkles, CloudRain, Coffee, Waves, Check, User as UserIcon, Plus, FileText, X, Mail, Edit2, Save, Image as ImageIcon, ZoomIn, RotateCw, Smartphone, Key, AlertTriangle, CheckCircle2, Fingerprint, RefreshCw, Music, UserCog } from 'lucide-react';

// --- Types ---
export interface UserProfile {
    name: string;
    avatar: string;
    level: string;
    isGuest: boolean;
    isCustomAvatar?: boolean;
    email?: string;
}

export interface UserSettings {
    themeColor: 'amber' | 'rose' | 'sky' | 'emerald' | 'violet' | 'custom';
    customColor?: string; // Hex for custom theme
    volume: number;
    dailyGoal: number;
    ambience: 'off' | 'rain' | 'cafe' | 'white';
}

export interface Achievement {
    id: string;
    title: string;
    desc: string;
    icon: string;
    unlocked: boolean;
    progress: number;
    maxProgress: number;
}

interface LessonItem {
  id: string;
  icon: any;
  label: string;
  desc: string;
}

interface LessonGroup {
  title: string;
  description: string;
  isPro?: boolean;
  items: LessonItem[];
}

interface StartPageProps {
  onNavigate: (lessonId: string, isProLesson: boolean) => void;
  lessons: LessonGroup[];
  isPro: boolean;
  onUpgrade: () => void;
  userSettings: UserSettings;
  onUpdateSettings: (s: UserSettings) => void;
  user: UserProfile | null;
  achievements: Achievement[];
  onLogout: () => void;
  onUpdateProfile?: (p: UserProfile) => void;
}

// --- Color Picker Modal ---
const ColorPickerModal: React.FC<{ isOpen: boolean, onClose: () => void, onApply: (color: string) => void }> = ({ isOpen, onClose, onApply }) => {
    const [color, setColor] = useState('#f59e0b');
    const [isVisible, setIsVisible] = useState(false);
    const [renderModal, setRenderModal] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setRenderModal(true);
            requestAnimationFrame(() => setIsVisible(true));
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setRenderModal(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!renderModal) return null;

    const PRESETS = [
        { name: '经典琥珀', hex: '#f59e0b' },
        { name: '赛博霓虹', hex: '#06b6d4' },
        { name: '午夜靛蓝', hex: '#6366f1' },
        { name: '森林秘境', hex: '#10b981' },
        { name: '绯红女巫', hex: '#ef4444' },
        { name: '皇家紫罗兰', hex: '#8b5cf6' },
        { name: '极简石灰', hex: '#64748b' },
        { name: '蜜桃乌龙', hex: '#f97316' },
    ];

    return (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center px-4 transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md" onClick={onClose}></div>
            <div className={`bg-white w-full max-w-lg rounded-3xl p-8 relative z-10 shadow-2xl transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) transform ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-stone-400 hover:bg-stone-100 rounded-full transition-colors"><X size={20}/></button>
                
                <h2 className="text-2xl font-serif font-bold text-stone-900 mb-1">外观工作室</h2>
                <p className="text-xs text-stone-500 mb-8 font-bold uppercase tracking-wider">Design Studio</p>

                {/* Preview Card */}
                <div className="mb-8 p-6 rounded-2xl border border-stone-200 flex items-center justify-between shadow-sm transition-colors duration-300" style={{ backgroundColor: `${color}10`, borderColor: `${color}40` }}>
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: color }}>效果预览 (Preview)</div>
                        <div className="font-bold text-lg text-stone-900">自定义主题风格</div>
                    </div>
                    <button className="px-5 py-2.5 rounded-xl font-bold text-white shadow-lg transition-colors text-sm" style={{ backgroundColor: color }}>
                        主要按钮
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    {/* Color Input */}
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">色彩代码 (Hex Code)</label>
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-stone-200 shrink-0">
                                <input 
                                    type="color" 
                                    value={color} 
                                    onChange={(e) => setColor(e.target.value)}
                                    className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer border-none p-0"
                                />
                            </div>
                            <input 
                                type="text" 
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 font-mono text-sm uppercase text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                            />
                        </div>
                    </div>

                    {/* Presets */}
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">设计师预设 (Presets)</label>
                        <div className="grid grid-cols-4 gap-2">
                            {PRESETS.map(p => (
                                <button
                                    key={p.hex}
                                    onClick={() => setColor(p.hex)}
                                    className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110 shadow-sm"
                                    style={{ backgroundColor: p.hex, borderColor: color === p.hex ? '#1c1917' : 'transparent' }}
                                    title={p.name}
                                ></button>
                            ))}
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => { onApply(color); onClose(); }}
                    className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <Palette size={18} /> 应用主题
                </button>
            </div>
        </div>
    )
}

// --- Privacy Modal ---
const PrivacyModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full max-w-lg rounded-3xl p-8 relative z-10 shadow-2xl max-h-[80vh] overflow-y-auto animate-scale-in">
                <button onClick={onClose} className="absolute top-4 right-4 p-2"><X size={20}/></button>
                <h2 className="text-2xl font-bold mb-4">隐私协议</h2>
                <div className="prose prose-sm text-stone-600 space-y-4">
                    <p>感谢您使用 Piano Theory。我们非常重视您的隐私。</p>
                    <h3 className="font-bold text-stone-900">1. 数据存储</h3>
                    <p>本应用的所有用户进度、成就和设置均存储在您的<strong>本地浏览器 (Local Storage)</strong> 中。我们不会将您的个人数据上传至任何云端服务器。</p>
                    <h3 className="font-bold text-stone-900">2. AI 功能</h3>
                    <p>当您使用 AI 助教功能时，您的输入文本将被发送至 Google Gemini API 进行处理。这是提供智能对话所必需的。我们不会保存您的对话历史记录用于训练。</p>
                    <h3 className="font-bold text-stone-900">3. 账号信息</h3>
                    <p>您的昵称和头像仅用于本地显示，不会被公开。</p>
                </div>
                <button onClick={onClose} className="mt-8 w-full bg-stone-900 text-white py-3 rounded-xl font-bold">我已知晓</button>
            </div>
        </div>
    )
}

// --- Account Settings Modal (Updated) ---
const AccountSettingsModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    user: UserProfile | null;
    onUpdateProfile?: (p: UserProfile) => void;
}> = ({ isOpen, onClose, user, onUpdateProfile }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [renderModal, setRenderModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile'); // Removed devices
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    
    // Edit States
    const [editName, setEditName] = useState(user?.name || '');
    const [editEmail, setEditEmail] = useState(user?.email || '');
    const [editAvatar, setEditAvatar] = useState(user?.avatar || '');
    
    // Security States
    const [twoFactor, setTwoFactor] = useState(false);
    const [hasPassword, setHasPassword] = useState(true); // Default true since it's required now
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSettingPassword, setIsSettingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // Avatar Editor States
    const [editZoom, setEditZoom] = useState(1);
    const [editRotation, setEditRotation] = useState(0);
    const [editPosition, setEditPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setRenderModal(true);
            requestAnimationFrame(() => setIsVisible(true));
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setRenderModal(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleSave = () => {
        if (!user || !onUpdateProfile) return;
        setIsSaving(true);
        
        // Process Avatar
        let finalAvatar = editAvatar;
        if (editAvatar.startsWith('data:') && (editZoom !== 1 || editRotation !== 0 || editPosition.x !== 0)) {
             const canvas = document.createElement('canvas');
             const ctx = canvas.getContext('2d');
             const img = new Image();
             img.src = editAvatar;
             canvas.width = 200;
             canvas.height = 200;
             if (ctx) {
                 ctx.fillStyle = '#f5f5f4';
                 ctx.fillRect(0, 0, 200, 200);
                 ctx.translate(100, 100);
                 ctx.translate(editPosition.x, editPosition.y);
                 ctx.rotate((editRotation * Math.PI) / 180);
                 ctx.scale(editZoom, editZoom);
                 ctx.drawImage(img, -100, -100, 200, 200);
                 finalAvatar = canvas.toDataURL('image/jpeg');
             }
        }

        setTimeout(() => {
            onUpdateProfile({ 
                ...user, 
                name: editName, 
                email: editEmail, 
                avatar: finalAvatar, 
                isCustomAvatar: !!finalAvatar.startsWith('data:') 
            });
            setIsSaving(false);
            setSaveSuccess(true);
            setTimeout(() => {
                setSaveSuccess(false);
                onClose();
            }, 800);
        }, 800);
    };

    const handleSavePassword = () => {
        if (!password || password !== confirmPassword) {
            // In a real app, show error
            return;
        }
        setIsSettingPassword(true);
        setTimeout(() => {
            setIsSettingPassword(false);
            setHasPassword(true);
            setPassword('');
            setConfirmPassword('');
            setIsEditingPassword(false);
            setPasswordSuccess(true);
            setTimeout(() => setPasswordSuccess(false), 2000);
        }, 1000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditAvatar(reader.result as string);
                setEditZoom(1); setEditRotation(0); setEditPosition({ x: 0, y: 0 });
            };
            reader.readAsDataURL(file);
        }
    };

    // Drag Logic for Avatar
    const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); dragStart.current = { x: e.clientX - editPosition.x, y: e.clientY - editPosition.y }; };
    const handleMouseMove = (e: React.MouseEvent) => { if (!isDragging) return; setEditPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y }); };
    const handleMouseUp = () => setIsDragging(false);

    if (!renderModal) return null;

    return (
        // Corrected: Removed md:pl-80 to properly center the modal relative to the viewport/container
        <div className={`fixed inset-0 z-[200] flex items-center justify-center transition-opacity duration-300 ease-out px-4 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className={`bg-white w-full max-w-2xl rounded-[2.5rem] relative z-10 shadow-2xl transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) transform overflow-hidden flex flex-col max-h-[90vh] ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
                
                {/* Header */}
                <div className="bg-stone-50 p-6 md:p-8 pb-4 border-b border-stone-200">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
                                <UserCog className="text-stone-800" size={24}/>
                                账号设置
                            </h2>
                            <p className="text-stone-500 text-sm mt-1">Account Settings</p>
                        </div>
                        <button onClick={onClose} className="p-2 bg-white hover:bg-stone-100 rounded-full transition-colors border border-stone-200"><X size={20} className="text-stone-500"/></button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-6">
                        {[
                            {id: 'profile', label: '个人资料', icon: UserIcon},
                            {id: 'security', label: '账号安全', icon: Key},
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === tab.id ? 'bg-stone-900 text-white shadow-md' : 'bg-white border border-stone-200 text-stone-500 hover:bg-stone-50'}`}
                            >
                                <tab.icon size={16}/> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white custom-scrollbar">
                    
                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* Avatar Editor */}
                            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                                <div className="flex flex-col md:flex-row gap-6 items-center">
                                    <div 
                                        className="w-24 h-24 rounded-full overflow-hidden border-4 border-white relative group bg-stone-100 cursor-move shrink-0 shadow-sm"
                                        onMouseDown={handleMouseDown}
                                        onMouseMove={handleMouseMove}
                                        onMouseUp={handleMouseUp}
                                        onMouseLeave={handleMouseUp}
                                    >
                                        {editAvatar.startsWith('data:') ? (
                                            <img src={editAvatar} className="w-full h-full object-cover pointer-events-none" style={{ transform: `translate(${editPosition.x}px, ${editPosition.y}px) scale(${editZoom}) rotate(${editRotation}deg)` }} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl text-stone-400">{editAvatar || <UserIcon/>}</div>
                                        )}
                                        <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ImageIcon size={20}/>
                                        </button>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </div>
                                    
                                    <div className="flex-1 w-full space-y-4">
                                        <div className="flex items-center gap-4">
                                            <ZoomIn size={16} className="text-stone-400"/>
                                            <input type="range" min="0.5" max="3" step="0.1" value={editZoom} onChange={e => setEditZoom(parseFloat(e.target.value))} className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800" disabled={!editAvatar.startsWith('data:')} />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <RotateCw size={16} className="text-stone-400"/>
                                            <input type="range" min="-180" max="180" step="5" value={editRotation} onChange={e => setEditRotation(parseFloat(e.target.value))} className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800" disabled={!editAvatar.startsWith('data:')} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase mb-2 ml-1">昵称 (Display Name)</label>
                                    <div className="relative">
                                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full p-4 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow font-bold text-stone-800 pl-11" />
                                        <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"/>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase mb-2 ml-1">绑定邮箱 (Email)</label>
                                    <div className="relative">
                                        <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full p-4 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow font-mono text-sm text-stone-800 pl-11" placeholder="未绑定" />
                                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <div className="space-y-4 animate-fadeIn">
                            {/* Password Setup */}
                            <div className={`p-5 rounded-2xl border flex flex-col gap-4 ${hasPassword ? 'bg-white border-stone-200 shadow-sm' : 'bg-amber-50 border-amber-200 shadow-md'}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className={`font-bold ${hasPassword ? 'text-stone-900' : 'text-amber-900'}`}>
                                            {hasPassword ? '登录密码' : '设置初始密码'}
                                        </div>
                                        <div className={`text-xs mt-1 ${hasPassword ? 'text-stone-500' : 'text-amber-700'}`}>
                                            {passwordSuccess ? <span className="text-emerald-500 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> 密码已更新</span> : (hasPassword ? '已设置安全密码' : '您尚未设置密码，建议立即设置')}
                                        </div>
                                    </div>
                                    <div className={`p-2 rounded-full ${hasPassword ? 'bg-stone-100' : 'bg-amber-100 text-amber-600'}`}>
                                        <Key size={20} />
                                    </div>
                                </div>
                                
                                {(!hasPassword || isEditingPassword) && (
                                    <div className="space-y-3 animate-slideUpFade">
                                        <input 
                                            type="password" 
                                            placeholder="输入新密码" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full p-3 rounded-lg border border-amber-200 bg-white focus:ring-2 focus:ring-amber-500 outline-none text-sm" 
                                        />
                                        <input 
                                            type="password" 
                                            placeholder="确认新密码" 
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full p-3 rounded-lg border border-amber-200 bg-white focus:ring-2 focus:ring-amber-500 outline-none text-sm" 
                                        />
                                        <div className="flex gap-2">
                                            {isEditingPassword && hasPassword && (
                                                <button onClick={() => setIsEditingPassword(false)} className="flex-1 py-2 rounded-lg font-bold text-sm text-stone-500 hover:bg-stone-100 transition-colors">取消</button>
                                            )}
                                            <button 
                                                onClick={handleSavePassword}
                                                disabled={isSettingPassword || !password || password !== confirmPassword}
                                                className="flex-1 bg-amber-500 text-white py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-amber-600 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                                            >
                                                {isSettingPassword ? <RefreshCw className="animate-spin" size={14}/> : <Save size={14}/>}
                                                {isSettingPassword ? '保存中...' : '保存密码'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                {hasPassword && !isEditingPassword && (
                                    <button 
                                        onClick={() => setIsEditingPassword(true)}
                                        className="w-full border border-stone-200 py-2 rounded-lg font-bold text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors active:scale-[0.98]"
                                    >
                                        修改密码
                                    </button>
                                )}
                            </div>

                            <div 
                                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors"
                                onClick={() => setTwoFactor(!twoFactor)}
                            >
                                <div>
                                    <div className="font-bold text-stone-900 flex items-center gap-2">
                                        双重验证 (2FA) 
                                        {twoFactor && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full animate-fadeIn">已开启</span>}
                                    </div>
                                    <div className="text-xs text-stone-500 mt-1">在登录时需要额外的验证码</div>
                                </div>
                                <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 relative ${twoFactor ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${twoFactor ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-stone-50 border-t border-stone-200 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-stone-500 hover:bg-stone-100 transition-colors">取消</button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`px-8 py-3 rounded-xl font-bold text-white transition-all flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${saveSuccess ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-stone-900 hover:bg-stone-800'}`}
                    >
                        {isSaving ? <RefreshCw className="animate-spin" size={18}/> : (saveSuccess ? <Check size={18} /> : <Save size={18} />)}
                        {saveSuccess ? '已保存!' : (isSaving ? '保存中...' : '保存更改')}
                    </button>
                </div>

            </div>
        </div>
    );
};

// ... ProfileSettings and StartPage components remain same as previously defined, but are included in the file ...
// (I will output the rest of the file content below to ensure validity)

// --- Profile Settings Component (Updated) ---
const ProfileSettings: React.FC<{ 
  onBack: () => void; 
  isPro: boolean; 
  onUpgrade: () => void;
  settings: UserSettings;
  onUpdate: (s: UserSettings) => void;
  user: UserProfile | null;
  achievements: Achievement[];
  onLogout: () => void;
  onUpdateProfile?: (p: UserProfile) => void;
}> = ({ onBack, isPro, onUpgrade, settings, onUpdate, user, achievements, onLogout, onUpdateProfile }) => {
  
  const [lastVolume, setLastVolume] = useState(80); 
  const [notify, setNotify] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false); // New Security Modal State

  // Helper for Theme Colors
  const getThemeStyles = () => {
      if (settings.themeColor === 'custom' && settings.customColor) {
          return { isCustom: true, hex: settings.customColor };
      }

      switch(settings.themeColor) {
          case 'rose': return { text: 'text-rose-500', bg: 'bg-rose-500', border: 'border-rose-200', lightBg: 'bg-rose-50' };
          case 'sky': return { text: 'text-sky-500', bg: 'bg-sky-500', border: 'border-sky-200', lightBg: 'bg-sky-50' };
          case 'emerald': return { text: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-200', lightBg: 'bg-emerald-50' };
          case 'violet': return { text: 'text-violet-500', bg: 'bg-violet-500', border: 'border-violet-200', lightBg: 'bg-violet-50' };
          default: return { text: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-200', lightBg: 'bg-amber-50' };
      }
  };
  const theme: any = getThemeStyles();

  const toggleMute = () => {
      if (settings.volume > 0) {
          setLastVolume(settings.volume);
          onUpdate({ ...settings, volume: 0 });
      } else {
          onUpdate({ ...settings, volume: lastVolume || 50 });
      }
  };

  const THEMES = [
      { id: 'amber', bg: 'bg-amber-500', isProOnly: false },
      { id: 'rose', bg: 'bg-rose-500', isProOnly: false },
      { id: 'sky', bg: 'bg-sky-500', isProOnly: false },
      { id: 'emerald', bg: 'bg-emerald-500', isProOnly: false },
      { id: 'violet', bg: 'bg-violet-500', isProOnly: false }, 
  ];

  const AMBIENCES = [
      { id: 'off', label: 'Off', icon: VolumeX, isProOnly: false },
      { id: 'rain', label: 'Rain', icon: CloudRain, isProOnly: false },
      { id: 'cafe', label: 'Cafe', icon: Coffee, isProOnly: true },
      { id: 'white', label: 'Focus', icon: Waves, isProOnly: true },
  ];

  const handleCustomColorApply = (color: string) => {
      onUpdate({ ...settings, themeColor: 'custom', customColor: color });
  };

  return (
    <div className="max-w-2xl mx-auto pt-4 pb-12">
      <ColorPickerModal 
        isOpen={showColorPicker} 
        onClose={() => setShowColorPicker(false)}
        onApply={handleCustomColorApply}
      />
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      
      {/* --- NEW SECURITY MODAL --- */}
      <AccountSettingsModal 
        isOpen={showSecurity} 
        onClose={() => setShowSecurity(false)} 
        user={user}
        onUpdateProfile={onUpdateProfile}
      />

      <button onClick={onBack} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-6 font-bold transition-colors group">
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 返回首页
      </button>
      
      <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold text-stone-900">个人中心</h2>
          <div className="px-3 py-1 bg-stone-100 rounded-full text-xs font-bold text-stone-500">
              v2.4.0
          </div>
      </div>

      {/* User Card */}
      <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/50 mb-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 duration-700"></div>
         
         <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl border-4 border-stone-100 shadow-inner shrink-0 relative z-10 overflow-hidden ${!user?.isCustomAvatar ? (theme.isCustom ? '' : theme.lightBg) : 'bg-stone-100'}`} style={theme.isCustom ? { backgroundColor: theme.hex + '20' } : {}}>
            {user?.isCustomAvatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
                user ? user.avatar : <UserIcon size={32} className="text-stone-400"/>
            )}
         </div>

         <div className="flex-1 text-center md:text-left relative z-10">
            <h3 className="text-2xl font-bold text-stone-900">{user ? user.name : '访客 (Guest)'}</h3>
            <p className="text-stone-500 text-sm mt-1">{user ? `${user.level} 学员` : '请登录以保存进度'}</p>
            
            {user && (
                <div className="flex justify-center md:justify-start gap-4 mt-4">
                    <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                        <Clock size={14} className="text-stone-400" />
                        <span className="text-xs font-bold text-stone-700">12.5 小时</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                        <Trophy size={14} className={theme.isCustom ? '' : theme.text} style={theme.isCustom ? { color: theme.hex } : {}} />
                        <span className="text-xs font-bold text-stone-700">{achievements.filter(a => a.unlocked).length} 成就</span>
                    </div>
                </div>
            )}
         </div>
      </div>

      {/* --- NEW ACCOUNT SECURITY BUTTON --- */}
      <div className="flex items-center justify-end mb-4 mt-8">
          <button 
            onClick={() => setShowSecurity(true)}
            className="group flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-full text-xs font-bold text-stone-600 hover:border-stone-300 hover:text-stone-900 hover:shadow-sm transition-all"
          >
            <UserCog size={14} className="text-emerald-500 group-hover:scale-110 transition-transform"/>
            账号设置
            <ChevronRight size={12} className="text-stone-300 group-hover:translate-x-1 transition-transform"/>
          </button>
      </div>
      
      {/* Achievements Grid */}
      <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4 px-2 mt-8">我的成就 (Achievements)</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {achievements.map((ach) => (
              <div key={ach.id} className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${ach.unlocked ? 'bg-white border-amber-200 shadow-sm' : 'bg-stone-50 border-stone-100 opacity-60 grayscale'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2 ${ach.unlocked ? 'bg-amber-100' : 'bg-stone-200'}`}>
                      {ach.icon}
                  </div>
                  <div className="font-bold text-stone-900 text-xs mb-1">{ach.title}</div>
                  <div className="text-[10px] text-stone-500 leading-tight">{ach.desc}</div>
              </div>
          ))}
      </div>

      {/* Subscription Card */}
      <div 
        className={`p-8 rounded-3xl border mb-8 relative overflow-hidden transition-all duration-500 ${isPro ? 'bg-stone-900 text-white border-stone-800 shadow-2xl' : `bg-gradient-to-br from-stone-50 to-orange-50 border-amber-200`}`}
        style={(!isPro && theme.isCustom) ? { borderColor: theme.hex + '40', background: `linear-gradient(to bottom right, ${theme.hex}10, white)` } : {}}
      >
          <div className="relative z-10 flex justify-between items-center">
              <div>
                  <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${isPro ? 'text-stone-400' : 'text-stone-500'}`}>当前状态</div>
                  <div className={`text-3xl font-serif font-bold flex items-center gap-3 ${isPro ? 'text-white' : 'text-stone-900'}`}>
                      {isPro ? 'Pro Member' : '免费版'}
                      {isPro && <Crown size={24} className="text-amber-400" fill="currentColor" />}
                  </div>
                  <p className={`text-xs mt-2 ${isPro ? 'text-stone-400' : 'text-stone-600'}`}>
                      {isPro ? `尊享全部特权` : '升级以解锁无限课程与AI助教。'}
                  </p>
              </div>
              {!isPro && (
                  <button onClick={onUpgrade} className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                      <Sparkles size={14} /> 立即升级
                  </button>
              )}
          </div>
          
          <div className={`absolute -right-10 -bottom-20 w-64 h-64 rounded-full blur-3xl pointer-events-none animate-pulse-slow ${isPro ? 'bg-amber-500/20' : 'bg-amber-400/20'}`}></div>
      </div>

      {/* --- Personalization Section --- */}
      <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4 px-2">个性化 (Personalization)</h3>
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm mb-8">
          
          {/* Theme Color Selector */}
          <div className="w-full p-5 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-stone-50 text-stone-500 flex items-center justify-center`}>
                      <Palette size={18} />
                  </div>
                  <span className="font-bold text-stone-700">主题强调色</span>
              </div>
              <div className="flex gap-3">
                  {THEMES.map((color) => {
                      const isActive = settings.themeColor === color.id;
                      return (
                          <button
                              key={color.id}
                              onClick={() => {
                                  onUpdate({ ...settings, themeColor: color.id as any });
                              }}
                              className={`w-6 h-6 rounded-full relative flex items-center justify-center transition-all duration-300 ${color.bg} ${isActive ? 'ring-2 ring-offset-2 ring-stone-300 scale-125 shadow-md' : 'opacity-80 hover:opacity-100 hover:scale-110'}`}
                          ></button>
                      )
                  })}
                  
                  {/* Custom Color Button */}
                  <button 
                    onClick={() => {
                        if (!isPro) { onUpgrade(); return; }
                        setShowColorPicker(true);
                    }}
                    className={`w-6 h-6 rounded-full relative flex items-center justify-center transition-all duration-300 border bg-white ${settings.themeColor === 'custom' ? 'ring-2 ring-offset-2 ring-stone-300 scale-125 shadow-md border-stone-300' : 'border-stone-200 opacity-80 hover:opacity-100 hover:scale-110'}`}
                    style={settings.themeColor === 'custom' && settings.customColor ? { backgroundColor: settings.customColor } : {}}
                  >
                      {!isPro && <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center"><Lock size={10} className="text-white"/></div>}
                      {isPro && settings.themeColor !== 'custom' && <Plus size={10} className="text-stone-400" />}
                  </button>
              </div>
          </div>

          {/* Daily Goal Selector */}
          <div className="w-full p-5 border-b border-stone-100 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-stone-50 text-stone-500 flex items-center justify-center`}>
                      <Target size={18} />
                  </div>
                  <span className="font-bold text-stone-700">每日目标</span>
              </div>
              <div className="flex bg-stone-100 p-1 rounded-xl">
                  {[5, 15, 30].map((min) => (
                      <button
                          key={min}
                          onClick={() => onUpdate({ ...settings, dailyGoal: min })}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${settings.dailyGoal === min ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                      >
                          {min === 5 && '☕ 轻松 5m'}
                          {min === 15 && '🏃 标准 15m'}
                          {min === 30 && '🔥 挑战 30m'}
                      </button>
                  ))}
              </div>
          </div>

          {/* Ambience Selector */}
          <div className="w-full p-5 border-b border-stone-100 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-stone-50 text-stone-500 flex items-center justify-center`}>
                      <Headphones size={18} />
                  </div>
                  <div className="flex-1">
                      <span className="font-bold text-stone-700 block">专注白噪音</span>
                      <span className="text-[10px] text-stone-400 font-medium">Soundscapes for Focus</span>
                  </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                  {AMBIENCES.map((amb) => {
                      const locked = amb.isProOnly && !isPro;
                      const isActive = settings.ambience === amb.id;
                      return (
                          <button
                              key={amb.id}
                              onClick={() => {
                                  if (locked) onUpgrade();
                                  else onUpdate({ ...settings, ambience: amb.id as any });
                              }}
                              className={`py-3 rounded-xl flex flex-col items-center gap-1 transition-all border relative overflow-hidden ${
                                  isActive 
                                  ? `${theme.isCustom ? '' : theme.lightBg} ${theme.isCustom ? '' : theme.border} ${theme.isCustom ? '' : theme.text} shadow-sm` 
                                  : 'bg-white border-stone-200 text-stone-400 hover:bg-stone-50'
                              }`}
                              style={isActive && theme.isCustom ? { backgroundColor: theme.hex + '10', borderColor: theme.hex, color: theme.hex } : {}}
                          >
                              <amb.icon size={16} />
                              <span className="text-[10px] font-bold">{amb.label}</span>
                              
                              {locked && (
                                  <div className="absolute top-1 right-1">
                                      <Lock size={10} className="text-stone-300" />
                                  </div>
                              )}
                          </button>
                      )
                  })}
              </div>
          </div>
      </div>

      {/* --- System Settings --- */}
      <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4 px-2">系统设置 (System)</h3>
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm mb-8">
          
          {/* Enhanced Volume Control */}
          <div className="w-full p-6 border-b border-stone-100 hover:bg-stone-50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                      <button 
                        onClick={toggleMute}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${settings.volume === 0 ? 'bg-stone-200 text-stone-400' : `${theme.isCustom ? '' : theme.lightBg} ${theme.isCustom ? '' : theme.text}`}`}
                        style={settings.volume > 0 && theme.isCustom ? { backgroundColor: theme.hex + '20', color: theme.hex } : {}}
                      >
                          {settings.volume === 0 ? <VolumeX size={18}/> : (settings.volume < 50 ? <Volume1 size={18}/> : <Volume2 size={18} />)}
                      </button>
                      <div>
                          <div className="font-bold text-stone-700">音效音量</div>
                          <div className="text-xs text-stone-400">{settings.volume === 0 ? '已静音' : `${settings.volume}%`}</div>
                      </div>
                  </div>
              </div>
              
              <div className="relative h-12 flex items-center group cursor-pointer">
                  <div className="absolute w-full h-4 bg-stone-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-100 ease-out rounded-full ${settings.volume === 0 ? 'bg-stone-300' : (theme.isCustom ? '' : theme.bg)}`} 
                        style={{ width: `${settings.volume}%`, backgroundColor: (settings.volume > 0 && theme.isCustom) ? theme.hex : undefined }}
                      ></div>
                  </div>
                  
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={settings.volume} 
                    onChange={(e) => onUpdate({ ...settings, volume: Number(e.target.value) })}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                  />

                  <div 
                    className="absolute h-8 w-8 bg-white border-4 rounded-full shadow-md pointer-events-none transition-all duration-100 ease-out flex items-center justify-center z-0"
                    style={{ 
                        left: `calc(${settings.volume}% - 16px)`, 
                        borderColor: settings.volume === 0 ? '#d6d3d1' : (theme.isCustom ? theme.hex : (settings.themeColor === 'amber' ? '#f59e0b' : settings.themeColor === 'rose' ? '#f43f5e' : settings.themeColor === 'sky' ? '#0ea5e9' : settings.themeColor === 'emerald' ? '#10b981' : '#8b5cf6'))
                    }}
                  >
                      <div className={`w-2 h-2 rounded-full ${settings.volume === 0 ? 'bg-stone-300' : (theme.isCustom ? '' : theme.bg)}`} style={theme.isCustom ? { backgroundColor: theme.hex } : {}}></div>
                  </div>
              </div>
          </div>

          {/* Notifications Toggle */}
          <div className="w-full flex items-center justify-between p-6 hover:bg-stone-50 transition-colors cursor-pointer" onClick={() => setNotify(!notify)}>
              <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${notify ? `${theme.isCustom ? '' : theme.lightBg} ${theme.isCustom ? '' : theme.text}` : 'bg-stone-100 text-stone-400'}`} style={notify && theme.isCustom ? { backgroundColor: theme.hex + '20', color: theme.hex } : {}}>
                      <Bell size={18} fill={notify ? "currentColor" : "none"} />
                  </div>
                  <span className="font-bold text-stone-700">消息通知</span>
              </div>
              <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 relative ${notify ? 'bg-green-500' : 'bg-stone-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${notify ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
          </div>
      </div>

      <button onClick={onLogout} className="w-full p-4 rounded-2xl border border-stone-200 text-stone-400 font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors flex items-center justify-center gap-2 mb-4">
          <LogOut size={18} /> 退出登录
      </button>

      <div className="text-center">
          <button 
            onClick={() => setShowPrivacy(true)}
            className="text-xs text-stone-400 hover:text-stone-600 flex items-center justify-center gap-1 mx-auto transition-colors"
          >
              <FileText size={12} /> 隐私协议与服务条款
          </button>
      </div>
    </div>
  )
}

const StartPage: React.FC<StartPageProps> = ({ onNavigate, lessons, isPro, onUpgrade, userSettings, onUpdateSettings, user, achievements, onLogout, onUpdateProfile }) => {
  const [showProfile, setShowProfile] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getThemeTextClass = () => {
      const { themeColor, customColor } = userSettings;
      if (themeColor === 'custom' && customColor) return 'text-custom';
      const map: Record<string, string> = {
          'amber': 'text-stone-400',
          'rose': 'text-rose-400',
          'sky': 'text-sky-400',
          'emerald': 'text-emerald-400',
          'violet': 'text-violet-400',
      };
      return map[themeColor] || 'text-stone-400';
  }

  const nextLessonGroup = lessons[0]; 
  const nextLessonItem = nextLessonGroup.items[2] || nextLessonGroup.items[0]; 

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = direction === 'left' ? -400 : 400;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getThemeColor = (idx: number) => {
      const themes = [
          'from-stone-100 to-stone-50 border-stone-200 text-stone-600',
          'from-amber-50 to-orange-50 border-amber-200 text-amber-700',
          'from-sky-50 to-blue-50 border-sky-200 text-sky-700',
          'from-violet-50 to-purple-50 border-violet-200 text-violet-700',
          'from-emerald-50 to-teal-50 border-emerald-200 text-emerald-700',
          'from-rose-50 to-pink-50 border-rose-200 text-rose-700',
          'from-slate-100 to-slate-200 border-slate-300 text-slate-700',
      ];
      return themes[idx % themes.length];
  };

  const getIconColor = (idx: number) => {
      const colors = ['bg-stone-200', 'bg-amber-200', 'bg-sky-200', 'bg-violet-200', 'bg-emerald-200', 'bg-rose-200', 'bg-slate-300'];
      return colors[idx % colors.length];
  };

  return (
    <>
    <div className={`relative w-full h-full`}>
        <div className={`w-full max-w-[1600px] mx-auto pb-12 font-sans relative transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-top ${showProfile ? 'scale-90 opacity-50 blur-[2px] pointer-events-none select-none' : 'scale-100 opacity-100'}`}>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 animate-slideUp">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></span>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">仪表盘</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif font-medium text-stone-900 leading-tight">
                        欢迎回来，<span className={`${getThemeTextClass()} italic`} style={getThemeTextClass() === 'text-custom' ? { color: userSettings.customColor } : {}}>{user ? user.name : 'Guest'}</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {user && (
                        <div className="hidden lg:flex gap-3">
                            <div className="bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm flex items-center gap-3 cursor-default hover:shadow-md transition-shadow">
                                <div className={`p-1.5 rounded-full ${userSettings.themeColor === 'custom' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'}`} style={userSettings.themeColor === 'custom' && userSettings.customColor ? { backgroundColor: userSettings.customColor } : {}}>
                                    <Zap size={14} fill="currentColor" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">连胜</div>
                                    <div className="text-sm font-bold text-stone-900 leading-none">3 天</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={() => setShowProfile(true)}
                        className="flex-1 md:flex-none flex items-center gap-3 bg-white pl-1.5 pr-4 py-1.5 rounded-full border border-stone-200 shadow-sm hover:shadow-md hover:border-stone-300 transition-all group"
                    >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-serif text-lg border-2 border-stone-100 shadow-sm group-hover:scale-105 transition-transform overflow-hidden ${userSettings.themeColor === 'custom' ? 'bg-white' : 'bg-stone-100'}`} style={userSettings.themeColor === 'custom' && userSettings.customColor ? { borderColor: userSettings.customColor } : {}}>
                            {user?.isCustomAvatar ? (
                                <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                user ? user.avatar : <UserIcon size={16} className="text-stone-400"/>
                            )}
                        </div>
                        <div className="text-left">
                            <div className="text-xs font-bold text-stone-900 leading-tight group-hover:text-stone-700 transition-colors">个人中心</div>
                            <div className="text-[10px] text-stone-400 flex items-center gap-1">
                                {isPro ? 'Pro 会员' : '免费版'} <Settings size={10} />
                            </div>
                        </div>
                    </button>
                </div>
            </header>

            <section className="mb-12 animate-slideUp stagger-1 relative group cursor-pointer" onClick={() => onNavigate(nextLessonItem.id, false)}>
                <div className="absolute inset-0 bg-stone-900 rounded-[2rem] shadow-2xl transform transition-transform duration-500 group-hover:scale-[1.01]"></div>
                <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none opacity-40">
                    <div 
                        className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[100px] transition-colors duration-500 bg-${userSettings.themeColor}-500/20`}
                        style={userSettings.themeColor === 'custom' && userSettings.customColor ? { backgroundColor: userSettings.customColor, opacity: 0.2 } : {}}
                    ></div>
                    <div className="absolute bottom-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                </div>

                <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 text-white">
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                            <Play size={10} fill="currentColor" /> 继续学习 (Resume)
                        </div>
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold font-serif mb-2 leading-tight">
                                {nextLessonGroup.title.split('：')[1] || nextLessonGroup.title}
                            </h2>
                            <p className="text-stone-400 text-sm">{nextLessonGroup.title.split('：')[0] || "Foundations"}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-medium">
                            <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-sm">
                                <nextLessonItem.icon size={16} className="text-stone-300" />
                                <span className="text-stone-200">{nextLessonItem.label}</span>
                            </div>
                            <span className="text-stone-500">•</span>
                            <span className="text-stone-400 flex items-center gap-1.5">
                                <Clock size={14} /> 5 分钟阅读
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-8 w-full md:w-auto justify-end">
                        <div className="text-right hidden lg:block">
                            <div className="text-4xl font-bold tabular-nums">35%</div>
                            <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1">课程进度</div>
                        </div>
                        <div className="relative w-24 h-24 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out">
                            <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="46" fill="none" stroke="#333" strokeWidth="8" />
                                <circle 
                                    cx="50" cy="50" r="46" fill="none" 
                                    stroke={userSettings.customColor || (userSettings.themeColor === 'amber' ? '#f59e0b' : '#3b82f6')} 
                                    strokeWidth="8" 
                                    strokeDasharray="289" // 2 * PI * 46
                                    strokeDashoffset="188" // 289 * (1 - 0.35)
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-stone-900 shadow-xl z-10">
                                <ArrowRight size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="animate-slideUp stagger-2 relative">
                <div className="flex justify-between items-end mb-6 px-2">
                    <div>
                        <h3 className="text-xl font-serif font-bold text-stone-900">学习之旅</h3>
                        <p className="text-stone-500 text-xs mt-1">一步步掌握乐理精髓</p>
                    </div>
                    <div className="hidden md:flex gap-2">
                        <button onClick={() => scroll('left')} className="p-2 rounded-full border border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-colors">
                            <ArrowRight size={16} className="rotate-180"/>
                        </button>
                        <button onClick={() => scroll('right')} className="p-2 rounded-full border border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-colors">
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                <div 
                    ref={scrollContainerRef}
                    className="flex gap-5 overflow-x-auto pb-8 pt-2 px-2 snap-x snap-mandatory scroll-smooth hide-scrollbar -mx-4 md:mx-0 px-6 md:px-0"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {lessons.map((group, idx) => {
                        const isLocked = group.isPro && !isPro;
                        const theme = getThemeColor(idx);
                        
                        return (
                            <div 
                                key={idx} 
                                className={`
                                    relative snap-center shrink-0 w-[85vw] sm:w-[340px] h-[480px] rounded-[2rem] bg-gradient-to-b ${theme} border p-1 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl
                                    ${isLocked ? 'grayscale-[0.8] opacity-80 hover:grayscale-[0.5] hover:opacity-100' : ''}
                                `}
                            >
                                <div className="bg-white/60 backdrop-blur-xl h-full w-full rounded-[1.8rem] overflow-hidden flex flex-col relative">
                                    <div className="p-6 pb-2 relative">
                                        <div className="absolute top-4 right-6 text-[60px] font-serif font-black text-stone-900/5 leading-none select-none -z-10">
                                            {idx + 1}
                                        </div>
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-white/80 px-2 py-1 rounded-md shadow-sm text-stone-500 border border-stone-100">
                                                阶段 {idx + 1}
                                            </span>
                                            {isLocked && <Lock size={16} className="text-stone-400" />}
                                        </div>
                                        <h4 className="text-xl font-serif font-bold text-stone-900 mb-2 leading-tight">
                                            {group.title.split('：')[1] || group.title}
                                        </h4>
                                        <p className="text-xs text-stone-500 leading-relaxed font-medium line-clamp-2">
                                            {group.description}
                                        </p>
                                    </div>

                                    <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar relative z-10">
                                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-4 mb-1">课程模块</div>
                                        {group.items.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => onNavigate(item.id, group.isPro || false)}
                                                disabled={isLocked}
                                                className="w-full p-3 rounded-xl hover:bg-white transition-colors flex items-center gap-3 text-left group/item border border-transparent hover:border-stone-100 hover:shadow-sm"
                                            >
                                                <div className={`w-9 h-9 rounded-lg ${getIconColor(idx)}/50 flex items-center justify-center text-stone-700 group-hover/item:scale-110 transition-transform shrink-0`}>
                                                    <item.icon size={16} strokeWidth={2} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-sm text-stone-800 truncate">{item.label}</div>
                                                    <div className="text-[10px] text-stone-500 truncate opacity-70">{item.desc}</div>
                                                </div>
                                                {!isLocked && (
                                                    <ChevronRight size={14} className="text-stone-300 group-hover/item:text-stone-600 transition-colors" />
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {isLocked && (
                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/90 to-transparent pt-12 flex justify-center">
                                            <button 
                                                onClick={onUpgrade}
                                                className="bg-stone-900 text-white px-5 py-2 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                                            >
                                                <Crown size={12} className="text-amber-400" fill="currentColor"/> 解锁阶段 {idx + 1}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slideUp stagger-3">
                <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Headphones size={20} />
                    </div>
                    <h4 className="font-bold text-base text-stone-900 mb-1">练耳训练</h4>
                    <p className="text-xs text-stone-500">通过听觉识别音程与和弦。</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <BookOpen size={20} />
                    </div>
                    <h4 className="font-bold text-base text-stone-900 mb-1">理论速查</h4>
                    <p className="text-xs text-stone-500">音阶、调式与符号的百科全书。</p>
                </div>

                {!isPro && (
                    <div 
                        onClick={onUpgrade}
                        className="bg-gradient-to-br from-amber-100 to-orange-100 p-5 rounded-3xl border border-amber-200 shadow-sm cursor-pointer group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-3">
                                <div className="w-10 h-10 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                    <Crown size={20} fill="currentColor" />
                                </div>
                                <span className="bg-white/50 text-amber-800 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">最超值</span>
                            </div>
                            <h4 className="font-bold text-base text-stone-900 mb-1">升级 Pro</h4>
                            <p className="text-xs text-stone-600 mb-2">解锁所有大师课程。</p>
                            <div className="text-xs font-bold text-stone-900 flex items-center gap-1 group-hover:gap-2 transition-all">
                                立即升级 <ArrowRight size={10}/>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>

        <div className={`fixed inset-0 md:left-80 z-[100] flex flex-col bg-[#FAFAF9] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${showProfile ? 'translate-y-0 opacity-100' : 'translate-y-[110%] opacity-0 pointer-events-none'}`}>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 lg:px-20 w-full h-full">
                 <ProfileSettings 
                    onBack={() => setShowProfile(false)} 
                    isPro={isPro} 
                    onUpgrade={onUpgrade} 
                    settings={userSettings} 
                    onUpdate={onUpdateSettings} 
                    user={user} 
                    achievements={achievements} 
                    onLogout={() => { onLogout(); setShowProfile(false); }} 
                    onUpdateProfile={onUpdateProfile} 
                 />
            </div>
        </div>
    </div>
    </>
  );
};

export default StartPage;
