
import React, { useState, useRef } from 'react';
import { ArrowLeftRight, HelpCircle, Music, BookOpen, Key, Eye } from 'lucide-react';

const EnharmonicsLesson: React.FC = () => {
  const [context, setContext] = useState<'sharp' | 'flat'>('sharp'); // 'sharp' (D Major context) or 'flat' (Db Major context)
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playNote = () => {
    setIsPlaying(true);
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // C# / Db = 277.18 Hz
    osc.frequency.value = 277.18; 
    osc.type = 'triangle';
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.1);
    
    setTimeout(() => setIsPlaying(false), 1000);
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 3</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            同音异名 <span className="text-stone-300 font-light">|</span> Enharmonics
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          同一个琴键，却有两个名字。这不仅仅是拼写游戏，而是音乐的“语法”。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-stone-200 relative overflow-hidden animate-slideUp stagger-1 flex flex-col items-center">
          
          {/* Context Switcher (The Toggle) */}
          <div className="relative z-20 bg-stone-100 p-1.5 rounded-2xl flex shadow-inner mb-12">
              <button 
                onClick={() => setContext('sharp')}
                className={`px-6 md:px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${context === 'sharp' ? 'bg-amber-500 text-white shadow-md' : 'text-stone-500 hover:text-stone-700'}`}
              >
                  <span className="text-xl font-serif">♯</span> 升号视角 (Sharp)
              </button>
              <button 
                onClick={() => setContext('flat')}
                className={`px-6 md:px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${context === 'flat' ? 'bg-indigo-500 text-white shadow-md' : 'text-stone-500 hover:text-stone-700'}`}
              >
                  <span className="text-xl font-serif">♭</span> 降号视角 (Flat)
              </button>
          </div>

          {/* The Visualization Container */}
          <div className="relative w-full max-w-4xl h-96 flex items-center justify-center">
              
              {/* Background Key Signature Animation */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl border border-stone-100 bg-stone-50/50">
                  {/* Sharps floating */}
                  <div className={`absolute inset-0 transition-opacity duration-700 ${context === 'sharp' ? 'opacity-100' : 'opacity-0'}`}>
                      <div className="absolute top-4 left-4 text-amber-500/10 text-9xl font-serif font-black select-none transform -rotate-12 animate-float">♯</div>
                      <div className="absolute bottom-4 right-10 text-amber-500/5 text-8xl font-serif font-black select-none transform rotate-12 animate-float" style={{animationDelay: '1s'}}>♯</div>
                      <div className="absolute top-1/2 left-10 text-stone-900/5 font-bold uppercase tracking-[1em] -rotate-90 origin-center hidden md:block">Ascending</div>
                  </div>
                  {/* Flats floating */}
                  <div className={`absolute inset-0 transition-opacity duration-700 ${context === 'flat' ? 'opacity-100' : 'opacity-0'}`}>
                      <div className="absolute top-4 right-4 text-indigo-500/10 text-9xl font-serif font-black select-none transform rotate-12 animate-float">♭</div>
                      <div className="absolute bottom-4 left-10 text-indigo-500/5 text-8xl font-serif font-black select-none transform -rotate-12 animate-float" style={{animationDelay: '1s'}}>♭</div>
                      <div className="absolute top-1/2 right-10 text-stone-900/5 font-bold uppercase tracking-[1em] rotate-90 origin-center hidden md:block">Descending</div>
                  </div>
              </div>

              {/* === CENTER: PIANO KEY === */}
              <div className="relative z-10 flex flex-col items-center top-8">
                  <div className="relative">
                      {/* White Keys for reference */}
                      <div className="flex gap-1 absolute top-0 left-1/2 -translate-x-1/2 -z-10">
                          <div className="w-20 h-56 bg-white border border-stone-200 rounded-b-lg shadow-sm">
                              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-stone-300 font-bold">C</div>
                          </div>
                          <div className="w-20 h-56 bg-white border border-stone-200 rounded-b-lg shadow-sm">
                              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-stone-300 font-bold">D</div>
                          </div>
                      </div>
                      
                      {/* The Black Key */}
                      <button 
                        onClick={playNote}
                        className={`w-14 h-36 bg-stone-900 rounded-b-xl shadow-2xl active:scale-[0.98] transition-transform relative overflow-hidden group border-b-4 border-stone-950`}
                      >
                          <div className={`absolute bottom-6 left-0 w-full text-center text-white/50 font-bold text-lg transition-all duration-500 ${isPlaying ? 'scale-125 text-amber-400' : ''}`}>
                              {context === 'sharp' ? 'C♯' : 'D♭'}
                          </div>
                          {/* Shine effect */}
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
                      </button>
                  </div>
              </div>

              {/* === LEFT: FUNCTION CARD === */}
              <div className={`absolute top-1/2 left-0 md:left-8 transform -translate-y-1/2 transition-all duration-500 ${context === 'sharp' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'}`}>
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-amber-100 text-center w-40 md:w-48 backdrop-blur-sm bg-white/90">
                      <div className="text-[10px] text-stone-400 font-bold uppercase mb-1 tracking-wider">D Major Key</div>
                      <div className="text-5xl font-serif font-bold text-amber-600 mb-2">C♯</div>
                      <div className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded inline-block font-bold border border-amber-100">Leading Tone (导音)</div>
                  </div>
              </div>

              <div className={`absolute top-1/2 left-0 md:left-8 transform -translate-y-1/2 transition-all duration-500 ${context === 'flat' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 text-center w-40 md:w-48 backdrop-blur-sm bg-white/90">
                      <div className="text-[10px] text-stone-400 font-bold uppercase mb-1 tracking-wider">Db Major Key</div>
                      <div className="text-5xl font-serif font-bold text-indigo-600 mb-2">D♭</div>
                      <div className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded inline-block font-bold border border-indigo-100">Tonic (主音)</div>
                  </div>
              </div>

              {/* === RIGHT: STAFF VISUALIZATION (New) === */}
              <div className="absolute top-8 right-0 md:right-8 w-40 md:w-56 hidden md:block">
                  <div className="bg-white/90 backdrop-blur rounded-xl border border-stone-200 p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2 text-stone-400">
                          <Eye size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Written Notation</span>
                      </div>
                      <svg viewBox="0 0 160 100" className="w-full overflow-visible">
                          {/* Staff Lines */}
                          {[20, 40, 60, 80, 100].map(y => <line key={y} x1="0" y1={y} x2="160" y2={y} stroke="#d6d3d1" strokeWidth="1" />)}
                          {/* Treble Clef */}
                          <text x="10" y="85" fontSize="50" fill="#78716c">𝄞</text>
                          
                          {/* Animated Note Group */}
                          <g className={`transition-all duration-700 ease-in-out ${context === 'sharp' ? 'translate-y-[50px]' : 'translate-y-[40px]'}`}>
                              
                              {/* Ledger Line for C# (Middle C# area) - wait, standard place is 3rd space (C#5) or below staff C#4. Let's do C#5 (high) vs Db5 (line) */}
                              {/* C5 is 3rd Space (y=50). D5 is 4th Line (y=40). Perfect. */}
                              
                              {/* Note Head */}
                              <ellipse cx="100" cy="0" rx="9" ry="7" transform="rotate(-15 100 0)" fill={context === 'sharp' ? '#d97706' : '#4f46e5'} className="transition-colors duration-500" />
                              
                              {/* Stem (Down for high notes) */}
                              <line x1="93" y1="0" x2="93" y2="35" stroke={context === 'sharp' ? '#d97706' : '#4f46e5'} strokeWidth="2" className="transition-colors duration-500" />
                              
                              {/* Accidental */}
                              <text x="75" y="10" fontSize="24" fontWeight="bold" fill={context === 'sharp' ? '#d97706' : '#4f46e5'} className="transition-colors duration-500">
                                  {context === 'sharp' ? '♯' : '♭'}
                              </text>
                          </g>

                          {/* Helper Label */}
                          <text x="160" y={context === 'sharp' ? 55 : 45} textAnchor="end" fontSize="10" fill="#a8a29e" className="font-mono transition-all duration-700">
                              {context === 'sharp' ? 'Space 3' : 'Line 4'}
                          </text>
                      </svg>
                  </div>
              </div>

          </div>
      </div>

      {/* Expanded Explanation Section */}
      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
          {/* Analogy Card */}
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <BookOpen className="text-amber-500" />
                  音乐的“同音字”
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  想象英语中的 <strong>"Sun" (太阳)</strong> 和 <strong>"Son" (儿子)</strong>。
                  它们读音完全一样，但意思截然不同，拼写也不同。
              </p>
              <div className="bg-stone-50 p-4 rounded-xl border-l-4 border-stone-300 text-sm text-stone-600 italic">
                  <div className="mb-2">"I see the <strong>sun</strong>" (我看见了太阳)</div>
                  <div>"I see the <strong>son</strong>" (我看见了儿子)</div>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed mt-4">
                  音乐也是一种语言。C# 和 Db 虽然在钢琴上按同一个键，但在乐理语法中，它们的位置完全不同（一个在间上，一个在线上）。
              </p>
          </div>

          {/* Function Card */}
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Key className="text-indigo-500" />
                  为什么要区分？
              </h3>
              <ul className="space-y-4 text-stone-600 text-sm leading-relaxed">
                  <li className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                      <span><strong>方向感不同：</strong> 升号 (#) 通常暗示着“向上”的趋势（去往 D），而降号 (b) 通常暗示着“向下”或“稳定”的状态。</span>
                  </li>
                  <li className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                      <span><strong>乐谱可读性：</strong> 在 D 大调乐谱中，如果我们写 Db 而不是 C#，乐谱上就会出现一个还原 D 和一个降 D 挤在一起，让演奏者大脑打结。遵循“语法”能让视奏更流畅。</span>
                  </li>
              </ul>
          </div>
      </div>
    </div>
  );
};

export default EnharmonicsLesson;
