
import React, { useState, useEffect } from 'react';
import { AlignCenterVertical, MousePointer2, BookOpen, Anchor } from 'lucide-react';

const ClefsLesson: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'neutral' | 'treble' | 'bass' | 'middleC'>('neutral');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const pianoKeys = Array.from({ length: 15 }, (_, i) => i); 

  // Configuration for keyboard display based on clef
  const getKeyConfig = () => {
      switch(activeMode) {
          case 'treble': 
              return { startLabel: 'C4', highlightIdx: 4, noteName: 'G4' }; 
          case 'bass': 
              return { startLabel: 'C2', highlightIdx: 10, noteName: 'F3' }; 
          case 'middleC': 
              return { startLabel: 'C3', highlightIdx: 7, noteName: 'C4' };
          default: 
              return { startLabel: 'C', highlightIdx: -1, noteName: '' };
      }
  };

  const keyConfig = getKeyConfig();

  // Helper to generate dynamic key labels
  const getKeyLabel = (index: number) => {
      if (activeMode === 'neutral') return '';
      if (index === 0) return keyConfig.startLabel;
      if (index === 7) {
          const base = parseInt(keyConfig.startLabel.charAt(1));
          return `C${base + 1}`;
      }
      if (index === 14) {
          const base = parseInt(keyConfig.startLabel.charAt(1));
          return `C${base + 2}`;
      }
      return '';
  };

  // --- COORDINATE SYSTEM ---
  // ViewBox: 0 0 600 450
  // Center Y: 225
  // Grand Staff Geometry:
  // Treble Staff Top Y: 115
  // Treble Staff Bottom Y: 115 + 80 = 195
  // Gap: 60px
  // Bass Staff Top Y: 255
  // Bass Staff Bottom Y: 255 + 80 = 335
  
  // Offsets for Single Staff centering
  // Treble Center Y (Line 3): 115 + 40 = 155. To move to 225: +70px
  // Bass Center Y (Line 3): 255 + 40 = 295. To move to 225: -70px

  const getTrebleTransform = () => {
      if (activeMode === 'treble') return 'translate(0, 70px)'; // Center it
      if (activeMode === 'bass') return 'translate(0, -50px)'; // Move out of way
      return 'translate(0, 0)'; // Default Grand Staff position (middleC/neutral)
  };

  const getBassTransform = () => {
      if (activeMode === 'bass') return 'translate(0, -70px)'; // Center it
      if (activeMode === 'treble') return 'translate(0, 50px)'; // Move out of way
      return 'translate(0, 0)'; // Default Grand Staff position
  };

  const getOpacity = (section: 'treble' | 'bass' | 'brace' | 'middleC') => {
      if (activeMode === 'neutral') return 0.4;
      if (activeMode === 'middleC') return 1;
      
      if (section === 'treble') return activeMode === 'treble' ? 1 : 0;
      if (section === 'bass') return activeMode === 'bass' ? 1 : 0;
      if (section === 'brace') return 0; // Only visible in neutral/middleC
      if (section === 'middleC') return 0; // Handled separately
      return 1;
  };

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
                
                {/* --- BRACE & LEFT BAR (Grand Staff Only) --- */}
                <g 
                    className="transition-all duration-700 ease-out" 
                    style={{ opacity: (activeMode === 'neutral' || activeMode === 'middleC') ? 1 : 0 }}
                >
                    {/* Vertical Line connecting staves */}
                    <line x1="40" y1="115" x2="40" y2="335" stroke="#44403c" strokeWidth="4" />
                    
                    {/* Curly Brace Path */}
                    <path 
                        d="M 35 115 Q -10 115 -10 165 Q -10 225 15 225 Q -10 225 -10 285 Q -10 335 35 335"
                        fill="none" stroke="#44403c" strokeWidth="2"
                    />
                </g>

                {/* --- TREBLE STAFF GROUP --- */}
                {/* Base Y: 115 */}
                <g 
                    className="transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer"
                    style={{ 
                        transform: getTrebleTransform(), 
                        opacity: getOpacity('treble') 
                    }}
                    onClick={() => setActiveMode('treble')}
                >
                    {/* Staff Lines */}
                    {[0, 20, 40, 60, 80].map((y, i) => (
                        <line 
                            key={`t-${i}`} 
                            x1="40" y1={115 + y} x2="560" y2={115 + y} 
                            stroke={activeMode === 'treble' && i === 3 ? '#d97706' : '#78716c'} 
                            strokeWidth={activeMode === 'treble' && i === 3 ? 3 : 1.5}
                            className="transition-all duration-300"
                        />
                    ))}
                    
                    {/* Clef */}
                    <text
                        x="75" y="155"
                        dominantBaseline="central"
                        fontSize="75"
                        fontFamily="'Noto Music', 'Bravura', 'Times New Roman', serif"
                        fill={activeMode === 'treble' ? "#1c1917" : "#57534e"}
                        textAnchor="middle"
                    >
                        𝄞
                    </text>

                    {/* REDESIGNED G NOTE ANIMATION */}
                    {activeMode === 'treble' && (
                        <g>
                            {/* 1. The Reference Point (Spiral Center) */}
                            <circle cx="75" cy="175" r="5" fill="#d97706" className="animate-ping-slow" />
                            <circle cx="75" cy="175" r="3" fill="white" />
                            
                            {/* 2. The Tracking Line */}
                            <line 
                                x1="85" y1="175" x2="240" y2="175" 
                                stroke="#d97706" strokeWidth="2" strokeDasharray="4 2"
                                className="animate-draw-line"
                            />
                            
                            {/* 3. The Note G4 */}
                            <g className="animate-pop-in" style={{ animationDelay: '0.4s' }}>
                                {/* Note Head */}
                                <ellipse cx="240" cy="175" rx="11" ry="8" transform="rotate(-15 240 175)" fill="#1c1917" stroke="#d97706" strokeWidth="2" />
                                {/* Stem UP */}
                                <line x1="249" y1="175" x2="249" y2="115" stroke="#1c1917" strokeWidth="2" />
                                
                                {/* Target Reticle Effect */}
                                <circle cx="240" cy="175" r="20" fill="none" stroke="#d97706" strokeWidth="1" className="animate-ping" opacity="0.3" />
                                
                                {/* Label Tag */}
                                <g transform="translate(265, 175)">
                                    <path d="M0,0 L10,-12 L60,-12 A4,4 0 0 1 64,-8 L64,8 A4,4 0 0 1 60,12 L10,12 Z" fill="#d97706" />
                                    <text x="36" y="4" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">G (Sol)</text>
                                </g>
                            </g>
                        </g>
                    )}
                </g>

                {/* --- BASS STAFF GROUP --- */}
                {/* Base Y: 255 */}
                <g 
                    className="transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer"
                    style={{ 
                        transform: getBassTransform(), 
                        opacity: getOpacity('bass') 
                    }}
                    onClick={() => setActiveMode('bass')}
                >
                    {/* Staff Lines */}
                    {[0, 20, 40, 60, 80].map((y, i) => (
                        <line 
                            key={`b-${i}`} 
                            x1="40" y1={255 + y} x2="560" y2={255 + y} 
                            stroke={activeMode === 'bass' && i === 1 ? '#4f46e5' : '#78716c'} 
                            strokeWidth={activeMode === 'bass' && i === 1 ? 3 : 1.5}
                            className="transition-all duration-300"
                        />
                    ))}

                    {/* Clef */}
                    <text
                        x="75" y="295"
                        dominantBaseline="central"
                        fontSize="75"
                        fontFamily="'Noto Music', 'Bravura', 'Times New Roman', serif"
                        fill={activeMode === 'bass' ? "#1c1917" : "#57534e"}
                        textAnchor="middle"
                    >
                        𝄢
                    </text>

                    {/* REDESIGNED F NOTE ANIMATION */}
                    {activeMode === 'bass' && (
                        <g>
                            {/* 1. The Reference Point (Between Dots) */}
                            <circle cx="75" cy="275" r="5" fill="#4f46e5" className="animate-ping-slow" />
                            <circle cx="75" cy="275" r="3" fill="white" />

                            {/* 2. The Tracking Line */}
                            <line 
                                x1="85" y1="275" x2="240" y2="275" 
                                stroke="#4f46e5" strokeWidth="2" strokeDasharray="4 2"
                                className="animate-draw-line"
                            />

                            {/* 3. The Note F3 */}
                            <g className="animate-pop-in" style={{ animationDelay: '0.4s' }}>
                                {/* Note Head */}
                                <ellipse cx="240" cy="275" rx="11" ry="8" transform="rotate(-15 240 275)" fill="#1c1917" stroke="#4f46e5" strokeWidth="2" />
                                {/* Stem DOWN */}
                                <line x1="231" y1="275" x2="231" y2="335" stroke="#1c1917" strokeWidth="2" />
                                
                                {/* Target Reticle Effect */}
                                <circle cx="240" cy="275" r="20" fill="none" stroke="#4f46e5" strokeWidth="1" className="animate-ping" opacity="0.3" />

                                {/* Label Tag */}
                                <g transform="translate(265, 275)">
                                    <path d="M0,0 L10,-12 L60,-12 A4,4 0 0 1 64,-8 L64,8 A4,4 0 0 1 60,12 L10,12 Z" fill="#4f46e5" />
                                    <text x="36" y="4" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">F (Fa)</text>
                                </g>
                            </g>
                        </g>
                    )}
                </g>

                {/* --- MIDDLE C GROUP (Center) --- */}
                {/* Fixed Y: 225 */}
                <g 
                    className="transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    style={{ 
                        opacity: activeMode === 'middleC' ? 1 : 0,
                        transform: activeMode === 'middleC' ? 'scale(1)' : 'scale(0.8)',
                        transformOrigin: 'center'
                    }}
                >
                    {/* Connecting Brackets (Visualizing the Bridge) */}
                    {activeMode === 'middleC' && (
                        <>
                            <path d="M 220 195 L 220 225 L 220 255" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" className="animate-pulse" />
                            <circle cx="220" cy="195" r="2" fill="#10b981" />
                            <circle cx="220" cy="255" r="2" fill="#10b981" />
                        </>
                    )}

                    {/* Ledger Line */}
                    <line x1="200" y1="225" x2="240" y2="225" stroke="#10b981" strokeWidth="3" />
                    
                    {/* Note C */}
                    <g className="animate-pop-in">
                        <ellipse cx="220" cy="225" rx="11" ry="8" transform="rotate(-15 220 225)" fill="#10b981" />
                        {/* Stem UP */}
                        <line x1="229" y1="225" x2="229" y2="165" stroke="#10b981" strokeWidth="2" />
                        
                        {/* Floating Label */}
                        <g transform="translate(250, 225)" className="animate-float">
                            <rect x="0" y="-12" width="80" height="24" rx="12" fill="white" stroke="#10b981" strokeWidth="2" />
                            <text x="40" y="5" textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="bold">Middle C</text>
                        </g>
                    </g>
                </g>

                {/* Passive Middle C marker for Neutral Mode */}
                {activeMode === 'neutral' && (
                    <g opacity="0.4">
                         <line x1="200" y1="225" x2="240" y2="225" stroke="#a8a29e" strokeWidth="2" />
                         <ellipse cx="220" cy="225" rx="9" ry="7" transform="rotate(-15 220 225)" fill="#a8a29e" />
                    </g>
                )}

                {/* --- PIANO KEYBOARD (Visual Map) --- */}
                <g transform="translate(60, 350)">
                    {pianoKeys.map((k) => {
                        let isActive = k === keyConfig.highlightIdx;
                        let color = '#fff';
                        
                        if (isActive) {
                            if (activeMode === 'middleC') color = '#10b981';
                            if (activeMode === 'treble') color = '#d97706';
                            if (activeMode === 'bass') color = '#4f46e5';
                        }

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
                    
                    {/* Dynamic Label */}
                    {keyConfig.highlightIdx >= 0 && (
                        <text 
                            x={keyConfig.highlightIdx * 24 + 12} 
                            y="70" 
                            textAnchor="middle" 
                            fill={activeMode === 'bass' || activeMode === 'treble' ? "white" : "white"} 
                            fontSize="10" 
                            fontWeight="bold" 
                            className="animate-pop-in"
                        >
                            {keyConfig.noteName}
                        </text>
                    )}
                    
                    {/* Range Labels */}
                    <text x="12" y="95" textAnchor="middle" fontSize="10" fill="#a8a29e" fontWeight="bold">{getKeyLabel(0)}</text>
                    <text x={14 * 24 + 12} y="95" textAnchor="middle" fontSize="10" fill="#a8a29e" fontWeight="bold">{getKeyLabel(14)}</text>
                </g>
            </svg>

            {/* Hint Overlay */}
            {activeMode === 'neutral' && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-stone-400 flex flex-col items-center animate-pulse">
                    <MousePointer2 size={32} />
                    <span className="mt-2 font-bold text-sm bg-white/80 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm">点击下方按钮选择谱号</span>
                </div>
            )}
         </div>

         {/* --- CONTROLS --- */}
         <div className="flex justify-center gap-4 relative z-20 -mt-6">
             <button
                onClick={() => setActiveMode('treble')}
                className={`flex flex-col items-center px-8 py-4 rounded-2xl border-2 transition-all duration-300 shadow-md ${
                    activeMode === 'treble' 
                    ? 'bg-stone-900 border-stone-900 text-white scale-110 shadow-xl ring-4 ring-amber-100' 
                    : 'bg-white border-stone-200 text-stone-600 hover:border-amber-300 hover:text-stone-900'
                }`}
             >
                {/* Treble Unicode Icon */}
                <div className="text-4xl leading-none mb-1 font-serif select-none">𝄞</div>
                <div className="text-xs font-bold uppercase tracking-widest">高音 (G)</div>
             </button>
             
             <button
                onClick={() => setActiveMode('middleC')}
                className={`flex flex-col items-center px-8 py-4 rounded-2xl border-2 transition-all duration-300 shadow-md ${
                    activeMode === 'middleC' 
                    ? 'bg-stone-900 border-stone-900 text-white scale-110 shadow-xl ring-4 ring-emerald-100' 
                    : 'bg-white border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-stone-900'
                }`}
             >
                <div className="mb-2 h-9 flex items-center"><AlignCenterVertical size={24}/></div>
                <div className="text-xs font-bold uppercase tracking-widest">中央 C</div>
             </button>

             <button
                onClick={() => setActiveMode('bass')}
                className={`flex flex-col items-center px-8 py-4 rounded-2xl border-2 transition-all duration-300 shadow-md ${
                    activeMode === 'bass' 
                    ? 'bg-stone-900 border-stone-900 text-white scale-110 shadow-xl ring-4 ring-indigo-100' 
                    : 'bg-white border-stone-200 text-stone-600 hover:border-indigo-300 hover:text-stone-900'
                }`}
             >
                {/* Bass Unicode Icon */}
                <div className="text-4xl leading-none mb-1 font-serif select-none">𝄢</div>
                <div className="text-xs font-bold uppercase tracking-widest">低音 (F)</div>
             </button>
         </div>
      </div>

      {/* --- INFO CARDS WITH DETAILED EXPLANATION --- */}
      <div className="min-h-[160px] animate-slideUp stagger-2">
         {activeMode === 'neutral' && (
             <div className="bg-stone-100/50 border border-stone-200 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center text-stone-500">
                <BookOpen size={32} className="mb-4 text-stone-300"/>
                <p>请点击下方的按钮，探索不同谱号如何“锁定”音高。</p>
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
                        <strong>核心逻辑：</strong> 谱号螺旋的中心“圆肚子”包住了五线谱的<strong>第二条线</strong>。这就强制规定：这条线上的音符就是 G (Sol)。
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
        .animate-pop-in { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; opacity: 0; transform: scale(0.5); transform-origin: center; }
        @keyframes popIn { to { opacity: 1; transform: scale(1); } }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); transform-origin: 94px 175px; } to { transform: rotate(360deg); transform-origin: 94px 175px; } }
        .animate-bounce-gentle { animation: bounceGentle 2s infinite ease-in-out; }
        @keyframes bounceGentle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        .animate-draw-line { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: draw 1s forwards ease-out; }
        @keyframes draw { to { stroke-dashoffset: 0; } }
        .animate-ping-slow { animation: pingSlow 2s infinite cubic-bezier(0, 0, 0.2, 1); }
        @keyframes pingSlow { 75%, 100% { transform: scale(2); opacity: 0; } }
      `}</style>
    </div>
  );
};

export default ClefsLesson;
