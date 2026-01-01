
import React, { useState, useEffect } from 'react';
import { AlignCenterVertical, MousePointer2, BookOpen, Anchor } from 'lucide-react';

const ClefsLesson: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'neutral' | 'treble' | 'bass' | 'middleC'>('neutral');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const pianoKeys = Array.from({ length: 15 }, (_, i) => i); 

  return (
    <div className="space-y-10">
      <header className="animate-slideUp relative z-10">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 1 - Foundations</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            谱号与大谱表 <span className="text-stone-300 font-light">|</span> Clefs
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl leading-relaxed">
          谱号是五线谱的“GPS定位系统”。
          五线谱本身只是五条线，只有画上了谱号，线上的音符才有了确定的名字和高度。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200/50 border border-stone-100 p-6 md:p-10 relative overflow-hidden animate-slideUp stagger-1 select-none transition-all duration-700">
         
         {/* Dynamic Background */}
         <div className={`absolute inset-0 transition-all duration-700 ${
             activeMode === 'treble' ? 'bg-amber-50/80' : 
             activeMode === 'bass' ? 'bg-indigo-50/80' : 
             activeMode === 'middleC' ? 'bg-emerald-50/80' : 'bg-stone-50/40'
         }`}></div>
         
         {/* STAGE CONTAINER */}
         <div className="relative z-10 flex flex-col items-center min-h-[500px] justify-center">
            
            {/* SVG CANVAS */}
            <svg width="100%" height="450" viewBox="0 0 600 450" className="overflow-visible max-w-2xl">
                {/* --- GRAND STAFF LINES --- */}
                {/* Treble Staff (Top) */}
                <g transform="translate(50, 50)" className="staff-lines">
                    {[0, 20, 40, 60, 80].map((y, i) => (
                        <line 
                            key={`t-${i}`} 
                            x1="0" y1={y} x2="500" y2={y} 
                            stroke={activeMode === 'treble' && i === 3 ? '#d97706' : '#78716c'} 
                            strokeWidth={activeMode === 'treble' && i === 3 ? 3 : 1.5}
                            className={`transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
                            style={{ transitionDelay: `${i * 50}ms` }} 
                        />
                    ))}
                    {/* G Clef Highlight Line Label */}
                    {activeMode === 'treble' && (
                        <text x="-10" y="65" textAnchor="end" fontSize="12" fontWeight="bold" fill="#d97706" className="animate-fadeIn">G Line</text>
                    )}
                </g>

                {/* Bass Staff (Bottom) */}
                <g transform="translate(50, 210)" className="staff-lines">
                    {[0, 20, 40, 60, 80].map((y, i) => (
                        <line 
                            key={`b-${i}`} 
                            x1="0" y1={y} x2="500" y2={y} 
                            stroke={activeMode === 'bass' && i === 1 ? '#4f46e5' : '#78716c'} 
                            strokeWidth={activeMode === 'bass' && i === 1 ? 3 : 1.5}
                            className={`transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
                            style={{ transitionDelay: `${300 + i * 50}ms` }} 
                        />
                    ))}
                    {/* F Clef Highlight Line Label */}
                    {activeMode === 'bass' && (
                        <text x="-10" y="25" textAnchor="end" fontSize="12" fontWeight="bold" fill="#4f46e5" className="animate-fadeIn">F Line</text>
                    )}
                </g>

                {/* Brace */}
                <path 
                    d="M 40 50 L 40 290" 
                    stroke="#44403c" strokeWidth="4" 
                    className={`transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
                />
                <path 
                    d="M 35 50 C -5 100, -5 240, 35 290" 
                    stroke="#44403c" strokeWidth="2" fill="none" 
                    className={`transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
                />


                {/* --- CLEF SYMBOLS & INTERACTION --- */}
                
                {/* Treble Clef Group */}
                <g 
                    className={`transition-all duration-500 cursor-pointer ${activeMode === 'neutral' || activeMode === 'treble' ? 'opacity-100' : 'opacity-30 blur-[2px] grayscale'}`}
                    onClick={() => setActiveMode('treble')}
                    transform="translate(10, 0)"
                >
                    {/* Animate Drawing of Clef Path */}
                    <path 
                        d="M 50 145 C 50 155, 45 160, 40 155 L 60 20 L 50 70 C 35 120, 45 130, 50 100 C 55 70, 33 80, 33 105 C 33 125, 40 135, 48 135" 
                        fill="none" 
                        stroke="#1c1917" 
                        strokeWidth="3" 
                        strokeLinecap="round"
                        className={activeMode === 'treble' ? 'animate-draw-path' : ''}
                        style={{ strokeDasharray: 400, strokeDashoffset: activeMode === 'treble' ? 0 : 400 }}
                    />
                    {activeMode !== 'treble' && <text x="25" y="135" fontSize="100" fontFamily="serif" fill="#1c1917">🎼</text>}

                    {/* Interactive G Note */}
                    {activeMode === 'treble' && (
                        <g>
                            <circle cx="94" cy="110" r="12" fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="4 2" className="animate-spin-slow" />
                            <g className="animate-bounce-gentle">
                                <ellipse cx="180" cy="110" rx="10" ry="8" transform="rotate(-15 180 110)" fill="#1c1917" />
                                <line x1="170" y1="110" x2="170" y2="50" stroke="#1c1917" strokeWidth="2" />
                            </g>
                            <text x="220" y="115" fill="#d97706" fontSize="16" fontWeight="bold" fontFamily="serif" className="animate-fadeIn">G (Sol)</text>
                            <path d="M 180 120 L 180 340" stroke="#d97706" strokeWidth="1" strokeDasharray="4 4" className="animate-draw-line" />
                        </g>
                    )}
                </g>

                {/* Bass Clef Group */}
                <g 
                    className={`transition-all duration-500 cursor-pointer ${activeMode === 'neutral' || activeMode === 'bass' ? 'opacity-100' : 'opacity-30 blur-[2px] grayscale'}`}
                    onClick={() => setActiveMode('bass')}
                    transform="translate(10, 0)"
                >
                    {activeMode === 'bass' ? (
                        <g>
                             <path 
                                d="M 50 220 C 30 210, 30 190, 50 180 C 70 170, 85 190, 65 230" 
                                fill="none" 
                                stroke="#1c1917" 
                                strokeWidth="4" 
                                strokeLinecap="round"
                                className="animate-draw-path-short"
                            />
                            <circle cx="85" cy="185" r="3" fill="#1c1917" className="animate-pop-in" style={{ animationDelay: '0.4s' }} />
                            <circle cx="85" cy="195" r="3" fill="#1c1917" className="animate-pop-in" style={{ animationDelay: '0.5s' }} />
                        </g>
                    ) : (
                        <text x="35" y="225" fontSize="70" fontFamily="serif" fill="#1c1917">𝄢</text>
                    )}
                    
                    {/* Interactive F Note */}
                    {activeMode === 'bass' && (
                        <g>
                            <circle cx="94" cy="190" r="16" fill="none" stroke="#4f46e5" strokeWidth="2" strokeDasharray="4 2" className="animate-pulse" />
                            <g className="animate-bounce-gentle" transform="translate(0, -40)">
                                <ellipse cx="180" cy="230" rx="10" ry="8" transform="rotate(-15 180 230)" fill="#1c1917" />
                                <line x1="189" y1="228" x2="189" y2="170" stroke="#1c1917" strokeWidth="2" />
                            </g>
                            <text x="220" y="195" fill="#4f46e5" fontSize="16" fontWeight="bold" fontFamily="serif" className="animate-fadeIn">F (Fa)</text>
                            <path d="M 180 200 L 140 340" stroke="#4f46e5" strokeWidth="1" strokeDasharray="4 4" className="animate-draw-line" />
                        </g>
                    )}
                </g>

                {/* Middle C Group */}
                <g 
                    className={`transition-all duration-500 cursor-pointer ${activeMode === 'neutral' || activeMode === 'middleC' ? 'opacity-100' : 'opacity-30 blur-[2px] grayscale'}`}
                    onClick={() => setActiveMode('middleC')}
                >
                    <line x1="160" y1="170" x2="200" y2="170" stroke="#1c1917" strokeWidth="2" className={activeMode === 'middleC' ? 'stroke-emerald-500 stroke-[3px]' : ''} />
                    
                    {activeMode === 'middleC' && (
                        <g className="animate-pulse-soft">
                            <ellipse cx="180" cy="170" rx="10" ry="8" transform="rotate(-15 180 170)" fill="#10b981" />
                            <text x="220" y="175" fill="#10b981" fontSize="16" fontWeight="bold" fontFamily="serif">Middle C</text>
                             <path d="M 180 180 L 160 340" stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" className="animate-draw-line" />
                        </g>
                    )}
                    {activeMode === 'neutral' && (
                        <g opacity="0.5">
                             <ellipse cx="180" cy="170" rx="9" ry="7" transform="rotate(-15 180 170)" fill="#a8a29e" />
                        </g>
                    )}
                </g>

                {/* --- PIANO KEYBOARD (Visual Map) --- */}
                <g transform="translate(60, 350)">
                    {pianoKeys.map((k) => {
                        let isActive = false;
                        let color = '#fff';
                        if (activeMode === 'middleC' && k === 7) { isActive = true; color = '#10b981'; }
                        if (activeMode === 'treble' && k === 11) { isActive = true; color = '#d97706'; }
                        if (activeMode === 'bass' && k === 3) { isActive = true; color = '#4f46e5'; }

                        return (
                            <rect 
                                key={k}
                                x={k * 24} y="0" width="24" height="80" 
                                fill={isActive ? color : "white"} 
                                stroke="#d6d3d1" 
                                className={`transition-colors duration-300 ${isActive ? 'shadow-lg' : ''}`}
                            />
                        )
                    })}
                    {[1, 2, 4, 5, 6, 8, 9, 11, 12, 13].map(k => (
                        <rect key={`bk-${k}`} x={k * 24 - 8} y="0" width="16" height="50" fill="#1c1917" />
                    ))}
                    
                    {activeMode === 'bass' && <text x={3 * 24 + 12} y="70" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" className="animate-pop-in">F</text>}
                    {activeMode === 'middleC' && <text x={7 * 24 + 12} y="70" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" className="animate-pop-in">C4</text>}
                    {activeMode === 'treble' && <text x={11 * 24 + 12} y="70" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" className="animate-pop-in">G</text>}
                </g>
            </svg>

            {/* Hint Overlay */}
            {activeMode === 'neutral' && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-stone-400 flex flex-col items-center animate-pulse">
                    <MousePointer2 size={32} />
                    <span className="mt-2 font-bold text-sm bg-white/80 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm">点击谱号或琴键</span>
                </div>
            )}
         </div>

         {/* --- CONTROLS --- */}
         <div className="flex justify-center gap-4 relative z-20 -mt-6">
             <button
                onClick={() => setActiveMode('treble')}
                className={`flex flex-col items-center px-6 py-4 rounded-2xl border-2 transition-all duration-300 ${
                    activeMode === 'treble' 
                    ? 'bg-amber-50 border-amber-400 scale-110 shadow-lg' 
                    : 'bg-white border-stone-200 hover:border-amber-200 text-stone-400 grayscale hover:grayscale-0'
                }`}
             >
                <div className="text-2xl mb-1">🎼</div>
                <div className="text-xs font-bold uppercase tracking-wider">高音 (Treble)</div>
             </button>
             
             <button
                onClick={() => setActiveMode('middleC')}
                className={`flex flex-col items-center px-6 py-4 rounded-2xl border-2 transition-all duration-300 ${
                    activeMode === 'middleC' 
                    ? 'bg-emerald-50 border-emerald-400 scale-110 shadow-lg' 
                    : 'bg-white border-stone-200 hover:border-emerald-200 text-stone-400 grayscale hover:grayscale-0'
                }`}
             >
                <div className="text-2xl mb-1 flex items-center h-8"><AlignCenterVertical size={24}/></div>
                <div className="text-xs font-bold uppercase tracking-wider">中央 C</div>
             </button>

             <button
                onClick={() => setActiveMode('bass')}
                className={`flex flex-col items-center px-6 py-4 rounded-2xl border-2 transition-all duration-300 ${
                    activeMode === 'bass' 
                    ? 'bg-indigo-50 border-indigo-400 scale-110 shadow-lg' 
                    : 'bg-white border-stone-200 hover:border-indigo-200 text-stone-400 grayscale hover:grayscale-0'
                }`}
             >
                <div className="text-2xl mb-1">𝄢</div>
                <div className="text-xs font-bold uppercase tracking-wider">低音 (Bass)</div>
             </button>
         </div>
      </div>

      {/* --- INFO CARDS WITH DETAILED EXPLANATION --- */}
      <div className="min-h-[160px] animate-slideUp stagger-2">
         {activeMode === 'neutral' && (
             <div className="bg-stone-100/50 border border-stone-200 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center text-stone-500">
                <BookOpen size={32} className="mb-4 text-stone-300"/>
                <p>请点击上方的谱号，探索它们是如何“锁定”音高的。</p>
             </div>
         )}
         
         {activeMode === 'treble' && (
             <div className="bg-gradient-to-r from-amber-50 to-white p-8 rounded-3xl border border-amber-100 flex flex-col md:flex-row items-start gap-6 animate-fadeIn">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 flex-shrink-0 text-center">
                    <div className="text-5xl font-serif text-amber-900 mb-2">G</div>
                    <div className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">Letter Origin</div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-amber-900 mb-2">G 谱号 (高音谱号) 的身世</h3>
                    <p className="text-stone-700 leading-relaxed mb-3">
                        高音谱号其实是一个花体的字母 <strong>G</strong>。
                        几个世纪前，僧侣们为了记谱，直接把字母 G 写在谱线上。慢慢地，这个字母演变得越来越华丽，最终变成了我们今天看到的螺旋形状。
                    </p>
                    <div className="bg-amber-100/50 p-3 rounded-lg text-sm text-amber-900">
                        <strong>核心逻辑：</strong> 谱号螺旋的中心“圆肚子”包住了五线谱的<strong>第二条线</strong>。这就强制规定：这条线上的音符就是 G (Sol)。确定了 G，其他音符就按顺序排开了。
                    </div>
                </div>
             </div>
         )}

         {activeMode === 'bass' && (
             <div className="bg-gradient-to-r from-indigo-50 to-white p-8 rounded-3xl border border-indigo-100 flex flex-col md:flex-row items-start gap-6 animate-fadeIn">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 flex-shrink-0 text-center">
                    <div className="text-5xl font-serif text-indigo-900 mb-2">F</div>
                    <div className="text-[10px] uppercase font-bold text-indigo-500 tracking-widest">Letter Origin</div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-indigo-900 mb-2">F 谱号 (低音谱号) 的身世</h3>
                    <p className="text-stone-700 leading-relaxed mb-3">
                        低音谱号演变自字母 <strong>F</strong>。
                        古代手稿中，F 的两条横杠逐渐变成了谱号右边的两个小圆点。
                    </p>
                    <div className="bg-indigo-100/50 p-3 rounded-lg text-sm text-indigo-900">
                        <strong>核心逻辑：</strong> 那两个小圆点夹住了五线谱的<strong>第四条线</strong>（从下往上数）。这就规定：这条线上的音符就是 F (Fa)。通常用于记录左手演奏的低音区域。
                    </div>
                </div>
             </div>
         )}

         {activeMode === 'middleC' && (
             <div className="bg-gradient-to-r from-emerald-50 to-white p-8 rounded-3xl border border-emerald-100 flex flex-col md:flex-row items-start gap-6 animate-fadeIn">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex-shrink-0 text-center">
                    <div className="text-5xl font-serif text-emerald-900 mb-2 flex items-center justify-center"><Anchor size={40}/></div>
                    <div className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest">Anchor Point</div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-emerald-900 mb-2">中央 C：大谱表的桥梁</h3>
                    <p className="text-stone-700 leading-relaxed mb-3">
                        为什么叫“中央”C？因为它位于高音谱表和低音谱表的正中间。
                        它就像一座桥，连接了左手（低音）和右手（高音）的领地。
                    </p>
                    <div className="bg-emerald-100/50 p-3 rounded-lg text-sm text-emerald-900">
                        <strong>视觉特征：</strong> 它既不挂在高音谱表的第一线下，也不骑在低音谱表的第一线上。它必须拥有自己的一条临时短线（加线），像穿糖葫芦一样穿过它。
                    </div>
                </div>
             </div>
         )}
      </div>

      <style>{`
        .animate-draw-path { stroke-dasharray: 400; stroke-dashoffset: 400; animation: draw 2s forwards cubic-bezier(0.45, 0, 0.55, 1); }
        .animate-draw-path-short { stroke-dasharray: 200; stroke-dashoffset: 200; animation: draw 1.5s forwards cubic-bezier(0.45, 0, 0.55, 1); }
        .animate-pop-in { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; opacity: 0; transform: scale(0.5); transform-origin: center; }
        @keyframes popIn { to { opacity: 1; transform: scale(1); } }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); transform-origin: 94px 110px; } to { transform: rotate(360deg); transform-origin: 94px 110px; } }
        .animate-bounce-gentle { animation: bounceGentle 2s infinite ease-in-out; }
        @keyframes bounceGentle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        .animate-draw-line { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: draw 1.5s forwards ease-out; }
        @keyframes draw { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
};

export default ClefsLesson;
