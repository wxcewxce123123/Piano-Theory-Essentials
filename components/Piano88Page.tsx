import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    ChevronLeft, Volume2, Play, Pause, RotateCcw, 
    Maximize2, Minimize2, Music, Sparkles, Check, 
    HelpCircle, Zap, ZoomIn, ZoomOut, Eye, Keyboard,
    ListMusic, Radio, Settings, Power, Award, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Piano Key Interface
export interface PianoKey {
    index: number;      // 1 to 88
    name: string;       // e.g. "A0", "C4"
    pitchClass: string; // e.g. "A", "C"
    octave: number;     // 0 to 8
    isBlack: boolean;
    frequency: number;
}

// Falling Note block on canvas
interface FallingNote {
    id: string;
    keyIndex: number;
    startTime: number;  // in seconds on the song timer
    duration: number;   // in seconds
    isBlack: boolean;
}

// Particle splash on hit
interface HitParticle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    alpha: number;
    life: number;
}

// Dynamic sound halo ripple
interface KeyHalo {
    id: number;
    keyIndex: number;
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    alpha: number;
    color: string;
}

// Synth Engine Class with high-fidelity physical modeling, string inharmonicity, stereo panning, soundboard convolution resonance, and custom timbre configurations
class PianoSynthesizer {
    private ctx: AudioContext | null = null;
    private activeNodes: { [keyIndex: number]: any[] } = {};
    private sustainActive: boolean = false;
    private sustainedKeys: Set<number> = new Set();
    private volume: number = 0.6;
    private timbre: 'grand' | 'yamaha' | 'bosendorfer' | 'upright' | 'ambient' = 'grand';
    
    // Global effects nodes for soundboard body resonance and spacious delay
    private delayNode: DelayNode | null = null;
    private feedbackNode: GainNode | null = null;
    private masterGainNode: GainNode | null = null;
    
    // Convolved solid spruce soundboard cabinet simulator
    private soundboardConvolver: ConvolverNode | null = null;
    private soundboardGain: GainNode | null = null;

    // Cached noise buffer for hammer strike simulation
    private hammerNoiseBuffer: AudioBuffer | null = null;

    constructor() {}

    private createResonanceIR(ctx: AudioContext): AudioBuffer {
        const sampleRate = ctx.sampleRate;
        const duration = 1.8; // Rich 1.8 seconds soundboard timbre tail
        const len = sampleRate * duration;
        const irBuffer = ctx.createBuffer(2, len, sampleRate);
        
        const dL = irBuffer.getChannelData(0);
        const dR = irBuffer.getChannelData(1);
        
        for (let i = 0; i < len; i++) {
            const progress = i / len;
            // Exponentially decaying dense random soundboard wood body vibrations
            const decay = Math.pow(1 - progress, 2.5);
            const lNoise = (Math.random() * 2 - 1) * decay;
            const rNoise = (Math.random() * 2 - 1) * decay;
            
            // Standing wave resonance frequency peaks calculated for premium solid sitka spruce soundboards
            // Simulates rib bracing, sound post, and wooden bridge vibrational nodes
            const resFreqs = [56, 112, 178, 224, 340, 480, 620, 850, 1150, 1600];
            let lSum = lNoise * 0.12;
            let rSum = rNoise * 0.12;
            
            const timeSec = i / sampleRate;
            for (let j = 0; j < resFreqs.length; j++) {
                const f = resFreqs[j];
                const fGain = Math.exp(-f * 0.0009) * 0.18; // Drop gain exponentially with higher frequency
                lSum += Math.sin(2 * Math.PI * f * timeSec) * decay * fGain * (1.0 + Math.sin(j * 4.0) * 0.15);
                rSum += Math.sin(2 * Math.PI * f * timeSec + Math.PI / 4) * decay * fGain * (1.0 + Math.cos(j * 3.5) * 0.15);
            }
            
            dL[i] = lSum * 0.55;
            dR[i] = rSum * 0.55;
        }
        return irBuffer;
    }

    private setSoundboardGainForTimbre() {
        if (!this.ctx || !this.soundboardGain) return;
        const now = this.ctx.currentTime;
        let gainVal = 0.35;
        if (this.timbre === 'grand') gainVal = 0.45;
        else if (this.timbre === 'yamaha') gainVal = 0.28;
        else if (this.timbre === 'bosendorfer') gainVal = 0.65;
        else if (this.timbre === 'upright') gainVal = 0.38;
        else if (this.timbre === 'ambient') gainVal = 0.95;
        
        this.soundboardGain.gain.setTargetAtTime(gainVal, now, 0.1);
    }

    private initCtx() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            this.ctx = new AudioCtx();
            
