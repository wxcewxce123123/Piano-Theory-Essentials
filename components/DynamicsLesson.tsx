import React, { useRef, useState } from 'react';
import { Volume2, VolumeX, TrendingUp, TrendingDown } from 'lucide-react';

const DynamicsLesson: React.FC = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [activeVol, setActiveVol] = useState<number>(0);

  // Play a C Major chord with specific gain (volume)
  const playChord = (volume: number) => {
    setActiveVol(volume);
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const notes = [261.63, 329.63, 392.00]; 
    
    notes.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = 'triangle'; 
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0, now);
      const targetVol = volume * volume; 
      gain.gain.linearRampToValueAtTime(targetVol, now + 0.05); 
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      
      osc.start(now);
      osc.stop(now + 1.6);
    });

    // Reset visualizer after sound decay
    setTimeout(() => setActiveVol(0), 1000);
  };

  const dynamics = [
    { label: 'pp', name: 'Pianissimo', desc: '极弱', vol: 0.2 },
    { label: 'p', name: 'Piano', desc: '弱', vol: 0.35 },
    { label: 'mp', name: 'Mezzo Piano', desc: '中弱', vol: 0.5 },
    { label: 'mf', name: 'Mezzo Forte', desc: '中强', vol: 0.65 },
    { label: 'f', name: 'Forte', desc: '强', vol: 0.8 },
    { label: 'ff', name: 'Fortissimo', desc: '极强', vol: 1.0 },
  ];

  return (
    <div className="animate-fadeIn space-y-12">
      <header>
        <h2 className="text-4xl font-bold serif text-stone-900 mb-4">强弱记号 (Dynamics)</h2>
        <p className="text-xl text-stone-600 font-light">
          赋予音乐情感色彩的关键。从耳语般的轻柔到雷鸣般的宏大。
        </p>
      </header>

      {/* Interactive Dynamics Bar */}
      <div className="bg-white border border-stone-200 rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
        {/* Visualizer Background */}
        <div className="absolute inset-0 flex items-end opacity-5 pointer-events-none">
           <div 
             className="w-full bg-stone-900 transition-all duration-300 ease-out" 
             style={{ height: `${activeVol * 100}%` }}
           ></div>
        </div>

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center space-x-2 text-stone-400">
            <VolumeX size={20} />
            <span className="text-xs uppercase tracking-wider font-bold">Quiet</span>
          </div>
          <div className="flex items-center space-x-2 text-stone-400">
            <span className="text-xs uppercase tracking-wider font-bold">Loud</span>
            <Volume2 size={20} />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4 relative z-10">
          {dynamics.map((d) => (
            <button
              key={d.label}
              onClick={() => playChord(d.vol)}
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-stone-50 border border-stone-200 hover:border-amber-400 hover:bg-white hover:shadow-lg transition-all group active:scale-95"
            >
              <span className={`font-serif text-3xl mb-2 font-bold italic group-hover:text-amber-600 transition-colors ${d.label.includes('f') ? 'text-stone-900' : 'text-stone-500'}`}>
                {d.label}
              </span>
              <span className="text-xs text-stone-400 font-medium uppercase tracking-wide group-hover:text-stone-600">{d.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Crescendo / Decrescendo */}
      <section className="grid md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-amber-50 to-white p-8 rounded-2xl border border-amber-100 card-hover">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-amber-100 p-2.5 rounded-lg text-amber-700">
               <TrendingUp size={24} />
            </div>
            <h3 className="font-bold text-stone-900 text-lg">渐强 (Crescendo)</h3>
          </div>
          <p className="text-stone-600 mb-8 leading-relaxed">
            音量逐渐变大。通常写为 <strong className="font-serif italic text-lg text-amber-700">cresc.</strong> 或画一个张开的 "喇叭"。
          </p>
          <div className="h-12 flex items-center justify-center opacity-80">
            <svg width="240" height="40" viewBox="0 0 240 40" className="overflow-visible">
              <path d="M10 20 L230 5" fill="none" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
              <path d="M10 20 L230 35" fill="none" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-2xl border border-indigo-100 card-hover">
          <div className="flex items-center gap-4 mb-4">
             <div className="bg-indigo-100 p-2.5 rounded-lg text-indigo-700">
               <TrendingDown size={24} />
             </div>
            <h3 className="font-bold text-stone-900 text-lg">渐弱 (Decrescendo)</h3>
          </div>
          <p className="text-stone-600 mb-8 leading-relaxed">
            音量逐渐变小。通常写为 <strong className="font-serif italic text-lg text-indigo-700">dim.</strong> 或画一个闭合的 "喇叭"。
          </p>
          <div className="h-12 flex items-center justify-center opacity-80">
            <svg width="240" height="40" viewBox="0 0 240 40" className="overflow-visible">
              <path d="M10 5 L230 20" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
              <path d="M10 35 L230 20" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DynamicsLesson;