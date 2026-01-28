
import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Wind, ArrowRight, PauseCircle, Music4, Cloud, Umbrella } from 'lucide-react';

const RestsLesson: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'visualizer' | 'symbols'>('visualizer');
  const [activePattern, setActivePattern] = useState<'busy' | 'breath' | 'empty'>('busy');
  const [isPlaying, setIsPlaying] = useState(false);
  const [symbolFocus, setSymbolFocus] = useState<'quarter' | 'half' | 'whole' | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const ballRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  
  // Refs for loop state (critical for instant switching)
  const activePatternRef = useRef(activePattern);
  const isPlayingRef = useRef(false);
  const lastBeatIndex = useRef(-1);

  // Sync ref with state
  useEffect(() => {
      activePatternRef.current = activePattern;
  }, [activePattern]);

  // --- Constants ---
  const BPM = 100;
  const BEAT_DUR = 60 / BPM;
  const BAR_WIDTH = 400; // Pixels per bar (4 beats)
  const PX_PER_SEC = BAR_WIDTH / (BEAT_DUR * 4);

  // --- Patterns ---
  // Ensuring all patterns sum to exactly 8 beats for seamless looping
  const PATTERNS = {
      busy: [ // 8 beats
          { type: 'note', dur: 1 }, { type: 'note', dur: 1 }, { type: 'note', dur: 1 }, { type: 'note', dur: 1 },
          { type: 'note', dur: 1 }, { type: 'note', dur: 1 }, { type: 'note', dur: 1 }, { type: 'note', dur: 1 }
      ],
      breath: [ // 8 beats
          { type: 'note', dur: 1 }, { type: 'rest', dur: 1 }, { type: 'note', dur: 1 }, { type: 'rest', dur: 1 },
          { type: 'note', dur: 1 }, { type: 'note', dur: 1 }, { type: 'rest', dur: 2 }
      ],
      empty: [ // 8 beats (Fixed from 9)
          { type: 'note', dur: 1 }, { type: 'rest', dur: 3 }, 
          { type: 'note', dur: 1 }, { type: 'rest', dur: 3 }  
      ]
  };

  // --- Audio Engine ---
  const initAudio = () => {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
  };

  const playClick = () => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      osc.type = 'triangle';
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
  };

  // --- Animation Loop ---
  const animate = (time: number) => {
      if (!isPlayingRef.current) return; // Use ref for immediate stop check

      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = (time - startTimeRef.current) / 1000; // seconds
      
      // Calculate Scroll
      const offset = elapsed * PX_PER_SEC;
      
      if (scrollTrackRef.current) {
          // Reset loop seamlessly every 8 beats (2 bars)
          const loopDuration = BEAT_DUR * 8;
          const loopWidth = BAR_WIDTH * 2;
          const currentOffset = offset % loopWidth;
          scrollTrackRef.current.style.transform = `translateX(-${currentOffset}px)`;
          
          // Determine Ball State (Y position)
          const totalBeatsElapsed = elapsed / BEAT_DUR;
          const beatInLoop = totalBeatsElapsed % 8; // 0 to 8
          
          // CRITICAL FIX: Use Ref to get the LATEST pattern instantly
          const currentSequence = PATTERNS[activePatternRef.current as keyof typeof PATTERNS];
          
          // Find current active object based on time
          let currentBeatCursor = 0;
          let activeObj = null;
          
          for (let item of currentSequence) {
              if (beatInLoop >= currentBeatCursor && beatInLoop < currentBeatCursor + item.dur) {
                  activeObj = item;
                  break;
              }
              currentBeatCursor += item.dur;
          }

          // Visual Update
          if (ballRef.current) {
              if (activeObj?.type === 'rest') {
                  // Floating/Gliding State
                  ballRef.current.style.transform = `translateY(-60px) scale(0.9)`; // Fly up
                  ballRef.current.style.backgroundColor = '#d6d3d1'; // Gray
                  ballRef.current.style.boxShadow = 'none';
              } else {
                  // Hitting State
                  ballRef.current.style.transform = `translateY(0px) scale(1)`; // On ground
                  ballRef.current.style.backgroundColor = '#f59e0b'; // Amber
                  ballRef.current.style.boxShadow = '0 0 20px rgba(245, 158, 11, 0.6)';
              }
          }

          // Trigger Sound Logic
          const integerBeat = Math.floor(beatInLoop);
          
          // Only trigger if we just entered a new beat integer
          if (integerBeat !== lastBeatIndex.current) {
              
              // We need to check if a NOTE starts exactly at this integer beat
              let noteStartsHere = false;
              let scanCursor = 0;
              
              for (let item of currentSequence) {
                  // Check if this item starts at the current integer beat
                  // Use a small epsilon for float comparison, though integers should match
                  if (Math.abs(scanCursor - integerBeat) < 0.1) {
                      if (item.type === 'note') {
                          noteStartsHere = true;
                      }
                      break; // We found the item starting here
                  }
                  scanCursor += item.dur;
                  // Optimization: if we passed the beat, stop looking
                  if (scanCursor > integerBeat + 0.1) break;
              }

              if (noteStartsHere) {
                  playClick();
                  // Visual Ripple
                  const ripple = document.getElementById('ripple-effect');
                  if(ripple) {
                      ripple.style.opacity = '1';
                      ripple.style.transform = 'scale(2)';
                      setTimeout(() => {
                          if(ripple) {
                              ripple.style.transition = 'none';
                              ripple.style.opacity = '0';
                              ripple.style.transform = 'scale(0.5)';
                              setTimeout(() => { if(ripple) ripple.style.transition = 'all 0.2s ease-out'; }, 10);
                          }
                      }, 200);
                  }
              }
              
              lastBeatIndex.current = integerBeat;
          }
      }

      rafRef.current = requestAnimationFrame(animate);
  };

  const togglePlay = () => {
      if (isPlaying) {
          setIsPlaying(false);
          isPlayingRef.current = false;
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
      } else {
          initAudio();
          setIsPlaying(true);
          isPlayingRef.current = true;
          
          startTimeRef.current = performance.now();
          lastBeatIndex.current = -1;
          rafRef.current = requestAnimationFrame(animate);
      }
  };

  // Ensure cleanup on unmount
  useEffect(() => {
      return () => { 
          if (rafRef.current) cancelAnimationFrame(rafRef.current); 
          isPlayingRef.current = false;
      }
  }, []);

  // --- Render Helpers ---
  const renderTrack = () => {
      const sequence = PATTERNS[activePattern];
      // Repeat sequence 3 times to cover scrolling buffer
      const displaySeq = [...sequence, ...sequence, ...sequence]; 
      
      return (
          <div className="flex items-end h-full">
              {displaySeq.map((item, i) => (
                  <div 
                    key={i} 
                    className={`flex-shrink-0 relative border-r border-stone-100 flex items-center justify-center transition-all duration-500`}
                    style={{ 
                        width: `${item.dur * 100}px`, // 100px per beat
                        height: item.type === 'note' ? '60%' : '20%',
                        backgroundColor: item.type === 'note' ? '#f5f5f4' : 'transparent',
                        marginBottom: item.type === 'note' ? '0' : '40px' 
                    }} 
                  >
                      {item.type === 'note' ? (
                          <div className="w-full h-2 bg-stone-300 rounded-full"></div>
                      ) : (
                          <div className="w-full border-b-2 border-dashed border-stone-300 h-0 flex items-center justify-center">
                              <span className="text-[10px] text-stone-400 bg-white px-2 font-mono absolute -top-3">
                                  {item.dur} Beats Silence
                              </span>
                          </div>
                      )}
                      <div className="absolute bottom-0 left-0 text-[9px] text-stone-300 p-1">|</div>
                  </div>
              ))}
          </div>
      )
  };

  return (
    <div className="space-y-10">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 1 - Foundations</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            休止符 <span className="text-stone-300 font-light">|</span> Rests
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl leading-relaxed">
          音乐不仅是声音的艺术，更是沉默的艺术。
          <br/>
          休止符不是“停止”，而是<strong>有长度的呼吸</strong>。就像跳远时的滞空，虽然脚离开了地面（没有声音），但身体依然在向前运动（时间在流逝）。
        </p>
      </header>

      {/* --- TAB SWITCHER --- */}
      <div className="flex gap-4 border-b border-stone-200 mb-8 animate-slideUp stagger-1">
          <button 
            onClick={() => setActiveTab('visualizer')}
            className={`pb-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'visualizer' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
          >
              动感实验室 (Visualizer)
          </button>
          <button 
            onClick={() => setActiveTab('symbols')}
            className={`pb-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'symbols' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
          >
              符号百科 (Symbols)
          </button>
      </div>

      {/* --- CONTENT: VISUALIZER --- */}
      {activeTab === 'visualizer' && (
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-stone-200 animate-fadeIn min-h-[500px] flex flex-col justify-between overflow-hidden relative">
              
              {/* Background Decor */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-stone-50 rounded-full blur-3xl -z-10"></div>

              {/* Top Controls */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 z-20">
                  <div className="flex bg-stone-100 p-1.5 rounded-2xl">
                      <button 
                        onClick={() => setActivePattern('busy')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activePattern === 'busy' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                      >
                          无休止 (Continuous)
                      </button>
                      <button 
                        onClick={() => setActivePattern('breath')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activePattern === 'breath' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                      >
                          呼吸感 (Breathing)
                      </button>
                      <button 
                        onClick={() => setActivePattern('empty')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activePattern === 'empty' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                      >
                          大留白 (Spacious)
                      </button>
                  </div>
              </div>

              {/* THE RUNNER STAGE */}
              <div className="relative w-full h-64 flex items-center overflow-hidden my-8 border-y border-stone-100 bg-stone-50/30">
                  {/* Fixed Focus Box (Where the ball stays) */}
                  <div className="absolute left-[100px] top-0 bottom-0 w-20 border-x-2 border-stone-200/50 bg-white/50 z-10 flex flex-col justify-between py-2 items-center pointer-events-none">
                      <div className="text-[9px] text-stone-400 font-mono uppercase tracking-widest">NOW</div>
                      <div className="w-0.5 h-4 bg-stone-300"></div>
                  </div>

                  {/* The Ball (Fixed X, Animated Y) */}
                  <div 
                    ref={ballRef}
                    className="absolute left-[130px] top-[60%] w-10 h-10 rounded-full z-30 transition-transform duration-200"
                    style={{ transform: 'translate(-50%, 0)', backgroundColor: '#f59e0b' }}
                  >
                      {/* Inner Shine */}
                      <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full opacity-50"></div>
                      {/* Ripple Effect (Behind ball) */}
                      <div id="ripple-effect" className="absolute inset-0 rounded-full border-2 border-amber-500 opacity-0 pointer-events-none"></div>
                  </div>

                  {/* Scrolling Track */}
                  <div 
                    ref={scrollTrackRef}
                    className="absolute top-0 left-[140px] h-full flex items-end will-change-transform"
                    style={{ transform: 'translateX(0)' }}
                  >
                      {renderTrack()}
                  </div>
              </div>

              {/* Play Button */}
              <div className="flex justify-center z-20">
                  <button 
                    onClick={togglePlay}
                    className={`flex items-center gap-3 px-10 py-4 rounded-full font-bold text-lg transition-all active:scale-95 shadow-xl ${
                        isPlaying 
                        ? 'bg-stone-100 text-stone-500 border border-stone-300' 
                        : 'bg-stone-900 text-white hover:scale-105'
                    }`}
                  >
                      {isPlaying ? <PauseCircle size={24} /> : <ArrowRight size={24} />}
                      <span>{isPlaying ? '停止观测' : '开始运行 (Start)'}</span>
                  </button>
              </div>

              {/* Explainer Text */}
              <div className="text-center mt-8 text-stone-500 text-sm max-w-lg mx-auto leading-relaxed">
                  {activePattern === 'busy' && "没有休止符的音乐就像没有标点符号的文章，让人喘不过气。"}
                  {activePattern === 'breath' && "加入四分休止符后，音乐开始有了“呼吸”。那个空隙不是停止，而是吸气准备下一次跳跃。"}
                  {activePattern === 'empty' && "长休止符创造了巨大的空间感。注意看小球在空中滑翔的时间，那也是音乐的一部分。"}
              </div>
          </div>
      )}

      {/* --- CONTENT: SYMBOLS (HAT & HOLE) --- */}
      {activeTab === 'symbols' && (
          <div className="grid md:grid-cols-3 gap-8 animate-fadeIn">
              
              {/* Card 1: Quarter Rest */}
              <div 
                className={`group relative bg-white rounded-[2rem] p-6 border-2 cursor-pointer transition-all duration-500 hover:-translate-y-2 flex flex-col ${symbolFocus === 'quarter' ? 'border-amber-400 shadow-xl ring-4 ring-amber-100' : 'border-stone-100 shadow-lg hover:border-amber-200'}`}
                onClick={() => setSymbolFocus('quarter')}
              >
                  {/* Visual Header */}
                  <div className={`h-48 rounded-2xl flex items-center justify-center relative overflow-hidden mb-6 transition-colors duration-500 ${symbolFocus === 'quarter' ? 'bg-amber-50' : 'bg-stone-50 group-hover:bg-amber-50/50'}`}>
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#d97706 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
                      <div className="text-[100px] font-serif text-stone-800 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 z-10">𝄽</div>
                      {symbolFocus === 'quarter' && <div className="absolute inset-0 bg-amber-500/10 animate-pulse"></div>}
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                          <h3 className="text-2xl font-bold font-serif text-stone-900">四分休止符</h3>
                          <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-500 text-xs font-bold uppercase tracking-wider">1 Beat</span>
                      </div>
                      <p className="text-stone-500 text-sm leading-relaxed mb-6">
                          像一道闪电，或者侧身的飞鸟。代表短促的沉默，如说话时的急促换气。
                      </p>
                      
                      {/* Interactive Hint */}
                      <div className={`mt-auto p-4 rounded-xl text-xs font-medium transition-colors ${symbolFocus === 'quarter' ? 'bg-amber-100 text-amber-800' : 'bg-stone-50 text-stone-400'}`}>
                          <span className="font-bold block mb-1 uppercase tracking-widest">Visual Cue</span>
                          闪电形状 = 1 拍的爆发力。
                      </div>
                  </div>
              </div>

              {/* Card 2: Half Rest */}
              <div 
                className={`group relative bg-white rounded-[2rem] p-6 border-2 cursor-pointer transition-all duration-500 hover:-translate-y-2 flex flex-col ${symbolFocus === 'half' ? 'border-indigo-400 shadow-xl ring-4 ring-indigo-100' : 'border-stone-100 shadow-lg hover:border-indigo-200'}`}
                onClick={() => setSymbolFocus('half')}
              >
                  <div className={`h-48 rounded-2xl flex items-center justify-center relative overflow-hidden mb-6 transition-colors duration-500 ${symbolFocus === 'half' ? 'bg-indigo-50' : 'bg-stone-50 group-hover:bg-indigo-50/50'}`}>
                      {/* Staff Lines */}
                      <div className="w-3/4 space-y-4 absolute opacity-30">
                          <div className="h-0.5 bg-stone-900 w-full"></div>
                          <div className="h-0.5 bg-stone-900 w-full"></div> 
                          <div className="h-0.5 bg-stone-900 w-full relative">
                              {/* Highlight Line 3 */}
                              {symbolFocus === 'half' && <div className="absolute top-0 left-0 w-full h-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></div>}
                          </div> 
                          <div className="h-0.5 bg-stone-900 w-full"></div>
                          <div className="h-0.5 bg-stone-900 w-full"></div>
                      </div>
                      
                      {/* The Hat Animation */}
                      <div className={`relative z-10 transition-all duration-500 ${symbolFocus === 'half' ? 'scale-125 translate-y-0' : 'scale-100'}`}>
                          <div className="w-16 h-8 bg-stone-900 mx-auto rounded-t-sm relative">
                              {/* Hat Brim */}
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-stone-900"></div>
                          </div>
                      </div>
                      
                      {symbolFocus === 'half' && (
                          <div className="absolute top-4 right-4 bg-white p-2 rounded-xl shadow-sm animate-bounce-gentle border border-indigo-100">
                              <span className="text-2xl">🎩</span>
                          </div>
                      )}
                  </div>

                  <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                          <h3 className="text-2xl font-bold font-serif text-stone-900">二分休止符</h3>
                          <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-500 text-xs font-bold uppercase tracking-wider">2 Beats</span>
                      </div>
                      <p className="text-stone-500 text-sm leading-relaxed mb-6">
                          停留在第三线上。因为它比较轻（只有2拍），所以能稳稳地“坐”在线上。
                      </p>
                      
                      <div className={`mt-auto p-4 rounded-xl text-xs font-medium transition-colors ${symbolFocus === 'half' ? 'bg-indigo-100 text-indigo-800' : 'bg-stone-50 text-stone-400'}`}>
                          <span className="font-bold block mb-1 uppercase tracking-widest">Mnemonic (口诀)</span>
                          "Hat holds Half" (帽子装一半)
                      </div>
                  </div>
              </div>

              {/* Card 3: Whole Rest */}
              <div 
                className={`group relative bg-white rounded-[2rem] p-6 border-2 cursor-pointer transition-all duration-500 hover:-translate-y-2 flex flex-col ${symbolFocus === 'whole' ? 'border-rose-400 shadow-xl ring-4 ring-rose-100' : 'border-stone-100 shadow-lg hover:border-rose-200'}`}
                onClick={() => setSymbolFocus('whole')}
              >
                  <div className={`h-48 rounded-2xl flex items-center justify-center relative overflow-hidden mb-6 transition-colors duration-500 ${symbolFocus === 'whole' ? 'bg-rose-50' : 'bg-stone-50 group-hover:bg-rose-50/50'}`}>
                      {/* Staff Lines */}
                      <div className="w-3/4 space-y-4 absolute opacity-30">
                          <div className="h-0.5 bg-stone-900 w-full"></div>
                          <div className="h-0.5 bg-stone-900 w-full"></div> 
                          <div className="h-0.5 bg-stone-900 w-full"></div> 
                          <div className="h-0.5 bg-stone-900 w-full relative">
                              {/* Highlight Line 4 */}
                              {symbolFocus === 'whole' && <div className="absolute top-0 left-0 w-full h-full bg-rose-500 shadow-[0_0_10px_#f43f5e]"></div>}
                          </div>
                          <div className="h-0.5 bg-stone-900 w-full"></div>
                      </div>
                      
                      {/* The Hole/Brick Animation */}
                      <div className={`relative z-10 transition-all duration-500 ${symbolFocus === 'whole' ? 'scale-125 translate-y-4' : 'scale-100 translate-y-4'}`}>
                          <div className="w-16 h-8 bg-stone-900 mx-auto rounded-b-sm relative">
                              {/* Hanging Rim */}
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-stone-900"></div>
                          </div>
                      </div>

                      {symbolFocus === 'whole' && (
                          <div className="absolute bottom-4 right-4 bg-white p-2 rounded-xl shadow-sm border border-rose-100">
                              <span className="text-2xl">🕳️</span>
                          </div>
                      )}
                  </div>

                  <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                          <h3 className="text-2xl font-bold font-serif text-stone-900">全休止符</h3>
                          <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-500 text-xs font-bold uppercase tracking-wider">4 Beats</span>
                      </div>
                      <p className="text-stone-500 text-sm leading-relaxed mb-6">
                          挂在第四线下。因为它太重了（整整4拍），所以“掉”进了地下的洞里。
                      </p>
                      
                      <div className={`mt-auto p-4 rounded-xl text-xs font-medium transition-colors ${symbolFocus === 'whole' ? 'bg-rose-100 text-rose-800' : 'bg-stone-50 text-stone-400'}`}>
                          <span className="font-bold block mb-1 uppercase tracking-widest">Mnemonic (口诀)</span>
                          "Hole holds Whole" (地洞装全部)
                      </div>
                  </div>
              </div>

          </div>
      )}

      {/* --- EXTRA INFO CARD --- */}
      <div className="bg-stone-50 rounded-3xl p-8 border border-stone-200 flex gap-6 items-start animate-slideUp stagger-2">
          <div className="p-3 bg-white rounded-xl shadow-sm text-stone-400">
              <Umbrella size={24} />
          </div>
          <div>
              <h3 className="font-bold text-stone-900 mb-2">为什么需要休止符？</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                  想象一下，如果你说话时完全不换气，一口气说到底，听众会感到多么压抑。音乐也是如此。
                  休止符给音乐提供了<strong>结构</strong>和<strong>张力</strong>。有时候，此时无声胜有声，那个突然的停顿往往比最响亮的和弦更能震撼人心。
              </p>
          </div>
      </div>

      <style>{`
        .animate-bounce-gentle {
            animation: bounceGentle 2s infinite ease-in-out;
        }
        @keyframes bounceGentle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

export default RestsLesson;
