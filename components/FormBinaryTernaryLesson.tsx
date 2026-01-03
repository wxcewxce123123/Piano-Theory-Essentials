
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Home, Mountain, ArrowRight, RotateCcw, Map as MapIcon, Footprints, GitCommitHorizontal } from 'lucide-react';

const FormBinaryTernaryLesson: React.FC = () => {
  const [formType, setFormType] = useState<'binary' | 'ternary'>('binary');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSection, setActiveSection] = useState<'A1' | 'B' | 'A2' | null>(null);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Constants
  const SECTION_DUR = 4; // seconds
  
  // Frequencies
  const NOTES = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, 
    G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25
  };

  const playTone = (ctx: AudioContext, freq: number, start: number, dur: number, type: 'triangle' | 'sine' | 'square', vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = type;
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(vol, start + 0.05);
      gain.gain.setValueAtTime(vol, start + dur - 0.05);
      gain.gain.linearRampToValueAtTime(0, start + dur);
      
      osc.start(start);
      osc.stop(start + dur + 0.1);
  };

  const startPlayback = () => {
      if (isPlaying) { stopAudio(); return; }
      
      setIsPlaying(true);
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      startTimeRef.current = performance.now();

      // --- Schedule A Section (Stable, C Major) ---
      const scheduleA = (offset: number) => {
          // Melody: C E G E | F D C -
          playTone(ctx, NOTES.C4, now + offset + 0.0, 0.5, 'triangle', 0.2);
          playTone(ctx, NOTES.E4, now + offset + 0.5, 0.5, 'triangle', 0.2);
          playTone(ctx, NOTES.G4, now + offset + 1.0, 0.5, 'triangle', 0.2);
          playTone(ctx, NOTES.E4, now + offset + 1.5, 0.5, 'triangle', 0.2);
          playTone(ctx, NOTES.F4, now + offset + 2.0, 0.5, 'triangle', 0.2);
          playTone(ctx, NOTES.D4, now + offset + 2.5, 0.5, 'triangle', 0.2);
          playTone(ctx, NOTES.C4, now + offset + 3.0, 1.0, 'triangle', 0.2);
      };

      // --- Schedule B Section (Contrast, Dominant/Higher) ---
      const scheduleB = (offset: number) => {
          // Melody: G B D B | A F# G -
          playTone(ctx, NOTES.G4, now + offset + 0.0, 0.5, 'square', 0.15); // Distinct timbre
          playTone(ctx, NOTES.B4, now + offset + 0.5, 0.5, 'square', 0.15);
          playTone(ctx, NOTES.D4 * 2, now + offset + 1.0, 0.5, 'square', 0.15); // D5
          playTone(ctx, NOTES.B4, now + offset + 1.5, 0.5, 'square', 0.15);
          playTone(ctx, NOTES.A4, now + offset + 2.0, 0.5, 'square', 0.15);
          playTone(ctx, 370.00, now + offset + 2.5, 0.5, 'square', 0.15); // F#4
          playTone(ctx, NOTES.G4, now + offset + 3.0, 1.0, 'square', 0.15);
      };

      // A
      scheduleA(0);
      // B
      scheduleB(SECTION_DUR);
      // A (if ternary)
      if (formType === 'ternary') {
          scheduleA(SECTION_DUR * 2);
      }

      rafRef.current = requestAnimationFrame(animate);
  };

  const stopAudio = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setIsPlaying(false);
      setActiveSection(null);
      
      // Reset visuals
      const traveler = document.getElementById('traveler-dot');
      if (traveler) {
          traveler.style.offsetDistance = '0%';
          traveler.style.left = '10%'; // fallback
          traveler.style.top = '50%';
      }
  };

  const animate = (time: number) => {
      const elapsed = (time - startTimeRef.current) / 1000;
      const totalDur = formType === 'binary' ? SECTION_DUR * 2 : SECTION_DUR * 3;

      if (elapsed >= totalDur) {
          stopAudio();
          return;
      }

      // Determine Section
      if (elapsed < SECTION_DUR) setActiveSection('A1');
      else if (elapsed < SECTION_DUR * 2) setActiveSection('B');
      else setActiveSection('A2');

      // Update Traveler Position
      const traveler = document.getElementById('traveler-dot');
      const progress = elapsed / totalDur;
      
      if (traveler) {
          // Visual path logic based on form type
          // Binary: Linear Left to Right
          // Ternary: Loop/Circle back
          
          if (formType === 'binary') {
              // Simple interpolation: 10% to 90%
              const pos = 10 + progress * 80;
              traveler.style.left = `${pos}%`;
              traveler.style.top = '50%';
          } else {
              // Ternary: ABA Path
              // 0-33%: A -> B (Left to Right-ish)
              // 33-66%: B (Orbit/Explore)
              // 66-100%: B -> A (Return)
              
              // Let's do a simple arch path for ternary visual
              // X: 10% -> 90% -> 10%
              // Y: 50% -> 20% -> 50% (Arc)
              
              if (progress < 0.5) {
                  // Going out (A -> B)
                  // 0 to 0.5 progress mapped to 0 to 1 outbound
                  const p = progress * 2; 
                  traveler.style.left = `${10 + p * 80}%`;
                  // traveler.style.top = `${50 - Math.sin(p * Math.PI) * 30}%`;
                  traveler.style.top = '50%';
              } else {
                  // Coming back (B -> A)
                  const p = (progress - 0.5) * 2;
                  traveler.style.left = `${90 - p * 80}%`;
                  // traveler.style.top = `${50 + Math.sin(p * Math.PI) * 30}%`; // Bottom arc?
                  traveler.style.top = '50%';
              }
          }
      }

      rafRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 5</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            二部与三部曲式 <span className="text-stone-300 font-light">|</span> Binary & Ternary
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-3xl leading-relaxed">
          如果说乐句是“句子”，那么曲式就是“文章结构”。
          <br/>
          <strong>Binary (AB)</strong> 是“一去不复返”的旅程，而 <strong>Ternary (ABA)</strong> 是“离家出走再回归”的圆满。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-stone-200 relative overflow-hidden animate-slideUp stagger-1 min-h-[500px] flex flex-col items-center max-w-4xl mx-auto">
          
          {/* Mode Switcher */}
          <div className="flex bg-stone-100 p-1.5 rounded-2xl mb-12 relative z-20">
              <button 
                onClick={() => { setFormType('binary'); stopAudio(); }}
                className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 ${formType === 'binary' ? 'bg-amber-500 text-white shadow-md' : 'text-stone-500 hover:text-stone-700'}`}
              >
                  <GitCommitHorizontal className="rotate-90" size={18} /> 二部曲式 (AB)
              </button>
              <button 
                onClick={() => { setFormType('ternary'); stopAudio(); }}
                className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 ${formType === 'ternary' ? 'bg-indigo-500 text-white shadow-md' : 'text-stone-500 hover:text-stone-700'}`}
              >
                  <RotateCcw size={18} /> 三部曲式 (ABA)
              </button>
          </div>

          {/* Map Visualization */}
          <div className="relative w-full max-w-4xl flex-1 mb-8">
              
              {/* Background Path */}
              <div className="absolute top-1/2 left-[10%] right-[10%] h-2 bg-stone-100 rounded-full -translate-y-1/2"></div>
              {formType === 'ternary' && (
                  // Return Path indicator for Ternary
                  <svg className="absolute top-1/2 left-[10%] right-[10%] h-32 -translate-y-1/2 w-[80%] pointer-events-none opacity-20 overflow-visible" style={{ left: '10%' }}>
                      <path d="M 0 0 Q 50% 100 100% 0" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="8 8" />
                      <text x="50%" y="60" textAnchor="middle" fill="#6366f1" fontSize="12" fontWeight="bold">The Return</text>
                  </svg>
              )}

              {/* Locations */}
              <div className="absolute top-1/2 left-[10%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${activeSection === 'A1' || activeSection === 'A2' ? 'bg-blue-100 border-blue-500 scale-110 shadow-lg' : 'bg-white border-stone-200 text-stone-300'}`}>
                      <Home size={32} className={activeSection?.startsWith('A') ? 'text-blue-600' : 'text-stone-300'} />
                  </div>
                  <div className={`font-bold text-center ${activeSection?.startsWith('A') ? 'text-blue-600' : 'text-stone-300'}`}>
                      <div>Home (A)</div>
                      <div className="text-xs font-normal">主调 (Tonic)</div>
                  </div>
              </div>

              <div className="absolute top-1/2 right-[10%] transform translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${activeSection === 'B' ? 'bg-amber-100 border-amber-500 scale-110 shadow-lg' : 'bg-white border-stone-200 text-stone-300'}`}>
                      <Mountain size={32} className={activeSection === 'B' ? 'text-amber-600' : 'text-stone-300'} />
                  </div>
                  <div className={`font-bold text-center ${activeSection === 'B' ? 'text-amber-600' : 'text-stone-300'}`}>
                      <div>Away (B)</div>
                      <div className="text-xs font-normal">属调 (Dominant)</div>
                  </div>
              </div>

              {/* The Traveler */}
              <div 
                id="traveler-dot"
                className={`absolute w-12 h-12 bg-stone-900 rounded-full border-4 border-white shadow-xl z-30 transition-transform duration-100 ease-linear flex items-center justify-center -translate-x-1/2 -translate-y-1/2 ${isPlaying ? 'scale-100' : 'scale-0'}`}
                style={{ left: '10%', top: '50%' }}
              >
                  <Footprints size={16} className="text-white" />
              </div>

          </div>

          {/* Play Controls */}
          <div className="z-30">
              <button 
                onClick={startPlayback}
                className={`flex items-center gap-3 px-10 py-4 rounded-full font-bold text-lg transition-all active:scale-95 shadow-xl ${
                    isPlaying 
                    ? 'bg-stone-100 text-stone-500 border border-stone-300' 
                    : 'bg-stone-900 text-white hover:scale-105'
                }`}
              >
                  {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
                  <span>{isPlaying ? '停止演示' : '开始旅程'}</span>
              </button>
          </div>
      </div>

      {/* Comparison Cards */}
      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
          
          <div className={`p-8 rounded-3xl border transition-all duration-500 ${formType === 'binary' ? 'bg-white border-amber-200 shadow-md ring-1 ring-amber-100' : 'bg-stone-50 border-stone-200 opacity-60'}`}>
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <ArrowRight className="text-amber-500" />
                  二部曲式 (Binary)
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  <strong>结构：</strong> A - B (或 A-A-B-B)<br/>
                  <strong>特点：</strong> 开放式结尾。B 段通常结束在属调（半终止）或通过反复记号硬性回到 A。它给人一种“未完待续”或“一直向前走”的感觉。
                  <br/><br/>
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">常见于：巴洛克舞曲 (巴赫小步舞曲)</span>
              </p>
          </div>

          <div className={`p-8 rounded-3xl border transition-all duration-500 ${formType === 'ternary' ? 'bg-white border-indigo-200 shadow-md ring-1 ring-indigo-100' : 'bg-stone-50 border-stone-200 opacity-60'}`}>
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <RotateCcw className="text-indigo-500" />
                  三部曲式 (Ternary)
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  <strong>结构：</strong> A - B - A<br/>
                  <strong>特点：</strong> 封闭式结尾。最后的 A 段让音乐回到了原点（主调），这种“离去-归来”的结构最符合人类的心理需求，给人以完美的平衡感和结束感。
                  <br/><br/>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">常见于：古典奏鸣曲、咏叹调</span>
              </p>
          </div>

      </div>
    </div>
  );
};

export default FormBinaryTernaryLesson;
