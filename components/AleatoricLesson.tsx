import React, { useState, useRef, useEffect } from 'react';
import { Dices, RefreshCw, Sparkles, Play, Pause } from 'lucide-react';

const AleatoricLesson: React.FC = () => {
  const [sequence, setSequence] = useState<{note: string, freq: number, dur: number, x: number, y: number, color: string}[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Canvas dimensions
  const width = 100;
  const height = 100;

  // Generate random music
  const generateMusic = () => {
      const length = 8 + Math.floor(Math.random() * 8); // 8-16 notes
      const newSeq = [];
      const colors = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6'];
      
      for(let i=0; i<length; i++) {
          // Random Pitch (Pentatonic scale for pleasant randomness)
          // C4, D4, E4, G4, A4, C5, D5, E5
          const scale = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3, 587.3, 659.3];
          const pitchIdx = Math.floor(Math.random() * scale.length);
          
          // Random Duration (Short or Long)
          const dur = Math.random() > 0.7 ? 0.8 : 0.3;
          
          // Random Position for Graphic Score
          // X spreads out over time, Y depends on pitch (inverted, high pitch = low Y)
          const x = (i / length) * 80 + 10;
          const y = 90 - (pitchIdx / scale.length) * 80;

          newSeq.push({
              note: '?',
              freq: scale[pitchIdx],
              dur: dur,
              x: x,
              y: y + (Math.random() * 10 - 5), // Slight jitter
              color: colors[Math.floor(Math.random() * colors.length)]
          });
      }
      setSequence(newSeq);
      setIsPlaying(false);
      setActiveIndex(-1);
  };

  useEffect(() => {
      generateMusic();
  }, []);

  const playSequence = async () => {
      if (isPlaying) return;
      setIsPlaying(true);
      
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      for (let i = 0; i < sequence.length; i++) {
          setActiveIndex(i);
          const note = sequence[i];
          
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.frequency.value = note.freq;
          osc.type = Math.random() > 0.5 ? 'sine' : 'triangle'; // Random timbre too
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          const now = ctx.currentTime;
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + note.dur);
          
          osc.start(now);
          osc.stop(now + note.dur + 0.1);

          await new Promise(r => setTimeout(r, note.dur * 1000));
      }

      setIsPlaying(false);
      setActiveIndex(-1);
  };

  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-stone-900 text-stone-100 rounded-full text-xs font-bold tracking-wider uppercase mb-3 shadow-lg">Level 5 - Master Class</div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
            偶然音乐 <span className="text-stone-300 font-light">|</span> Aleatoric Music
        </h2>
        <p className="text-xl text-stone-600 font-light max-w-2xl">
          "Aleatoric" 来自拉丁语 "Alea" (骰子)。这种音乐放弃了作曲家的绝对控制权，将创作交给了机会、概率和当下。
        </p>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-stone-200 p-8 md:p-12 animate-slideUp stagger-1 relative overflow-hidden min-h-[500px] flex flex-col">
          
          {/* Graphic Score Canvas */}
          <div className="flex-1 w-full bg-stone-50 rounded-3xl border border-stone-200 relative mb-8 overflow-hidden cursor-crosshair" onClick={generateMusic}>
              {/* Grid Lines */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              
              {/* Connecting Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <polyline 
                    points={sequence.map(n => `${n.x}%,${n.y}%`).join(' ')}
                    fill="none"
                    stroke="#a8a29e"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="opacity-50"
                  />
              </svg>

              {/* Notes */}
              {sequence.map((n, i) => (
                  <div 
                    key={i}
                    className={`absolute w-6 h-6 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 border-2 ${activeIndex === i ? 'scale-150 z-20 border-white shadow-xl' : 'scale-100 z-10 border-transparent'}`}
                    style={{ 
                        left: `${n.x}%`, 
                        top: `${n.y}%`,
                        backgroundColor: n.color,
                        opacity: activeIndex === -1 ? 0.8 : (activeIndex === i ? 1 : 0.3)
                    }}
                  >
                      {activeIndex === i && <div className="absolute inset-0 rounded-full animate-ping bg-white opacity-50"></div>}
                  </div>
              ))}
              
              {/* Overlay Hint */}
              {sequence.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-stone-400">
                      点击生成你的随机乐谱
                  </div>
              )}
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                  <button 
                    onClick={generateMusic}
                    className="p-4 bg-stone-100 text-stone-600 rounded-2xl hover:bg-stone-200 transition-colors flex items-center gap-2 group"
                  >
                      <Dices size={24} className="group-hover:rotate-180 transition-transform duration-500" />
                      <span className="font-bold">掷骰子 (Randomize)</span>
                  </button>
                  <div className="text-xs text-stone-400 font-mono">
                      Seed: {Math.floor(Math.random()*10000)}
                  </div>
              </div>

              <button 
                onClick={playSequence}
                disabled={isPlaying}
                className={`px-10 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center gap-3 ${
                    isPlaying 
                    ? 'bg-stone-800 text-stone-500 cursor-not-allowed' 
                    : 'bg-stone-900 text-white hover:scale-105 active:scale-95'
                }`}
              >
                  {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
                  <span>{isPlaying ? '演绎中...' : '演绎乐谱 (Perform)'}</span>
              </button>
          </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 animate-slideUp stagger-2">
          <div className="bg-stone-900 text-stone-300 p-8 rounded-3xl shadow-lg card-hover">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="text-amber-400" />
                  什么是图形谱？
              </h3>
              <p className="text-sm leading-relaxed">
                  在偶然音乐中，传统五线谱往往被图形谱取代。点代表音符，线条代表走向，大小代表强弱。演奏者不再是机器，而是共同创作者，每次演绎都是独一无二的。
              </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover">
              <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <RefreshCw className="text-indigo-500" />
                  有组织的混乱
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                  虽然是随机的，但并非杂乱无章。通常作曲家会设定规则（比如“只能用这5个音”或“必须演奏得很轻”），在规则之内的自由，才是这种音乐的魅力。
              </p>
          </div>
      </div>
    </div>
  );
};

export default AleatoricLesson;