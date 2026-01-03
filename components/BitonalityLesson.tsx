
import React, { useState, useRef } from 'react';
import { SplitSquareHorizontal, Zap, Play } from 'lucide-react';

const BitonalityLesson: React.FC = () => {
  const [activeHand, setActiveHand] = useState<'left' | 'right' | 'both'>('left');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Petrushka Chord Logic
  // Left Hand: C Major (C E G)
  // Right Hand: F# Major (F# A# C#) - Tritone apart
  
  const cMajor = [261.63, 329.63, 392.00];
  const fsMajor = [369.99, 466.16, 554.37];

  const playChord = (type: 'left' | 'right' | 'both') => {
    setActiveHand(type);
    setIsPlaying(true);

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const freqs = type === 'left' ? cMajor : (type === 'right' ? fsMajor : [...cMajor, ...fsMajor]);
    
    freqs.forEach(f => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = f;
        osc.type = 'triangle';
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        gain.gain.setValueAtTime(0, now);
        // More percussive attack for Stravinsky feel
        gain.gain.linearRampToValueAtTime(0.2, now + 0.05); 
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        
        osc.start(now);
        osc.stop(now + 1.6);
    });

    setTimeout(() => setIsPlaying(false), 1500);
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-stone-900 text-stone-100 rounded-full text-xs font-bold tracking-wider uppercase mb-3 shadow-lg">Level 5 - Master Class</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            双调性 <span className="text-stone-300 font-light">|</span> Bitonality
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          当两种截然不同的调性同时奏响，会发生什么？斯特拉文斯基给出了答案：一种充满张力、如同火花碰撞般的现代美感。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-stone-200 p-8 md:p-12 relative overflow-hidden animate-slideUp stagger-1 flex flex-col gap-10 max-w-4xl mx-auto">
          
          {/* Split Background */}
          <div className="absolute inset-0 flex pointer-events-none opacity-5">
              <div className="w-1/2 bg-blue-500 h-full"></div>
              <div className="w-1/2 bg-red-500 h-full"></div>
          </div>
          <div className="absolute inset-y-0 left-1/2 w-px bg-stone-200 pointer-events-none"></div>

          {/* Visualization of Hands */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10 min-h-[300px]">
              
              {/* Left Hand: C Major */}
              <div className={`flex-1 flex flex-col items-center transition-all duration-300 ${activeHand === 'left' || activeHand === 'both' ? 'opacity-100 scale-105' : 'opacity-40 grayscale'}`}>
                  <div className="relative w-48 h-48 bg-blue-50 rounded-full flex items-center justify-center border-4 border-blue-100 mb-6 shadow-inner">
                      {/* Notes Visual */}
                      <div className="absolute inset-0 flex items-center justify-center gap-2">
                          {['C', 'E', 'G'].map((n, i) => (
                              <div key={i} className="flex flex-col items-center gap-2">
                                  <div className={`w-8 h-24 bg-white border border-stone-200 rounded-b-lg shadow-sm flex items-end justify-center pb-2 font-bold text-blue-600 ${isPlaying && (activeHand === 'left' || activeHand === 'both') ? 'translate-y-2 bg-blue-100' : ''} transition-all`}>
                                      {n}
                                  </div>
                              </div>
                          ))}
                      </div>
                      <div className="absolute -top-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold tracking-widest">Left Hand</div>
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900">C Major</h3>
                  <p className="text-stone-500 text-sm">纯白键 · 稳定 · 基础</p>
              </div>

              {/* Clash Symbol */}
              <div className={`text-4xl transition-all duration-300 ${activeHand === 'both' ? 'text-stone-800 scale-150 rotate-12' : 'text-stone-300 scale-100'}`}>
                  {activeHand === 'both' ? <Zap size={48} className="fill-amber-400 text-amber-500 animate-pulse" /> : <SplitSquareHorizontal size={32} />}
              </div>

              {/* Right Hand: F# Major */}
              <div className={`flex-1 flex flex-col items-center transition-all duration-300 ${activeHand === 'right' || activeHand === 'both' ? 'opacity-100 scale-105' : 'opacity-40 grayscale'}`}>
                  <div className="relative w-48 h-48 bg-red-50 rounded-full flex items-center justify-center border-4 border-red-100 mb-6 shadow-inner">
                      {/* Notes Visual */}
                      <div className="absolute inset-0 flex items-center justify-center gap-3">
                          {['F#', 'A#', 'C#'].map((n, i) => (
                              <div key={i} className="flex flex-col items-center gap-2">
                                  <div className={`w-8 h-20 bg-stone-900 border border-stone-900 rounded-b-lg shadow-sm flex items-end justify-center pb-2 font-bold text-red-400 text-xs ${isPlaying && (activeHand === 'right' || activeHand === 'both') ? 'translate-y-2 bg-stone-800' : ''} transition-all`}>
                                      {n}
                                  </div>
                              </div>
                          ))}
                      </div>
                      <div className="absolute -top-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold tracking-widest">Right Hand</div>
                  </div>
                  <h3 className="text-2xl font-bold text-red-900">F# Major</h3>
                  <p className="text-stone-500 text-sm">全黑键 · 遥远 · 异质</p>
              </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap justify-center gap-4 z-10 mt-8">
              <button 
                onClick={() => playChord('left')}
                className="px-6 py-3 rounded-xl border border-blue-200 text-blue-700 font-bold hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                  <Play size={16} fill="currentColor" /> 试听左手 (C)
              </button>
              <button 
                onClick={() => playChord('right')}
                className="px-6 py-3 rounded-xl border border-red-200 text-red-700 font-bold hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                  <Play size={16} fill="currentColor" /> 试听右手 (F#)
              </button>
              <button 
                onClick={() => playChord('both')}
                className="px-8 py-3 rounded-xl bg-stone-900 text-white font-bold hover:bg-stone-800 transition-all shadow-lg active:scale-95 flex items-center gap-2"
              >
                  <Zap size={16} fill="currentColor" /> 
                  <span className="bg-gradient-to-r from-blue-300 to-red-300 bg-clip-text text-transparent">冲突合奏 (Both)</span>
              </button>
          </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4">彼得鲁什卡和弦 (Petrushka Chord)</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                  这是斯特拉文斯基在芭蕾舞剧《彼得鲁什卡》中使用的著名和弦。
                  <br/>
                  C大调（全白键）代表了木偶的人性一面，F#大调（全黑键）代表了木偶的机械一面。两者相隔<strong>三全音 (Tritone)</strong>，这是音乐中最遥远、最不协和的距离。
              </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4">为什么不难听？</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                  虽然理论上极度不协和，但因为左右手都在演奏各自非常协和的大三和弦，大脑会试图同时解析两个清晰的调性。这种认知冲突产生了一种独特的、钻石般闪耀的听感，而不是单纯的噪音。
              </p>
          </div>
      </div>
    </div>
  );
};

export default BitonalityLesson;
