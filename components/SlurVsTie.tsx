import React from 'react';
import { Music2, RefreshCcw } from 'lucide-react';

const SlurVsTie: React.FC = () => {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Card: Slur */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden card-hover group relative">
        <div className="bg-amber-50/50 p-5 text-center border-b border-amber-100/50 flex justify-between items-center">
          <div className="w-6"></div> {/* Spacer */}
          <h3 className="font-bold text-amber-900 text-lg">连音线 (Slur)</h3>
          <Music2 size={16} className="text-amber-300" />
        </div>
        <div className="p-8 flex flex-col items-center">
          <div className="relative mb-6 transform group-hover:scale-105 transition-transform duration-500">
            <svg width="220" height="140" viewBox="0 0 220 140" className="overflow-visible">
                {/* Staff Lines */}
                <g stroke="#e7e5e4" strokeWidth="2" strokeLinecap="round">
                <line x1="0" y1="40" x2="220" y2="40" />
                <line x1="0" y1="60" x2="220" y2="60" />
                <line x1="0" y1="80" x2="220" y2="80" />
                <line x1="0" y1="100" x2="220" y2="100" />
                <line x1="0" y1="120" x2="220" y2="120" />
                </g>
                
                {/* Note 1: C (High) */}
                <g className="translate-y-0 transition-transform duration-300">
                    <ellipse cx="60" cy="50" rx="8" ry="6" transform="rotate(-15 60 50)" fill="#1c1917" />
                    <line x1="53" y1="52" x2="53" y2="90" stroke="#1c1917" strokeWidth="2" /> {/* Stem Down */}
                </g>
                
                {/* Note 2: A (Lower) */}
                <g className="translate-y-0 transition-transform duration-300 delay-100">
                    <ellipse cx="160" cy="70" rx="8" ry="6" transform="rotate(-15 160 70)" fill="#1c1917" />
                    <line x1="153" y1="72" x2="153" y2="110" stroke="#1c1917" strokeWidth="2" /> {/* Stem Down */}
                </g>

                {/* The Slur Arc - Animated on Hover */}
                {/* Control points tailored for a nice curve above notes */}
                <path 
                d="M 60 40 Q 110 0 160 60" 
                fill="none" 
                stroke="#d97706" 
                strokeWidth="3" 
                strokeLinecap="round" 
                className="stroke-dasharray-1000 stroke-dashoffset-1000 group-hover:animate-draw transition-all"
                style={{ strokeDasharray: 300, strokeDashoffset: 300 }}
                />
            </svg>
            <div className="absolute top-0 right-0 text-[10px] text-stone-300 font-mono bg-white px-1 rounded border border-stone-100 opacity-0 group-hover:opacity-100 transition-opacity">Hover to play</div>
          </div>

          <ul className="w-full space-y-3 text-stone-600 bg-stone-50/80 p-5 rounded-2xl border border-stone-100 text-sm">
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold mr-3 mt-0.5 shrink-0">1</span>
              <span>连接<strong>不同</strong>音高的音符</span>
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold mr-3 mt-0.5 shrink-0">2</span>
              <span>表示<strong>连奏 (Legato)</strong>，圆滑无断奏</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Card: Tie */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden card-hover group relative">
        <div className="bg-stone-100/50 p-5 text-center border-b border-stone-100 flex justify-between items-center">
           <div className="w-6"></div>
          <h3 className="font-bold text-stone-700 text-lg">延音线 (Tie)</h3>
          <Music2 size={16} className="text-stone-300" />
        </div>
        <div className="p-8 flex flex-col items-center">
            <div className="relative mb-6 transform group-hover:scale-105 transition-transform duration-500">
            <svg width="220" height="140" viewBox="0 0 220 140" className="overflow-visible">
                {/* Staff Lines */}
                <g stroke="#e7e5e4" strokeWidth="2" strokeLinecap="round">
                    <line x1="0" y1="40" x2="220" y2="40" />
                    <line x1="0" y1="60" x2="220" y2="60" />
                    <line x1="0" y1="80" x2="220" y2="80" />
                    <line x1="0" y1="100" x2="220" y2="100" />
                    <line x1="0" y1="120" x2="220" y2="120" />
                </g>
                
                {/* Note 1: G */}
                <g>
                    <ellipse cx="60" cy="80" rx="8" ry="6" transform="rotate(-15 60 80)" fill="#1c1917" />
                    <line x1="67" y1="78" x2="67" y2="30" stroke="#1c1917" strokeWidth="2" /> {/* Stem Up */}
                </g>
                
                {/* Note 2: G (Same Pitch!) - Faded slightly to imply it's not re-struck */}
                <g className="opacity-60">
                    <ellipse cx="160" cy="80" rx="8" ry="6" transform="rotate(-15 160 80)" fill="#1c1917" />
                    <line x1="167" y1="78" x2="167" y2="30" stroke="#1c1917" strokeWidth="2" /> {/* Stem Up */}
                </g>

                {/* The Tie Arc (Shallower, closer to note heads) */}
                <path 
                d="M 60 95 Q 110 120 160 95" 
                fill="none" 
                stroke="#57534e" 
                strokeWidth="3" 
                strokeLinecap="round" 
                className="group-hover:animate-draw"
                style={{ strokeDasharray: 200, strokeDashoffset: 200 }}
                />
            </svg>
          </div>

          <ul className="w-full space-y-3 text-stone-600 bg-stone-50/80 p-5 rounded-2xl border border-stone-100 text-sm">
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-[10px] font-bold mr-3 mt-0.5 shrink-0">1</span>
              <span>连接<strong>相同</strong>音高的音符</span>
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-[10px] font-bold mr-3 mt-0.5 shrink-0">2</span>
              <span><strong>时值相加</strong>，只弹第一个音</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SlurVsTie;