            // Build soft felt hammer friction sound
            const sampleRate = this.ctx.sampleRate;
            const bufferSize = sampleRate * 0.05; // 50ms pulse
            this.hammerNoiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
            const data = this.hammerNoiseBuffer.getChannelData(0);
            let lastVal = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                // Soft pinkish filtering for felt and wood character
                lastVal = 0.15 * white + 0.85 * lastVal;
                data[i] = lastVal * 1.8;
            }

            // Generate master gain control node
            this.masterGainNode = this.ctx.createGain();
            this.masterGainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
            
            // Spruce soundboard feedback resonance model/delay
            this.delayNode = this.ctx.createDelay(2.0);
            this.feedbackNode = this.ctx.createGain();
            
            this.delayNode.delayTime.setValueAtTime(0.42, this.ctx.currentTime);
            this.feedbackNode.gain.setValueAtTime(0.35, this.ctx.currentTime); // 35% spatial spillover
            
            // Direct dry output connection
            this.masterGainNode.connect(this.ctx.destination);
            
            // Delay feedback loop (connected to masterGain for volume obedience)
            this.delayNode.connect(this.feedbackNode);
            this.feedbackNode.connect(this.delayNode);
            this.feedbackNode.connect(this.masterGainNode);
            
            // Setup Convolved soundboard simulator
            try {
                this.soundboardConvolver = this.ctx.createConvolver();
                this.soundboardConvolver.buffer = this.createResonanceIR(this.ctx);
                
                this.soundboardGain = this.ctx.createGain();
                this.setSoundboardGainForTimbre();
                
                this.soundboardConvolver.connect(this.soundboardGain);
                this.soundboardGain.connect(this.masterGainNode);
            } catch (e) {
                console.warn("Failed to set up soundboard convolved cabinet resonance:", e);
            }

            // Feed master dry signal into spatial delay network
            this.masterGainNode.connect(this.delayNode);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    public setVolume(vol: number) {
        this.volume = vol;
        if (this.ctx && this.masterGainNode) {
            const now = this.ctx.currentTime;
            this.masterGainNode.gain.setValueAtTime(vol, now);
        }
    }

    public setSustain(active: boolean) {
        this.sustainActive = active;
        if (!active) {
            // Damp sustained notes that have been physically released
            this.sustainedKeys.forEach(idx => {
                this.triggerRelease(idx, true);
            });
            this.sustainedKeys.clear();
        }
    }

    public setTimbre(type: 'grand' | 'yamaha' | 'bosendorfer' | 'upright' | 'ambient') {
        this.timbre = type;
        this.setSoundboardGainForTimbre();
        
        if (this.ctx && this.masterGainNode && this.delayNode && this.feedbackNode) {
            try {
                this.masterGainNode.disconnect(this.delayNode);
            } catch (e) {}
            
            const now = this.ctx.currentTime;
            if (type === 'ambient') {
                this.masterGainNode.connect(this.delayNode);
                this.delayNode.delayTime.setValueAtTime(0.55, now);
                this.feedbackNode.gain.setValueAtTime(0.55, now);
            } else {
                // Subtle natural spatial delay for concert stage presence
                this.masterGainNode.connect(this.delayNode);
                this.delayNode.delayTime.setValueAtTime(0.38, now);
                this.feedbackNode.gain.setValueAtTime(0.18, now);
            }
        }
    }

    public triggerAttack(keyIndex: number, frequency: number, velocity: number = 0.75) {
        this.initCtx();
        if (!this.ctx) return;

        if (this.sustainActive) {
            this.sustainedKeys.add(keyIndex);
        }

        const now = this.ctx.currentTime;
        this.stopNode(keyIndex);

        const vel = Math.max(0.08, Math.min(1.0, velocity));

        // Create Master gain nodes for individual note
        const masterGain = this.ctx.createGain();
        masterGain.gain.setValueAtTime(0, now);
        
        let partialsDef: { n: number, gain: number, type: 'sine' | 'triangle' | 'sawtooth' | 'square', detune: number }[] = [];
        let B = 0.00015; // default inharmonicity coefficient
        let unisonDetune = 1.2; // string unison beating width (cents)
        let filterStartMult = 4.5;
        let filterEndMult = 1.5;
        let filterDecay = 2.0;
        let baseDecay = 8.0;
        let hammerPitchOffset = 15;
        let hammerVolMult = 0.25;
        let hammerDecayTime = 0.015;
        let attackSwell = 0.0035;

        if (this.timbre === 'grand') {
            // Setup for: 👑 Steinway Concert Grand (施坦威皇冠大三角)
            baseDecay = 10.0;
            B = 0.00014;
            unisonDetune = 1.3;
            filterStartMult = 5.2; 
            filterEndMult = 1.3;
            filterDecay = 2.5; 
            hammerPitchOffset = 18;
            hammerVolMult = 0.22;
            hammerDecayTime = 0.012;
            attackSwell = 0.0028; 
            
            partialsDef = [
                { n: 1, gain: 0.90, type: 'sine' as const, detune: -unisonDetune },
                { n: 1, gain: 0.72, type: 'triangle' as const, detune: +unisonDetune },
                { n: 1, gain: 0.55, type: 'sine' as const, detune: 0 },
                { n: 2, gain: 0.32, type: 'triangle' as const, detune: +0.4 },
                { n: 3, gain: 0.18, type: 'sine' as const, detune: -0.4 },
                { n: 4, gain: 0.09, type: 'sine' as const, detune: +0.2 },
                { n: 5, gain: 0.04, type: 'sine' as const, detune: 0 },
                { n: 6, gain: 0.02, type: 'sine' as const, detune: 0 }
            ];
        } 
        else if (this.timbre === 'yamaha') {
            // Setup for: ⚡ Yamaha Bright Studio (雅马哈明亮大三角)
            baseDecay = 7.5;
            B = 0.00028; 
            unisonDetune = 0.95; 
            filterStartMult = 8.5; 
            filterEndMult = 2.0; 
            filterDecay = 1.8;
            hammerPitchOffset = 25; 
            hammerVolMult = 0.38; 
            hammerDecayTime = 0.009; 
            attackSwell = 0.0022; 
            
            partialsDef = [
                { n: 1, gain: 0.82, type: 'sine' as const, detune: -unisonDetune },
                { n: 1, gain: 0.78, type: 'triangle' as const, detune: +unisonDetune },
                { n: 2, gain: 0.48, type: 'triangle' as const, detune: +0.5 }, 
                { n: 3, gain: 0.32, type: 'sawtooth' as const, detune: -0.3 }, 
                { n: 4, gain: 0.18, type: 'triangle' as const, detune: +0.1 },
                { n: 5, gain: 0.08, type: 'sine' as const, detune: 0 },
                { n: 6, gain: 0.04, type: 'sine' as const, detune: 0 }
            ];
        }
        else if (this.timbre === 'bosendorfer') {
            // Setup for: 🏛️ Bösendorfer Imperial (贝森朵夫帝王大三角)
            baseDecay = 13.0; 
            B = 0.00007; 
            unisonDetune = 1.6; 
            filterStartMult = 3.6; 
            filterEndMult = 1.15;
            filterDecay = 3.8;
            hammerPitchOffset = 10; 
            hammerVolMult = 0.16; 
            hammerDecayTime = 0.022;
            attackSwell = 0.0035;
            
            partialsDef = [
                { n: 1, gain: 0.98, type: 'sine' as const, detune: -unisonDetune },
                { n: 1, gain: 0.82, type: 'sine' as const, detune: +unisonDetune }, 
                { n: 1, gain: 0.65, type: 'triangle' as const, detune: 0 },
                { n: 2, gain: 0.22, type: 'triangle' as const, detune: +0.3 },
                { n: 3, gain: 0.12, type: 'sine' as const, detune: -0.3 },
                { n: 4, gain: 0.05, type: 'sine' as const, detune: 0 },
                { n: 5, gain: 0.02, type: 'sine' as const, detune: 0 }
            ];
        }
        else if (this.timbre === 'upright') {
            // Setup for: 🪵 Classic Wood Upright (沙龙木质立式小钢琴)
            baseDecay = 5.6; 
            B = 0.00042; 
            unisonDetune = 3.6; // Wider wooden beating
            filterStartMult = 4.2;
            filterEndMult = 1.4;
            filterDecay = 1.4;
            hammerPitchOffset = 14; 
            hammerVolMult = 0.44; 
            hammerDecayTime = 0.026; 
            attackSwell = 0.0032;
            
            partialsDef = [
                { n: 1, gain: 0.88, type: 'triangle' as const, detune: -unisonDetune },
                { n: 1, gain: 0.85, type: 'triangle' as const, detune: +unisonDetune }, 
                { n: 2, gain: 0.38, type: 'sawtooth' as const, detune: +0.8 },
                { n: 3, gain: 0.22, type: 'triangle' as const, detune: -0.6 },
                { n: 4, gain: 0.11, type: 'sine' as const, detune: 0 }
            ];
        } 
        else {
            // Setup for: 🌌 Cinematic Ethereal (温暖空灵星空琴)
            baseDecay = 15.0; 
            B = 0.00002; 
            unisonDetune = 1.25;
            filterStartMult = 2.4; 
            filterEndMult = 0.95;
            filterDecay = 4.8;
            hammerPitchOffset = 8;
            hammerVolMult = 0.03; 
            hammerDecayTime = 0.045;
            attackSwell = 0.042; // Soft ambient swell
            
            partialsDef = [
                { n: 1, gain: 1.0, type: 'sine' as const, detune: -unisonDetune },
                { n: 1, gain: 0.85, type: 'sine' as const, detune: +unisonDetune },
                { n: 1, gain: 0.55, type: 'sine' as const, detune: 0 },
                { n: 2, gain: 0.10, type: 'triangle' as const, detune: 0 }
            ];
        }

        masterGain.gain.linearRampToValueAtTime(vel * 0.28, now + attackSwell);

        // Add a Stereo Panner - low notes left, high notes right
        let pannerNode: StereoPannerNode | null = null;
        if (this.ctx.createStereoPanner) {
            pannerNode = this.ctx.createStereoPanner();
            const widthScale = this.timbre === 'ambient' ? 1.6 : this.timbre === 'upright' ? 0.75 : 1.35;
            const panVal = (((keyIndex - 1) / 87.0) * 2.0 - 1.0) * widthScale;
            pannerNode.pan.setValueAtTime(Math.max(-0.85, Math.min(0.85, panVal)), now);
        }

        // Key-dependent filter path
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        
        const filterStart = Math.min(18000, frequency * (filterStartMult + vel * 5.8));
        const filterEnd = Math.min(18000, frequency * (filterEndMult + vel * 0.9));

        filter.frequency.setValueAtTime(filterStart, now);
        filter.frequency.exponentialRampToValueAtTime(filterEnd, now + filterDecay);

        // Exponential register-dependent decay (higher notes decay extremely fast)
        const noteDecay = baseDecay * Math.pow(0.963, keyIndex) + 0.38;

        const oscs: OscillatorNode[] = [];
        const gains: GainNode[] = [];

        partialsDef.forEach(p => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            
            // Calculate stiff string inharmonic frequencies: f = n * f_1 * sqrt(1 + B * n^2)
            const stretch = Math.sqrt(1.0 + B * p.n * p.n);
            const partialFreq = frequency * p.n * stretch;

            osc.type = p.type;
            osc.frequency.setValueAtTime(partialFreq, now);
            osc.detune.setValueAtTime(p.detune, now);

            const g = this.ctx.createGain();
            
            let amplitude = p.gain;
            if (p.n > 1) {
                amplitude = p.gain * (vel * 0.7 + 0.3);
            }
            g.gain.setValueAtTime(amplitude, now);
            
            // Partial damper decay
            const partialDecay = Math.max(0.12, noteDecay / (1.0 + (p.n - 1) * (1.8 - vel * 0.4)));
            g.gain.exponentialRampToValueAtTime(0.0001, now + partialDecay);

            osc.connect(g);
            g.connect(filter);
            osc.start(now);

            oscs.push(osc);
            gains.push(g);
        });

        // Soft Felt Hammer friction noise click burst
        let noiseSource: AudioBufferSourceNode | null = null;
        let noiseGain: GainNode | null = null;
        if (this.hammerNoiseBuffer && this.timbre !== 'ambient') {
            noiseSource = this.ctx.createBufferSource();
            noiseSource.buffer = this.hammerNoiseBuffer;

            const noiseFilter = this.ctx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.setValueAtTime(320 + (keyIndex * hammerPitchOffset), now);
            noiseFilter.Q.setValueAtTime(3.8, now);

            noiseGain = this.ctx.createGain();
            const hammerVol = hammerVolMult * vel;
            noiseGain.gain.setValueAtTime(hammerVol, now);
            
            noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + hammerDecayTime);

            noiseSource.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(filter);
            noiseSource.start(now);
        }

        // Route dry/wet through panner
        if (pannerNode) {
            filter.connect(pannerNode);
            pannerNode.connect(masterGain);
        } else {
            filter.connect(masterGain);
        }
        
        // Connect to master mix
        if (this.masterGainNode) {
            masterGain.connect(this.masterGainNode);
        } else {
            masterGain.connect(this.ctx.destination);
        }

        // Bleed some input into convolved soundboard frame for real cabinet resonance
        if (this.soundboardConvolver) {
            masterGain.connect(this.soundboardConvolver);
        }

        if (!this.activeNodes[keyIndex]) {
            this.activeNodes[keyIndex] = [];
        }

        this.activeNodes[keyIndex].push({
            oscillators: oscs,
            gains,
            filter,
            masterGain,
            panner: pannerNode || undefined,
            noiseSource: noiseSource || undefined,
            noiseGain: noiseGain || undefined,
            startTime: now,
            decayDur: noteDecay
        });
    }

    public triggerRelease(keyIndex: number, forceDamp: boolean = false) {
        const hasDamper = keyIndex < 72;

        if (this.sustainActive && !forceDamp) {
            this.sustainedKeys.add(keyIndex);
            return;
        }

        const nodes = this.activeNodes[keyIndex];
        if (!nodes || nodes.length === 0) return;

        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        nodes.forEach(node => {
            try {
                node.masterGain.gain.cancelScheduledValues(now);
                const currentGain = node.masterGain.gain.value || 0.12;
                node.masterGain.gain.setValueAtTime(currentGain, now);
                
                // Damper cushion extinction speed simulation
                const activeRelease = hasDamper 
                    ? (this.timbre === 'ambient' ? 1.8 : this.timbre === 'upright' ? 0.22 : this.timbre === 'bosendorfer' ? 0.44 : 0.35) 
                    : node.decayDur; // high treble keys ring naturally to completion

                node.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + activeRelease);
                
                setTimeout(() => {
                    this.cleanupNode(node);
                }, (activeRelease * 1000) + 150);
            } catch (e) {}
        });

        delete this.activeNodes[keyIndex];
    }

    private stopNode(keyIndex: number) {
        const nodes = this.activeNodes[keyIndex];
        if (nodes) {
            nodes.forEach(node => this.cleanupNode(node));
            delete this.activeNodes[keyIndex];
        }
    }

    private cleanupNode(node: any) {
        try {
            node.oscillators.forEach((o: any) => { o.stop(); o.disconnect(); });
            node.gains.forEach((g: any) => g.disconnect());
            if (node.noiseSource) {
                node.noiseSource.stop();
                node.noiseSource.disconnect();
            }
            if (node.noiseGain) {
                node.noiseGain.disconnect();
            }
            if (node.panner) {
                node.panner.disconnect();
            }
            node.filter.disconnect();
            node.masterGain.disconnect();
        } catch (e) {}
    }
}

