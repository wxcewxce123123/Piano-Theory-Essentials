
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Layers, Activity, Music, Mic2, Heart, TrendingUp, Grid } from 'lucide-react';

const PopStylesLesson: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [patternType, setPatternType] = useState<'block' | 'pulse' | 'broken' | 'ballad'>('block');
  const [activeChordIndex, setActiveChordIndex] = useState(-1);
  
  // Refs for audio state
  const patternTypeRef = useRef(patternType);
  const isPlayingRef = useRef(isPlaying);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const noteIndexRef = useRef<number>(0);
  const loopStartTimeRef = useRef<number>(0); // For visual sync
  
  const activeNodesRef = useRef<{osc: OscillatorNode, gain: GainNode, startTime: number}[]>([]);

  // --- Music Data: I - V - vi - IV (C - G - Am - F) ---
  const progression = [
      { name: 'C',  type: 'I',  notes: [261.63, 329.63, 392.00], color: 'bg-rose-500',  borderColor: 'border-rose-500' },
      { name: 'G',  type: 'V',  notes: [196.00, 246.94, 293.66], color: 'bg-amber-500', borderColor: 'border-amber-500' },
      { name: 'Am', type: 'vi', notes: [220.00, 261.63, 329.63], color: 'bg-purple-500', borderColor: 'border-purple-500' },
      { name: 'F',  type: 'IV', notes: [174.61, 261.63, 349.23], color: 'bg-emerald-500', borderColor: 'border-emerald-500' },
  ];

  const BPM = 100;
  const BEAT_DUR = 60 / BPM;
  const BAR_DUR = BEAT_DUR * 4;
  const LOOP_DUR = BAR_DUR * 4; // 9.6s

  const stopAllSounds = () => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const now = ctx.currentTime;
      
      activeNodesRef.current.forEach(({ gain, osc, startTime }) => {
          try {
              gain.gain.cancelScheduledValues(now);
              if (startTime > now) {
                  gain.gain.setValueAtTime(0, now);
                  osc.stop(now);
              } else {
                  gain.gain.setValueAtTime(gain.gain.value, now);
                  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                  osc.stop(now + 0.06);
              }
          } catch (e) {}
      });
      activeNodesRef.current = [];
  };

  const playSound = (freqs: number[], duration: number, vol: number, startTime: number) => {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      
      freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.frequency.value = f;
          osc.type = 'triangle'; 
          if (i > 0) osc.detune.value = Math.random() * 10 - 5;

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 1500;

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

          osc.start(startTime);
          osc.stop(startTime + duration + 0.1);
          
          const nodeEntry = { osc, gain, startTime };
          activeNodesRef.current.push(nodeEntry);
          
          osc.onended = () => {
              activeNodesRef.current = activeNodesRef.current.filter(n => n !== nodeEntry);
          };
      });
  };

  const schedule = () => {
      if (!isPlayingRef.current) return;
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const lookahead = 0.1;

      while (nextNoteTimeRef.current < ctx.currentTime + lookahead) {
          const beatIndex = noteIndexRef.current % 16;
          const barIndex = Math.floor(beatIndex / 4);
          const beatInBar = beatIndex % 4;
          
          const currentChord = progression[barIndex];
          // Visual triggers for chords (discrete events)
          const timeUntilPlay = (nextNoteTimeRef.current - ctx.currentTime) * 1000;
          
          // Pattern Logic
          const currentPattern = patternTypeRef.current;

          if (currentPattern === 'block') {
              if (beatInBar === 0) {
                  playSound(currentChord.notes, 2.0, 0.3, nextNoteTimeRef.current);
                  setTimeout(() => triggerVisual(barIndex, 'long'), Math.max(0, timeUntilPlay));
              }
          } 
          else if (currentPattern === 'pulse') {
              playSound(currentChord.notes, 0.4, beatInBar === 0 ? 0.3 : 0.2, nextNoteTimeRef.current);
              setTimeout(() => triggerVisual(barIndex, 'short'), Math.max(0, timeUntilPlay));
          }
          else if (currentPattern === 'broken') {
              const n = currentChord.notes;
              let notesToPlay: number[] = [];
              if (beatInBar === 0) notesToPlay = [n[0]];
              if (beatInBar === 1) notesToPlay = [n[2]];
              if (beatInBar === 2) notesToPlay = [n[1] * 2];
              if (beatInBar === 3) notesToPlay = [n[2]];

              if (notesToPlay.length > 0) {
                  playSound(notesToPlay, 0.4, 0.25, nextNoteTimeRef.current);
                  setTimeout(() => triggerVisual(barIndex, 'short', beatInBar), Math.max(0, timeUntilPlay));
              }
          }
          else if (currentPattern === 'ballad') {
              if (beatInBar === 0) {
                  playSound([currentChord.notes[0], currentChord.notes[2]], 1.5, 0.3, nextNoteTimeRef.current);
                  setTimeout(() => triggerVisual(barIndex, 'long'), Math.max(0, timeUntilPlay));
              }
              if (beatInBar === 2) {
                  playSound(currentChord.notes, 1.0, 0.25, nextNoteTimeRef.current);
                  setTimeout(() => triggerVisual(barIndex, 'medium'), Math.max(0, timeUntilPlay));
              }
              if (beatInBar === 3) {
                  playSound([currentChord.notes[1]], 0.5, 0.15, nextNoteTimeRef.current);
              }
          }

          nextNoteTimeRef.current += BEAT_DUR;
          noteIndexRef.current++;
      }

      // Visual Loop for Playhead (Separate from audio scheduling)
      updateVisuals();
      
      rafRef.current = requestAnimationFrame(schedule);
  };

  const updateVisuals = () => {
      const ctx = audioCtxRef.current;
      if (!ctx || !isPlayingRef.current) return;

      // Calculate smooth progress based on audio time
      const elapsed = ctx.currentTime - loopStartTimeRef.current;
      const progress = (elapsed % LOOP_DUR) / LOOP_DUR;
      
      // Update Playhead
      const playhead = document.getElementById('pop-playhead');
      if (playhead) {
          playhead.style.left = `${progress * 100}%`;
      }

      // Update Active Chord Highlight (strictly time-based)
      const currentBar = Math.floor(progress * 4);
      setActiveChordIndex(currentBar);
  };

  const triggerVisual = (chordIdx: number, type: 'long'|'short'|'medium', beatOffset: number = 0) => {
      const id = `visual-chord-${chordIdx}`;
      const el = document.getElementById(id);
      if (!el) return;
      el.style.animation = 'none';
      void el.offsetWidth;
      if (type === 'long') el.style.animation = 'pulseLong 2s ease-out';
      else if (type === 'medium') el.style.animation = 'pulseMedium 1s ease-out';
      else el.style.animation = 'pulseShort 0.4s ease-out';
  };

  const togglePlay = async () => {
      if (isPlaying) {
          setIsPlaying(false);
          isPlayingRef.current = false;
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          setActiveChordIndex(-1);
          stopAllSounds();
          const playhead = document.getElementById('pop-playhead');
          if (playhead) playhead.style.left = '0%';
      } else {
          if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          if (audioCtxRef.current.state === 'suspended') await audioCtxRef.current.resume();
          
          setIsPlaying(true);
          isPlayingRef.current = true;
          
          // Sync start time
          const now = audioCtxRef.current.currentTime;
          nextNoteTimeRef.current = now + 0.1;
          loopStartTimeRef.current = nextNoteTimeRef.current; // Align visual loop start with first note
          noteIndexRef.current = 0;
          
          schedule();
      }
  };

  const handlePatternChange = (newPattern: 'block' | 'pulse' | 'broken' | 'ballad') => {
      setPatternType(newPattern);
      patternTypeRef.current = newPattern;
      if (isPlayingRef.current) {
          stopAllSounds();
      }
  };

  useEffect(() => {
      return () => { 
          if (rafRef.current) cancelAnimationFrame(rafRef.current); 
          isPlayingRef.current = false;
          stopAllSounds();
      }
  }, []);

  return (
    <div className="space-y-8">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-stone-900 text-stone-100 rounded-full text-xs font-bold tracking-wider uppercase mb-3 shadow-lg flex items-center gap-2 w-fit border border-stone-700">
            <Mic2 size={12} className="text-rose-400" />
            Level 6 - Style Lab
        </div>
        <h2 className="text-3xl md:text-4xl font-bold serif text-stone-900 mb-4 tracking-tight">
            流行伴奏 <span className="text-stone-400 font-light italic">|</span> Pop Accompaniment
        </h2>
        <p className="text-lg text-stone-600 font-light max-w-3xl leading-relaxed">
          流行钢琴的核心不是复杂的音符，而是<strong>织体 (Texture)</strong> 与<strong>律动 (Groove)</strong>。
        </p>
      </header>

      {/* Main Stage */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-stone-200 p-8 md:p-12 relative overflow-hidden animate-slideUp stagger-1 flex flex-col gap-12 min-h-[500px] max-w-4xl mx-auto">
          
          {/* Piano Roll Visualizer */}
          <div className="relative w-full h-56 bg-stone-50 rounded-3xl border border-stone-100 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(90deg, #ccc 1px, transparent 1px)', backgroundSize: '25% 100%' }}></div>
              
              <div className="flex w-full h-full items-end justify-between px-8 pb-10 gap-6">
                  {progression.map((chord, idx) => (
                      <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center relative group">
                          {/* Chord Bar */}
                          <div 
                            id={`visual-chord-${idx}`}
                            className={`w-full rounded-t-xl opacity-20 origin-bottom ${chord.color} transition-all duration-200`}
                            style={{ height: '20%' }}
                          ></div>
                          
                          {/* Label */}
                          <div className={`absolute bottom-[-40px] transition-all duration-300 ${activeChordIndex === idx ? 'scale-125 -translate-y-2' : 'opacity-60'}`}>
                              <div className={`text-2xl font-black ${chord.color.replace('bg-', 'text-')}`}>{chord.name}</div>
                              <div className="text-xs text-stone-400 font-bold uppercase text-center">{chord.type}</div>
                          </div>

                          {/* Glow */}
                          {activeChordIndex === idx && (
                              <div className={`absolute inset-0 bg-gradient-to-t from-${chord.color.replace('bg-', '')}-100/50 to-transparent pointer-events-none`}></div>
                          )}
                      </div>
                  ))}
              </div>
              
              {/* Playhead (JS Driven for Sync) */}
              <div 
                id="pop-playhead"
                className="absolute top-0 bottom-0 w-0.5 bg-stone-900 z-10 shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                style={{ left: '0%' }}
              ></div>
          </div>

          {/* Controls - Compact Grid 2x2 */}
          <div className="flex flex-col lg:flex-row gap-8 items-center">
              
              <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                  <button 
                    onClick={() => handlePatternChange('block')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all group ${patternType === 'block' ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-100 bg-stone-50 hover:border-stone-300 text-stone-600'}`}
                  >
                      <div className="mb-2"><Grid size={24} /></div>
                      <div className="font-bold">柱式</div>
                      <div className="text-xs opacity-60">Block</div>
                  </button>

                  <button 
                    onClick={() => handlePatternChange('pulse')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all group ${patternType === 'pulse' ? 'border-amber-500 bg-amber-500 text-white' : 'border-stone-100 bg-stone-50 hover:border-stone-300 text-stone-600'}`}
                  >
                      <div className="mb-2"><Activity size={24} /></div>
                      <div className="font-bold">脉冲</div>
                      <div className="text-xs opacity-60">Pulse</div>
                  </button>

                  <button 
                    onClick={() => handlePatternChange('broken')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all group ${patternType === 'broken' ? 'border-sky-500 bg-sky-500 text-white' : 'border-stone-100 bg-stone-50 hover:border-stone-300 text-stone-600'}`}
                  >
                      <div className="mb-2"><TrendingUp size={24} /></div>
                      <div className="font-bold">分解</div>
                      <div className="text-xs opacity-60">Broken</div>
                  </button>

                  <button 
                    onClick={() => handlePatternChange('ballad')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all group ${patternType === 'ballad' ? 'border-rose-500 bg-rose-500 text-white' : 'border-stone-100 bg-stone-50 hover:border-stone-300 text-stone-600'}`}
                  >
                      <div className="mb-2"><Heart size={24} /></div>
                      <div className="font-bold">抒情</div>
                      <div className="text-xs opacity-60">Ballad</div>
                  </button>
              </div>

              {/* Master Play */}
              <div className="shrink-0">
                  <button 
                    onClick={togglePlay}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95 ${isPlaying ? 'bg-stone-100 text-stone-400' : 'bg-stone-900 text-white'}`}
                  >
                      {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                  </button>
              </div>
          </div>
      </div>

      {/* Theory Content */}
      <div className="grid md:grid-cols-3 gap-8 animate-slideUp stagger-2">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <Layers className="text-amber-500" size={20} />
                  织体 (Texture)
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                  <strong>Block</strong> 适合高潮部分，提供厚实支持。
                  <br/>
                  <strong>Broken</strong> 像流水，适合主歌，保持流动不抢戏。
              </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <Music className="text-rose-500" size={20} />
                  黄金进行 (The Axis)
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                  <strong>I - V - vi - IV</strong> 是无数金曲的骨架。兼具大调的明亮 (I, V, IV) 和小调的感伤 (vi)。
              </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <Activity className="text-sky-500" size={20} />
                  和声节奏
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                  流行歌通常一小节换一个和弦。太快会赶，太慢会拖。掌握呼吸频率是关键。
              </p>
          </div>
      </div>

      <style>{`
        @keyframes pulseLong { 0% { height: 20%; opacity: 0.2; } 10% { height: 100%; opacity: 1; } 100% { height: 20%; opacity: 0.2; } }
        @keyframes pulseMedium { 0% { height: 20%; opacity: 0.2; } 10% { height: 70%; opacity: 0.8; } 100% { height: 20%; opacity: 0.2; } }
        @keyframes pulseShort { 0% { height: 20%; opacity: 0.2; } 10% { height: 50%; opacity: 0.6; } 100% { height: 20%; opacity: 0.2; } }
      `}</style>
    </div>
  );
};

export default PopStylesLesson;
