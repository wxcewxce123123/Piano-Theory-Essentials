
import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX, PauseCircle } from 'lucide-react';

const RestsLesson: React.FC = () => {
  const [activeRestId, setActiveRestId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  const rests = [
    { id: 'quarter', name: '四分休止符', symbol: '𝄽', beats: 1, color: 'bg-amber-500', iconColor: 'text-amber-500' },
    { id: 'half', name: '二分休止符', symbol: '𝄻', beats: 2, color: 'bg-indigo-500', iconColor: 'text-indigo-500' },
    { id: 'whole', name: '全休止符', symbol: '𝄻', beats: 4, color: 'bg-rose-500', iconColor: 'text-rose-500' }, 
  ];

  const playDemo = (rest: typeof rests[0]) => {
      if (isPlaying) return;
      setIsPlaying(true);
      setActiveRestId(rest.id);
      setProgress(0);

      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const beatDur = 0.6; // seconds per beat
      const totalBeats = 4; // Use a 4 beat bar for context
      const totalTime = totalBeats * beatDur;
      const startTime = ctx.currentTime;

      const restStartBeat = 1; // Always start rest at beat 2 (index 1)
      const restDuration = rest.beats;
      
      // Schedule sounds
      for(let i=0; i<totalBeats; i++) {
          // If current beat is within the rest period, skip sound
          if (i >= restStartBeat && i < restStartBeat + restDuration) continue;
          
          // Only play if within 4 beats
          if (i < 4) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = 440;
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            const noteStart = startTime + i * beatDur;
            gain.gain.setValueAtTime(0, noteStart);
            gain.gain.linearRampToValueAtTime(0.2, noteStart + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + beatDur - 0.1);
            
            osc.start(noteStart);
            osc.stop(noteStart + beatDur);
          }
      }

      // Visual Animation Loop
      const startAnim = performance.now();
      const animate = () => {
          const now = performance.now();
          const p = Math.min(1, (now - startAnim) / (totalTime * 1000));
          setProgress(p);
          
          if (p < 1) {
              rafRef.current = requestAnimationFrame(animate);
          } else {
              setIsPlaying(false);
              setActiveRestId(null);
              setProgress(0);
          }
      };
      rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
      return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }
  }, []);

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 1 - Foundations</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            休止符 <span className="text-stone-300 font-light">|</span> Rests
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          音乐中的留白。正如建筑需要空间，音乐需要静默。
          休止符不仅是“不弹”，更是一种积极的“聆听”。
        </p>
      </header>

      {/* Main Interactive Stage - Changed to Light Theme */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-stone-200 relative overflow-hidden animate-slideUp stagger-1 min-h-[400px] flex flex-col items-center">
          
          {/* Visual Timeline Monitor */}
          <div className="w-full max-w-3xl bg-stone-50 rounded-3xl p-8 mb-12 relative overflow-hidden border border-stone-200 h-48 flex items-center shadow-inner">
              {/* Playhead - Color adjusted for light bg */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-amber-500 z-30 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                style={{ left: `${progress * 100}%`, transition: isPlaying ? 'none' : 'left 0.3s' }}
              ></div>

              {/* Tracks */}
              <div className="w-full flex gap-2 h-24">
                  {[0,1,2,3].map(beat => {
                      const activeRest = rests.find(r => r.id === activeRestId);
                      const restDuration = activeRest ? activeRest.beats : 0;
                      // Rest always starts at index 1 (Beat 2)
                      const isRestBeat = activeRest && beat >= 1 && beat < 1 + restDuration; 
                      
                      // Calculate if currently playing based on progress
                      const currentBeatIndex = Math.floor(progress * 4);
                      const isCurrent = isPlaying && currentBeatIndex === beat;
                      
                      return (
                          <div key={beat} className="flex-1 rounded-xl overflow-hidden relative transition-colors duration-200">
                              {/* Background Grid - Lighter borders */}
                              <div className={`absolute inset-0 border-2 ${isCurrent ? 'border-amber-200 bg-amber-50' : 'border-stone-200 bg-white'}`}></div>
                              
                              {/* Content */}
                              {isRestBeat ? (
                                  <div className={`w-full h-full flex flex-col items-center justify-center transition-colors duration-300 ${isCurrent ? 'bg-amber-100' : 'bg-stone-50'}`}>
                                      <span className={`text-4xl font-serif transition-all duration-200 ${isCurrent ? 'text-stone-900 scale-110' : 'text-stone-400'}`}>{activeRest?.symbol}</span>
                                      {isCurrent && <span className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mt-1 animate-pulse">Silence</span>}
                                  </div>
                              ) : (
                                  <div className={`w-full h-full flex items-center justify-center ${isCurrent ? 'bg-green-50' : 'bg-white'}`}>
                                      {/* Sound Wave Graphic */}
                                      <div className="flex gap-1 items-end h-10">
                                          <div className={`w-1.5 bg-green-400 rounded-full transition-all duration-100 ${isCurrent ? 'h-full' : 'h-2 opacity-30 bg-stone-300'}`}></div>
                                          <div className={`w-1.5 bg-green-400 rounded-full transition-all duration-100 ${isCurrent ? 'h-2/3' : 'h-3 opacity-30 bg-stone-300'}`} style={{transitionDelay:'50ms'}}></div>
                                          <div className={`w-1.5 bg-green-400 rounded-full transition-all duration-100 ${isCurrent ? 'h-4/5' : 'h-2 opacity-30 bg-stone-300'}`} style={{transitionDelay:'100ms'}}></div>
                                          <div className={`w-1.5 bg-green-400 rounded-full transition-all duration-100 ${isCurrent ? 'h-1/2' : 'h-3 opacity-30 bg-stone-300'}`} style={{transitionDelay:'20ms'}}></div>
                                      </div>
                                  </div>
                              )}
                          </div>
                      )
                  })}
              </div>
              
              <div className="absolute bottom-3 right-6 text-xs text-stone-400 font-mono font-bold">4/4 Measure</div>
          </div>

          {/* Controls - Light Theme Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
              {rests.map(rest => (
                  <button 
                    key={rest.id}
                    onClick={() => playDemo(rest)}
                    disabled={isPlaying}
                    className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden group hover:shadow-lg ${
                        activeRestId === rest.id 
                        ? 'bg-white border-stone-300 scale-105 ring-2 ring-stone-200 shadow-xl' 
                        : 'bg-stone-50 border-stone-200 hover:bg-white hover:border-stone-300'
                    }`}
                  >
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${rest.color}`}></div>
                      <div className="flex justify-between items-start mb-4">
                          <span className="text-4xl font-serif text-stone-800">{rest.symbol}</span>
                          {activeRestId === rest.id && <VolumeX className="text-stone-400 animate-pulse" />}
                      </div>
                      <h3 className={`font-bold text-lg ${activeRestId === rest.id ? 'text-stone-900' : 'text-stone-600'}`}>{rest.name}</h3>
                      <div className="text-xs text-stone-400 mt-1 font-medium">{rest.beats} Beat(s) of Silence</div>
                  </button>
              ))}
          </div>
      </div>

      <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-stone-200 animate-slideUp stagger-2">
         <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
             <PauseCircle className="text-indigo-500" />
             记忆口诀
         </h3>
         <div className="grid md:grid-cols-2 gap-8">
             <div className="flex gap-4 items-start">
                 <div className="bg-indigo-50 p-3 rounded-xl text-3xl shadow-sm border border-indigo-100">🎩</div>
                 <div>
                     <strong className="text-stone-900 block mb-1">二分休止符 (Half Rest)</strong>
                     <p className="text-sm text-stone-600 leading-relaxed">
                         像一顶<strong>帽子</strong>放在第三线上。因为帽子比较轻，所以能放在线上。
                         <br/><span className="text-xs text-indigo-500 font-bold">"Hat holds Half"</span>
                     </p>
                 </div>
             </div>
             <div className="flex gap-4 items-start">
                 <div className="bg-rose-50 p-3 rounded-xl text-3xl shadow-sm border border-rose-100">🧱</div>
                 <div>
                     <strong className="text-stone-900 block mb-1">全休止符 (Whole Rest)</strong>
                     <p className="text-sm text-stone-600 leading-relaxed">
                         像一块<strong>砖头</strong>挂在第四线下。因为很重（时值长），所以挂在下面。
                         <br/>
                         <span className="text-xs text-rose-500 font-bold">注意：它也可以表示“整小节休止”，无论这个小节是3拍还是4拍。</span>
                     </p>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default RestsLesson;