// Programmatic 88 Keys Constructor (Octave 0 - 8)
export const get88Keys = (): PianoKey[] => {
    const keys: PianoKey[] = [];
    
    // Octave 0
    keys.push({ index: 1, name: 'A0', pitchClass: 'A', octave: 0, isBlack: false, frequency: 440 * Math.pow(2, (1 - 49) / 12) });
    keys.push({ index: 2, name: 'A#0', pitchClass: 'A#', octave: 0, isBlack: true, frequency: 440 * Math.pow(2, (2 - 49) / 12) });
    keys.push({ index: 3, name: 'B0', pitchClass: 'B', octave: 0, isBlack: false, frequency: 440 * Math.pow(2, (3 - 49) / 12) });
    
    const notesInOctave = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const blackNotesSet = new Set(['C#', 'D#', 'F#', 'G#', 'A#']);
    
    let keyIndex = 4;
    for (let octave = 1; octave <= 7; octave++) {
        for (let i = 0; i < 12; i++) {
            const pc = notesInOctave[i];
            const isBlack = blackNotesSet.has(pc);
            keys.push({
                index: keyIndex,
                name: `${pc}${octave}`,
                pitchClass: pc,
                octave: octave,
                isBlack,
                frequency: 440 * Math.pow(2, (keyIndex - 49) / 12)
            });
            keyIndex++;
        }
    }
    
    // Octave 8
    keys.push({ index: 88, name: 'C8', pitchClass: 'C', octave: 8, isBlack: false, frequency: 440 * Math.pow(2, (88 - 49) / 12) });
    
    return keys;
};

// Computer Keyboard Map definition centered around Middle C
const COMPUTER_KEY_MAP: { [key: string]: number } = {
    'a': 40, // C4
    'w': 41, // C#4
    's': 42, // D4
    'e': 43, // D#4
    'd': 44, // E4
    'f': 45, // F4
    't': 46, // F#4
    'g': 47, // G4
    'y': 48, // G#4
    'h': 49, // A4
    'u': 50, // A#4
    'j': 51, // B4
    'k': 52, // C5
    'o': 53, // C#5
    'l': 54, // D5
    'p': 55, // D#5
    ';': 56  // E5
};

// Preset Songs Generators
const createTwinkleStardust = () => {
    const notes: { keyIndex: number; time: number; duration: number }[] = [];
    const melody = [
        40, 40, 47, 47, 49, 49, 47,
        45, 45, 44, 44, 42, 42, 40,
        47, 47, 45, 45, 44, 44, 42,
        47, 47, 45, 45, 44, 44, 42,
        40, 40, 47, 47, 49, 49, 47,
        45, 45, 44, 44, 42, 42, 40
    ];
    const bass = [
        28, 28, 35, 35, 37, 37, 35,
        33, 33, 32, 32, 30, 30, 28,
        35, 35, 33, 33, 32, 32, 30,
        35, 35, 33, 33, 32, 32, 30,
        28, 28, 35, 35, 37, 37, 35,
        33, 33, 32, 32, 30, 30, 28
    ];
    let currentTime = 0;
    for (let i = 0; i < melody.length; i++) {
        const isEndPhrase = (i + 1) % 7 === 0;
        const dur = isEndPhrase ? 1.6 : 0.8;
        notes.push({ keyIndex: melody[i], time: currentTime, duration: dur - 0.1 });
        notes.push({ keyIndex: bass[i] - 12, time: currentTime, duration: dur });
        notes.push({ keyIndex: bass[i], time: currentTime, duration: dur });
        currentTime += dur;
    }
    return notes;
};

const createOdeToJoyNotes = () => {
    const notes: { keyIndex: number; time: number; duration: number }[] = [];
    const melody = [
        44, 44, 45, 47, 47, 45, 44, 42, 40, 40, 42, 44, 44, 42, 42,
        44, 44, 45, 47, 47, 45, 44, 42, 40, 40, 42, 44, 42, 40, 40,
        42, 42, 44, 40, 42, 44, 45, 44, 40, 42, 44, 45, 44, 42, 40, 42, 35,
        44, 44, 45, 47, 47, 45, 44, 42, 40, 40, 42, 44, 42, 40, 40
    ];
    const bass = [
        28, 28, 28, 28, 28, 28, 28, 35, 37, 37, 35, 35, 35, 35, 35,
        28, 28, 28, 28, 28, 28, 28, 35, 37, 37, 35, 35, 35, 28, 28,
        35, 35, 28, 28, 35, 35, 35, 28, 28, 35, 35, 35, 28, 35, 37, 35, 35,
        28, 28, 28, 28, 28, 28, 28, 35, 37, 37, 35, 35, 35, 28, 28
    ];
    let currentTime = 0;
    for (let i = 0; i < melody.length; i++) {
        const isEndPhrase = (i + 1) % 15 === 0 || i === 46;
        const dur = isEndPhrase ? 1.4 : 0.7;
        notes.push({ keyIndex: melody[i], time: currentTime, duration: dur - 0.1 });
        notes.push({ keyIndex: bass[i], time: currentTime, duration: dur });
        notes.push({ keyIndex: bass[i] - 12, time: currentTime, duration: dur + 0.2 });
        currentTime += dur;
    }
    return notes;
};

const createForEliseNotes = () => {
    const notes: { keyIndex: number; time: number; duration: number }[] = [];
    const melody = [
        56, 55, 56, 55, 56, 51, 54, 52, 49,
        40, 44, 49, 51,
        44, 48, 51, 52,
        44, 56, 55, 56, 55, 56, 51, 54, 52, 49,
        40, 44, 49, 51,
        44, 52, 51, 49
    ];
    const durMap = [
        0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 1.2,
        0.35, 0.35, 0.35, 1.2,
        0.35, 0.35, 0.35, 1.2,
        0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 1.2,
        0.35, 0.35, 0.35, 1.2,
        0.35, 0.35, 0.35, 1.4
    ];
    let currentTime = 0;
    for (let i = 0; i < melody.length; i++) {
        const dur = durMap[i] || 0.35;
        notes.push({ keyIndex: melody[i], time: currentTime, duration: dur - 0.05 });
        
        if (melody[i] === 49 && i === 8) {
            notes.push({ keyIndex: 25, time: currentTime, duration: 1.8 });
            notes.push({ keyIndex: 32, time: currentTime + 0.15, duration: 1.6 });
            notes.push({ keyIndex: 37, time: currentTime + 0.3, duration: 1.4 });
        }
        if (melody[i] === 51 && i === 12) {
            notes.push({ keyIndex: 28, time: currentTime, duration: 1.8 });
            notes.push({ keyIndex: 35, time: currentTime + 0.15, duration: 1.6 });
            notes.push({ keyIndex: 40, time: currentTime + 0.3, duration: 1.4 });
        }
        if (melody[i] === 52 && i === 16) {
            notes.push({ keyIndex: 23, time: currentTime, duration: 1.8 });
            notes.push({ keyIndex: 30, time: currentTime + 0.15, duration: 1.6 });
            notes.push({ keyIndex: 36, time: currentTime + 0.3, duration: 1.4 }); // G#3
        }
        currentTime += dur;
    }
    return notes;
};

const createCanonInDNotes = () => {
    const notes: { keyIndex: number; time: number; duration: number }[] = [];
    const leftHand = [26, 21, 23, 18, 19, 14, 19, 21];
    const rightHand = [58, 56, 54, 53, 51, 49, 51, 53];
    let currentTime = 0;
    for (let loop = 0; loop < 4; loop++) {
        for (let i = 0; i < 8; i++) {
            const dur = 1.2;
            notes.push({ keyIndex: leftHand[i], time: currentTime, duration: dur });
            notes.push({ keyIndex: leftHand[i] - 12, time: currentTime, duration: dur });
            notes.push({ keyIndex: leftHand[i] + 12, time: currentTime + 0.15, duration: dur - 0.15 });

            if (loop === 0) {
                notes.push({ keyIndex: rightHand[i], time: currentTime, duration: dur - 0.1 });
            } else if (loop === 1) {
                notes.push({ keyIndex: rightHand[i], time: currentTime, duration: 0.6 - 0.05 });
                notes.push({ keyIndex: rightHand[i] - 2, time: currentTime + 0.6, duration: 0.6 - 0.05 });
            } else {
                notes.push({ keyIndex: rightHand[i], time: currentTime, duration: 0.3 - 0.04 });
                notes.push({ keyIndex: rightHand[i] - 1, time: currentTime + 0.3, duration: 0.3 - 0.04 });
                notes.push({ keyIndex: rightHand[i] - 2, time: currentTime + 0.6, duration: 0.3 - 0.04 });
                notes.push({ keyIndex: rightHand[i] - 3, time: currentTime + 0.9, duration: 0.3 - 0.04 });
            }
            currentTime += dur;
        }
    }
    return notes;
};

interface MidiNote {
    keyIndex: number;
    time: number;
    duration: number;
    velocity?: number;
}

