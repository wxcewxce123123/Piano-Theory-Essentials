
import React, { useState, useRef, useEffect } from 'react';
import { MousePointerClick, Zap, ArrowDownToLine, Info, Music } from 'lucide-react';

const ArticulationsLesson: React.FC = () => {
  const [activeType, setActiveType] = useState<'staccato' | 'accent' | 'tenuto'>('staccato');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  const playArticulation = (type: 'staccato' | 'accent' | 'tenuto') => {
    setActiveType(type);
    setIsPlaying(true);
    
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = 440; // A4
    osc.type = 'triangle';
    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0, now);

    if (type === 'staccato') {
        // Staccato: Very short, crisp
        gain.gain.linearRampToValueAtTime(0.5, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1); 
        osc.stop(now + 0.15);
        timerRef.current = window.setTimeout(() => setIsPlaying(false), 200);
    } else if (type === 'accent') {
        // Accent: Loud attack, sharp decay
        gain.gain.linearRampToValueAtTime(0.8, now + 0.02); // Attack
        gain.gain.exponentialRampToValueAtTime(0.4, now + 0.2); // Decay to sustain
        gain.gain.linearRampToValueAtTime(0.001, now + 0.8);
        osc.stop(now + 0.85);
        timerRef.current = window.setTimeout(() => setIsPlaying(false), 900);
    } else if (type === 'tenuto') {
        // Tenuto: Full duration, steady weight
        gain.gain.linearRampToValueAtTime(0.5, now + 0.05);
        gain.gain.setValueAtTime(0.5, now + 0.9); // Sustain full
        gain.gain.linearRampToValueAtTime(0.001, now + 1.0); // Release
        osc.stop(now + 1.05);
        timerRef.current = window.setTimeout(() => setIsPlaying(false), 1100);
    }

    osc.start(now);
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 2 - Expression</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            运音法 <span className="text-stone-300 font-light">|</span> Articulation
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          如果旋律是说话的内容，那么运音法就是说话的“语气”。它决定了音符是如何开始、持续和结束的。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-200 p-8 md:p-12 animate-slideUp stagger-1 flex flex-col gap-10 relative overflow-hidden">
          
          {/* Visualizer Canvas */}
          <div className="relative w-full h-64 bg-stone-50 rounded-3xl border border-stone-100 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#d6d3d1 1px, transparent 1px)', backgroundSize: '100% 20px' }}></div>
              
              {/* Baseline */}
              <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-stone-300 rounded-full"></div>

              {/* Dynamic Animation based on Type */}
              <div className="relative z-10">
                  {/* Staccato Visual: Bouncing Ball */}
                  {activeType === 'staccato' && (
                      <div className={`flex flex-col items-center gap-4 ${isPlaying ? 'animate-bounce-short' : ''}`}>
                          <div className="w-12 h-12 bg-amber-500 rounded-full shadow-lg flex items-center justify-center text-white font-bold">
                              .
                          </div>
                          <div className={`w-2 h-2 bg-stone-800 rounded-full ${isPlaying ? 'opacity-100' : 'opacity-0'} transition-opacity`}></div>
                      </div>
                  )}

                  {/* Accent Visual: Shockwave Impact */}
                  {activeType === 'accent' && (
                      <div className="relative flex items-center justify-center">
                          {isPlaying && (
                              <>
                                <div className="absolute w-32 h-32 border-4 border-red-500 rounded-full animate-ping opacity-20"></div>
                                <div className="absolute w-48 h-48 border-2 border-red-400 rounded-full animate-ping opacity-10" style={{ animationDelay: '0.1s' }}></div>
                              </>
                          )}
                          <div className={`w-16 h-16 bg-red-500 transform rotate-45 rounded-lg shadow-xl flex items-center justify-center transition-transform duration-100 ${isPlaying ? 'scale-125' : 'scale-100'}`}>
                              <Zap className="text-white transform -rotate-45" size={32} />
                          </div>
                      </div>
                  )}

                  {/* Tenuto Visual: Heavy Press */}
                  {activeType === 'tenuto' && (
                      <div className="relative">
                          <div className={`w-32 h-16 bg-indigo-600 rounded-xl shadow-lg flex items-center justify-center text-white font-bold transition-all duration-300 ${isPlaying ? 'translate-y-4 scale-x-110 shadow-md' : '-translate-y-4 shadow-2xl'}`}>
                              <ArrowDownToLine />
                          </div>
                          <div className={`absolute -bottom-2 left-0 w-full h-1 bg-indigo-300 rounded-full transition-all duration-300 ${isPlaying ? 'opacity-100 w-full' : 'opacity-0 w-0'}`}></div>
                      </div>
                  )}
              </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button 
                onClick={() => playArticulation('staccato')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group ${activeType === 'staccato' ? 'border-amber-500 bg-amber-50' : 'border-stone-200 hover:bg-stone-50'}`}
              >
                  <div className={`p-2 rounded-full ${activeType === 'staccato' ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-500'}`}>
                      <MousePointerClick size={20} />
                  </div>
                  <span className="font-bold text-stone-900">跳音 (Staccato)</span>
              </button>

              <button 
                onClick={() => playArticulation('accent')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group ${activeType === 'accent' ? 'border-red-500 bg-red-50' : 'border-stone-200 hover:bg-stone-50'}`}
              >
                  <div className={`p-2 rounded-full ${activeType === 'accent' ? 'bg-red-500 text-white' : 'bg-stone-200 text-stone-500'}`}>
                      <Zap size={20} />
                  </div>
                  <span className="font-bold text-stone-900">重音 (Accent)</span>
              </button>

              <button 
                onClick={() => playArticulation('tenuto')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group ${activeType === 'tenuto' ? 'border-indigo-500 bg-indigo-50' : 'border-stone-200 hover:bg-stone-50'}`}
              >
                  <div className={`p-2 rounded-full ${activeType === 'tenuto' ? 'bg-indigo-500 text-white' : 'bg-stone-200 text-stone-500'}`}>
                      <ArrowDownToLine size={20} />
                  </div>
                  <span className="font-bold text-stone-900">保持音 (Tenuto)</span>
              </button>
          </div>
      </div>

      {/* Detailed Theory Explanations */}
      <div className="grid md:grid-cols-3 gap-6 animate-slideUp stagger-2">
          {/* Staccato Card */}
          <div className={`p-6 rounded-2xl border transition-colors ${activeType === 'staccato' ? 'bg-white border-amber-200 shadow-md' : 'bg-stone-50 border-stone-200 opacity-60 hover:opacity-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-serif font-bold text-lg">.</div>
                  <h3 className="font-bold text-stone-900">跳音 (Staccato)</h3>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  <strong>定义：</strong> 音符只演奏其时值的一半左右，剩下的时间是休止的。<br/>
                  <strong>比喻：</strong> 像手指触碰到了滚烫的炉灶，迅速弹开；或者像雨滴落在荷叶上。<br/>
              </p>
              <div className="bg-amber-50 p-3 rounded-lg text-xs text-amber-800 font-medium flex gap-2">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  技巧：利用手腕的弹性，触键后迅速放松并抬起。
              </div>
          </div>

          {/* Accent Card */}
          <div className={`p-6 rounded-2xl border transition-colors ${activeType === 'accent' ? 'bg-white border-red-200 shadow-md' : 'bg-stone-50 border-stone-200 opacity-60 hover:opacity-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-sans font-black text-lg">{'>'}</div>
                  <h3 className="font-bold text-stone-900">重音 (Accent)</h3>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  <strong>定义：</strong> 强调该音符，使其比周围的音符更强、更突出。<br/>
                  <strong>比喻：</strong> 像是用锤子敲击钉子，或者说话时加重的语气（"我<strong>真的</strong>很饿"）。<br/>
              </p>
              <div className="bg-red-50 p-3 rounded-lg text-xs text-red-800 font-medium flex gap-2">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  技巧：利用手臂的重量迅速下沉，给音头一个爆发力。
              </div>
          </div>

          {/* Tenuto Card */}
          <div className={`p-6 rounded-2xl border transition-colors ${activeType === 'tenuto' ? 'bg-white border-indigo-200 shadow-md' : 'bg-stone-50 border-stone-200 opacity-60 hover:opacity-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">-</div>
                  <h3 className="font-bold text-stone-900">保持音 (Tenuto)</h3>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  <strong>定义：</strong> 保持音符的全部时值，甚至稍微拖长一点，强调其重量感。<br/>
                  <strong>比喻：</strong> 像是在粘稠的泥土中行走，每一步都踩得实实在在。<br/>
              </p>
              <div className="bg-indigo-50 p-3 rounded-lg text-xs text-indigo-800 font-medium flex gap-2">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  技巧：手指沉入琴键到底，保持重量传递，直到下一音开始前。
              </div>
          </div>
      </div>

      <style>{`
        @keyframes bounce-short {
            0%, 100% { transform: translateY(0); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
            50% { transform: translateY(-50px); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
        }
        .animate-bounce-short {
            animation: bounce-short 0.3s infinite;
        }
      `}</style>
    </div>
  );
};

export default ArticulationsLesson;
