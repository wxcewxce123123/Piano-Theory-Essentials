
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RefreshCw, MapPin, Music, Utensils, RotateCcw } from 'lucide-react';

const FormRondoLesson: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSection, setActiveSection] = useState<'A1' | 'B' | 'A2' | 'C' | 'A3' | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Duration configuration (seconds)
  const DURS = { A: 3, B: 3, C: 3 };
  const TOTAL_DURATION = DURS.A + DURS.B + DURS.A + DURS.C + DURS.A; // 15s

  // Frequencies
  const NOTES = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, 
    G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25,
    D5: 587.33, E5: 659.25
  };

  const playTone = (ctx: AudioContext, freq: number, start: number, dur: number, type: 'square' | 'triangle' | 'sine' | 'sawtooth', vol: number) => {
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

  const scheduleMusic = () => {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      const now = ctx.currentTime;
      startTimeRef.current = performance.now();

      // --- Theme A (Rondo Theme): Lively, Staccato ---
      // Pattern: C E G E C (0-3s, 6-9s, 12-15s)
      const scheduleA = (offset: number) => {
          [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.E4, NOTES.C4, NOTES.G4, NOTES.C5].forEach((f, i) => {
              playTone(ctx, f, now + offset + i*0.4, 0.2, 'square', 0.1);
          });
      };

      // --- Theme B (Episode 1): Lyrical, Legato ---
      // Pattern: F A C A F (3-6s)
      const scheduleB = (offset: number) => {
          [NOTES.F4, NOTES.A4, NOTES.C5, NOTES.A4, NOTES.F4].forEach((f, i) => {
              playTone(ctx, f, now + offset + i*0.6, 0.6, 'triangle', 0.15);
          });
      };

      // --- Theme C (Episode 2): Minor, Tense ---
      // Pattern: A C E (Minor) Rapid (9-12s)
      const scheduleC = (offset: number) => {
          [NOTES.A4, NOTES.B4, NOTES.C5, NOTES.E5, NOTES.D5, NOTES.B4, NOTES.A4].forEach((f, i) => {
              playTone(ctx, f, now + offset + i*0.4, 0.2, 'sawtooth', 0.08);
          });
      };

      scheduleA(0);
      scheduleB(3);
      scheduleA(6);
      scheduleC(9);
      scheduleA(12);
  };

  const animate = (time: number) => {
      const elapsed = (time - startTimeRef.current) / 1000;
      
      if (elapsed >= TOTAL_DURATION) {
          setIsPlaying(false);
          setActiveSection(null);
          return;
      }

      // Determine Section
      if (elapsed < 3) setActiveSection('A1');
      else if (elapsed < 6) setActiveSection('B');
      else if (elapsed < 9) setActiveSection('A2');
      else if (elapsed < 12) setActiveSection('C');
      else setActiveSection('A3');

      // Update Path Animation logic
      // We calculate the position of the "Traveler" dot based on time
      const traveler = document.getElementById('rondo-traveler');
      if (traveler) {
          let cx = 50, cy = 50; // Center (A) coordinates in %
          let targetX = 50, targetY = 50;
          let sectionProgress = 0;

          if (elapsed < 3) { // A1 (Stay/Bounce at center)
              sectionProgress = elapsed / 3;
              // Small idle bounce
              targetY = 50 - Math.sin(sectionProgress * Math.PI * 4) * 2;
          } else if (elapsed < 6) { // Move A -> B
              sectionProgress = (elapsed - 3) / 3;
              // Target B is Left (20, 50)
              // Path: Arc out
              const angle = Math.PI + (sectionProgress * Math.PI); // Arc logic simplified to linear for now
              targetX = 50 + (20 - 50) * Math.sin(sectionProgress * Math.PI / 2); // Ease out
              targetY = 50 + Math.sin(sectionProgress * Math.PI) * 20; // Arc up/down
              // Actually let's just lerp to B(20,50)
              targetX = 50 + (20 - 50) * sectionProgress;
          } else if (elapsed < 9) { // Move B -> A
              sectionProgress = (elapsed - 6) / 3;
              targetX = 20 + (50 - 20) * sectionProgress;
          } else if (elapsed < 12) { // Move A -> C
              sectionProgress = (elapsed - 9) / 3;
              // Target C is Right (80, 50)
              targetX = 50 + (80 - 50) * sectionProgress;
          } else { // Move C -> A
              sectionProgress = (elapsed - 12) / 3;
              targetX = 80 + (50 - 80) * sectionProgress;
          }

          traveler.style.left = `${targetX}%`;
          traveler.style.top = `${targetY}%`;
      }

      rafRef.current = requestAnimationFrame(animate);
  };

  const handlePlay = () => {
      if (isPlaying) {
          setIsPlaying(false);
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          audioCtxRef.current?.suspend();
          setActiveSection(null);
      } else {
          setIsPlaying(true);
          scheduleMusic();
          rafRef.current = requestAnimationFrame(animate);
      }
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 5</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            回旋曲式 <span className="text-stone-300 font-light">|</span> Rondo Form
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-3xl leading-relaxed">
          ABACA... 就像是一场不断回到原点的旅行。无论你走得再远（B 或 C），那熟悉的主题（A）总会在路口等你。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-200 p-8 md:p-12 animate-slideUp stagger-1 flex flex-col items-center relative overflow-hidden min-h-[500px] max-w-4xl mx-auto">
          
          {/* Background Radial Pattern */}
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

          {/* The Rondo Map */}
          <div className="relative w-full max-w-4xl flex-1 flex items-center justify-center my-12">
              
              {/* Connecting Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                  {/* Line A-B */}
                  <line x1="50%" y1="50%" x2="20%" y2="50%" stroke="#e7e5e4" strokeWidth="4" strokeDasharray="8 8" />
                  {/* Line A-C */}
                  <line x1="50%" y1="50%" x2="80%" y2="50%" stroke="#e7e5e4" strokeWidth="4" strokeDasharray="8 8" />
                  
                  {/* Active Highlight Lines */}
                  {activeSection === 'B' || activeSection === 'A2' ? (
                      <line x1="50%" y1="50%" x2="20%" y2="50%" stroke="#f59e0b" strokeWidth="4" className="animate-pulse" />
                  ) : null}
                  {activeSection === 'C' || activeSection === 'A3' ? (
                      <line x1="50%" y1="50%" x2="80%" y2="50%" stroke="#f59e0b" strokeWidth="4" className="animate-pulse" />
                  ) : null}
              </svg>

              {/* The Traveler Dot */}
              <div 
                id="rondo-traveler"
                className={`absolute w-6 h-6 bg-stone-900 rounded-full border-4 border-white shadow-xl z-30 transition-transform duration-75 ease-linear ${isPlaying ? 'scale-100' : 'scale-0'}`}
                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
              ></div>

              {/* Node B (Episode 1) */}
              <div 
                className={`absolute left-[20%] top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-500 z-10 
                ${activeSection === 'B' ? 'bg-green-100 border-green-500 scale-110 shadow-lg' : 'bg-white border-stone-200 text-stone-300'}`}
              >
                  <MapPin size={24} className={activeSection === 'B' ? 'text-green-600' : 'text-stone-300'} />
                  <span className={`font-bold text-lg ${activeSection === 'B' ? 'text-green-800' : 'text-stone-300'}`}>B</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest mt-1">Episode 1</span>
              </div>

              {/* Node A (Main Theme) */}
              <div 
                className={`absolute left-[50%] top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full flex flex-col items-center justify-center border-8 transition-all duration-500 z-20
                ${activeSection && activeSection.startsWith('A') ? 'bg-amber-500 border-amber-300 text-white scale-110 shadow-2xl ring-4 ring-amber-100' : 'bg-white border-stone-200 text-stone-300'}`}
              >
                  <RefreshCw size={32} className={activeSection && activeSection.startsWith('A') ? 'animate-spin-slow' : ''} />
                  <span className="font-bold text-4xl mt-2">A</span>
                  <span className="text-xs uppercase font-bold tracking-widest mt-1 opacity-80">Refrain</span>
              </div>

              {/* Node C (Episode 2) */}
              <div 
                className={`absolute left-[80%] top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-500 z-10
                ${activeSection === 'C' ? 'bg-purple-100 border-purple-500 scale-110 shadow-lg' : 'bg-white border-stone-200 text-stone-300'}`}
              >
                  <MapPin size={24} className={activeSection === 'C' ? 'text-purple-600' : 'text-stone-300'} />
                  <span className={`font-bold text-lg ${activeSection === 'C' ? 'text-purple-800' : 'text-stone-300'}`}>C</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest mt-1">Episode 2</span>
              </div>

          </div>

          {/* Controls */}
          <div className="z-30 mt-8">
              <button 
                onClick={handlePlay}
                className={`flex items-center gap-3 px-10 py-4 rounded-full font-bold text-lg transition-all active:scale-95 shadow-xl ${
                    isPlaying 
                    ? 'bg-stone-100 text-stone-500 border border-stone-300' 
                    : 'bg-stone-900 text-white hover:scale-105'
                }`}
              >
                  {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
                  <span>{isPlaying ? '停止演示' : '开始回旋 (Start Rondo)'}</span>
              </button>
          </div>
      </div>

      {/* Theory & Analogy */}
      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
          
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Utensils className="text-amber-500" />
                  三明治理论 (The Sandwich)
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  回旋曲式就像一个多层三明治：
              </p>
              <div className="flex flex-col gap-2 items-center text-xs font-bold text-stone-600">
                  <div className="w-full bg-amber-100 py-2 text-center rounded text-amber-800">面包 (A)</div>
                  <div className="w-[90%] bg-green-100 py-2 text-center rounded text-green-800">生菜 (B)</div>
                  <div className="w-full bg-amber-100 py-2 text-center rounded text-amber-800">面包 (A)</div>
                  <div className="w-[90%] bg-purple-100 py-2 text-center rounded text-purple-800">火腿 (C)</div>
                  <div className="w-full bg-amber-100 py-2 text-center rounded text-amber-800">面包 (A)</div>
              </div>
              <p className="text-stone-500 text-xs mt-4 italic text-center">无论中间夹了什么，你总会吃到面包。</p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <RotateCcw className="text-indigo-500" />
                  性格对比
              </h3>
              <ul className="space-y-4 text-sm text-stone-600 leading-relaxed">
                  <li className="flex gap-3">
                      <span className="font-bold text-stone-800 shrink-0">主部 (A):</span>
                      <span>通常是活泼、轻快、朗朗上口的。因为它要出现很多次，所以必须足够好听且容易记住。</span>
                  </li>
                  <li className="flex gap-3">
                      <span className="font-bold text-stone-800 shrink-0">插部 (B/C):</span>
                      <span>为了防止听众厌烦 A，插部必须提供强烈的对比。它们通常会转到不同的调性（如小调），改变速度或情绪。</span>
                  </li>
              </ul>
          </div>

      </div>
    </div>
  );
};

export default FormRondoLesson;