// robust dependency-free MIDI binary parsing core
export function parseMidi(arrayBuffer: ArrayBuffer): MidiNote[] {
    const view = new DataView(arrayBuffer);
    let offset = 0;

    if (view.byteLength < 14) return [];
    const headerSig = String.fromCharCode(
        view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3)
    );
    if (headerSig !== 'MThd') {
        console.error('Invalid MIDI header signature:', headerSig);
        return [];
    }

    const headerLength = view.getUint32(4);
    const format = view.getUint16(8);
    const numTracks = view.getUint16(10);
    const division = view.getUint16(12);

    offset = 8 + headerLength;
    if (division & 0x8000) {
        return [];
    }

    const ticksPerBeat = division;

    interface RawEvent {
        tick: number;
        type: 'on' | 'off' | 'tempo';
        pitch?: number;
        velocity?: number;
        tempo?: number;
    }

    const allEvents: RawEvent[] = [];

    const readVLQLocal = (dataView: DataView, offsetTracker: { val: number }): number => {
        let value = 0;
        let byte = 0;
        do {
            if (offsetTracker.val >= dataView.byteLength) break;
            byte = dataView.getUint8(offsetTracker.val);
            offsetTracker.val++;
            value = (value << 7) | (byte & 0x7F);
        } while (byte & 0x80);
        return value;
    };

    for (let t = 0; t < numTracks; t++) {
        if (offset >= view.byteLength) break;
        
        const trackSig = String.fromCharCode(
            view.getUint8(offset), view.getUint8(offset + 1), view.getUint8(offset + 2), view.getUint8(offset + 3)
        );
        if (trackSig !== 'MTrk') {
            offset += 4;
            if (offset < view.byteLength) {
                const trackLen = view.getUint32(offset);
                offset += 4 + trackLen;
            }
            continue;
        }

        const trackLength = view.getUint32(offset + 4);
        const trackEndOffset = offset + 8 + trackLength;
        let trackOffset = offset + 8;
        offset = trackEndOffset;

        let currentTick = 0;
        let runningStatus = 0;

        const offsetRef = { val: trackOffset };

        while (offsetRef.val < trackEndOffset && offsetRef.val < view.byteLength) {
            const deltaTime = readVLQLocal(view, offsetRef);
            currentTick += deltaTime;

            if (offsetRef.val >= trackEndOffset) break;

            let status = view.getUint8(offsetRef.val);
            if (status & 0x80) {
                runningStatus = status;
                offsetRef.val++;
            } else {
                status = runningStatus;
            }

            const command = status & 0xF0;
            const channel = status & 0x0F;

            if (status === 0xFF) {
                const type = view.getUint8(offsetRef.val);
                offsetRef.val++;
                const length = readVLQLocal(view, offsetRef);
                
                if (type === 0x51 && length === 3) {
                    const m0 = view.getUint8(offsetRef.val);
                    const m1 = view.getUint8(offsetRef.val + 1);
                    const m2 = view.getUint8(offsetRef.val + 2);
                    const tempoVal = (m0 << 16) | (m1 << 8) | m2;
                    allEvents.push({
                        tick: currentTick,
                        type: 'tempo',
                        tempo: tempoVal
                    });
                }
                offsetRef.val += length;
            } else if (status === 0xF0 || status === 0xF7) {
                const length = readVLQLocal(view, offsetRef);
                offsetRef.val += length;
            } else {
                if (command === 0x90) {
                    const pitch = view.getUint8(offsetRef.val);
                    const velocity = view.getUint8(offsetRef.val + 1);
                    offsetRef.val += 2;
                    allEvents.push({
                        tick: currentTick,
                        type: velocity > 0 ? 'on' : 'off',
                        pitch,
                        velocity
                    });
                } else if (command === 0x80) {
                    const pitch = view.getUint8(offsetRef.val);
                    const velocity = view.getUint8(offsetRef.val + 1);
                    offsetRef.val += 2;
                    allEvents.push({
                        tick: currentTick,
                        type: 'off',
                        pitch,
                        velocity
                    });
                } else if (command === 0xA0 || command === 0xB0 || command === 0xE0) {
                    offsetRef.val += 2;
                } else if (command === 0xC0 || command === 0xD0) {
                    offsetRef.val += 1;
                } else {
                    offsetRef.val++;
                }
            }
        }
    }

    allEvents.sort((a, b) => a.tick - b.tick);

    let currentTempo = 500000; // 120 BPM default
    let lastTick = 0;
    let lastTime = 0.0;

    const activeNotesIndices: { [pitch: number]: { startTime: number, velocity: number } } = {};
    const parsedNotes: MidiNote[] = [];

    allEvents.forEach(evt => {
        const deltaTicks = evt.tick - lastTick;
        if (deltaTicks > 0) {
            const secondsPerTick = (currentTempo / 1000000.0) / ticksPerBeat;
            lastTime += deltaTicks * secondsPerTick;
            lastTick = evt.tick;
        }

        if (evt.type === 'tempo' && evt.tempo) {
            currentTempo = evt.tempo;
        } else if (evt.type === 'on' && evt.pitch !== undefined) {
            const keyIndex = evt.pitch - 20;
            if (keyIndex >= 1 && keyIndex <= 88) {
                if (activeNotesIndices[evt.pitch]) {
                    const duration = Math.max(0.1, lastTime - activeNotesIndices[evt.pitch].startTime);
                    parsedNotes.push({
                        keyIndex,
                        time: activeNotesIndices[evt.pitch].startTime,
                        duration,
                        velocity: activeNotesIndices[evt.pitch].velocity
                    });
                }
                activeNotesIndices[evt.pitch] = { startTime: lastTime, velocity: evt.velocity || 80 };
            }
        } else if (evt.type === 'off' && evt.pitch !== undefined) {
            const keyIndex = evt.pitch - 20;
            if (keyIndex >= 1 && keyIndex <= 88 && activeNotesIndices[evt.pitch]) {
                const duration = Math.max(0.1, lastTime - activeNotesIndices[evt.pitch].startTime);
                parsedNotes.push({
                    keyIndex,
                    time: activeNotesIndices[evt.pitch].startTime,
                    duration,
                    velocity: activeNotesIndices[evt.pitch].velocity
                });
                delete activeNotesIndices[evt.pitch];
            }
        }
    });

    Object.keys(activeNotesIndices).forEach(pitchStr => {
        const pitch = parseInt(pitchStr);
        const keyIndex = pitch - 20;
        if (keyIndex >= 1 && keyIndex <= 88 && activeNotesIndices[pitch]) {
            const duration = Math.max(0.1, lastTime - activeNotesIndices[pitch].startTime);
            parsedNotes.push({
                keyIndex,
                time: activeNotesIndices[pitch].startTime,
                duration,
                velocity: activeNotesIndices[pitch].velocity
            });
        }
    });

    parsedNotes.sort((a, b) => a.time - b.time);
    return parsedNotes;
}

export const PRESET_SONGS = [
    { id: 'free', title: '自由弹奏 (Free Play)', subtitle: '自由即兴，触碰灵感', composer: 'None', speed: 1.0, notes: [] },
    { id: 'twinkle', title: '小星星 (Twinkle Twinkle)', subtitle: '初学入门的璀璨旋律', composer: 'Traditional', speed: 1.0, notes: createTwinkleStardust() },
    { id: 'ode', title: '欢乐颂 (Ode to Joy)', subtitle: '贝多芬第九交响曲宏伟尾声', composer: 'Ludwig van Beethoven', speed: 1.0, notes: createOdeToJoyNotes() },
    { id: 'elise', title: '致爱丽丝 (Für Elise)', subtitle: '浪漫主义钢琴传世名作', composer: 'Ludwig van Beethoven', speed: 1.1, notes: createForEliseNotes() },
    { id: 'canon', title: '卡农 (Canon in D)', subtitle: '轮奏循环的圣洁与治愈', composer: 'Johann Pachelbel', speed: 1.0, notes: createCanonInDNotes() }
];

interface Piano88PageProps {
    onClose: () => void;
    user: any;
}

