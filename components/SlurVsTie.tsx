
import React, { useState, useRef } from 'react';
import { Music2, Link, Activity, MousePointer2 } from 'lucide-react';

const SlurVsTie: React.FC = () => {
  const [activeType, setActiveType] = useState<'slur' | 'tie' | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playDemo = (type: 'slur' | 'tie') => {
    setActiveType(type);
    
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'slur') {
        // Slur: Two different notes connected smoothly (Legato)
        // C4 -> E4
        osc.frequency.setValueAtTime(261.63, now);
        osc.frequency.setValueAtTime(329.63, now + 0.5); // Change pitch without stopping
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.1);
        gain.gain.setValueAtTime(0.5, now + 0.9);
        gain.gain.linearRampToValueAtTime(0, now + 1.0);
        
        osc.start(now);
        osc.stop(now + 1.1);
    } else {
        // Tie: Two same notes merged into one long note
        // C4 held for double duration
        osc.frequency.value = 261.63;
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.1);
        // Sustain longer
        gain.gain.setValueAtTime(0.5, now + 1.4); 
        gain.gain.linearRampToValueAtTime(0, now + 1.5);
        
        osc.start(now);
        osc.stop(now + 1.6);
    }

    setTimeout(() => setActiveType(null), 1600);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Card: Slur */}
      <div 
        className={`bg-white rounded-3xl shadow-sm border-2 overflow-hidden cursor-pointer transition-all duration-300 group ${activeType === 'slur' ? 'border-amber-400 ring-4 ring-amber-100' : 'border-stone-100 hover:border-amber-200 hover:shadow-lg'}`}
        onClick={() => playDemo('slur')}
      >
        <div className="bg-amber-50/50 p-5 border-b border-amber-100/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className={`p-2 rounded-full ${activeType === 'slur' ? 'bg-amber-500 text-white' : 'bg-white text-amber-500'}`}>
                 <Activity size={18} />
             </div>
             <h3 className="font-bold text-amber-900 text-lg">连音线 (Slur)</h3>
          </div>
          {activeType === 'slur' && <span className="text-xs font-bold text-amber-600 animate-pulse">Playing...</span>}
        </div>
        
        <div className="p-8 flex flex-col items-center relative">
          <div className="relative mb-6 transform transition-transform duration-500 group-hover:scale-105">
            <svg width="220" height="140" viewBox="0 0 220 140" className="overflow-visible">
                {/* Staff Lines */}
                <g stroke="#e7e5e4" strokeWidth="2" strokeLinecap="round">
                    {[40, 60, 80, 100, 120].map(y => <line key={y} x1="0" y1={y} x2="220" y2={y} />)}
                </g>
                
                {/* Note 1: C (High) */}
                <g>
                    <ellipse cx="60" cy="50" rx="10" ry="8" transform="rotate(-15 60 50)" fill={activeType === 'slur' ? '#d97706' : '#1c1917'} className="transition-colors duration-300" />
                    <line x1="53" y1="52" x2="53" y2="90" stroke={activeType === 'slur' ? '#d97706' : '#1c1917'} strokeWidth="2" />
                </g>
                
                {/* Note 2: E (Lower) - Different Pitch! */}
                <g>
                    <ellipse cx="160" cy="70" rx="10" ry="8" transform="rotate(-15 160 70)" fill={activeType === 'slur' ? '#d97706' : '#1c1917'} className="transition-colors duration-300" style={{ transitionDelay: '0.5s' }} />
                    <line x1="153" y1="72" x2="153" y2="110" stroke={activeType === 'slur' ? '#d97706' : '#1c1917'} strokeWidth="2" />
                </g>

                {/* The Slur Arc */}
                <path 
                    d="M 60 40 Q 110 -10 160 60" 
                    fill="none" 
                    stroke="#f59e0b" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    className={`transition-all duration-1000 ${activeType === 'slur' ? 'stroke-dashoffset-0' : 'stroke-dashoffset-[300px]'}`}
                    strokeDasharray="300"
                    style={{ strokeDashoffset: activeType === 'slur' ? 0 : 300 }}
                />
            </svg>
            
            {/* Visual Hint */}
            <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold transition-opacity duration-300 ${activeType === 'slur' ? 'opacity-100' : 'opacity-0'}`}>
                不同音高 = 连奏
            </div>
          </div>

          <ul className="w-full space-y-3 text-stone-600 bg-stone-50 p-5 rounded-2xl border border-stone-100 text-sm">
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold mr-3 mt-0.5 shrink-0">1</span>
              <span>连接<strong>不同</strong>音高的音符。</span>
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold mr-3 mt-0.5 shrink-0">2</span>
              <span>意思是<strong>连奏 (Legato)</strong>，中间不要断开。</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Card: Tie */}
      <div 
        className={`bg-white rounded-3xl shadow-sm border-2 overflow-hidden cursor-pointer transition-all duration-300 group ${activeType === 'tie' ? 'border-indigo-400 ring-4 ring-indigo-100' : 'border-stone-100 hover:border-indigo-200 hover:shadow-lg'}`}
        onClick={() => playDemo('tie')}
      >
        <div className="bg-indigo-50/50 p-5 border-b border-indigo-100/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className={`p-2 rounded-full ${activeType === 'tie' ? 'bg-indigo-500 text-white' : 'bg-white text-indigo-500'}`}>
                 <Link size={18} />
             </div>
             <h3 className="font-bold text-indigo-900 text-lg">延音线 (Tie)</h3>
          </div>
          {activeType === 'tie' && <span className="text-xs font-bold text-indigo-600 animate-pulse">Playing...</span>}
        </div>
        
        <div className="p-8 flex flex-col items-center relative">
          <div className="relative mb-6 transform transition-transform duration-500 group-hover:scale-105">
            <svg width="220" height="140" viewBox="0 0 220 140" className="overflow-visible">
                {/* Staff Lines */}
                <g stroke="#e7e5e4" strokeWidth="2" strokeLinecap="round">
                    {[40, 60, 80, 100, 120].map(y => <line key={y} x1="0" y1={y} x2="220" y2={y} />)}
                </g>
                
                {/* Note 1: C */}
                <g>
                    <ellipse cx="60" cy="50" rx="10" ry="8" transform="rotate(-15 60 50)" fill={activeType === 'tie' ? '#4f46e5' : '#1c1917'} className="transition-colors duration-300" />
                    <line x1="53" y1="52" x2="53" y2="90" stroke={activeType === 'tie' ? '#4f46e5' : '#1c1917'} strokeWidth="2" />
                </g>
                
                {/* Note 2: C (Same Pitch!) */}
                <g>
                    <ellipse cx="160" cy="50" rx="10" ry="8" transform="rotate(-15 160 50)" fill={activeType === 'tie' ? '#4f46e5' : '#1c1917'} className="transition-colors duration-300" style={{ transitionDelay: '0.5s' }} />
                    <line x1="153" y1="52" x2="153" y2="90" stroke={activeType === 'tie' ? '#4f46e5' : '#1c1917'} strokeWidth="2" />
                </g>

                {/* The Tie Arc */}
                <path 
                    d="M 60 65 Q 110 95 160 65" 
                    fill="none" 
                    stroke="#6366f1" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    className={`transition-all duration-1000 ${activeType === 'tie' ? 'stroke-dashoffset-0' : 'stroke-dashoffset-[300px]'}`}
                    strokeDasharray="300"
                    style={{ strokeDashoffset: activeType === 'tie' ? 0 : 300 }}
                />
            </svg>
            
            {/* Visual Hint */}
            <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold transition-opacity duration-300 ${activeType === 'tie' ? 'opacity-100' : 'opacity-0'}`}>
                相同音高 = 合并
            </div>
          </div>

          <ul className="w-full space-y-3 text-stone-600 bg-stone-50 p-5 rounded-2xl border border-stone-100 text-sm">
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold mr-3 mt-0.5 shrink-0">1</span>
              <span>连接<strong>相同</strong>音高的音符。</span>
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold mr-3 mt-0.5 shrink-0">2</span>
              <span>只弹第1个音，保持时值直到第2个音结束。</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SlurVsTie;
