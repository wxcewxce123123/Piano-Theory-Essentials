
import React, { useState, useRef } from 'react';
import { ArrowUp, ArrowDown, Minus, Info, AlertTriangle } from 'lucide-react';

const AccidentalsLesson: React.FC = () => {
  const [activeType, setActiveType] = useState<'natural' | 'sharp' | 'flat'>('natural');
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playNote = (type: 'natural' | 'sharp' | 'flat') => {
    setActiveType(type);
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Base G4 = 392.00 Hz
    let freq = 392.00;
    if (type === 'sharp') freq = 415.30; // G#
    if (type === 'flat') freq = 369.99; // Gb

    osc.frequency.value = freq;
    osc.type = 'triangle';
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    
    osc.start(now);
    osc.stop(now + 1.1);
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 1 - Foundations</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            升降号 <span className="text-stone-300 font-light">|</span> Accidentals
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          钢琴上的黑键并不是“二等公民”。升降号告诉我们何时偏离白键，去寻找半音的色彩。
        </p>
      </header>

      {/* Main Stage */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-stone-200 animate-slideUp stagger-1 flex flex-col md:flex-row gap-12 items-center justify-center min-h-[500px] relative overflow-hidden">
          {/* Background Decor - pointer-events-none ensures it doesn't block clicks */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none z-0"></div>

          {/* Visualization Stage */}
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md relative z-10 pt-8">
             
             {/* Staircase Visual Analogy - Increased height to h-64 to prevent clipping */}
             <div className="w-full h-64 relative mb-4 flex items-center justify-center pointer-events-none">
                 <div className="absolute w-full h-px bg-stone-100 top-[65%]"></div>
                 {/* Floor Lines */}
                 <div className="flex items-end gap-0.5 h-full pb-8">
                     <div className={`w-16 h-20 bg-stone-100 border-t-2 border-stone-200 relative transition-colors duration-300 ${activeType === 'flat' ? 'bg-amber-100 border-amber-300' : ''}`}>
                         <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono text-stone-400">Flat</span>
                     </div>
                     <div className={`w-16 h-32 bg-stone-100 border-t-2 border-stone-300 relative transition-colors duration-300 ${activeType === 'natural' ? 'bg-stone-200 border-stone-400' : ''}`}>
                         <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono text-stone-500 font-bold">Natural</span>
                     </div>
                     <div className={`w-16 h-44 bg-stone-100 border-t-2 border-stone-200 relative transition-colors duration-300 ${activeType === 'sharp' ? 'bg-amber-100 border-amber-300' : ''}`}>
                         <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono text-stone-400">Sharp</span>
                     </div>
                 </div>
                 
                 {/* The Ball - Adjusted positions relative to new height */}
                 <div 
                    className={`absolute w-6 h-6 rounded-full bg-stone-900 shadow-lg transition-all duration-500 ease-out`}
                    style={{ 
                        bottom: activeType === 'flat' ? '106px' : (activeType === 'natural' ? '154px' : '202px'),
                        transform: `translate(${activeType === 'flat' ? '-34px' : (activeType === 'natural' ? '0px' : '34px')}, 0px)` 
                    }}
                 ></div>
             </div>

             {/* Staff View - pointer-events-none */}
             <div className="relative w-full h-32 flex items-center justify-center mb-8 pointer-events-none">
                <div className="absolute w-full space-y-4 opacity-30">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-0.5 bg-stone-800 w-full"></div>)}
                </div>
                
                <div className="relative z-10 flex items-center justify-center transition-transform duration-300" style={{ transform: 'translateY(-18px)' }}>
                    <div className={`font-serif text-6xl mr-4 transition-all duration-300 ${activeType === 'natural' ? 'opacity-0 -translate-x-4' : 'opacity-100 translate-x-0'}`}>
                        {activeType === 'sharp' ? '♯' : '♭'}
                    </div>
                    <div className="relative">
                        <div className={`w-8 h-6 bg-stone-900 rounded-[50%] transform -rotate-12 transition-colors duration-300 ${activeType !== 'natural' ? 'bg-amber-600' : ''}`}></div>
                        <div className={`w-1 h-20 bg-stone-900 absolute right-0 bottom-2 transition-colors duration-300 ${activeType !== 'natural' ? 'bg-amber-800' : ''}`}></div>
                    </div>
                </div>
             </div>

             {/* Keyboard View - Interactive - pointer-events-auto */}
             <div className="flex relative items-start justify-center z-20 pointer-events-auto">
                 {/* White Keys */}
                 <div className="flex">
                    <button 
                      className="w-14 h-40 border border-stone-300 rounded-b-lg bg-white active:bg-stone-100 outline-none focus:ring-2 focus:ring-amber-200"
                      onClick={() => playNote('natural')}
                    ></button>
                    <button 
                        onClick={() => playNote('natural')}
                        className="w-14 h-40 border border-stone-300 rounded-b-lg bg-white relative active:bg-stone-100 outline-none focus:ring-2 focus:ring-amber-200"
                    >
                        {/* Dot for G Natural */}
                        {activeType === 'natural' && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-stone-400 rounded-full animate-bounce"></div>
                        )}
                    </button>
                    <button 
                      className="w-14 h-40 border border-stone-300 rounded-b-lg bg-white active:bg-stone-100 outline-none focus:ring-2 focus:ring-amber-200"
                      onClick={() => playNote('natural')}
                    ></button>
                 </div>
                 
                 {/* Black Keys */}
                 <div className="absolute top-0 left-9 flex gap-5">
                    <button 
                        onClick={() => playNote('flat')}
                        className={`w-9 h-24 rounded-b-lg border border-stone-800 z-30 transition-colors duration-300 shadow-md outline-none ${activeType === 'flat' ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]' : 'bg-stone-900 hover:bg-stone-800'}`}
                    >
                        {activeType === 'flat' && <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-[10px] text-white font-bold pointer-events-none">Gb</div>}
                    </button>
                    <button 
                        onClick={() => playNote('sharp')}
                        className={`w-9 h-24 rounded-b-lg border border-stone-800 z-30 transition-colors duration-300 shadow-md outline-none ${activeType === 'sharp' ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]' : 'bg-stone-900 hover:bg-stone-800'}`}
                    >
                         {activeType === 'sharp' && <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-[10px] text-white font-bold pointer-events-none">G#</div>}
                    </button>
                 </div>
             </div>

          </div>

          {/* Controls - High Z-Index to prevent blocking */}
          <div className="flex flex-col gap-4 w-full md:w-auto relative z-50">
              <button 
                onClick={() => playNote('sharp')}
                className={`p-6 rounded-2xl border-2 text-left transition-all w-64 cursor-pointer relative ${
                    activeType === 'sharp' 
                    ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200 scale-105 shadow-lg' 
                    : 'border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300'
                }`}
              >
                 <div className="flex justify-between items-center mb-2 pointer-events-none">
                     <span className="text-3xl font-serif">♯</span>
                     <ArrowUp className="text-amber-500" />
                 </div>
                 <div className="font-bold text-stone-900 pointer-events-none">升号 (Sharp)</div>
                 <div className="text-xs text-stone-500 mt-1 pointer-events-none">升高半音 (上楼)</div>
              </button>

              <button 
                onClick={() => playNote('natural')}
                className={`p-6 rounded-2xl border-2 text-left transition-all w-64 cursor-pointer relative ${
                    activeType === 'natural' 
                    ? 'border-stone-500 bg-stone-100 ring-2 ring-stone-200 scale-105 shadow-lg' 
                    : 'border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300'
                }`}
              >
                 <div className="flex justify-between items-center mb-2 pointer-events-none">
                     <span className="text-3xl font-serif">♮</span>
                     <Minus className="text-stone-500" />
                 </div>
                 <div className="font-bold text-stone-900 pointer-events-none">还原号 (Natural)</div>
                 <div className="text-xs text-stone-500 mt-1 pointer-events-none">回到本位 (平地)</div>
              </button>

              <button 
                onClick={() => playNote('flat')}
                className={`p-6 rounded-2xl border-2 text-left transition-all w-64 cursor-pointer relative ${
                    activeType === 'flat' 
                    ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200 scale-105 shadow-lg' 
                    : 'border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300'
                }`}
              >
                 <div className="flex justify-between items-center mb-2 pointer-events-none">
                     <span className="text-3xl font-serif">♭</span>
                     <ArrowDown className="text-amber-500" />
                 </div>
                 <div className="font-bold text-stone-900 pointer-events-none">降号 (Flat)</div>
                 <div className="text-xs text-stone-500 mt-1 pointer-events-none">降低半音 (下楼)</div>
              </button>
          </div>
      </div>

      {/* Theory Cards */}
      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
          <div className="bg-stone-50 rounded-3xl p-8 border border-stone-200">
              <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Info size={20} className="text-blue-500" />
                  什么是“半音” (Semitone)?
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                  这是钢琴上<strong>最近的距离</strong>。无论是白键到黑键，还是两个白键之间（如 E-F, B-C），只要是紧挨着的，就是半音。升号就是把音向上推一个半音，降号则是向下拉一个半音。
              </p>
          </div>

          <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100">
              <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-amber-600" />
                  小节内有效原则 (Rule of the Measure)
              </h3>
              <p className="text-stone-700 text-sm leading-relaxed">
                  这是一个新手常犯的错误！如果一个小节内某个音被标记了升号（如 F#），那么<strong>在这个小节结束前</strong>，所有同高度的 F 都要弹成 F#，除非遇到还原号。一旦跨过小节线，升号自动失效。
              </p>
          </div>
      </div>
    </div>
  );
};

export default AccidentalsLesson;