export const Piano88Page: React.FC<Piano88PageProps> = ({ onClose, user }) => {
    // Synth initialization
    const synth = useMemo(() => new PianoSynthesizer(), []);

    // Configuration / UI state
    const [selectedSongId, setSelectedSongId] = useState<string>('free');
    const [customSongs, setCustomSongs] = useState<{ id: string; title: string; subtitle: string; composer: string; speed: number; notes: any[] }[]>([]);
    const [activeTimbre, setActiveTimbre] = useState<'grand' | 'yamaha' | 'bosendorfer' | 'upright' | 'ambient'>('grand');
    const [midiToast, setMidiToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false); // 跟弹模式: Wait for correct key strike!
    const [songTimer, setSongTimer] = useState<number>(0);
    const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
    const [volume, setVolume] = useState<number>(0.6);
    const [sustain, setSustain] = useState<boolean>(false);
    const [fontSizeMode, setFontSizeMode] = useState<'all' | 'c-only' | 'none'>('all');
    const [whiteKeyWidth, setWhiteKeyWidth] = useState<number>(42); // Width of each white key (zooms)
    const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());
    const [isInternalFullscreen, setIsInternalFullscreen] = useState<boolean>(true); // Immersive browser fill
    const [midiActive, setMidiActive] = useState<boolean>(false);
    
    // Canvas ref for high-performance visual water flow
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const keyboardScrollRef = useRef<HTMLDivElement | null>(null);

    // Dynamic key coordinates dictionary computed programmatically
    const keys = useMemo(() => get88Keys(), []);
    const keyPositions = useMemo(() => {
        const positions: { [keyIndex: number]: { left: number; width: number; isBlack: boolean } } = {};
        let currentWhiteIndex = 0;
        
        // Step 1: Map all white keys
        keys.forEach((key) => {
            if (!key.isBlack) {
                positions[key.index] = {
                    left: currentWhiteIndex * whiteKeyWidth,
                    width: whiteKeyWidth,
                    isBlack: false
                };
                currentWhiteIndex++;
            }
        });

        // Step 2: Overlay black keys dynamically
        const blackKeyWidth = whiteKeyWidth * 0.6;
        keys.forEach((key) => {
            if (key.isBlack) {
                const leftNeighbor = keys.find(k => k.index === key.index - 1 && !k.isBlack);
                if (leftNeighbor) {
                    const leftPos = positions[leftNeighbor.index];
                    const center = leftPos.left + leftPos.width;
                    positions[key.index] = {
                        left: Math.round(center - blackKeyWidth / 2),
                        width: Math.round(blackKeyWidth),
                        isBlack: true
                    };
                } else {
                    positions[key.index] = { left: 0, width: blackKeyWidth, isBlack: true };
                }
            }
        });

        return positions;
    }, [whiteKeyWidth, keys]);

    const allAvailableSongs = useMemo(() => {
        return [...customSongs, ...PRESET_SONGS];
    }, [customSongs]);

    const activeSong = useMemo(() => {
        return allAvailableSongs.find(s => s.id === selectedSongId) || PRESET_SONGS[0];
    }, [selectedSongId, allAvailableSongs]);

    // Handle user binary MIDI file upload import
    const handleMidiImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const arrayBuffer = await file.arrayBuffer();
            const parsedNotes = parseMidi(arrayBuffer);
            if (parsedNotes.length === 0) {
                setMidiToast({
                    text: '⚠️ 解析失败：未在该 MIDI 文件中找到任何可以对应钢琴键盘的音符音阶。请确保文件是标准的标准 MIDI 文件 (拥有 .mid 扩展名)。',
                    type: 'error'
                });
                return;
            }

            const cleanFileName = file.name.replace(/\.[^/.]+$/, ""); // Strip file extension
            const newSongId = `custom_${Date.now()}`;
            
            const newSong = {
                id: newSongId,
                title: `📂 ${cleanFileName}`,
                subtitle: `自定义 MIDI 导入 • 共 ${parsedNotes.length} 个音高音符`,
                composer: '自定义导入',
                speed: 1.0,
                notes: parsedNotes
            };

            setCustomSongs(prev => [newSong, ...prev]);
            setSelectedSongId(newSongId);
            setIsPlaying(false);
            
            // Re-sync piano states
            setTimeout(() => {
                songTimerRef.current = 0;
                songTriggeredKeysRef.current.clear();
                setSongTimer(0);
                setActiveKeys(new Set());
            }, 80);

            setMidiToast({
                text: `🎉 MIDI《${cleanFileName}》导入成功！已提取出 ${parsedNotes.length} 个按键时序。你可以随时启动“瀑布跟弹”或“自动弹奏”！`,
                type: 'success'
            });

        } catch (err) {
            console.error('Error importing MIDI file:', err);
            setMidiToast({
                text: '❌ 导入 MIDI 文件时出错，请尝试重新保存为标准 MIDI 0 级或 1 级格式。',
                type: 'error'
            });
        }
    };

    // Auto fadeout importer notifications
    useEffect(() => {
        if (midiToast) {
            const timer = setTimeout(() => {
                setMidiToast(null);
            }, 4200);
            return () => clearTimeout(timer);
        }
    }, [midiToast]);

    // Active keys being printed / struck by song
    const songTriggeredKeysRef = useRef<Set<number>>(new Set());

    // Particles and Halos
    const particlesRef = useRef<HitParticle[]>([]);
    const halosRef = useRef<KeyHalo[]>([]);

    // Timer refs
    const songTimerRef = useRef<number>(0);
    const requestRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number | null>(null);

    // Sound volume syncing
    useEffect(() => {
        synth.setVolume(volume);
    }, [volume, synth]);

    useEffect(() => {
        synth.setSustain(sustain);
    }, [sustain, synth]);

    useEffect(() => {
        synth.setTimbre(activeTimbre);
    }, [activeTimbre, synth]);

    // Key triggering functions
    const playNote = (keyIndex: number, velocity: number = 0.82) => {
        const key = keys.find(k => k.index === keyIndex);
        if (!key) return;
        
        synth.triggerAttack(keyIndex, key.frequency, velocity);
        setActiveKeys(prev => {
            const next = new Set(prev);
            next.add(keyIndex);
            return next;
        });

        // Trigger particles inside animation loop
        spawnVisuals(keyIndex);
    };

    const stopNote = (keyIndex: number) => {
        synth.triggerRelease(keyIndex);
        setActiveKeys(prev => {
            const next = new Set(prev);
            next.delete(keyIndex);
            return next;
        });
    };

    // Particles/Halo Spawners
    const spawnVisuals = (keyIndex: number) => {
        const pos = keyPositions[keyIndex];
        if (!pos || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctxWidth = canvas.width;
        // Map relative width inside scrolled container to absolute canvas pixels
        const totalWhiteKeys = 52;
        const canvasVirtualWidth = totalWhiteKeys * whiteKeyWidth;
        
        // Calculate coordinate relative to virtual full width
        const relativeX = pos.left + pos.width / 2;
        const renderScale = canvas.width / canvasVirtualWidth;
        const actualX = relativeX * renderScale;
        const actualY = canvas.height;

        const color = pos.isBlack ? '#f59e0b' : '#3b82f6'; // Yellow/Cyan accent sparkles

        // Spawn particles
        for (let i = 0; i < 12; i++) {
            particlesRef.current.push({
                id: Math.random(),
                x: actualX,
                y: actualY - 6,
                vx: (Math.random() - 0.5) * 5,
                vy: -Math.random() * 6 - 2,
                color,
                size: Math.random() * 4 + 2,
                alpha: 1.0,
                life: 1.0
            });
        }

        // Spawn glowing sound wave halo
        halosRef.current.push({
            id: Math.random(),
            keyIndex,
            x: actualX,
            y: actualY,
            radius: 5,
            maxRadius: 45,
            alpha: 1.0,
            color
        });
    };

    // Computer Keyboard Key Bindings
    useEffect(() => {
        const activeBinds: { [key: string]: number } = {};

        const handleKeyDown = (e: KeyboardEvent) => {
            // Avoid triggering when user types into standard inputs (if any)
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            
            const keyChar = e.key.toLowerCase();
            if (COMPUTER_KEY_MAP[keyChar] && !activeBinds[keyChar]) {
                const targetKeyIndex = COMPUTER_KEY_MAP[keyChar];
                activeBinds[keyChar] = targetKeyIndex;
                playNote(targetKeyIndex);
            }

            // Spacebar play-pause song shortcut
            if (e.key === ' ') {
                e.preventDefault();
                setIsPlaying(prev => !prev);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const keyChar = e.key.toLowerCase();
            if (activeBinds[keyChar]) {
                const targetKeyIndex = activeBinds[keyChar];
                stopNote(targetKeyIndex);
                delete activeBinds[keyChar];
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [keyPositions, keys]);

    // MIDI Keyboard Support! Connect real instruments over USB
    useEffect(() => {
        if (!navigator.requestMIDIAccess) return;

        let midiAccess: any = null;

        const onMidiMessage = (message: any) => {
            const command = message.data[0] & 0xf0;
            const noteNumber = message.data[1];
            const velocity = message.data[2];

            // MIDI pitch 21 is A0, which translates exactly to keyIndex = 1
            // pitch 108 is C8, translating exactly to keyIndex = 88
            const keyIndex = noteNumber - 20;

            if (keyIndex >= 1 && keyIndex <= 88) {
                if (command === 144 && velocity > 0) {
                    // Note on
                    playNote(keyIndex);
                } else if (command === 128 || (command === 144 && velocity === 0)) {
                    // Note off
                    stopNote(keyIndex);
                }
            }
        };

        navigator.requestMIDIAccess()
            .then((access) => {
                midiAccess = access;
                setMidiActive(true);
                for (let input of access.inputs.values()) {
                    input.onmidimessage = onMidiMessage;
                }
                
                access.onstatechange = (e: any) => {
                    if (e.port.type === 'input') {
                        e.port.onmidimessage = onMidiMessage;
                    }
                };
            })
            .catch(() => {
                setMidiActive(false);
            });

        return () => {
            if (midiAccess) {
                for (let input of midiAccess.inputs.values()) {
                    input.onmidimessage = null;
                }
                midiAccess.onstatechange = null;
            }
        };
    }, [keyPositions]);

    // Track state of completed Practice mode correct notes
    const [correctPracticedKeys, setCorrectPracticedKeys] = useState<Set<number>>(new Set());

    // Waterfall and Sound synthesis synchronization Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Synchronize drawing sizes based on display sizes
        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * (window.devicePixelRatio || 1);
            canvas.height = rect.height * (window.devicePixelRatio || 1);
        };
        resizeCanvas();

        const observer = new ResizeObserver(() => {
            resizeCanvas();
        });
        if (canvas.parentElement) {
            observer.observe(canvas.parentElement);
        }

        const keysInSong = activeSong.notes;
        const totalWhiteKeys = 52;

        const renderFrame = (timestamp: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = timestamp;
            const delta = (timestamp - lastTimeRef.current) / 1000;
            lastTimeRef.current = timestamp;

            const currentCanvasWidth = canvas.width;
            const currentCanvasHeight = canvas.height;
            ctx.clearRect(0, 0, currentCanvasWidth, currentCanvasHeight);

            // Speed parameters mapping waterfall pixels zoom heights
            const pixelsPerSecond = 140; 
            const canvasVirtualWidth = totalWhiteKeys * whiteKeyWidth;
            const horizontalScale = currentCanvasWidth / canvasVirtualWidth;

            // Subtle standard channel guidelines for all keys
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
            ctx.lineWidth = 1;
            keys.forEach(k => {
                if (!k.isBlack) {
                    const pos = keyPositions[k.index];
                    if (pos) {
                        const lineX = pos.left * horizontalScale;
                        ctx.beginPath();
                        ctx.moveTo(lineX, 0);
                        ctx.lineTo(lineX, currentCanvasHeight);
                        ctx.stroke();
                    }
                }
            });

            // Draw Octave guideline separators in background
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
            ctx.lineWidth = 1.2;
            keys.forEach(k => {
                if (k.name.startsWith('C') && !k.isBlack) {
                    const pos = keyPositions[k.index];
                    if (pos) {
                        const lineX = pos.left * horizontalScale;
                        ctx.beginPath();
                        ctx.moveTo(lineX, 0);
                        ctx.lineTo(lineX, currentCanvasHeight);
                        ctx.stroke();

                        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
                        ctx.font = '10px monospace';
                        ctx.fillText(`${k.name}`, lineX + 6, 16);
                    }
                }
            });

            // Active glowing laser/hologram columns rising up from active buttons
            activeKeys.forEach(activeKeyIdx => {
                const pos = keyPositions[activeKeyIdx];
                if (pos) {
                    const rectLeft = pos.left * horizontalScale;
                    const rectWidth = pos.width * horizontalScale;
                    
                    ctx.save();
                    const activeGrad = ctx.createLinearGradient(rectLeft + rectWidth / 2, currentCanvasHeight, rectLeft + rectWidth / 2, 0);
                    // Match cyan/blue for white keys and gold/amber for black keys
                    const isBlack = keys.find(k => k.index === activeKeyIdx)?.isBlack;
                    const colorPrefix = isBlack ? 'rgba(245, 158, 11, ' : 'rgba(59, 130, 246, ';
                    
                    activeGrad.addColorStop(0, colorPrefix + '0.15)');
                    activeGrad.addColorStop(0.3, colorPrefix + '0.06)');
                    activeGrad.addColorStop(1, colorPrefix + '0.00)');
                    
                    ctx.fillStyle = activeGrad;
                    ctx.fillRect(rectLeft, 0, rectWidth, currentCanvasHeight);
                    ctx.restore();
                }
            });

            // Handle Song Progression
            if (activeSong.id !== 'free') {
                // Determine notes that are currently falling or coming soon
                const lookAheadWindow = 5.0; // Show notes 5 seconds ahead
                const visibleNotes = keysInSong.filter(note => {
                    const noteEnd = note.time + note.duration;
                    return noteEnd >= songTimerRef.current && note.time <= songTimerRef.current + lookAheadWindow;
                });

                // Find if there is a note currently hitting the keyboard hit line that isn't pressed yet
                let shouldPauseForPractice = false;
                let activeNoteGroupIdx: number[] = [];

                if (isPracticeMode) {
                    // Practice mode check: Pause the waterfall feed if any note is crossing the bottom line (0.1s threshold)
                    // and has not yet been physically tapped/played by user
                    const practiceThreshold = songTimerRef.current;
                    const criticalPlayingNotes = keysInSong.filter(note => {
                        // If notes are scheduled to play at or before current practice timer
                        return note.time <= practiceThreshold && (note.time + note.duration) >= practiceThreshold;
                    });

                    if (criticalPlayingNotes.length > 0) {
                        activeNoteGroupIdx = criticalPlayingNotes.map(n => n.keyIndex);
                        // Check if user has pressed all keys in this group
                        const missingKeys = activeNoteGroupIdx.filter(idx => !activeKeys.has(idx));
                        if (missingKeys.length > 0) {
                            shouldPauseForPractice = true;
                            // Add glowing highlight indicators next to keyboard notes for practice
                            setCorrectPracticedKeys(new Set(activeNoteGroupIdx));
                        } else {
                            // Clear training highlights if pressed!
                            setCorrectPracticedKeys(new Set());
                        }
                    } else {
                        setCorrectPracticedKeys(new Set());
                    }
                }

                // Smooth timer ticking when NOT paused for practice
                if (isPlaying) {
                    if (!shouldPauseForPractice) {
                        songTimerRef.current += delta * playbackSpeed;
                        setSongTimer(songTimerRef.current);
                    }
                }

                // RENDER FALLING WATERFALL NOTES
                visibleNotes.forEach(note => {
                    const pos = keyPositions[note.keyIndex];
                    if (!pos) return;

                    const rectWidth = pos.width * horizontalScale;
                    const rectX = pos.left * horizontalScale;

                    // Calculate Y coordinates according to song timer
                    // Distance from hit line is determined by (notes.time - current_playing_time)
                    const pixelsToBottom = currentCanvasHeight;
                    const noteStartOffset = note.time - songTimerRef.current;
                    const noteEndOffset = (note.time + note.duration) - songTimerRef.current;

                    const yStart = pixelsToBottom - (noteEndOffset * pixelsPerSecond);
                    const yEnd = pixelsToBottom - (noteStartOffset * pixelsPerSecond);
                    const rectHeight = yEnd - yStart;

                    // Trigger sound & hits when note encounters the hit line (bottom) in Auto-Play mode
                    const hasCrossedHitLine = noteStartOffset <= 0 && noteEndOffset > 0;
                    if (hasCrossedHitLine) {
                        if (!songTriggeredKeysRef.current.has(note.keyIndex)) {
                            // Hit registry! Start playing if Auto-play mode is active
                            songTriggeredKeysRef.current.add(note.keyIndex);
                            if (!isPracticeMode) {
                                const finalVel = note.velocity !== undefined ? note.velocity / 127.0 : 0.8;
                                synth.triggerAttack(note.keyIndex, keys.find(k => k.index === note.keyIndex)!.frequency, finalVel);
                                setActiveKeys(prev => {
                                    const next = new Set(prev);
                                    next.add(note.keyIndex);
                                    return next;
                                });
                                spawnVisuals(note.keyIndex);
                            }
                        }
                        // Continuous glowing flow particles representing strings active vibrations!
                        if (Math.random() < 0.28) {
                            const pos = keyPositions[note.keyIndex];
                            if (pos) {
                                const renderScale = currentCanvasWidth / canvasVirtualWidth;
                                const actualX = (pos.left + pos.width * Math.random()) * renderScale;
                                const color = pos.isBlack ? '#f59e0b' : '#3b82f6';
                                particlesRef.current.push({
                                    id: Math.random(),
                                    x: actualX,
                                    y: currentCanvasHeight - 6,
                                    vx: (Math.random() - 0.5) * 3.2,
                                    vy: -Math.random() * 5 - 2.5,
                                    color,
                                    size: Math.random() * 2.8 + 1.2,
                                    alpha: 0.9,
                                    life: 1.0
                                });
                            }
                        }
                    } else if (noteEndOffset < 0) {
                        // Release when the note completely scrolls past bottom keyboard limit
                        if (songTriggeredKeysRef.current.has(note.keyIndex)) {
                            songTriggeredKeysRef.current.delete(note.keyIndex);
                            if (!isPracticeMode) {
                                synth.triggerRelease(note.keyIndex);
                                setActiveKeys(prev => {
                                    const next = new Set(prev);
                                    next.delete(note.keyIndex);
                                    return next;
                                });
                            }
                        }
                    }

                    // DRAW BEAUTIFUL NEON WATERFALL ROUNDED RECT
                    if (yStart < currentCanvasHeight) {
                        ctx.save();
                        
                        // Radiant gradient styled block
                        const noteGrad = ctx.createLinearGradient(rectX, yStart, rectX, yStart + rectHeight);
                        if (note.isBlack) {
                            noteGrad.addColorStop(0, '#f59e0b');
                            noteGrad.addColorStop(1, '#d97706');
                            ctx.shadowColor = '#f59e0b';
                        } else {
                            noteGrad.addColorStop(0, '#60a5fa');
                            noteGrad.addColorStop(1, '#2563eb');
                            ctx.shadowColor = '#2563eb';
                        }

                        // Glow trial trail on strike!
                        if (hasCrossedHitLine) {
                            ctx.shadowBlur = 24;
                        } else {
                            ctx.shadowBlur = 8;
                        }

                        ctx.fillStyle = noteGrad;
                        
                        // Round rectangle path
                        const r = Math.min(6, rectWidth / 2);
                        ctx.beginPath();
                        ctx.moveTo(rectX + r, yStart);
                        ctx.lineTo(rectX + rectWidth - r, yStart);
                        ctx.quadraticCurveTo(rectX + rectWidth, yStart, rectX + rectWidth, yStart + r);
                        ctx.lineTo(rectX + rectWidth, yStart + rectHeight - r);
                        ctx.quadraticCurveTo(rectX + rectWidth, yStart + rectHeight, rectX + rectWidth - r, yStart + rectHeight);
                        ctx.lineTo(rectX + r, yStart + rectHeight);
                        ctx.quadraticCurveTo(rectX, yStart + rectHeight, rectX, yStart + rectHeight - r);
                        ctx.lineTo(rectX, yStart + r);
                        ctx.quadraticCurveTo(rectX, yStart, rectX + r, yStart);
                        ctx.closePath();
                        ctx.fill();

                        // 3D Glass volumetric shimmer cylinders overlay
                        ctx.save();
                        ctx.shadowBlur = 0; // Keep the reflection laser-sharp
                        const shineGrad = ctx.createLinearGradient(rectX, yStart, rectX + rectWidth, yStart);
                        shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.32)');
                        shineGrad.addColorStop(0.22, 'rgba(255, 255, 255, 0.10)');
                        shineGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.0)');
                        shineGrad.addColorStop(0.78, 'rgba(0, 0, 0, 0.02)');
                        shineGrad.addColorStop(1, 'rgba(0, 0, 0, 0.22)'); // Glass depth shadow edge

                        ctx.fillStyle = shineGrad;
                        ctx.beginPath();
                        ctx.moveTo(rectX + r, yStart + 0.8);
                        ctx.lineTo(rectX + rectWidth - r, yStart + 0.8);
                        ctx.quadraticCurveTo(rectX + rectWidth - 0.8, yStart + 0.8, rectX + rectWidth - 0.8, yStart + r);
                        ctx.lineTo(rectX + rectWidth - 0.8, yStart + rectHeight - r);
                        ctx.quadraticCurveTo(rectX + rectWidth - 0.8, yStart + rectHeight - 0.8, rectX + rectWidth - r, yStart + rectHeight - 0.8);
                        ctx.lineTo(rectX + r, yStart + rectHeight - 0.8);
                        ctx.quadraticCurveTo(rectX + 0.8, yStart + rectHeight - 0.8, rectX + 0.8, yStart + rectHeight - r);
                        ctx.lineTo(rectX + 0.8, yStart + r);
                        ctx.quadraticCurveTo(rectX + 0.8, yStart + 0.8, rectX + r, yStart + 0.8);
                        ctx.closePath();
                        ctx.fill();
                        ctx.restore();

                        // Highlights on Practice notes
                        if (isPracticeMode && yEnd >= currentCanvasHeight - 12 && yStart <= currentCanvasHeight) {
                            ctx.strokeStyle = '#ffffff';
                            ctx.lineWidth = 2.5;
                            ctx.shadowColor = '#ffffff';
                            ctx.shadowBlur = 10;
                            ctx.stroke();
                        }

                        ctx.restore();
                    }
                });

                // End of song automatic loop reset check
                const lastNote = keysInSong[keysInSong.length - 1];
                if (lastNote && songTimerRef.current > lastNote.time + lastNote.duration + 2.5) {
                    // Restar playback
                    songTimerRef.current = 0;
                    songTriggeredKeysRef.current.clear();
                    setActiveKeys(new Set());
                }
            }

            // PARTICLES UPDATES
            particlesRef.current.forEach((p, index) => {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= delta * 1.5;
                p.vy += delta * 1.8; // gravity drop velocity
                
                if (p.alpha <= 0) {
                    particlesRef.current.splice(index, 1);
                } else {
                    ctx.save();
                    ctx.globalAlpha = p.alpha;
                    ctx.shadowBlur = 4;
                    ctx.shadowColor = p.color;
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            });

            // HALOS (GLOW RING EXPANSIONS) UPDATES
            halosRef.current.forEach((h, index) => {
                h.radius += delta * 70;
                h.alpha -= delta * 1.6;

                if (h.alpha <= 0 || h.radius >= h.maxRadius) {
                    halosRef.current.splice(index, 1);
                } else {
                    ctx.save();
                    ctx.globalAlpha = h.alpha;
                    ctx.strokeStyle = h.color;
                    ctx.lineWidth = 3;
                    ctx.shadowBlur = 12;
                    ctx.shadowColor = h.color;
                    
                    ctx.beginPath();
                    // Draw elliptical strike ring reflecting mechanical physical keys
                    ctx.ellipse(h.x, h.y, h.radius * 1.4, h.radius * 0.4, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }
            });

            // Render keyboard strike separator line at exact bottom
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.fillRect(0, currentCanvasHeight - 4, currentCanvasWidth, 4);

            requestRef.current = requestAnimationFrame(renderFrame);
        };

        requestRef.current = requestAnimationFrame(renderFrame);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            observer.disconnect();
        };
    }, [activeSong, whiteKeyWidth, keyPositions, isPlaying, isPracticeMode, keys, activeKeys, playbackSpeed]);

    // Restart playback trigger
    const restartSong = () => {
        songTimerRef.current = 0;
        songTriggeredKeysRef.current.clear();
        setSongTimer(0);
        setActiveKeys(new Set());
    };

    // Quick jump octaves scroll assistant
    const jumpToOctave = (oct: number) => {
        const keyboard = keyboardScrollRef.current;
        if (!keyboard) return;

        // Find coordinate of the middle C or desired octave white key
        const octKey = keys.find(k => k.octave === oct && !k.isBlack);
        if (octKey) {
            const pos = keyPositions[octKey.index];
            if (pos) {
                keyboard.scrollTo({
                    left: pos.left - keyboard.clientWidth / 2 + pos.width / 2,
                    behavior: 'smooth'
                });
            }
        }
    };

    // Keyboard Zoom actions (whiteWidth bounds 18px to 95px)
    const zoomInKeys = () => setWhiteKeyWidth(p => Math.min(90, p + 4));
    const zoomOutKeys = () => setWhiteKeyWidth(p => Math.max(18, p - 4));

    // Exit and cleanup logic
    const handleExit = () => {
        // Damping any playing oscillators
        keys.forEach(k => synth.triggerRelease(k.index, true));
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="fixed inset-0 z-[160] flex flex-col bg-stone-950 text-stone-100 overflow-hidden select-none"
            >
                {/* Immersive Concert Glow Elements */}
                <div className="absolute top-0 left-1/4 w-[50%] h-[30%] bg-blue-500/10 blur-[140px] pointer-events-none rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-[40%] h-[40%] bg-amber-500/5 blur-[160px] pointer-events-none rounded-full" />

                {/* --- MIDI TOAST NOTIFICATION --- */}
                <AnimatePresence>
                    {midiToast && (
                        <motion.div
                            initial={{ opacity: 0, y: -45, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -25, scale: 0.9 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[300] px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl text-xs font-medium max-w-md ${
                                midiToast.type === 'success' 
                                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/30 shadow-emerald-950/40' 
                                    : 'bg-stone-900/95 text-stone-200 border-amber-500/30 shadow-amber-950/40'
                            }`}
                        >
                            <span className="text-sm">{midiToast.type === 'success' ? '✨' : '⚠️'}</span>
                            <p className="flex-1 leading-relaxed text-left">{midiToast.text}</p>
                            <button 
                                onClick={() => setMidiToast(null)} 
                                className="hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                ✕
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- 1. TOP HEADER CONTROL PANEL --- */}
                <header className="px-5 py-4.5 bg-stone-900/90 backdrop-blur-md border-b border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleExit}
                            className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 hover:text-white border border-stone-700/60 shadow-lg transition-colors flex items-center justify-center cursor-pointer"
                            title="返回理论主页"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="bg-amber-400 p-1.5 rounded-lg text-stone-950 font-bold flex items-center gap-1 shadow-md">
                                    <Radio className="animate-pulse" size={13} />
                                    <span className="text-[9px] font-mono tracking-widest uppercase">88 Keys Stage</span>
                                </span>
                                {midiActive && (
                                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                                        <Zap size={9} fill="currentColor" /> MIDI OK
                                    </span>
                                )}
                            </div>
                            <h2 className="text-base font-bold font-serif leading-none mt-1 text-white">
                                钢琴大师全屏演奏室
                            </h2>
                        </div>
                    </div>

                    {/* Controls Center Grid */}
                    <div className="flex flex-wrap items-center gap-3 md:gap-4.5">
                        {/* Import Custom MIDI */}
                        <label className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-stone-950 transition-all shadow-md cursor-pointer">
                            <ListMusic size={13.5} />
                            <span>导入 MIDI</span>
                            <input 
                                type="file" 
                                accept=".mid,.midi" 
                                onChange={handleMidiImport} 
                                className="hidden" 
                            />
                        </label>

                        {/* Song Selector */}
                        <div className="flex items-center gap-2 bg-stone-800/80 p-1 rounded-xl border border-stone-700/70">
                            <span className="p-1.5 text-stone-400"><Music size={14} /></span>
                            <select 
                                value={selectedSongId}
                                onChange={e => {
                                    setSelectedSongId(e.target.value);
                                    setIsPlaying(false);
                                    setTimeout(() => restartSong(), 50);
                                }}
                                className="bg-transparent border-none text-xs font-bold text-stone-100 outline-none pr-3 py-1 cursor-pointer"
                            >
                                {allAvailableSongs.map(song => (
                                    <option key={song.id} value={song.id} className="bg-stone-900 text-stone-200">
                                        {song.title} {song.composer !== 'None' ? ` - ${song.composer}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Piano Timbre Selector */}
                        <div className="flex items-center gap-2 bg-stone-800/80 p-1 rounded-xl border border-stone-700/70 animate-fade-in">
                            <span className="p-1.5 text-amber-300"><Music size={14} className="animate-pulse" /></span>
                            <select 
                                value={activeTimbre}
                                onChange={e => {
                                    const val = e.target.value as 'grand' | 'yamaha' | 'bosendorfer' | 'upright' | 'ambient';
                                    setActiveTimbre(val);
                                }}
                                className="bg-transparent border-none text-xs font-bold text-stone-100 outline-none pr-3 py-1 cursor-pointer"
                                title="切换声学钢琴音色特点（配备自研实木音板共鸣卷积模拟）"
                            >
                                <option value="grand" className="bg-stone-900 text-stone-200">🎹 施坦威顶级大三角 (Steinway Grand)</option>
                                <option value="yamaha" className="bg-stone-900 text-stone-200">⚡ 雅马哈明亮录音琴 (Yamaha Bright)</option>
                                <option value="bosendorfer" className="bg-stone-900 text-stone-200">👑 贝森朵夫帝国大三角 (Imperial Grand)</option>
                                <option value="upright" className="bg-stone-900 text-stone-200">🪵 典雅沙龙立式木质琴 (Vintage Upright)</option>
                                <option value="ambient" className="bg-stone-900 text-stone-200">🌌 温暖空灵梦幻星空 (Ethereal Ambient)</option>
                            </select>
                        </div>

                        {/* Song Actions: Only render when not free play */}
                        {activeSong.id !== 'free' && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className={`px-4.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${isPlaying ? 'bg-amber-400 text-stone-950 hover:bg-amber-300' : 'bg-stone-800 hover:bg-stone-700 text-white'}`}
                                >
                                    {isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                                    <span>{isPlaying ? '暂停' : '自动弹奏'}</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setIsPracticeMode(!isPracticeMode);
                                        restartSong();
                                    }}
                                    className={`px-4.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border shadow-md cursor-pointer ${isPracticeMode ? 'bg-blue-600 border-blue-500 text-white shadow-blue-600/20' : 'bg-stone-800 border-stone-700 hover:bg-stone-700'}`}
                                    title="根据瀑布流高亮跟奏，错音暂停"
                                >
                                    <Sparkles size={13} className={isPracticeMode ? "animate-spin" : ""} style={{ animationDuration: '4s' }} />
                                    <span>{isPracticeMode ? '瀑布跟弹中' : '启动跟弹练习'}</span>
                                </button>

                                <button
                                    onClick={restartSong}
                                    className="p-2 bg-stone-800 hover:bg-stone-700 rounded-xl text-stone-400 hover:text-white transition-colors cursor-pointer"
                                    title="重新播放"
                                >
                                    <RotateCcw size={14} />
                                </button>
                            </div>
                        )}

                        {/* Divider */}
                        <div className="h-5 w-px bg-stone-800 hidden lg:block" />

                        {/* Volume Adjuster */}
                        <div className="flex items-center gap-2 bg-stone-800/50 px-3 py-1.5 rounded-xl border border-stone-800">
                            <Volume2 size={13} className="text-stone-400" />
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.05"
                                value={volume} 
                                onChange={e => setVolume(parseFloat(e.target.value))}
                                className="w-16 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-400" 
                            />
                        </div>

                        {/* Sustain Pedal Ring */}
                        <button
                            onClick={() => setSustain(!sustain)}
                            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${sustain ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-stone-800/40 border-stone-800 text-stone-400 hover:border-stone-700'}`}
                        >
                            <Power size={11} />
                            <span>SUSTAIN {sustain ? 'ON' : 'OFF'}</span>
                        </button>
                    </div>
                </header>

                {/* Quick Octave Navigator / Zoom Rail */}
                <div className="px-5 py-2.5 bg-stone-900 border-b border-stone-850 flex flex-wrap justify-between items-center gap-3 z-10">
                    <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-bold font-mono text-stone-500 tracking-wider">音区快捷跳转:</span>
                        {[
                            { label: '倍低一 (A0)', oct: 0 },
                            { label: '大字组 (C2)', oct: 2 },
                            { label: '小字组 (C3)', oct: 3 },
                            { label: '中音区 (C4)', oct: 4 },
                            { label: '高音区 (C5)', oct: 5 },
                            { label: '小字三 (C6)', oct: 6 },
                            { label: '小字五 (C8)', oct: 8 },
                        ].map(def => (
                            <button
                                key={def.oct}
                                onClick={() => jumpToOctave(def.oct)}
                                className="px-2.5 py-1 rounded-lg text-[10.5px] font-medium bg-stone-800/60 hover:bg-stone-750 text-stone-300 hover:text-white transition-colors cursor-pointer"
                            >
                                {def.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Zoom keys Width controllers */}
                        <div className="flex items-center gap-1.5 bg-stone-800/50 p-1 rounded-xl">
                            <button onClick={zoomOutKeys} className="p-1.5 rounded-lg hover:bg-stone-700 text-stone-400 hover:text-white cursor-pointer" title="缩小键盘"><ZoomOut size={12} /></button>
                            <span className="text-[10px] font-bold font-mono px-1 select-none text-stone-400">键宽 Zoom</span>
                            <button onClick={zoomInKeys} className="p-1.5 rounded-lg hover:bg-stone-700 text-stone-400 hover:text-white cursor-pointer" title="放大键盘"><ZoomIn size={12} /></button>
                        </div>

                        {/* Font display modes */}
                        <div className="flex items-center gap-1.5 bg-stone-800/50 p-1 rounded-xl">
                            <button 
                                onClick={() => setFontSizeMode('all')} 
                                className={`px-2 py-1 rounded-lg text-[9px] font-bold tracking-wide transition-colors cursor-pointer ${fontSizeMode==='all'?'bg-amber-400 text-stone-900':'text-stone-400 hover:text-white'}`}
                            >
                                标全音符
                            </button>
                            <button 
                                onClick={() => setFontSizeMode('c-only')} 
                                className={`px-2 py-1 rounded-lg text-[9px] font-bold tracking-wide transition-colors cursor-pointer ${fontSizeMode==='c-only'?'bg-amber-400 text-stone-900':'text-stone-400 hover:text-white'}`}
                            >
                                仅标C音
                            </button>
                            <button 
                                onClick={() => setFontSizeMode('none')} 
                                className={`px-2 py-1 rounded-lg text-[9px] font-bold tracking-wide transition-colors cursor-pointer ${fontSizeMode==='none'?'bg-amber-400 text-stone-900':'text-stone-400 hover:text-white'}`}
                            >
                                无键标
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- 2. INTERACTIVE STAGE & WATERFALL CANVAS --- */}
                <div className="flex-1 min-h-0 bg-stone-950 flex flex-col relative w-full overflow-hidden">
                    
                    {/* The Full Width Scroll wrapper for Canvas + Keyboard */}
                    <div 
                        ref={keyboardScrollRef}
                        className="flex-1 w-full overflow-x-auto overflow-y-hidden custom-scrollbar relative flex flex-col"
                    >
                        {/* Renderable inner space spanning exact full physical width of 52 white keys */}
                        <div 
                            className="flex-1 flex flex-col relative min-h-full"
                            style={{ width: `${52 * whiteKeyWidth}px` }}
                        >
                            {/* Falling Notes Canvas Container */}
                            <div className="flex-1 relative w-full h-full">
                                <canvas 
                                    ref={canvasRef} 
                                    className="absolute inset-0 w-full h-full z-0 block pointer-events-none"
                                />
                                
                                {/* Overlay current song info inside canvas */}
                                {activeSong.id !== 'free' && (
                                    <div className="absolute top-6 left-6 z-10 p-5 rounded-2xl bg-stone-900/40 backdrop-blur-md border border-white/5 pointer-events-none text-left select-none animate-fadeIn">
                                        <span className="text-[9px] font-mono font-black text-amber-500 uppercase tracking-widest leading-none">WATERFALL PRACTICE RECOGNIZED</span>
                                        <h3 className="text-lg font-serif font-black text-white mt-1 leading-none">{activeSong.title}</h3>
                                        <p className="text-xs text-stone-400 font-medium mt-1.5">{activeSong.subtitle}</p>
                                        <div className="flex items-center gap-3 mt-3 text-[10px] font-mono text-stone-300">
                                            <span>速度: {activeSong.speed}X</span>
                                            <span>组件: 88-Key Synthesizer</span>
                                        </div>
                                    </div>
                                )}

                                {/* Keyboard binding overlays (C4 Middle C, instructions) */}
                                <div className="absolute top-6 right-6 z-10 max-w-xs p-5 rounded-2xl bg-stone-900/40 backdrop-blur-md border border-white/5 pointer-events-none text-right flex flex-col items-end select-none">
                                    <div className="flex items-center gap-1.5 text-stone-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                                        <Keyboard size={12} /> Keyboard Mapping
                                    </div>
                                    <p className="text-[11px] text-stone-300 font-serif leading-relaxed">
                                        计算机键盘：英文字母 <span className="font-mono text-amber-400 font-black">A S D F G H J K L ;</span> 映射至中音区，空格键切换播放/暂停。支持标准电钢琴 USB MIDI 即插即弹。
                                    </p>
                                </div>
                            </div>

                            {/* --- 3. 88-KEY PHYSICAL MODEL KEYBOARD --- */}
                            <div className="h-[210px] relative w-full select-none select-none z-10 shrink-0 border-t border-stone-800">
                                
                                {/* White Keys Stage */}
                                <div className="absolute inset-0 flex">
                                    {keys.map((key) => {
                                        if (key.isBlack) return null;
                                        
                                        const pos = keyPositions[key.index];
                                        const isActive = activeKeys.has(key.index);
                                        const isCorrectPractice = correctPracticedKeys.has(key.index);

                                        // Render notes helpers text (All keys, C keys only, details)
                                        const showLabel = fontSizeMode === 'all' || 
                                            (fontSizeMode === 'c-only' && key.pitchClass === 'C');

                                        return (
                                            <button
                                                key={key.index}
                                                onMouseDown={() => playNote(key.index)}
                                                onMouseUp={() => stopNote(key.index)}
                                                onMouseLeave={() => { if (activeKeys.has(key.index)) stopNote(key.index); }}
                                                onTouchStart={(e) => { e.preventDefault(); playNote(key.index); }}
                                                onTouchEnd={(e) => { e.preventDefault(); stopNote(key.index); }}
                                                className="absolute top-0 flex flex-col justify-end items-center pb-4.5 border-r border-[#e4e4e7] rounded-b-md transition-all duration-75 select-none touch-none"
                                                style={{
                                                    left: `${pos.left}px`,
                                                    width: `${pos.width}px`,
                                                    height: '100%',
                                                    backgroundColor: isActive 
                                                        ? '#3b82f6' // Glowing cyan index
                                                        : isCorrectPractice 
                                                            ? '#10b981' // Green practice indicator target
                                                            : '#ffffff',
                                                    color: isActive ? '#ffffff' : '#4b5563',
                                                    boxShadow: isActive 
                                                        ? 'inset 0 -8px 0 rgba(0,0,0,0.15), 0 4px 10px rgba(59,130,246,0.3)' 
                                                        : 'inset 0 -4px 0 rgba(0,0,0,0.06)'
                                                }}
                                            >
                                                {/* Visual striking light ripple */}
                                                {isActive && (
                                                    <div className="absolute inset-x-0.5 bottom-0 h-4 bg-gradient-to-t from-white/40 to-transparent pointer-events-none rounded-b-md" />
                                                )}

                                                {/* Text marker details */}
                                                {showLabel && (
                                                    <span className={`text-[10px] font-black uppercase tracking-tight select-none font-sans pointer-events-none ${isActive ? 'text-white' : 'text-stone-400'}`}>
                                                        {key.name}
                                                    </span>
                                                )}
                                                {key.name === 'C4' && (
                                                    <span className="absolute top-2.5 text-[8.5px] uppercase font-black tracking-wider text-amber-500 pointer-events-none bg-amber-400/15 py-0.5 px-1.5 rounded-full ring-1 ring-amber-400/20">
                                                        MID-C
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Black Keys Layer */}
                                <div className="absolute inset-0 pointer-events-none">
                                    {keys.map((key) => {
                                        if (!key.isBlack) return null;

                                        const pos = keyPositions[key.index];
                                        const isActive = activeKeys.has(key.index);
                                        const isCorrectPractice = correctPracticedKeys.has(key.index);

                                        return (
                                            <button
                                                key={key.index}
                                                onMouseDown={() => playNote(key.index)}
                                                onMouseUp={() => stopNote(key.index)}
                                                onMouseLeave={() => { if (activeKeys.has(key.index)) stopNote(key.index); }}
                                                onTouchStart={(e) => { e.preventDefault(); playNote(key.index); }}
                                                onTouchEnd={(e) => { e.preventDefault(); stopNote(key.index); }}
                                                className="absolute top-0 pointer-events-auto rounded-b-[4px] shadow-lg transition-all duration-75 select-none touch-none"
                                                style={{
                                                    left: `${pos.left}px`,
                                                    width: `${pos.width}px`,
                                                    height: '62%', // Standard physical black key height ratio
                                                    backgroundColor: isActive 
                                                            ? '#f59e0b' // Gold dynamic strike glow
                                                            : isCorrectPractice
                                                                ? '#10b981'
                                                                : '#1c1917', // Elegant charcoal ebony color
                                                    border: '1px solid #1c1917',
                                                    boxShadow: isActive 
                                                        ? 'inset 0 -6px 0 rgba(0,0,0,0.35), 0 4px 12px rgba(245,158,11,0.4)' 
                                                        : 'inset 0 -3px 0 rgba(255,255,255,0.06)'
                                                }}
                                            >
                                                {isActive && (
                                                    <div className="absolute inset-x-0.5 bottom-0 h-3 bg-gradient-to-t from-white/30 to-transparent pointer-events-none rounded-b-[4px]" />
                                                )}
                                                {/* black keys label text markers */}
                                                {fontSizeMode === 'all' && (
                                                    <span className="absolute bottom-2.5 inset-x-0 text-center text-[7.5px] font-black uppercase text-stone-100 pointer-events-none opacity-80 scale-90">
                                                        {key.pitchClass}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

                {/* --- 4. BOTTOM DASHBOARD FOOTER STATUS BAR --- */}
                <footer className="px-6 py-4 bg-stone-900 border-t border-stone-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400 z-10 shrink-0">
                    <div className="flex items-center gap-4.5">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse-soft" />
                            <span className="font-bold text-stone-200">钢琴引擎已就绪</span>
                        </div>
                        <div className="text-stone-500">
                            已就绪琴键: <span className="font-mono text-stone-300 font-bold">88 / 88 keys</span>
                        </div>
                    </div>

                    {isPracticeMode && (
                        <div className="text-blue-400 font-bold bg-blue-500/10 px-4 py-1.5 rounded-full flex items-center gap-2 border border-blue-500/25 animate-fadeIn">
                            <Sparkles className="animate-pulse" size={13} />
                            <span>跟弹模式：瀑布将在按键处暂停，弹出绿光标记琴键即可继续！</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-stone-500">
                        <Award size={13} className="text-amber-400" />
                        <span>理论与演奏并进 • 正在演奏: {user?.name || '爱乐客'}</span>
                    </div>
                </footer>

            </motion.div>
        </AnimatePresence>
    );
};

export default Piano88Page;
