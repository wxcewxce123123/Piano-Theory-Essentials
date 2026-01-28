
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Zap, Info, Music, BookOpen, Divide, Hash, Mic2 } from 'lucide-react';

type MeterType = '2/4' | '3/4' | '4/4' | '6/8';

const TimeSignatureLesson: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [meter, setMeter] = useState<MeterType>('4/4');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  
  // Refs for DOM elements
  const ballRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const ballInnerRef = useRef<HTMLDivElement>(null);
  
  // Audio Engine Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const timerIDRef = useRef<number | null>(null);
  const beatIndexRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0); 
  
  // Animation Logic Refs
  const animationRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);

  // --- Configuration Data ---
  const METER_CONFIG: Record<MeterType, {
      top: number;
      bottom: number;
      name: string;
      desc: string;
      beats: ('S' | 'M' | 'W')[]; 
      bpm: number;
      feel: string;
      meaning: string;
      patternDesc: string;
      examples: string;
      countStr: string[];
  }> = {
    '2/4': {
      top: 2, bottom: 4,
      name: '二拍子 (Duple)',
      desc: '进行曲风格，刚劲有力。',
      beats: ['S', 'W'], 
      bpm: 80,
      feel: '像行军：左、右、左、右 (ONE two)。',
      meaning: '每小节有 2 拍，以 4 分音符为一拍。',
      patternDesc: '强 - 弱 (Strong - Weak)。非常直接，没有多余的修饰。',
      examples: '《拉德斯基进行曲》、大多数儿歌、波尔卡舞曲。',
      countStr: ['ONE', 'two']
    },
    '3/4': {
      top: 3, bottom: 4,
      name: '三拍子 (Triple)',
      desc: '圆舞曲风格，旋转感。',
      beats: ['S', 'W', 'W'],
      bpm: 100,
      feel: '像华尔兹：嘭-恰-恰 (ONE two three)。',
      meaning: '每小节有 3 拍，以 4 分音符为一拍。',
      patternDesc: '强 - 弱 - 弱。三角形的结构，给人一种旋转、舞蹈的感觉。',
      examples: '《蓝色多瑙河》、肖邦圆舞曲。',
      countStr: ['ONE', 'two', 'three']
    },
    '4/4': {
      top: 4, bottom: 4,
      name: '四拍子 (Quadruple)',
      desc: '最常见的拍子，稳固平衡。',
      beats: ['S', 'W', 'M', 'W'],
      bpm: 90,
      feel: '流行乐标配：强、弱、次强、弱。',
      meaning: '每小节有 4 拍，以 4 分音符为一拍。',
      patternDesc: '强 - 弱 - 次强 - 弱。正方形的结构，非常稳定，适合叙事。',
      examples: '90% 的流行歌曲、摇滚乐、《欢乐颂》。',
      countStr: ['ONE', 'two', 'Three', 'four']
    },
    '6/8': {
      top: 6, bottom: 8,
      name: '复二拍子 (Compound)',
      desc: '摇摆感，两大拍包含三细分。',
      beats: ['S', 'W', 'W', 'M', 'W', 'W'], 
      bpm: 120, 
      feel: '摇篮曲或船歌：(1-2-3) (4-5-6)。',
      meaning: '每小节有 6 拍，以 8 分音符为一拍。',
      patternDesc: '虽然数6下，但感觉上是 2 大拍。每一大拍里有3个细分，带来摇摆感。',
      examples: '《希伯来奴隶合唱》、许多爱尔兰民谣、摇篮曲。',
      countStr: ['ONE', 'la', 'li', 'TWO', 'la', 'li']
    }
  };

  const activeConfig = METER_CONFIG[meter];

  // --- Audio Engine ---
  const setupAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playClick = (time: number, strength: 'S' | 'M' | 'W') => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (strength === 'S') { 
        osc.frequency.value = 1000; 
        osc.type = 'square'; 
        gain.gain.setValueAtTime(0.3, time);
    } else if (strength === 'M') { 
        osc.frequency.value = 600;
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.15, time);
    } else { 
        osc.frequency.value = 400; 
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.05, time);
    }
    
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    osc.start(time);
    osc.stop(time + 0.15);
  };

  const scheduler = () => {
    if (!audioCtxRef.current) return;
    
    const lookahead = 25.0; 
    const scheduleAheadTime = 0.1; 
    const secondsPerBeat = 60.0 / activeConfig.bpm;

    while (nextNoteTimeRef.current < audioCtxRef.current.currentTime + scheduleAheadTime) {
      const currentBeatIndex = beatIndexRef.current % activeConfig.beats.length;
      const strength = activeConfig.beats[currentBeatIndex];
      playClick(nextNoteTimeRef.current, strength);

      nextNoteTimeRef.current += secondsPerBeat;
      beatIndexRef.current++;
    }
    timerIDRef.current = window.setTimeout(scheduler, lookahead);
  };

  // --- Animation Loop ---
  const animate = () => {
      if (!isPlayingRef.current || !audioCtxRef.current || !trackRef.current || !ballRef.current) {
          return;
      }

      // 1. Time Logic
      const currentTime = audioCtxRef.current.currentTime;
      const secondsPerBeat = 60.0 / activeConfig.bpm;
      const totalBeats = activeConfig.beats.length;
      const loopDuration = totalBeats * secondsPerBeat;
      
      const rawElapsed = currentTime - startTimeRef.current;
      const elapsed = Math.max(0, rawElapsed);
      
      // 0.0 to 1.0 representing one full bar/loop
      const loopProgress = (elapsed % loopDuration) / loopDuration;
      
      // 2. Beat State Logic
      const exactBeat = loopProgress * totalBeats; 
      const currentBeatIdx = Math.floor(exactBeat);
      // Ensure beatProgress is strictly 0-1 to avoid weird math
      const beatProgress = Math.max(0, Math.min(1, exactBeat % 1)); 

      setCurrentBeat(prev => prev !== currentBeatIdx ? currentBeatIdx : prev);

      // 3. Position Logic (Synced with Absolute Markers)
      const trackWidth = trackRef.current.clientWidth;
      
      // X: Strictly map loop progress to track width.
      const x = loopProgress * trackWidth;
      
      // Edge Fading Logic (Fix for "flying out" visual discontinuity)
      // Fade out in the last 5% of the loop, fade in in the first 5%
      let opacity = 1;
      const fadeZone = 0.05;
      if (loopProgress > 1 - fadeZone) {
          opacity = (1 - loopProgress) / fadeZone;
      } else if (loopProgress < fadeZone) {
          opacity = loopProgress / fadeZone;
      }

      // Y: Parabolic Bounce for the current beat
      const bounceHeight = 80; 
      // Use Math.abs to prevent negative dips due to precision errors near 0/1
      const y = Math.abs(Math.sin(beatProgress * Math.PI)) * bounceHeight;

      // Squash & Stretch effect based on Y height (closer to ground = flatter)
      const squash = 1 + Math.max(0, (1 - y/20)) * 0.2; // slight stretch at bottom
      const scaleStr = y < 10 ? `scale(${1 + (10-y)*0.02}, ${1 - (10-y)*0.02})` : 'scale(1, 1)';

      // 4. Apply Transform
      // ball is centered via css, so x is center position
      ballRef.current.style.transform = `translate3d(${x}px, ${-y}px, 0) translateX(-50%)`;
      ballRef.current.style.opacity = opacity.toString();
      
      if (ballInnerRef.current) {
          ballInnerRef.current.style.transform = scaleStr;
      }

      animationRef.current = requestAnimationFrame(animate);
  };

  // --- Controls ---
  const togglePlay = () => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  };

  const play = async () => {
      setupAudio();
      if (audioCtxRef.current?.state === 'suspended') {
          await audioCtxRef.current.resume();
      }

      if (audioCtxRef.current) {
          setIsPlaying(true);
          isPlayingRef.current = true;
          beatIndexRef.current = 0;
          
          const now = audioCtxRef.current.currentTime;
          nextNoteTimeRef.current = now + 0.1; 
          startTimeRef.current = nextNoteTimeRef.current; 
          
          scheduler();
          
          if (animationRef.current) cancelAnimationFrame(animationRef.current);
          animationRef.current = requestAnimationFrame(animate);
      }
  };

  const stop = () => {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setCurrentBeat(-1);
      
      if (timerIDRef.current) window.clearTimeout(timerIDRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      
      if (ballRef.current) {
          ballRef.current.style.transform = `translate3d(0px, 0px, 0) translateX(-50%)`;
          ballRef.current.style.opacity = '0';
      }
      if (ballInnerRef.current) {
          ballInnerRef.current.style.transform = 'scale(1,1)';
      }
  };

  const handleMeterChange = (m: MeterType) => {
      if (m === meter) return;
      setIsTransitioning(true);
      stop();
      setTimeout(() => {
          setMeter(m);
          setTimeout(() => {
              setIsTransitioning(false);
          }, 50);
      }, 300); 
  };

  useEffect(() => {
      return () => {
          isPlayingRef.current = false;
          if (timerIDRef.current) window.clearTimeout(timerIDRef.current);
          if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
  }, []);

  return (
    <div className="space-y-12 pb-20">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase mb-3">Level 1 - Foundations</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            拍号详解 <span className="text-stone-300 font-light">|</span> Time Signatures
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl leading-relaxed">
          拍号是音乐的心跳代码。它不仅告诉我们怎么数数，更决定了音乐的“律动感” (Groove)。
        </p>
      </header>

      {/* Main Interactive Stage */}
      <div className="bg-stone-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden animate-slideUp stagger-1 min-h-[600px] flex flex-col gap-10">
          
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #444 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

          {/* Meter Selector */}
          <div className="flex flex-wrap gap-4 z-10 justify-center md:justify-start">
              {(Object.keys(METER_CONFIG) as MeterType[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => handleMeterChange(m)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border-2 ${
                        meter === m 
                        ? 'bg-amber-500 border-amber-500 text-stone-900 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-105' 
                        : 'bg-stone-800 border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-200'
                    }`}
                  >
                      {m}
                  </button>
              ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-16 items-center">
              
              {/* Left: The Fraction Display with 3D Flip */}
              <div className="flex-shrink-0 relative group cursor-help perspective-[1000px]">
                  <div 
                    className={`
                        bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-10 w-48 flex flex-col items-center gap-4 shadow-xl 
                        transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform-style-3d
                        ${isTransitioning ? 'rotate-x-90 opacity-0 scale-90' : 'rotate-x-0 opacity-100 scale-100'}
                    `}
                  >
                      <div className="text-8xl font-black text-amber-500 leading-none drop-shadow-lg filter">{activeConfig.top}</div>
                      <div className="w-24 h-1.5 bg-stone-600 rounded-full"></div>
                      <div className="text-8xl font-black text-stone-300 leading-none drop-shadow-lg">{activeConfig.bottom}</div>
                  </div>
                  {/* Shadow reflection */}
                  <div className={`absolute -bottom-8 left-4 right-4 h-4 bg-black/40 blur-xl rounded-[100%] transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-x-50' : 'opacity-100 scale-x-100'}`}></div>
              </div>

              {/* Right: Animation Stage */}
              <div className="flex-1 w-full flex flex-col gap-8">
                  
                  {/* Info Header with Slide Transition */}
                  <div className="relative overflow-hidden min-h-[5rem]">
                      <div className={`flex justify-between items-end text-stone-400 border-b border-stone-800 pb-4 transition-all duration-500 ${isTransitioning ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}`}>
                          <div>
                              <h3 className="text-3xl font-bold text-white mb-2">{activeConfig.name}</h3>
                              <div className="text-base font-medium opacity-70 flex items-center gap-2">
                                  <Info size={16} />
                                  {activeConfig.desc}
                              </div>
                          </div>
                          <div className="text-xs font-bold uppercase tracking-widest bg-stone-800 px-4 py-2 rounded-full border border-stone-700 shrink-0 ml-4">
                              {activeConfig.bpm} BPM
                          </div>
                      </div>
                  </div>

                  {/* Animation Track - Added overflow-hidden to fix flying out issue */}
                  <div className="relative w-full h-40 flex items-end mb-4 select-none overflow-hidden">
                      
                      {/* The Floor / Beats */}
                      <div ref={trackRef} className="w-full flex items-end relative h-12 z-10">
                          {/* Horizontal Line */}
                          <div className={`absolute w-full h-0.5 bg-stone-700 top-1/2 -translate-y-1/2 rounded-full transition-all duration-500 ${isTransitioning ? 'scale-x-0 opacity-0' : 'scale-x-100 opacity-100'}`}></div>
                          
                          {/* Beat Markers - ABSOLUTE POSITIONING */}
                          {activeConfig.beats.map((strength, i) => {
                              const pct = (i / activeConfig.beats.length) * 100;
                              
                              return (
                                  <div 
                                    key={i} 
                                    className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 flex flex-col items-center group w-8"
                                    style={{ 
                                        left: `${pct}%`,
                                        transitionDelay: isTransitioning ? '0ms' : `${i * 60}ms`, // Stagger effect
                                        opacity: isTransitioning ? 0 : 1,
                                        transform: isTransitioning ? 'translate(-50%, -50%) scale(0)' : 'translate(-50%, -50%) scale(1)',
                                        transitionProperty: 'opacity, transform',
                                        transitionDuration: '0.4s',
                                        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                                    }}
                                  >
                                      {/* Marker Dot */}
                                      <div 
                                        className={`
                                            rounded-full transition-all duration-150 z-10 border-2 border-stone-900 relative
                                            ${currentBeat === i 
                                                ? (strength === 'S' ? 'w-8 h-8 bg-amber-500 shadow-[0_0_25px_#f59e0b] scale-110' : (strength === 'M' ? 'w-6 h-6 bg-amber-300' : 'w-5 h-5 bg-stone-400'))
                                                : (strength === 'S' ? 'w-5 h-5 bg-stone-600' : 'w-3 h-3 bg-stone-700')
                                            }
                                        `}
                                      ></div>
                                      
                                      {/* Beat Number */}
                                      <div className={`absolute top-10 font-mono font-bold text-lg transition-colors ${currentBeat === i ? 'text-white' : 'text-stone-600'}`}>
                                          {i + 1}
                                      </div>
                                  </div>
                              );
                          })}
                      </div>

                      {/* The Bouncing Ball */}
                      <div 
                        ref={ballRef}
                        className="absolute left-0 w-10 h-10 z-20 flex items-center justify-center pointer-events-none will-change-transform"
                        style={{ 
                            bottom: '10px', 
                            transform: 'translateX(-50%)', 
                            opacity: 0, // Controlled by JS in animate loop
                        }}
                      >
                          <div 
                            ref={ballInnerRef}
                            className="w-full h-full rounded-full shadow-lg"
                            style={{
                                background: 'radial-gradient(circle at 35% 35%, #fff, #f59e0b)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                            }}
                          ></div>
                      </div>
                  </div>

                  {/* Play Button & Feel */}
                  <div className="flex items-center gap-6">
                      <button 
                        onClick={togglePlay}
                        className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all active:scale-95 shadow-xl shrink-0 ${
                            isPlaying 
                            ? 'bg-stone-800 text-stone-400 border border-stone-700' 
                            : 'bg-white text-stone-900 hover:scale-105 hover:bg-stone-100 shadow-amber-900/20'
                        }`}
                      >
                          {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
                          <span>{isPlaying ? '停止 (Stop)' : '开始体验 (Start)'}</span>
                      </button>

                      <div className={`flex-1 text-sm text-stone-400 bg-white/5 p-4 rounded-2xl border border-white/5 leading-relaxed flex items-center gap-3 min-h-[5rem] transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
                          <div className="p-2 bg-amber-500/20 rounded-full text-amber-500 shrink-0">
                              <Zap size={18} fill="currentColor" />
                          </div>
                          <div>
                              <span className="block text-xs font-bold uppercase text-stone-500 mb-1">Rhythmic Feel</span>
                              {activeConfig.feel}
                          </div>
                      </div>
                  </div>

              </div>
          </div>
      </div>

      {/* Deep Dive Cards - 3 Grid Layout */}
      <div className="grid md:grid-cols-3 gap-6 animate-slideUp stagger-2">
          
          {/* Card 1: Meaning */}
          <div className={`bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-md transition-all duration-500 ${isTransitioning ? 'opacity-50 blur-sm' : 'opacity-100 blur-0'}`}>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                  <Divide size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">数字的含义</h3>
              <div className="space-y-4 text-sm text-stone-600">
                  <div>
                      <span className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Top Number (分子)</span>
                      <p className="font-medium text-stone-800">{activeConfig.top} 拍</p>
                      <p className="text-xs mt-1">表示每小节有多少拍。</p>
                  </div>
                  <div className="h-px bg-stone-100 w-full"></div>
                  <div>
                      <span className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Bottom Number (分母)</span>
                      <p className="font-medium text-stone-800">{activeConfig.bottom} 分音符</p>
                      <p className="text-xs mt-1">表示以几分音符为一拍。</p>
                  </div>
              </div>
          </div>

          {/* Card 2: Pattern */}
          <div className={`bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-md transition-all duration-500 delay-100 ${isTransitioning ? 'opacity-50 blur-sm' : 'opacity-100 blur-0'}`}>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                  <Hash size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">强弱逻辑</h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-6 min-h-[3em]">
                  {activeConfig.patternDesc}
              </p>
              
              <div className="flex items-end gap-1 h-16 border-b border-stone-200 pb-2">
                  {activeConfig.beats.map((b, i) => (
                      <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2 group">
                          <div 
                            className={`w-full rounded-t-md transition-all duration-300 ${b === 'S' ? 'bg-indigo-500 h-full' : (b === 'M' ? 'bg-indigo-300 h-2/3' : 'bg-stone-200 h-1/3')}`}
                          ></div>
                          <span className="text-[10px] font-mono font-bold text-stone-400">{i+1}</span>
                      </div>
                  ))}
              </div>
          </div>

          {/* Card 3: Context */}
          <div className={`bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-md transition-all duration-500 delay-200 ${isTransitioning ? 'opacity-50 blur-sm' : 'opacity-100 blur-0'}`}>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                  <Music size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">音乐场景</h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  这种拍号通常用于：
              </p>
              <div className="bg-stone-50 p-4 rounded-xl text-sm font-medium text-stone-700 italic border border-stone-100">
                  {activeConfig.examples}
              </div>
              <div className="mt-4 flex gap-2">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">Common</span>
                  <span className="px-2 py-1 bg-stone-100 text-stone-500 text-[10px] font-bold rounded uppercase">Classic</span>
              </div>
          </div>

      </div>

      {/* NEW SECTION: Counting Guide */}
      <div className={`bg-stone-900 text-stone-300 rounded-[2rem] p-8 border border-stone-800 animate-slideUp stagger-3 transition-all duration-500 ${isTransitioning ? 'opacity-50 blur-sm' : 'opacity-100 blur-0'}`}>
          <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-stone-800 rounded-xl text-amber-500 border border-stone-700">
                  <Mic2 size={24} />
              </div>
              <div>
                  <h3 className="text-xl font-bold text-white">如何数拍子? (Counting Guide)</h3>
                  <p className="text-stone-500 text-sm">跟着节拍器大声念出来</p>
              </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {activeConfig.countStr.map((s, i) => (
                  <div key={i} className="flex flex-col items-center p-4 bg-stone-800/50 rounded-xl border border-stone-700/50">
                      <div className={`text-2xl font-black mb-1 ${s === s.toUpperCase() ? 'text-amber-500' : 'text-stone-500'}`}>
                          {s}
                      </div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-stone-600">
                          Beat {i + 1}
                      </div>
                  </div>
              ))}
          </div>
      </div>
      
      <style>{`
        .rotate-x-0 { transform: perspective(1000px) rotateX(0deg); }
        .rotate-x-90 { transform: perspective(1000px) rotateX(90deg); }
        .transform-style-3d { transform-style: preserve-3d; }
      `}</style>
    </div>
  );
};

export default TimeSignatureLesson;
