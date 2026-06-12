import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    ChevronLeft, Volume2, Play, Pause, RotateCcw, 
    Maximize2, Minimize2, Music, Sparkles, Check, 
    HelpCircle, Zap, ZoomIn, ZoomOut, Eye, Keyboard,
    ListMusic, Radio, Settings, Power, Award, User,
    Sliders, VolumeX, Waves, Compass, Upload, Sun, Moon, Repeat
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
    style?: string;
    char?: string;
    rotation?: number;
    rotSpeed?: number;
    decay?: number;
    gravity?: number;
    wiggleSpeed?: number;
    wiggleAmp?: number;
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
    lineWidth?: number;
    speed?: number;
    fadeSpeed?: number;
    type?: 'solid' | 'core' | 'ethereal';
}

// Synth Engine Class with high-fidelity physical modeling, string sympathetic resonance, Dolby Atmos 3D HRTF space modeling, and solid spruce soundboard cabinet simulation
class PianoSynthesizer {
    private ctx: AudioContext | null = null;
    private activeNodes: { [keyIndex: number]: any[] } = {};
    private sustainActive: boolean = false;
    private sustainedKeys: Set<number> = new Set();
    private volume: number = 0.6;
    private timbre: 'grand' | 'yamaha' | 'bosendorfer' | 'upright' | 'ambient' = 'grand';
    
    // Fine-tuneable acoustic parameter fields
    private soundboardScale: number = 0.85;
    private sympatheticResonance: number = 0.75;
    private hammerHardness: number = 1.0;
    private spatialDolbyMode: 'player' | 'concert' | 'cathedral' | 'dolby360' | 'binaural' = 'player';
    private atmosHeight: number = 0.8;
    private stereowidth: number = 1.35;
    private reverbDecay: number = 2.2;
    private reverbWet: number = 0.35;
    
    // Global effects nodes for soundboard body resonance and spacious delay
    private delayNode: DelayNode | null = null;
    private feedbackNode: GainNode | null = null;
    private masterGainNode: GainNode | null = null;
    
    // Convolved solid spruce soundboard cabinet simulator
    private soundboardConvolver: ConvolverNode | null = null;
    private soundboardGain: GainNode | null = null;

    // Upgraded Premium Multi-band Parametric Equalizer Nodes
    private bassEQNode: BiquadFilterNode | null = null;
    private midEQNode: BiquadFilterNode | null = null;
    private highEQNode: BiquadFilterNode | null = null;
    private limiterNode: DynamicsCompressorNode | null = null;

    // Cached noise buffer for hammer strike simulation
    private hammerNoiseBuffer: AudioBuffer | null = null;

    constructor() {}

    private createResonanceIR(ctx: AudioContext): AudioBuffer {
        const sampleRate = ctx.sampleRate;
        const duration = 2.5; // Longer 2.5s rich wood grain IR
        const len = sampleRate * duration;
        const irBuffer = ctx.createBuffer(2, len, sampleRate);
        
        const dL = irBuffer.getChannelData(0);
        const dR = irBuffer.getChannelData(1);
        
        for (let i = 0; i < len; i++) {
            const progress = i / len;
            // Exponentially decaying dense random soundboard wood body vibrations
            const decay = Math.pow(1 - progress, 2.8);
            const lNoise = (Math.random() * 2 - 1) * decay;
            const rNoise = (Math.random() * 2 - 1) * decay;
            
            // Standing wave resonance frequency peaks calculated for premium solid sitka spruce soundboards
            // Simulates rib bracing, sound post, and wooden bridge vibrational nodes
            const resFreqs = [56, 112, 178, 224, 340, 480, 620, 850, 1150, 1600, 2100, 2800];
            let lSum = lNoise * 0.15;
            let rSum = rNoise * 0.15;
            
            const timeSec = i / sampleRate;
            for (let j = 0; j < resFreqs.length; j++) {
                const f = resFreqs[j];
                const fGain = Math.exp(-f * 0.00075) * 0.22; // Drop gain exponentially with higher frequency
                lSum += Math.sin(2 * Math.PI * f * timeSec) * decay * fGain * (1.0 + Math.sin(j * 4.0) * 0.18);
                rSum += Math.sin(2 * Math.PI * f * timeSec + Math.PI / 4) * decay * fGain * (1.0 + Math.cos(j * 3.5) * 0.18);
            }
            
            dL[i] = lSum * 0.5;
            dR[i] = rSum * 0.5;
        }
        return irBuffer;
    }

    private setSoundboardGainForTimbre() {
        if (!this.ctx || !this.soundboardGain) return;
        const now = this.ctx.currentTime;
        let gainVal = 0.40;
        if (this.timbre === 'grand') gainVal = 0.50;
        else if (this.timbre === 'yamaha') gainVal = 0.32;
        else if (this.timbre === 'bosendorfer') gainVal = 0.70;
        else if (this.timbre === 'upright') gainVal = 0.42;
        else if (this.timbre === 'ambient') gainVal = 1.05;
        
        // Multiply by user soundboard scale setting
        const finalGain = gainVal * this.soundboardScale;
        this.soundboardGain.gain.setTargetAtTime(finalGain, now, 0.08);
    }

    private updateEQForTimbre() {
        if (!this.ctx || !this.bassEQNode || !this.midEQNode || !this.highEQNode) return;
        const now = this.ctx.currentTime;
        
        let bassGain = 0;
        let midGain = 0;
        let highGain = 0;
        
        if (this.timbre === 'grand') {
            bassGain = 2.4;
            midGain = 0.6;
            highGain = 1.8;
        } else if (this.timbre === 'yamaha') {
            bassGain = -1.2;
            midGain = 1.2;
            highGain = 4.2;
        } else if (this.timbre === 'bosendorfer') {
            bassGain = 4.5;
            midGain = 0.8;
            highGain = -0.5;
        } else if (this.timbre === 'upright') {
            bassGain = -2.5;
            midGain = 3.2;
            highGain = -2.0;
        } else if (this.timbre === 'ambient') {
            bassGain = 2.0;
            midGain = -2.0;
            highGain = -4.5;
        }
        
        this.bassEQNode.gain.setTargetAtTime(bassGain, now, 0.08);
        this.midEQNode.gain.setTargetAtTime(midGain, now, 0.08);
        this.highEQNode.gain.setTargetAtTime(highGain, now, 0.08);
    }

    private initListener() {
        if (!this.ctx) return;
        const listener = this.ctx.listener;
        const now = this.ctx.currentTime;
        
        // Define standard HRTF listener facing direction
        if (listener.forwardX) {
            listener.forwardX.setValueAtTime(0, now);
            listener.forwardY.setValueAtTime(0, now);
            listener.forwardZ.setValueAtTime(-1, now);
            listener.upX.setValueAtTime(0, now);
            listener.upY.setValueAtTime(1, now);
            listener.upZ.setValueAtTime(0, now);
            listener.positionX.setValueAtTime(0, now);
            listener.positionY.setValueAtTime(0, now);
            listener.positionZ.setValueAtTime(0, now);
        } else {
            // Legacy fallbacks for older web audio specifications
            try {
                listener.setOrientation(0, 0, -1, 0, 1, 0);
                listener.setPosition(0, 0, 0);
            } catch (e) {}
        }
    }

    private initCtx() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            this.ctx = new AudioCtx();
            
            // Build soft felt hammer friction click & woody compression thunk
            const sampleRate = this.ctx.sampleRate;
            const bufferSize = sampleRate * 0.08; // 80ms pulse buffer
            this.hammerNoiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
            const data = this.hammerNoiseBuffer.getChannelData(0);
            let lastVal = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                const t = i / sampleRate;
                const white = Math.random() * 2 - 1;
                // Soft pink filter for high felt string contact friction
                lastVal = 0.15 * white + 0.85 * lastVal;
                
                // Low-frequency shockwave single-cycle wooden knock (thunk)
                // Decays extremely fast, dominant in first 15ms (90Hz sine bump)
                const thunk = Math.sin(2 * Math.PI * 90 * t) * Math.exp(-t * 220);
                
                data[i] = (lastVal * 1.6 * Math.exp(-t * 180)) + (thunk * 2.8);
            }

            // Generate master gain control node
            this.masterGainNode = this.ctx.createGain();
            this.masterGainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
            
            // Spruce soundboard feedback resonance model/delay
            this.delayNode = this.ctx.createDelay(4.0);
            this.feedbackNode = this.ctx.createGain();

            // Build dynamic multi-band Equalizer nodes
            this.bassEQNode = this.ctx.createBiquadFilter();
            this.bassEQNode.type = 'lowshelf';
            this.bassEQNode.frequency.setValueAtTime(150, this.ctx.currentTime);

            this.midEQNode = this.ctx.createBiquadFilter();
            this.midEQNode.type = 'peaking';
            this.midEQNode.frequency.setValueAtTime(1000, this.ctx.currentTime);
            this.midEQNode.Q.setValueAtTime(0.8, this.ctx.currentTime);

            this.highEQNode = this.ctx.createBiquadFilter();
            this.highEQNode.type = 'highshelf';
            this.highEQNode.frequency.setValueAtTime(6000, this.ctx.currentTime);

            // Connect EQ Chain in series, leading ultimately into the Master Gain Control
            this.bassEQNode.connect(this.midEQNode);
            this.midEQNode.connect(this.highEQNode);
            this.highEQNode.connect(this.masterGainNode);
            
            // Initialize positions & orientations for binaural processing
            this.initListener();
            
            // Setup Convolved soundboard simulator
            try {
                this.soundboardConvolver = this.ctx.createConvolver();
                this.soundboardConvolver.buffer = this.createResonanceIR(this.ctx);
                
                this.soundboardGain = this.ctx.createGain();
                this.soundboardConvolver.connect(this.soundboardGain);
                this.soundboardGain.connect(this.bassEQNode);
            } catch (e) {
                console.warn("Failed to set up soundboard convolved cabinet resonance:", e);
            }

            // Instantiation of Dynamics Compressor/Limiter Node
            this.limiterNode = this.ctx.createDynamicsCompressor();
            this.limiterNode.threshold.setValueAtTime(-1.5, this.ctx.currentTime);
            this.limiterNode.knee.setValueAtTime(8, this.ctx.currentTime);
            this.limiterNode.ratio.setValueAtTime(12, this.ctx.currentTime);
            this.limiterNode.attack.setValueAtTime(0.003, this.ctx.currentTime);
            this.limiterNode.release.setValueAtTime(0.08, this.ctx.currentTime);

            // Direct dry output connection goes through limiter
            this.masterGainNode.connect(this.limiterNode);
            this.limiterNode.connect(this.ctx.destination);
            
            // Reverb spatial delay loop feedback connection (internal to delay only)
            this.delayNode.connect(this.feedbackNode);
            this.feedbackNode.connect(this.delayNode);
            
            // Reverb wet output: connect feedback output directly to limiter instead of feeding it back into the EQ chain input
            this.feedbackNode.connect(this.limiterNode);
            
            // Feed master dry signal into spatial delay network
            this.masterGainNode.connect(this.delayNode);
            
            this.updateGlobalReverb();
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
        this.updateGlobalReverb();
    }

    public setDolbyAcoustics(params: {
        soundboardScale: number;
        sympatheticResonance: number;
        hammerHardness: number;
        spatialDolbyMode: 'player' | 'concert' | 'cathedral' | 'dolby360' | 'binaural';
        atmosHeight: number;
        stereowidth: number;
        reverbDecay: number;
        reverbWet: number;
    }) {
        this.soundboardScale = params.soundboardScale;
        this.sympatheticResonance = params.sympatheticResonance;
        this.hammerHardness = params.hammerHardness;
        this.spatialDolbyMode = params.spatialDolbyMode;
        this.atmosHeight = params.atmosHeight;
        this.stereowidth = params.stereowidth;
        this.reverbDecay = params.reverbDecay;
        this.reverbWet = params.reverbWet;
        
        this.updateGlobalReverb();
    }

    private updateGlobalReverb() {
        if (!this.ctx || !this.delayNode || !this.feedbackNode) return;
        const now = this.ctx.currentTime;
        
        // Base timings scaled dynamically
        let delayVal = 0.38;
        let fbGain = 0.18;
        
        if (this.timbre === 'ambient') {
            delayVal = 0.58;
            fbGain = 0.48;
        }
        
        // Scale with custom user sliders
        const customDelay = delayVal * (0.4 + this.reverbDecay * 0.35);
        const customFeedback = Math.min(0.85, fbGain * this.reverbWet * (0.6 + this.reverbDecay * 0.4));
        
        this.delayNode.delayTime.setTargetAtTime(customDelay, now, 0.1);
        this.feedbackNode.gain.setTargetAtTime(customFeedback, now, 0.1);
        
        this.setSoundboardGainForTimbre();
        this.updateEQForTimbre();
    }

    private triggerSympatheticResonance(struckKey: number, struckFreq: number, vel: number, now: number) {
        if (this.sympatheticResonance <= 0.05 || !this.ctx) return;
        
        // Iterate over keys that have their dampers lifted to model sympathetic transfers
        const activeSustains = Array.from(this.sustainedKeys);
        
        // Limit active sympathetic oscillators to prevent CPU overload
        const cappedSustains = activeSustains.slice(-8); 
        
        cappedSustains.forEach(otherKeyIndex => {
            if (otherKeyIndex === struckKey) return;
            
            // Stiff frequency calculation
            const otherFreq = 440 * Math.pow(2, (otherKeyIndex - 49) / 12);
            
            // Check if there is harmonic alignment (inter-string energy excitation)
            const ratio = struckFreq > otherFreq ? struckFreq / otherFreq : otherFreq / struckFreq;
            let alignment = 0;
            const eps = 0.12; // tolerance window
            
            for (let h = 1; h <= 5; h++) {
                if (Math.abs(ratio - h) < eps || Math.abs(ratio * 1.5 - h) < eps) {
                    alignment = 1.25 / h;
                    break;
                }
            }

            if (alignment > 0) {
                // Generate physical sympathetic secondary excitation oscillator
                const ringOsc = this.ctx!.createOscillator();
                ringOsc.type = 'sine';
                ringOsc.frequency.setValueAtTime(otherFreq, now);
                // Slight kinetic drift
                ringOsc.detune.setValueAtTime((Math.random() * 2 - 1) * 2.0, now);
                
                const ringGain = this.ctx!.createGain();
                const ringVolume = vel * this.sympatheticResonance * 0.012 * alignment;
                
                ringGain.gain.setValueAtTime(0, now);
                ringGain.gain.linearRampToValueAtTime(ringVolume, now + 0.06); // energy transfer swell
                
                // Rapid physical wooden adsorption dampening
                ringGain.gain.exponentialRampToValueAtTime(0.00001, now + 1.5);
                
                ringOsc.connect(ringGain);
                
                if (this.soundboardConvolver) {
                    ringGain.connect(this.soundboardConvolver);
                } else if (this.bassEQNode) {
                    ringGain.connect(this.bassEQNode);
                } else if (this.masterGainNode) {
                    ringGain.connect(this.masterGainNode);
                }
                
                ringOsc.start(now);
                ringOsc.stop(now + 1.6);
                
                // Track nodes so they are released or cleaned
                if (!this.activeNodes[otherKeyIndex]) {
                    this.activeNodes[otherKeyIndex] = [];
                }
                this.activeNodes[otherKeyIndex].push({
                    oscillators: [ringOsc],
                    gains: [ringGain],
                    filter: this.ctx!.createBiquadFilter(), // placeholder filter
                    masterGain: ringGain,
                    startTime: now,
                    decayDur: 1.6
                });
            }
        });
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

        // Create Master gain node for the note
        const masterGain = this.ctx.createGain();
        masterGain.gain.setValueAtTime(0, now);
        
        let partialsDef: { n: number, gain: number, type: 'sine' | 'triangle' | 'sawtooth' | 'square', detune: number, decayMult?: number }[] = [];
        let B = 0.00015; // default stiffness factor
        let unisonDetune = 1.25; // string beating
        let filterStartMult = 5.0;
        let filterEndMult = 1.35;
        let filterDecay = 2.0;
        let baseDecay = 8.5;
        let hammerPitchOffset = 15;
        let hammerVolMult = 0.25;
        let hammerDecayTime = 0.015;
        let attackSwell = 0.0025;

        // Apply dynamic stiffness factor based on register location
        const registerRatio = keyIndex / 88;
        const registerStiffnessMult = Math.pow(2.2, registerRatio * 6.0 - 2.5);

        if (this.timbre === 'grand') {
            // Setup for: Steinway Concert Grand Extra Depth Dynamic
            baseDecay = 11.5;
            B = 0.00010 * registerStiffnessMult;
            unisonDetune = 1.25 * (1.25 - registerRatio * 0.45);
            filterStartMult = 6.2 * this.hammerHardness; 
            filterEndMult = 1.15;
            filterDecay = 2.8; 
            hammerPitchOffset = 20;
            hammerVolMult = 0.35;
            hammerDecayTime = 0.010;
            attackSwell = 0.0015; 
            
            partialsDef = [
                // Unison strings (fundamental) for rich wood warmth
                { n: 1, gain: 1.0, type: 'sine' as const, detune: -unisonDetune, decayMult: 1.0 },
                { n: 1, gain: 0.90, type: 'triangle' as const, detune: +unisonDetune, decayMult: 0.95 },
                { n: 1, gain: 0.55, type: 'sine' as const, detune: 0, decayMult: 1.0 },
                // 2nd Harmonic (Warm Octave)
                { n: 2, gain: 0.48, type: 'triangle' as const, detune: -0.3 * unisonDetune, decayMult: 0.75 },
                { n: 2, gain: 0.38, type: 'sine' as const, detune: +0.3 * unisonDetune, decayMult: 0.8 },
                // 3rd Harmonic (Rich Fifth)
                { n: 3, gain: 0.28, type: 'sine' as const, detune: -0.15 * unisonDetune, decayMult: 0.45 },
                { n: 3, gain: 0.18, type: 'triangle' as const, detune: +0.15 * unisonDetune, decayMult: 0.45 },
                // High frequency metallic "ping" of hammer strike decaying extremely fast
                { n: 4, gain: 0.22, type: 'sawtooth' as const, detune: +0.2, decayMult: 0.08 },
                { n: 5, gain: 0.15, type: 'triangle' as const, detune: -0.2, decayMult: 0.06 },
                { n: 6, gain: 0.09, type: 'sawtooth' as const, detune: 0, decayMult: 0.04 },
                { n: 8, gain: 0.05, type: 'sine' as const, detune: 0, decayMult: 0.02 }
            ];
        } 
        else if (this.timbre === 'yamaha') {
            // Setup for: Yamaha Concert Bright Recording Choice
            baseDecay = 9.0;
            B = 0.00022 * registerStiffnessMult; 
            unisonDetune = 1.05 * (1.3 - registerRatio * 0.5); 
            filterStartMult = 9.2 * this.hammerHardness; 
            filterEndMult = 1.65; 
            filterDecay = 1.8;
            hammerPitchOffset = 26; 
            hammerVolMult = 0.45; 
            hammerDecayTime = 0.007; 
            attackSwell = 0.0010; 
            
            partialsDef = [
                { n: 1, gain: 0.90, type: 'sine' as const, detune: -unisonDetune, decayMult: 1.0 },
                { n: 1, gain: 0.90, type: 'triangle' as const, detune: +unisonDetune, decayMult: 0.95 },
                { n: 2, gain: 0.58, type: 'triangle' as const, detune: +0.4, decayMult: 0.8 }, 
                // Sparkly presence
                { n: 3, gain: 0.42, type: 'sawtooth' as const, detune: -0.25, decayMult: 0.15 }, 
                { n: 4, gain: 0.32, type: 'triangle' as const, detune: +0.1, decayMult: 0.12 },
                { n: 5, gain: 0.22, type: 'sawtooth' as const, detune: 0, decayMult: 0.06 },
                { n: 6, gain: 0.12, type: 'sine' as const, detune: 0, decayMult: 0.05 }
            ];
        }
        else if (this.timbre === 'bosendorfer') {
            // Setup for: Bösendorfer Solid Wood Double Bridge Imperial
            baseDecay = 14.5; 
            B = 0.00005 * registerStiffnessMult; 
            unisonDetune = 1.55 * (1.1 - registerRatio * 0.3); 
            filterStartMult = 4.2 * this.hammerHardness; 
            filterEndMult = 1.05;
            filterDecay = 4.5;
            hammerPitchOffset = 12; 
            hammerVolMult = 0.25; 
            hammerDecayTime = 0.020;
            attackSwell = 0.0022;
            
            partialsDef = [
                { n: 1, gain: 1.1, type: 'sine' as const, detune: -unisonDetune, decayMult: 1.0 },
                { n: 1, gain: 0.95, type: 'sine' as const, detune: +unisonDetune, decayMult: 1.0 }, 
                { n: 1, gain: 0.78, type: 'triangle' as const, detune: 0, decayMult: 0.95 },
                { n: 2, gain: 0.32, type: 'triangle' as const, detune: +0.2 * unisonDetune, decayMult: 0.8 },
                { n: 3, gain: 0.18, type: 'sine' as const, detune: -0.2 * unisonDetune, decayMult: 0.5 },
                { n: 4, gain: 0.10, type: 'triangle' as const, detune: 0, decayMult: 0.08 },
                { n: 5, gain: 0.03, type: 'sine' as const, detune: 0, decayMult: 0.05 }
            ];
        }
        else if (this.timbre === 'upright') {
            // Setup for: Premium Salon Wood Antique Upright piano
            baseDecay = 7.0; 
            B = 0.00035 * registerStiffnessMult; 
            unisonDetune = 3.45; // classic detuned salon warmth
            filterStartMult = 5.2 * this.hammerHardness;
            filterEndMult = 1.30;
            filterDecay = 1.4;
            hammerPitchOffset = 16; 
            hammerVolMult = 0.50; 
            hammerDecayTime = 0.018; 
            attackSwell = 0.0020;
            
            partialsDef = [
                { n: 1, gain: 0.95, type: 'triangle' as const, detune: -unisonDetune, decayMult: 1.0 },
                { n: 1, gain: 0.95, type: 'triangle' as const, detune: +unisonDetune, decayMult: 0.95 }, 
                { n: 2, gain: 0.48, type: 'sawtooth' as const, detune: +0.6, decayMult: 0.22 },
                { n: 3, gain: 0.32, type: 'triangle' as const, detune: -0.5, decayMult: 0.18 },
                { n: 4, gain: 0.18, type: 'sawtooth' as const, detune: 0, decayMult: 0.08 },
                { n: 5, gain: 0.08, type: 'sine' as const, detune: 0, decayMult: 0.05 }
            ];
        } 
        else {
            // Setup for: Spatial Cinematic Cosmos Ambient Swell
            baseDecay = 18.0; 
            B = 0.000012; 
            unisonDetune = 1.30;
            filterStartMult = 2.8 * this.hammerHardness; 
            filterEndMult = 0.85;
            filterDecay = 5.5;
            hammerPitchOffset = 6;
            hammerVolMult = 0.05; 
            hammerDecayTime = 0.035;
            attackSwell = 0.045; // Soft cinematic bloom
            
            partialsDef = [
                { n: 1, gain: 1.1, type: 'sine' as const, detune: -unisonDetune, decayMult: 1.0 },
                { n: 1, gain: 0.95, type: 'sine' as const, detune: +unisonDetune, decayMult: 1.0 },
                { n: 1, gain: 0.70, type: 'sine' as const, detune: 0, decayMult: 1.0 },
                { n: 2, gain: 0.25, type: 'triangle' as const, detune: 0, decayMult: 0.85 }
            ];
        }

        // Velocity impact curves
        masterGain.gain.linearRampToValueAtTime(vel * 0.32, now + attackSwell);

        // Dolby Atmos 3D Virtual Soundstage Coordinates Engine
        let x = 0;
        let y = 0;
        let z = 0;
        
        const indexRatio = (keyIndex - 1) / 87; // 0.0 to 1.0 panned spectrum
        const activeWidth = this.stereowidth;
        
        if (this.spatialDolbyMode === 'player') {
            // Classic player seating configuration: Bass on left, Treble on right
            x = (indexRatio * 2.0 - 1.0) * activeWidth * 0.95;
            y = this.atmosHeight * 0.12;
            z = -0.4; // intimate proximity
        } 
        else if (this.spatialDolbyMode === 'concert') {
            // Premium Row A seating: centered, wider distance depth
            x = (indexRatio * 2.0 - 1.0) * activeWidth * 0.45;
            y = this.atmosHeight * 0.25;
            z = 3.6; // concert depth reflections
        } 
        else if (this.spatialDolbyMode === 'cathedral') {
            // Highly elevated, soaring cathedral vault acoustics
            x = (indexRatio * 2.0 - 1.0) * activeWidth * 0.85;
            y = 1.8 * this.atmosHeight; // extreme ceiling height reflect
            z = 1.8;
        } 
        else if (this.spatialDolbyMode === 'dolby360') {
            // Full wrap-around cinema sound stage orbits
            const angle = indexRatio * Math.PI * 1.5 - Math.PI * 0.75; // wrap 270 degrees orbit
            x = Math.sin(angle) * activeWidth * 2.4;
            y = Math.cos(angle * 0.5) * this.atmosHeight * 1.5;
            z = Math.cos(angle) * activeWidth * 2.1;
        } 
        else {
            // 'binaural' Headphones specialized HRTF profile positioning
            x = (indexRatio * 2.0 - 1.0) * activeWidth * 1.05;
            y = 0.08 * this.atmosHeight;
            z = 1.25; // targeted critical sweet spot distance
        }

        // Instantiate Dolby Atmos Panner Node
        const pannerNode = this.ctx.createPanner();
        pannerNode.panningModel = 'HRTF'; // Enable Head-Related Transfer Function
        pannerNode.distanceModel = 'inverse';
        pannerNode.refDistance = 1.0;
        pannerNode.maxDistance = 10000;
        pannerNode.rolloffFactor = 1.0;
        
        // Feed coordinates dynamically to achieve 3D binaural separation
        if (pannerNode.positionX) {
            pannerNode.positionX.setValueAtTime(x, now);
            pannerNode.positionY.setValueAtTime(y, now);
            pannerNode.positionZ.setValueAtTime(z, now);
        } else {
            // Legacy interface support for old web browsers
            try {
                pannerNode.setPosition(x, y, z);
            } catch (err) {}
        }

        // Key-dependent filter path with custom Hammer Hardness scale
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        
        const filterStart = Math.min(18000, frequency * (filterStartMult + vel * 6.5));
        const filterEnd = Math.min(18000, frequency * (filterEndMult + vel * 1.1));

        filter.frequency.setValueAtTime(filterStart, now);
        filter.frequency.exponentialRampToValueAtTime(filterEnd, now + filterDecay);

        // Exponential note register-dependent decay (higher notes decay extremely fast)
        const noteDecay = baseDecay * Math.pow(0.963, keyIndex) + 0.38;

        const oscs: OscillatorNode[] = [];
        const gains: GainNode[] = [];

        partialsDef.forEach(p => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            
            // Calculate stiff string inharmonic frequencies: f = n * f_1 * sqrt(1 + B * n^2)
            const stretch = Math.sqrt(1.0 + B * p.n * p.n);
            const partialFreq = frequency * p.n * stretch;

            // Smooth out hard sawtooth waves in the bass register to prevent headphone current buzz
            const finalType = (p.type === 'sawtooth' && keyIndex < 40) ? 'triangle' : p.type;
            osc.type = finalType;
            osc.frequency.setValueAtTime(partialFreq, now);
            osc.detune.setValueAtTime(p.detune, now);

            const g = this.ctx.createGain();
            
            let amplitude = p.gain;
            if (p.n > 1) {
                // Stiffer materials suppress higher partials at lower velocities
                amplitude = p.gain * Math.pow(vel, 1.4 - (1 / p.n)) * (this.hammerHardness * 0.35 + 0.65);
            }
            g.gain.setValueAtTime(amplitude, now);
            
            // Decays of partials is frequency-dependent
            let partialDecay = Math.max(0.10, noteDecay / (1.0 + (p.n - 1) * (1.9 - vel * 0.4)));
            if (p.decayMult !== undefined) {
                partialDecay *= p.decayMult;
            }
            g.gain.exponentialRampToValueAtTime(0.0001, now + partialDecay);

            osc.connect(g);
            g.connect(filter);
            osc.start(now);

            oscs.push(osc);
            gains.push(g);
        });

        // Genuine Soft Felt Hammer friction noise click
        let noiseSource: AudioBufferSourceNode | null = null;
        let noiseGain: GainNode | null = null;
        if (this.hammerNoiseBuffer && this.timbre !== 'ambient') {
            noiseSource = this.ctx.createBufferSource();
            noiseSource.buffer = this.hammerNoiseBuffer;

            const noiseFilter = this.ctx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            // Scale click frequency spectrum with Hammer Hardness
            noiseFilter.frequency.setValueAtTime(280 * this.hammerHardness + (keyIndex * hammerPitchOffset), now);
            noiseFilter.Q.setValueAtTime(4.2, now);

            noiseGain = this.ctx.createGain();
            const hammerVol = hammerVolMult * vel * (this.hammerHardness * 0.6 + 0.4);
            noiseGain.gain.setValueAtTime(hammerVol, now);
            
            noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + hammerDecayTime);

            noiseSource.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(filter);
            noiseSource.start(now);
        }

        // Connect through Atmos panner
        filter.connect(pannerNode);
        pannerNode.connect(masterGain);
        
        // Connect note to global stage master output
        if (this.bassEQNode) {
            masterGain.connect(this.bassEQNode);
        } else if (this.masterGainNode) {
            masterGain.connect(this.masterGainNode);
        } else {
            masterGain.connect(this.ctx.destination);
        }

        // Bleed input into convolved soundboard spruce frame for real cabinet resonance
        if (this.soundboardConvolver) {
            masterGain.connect(this.soundboardConvolver);
        }

        // Trigger sympathetic inter-string resonance vibration
        this.triggerSympatheticResonance(keyIndex, frequency, vel, now);

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
        // Higher registers above index 72 have warningly no physical dampers (ring naturally!)
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
                
                // Damper cushion extinction speed simulation based on timbre selection
                const activeRelease = hasDamper 
                    ? (this.timbre === 'ambient' ? 1.8 : this.timbre === 'upright' ? 0.22 : this.timbre === 'bosendorfer' ? 0.45 : 0.36) 
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
    const [isExiting, setIsExiting] = useState<boolean>(false);
    const [isIntroActive, setIsIntroActive] = useState<boolean>(true);
    const sessionStartTimeRef = useRef<number>(Date.now());
    const [notesPlayed, setNotesPlayed] = useState<number>(0);
    const [customSongs, setCustomSongs] = useState<{ id: string; title: string; subtitle: string; composer: string; speed: number; notes: any[] }[]>([]);
    const [activeTimbre, setActiveTimbre] = useState<'grand' | 'yamaha' | 'bosendorfer' | 'upright' | 'ambient'>('grand');
    const [midiToast, setMidiToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false); // 跟弹模式: Wait for correct key strike!
    const [songTimer, setSongTimer] = useState<number>(0);
    const [loopEnabled, setLoopEnabled] = useState<boolean>(false);
    const [loopStart, setLoopStart] = useState<number>(0);
    const [loopEnd, setLoopEnd] = useState<number>(0);
    const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
    const [volume, setVolume] = useState<number>(0.6);
    const [sustain, setSustain] = useState<boolean>(false);
    const [fontSizeMode, setFontSizeMode] = useState<'all' | 'c-only' | 'none'>('all');
    const [waterfallStyle, setWaterfallStyle] = useState<'macaron' | 'starry' | 'ocean' | 'forest' | 'sakura' | 'custom'>(() => {
        try {
            const saved = localStorage.getItem('waterfallStyle');
            return (saved as any) || 'macaron';
        } catch (_) {
            return 'macaron';
        }
    });

    const [customThemeConfig, setCustomThemeConfig] = useState<{
        baseColor: string;
        noteColor: string;
        bgColor: string;
        primaryColor: string;
        char: string;
    }>(() => {
        try {
            const saved = localStorage.getItem('customThemeConfig');
            return saved ? JSON.parse(saved) : {
                baseColor: '#8b5cf6',
                noteColor: '#a78bfa',
                bgColor: '#ede9fe',
                primaryColor: 'bg-violet-500 hover:bg-violet-600',
                char: '🎵'
            };
        } catch (_) {
            return {
                baseColor: '#8b5cf6',
                noteColor: '#a78bfa',
                bgColor: '#ede9fe',
                primaryColor: 'bg-violet-500 hover:bg-violet-600',
                char: '🎵'
            };
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('waterfallStyle', waterfallStyle);
        } catch (_) {}
    }, [waterfallStyle]);

    useEffect(() => {
        try {
            localStorage.setItem('customThemeConfig', JSON.stringify(customThemeConfig));
        } catch (_) {}
    }, [customThemeConfig]);

    const [isHudVisible, setIsHudVisible] = useState<boolean>(true);
    const hudTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseMove = React.useCallback(() => {
        setIsHudVisible(true);
        if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
        hudTimeoutRef.current = setTimeout(() => {
            setIsHudVisible(false);
        }, 2500);
    }, []);

    useEffect(() => {
        return () => {
            if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
        };
    }, []);

    const [isNightMode, setIsNightMode] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('isNightMode');
            return saved !== 'false';
        } catch (_) {
            return true;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('isNightMode', String(isNightMode));
        } catch (_) {}
    }, [isNightMode]);

    // Customizable waterfall configurations with persistent local storage
    const [waterfallSpeed, setWaterfallSpeed] = useState<number>(() => {
        try {
            const saved = localStorage.getItem('waterfallSpeed');
            return saved ? parseInt(saved, 10) : 145;
        } catch (_) {
            return 145;
        }
    });

    const [showGuideLines, setShowGuideLines] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('showGuideLines');
            return saved !== 'false';
        } catch (_) {
            return true;
        }
    });

    const [showReflection, setShowReflection] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('showReflection');
            return saved !== 'false';
        } catch (_) {
            return true;
        }
    });

    const [particlesEnabled, setParticlesEnabled] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('particlesEnabled');
            return saved !== 'false';
        } catch (_) {
            return true;
        }
    });

    const [glowIntensity, setGlowIntensity] = useState<number>(() => {
        try {
            const saved = localStorage.getItem('glowIntensity');
            return saved ? parseFloat(saved) : 1.0;
        } catch (_) {
            return 1.0;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('waterfallSpeed', String(waterfallSpeed));
            localStorage.setItem('showGuideLines', String(showGuideLines));
            localStorage.setItem('showReflection', String(showReflection));
            localStorage.setItem('particlesEnabled', String(particlesEnabled));
            localStorage.setItem('glowIntensity', String(glowIntensity));
        } catch (_) {}
    }, [waterfallSpeed, showGuideLines, showReflection, particlesEnabled, glowIntensity]);

    const [whiteKeyWidth, setWhiteKeyWidth] = useState<number>(42); // Width of each white key (zooms)
    const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());
    const [isInternalFullscreen, setIsInternalFullscreen] = useState<boolean>(true); // Immersive browser fill
    const [midiActive, setMidiActive] = useState<boolean>(false);
    const [isAutoFit, setIsAutoFit] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('isAutoFit');
            return saved !== 'false';
        } catch (_) {
            return true;
        }
    });
    
    // Canvas ref for high-performance visual water flow
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const keyboardScrollRef = useRef<HTMLDivElement | null>(null);

    const recalculateAutoFitWidth = React.useCallback(() => {
        if (!isAutoFit) return;
        const scrollElement = keyboardScrollRef.current;
        if (scrollElement) {
            const clientWidth = scrollElement.clientWidth;
            if (clientWidth > 100) {
                const targetWidth = (clientWidth - 64) / 52;
                const safeWidth = Math.max(15, Math.min(90, targetWidth));
                setWhiteKeyWidth(safeWidth);
            }
        }
    }, [isAutoFit]);

    useEffect(() => {
        if (isAutoFit) {
            recalculateAutoFitWidth();
            window.addEventListener('resize', recalculateAutoFitWidth);
            
            const scrollElement = keyboardScrollRef.current;
            let observer: ResizeObserver | null = null;
            if (scrollElement) {
                observer = new ResizeObserver(() => {
                    recalculateAutoFitWidth();
                });
                observer.observe(scrollElement);
            }
            return () => {
                window.removeEventListener('resize', recalculateAutoFitWidth);
                if (observer) {
                    observer.disconnect();
                }
            };
        }
    }, [isAutoFit, recalculateAutoFitWidth]);

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

    const activeSongDuration = useMemo(() => {
        const notes = activeSong.notes;
        if (!notes || notes.length === 0) return 0;
        const last = notes[notes.length - 1];
        return last.time + last.duration;
    }, [activeSong]);

    const vfxTheme = useMemo(() => {
        switch (waterfallStyle) {
            case 'macaron':
                return {
                    primary: 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/10',
                    text: 'text-rose-500',
                    border: 'border-rose-100',
                    track: '#f43f5e',
                    trackBg: '#ffe4e6',
                    trackDark: '#f43f5e',
                    trackBgDark: '#881337',
                    ring: 'shadow-rose-500/20',
                    textMuted: 'text-rose-400',
                    accentHex: '#f43f5e',
                    accentLightHex: '#ffe4e6',
                    accentText: 'text-rose-500 dark:text-rose-400',
                    themeTag: 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                };
            case 'starry':
                return {
                    primary: 'bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-amber-500/10',
                    text: 'text-amber-500',
                    border: 'border-amber-100',
                    track: '#fbbf24',
                    trackBg: '#fef3c7',
                    trackDark: '#d97706',
                    trackBgDark: '#78350f',
                    ring: 'shadow-amber-500/20',
                    textMuted: 'text-amber-400',
                    accentHex: '#fbbf24',
                    accentLightHex: '#fef3c7',
                    accentText: 'text-amber-500 dark:text-amber-400',
                    themeTag: 'bg-amber-500/15 text-amber-500/20 border border-amber-500/20'
                };
            case 'ocean':
                return {
                    primary: 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-cyan-500/10',
                    text: 'text-cyan-500',
                    border: 'border-cyan-100',
                    track: '#06b6d4',
                    trackBg: '#ecfeff',
                    trackDark: '#0891b2',
                    trackBgDark: '#164e63',
                    ring: 'shadow-cyan-500/20',
                    textMuted: 'text-cyan-400',
                    accentHex: '#06b6d4',
                    accentLightHex: '#ecfeff',
                    accentText: 'text-cyan-600 dark:text-cyan-400',
                    themeTag: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                };
            case 'forest':
                return {
                    primary: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10',
                    text: 'text-emerald-500',
                    border: 'border-emerald-100',
                    track: '#10b981',
                    trackBg: '#f0fdf4',
                    trackDark: '#059669',
                    trackBgDark: '#064e3b',
                    ring: 'shadow-emerald-500/20',
                    textMuted: 'text-emerald-400',
                    accentHex: '#10b981',
                    accentLightHex: '#f0fdf4',
                    accentText: 'text-emerald-600 dark:text-emerald-400',
                    themeTag: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                };
            case 'sakura':
                return {
                    primary: 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-600/10',
                    text: 'text-rose-500',
                    border: 'border-rose-100',
                    track: '#e11d48',
                    trackBg: '#fff1f2',
                    trackDark: '#be123c',
                    trackBgDark: '#4c0519',
                    ring: 'shadow-rose-600/20',
                    textMuted: 'text-rose-400',
                    accentHex: '#e11d48',
                    accentLightHex: '#fff1f2',
                    accentText: 'text-rose-600 dark:text-rose-400',
                    themeTag: 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                };
            case 'custom':
                return {
                    primary: `bg-stone-500 hover:bg-stone-600 text-white shadow-stone-500/10`,
                    text: `text-stone-500`,
                    border: 'border-stone-200',
                    track: customThemeConfig.baseColor,
                    trackBg: customThemeConfig.bgColor,
                    trackDark: customThemeConfig.baseColor,
                    trackBgDark: '#292524',
                    ring: 'shadow-stone-500/20',
                    textMuted: 'text-stone-400',
                    accentHex: customThemeConfig.baseColor,
                    accentLightHex: customThemeConfig.bgColor,
                    accentText: 'text-stone-600 dark:text-stone-400',
                    themeTag: 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                };
            default:
                return {
                    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10',
                    text: 'text-indigo-600',
                    border: 'border-indigo-100',
                    track: '#4f46e5',
                    trackBg: '#e0e7ff',
                    trackDark: '#6366f1',
                    trackBgDark: '#312e81',
                    ring: 'shadow-indigo-600/20',
                    textMuted: 'text-indigo-400',
                    accentHex: '#4f46e5',
                    accentLightHex: '#e0e7ff',
                    accentText: 'text-indigo-600 dark:text-indigo-400',
                    themeTag: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                };
        }
    }, [waterfallStyle]);

    useEffect(() => {
        setLoopStart(0);
        setLoopEnd(activeSongDuration);
        setLoopEnabled(false);
    }, [activeSong.id, activeSongDuration]);

    const [songTransition, setSongTransition] = useState<{ id: string; title: string } | null>(null);

    // Track whether the full-screen entrance show/opening animation is currently active
    const isIntroActiveRef = useRef<boolean>(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            isIntroActiveRef.current = false;
            setIsIntroActive(false);
        }, 800); // Sleek Apple-style intro settles in 800ms
        return () => clearTimeout(timer);
    }, []);

    // Smooth song switch / transition cross-fade state
    const waterfallFadeRef = useRef<number>(1.0);
    const fadeDirectionRef = useRef<'in' | 'out' | null>(null);
    const pendingSongIdRef = useRef<string | null>(null);
    const pendingPostActionRef = useRef<(() => void) | null>(null);

    const triggerSongSwitch = (newSongId: string, postAction?: () => void) => {
        setIsPlaying(false);
        if (isIntroActiveRef.current) {
            // First time entry or during opening sequence: Switch immediately in the background without launching fade-out animation
            setSelectedSongId(newSongId);
            if (postAction) postAction();
            return;
        }
        pendingSongIdRef.current = newSongId;
        pendingPostActionRef.current = postAction || null;
        fadeDirectionRef.current = 'out';
    };

    // Dynamic stardust/note animation helper on canvas
    const spawnSongTransitionBurst = () => {
        if (!canvasRef.current || !particlesEnabled) return;
        const canvas = canvasRef.current;
        const width = canvas.width;
        const height = canvas.height;

        let baseColor = customThemeConfig.baseColor || '#fda4af';
        if (!isNightMode) {
            if (waterfallStyle === 'starry') baseColor = '#c7d2fe';
            else if (waterfallStyle === 'ocean') baseColor = '#a5f3fc';
            else if (waterfallStyle === 'forest') baseColor = '#a7f3d0';
            else if (waterfallStyle === 'sakura') baseColor = '#fecdd3';
            else if (waterfallStyle === 'custom') baseColor = customThemeConfig.bgColor; // lighter for day
            else baseColor = '#fda4af';
        } else {
            if (waterfallStyle === 'starry') baseColor = '#818cf8';
            else if (waterfallStyle === 'ocean') baseColor = '#22d3ee';
            else if (waterfallStyle === 'forest') baseColor = '#34d399';
            else if (waterfallStyle === 'sakura') baseColor = '#ff758f';
            else if (waterfallStyle === 'custom') baseColor = customThemeConfig.baseColor;
            else baseColor = '#fda4af';
        }

        const transitionNotes = ['♩', '♪', '♫', '♬', '✨', '⭐', '🌸', '🍬', '❤️'];

        // Spawn a series of gorgeous ascending items across the entire screen
        const count = 58;
        for (let i = 0; i < count; i++) {
            const xPercent = (i / (count - 1)) * 0.9 + 0.05;
            const x = xPercent * width;
            const y = height * 0.85 + Math.sin(i * 0.5) * 35;
            
            const shapeSelect = Math.random();
            let char: string | undefined = undefined;
            if (shapeSelect < 0.45) {
                if (waterfallStyle === 'custom') char = customThemeConfig.char || '🎵';
                else if (waterfallStyle === 'sakura') char = '🌸';
                else if (waterfallStyle === 'forest') char = Math.random() < 0.5 ? '🍃' : '✨';
                else if (waterfallStyle === 'starry') char = Math.random() < 0.5 ? '⭐' : '✨';
                else if (waterfallStyle === 'macaron') char = Math.random() < 0.5 ? '🍬' : '❤️';
                else char = transitionNotes[Math.floor(Math.random() * 4)];
            }

            particlesRef.current.push({
                id: Math.random(),
                x,
                y,
                vx: (Math.random() - 0.5) * 1.5,
                vy: -Math.random() * 3.0 - 1.5,
                color: Math.random() < 0.5 ? '#ffffff' : baseColor,
                size: char ? (Math.random() * 12 + 10) : (Math.random() * 4 + 2),
                alpha: 1.0,
                life: 1.0,
                style: waterfallStyle,
                char,
                rotSpeed: (Math.random() - 0.5) * 2.0,
                decay: Math.random() * 0.15 + 0.15,
                gravity: -0.04,
                wiggleSpeed: Math.random() * 4 + 2,
                wiggleAmp: Math.random() * 1.2 + 0.4
            });
        }
    };

    const isFirstRenderRef = useRef(true);

    useEffect(() => {
        if (!selectedSongId || selectedSongId === 'free') return;
        if (isFirstRenderRef.current || isIntroActiveRef.current) {
            isFirstRenderRef.current = false;
            return;
        }
        const songObj = allAvailableSongs.find(s => s.id === selectedSongId);
        if (songObj) {
            setSongTransition({ id: selectedSongId, title: songObj.title });
            // Burst particles beautifully
            setTimeout(() => {
                // Double check that we aren't still intro-ing
                if (!isIntroActiveRef.current) {
                    spawnSongTransitionBurst();
                }
            }, 100);

            const timer = setTimeout(() => {
                setSongTransition(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [selectedSongId]);

    const activeSongRef = useRef(activeSong);
    const whiteKeyWidthRef = useRef(whiteKeyWidth);
    const isPlayingRef = useRef(isPlaying);
    const isPracticeModeRef = useRef(isPracticeMode);
    const activeKeysRef = useRef(activeKeys);
    const playbackSpeedRef = useRef(playbackSpeed);
    const waterfallStyleRef = useRef(waterfallStyle);
    const isNightModeRef = useRef(isNightMode);
    const waterfallSpeedRef = useRef(waterfallSpeed);
    const showGuideLinesRef = useRef(showGuideLines);
    const showReflectionRef = useRef(showReflection);
    const particlesEnabledRef = useRef(particlesEnabled);
    const glowIntensityRef = useRef(glowIntensity);
    const loopEnabledRef = useRef(loopEnabled);
    const loopStartRef = useRef(loopStart);
    const loopEndRef = useRef(loopEnd);

    useEffect(() => { activeSongRef.current = activeSong; }, [activeSong]);
    useEffect(() => { whiteKeyWidthRef.current = whiteKeyWidth; }, [whiteKeyWidth]);
    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
    useEffect(() => { isPracticeModeRef.current = isPracticeMode; }, [isPracticeMode]);
    useEffect(() => { activeKeysRef.current = activeKeys; }, [activeKeys]);
    useEffect(() => { playbackSpeedRef.current = playbackSpeed; }, [playbackSpeed]);
    useEffect(() => { waterfallStyleRef.current = waterfallStyle; }, [waterfallStyle]);
    useEffect(() => { isNightModeRef.current = isNightMode; }, [isNightMode]);
    useEffect(() => { waterfallSpeedRef.current = waterfallSpeed; }, [waterfallSpeed]);
    useEffect(() => { showGuideLinesRef.current = showGuideLines; }, [showGuideLines]);
    useEffect(() => { showReflectionRef.current = showReflection; }, [showReflection]);
    useEffect(() => { particlesEnabledRef.current = particlesEnabled; }, [particlesEnabled]);
    useEffect(() => { glowIntensityRef.current = glowIntensity; }, [glowIntensity]);
    useEffect(() => { loopEnabledRef.current = loopEnabled; }, [loopEnabled]);
    useEffect(() => { loopStartRef.current = loopStart; }, [loopStart]);
    useEffect(() => { loopEndRef.current = loopEnd; }, [loopEnd]);

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
            triggerSongSwitch(newSongId, () => {
                songTimerRef.current = 0;
                songTriggeredKeysRef.current.clear();
                setSongTimer(0);
                setActiveKeys(new Set());
            });

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

    // Advanced Dolby Atmos and physical modeling states
    const [soundboardScale, setSoundboardScale] = useState<number>(0.90);
    const [sympatheticResonance, setSympatheticResonance] = useState<number>(0.80);
    const [hammerHardness, setHammerHardness] = useState<number>(1.0);
    const [spatialDolbyMode, setSpatialDolbyMode] = useState<'player' | 'concert' | 'cathedral' | 'dolby360' | 'binaural'>('player');
    const [atmosHeight, setAtmosHeight] = useState<number>(0.8);
    const [stereowidth, setStereowidth] = useState<number>(1.35);
    const [reverbDecay, setReverbDecay] = useState<number>(2.2);
    const [reverbWet, setReverbWet] = useState<number>(0.35);
    const [showAcousticPanel, setShowAcousticPanel] = useState<boolean>(false); // Dynamic panel toggle

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

    useEffect(() => {
        synth.setDolbyAcoustics({
            soundboardScale,
            sympatheticResonance,
            hammerHardness,
            spatialDolbyMode,
            atmosHeight,
            stereowidth,
            reverbDecay,
            reverbWet
        });
    }, [soundboardScale, sympatheticResonance, hammerHardness, spatialDolbyMode, atmosHeight, stereowidth, reverbDecay, reverbWet, synth]);

    // Key triggering functions
    const playNote = (keyIndex: number, velocity: number = 0.82) => {
        const key = keys.find(k => k.index === keyIndex);
        if (!key) return;
        
        synth.triggerAttack(keyIndex, key.frequency, velocity);
        setNotesPlayed(p => p + 1);
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

    const spawnVisualsRef = useRef(spawnVisuals);
    useEffect(() => {
        spawnVisualsRef.current = spawnVisuals;
    }, [spawnVisuals]);

    // Particles/Halo Spawners
    function spawnVisuals(keyIndex: number) {
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

        // Perfectly unified premium accent color matching White Keys (vibrant glowing core)
        let color = '#fda4af';
        if (!isNightMode) {
            if (waterfallStyle === 'starry') color = '#c7d2fe';
            else if (waterfallStyle === 'ocean') color = '#a5f3fc';
            else if (waterfallStyle === 'forest') color = '#a7f3d0';
            else if (waterfallStyle === 'sakura') color = '#fecdd3';
            else color = '#fda4af';
        } else {
            if (waterfallStyle === 'starry') color = '#818cf8';
            else if (waterfallStyle === 'ocean') color = '#22d3ee';
            else if (waterfallStyle === 'forest') color = '#34d399';
            else if (waterfallStyle === 'sakura') color = '#ff758f';
            else color = '#fda4af';
        }

        // Spawn a large, dramatic burst of 28 hybrid particle sparks and floating embers
        const particleCount = 28;
        for (let i = 0; i < particleCount; i++) {
            const isEmbers = Math.random() < 0.45;
            const size = isEmbers ? (Math.random() * 4.5 + 2.5) : (Math.random() * 2.5 + 1.2);
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5; // Fan outwards and upwards
            const speed = isEmbers ? (Math.random() * 3 + 1.5) : (Math.random() * 8 + 4.5);
            
            particlesRef.current.push({
                id: Math.random(),
                x: actualX,
                y: actualY - 6,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: isEmbers ? color : '#ffffff', // Radiant pure white sparks combined with theme color
                size,
                alpha: 1.0,
                life: 1.0,
                style: waterfallStyle,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 4.0,
                decay: isEmbers ? (Math.random() * 0.35 + 0.25) : (Math.random() * 0.75 + 0.45), // Embers linger longer
                gravity: isEmbers ? -0.1 : 0.05, // Embers float up like hot smoke, sparks are subject to gravity
                wiggleSpeed: isEmbers ? (Math.random() * 8 + 4) : 0,
                wiggleAmp: isEmbers ? (Math.random() * 1.5 + 0.5) : 0
            });
        }

        // Spawn 3 gorgeous concentric acoustic halos with distinct speeds and fade profiles
        // 1. Core Strike Ring (hyper fast, bright white, small radius)
        halosRef.current.push({
            id: Math.random(),
            keyIndex,
            x: actualX,
            y: actualY,
            radius: 2,
            maxRadius: 38,
            alpha: 1.0,
            color: '#ffffff',
            lineWidth: 2.2,
            speed: 155,
            fadeSpeed: 2.8,
            type: 'core'
        });

        // 2. Main Resonant Wave (theme accessory color, wide expansion)
        halosRef.current.push({
            id: Math.random(),
            keyIndex,
            x: actualX,
            y: actualY,
            radius: 5,
            maxRadius: 58,
            alpha: 0.95,
            color,
            lineWidth: 3.2,
            speed: 95,
            fadeSpeed: 1.5,
            type: 'solid'
        });

        // 3. Ethereal Sub-Resonance Ring (slow, ultra-translucent dashed outer ring)
        halosRef.current.push({
            id: Math.random(),
            keyIndex,
            x: actualX,
            y: actualY,
            radius: 12,
            maxRadius: 95,
            alpha: 0.65,
            color,
            lineWidth: 1.4,
            speed: 60,
            fadeSpeed: 0.95,
            type: 'ethereal'
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

        // Synchronize drawing sizes on initial layout
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

        const totalWhiteKeys = 52;

        const renderFrame = (timestamp: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = timestamp;
            const delta = (timestamp - lastTimeRef.current) / 1000;
            lastTimeRef.current = timestamp;

            // Update song switch fade animation
            if (fadeDirectionRef.current === 'out') {
                waterfallFadeRef.current -= delta * 5.0; // Fade out over 0.20s
                if (waterfallFadeRef.current <= 0) {
                    waterfallFadeRef.current = 0;
                    fadeDirectionRef.current = 'in';
                    
                    if (pendingSongIdRef.current !== null) {
                        setSelectedSongId(pendingSongIdRef.current);
                        pendingSongIdRef.current = null;
                    }
                    if (pendingPostActionRef.current !== null) {
                        pendingPostActionRef.current();
                        pendingPostActionRef.current = null;
                    } else {
                        songTimerRef.current = 0;
                        songTriggeredKeysRef.current.clear();
                        setSongTimer(0);
                        setActiveKeys(new Set());
                    }
                }
            } else if (fadeDirectionRef.current === 'in') {
                waterfallFadeRef.current += delta * 4.5; // Fade back in over 0.22s
                if (waterfallFadeRef.current >= 1.0) {
                    waterfallFadeRef.current = 1.0;
                    fadeDirectionRef.current = null;
                }
            }

            // Shadow the outer reactive states with their up-to-date ref values to prevent loop reconstruction
            const isNightMode = isNightModeRef.current;
            const waterfallStyle = waterfallStyleRef.current;
            const particlesEnabled = particlesEnabledRef.current;
            const showGuideLines = showGuideLinesRef.current;
            const activeKeys = activeKeysRef.current;
            const isPracticeMode = isPracticeModeRef.current;
            const isPlaying = isPlayingRef.current;
            const playbackSpeed = playbackSpeedRef.current;
            const waterfallSpeed = waterfallSpeedRef.current;
            const showReflection = showReflectionRef.current;
            const glowIntensity = glowIntensityRef.current;
            const whiteKeyWidth = whiteKeyWidthRef.current;
            const spawnVisuals = spawnVisualsRef.current || (() => {});
            const activeSong = activeSongRef.current;
            
            const keysInSong = activeSong.notes;

            // Auto-resize canvas buffer to layout boundaries on every frame to guarantee perfect scaling and zoom alignment
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            const expectedWidth = Math.round(rect.width * dpr);
            const expectedHeight = Math.round(rect.height * dpr);
            if (canvas.width !== expectedWidth || canvas.height !== expectedHeight) {
                canvas.width = expectedWidth;
                canvas.height = expectedHeight;
            }

            const currentCanvasWidth = canvas.width;
            const currentCanvasHeight = canvas.height;
            ctx.clearRect(0, 0, currentCanvasWidth, currentCanvasHeight);

            // Style color mapping with responsive Day (soft healing) and Night (quiet glow) themes
            const getStyleColors = (ignoredIsBlack: boolean) => {
                const isBlack = false; // Unifies both black and white keys to ensure identical visual styling and particle colors!
                if (!isNightMode) {
                    // --- DAYTIME: SOFT HEALING PASTELS (温和粉彩色系) ---
                    switch (waterfallStyle) {
                        case 'starry': // Vanilla starry night
                            return {
                                primary: isBlack ? '#4f46e5' : '#c7d2fe',
                                secondary: isBlack ? '#4338ca' : '#e0e7ff',
                                shadow: '#fbbf24',
                                bgGlow: isBlack ? 'rgba(79, 70, 229, ' : 'rgba(199, 210, 254, ',
                                dark: isBlack ? '#faf5ff' : '#fafafa',
                                glowRadius: 6,
                                sparkColor: '#fbbf24'
                            };
                        case 'ocean': // Soda Breeze
                            return {
                                primary: isBlack ? '#0891b2' : '#a5f3fc',
                                secondary: isBlack ? '#0e7490' : '#ecfeff',
                                shadow: '#cffafe',
                                bgGlow: isBlack ? 'rgba(8, 145, 178, ' : 'rgba(165, 243, 252, ',
                                dark: isBlack ? '#f0fdfa' : '#fafafa',
                                glowRadius: 6,
                                sparkColor: '#e0f2fe'
                            };
                        case 'forest': // Matcha Herb
                            return {
                                primary: isBlack ? '#059669' : '#a7f3d0',
                                secondary: isBlack ? '#047857' : '#f0fdf4',
                                shadow: '#d1fae5',
                                bgGlow: isBlack ? 'rgba(5, 150, 105, ' : 'rgba(167, 243, 208, ',
                                dark: isBlack ? '#f0fdf4' : '#fafafa',
                                glowRadius: 6,
                                sparkColor: '#34d399'
                            };
                        case 'sakura': // Cherry Blossom
                            return {
                                primary: isBlack ? '#db2777' : '#fecdd3',
                                secondary: isBlack ? '#be185d' : '#fff1f2',
                                shadow: '#fbcfe8',
                                bgGlow: isBlack ? 'rgba(219, 39, 119, ' : 'rgba(254, 205, 211, ',
                                dark: isBlack ? '#fff5f5' : '#fafafa',
                                glowRadius: 7,
                                sparkColor: '#fda4af'
                            };
                        case 'macaron':
                        default: // Soft Cute Macaron Pink
                            return {
                                primary: isBlack ? '#f43f5e' : '#fda4af',
                                secondary: isBlack ? '#e11d48' : '#ffe4e6',
                                shadow: '#fecdd3',
                                bgGlow: isBlack ? 'rgba(244, 63, 94, ' : 'rgba(253, 164, 175, ',
                                dark: isBlack ? '#fdf2f8' : '#fafafa',
                                glowRadius: 8,
                                sparkColor: '#fecdd3'
                            };
                    }
                } else {
                    // --- NIGHTTIME: DREAMY COZY GLOWS (谧夜星河色系) ---
                    switch (waterfallStyle) {
                        case 'starry':
                            return {
                                primary: isBlack ? '#4338ca' : '#818cf8',
                                secondary: isBlack ? '#312e81' : '#f59e0b',
                                shadow: '#fbbf24',
                                bgGlow: isBlack ? 'rgba(67, 56, 202, ' : 'rgba(129, 140, 248, ',
                                dark: isBlack ? '#1e1b4b' : '#312e81',
                                glowRadius: 22,
                                sparkColor: '#fef08a'
                            };
                        case 'ocean':
                            return {
                                primary: isBlack ? '#0e7490' : '#22d3ee',
                                secondary: isBlack ? '#155e75' : '#0891b2',
                                shadow: '#a5f3fc',
                                bgGlow: isBlack ? 'rgba(14, 116, 144, ' : 'rgba(34, 211, 238, ',
                                dark: isBlack ? '#083344' : '#0e7490',
                                glowRadius: 18,
                                sparkColor: '#e0f2fe'
                            };
                        case 'forest':
                            return {
                                primary: isBlack ? '#047857' : '#34d399',
                                secondary: isBlack ? '#064e3b' : '#10b981',
                                shadow: '#6ee7b7',
                                bgGlow: isBlack ? 'rgba(4, 120, 87, ' : 'rgba(52, 211, 153, ',
                                dark: isBlack ? '#022c22' : '#047857',
                                glowRadius: 18,
                                sparkColor: '#fef08a'
                            };
                        case 'sakura':
                            return {
                                primary: isBlack ? '#9d174d' : '#ff758f',
                                secondary: isBlack ? '#831843' : '#ec4899',
                                shadow: '#fbcfe8',
                                bgGlow: isBlack ? 'rgba(157, 23, 77, ' : 'rgba(255, 117, 143, ',
                                dark: isBlack ? '#500724' : '#9d174d',
                                glowRadius: 20,
                                sparkColor: '#ffd2d2'
                            };
                        case 'macaron':
                        default:
                            return {
                                primary: isBlack ? '#9f1239' : '#fda4af',
                                secondary: isBlack ? '#be185d' : '#f43f5e',
                                shadow: '#f43f5e',
                                bgGlow: isBlack ? 'rgba(159, 18, 57, ' : 'rgba(253, 164, 175, ',
                                dark: isBlack ? '#4c0519' : '#881337',
                                glowRadius: 18,
                                sparkColor: '#ffe4e6'
                            };
                    }
                }
            };

            // Speed parameters mapping waterfall pixels zoom heights
            const pixelsPerSecond = waterfallSpeed; 
            const canvasVirtualWidth = totalWhiteKeys * whiteKeyWidth;
            const horizontalScale = currentCanvasWidth / canvasVirtualWidth;

            // Spawn gentle background ambient dust particles to create cozy room vibe
            if (particlesEnabled && Math.random() < 0.08) {
                let color = '#fda4af';
                if (waterfallStyle === 'starry') color = Math.random() < 0.4 ? '#fbbf24' : '#c7d2fe';
                else if (waterfallStyle === 'ocean') color = Math.random() < 0.4 ? '#a5f3fc' : '#e0f2fe';
                else if (waterfallStyle === 'forest') color = Math.random() < 0.4 ? '#10b981' : '#a7f3d0';
                else if (waterfallStyle === 'sakura') color = Math.random() < 0.4 ? '#ff758f' : '#fecdd3';
                else color = Math.random() < 0.4 ? '#f43f5e' : '#fda4af'; // macaron

                particlesRef.current.push({
                    id: Math.random(),
                    x: Math.random() * currentCanvasWidth,
                    y: currentCanvasHeight - 2,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: -Math.random() * 1.5 - 0.5,
                    color,
                    size: Math.random() * 2.5 + 1.5, // slightly fluffier and cuter size
                    alpha: Math.random() * 0.4 + 0.2,
                    life: 1.0,
                    style: waterfallStyle,
                    rotation: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 0.8
                });
            }

            // Draw clean vertical guide channels for all keys responsive to Day/Night mode
            if (showGuideLines) {
                ctx.strokeStyle = isNightMode ? 'rgba(255, 255, 255, 0.012)' : 'rgba(0, 0, 0, 0.025)';
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
            }

            // Draw Octave guideline separators in background
            ctx.strokeStyle = isNightMode ? 'rgba(255, 255, 255, 0.038)' : 'rgba(0, 0, 0, 0.045)';
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

                        // Render a beautiful pill badge with the octave name
                        ctx.fillStyle = isNightMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)';
                        ctx.beginPath();
                        ctx.roundRect(lineX + 4, 8, 22, 14, 4);
                        ctx.fill();
                        
                        ctx.fillStyle = isNightMode ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.45)';
                        ctx.font = '9px monospace';
                        ctx.textAlign = 'center';
                        ctx.fillText(`${k.name}`, lineX + 15, 18);
                    }
                }
            });

            // Beautiful glowing energetic waterfall tracks rising up from active buttons
            activeKeys.forEach(activeKeyIdx => {
                const pos = keyPositions[activeKeyIdx];
                if (pos) {
                    const rectLeft = pos.left * horizontalScale;
                    const rectWidth = pos.width * horizontalScale;
                    const isBlack = !!keys.find(k => k.index === activeKeyIdx)?.isBlack;
                    const themeColors = getStyleColors(isBlack);
                    
                    ctx.save();
                    
                    // Main ambient path glow
                    const activeGrad = ctx.createLinearGradient(rectLeft + rectWidth / 2, currentCanvasHeight, rectLeft + rectWidth / 2, 0);
                    const colorPrefix = themeColors.bgGlow;
                    
                    activeGrad.addColorStop(0, colorPrefix + '0.36)');
                    activeGrad.addColorStop(0.3, colorPrefix + '0.18)');
                    activeGrad.addColorStop(0.7, colorPrefix + '0.06)');
                    activeGrad.addColorStop(1, colorPrefix + '0.00)');
                    
                    ctx.fillStyle = activeGrad;
                    ctx.fillRect(rectLeft, 0, rectWidth, currentCanvasHeight);

                    // Draw flowing stardust / plasma currents rising inside this active track channel
                    ctx.fillStyle = themeColors.primary + '45';
                    const numStreamers = Math.max(3, Math.floor(rectWidth / 4.5));
                    for (let s = 0; s < numStreamers; s++) {
                        const sparkX = rectLeft + (s / numStreamers) * rectWidth + (Math.sin(timestamp * 0.0035 + s * 1.5) * 2.5);
                        // Make sparks run upwards continuously using timestamp
                        const speedFactor = 160 + s * 35;
                        const sparkY = currentCanvasHeight - ((timestamp * 0.12 * speedFactor + s * 135) % currentCanvasHeight);
                        const size = 1.6 + (Math.sin(timestamp * 0.012 + s) * 0.7);
                        ctx.beginPath();
                        ctx.arc(sparkX, sparkY, size, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    // High-fidelity vertical laser border lines on left and right edge
                    ctx.strokeStyle = themeColors.primary + 'cc'; // high opacity solid/glow string look
                    ctx.lineWidth = 1.9;
                    ctx.shadowBlur = themeColors.glowRadius + 6;
                    ctx.shadowColor = themeColors.shadow;
                    
                    ctx.beginPath();
                    ctx.moveTo(rectLeft, currentCanvasHeight);
                    ctx.lineTo(rectLeft, 0);
                    ctx.moveTo(rectLeft + rectWidth, currentCanvasHeight);
                    ctx.lineTo(rectLeft + rectWidth, 0);
                    ctx.stroke();

                    ctx.restore();
                }
            });

            // Handle Song Progression
            if (activeSong.id !== 'free') {
                // Determine notes that are currently falling or coming soon
                const lookAheadWindow = 15.0; // Show notes 15 seconds ahead for perfect streaming flow
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
                        if (loopEnabledRef.current && (songTimerRef.current < loopStartRef.current || songTimerRef.current >= loopEndRef.current)) {
                            // Release active frequencies to prevent sticking notes
                            keys.forEach(k => {
                                try { synth.triggerRelease(k.index, true); } catch (_) {}
                            });
                            songTimerRef.current = loopStartRef.current;
                            songTriggeredKeysRef.current.clear();
                            setActiveKeys(new Set());
                        } else {
                            songTimerRef.current += delta * playbackSpeed;
                            if (loopEnabledRef.current && songTimerRef.current >= loopEndRef.current) {
                                keys.forEach(k => {
                                    try { synth.triggerRelease(k.index, true); } catch (_) {}
                                });
                                songTimerRef.current = loopStartRef.current;
                                songTriggeredKeysRef.current.clear();
                                setActiveKeys(new Set());
                            }
                        }
                        setSongTimer(songTimerRef.current);
                    }
                }

                // RENDER FALLING WATERFALL NOTES (GEOMETRIC CYBER DESIGNS)
                ctx.save();
                ctx.globalAlpha = waterfallFadeRef.current;
                visibleNotes.forEach(note => {
                    const pos = keyPositions[note.keyIndex];
                    if (!pos) return;

                    const rectWidth = pos.width * horizontalScale;
                    const rectX = pos.left * horizontalScale;

                    // Calculate Y coordinates according to song timer
                    const pixelsToBottom = currentCanvasHeight;
                    const noteStartOffset = note.time - songTimerRef.current;
                    const noteEndOffset = (note.time + note.duration) - songTimerRef.current;

                    const yEnd = pixelsToBottom - (noteStartOffset * pixelsPerSecond);
                    const rawYStart = pixelsToBottom - (noteEndOffset * pixelsPerSecond);
                    const rectHeight = Math.max(12, yEnd - rawYStart);
                    const yStart = yEnd - rectHeight;

                    // Trigger sound & hits when note encounters the hit line (bottom) in Auto-Play mode
                    const hasCrossedHitLine = noteStartOffset <= 0 && noteEndOffset > 0;
                    if (hasCrossedHitLine) {
                        if (!songTriggeredKeysRef.current.has(note.keyIndex)) {
                            // Hit registry! Start playing if Auto-play mode is active
                            songTriggeredKeysRef.current.add(note.keyIndex);
                            if (!isPracticeMode) {
                                const finalVel = note.velocity !== undefined ? note.velocity / 127.0 : 0.8;
                                synth.triggerAttack(note.keyIndex, keys.find(k => k.index === note.keyIndex)!.frequency, finalVel);
                                setNotesPlayed(p => p + 1);
                                setActiveKeys(prev => {
                                    const next = new Set(prev);
                                    next.add(note.keyIndex);
                                    return next;
                                });
                                spawnVisuals(note.keyIndex);
                            }
                        }
                        // Continuous sparkling fluid flows representing active string vibration
                        if (particlesEnabled && Math.random() < 0.35) {
                            const pos = keyPositions[note.keyIndex];
                            if (pos) {
                                const renderScale = currentCanvasWidth / canvasVirtualWidth;
                                const actualX = (pos.left + pos.width * Math.random()) * renderScale;
                                const isBlack = !!pos.isBlack;
                                const themeColors = getStyleColors(isBlack);
                                
                                particlesRef.current.push({
                                    id: Math.random(),
                                    x: actualX,
                                    y: currentCanvasHeight - 6,
                                    vx: (Math.random() - 0.5) * 3.6,
                                    vy: -Math.random() * 4.5 - 2,
                                    color: themeColors.sparkColor,
                                    size: Math.random() * 2.5 + 1.0,
                                    alpha: 0.95,
                                    life: 1.0,
                                    style: waterfallStyle,
                                    char: waterfallStyle === 'matrix' ? (Math.random() < 0.5 ? '0' : '1') : undefined
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

                    // DRAW BEAUTIFUL NEON WATERFALL ROUNDED BLOCK (3D LUCITE CRYSTAL LOOK)
                    if (yStart < currentCanvasHeight) {
                        const isBlack = !!note.isBlack;
                        const themeColors = getStyleColors(isBlack);

                        // 0. Render 3D glass mirror fallboard reflection (inverted rising glow)
                        if (showReflection && yEnd >= currentCanvasHeight - 120) {
                            ctx.save();
                            const distToBottom = Math.max(0, currentCanvasHeight - yEnd);
                            const reflectAlpha = Math.max(0, 0.22 * (1 - distToBottom / 120));
                            ctx.globalAlpha = reflectAlpha;

                            // Reflection starts at currentCanvasHeight and goes UPWARDS, meeting the note
                            const reflectHeight = Math.max(5, rectHeight * 0.45);
                            const reflectY = currentCanvasHeight - (distToBottom * 0.5) - reflectHeight;

                            const refR = Math.min(4, rectWidth / 2.5);
                            const reflectGrad = ctx.createLinearGradient(rectX, currentCanvasHeight, rectX, currentCanvasHeight - 45);
                            
                            reflectGrad.addColorStop(0, themeColors.bgGlow + '0.70)');
                            reflectGrad.addColorStop(1, themeColors.bgGlow + '0.00)');

                            ctx.fillStyle = reflectGrad;
                            ctx.beginPath();
                            ctx.roundRect(rectX + 1.2, reflectY, rectWidth - 2.4, reflectHeight, refR);
                            ctx.fill();
                            ctx.restore();
                        }

                        ctx.save();
                        
                        const r = Math.min(6, rectWidth / 2);
                        
                        // 1. Render 3D Side Bevel Shadow/Depth to make the glass blocks pop
                        ctx.save();
                        ctx.shadowBlur = 0;
                        ctx.fillStyle = themeColors.dark;
                        ctx.beginPath();
                        ctx.roundRect(rectX + 2.5, yStart, rectWidth - 2.5, rectHeight + 3.5, r);
                        ctx.fill();
                        ctx.restore();

                        // 2. Render Main Glass Face
                        const noteGrad = ctx.createLinearGradient(rectX, yStart, rectX + rectWidth, yStart);
                        if (!isNightMode) {
                            // Gentle Creamy Pastels
                            if (waterfallStyle === 'starry') {
                                noteGrad.addColorStop(0, '#faf5ff');
                                noteGrad.addColorStop(0.5, '#c7d2fe');
                                noteGrad.addColorStop(1, '#a5b4fc');
                            } else if (waterfallStyle === 'ocean') {
                                noteGrad.addColorStop(0, '#f0fdfa');
                                noteGrad.addColorStop(0.5, '#a5f3fc');
                                noteGrad.addColorStop(1, '#67e8f9');
                            } else if (waterfallStyle === 'forest') {
                                noteGrad.addColorStop(0, '#f0fdf4');
                                noteGrad.addColorStop(0.5, '#a7f3d0');
                                noteGrad.addColorStop(1, '#6ee7b7');
                            } else if (waterfallStyle === 'sakura') {
                                noteGrad.addColorStop(0, '#fff5f5');
                                noteGrad.addColorStop(0.5, '#fecdd3');
                                noteGrad.addColorStop(1, '#ff85a2');
                            } else {
                                // macaron
                                noteGrad.addColorStop(0, '#fff1f2');
                                noteGrad.addColorStop(0.5, '#ffe4e6');
                                noteGrad.addColorStop(1, '#fbcfe8');
                            }
                        } else {
                            if (waterfallStyle === 'starry') {
                                // Deep lavender with glowing gold stars
                                noteGrad.addColorStop(0, '#312e81');
                                noteGrad.addColorStop(0.4, '#818cf8');
                                noteGrad.addColorStop(0.8, '#ffc078');
                                noteGrad.addColorStop(1, '#312e81');
                            } else if (waterfallStyle === 'ocean') {
                                // Ocean soda blue
                                noteGrad.addColorStop(0, '#0c4a6e');
                                noteGrad.addColorStop(0.5, '#0284c7');
                                noteGrad.addColorStop(1, '#38bdf8');
                            } else if (waterfallStyle === 'forest') {
                                // Magic moss garden green
                                noteGrad.addColorStop(0, '#064e3b');
                                noteGrad.addColorStop(0.5, '#10b981');
                                noteGrad.addColorStop(1, '#a7f3d0');
                            } else if (waterfallStyle === 'sakura') {
                                // Night blossom magenta-rose
                                noteGrad.addColorStop(0, '#500724');
                                noteGrad.addColorStop(0.4, '#be185d');
                                noteGrad.addColorStop(0.8, '#ff758f');
                                noteGrad.addColorStop(1, '#500724');
                            } else {
                                // macaron night cozy warm raspberry
                                noteGrad.addColorStop(0, '#4c0519');
                                noteGrad.addColorStop(0.5, '#db2777');
                                noteGrad.addColorStop(1, '#fda4af');
                            }
                        }
                        ctx.shadowColor = themeColors.shadow;

                        // Intense neon blooming aura on active-hit, but smooth and muted in day mode
                        if (isNightMode) {
                            if (hasCrossedHitLine) {
                                ctx.shadowBlur = (themeColors.glowRadius + 6) * glowIntensity;
                            } else {
                                ctx.shadowBlur = 7 * glowIntensity;
                            }
                        } else {
                            // Very soft healing touch
                            ctx.shadowBlur = (hasCrossedHitLine ? 5 : 1) * glowIntensity;
                        }

                        ctx.fillStyle = noteGrad;
                        ctx.beginPath();
                        ctx.roundRect(rectX, yStart, rectWidth - 1, rectHeight, r);
                        ctx.fill();

                        // Style-specific overlay details!
                        if (waterfallStyle === 'starry') {
                            // Draw starry glowing sparkles on the tracks
                            ctx.save();
                            ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
                            ctx.beginPath();
                            ctx.arc(rectX + rectWidth * 0.5, yStart + rectHeight * 0.5, 2, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.restore();
                        } else if (waterfallStyle === 'sakura') {
                            // Draw tiny decorative petal shapes
                            ctx.save();
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                            ctx.beginPath();
                            ctx.arc(rectX + rectWidth * 0.3, yStart + rectHeight * 0.3, 1.5, 0, Math.PI * 2);
                            ctx.arc(rectX + rectWidth * 0.7, yStart + rectHeight * 0.7, 1.5, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.restore();
                        } else if (waterfallStyle === 'ocean') {
                            // Soda bubble rings
                            ctx.save();
                            ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
                            ctx.lineWidth = 0.5;
                            ctx.beginPath();
                            ctx.arc(rectX + rectWidth * 0.5, yStart + rectHeight * 0.4, 2, 0, Math.PI * 2);
                            ctx.stroke();
                            ctx.restore();
                        }

                        // High contrast premium light border ring on the surface
                        if (waterfallStyle === 'starry') {
                            ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
                            ctx.lineWidth = 1.0;
                        } else {
                            ctx.strokeStyle = note.isBlack ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.3)';
                            ctx.lineWidth = 1.0;
                        }
                        ctx.stroke();

                        // 3. Volumetric glass reflection highlights
                        ctx.save();
                        ctx.shadowBlur = 0;
                        const shineWidth = rectWidth * 0.32;
                        const shineGrad = ctx.createLinearGradient(rectX, yStart, rectX + shineWidth, yStart);
                        shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
                        shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0.00)');
                        
                        ctx.fillStyle = shineGrad;
                        ctx.beginPath();
                        ctx.roundRect(rectX + 1.2, yStart + 1.2, shineWidth, rectHeight - 2.4, r - 1);
                        ctx.fill();
                        ctx.restore();

                        // Practice Mode Target Highlight Strokes
                        if (isPracticeMode && yEnd >= currentCanvasHeight - 12 && yStart <= currentCanvasHeight) {
                            ctx.strokeStyle = '#ffffff';
                            ctx.lineWidth = 3.0;
                            ctx.shadowColor = '#10b981';
                            ctx.shadowBlur = 14;
                            ctx.stroke();
                        }

                        ctx.restore();
                    }
                });
                ctx.restore();

                // End of song automatic loop reset check
                const lastNote = keysInSong[keysInSong.length - 1];
                if (lastNote && songTimerRef.current > lastNote.time + lastNote.duration + 2.5) {
                    // Restart playback
                    songTimerRef.current = 0;
                    songTriggeredKeysRef.current.clear();
                    setActiveKeys(new Set());
                }
            }

            // PARTICLES UPDATES (FLUID SPARKS STARDUST ENGINE) - Refactored to completely avoid the slice indexing bug
            if (!particlesEnabled) {
                particlesRef.current = [];
            }
            particlesRef.current = particlesRef.current.filter((p) => {
                // Check if this is an enhanced particle from direct key hit
                const isEnhanced = p.decay !== undefined;

                if (isEnhanced) {
                    // Advanced gravity/floatation physics for key strike triggers
                    if (p.gravity !== undefined) {
                        p.vy += p.gravity * delta * 60;
                    }
                    // Apply organic atmospheric drag to make explosions decelerate realistically
                    p.vx *= Math.pow(0.95, delta * 60);
                    p.vy *= Math.pow(0.95, delta * 60);

                    p.x += p.vx;
                    p.y += p.vy;
                    p.alpha -= delta * p.decay!;
                    if (p.rotation !== undefined && p.rotSpeed !== undefined) {
                        p.rotation += p.rotSpeed * delta;
                    }
                } else {
                    // Fall back to original theme-specific background/dust physics
                    p.x += p.vx;
                    p.y += p.vy;

                    if (p.style === 'forest') {
                        // Fireflies bob horizontally and float upwards very slowly
                        p.alpha -= delta * 0.4;
                        p.vy = -1.2;
                        p.vx = Math.sin(p.y * 0.025 + p.id * 10) * 0.8;
                    } else if (p.style === 'starry') {
                        // Twinkling stars fall with slight drag down
                        p.alpha -= delta * 0.7;
                        p.vy += delta * 1.5;
                        p.vx = -0.5 + Math.sin(timestamp * 0.005 + p.id) * 0.2;
                        p.rotation = (p.rotation || 0) + (p.rotSpeed || 0.5) * delta;
                    } else if (p.style === 'ocean') {
                        // Rising soda water bubbles rising up fast
                        p.alpha -= delta * 0.95;
                        p.vy = -2.8;
                        p.vx = Math.sin(p.y * 0.03 + p.id) * 1.2;
                    } else if (p.style === 'sakura') {
                        // Fluttering cherry petals drifting down, rotating in wind
                        p.alpha -= delta * 0.55;
                        p.vy = 1.3;
                        p.vx = 0.6 + Math.sin(timestamp * 0.0025 + p.id * 6) * 1.2;
                        p.rotation = (p.rotation || 0) + (p.rotSpeed || 0.4) * delta;
                    } else {
                        // Macaron sweet floating hearts rising and floating gently
                        p.alpha -= delta * 0.75;
                        p.vy = -1.8;
                        p.vx = Math.sin(timestamp * 0.004 + p.id) * 0.8;
                        p.rotation = (p.rotation || 0) + (p.rotSpeed || 0.3) * delta;
                    }
                }

                if (p.alpha <= 0) {
                    return false;
                }

                // Render current active particle
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.shadowBlur = p.style === 'forest' ? 14 : (p.style === 'starry' ? 10 : (p.style === 'sakura' ? 6 : 8));
                ctx.shadowColor = p.color;
                ctx.fillStyle = p.color;

                if (p.style === 'forest') {
                    // Draw soft glowing fireflies
                    const radGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.8);
                    radGrad.addColorStop(0, '#ffffff'); // bright center
                    radGrad.addColorStop(0.3, p.color);
                    radGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
                    ctx.fillStyle = radGrad;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 2.8, 0, Math.PI * 2);
                    ctx.fill();
                } else if (p.style === 'starry') {
                    // Draw sparkling star of 5 spikes
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation || 0);
                    ctx.beginPath();
                    const spikes = 5;
                    const outerRadius = p.size;
                    const innerRadius = p.size * 0.4;
                    let rot = Math.PI / 2 * 3;
                    let starX = 0;
                    let starY = 0;
                    const step = Math.PI / spikes;
                    ctx.moveTo(0, -outerRadius);
                    for (let i = 0; i < spikes; i++) {
                        starX = Math.cos(rot) * outerRadius;
                        starY = Math.sin(rot) * outerRadius;
                        ctx.lineTo(starX, starY);
                        rot += step;
                        starX = Math.cos(rot) * innerRadius;
                        starY = Math.sin(rot) * innerRadius;
                        ctx.lineTo(starX, starY);
                        rot += step;
                    }
                    ctx.lineTo(0, -outerRadius);
                    ctx.closePath();
                    ctx.fill();
                } else if (p.style === 'ocean') {
                    // Bubble circle with a little cute highlight point
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.4, Math.PI, Math.PI * 1.5);
                    ctx.stroke();
                } else if (p.style === 'sakura') {
                    // Draw sweet cherry blossom petal
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation || 0);
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.bezierCurveTo(-p.size, -p.size * 0.7, -p.size * 0.5, -p.size * 1.7, 0, -p.size * 1.4);
                    ctx.bezierCurveTo(p.size * 0.5, -p.size * 1.7, p.size, -p.size * 0.7, 0, 0);
                    ctx.closePath();
                    ctx.fill();
                } else {
                    // Macaron Sweet Love Hearts!
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation || 0);
                    ctx.beginPath();
                    const topCurveHeight = p.size * 0.3;
                    ctx.moveTo(0, topCurveHeight);
                    ctx.bezierCurveTo(
                        -p.size / 2, -p.size / 2,
                        -p.size, p.size / 3,
                        0, p.size
                    );
                    ctx.bezierCurveTo(
                        p.size, p.size / 3,
                        p.size / 2, -p.size / 2,
                        0, topCurveHeight
                    );
                    ctx.closePath();
                    ctx.fill();
                }

                ctx.restore();
                return true;
            });

            // HALOS (GLOW RING EXPANSIONS) UPDATES - Filter-based to avoid spliced shifts
            halosRef.current = halosRef.current.filter((h) => {
                const speed = h.speed || 80;
                const fadeSpeed = h.fadeSpeed || 1.65;
                h.radius += delta * speed;
                h.alpha -= delta * fadeSpeed;

                if (h.alpha <= 0 || h.radius >= h.maxRadius) {
                    return false;
                }

                ctx.save();
                ctx.globalAlpha = h.alpha;
                ctx.strokeStyle = h.color;
                ctx.lineWidth = h.lineWidth || 2.8;
                ctx.shadowBlur = h.type === 'ethereal' ? 24 : 14;
                ctx.shadowColor = h.color;
                
                if (h.type === 'ethereal') {
                    ctx.setLineDash([6, 4]); // Dreamy dashboard-styled dotted acoustic resonances
                }

                ctx.beginPath();
                // Render physical key ellipse hit waves matching our 3D bevel dimensions
                ctx.ellipse(h.x, h.y, h.radius * 1.55, h.radius * 0.45, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
                return true;
            });

            // GORGEOUS GLOWING LASER STRIKE RETAINING BRIDGE AT KEY LEVEL
            const hitLineY = currentCanvasHeight - 4;
            ctx.save();
            const bridgeGrad = ctx.createLinearGradient(0, hitLineY, currentCanvasWidth, hitLineY);
            bridgeGrad.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
            bridgeGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.25)');
            bridgeGrad.addColorStop(1, 'rgba(59, 130, 246, 0.15)');
            
            ctx.strokeStyle = bridgeGrad;
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, hitLineY);
            ctx.lineTo(currentCanvasWidth, hitLineY);
            ctx.stroke();
            ctx.restore();

            // --- DRAW THE 3D GLOSS LACQUER FALLBOARD OVERLAY ---
            ctx.save();
            ctx.shadowBlur = 0;
            const fallboardHeight = 35; // px
            const gradBackboard = ctx.createLinearGradient(0, currentCanvasHeight - fallboardHeight, 0, currentCanvasHeight);
            if (!isNightMode) {
                gradBackboard.addColorStop(0, 'rgba(240, 230, 220, 0.0)');
                gradBackboard.addColorStop(0.3, 'rgba(195, 178, 160, 0.2)');
                gradBackboard.addColorStop(0.8, 'rgba(160, 142, 122, 0.45)');
                gradBackboard.addColorStop(1, 'rgba(120, 102, 85, 0.65)');
            } else {
                gradBackboard.addColorStop(0, 'rgba(15, 10, 20, 0.0)');
                gradBackboard.addColorStop(0.3, 'rgba(25, 15, 30, 0.35)');
                gradBackboard.addColorStop(0.8, 'rgba(35, 20, 45, 0.70)');
                gradBackboard.addColorStop(1, 'rgba(40, 25, 52, 0.88)');
            }
            ctx.fillStyle = gradBackboard;
            ctx.fillRect(0, currentCanvasHeight - fallboardHeight, currentCanvasWidth, fallboardHeight);

            // High polish sweet plush cozy red/pink felt strip
            ctx.fillStyle = !isNightMode ? '#fda4af' : '#be185d'; // Dynamic sweet rose red felt
            ctx.fillRect(0, currentCanvasHeight - 3, currentCanvasWidth, 3);
            
            // Ultra elegant warm-lit accent line
            ctx.fillStyle = !isNightMode ? '#ffedd5' : '#fda4af'; // Cute peach-milk glow
            ctx.fillRect(0, currentCanvasHeight - 1, currentCanvasWidth, 1);
            ctx.restore();

            requestRef.current = requestAnimationFrame(renderFrame);
        };

        requestRef.current = requestAnimationFrame(renderFrame);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            observer.disconnect();
        };
    }, [keyPositions, keys]);

    // Restart playback trigger
    const restartSong = () => {
        songTimerRef.current = 0;
        songTriggeredKeysRef.current.clear();
        setSongTimer(0);
        setActiveKeys(new Set());
    };

    // Jump playback time smoothly (scrubbing)
    const jumpToTime = (targetTime: number) => {
        const clamped = Math.max(0, Math.min(targetTime, activeSongDuration));
        
        // Quietly release all ringing frequencies
        keys.forEach(k => {
            try {
                synth.triggerRelease(k.index, true);
            } catch (_) {}
        });

        songTimerRef.current = clamped;
        songTriggeredKeysRef.current.clear();
        setSongTimer(clamped);
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
        if (isExiting) return;
        // Damping any playing oscillators
        keys.forEach(k => synth.triggerRelease(k.index, true));
        setIsPlaying(false);
        setIsExiting(true);

        // Defer actual onClose callback for smooth elegant transition completes
        setTimeout(() => {
            onClose();
        }, 750); // Gives 750ms for the micro-animations to run cleanly
    };

    return (
        <AnimatePresence>
            <motion.div 
                initial="initial"
                animate="animate"
                exit="exit"
                variants={{
                    initial: { 
                        opacity: 0,
                        scale: 1.05,
                        filter: "blur(20px)"
                    },
                    animate: { 
                        opacity: 1,
                        scale: 1,
                        filter: "blur(0px)",
                        transition: { 
                            type: "spring",
                            stiffness: 140,
                            damping: 24,
                            mass: 1
                        }
                    },
                    exit: { 
                        opacity: 0,
                        scale: 0.95,
                        filter: "blur(20px)",
                        transition: { 
                            type: "spring",
                            stiffness: 155,
                            damping: 26,
                            mass: 1
                        }
                    }
                }}
                className={`fixed inset-0 z-[160] flex flex-col transition-colors duration-500 overflow-hidden select-none ${
                    isNightMode ? 'bg-[#0B0A09] text-stone-100' : 'bg-[#FAF7F2] text-stone-800'
                }`}
                onMouseMove={handleMouseMove}
            >
                {/* Immersive Concert Glow Elements */}
                {isNightMode ? (
                    <>
                        <div className="absolute top-0 left-1/4 w-[50%] h-[30%] bg-blue-500/10 blur-[140px] pointer-events-none rounded-full" />
                        <div className="absolute bottom-0 right-1/4 w-[40%] h-[40%] bg-amber-500/5 blur-[160px] pointer-events-none rounded-full" />
                    </>
                ) : (
                    <>
                        <div className="absolute top-0 left-1/4 w-[50%] h-[30%] bg-rose-200/35 blur-[120px] pointer-events-none rounded-full animate-pulse" />
                        <div className="absolute bottom-0 right-1/4 w-[40%] h-[40%] bg-amber-100/35 blur-[130px] pointer-events-none rounded-full" />
                    </>
                )}

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
                        </motion.div>
                    )}
                </AnimatePresence>

                 {/* --- 1. SLEEK, COMPACT TOP HEADER BAR --- */}
                <motion.header 
                    initial={{ y: -70, opacity: 0 }}
                    animate={{ 
                        y: isExiting ? -75 : 0, 
                        opacity: isExiting ? 0 : 1 
                    }}
                    transition={{ 
                        type: "spring",
                        stiffness: 150,
                        damping: 22,
                        mass: 1,
                        delay: isExiting ? 0 : 0.12
                    }}
                    className={`px-5 py-3 flex items-center justify-between gap-4 z-20 shadow-md transition-colors duration-500 border-b ${
                        isNightMode 
                            ? 'bg-stone-900/80 backdrop-blur-lg border-stone-850' 
                            : 'bg-white/80 backdrop-blur-lg border-stone-200/50'
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        <button 
                            onClick={handleExit}
                            className={`p-2 rounded-xl border shadow-md transition-colors flex items-center justify-center cursor-pointer ${
                                isNightMode 
                                    ? 'bg-stone-800 hover:bg-stone-750 border-stone-700/60 text-stone-100 hover:text-white' 
                                    : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700 hover:text-stone-900'
                            }`}
                            title="返回理论主页"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="bg-amber-400/95 px-1.5 py-0.5 rounded-md text-stone-950 font-black flex items-center gap-0.5 shadow-sm text-[8px] tracking-wider uppercase">
                                    <Radio className="animate-pulse" size={10} />
                                    <span>CONCERT</span>
                                </span>
                                {midiActive && (
                                    <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[8px] font-mono px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                                        <Zap size={8} fill="currentColor" /> MIDI
                                    </span>
                                )}
                            </div>
                            <h2 className={`text-sm font-black tracking-tight mt-0.5 font-sans ${isNightMode ? 'text-white' : 'text-stone-800'}`}>
                                钢琴演奏厅
                            </h2>
                        </div>
                    </div>

                    {/* Integrated Song Selector Pill */}
                    <div className={`hidden md:flex items-center gap-2 p-1 pl-2.5 pr-1.5 rounded-full border transition-colors duration-500 ${
                        isNightMode 
                            ? 'bg-stone-950/40 border-stone-800/80' 
                            : 'bg-[#faf6f0]/80 border-stone-200'
                    }`}>
                        <span className="text-xs flex items-center gap-1.5">
                            <Music size={12.5} className="text-amber-400 animate-pulse" />
                            <span className={`font-medium text-[11px] ${isNightMode ? 'text-stone-300' : 'text-stone-600'}`}>正在配乐:</span>
                        </span>
                        <div className="relative">
                            <select 
                                value={selectedSongId}
                                onChange={e => {
                                    triggerSongSwitch(e.target.value, () => {
                                        songTimerRef.current = 0;
                                        songTriggeredKeysRef.current.clear();
                                        setSongTimer(0);
                                        setActiveKeys(new Set());
                                        restartSong();
                                    });
                                }}
                                className={`max-w-[150px] sm:max-w-[180px] border text-xs font-semibold outline-none pl-2.5 pr-8 py-1 rounded-full cursor-pointer appearance-none transition-colors truncate ${
                                    isNightMode 
                                        ? 'bg-stone-900/80 border-stone-800 text-stone-200 hover:text-white hover:border-stone-700' 
                                        : 'bg-white border-stone-200 text-stone-700 hover:text-stone-950 hover:border-stone-300'
                                }`}
                            >
                                {allAvailableSongs.map(song => (
                                    <option key={song.id} value={song.id} className={isNightMode ? 'bg-stone-900 text-stone-200' : 'bg-white text-stone-700'}>
                                        {song.title} {song.composer !== 'None' ? ` • ${song.composer}` : ''}
                                    </option>
                                ))}
                            </select>
                            <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[9px] ${isNightMode ? 'text-stone-400' : 'text-stone-500'}`}>▼</div>
                        </div>

                        {/* Top quick MIDI Import shortcut */}
                        <label 
                            htmlFor="header-midi-file-input"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-sm"
                            title="导入本地 MIDI (.mid) 乐谱"
                        >
                            <Upload size={11} />
                            <span>MIDI 导入</span>
                            <input 
                                type="file" 
                                accept=".mid,.midi" 
                                onChange={handleMidiImport} 
                                className="hidden" 
                                id="header-midi-file-input"
                            />
                        </label>
                    </div>

                    {/* Quick Waterfall Style Selector */}
                    <div className={`hidden lg:flex items-center gap-1.5 p-1 pl-2.5 pr-1.5 rounded-full border transition-colors duration-500 ${
                        isNightMode 
                            ? 'bg-stone-950/40 border-stone-800/80' 
                            : 'bg-[#faf6f0]/80 border-stone-200'
                    }`}>
                        <span className="text-[10px] font-mono flex items-center gap-1 shrink-0">
                            <Sparkles size={11} className="text-indigo-400" />
                            <span className={isNightMode ? 'text-stone-400' : 'text-stone-600'}>特效:</span>
                        </span>
                        <div className="flex gap-1">
                            {[
                                { id: 'macaron', label: '马卡龙 🍬' },
                                { id: 'starry', label: '星空 🌟' },
                                { id: 'ocean', label: '海风 🫧' },
                                { id: 'forest', label: '森林 🍃' },
                                { id: 'sakura', label: '樱落 🌸' }
                            ].map(style => (
                                <button
                                    key={style.id}
                                    onClick={() => setWaterfallStyle(style.id as any)}
                                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-all cursor-pointer ${
                                        waterfallStyle === style.id 
                                            ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-300/60 shadow-sm' 
                                            : isNightMode 
                                                ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-850' 
                                                : 'text-stone-600 hover:text-stone-800 hover:bg-stone-200'
                                    }`}
                                >
                                    {style.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Live Controls (Volume, Play/Pause, Preset) */}
                    <div className="flex items-center gap-3.5">
                        
                        {/* Day/Night Mode Switch Pill with healing touch */}
                        <button
                            onClick={() => setIsNightMode(!isNightMode)}
                            className={`p-1 rounded-full border transition-all duration-500 flex items-center relative w-15 h-7.5 cursor-pointer outline-none ${
                                !isNightMode 
                                    ? 'bg-amber-100/70 border-amber-300' 
                                    : 'bg-stone-900 border-indigo-950'
                            }`}
                            title={isNightMode ? "切换至治愈白日模式" : "切换至悠然夜晚模式"}
                        >
                            {/* Sliding bubble */}
                            <div 
                                className={`w-5.5 h-5.5 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm ${
                                    !isNightMode 
                                        ? 'translate-x-0.5 bg-gradient-to-r from-amber-500 to-amber-300' 
                                        : 'translate-x-7.5 bg-gradient-to-r from-indigo-500 to-purple-500'
                                }`}
                            >
                                {!isNightMode ? (
                                    <Sun size={11} className="text-white fill-white" />
                                ) : (
                                    <Moon size={10} className="text-white fill-white" />
                                )}
                            </div>
                            <span className="sr-only">{isNightMode ? '夜晚' : '白日'}</span>
                        </button>
                        
                        {/* Selected Song Active Actions */}
                        {activeSong.id !== 'free' && (
                            <div className={`flex items-center gap-2 p-1 rounded-xl border transition-colors duration-500 ${
                                isNightMode ? 'bg-stone-950/30 border-stone-850' : 'bg-stone-100/80 border-stone-200/60'
                            }`}>
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                        isPlaying 
                                            ? 'bg-amber-400 text-stone-950 hover:bg-amber-300 shadow-md' 
                                            : isNightMode 
                                                ? 'bg-stone-800 hover:bg-stone-750 text-stone-300' 
                                                : 'bg-white border border-stone-200/50 hover:bg-stone-50 text-stone-700 shadow-sm'
                                    }`}
                                >
                                    {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                                    <span className="hidden sm:inline">{isPlaying ? '静音演示' : '自动弹奏'}</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setIsPracticeMode(!isPracticeMode);
                                        restartSong();
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                                        isPracticeMode 
                                            ? 'bg-indigo-600 border-indigo-505 text-white shadow-lg' 
                                            : isNightMode 
                                                ? 'bg-transparent border-transparent text-stone-400 hover:text-stone-200' 
                                                : 'bg-transparent border-transparent text-stone-500 hover:text-stone-800'
                                    }`}
                                    title="根据瀑布流高亮跟奏，错音暂停"
                                >
                                    <Sparkles size={11.5} className={isPracticeMode ? "animate-spin text-amber-300" : ""} style={{ animationDuration: '4s' }} />
                                    <span>{isPracticeMode ? '跟弹中' : '跟弹练习'}</span>
                                </button>

                                <button
                                    onClick={restartSong}
                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isNightMode ? 'hover:bg-stone-800 text-stone-400 hover:text-white' : 'hover:bg-stone-200 text-stone-500 hover:text-stone-800'}`}
                                    title="重新播放"
                                >
                                    <RotateCcw size={12.5} />
                                </button>
                            </div>
                        )}

                        {/* Master Volume Adjuster */}
                        <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors duration-500 ${
                            isNightMode ? 'bg-stone-950/40 border-stone-850' : 'bg-stone-100/80 border-stone-200/60'
                        }`}>
                            <Volume2 size={12} className={isNightMode ? "text-stone-400" : "text-stone-500"} />
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.05"
                                value={volume} 
                                onChange={e => setVolume(parseFloat(e.target.value))}
                                className={`w-14 h-1 rounded-lg appearance-none cursor-pointer accent-amber-400 ${isNightMode ? 'bg-stone-800' : 'bg-stone-300'}`} 
                            />
                        </div>

                        {/* Sustain Switch pedal */}
                        <button
                            onClick={() => setSustain(!sustain)}
                            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 transition-all border cursor-pointer ${
                                sustain 
                                    ? 'bg-amber-400/15 text-amber-300 border-amber-400/35 shadow-[0_0_15px_rgba(245,158,11,0.08)]' 
                                    : isNightMode 
                                        ? 'bg-stone-800/50 border-stone-800 text-stone-400 hover:border-stone-750' 
                                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                            }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${sustain ? 'bg-amber-400 animate-pulse' : isNightMode ? 'bg-stone-600' : 'bg-stone-300'}`} />
                            <span>SUSTAIN</span>
                        </button>

                        {/* Unified Controller Toggle */}
                        <button
                            onClick={() => setShowAcousticPanel(!showAcousticPanel)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                                showAcousticPanel 
                                    ? 'bg-amber-400 border-amber-300 text-stone-950 font-extrabold shadow-md' 
                                    : isNightMode 
                                        ? 'bg-stone-800 border-stone-700 text-stone-300 hover:text-white hover:border-stone-650' 
                                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                            }`}
                            title="打开控制台与偏好参数设置"
                        >
                            <Sliders size={12} className={showAcousticPanel ? "rotate-90 text-stone-950" : "text-amber-400"} />
                            <span>声学与设置</span>
                        </button>
                    </div>
                </motion.header>



                {/* --- 1.2 GORGEOUS SLIDE-IN CONFIGURATION SIDEBAR DRAWER (FROSTED GLASS) --- */}
                <AnimatePresence>
                    {showAcousticPanel && (
                        <>
                            {/* Backdrop sheet dismiss click */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.45 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowAcousticPanel(false)}
                                className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm z-30"
                            />

                            {/* Sidebar Container */}
                            <motion.div
                                initial={{ x: '100%', opacity: 0.9 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: '100%', opacity: 0.9 }}
                                transition={{ type: 'spring', damping: 28, stiffness: 190 }}
                                className={`absolute top-0 right-0 h-full w-[360px] max-w-full backdrop-blur-2xl border-l shadow-2xl z-40 flex flex-col overflow-hidden text-left font-sans transition-colors duration-500 ${
                                    isNightMode 
                                        ? 'bg-stone-900/98 border-stone-800 text-stone-100' 
                                        : 'bg-white/95 border-stone-200 text-stone-800'
                                }`}
                            >
                                {/* Sidebar Top Title */}
                                <div className={`p-4 border-b flex items-center justify-between flex-shrink-0 transition-colors duration-500 ${
                                    isNightMode ? 'bg-stone-900 border-stone-800' : 'bg-stone-55 border-stone-200'
                                }`}>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-amber-400/10 rounded-lg text-amber-500">
                                            <Sliders size={14} />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-extrabold text-amber-500 font-mono tracking-widest uppercase">
                                                STUDIO MASTER SETUP
                                            </h3>
                                            <p className={`text-[9.5px] leading-none mt-0.5 font-sans ${isNightMode ? 'text-stone-400' : 'text-stone-500'}`}>钢琴大师声学调音及外观配置</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowAcousticPanel(false)}
                                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                            isNightMode 
                                                ? 'bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-750' 
                                                : 'bg-stone-100 text-stone-500 hover:text-stone-900 hover:bg-stone-200'
                                        }`}
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Sidebar Contents (Scrollable setup blocks) */}
                                <div className={`flex-1 overflow-y-auto p-4.5 space-y-5 custom-scrollbar pb-16 transition-colors duration-500 ${isNightMode ? 'bg-stone-900/60' : 'bg-stone-50/50'}`}>
                                    
                                    {/* Section 1: Timbre Sound Signature Choice */}
                                    <div className="space-y-2">
                                        <div className={`text-[10px] font-bold font-mono uppercase tracking-widest border-b pb-1 flex items-center gap-1 ${isNightMode ? 'text-stone-400 border-stone-800' : 'text-stone-550 border-stone-200'}`}>
                                            <Music size={11} className="text-amber-500" /> PIANO SOUND TIMBRE / 音色选择
                                        </div>
                                        <div className="grid grid-cols-1 gap-1.5">
                                            {[
                                                { id: 'grand', tag: '🎹', title: '施坦威 D 大三角 (Grand)', desc: 'Concert Grand • 自研物理解析共鸣音效' },
                                                { id: 'yamaha', tag: '⚡', title: '雅马哈 C7 录音室 (Studio)', desc: 'Bright Studio • 声音颗粒饱满清脆' },
                                                { id: 'bosendorfer', tag: '👑', title: '贝森朵夫帝国 290', desc: 'Imperial Resonance • 皇家恢宏厚重共鸣' },
                                                { id: 'upright', tag: '🪵', title: '古典立式原声琴 (Upright)', desc: 'Vintage Upright • 沙龙古典质朴质感' },
                                                { id: 'ambient', tag: '🌌', title: '梦幻星空环境音 (Ambient)', desc: 'Ethereal Space • 温暖而深邃的延迟云团' },
                                            ].map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setActiveTimbre(t.id as any)}
                                                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all text-xs cursor-pointer ${
                                                        activeTimbre === t.id 
                                                            ? 'bg-amber-400/10 border-amber-450/40 shadow-inner' 
                                                            : isNightMode 
                                                                ? 'bg-stone-950/30 border-stone-850 hover:bg-stone-800 hover:border-stone-700 text-stone-100' 
                                                                : 'bg-white border-stone-200 hover:bg-stone-50 hover:border-stone-300 text-stone-750'
                                                    }`}
                                                >
                                                    <span className="text-sm pt-0.5">{t.tag}</span>
                                                    <div className="flex-1">
                                                        <div className={`font-bold ${activeTimbre === t.id ? 'text-amber-650 font-extrabold' : isNightMode ? 'text-stone-200' : 'text-stone-800'}`}>{t.title}</div>
                                                        <div className={`text-[9.5px] mt-0.5 ${isNightMode ? 'text-stone-400' : 'text-stone-505'}`}>{t.desc}</div>
                                                    </div>
                                                    {activeTimbre === t.id && (
                                                        <span className="text-amber-500 text-[10px] self-center">●</span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Section 2: Keyboard Zoom & Labels Settings */}
                                    <div className={`space-y-2.5 p-3 rounded-xl border ${isNightMode ? 'bg-stone-950/30 border-stone-850' : 'bg-white border-stone-200 shadow-sm'}`}>
                                        <div className={`text-[10px] font-bold font-mono uppercase tracking-widest border-b pb-1 flex items-center gap-1 ${isNightMode ? 'text-stone-400 border-stone-800' : 'text-stone-550 border-stone-200'}`}>
                                            <Eye size={11} className="text-indigo-550" /> DISPLAY & ZOOM / 键盘外观与缩放
                                        </div>

                                        {/* Keynote Labels */}
                                        <div className="space-y-1">
                                            <span className={`text-[10px] block font-medium ${isNightMode ? 'text-stone-450' : 'text-stone-600'}`}>琴键标签 (Keynote Labels)</span>
                                            <div className={`grid grid-cols-3 gap-1 p-1 rounded-lg ${isNightMode ? 'bg-stone-950/50' : 'bg-stone-105'}`}>
                                                {[
                                                    { id: 'all', label: '标全音域' },
                                                    { id: 'c-only', label: '仅标C音' },
                                                    { id: 'none', label: '无键标' },
                                                ].map(opt => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => setFontSizeMode(opt.id as any)}
                                                        className={`py-1 text-[9.5px] font-semibold rounded-md transition-colors cursor-pointer ${fontSizeMode === opt.id ? 'bg-indigo-650 text-white shadow-sm' : isNightMode ? 'text-stone-400 hover:text-white' : 'text-stone-600 hover:text-stone-900 bg-transparent'}`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                         {/* Waterfall Special Effect Styles */}
                                         <div className="space-y-1">
                                             <span className={`text-[10px] block font-semibold ${isNightMode ? 'text-stone-400' : 'text-stone-600'}`}>暖心瀑布粒子特效 (Waterfall VFX Themes)</span>
                                             <div className="grid grid-cols-6 gap-1">
                                                 {[
                                                     { id: 'macaron', emoji: '🍬', name: '马卡龙' },
                                                     { id: 'starry', emoji: '🌟', name: '治愈星空' },
                                                     { id: 'ocean', emoji: '🫧', name: '梦幻海洋' },
                                                     { id: 'forest', emoji: '🍃', name: '晨曦森林' },
                                                     { id: 'sakura', emoji: '🌸', name: '落樱心语' },
                                                     { id: 'custom', emoji: '🎨', name: '自定义' }
                                                 ].map(style => {
                                                     const isSelected = waterfallStyle === style.id;
                                                     return (
                                                         <button
                                                             key={style.id}
                                                             onClick={() => setWaterfallStyle(style.id as any)}
                                                             className={`py-1.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                                                 isSelected 
                                                                     ? 'bg-rose-100 border-rose-300 text-rose-700 font-extrabold shadow-sm scale-102 ring-2 ring-rose-200/50' 
                                                                     : isNightMode 
                                                                         ? 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800 hover:text-stone-200' 
                                                                         : 'bg-[#faf6f0] border-amber-900/10 text-stone-600 hover:bg-white hover:border-amber-900/25'
                                                             }`}
                                                         >
                                                             <span className="text-base leading-none">{style.emoji}</span>
                                                             <span className="text-[8px] font-sans font-bold tracking-tight leading-none truncate w-full text-center">{style.name}</span>
                                                         </button>
                                                     );
                                                 })}
                                             </div>
                                             
                                             {waterfallStyle === 'custom' && (
                                                <div className={`mt-2 p-2.5 rounded-xl border space-y-2 ${isNightMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`}>
                                                    <div className="flex items-center justify-between text-[10px]">
                                                        <span className={isNightMode ? 'text-stone-400' : 'text-stone-600'}>主背景色 (Base Color)</span>
                                                        <input type="color" value={customThemeConfig.baseColor} onChange={(e) => setCustomThemeConfig(prev => ({...prev, baseColor: e.target.value}))} className="w-6 h-6 rounded cursor-pointer" />
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px]">
                                                        <span className={isNightMode ? 'text-stone-400' : 'text-stone-600'}>浅亮色 (Light Bg/Day)</span>
                                                        <input type="color" value={customThemeConfig.bgColor} onChange={(e) => setCustomThemeConfig(prev => ({...prev, bgColor: e.target.value}))} className="w-6 h-6 rounded cursor-pointer" />
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px]">
                                                        <span className={isNightMode ? 'text-stone-400' : 'text-stone-600'}>下落物品字符 (Char)</span>
                                                        <input type="text" maxLength={2} value={customThemeConfig.char} onChange={(e) => setCustomThemeConfig(prev => ({...prev, char: e.target.value}))} className={`w-12 text-center rounded border text-[11px] py-0.5 ${isNightMode ? 'bg-stone-950 border-stone-800 text-white' : 'bg-stone-50 border-stone-300'}`} placeholder="🎵" />
                                                    </div>
                                                </div>
                                             )}
                                         </div>

                                        {/* Key Width Zoom & Auto-Fit */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className={`${isNightMode ? 'text-stone-450' : 'text-stone-600'}`}>键盘宽度缩放与适配</span>
                                                <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => {
                                                    const next = !isAutoFit;
                                                    setIsAutoFit(next);
                                                    try {
                                                        localStorage.setItem('isAutoFit', String(next));
                                                    } catch (_) {}
                                                    if (!next) {
                                                        setWhiteKeyWidth(42); // Reset to cozy default when manual
                                                    }
                                                }}>
                                                    <span className={`text-[8.5px] font-bold px-1 rounded font-mono ${isAutoFit ? 'bg-indigo-500/20 text-indigo-400' : 'bg-stone-500/20 text-stone-400'}`}>
                                                        {isAutoFit ? '自动填充中' : '手动调整'}
                                                     </span>
                                                     <div className={`w-6 h-3.5 rounded-full p-0.5 transition-colors duration-200 ${isAutoFit ? 'bg-indigo-500' : 'bg-stone-600'}`}>
                                                         <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform duration-200 ${isAutoFit ? 'translate-x-2.5' : 'translate-x-0'}`} />
                                                     </div>
                                                </div>
                                            </div>

                                            {!isAutoFit ? (
                                                <div className={`flex items-center gap-2 p-1 rounded-lg justify-between ${isNightMode ? 'bg-stone-950/50' : 'bg-stone-100'}`}>
                                                    <button onClick={zoomOutKeys} className={`px-2.5 py-1 text-[10px] rounded-md cursor-pointer transition-colors ${isNightMode ? 'bg-stone-850 hover:bg-stone-750 text-stone-300 hover:text-white' : 'bg-white hover:bg-stone-50 text-stone-700 shadow-sm'}`}>
                                                        - 缩小
                                                    </button>
                                                    <div className={`h-1 flex-1 mx-2 rounded-lg overflow-hidden relative ${isNightMode ? 'bg-stone-800' : 'bg-stone-200'}`}>
                                                        <div className="absolute top-0 bottom-0 left-0 bg-indigo-500" style={{ width: `${Math.max(0, Math.min(100, ((whiteKeyWidth - 18) / (90 - 18)) * 100))}%` }} />
                                                    </div>
                                                    <button onClick={zoomInKeys} className={`px-2.5 py-1 text-[10px] rounded-md cursor-pointer transition-colors ${isNightMode ? 'bg-stone-850 hover:bg-stone-750 text-stone-300 hover:text-white' : 'bg-white hover:bg-stone-50 text-stone-700 shadow-sm'}`}>
                                                        + 放大
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className={`p-2 rounded-lg text-[9.5px] font-sans leading-relaxed text-center ${isNightMode ? 'bg-indigo-950/20 text-indigo-300/90 border border-indigo-500/15' : 'bg-indigo-50/50 text-indigo-805 border border-indigo-100/60'}`}>
                                                    ✨ <b>自动适配中</b>：白键宽已动态优化至 <b>{whiteKeyWidth.toFixed(1)}px</b>，已填充全部视口。
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Section 2.5: Waterfall Display Customization (瀑布流自定义面板) */}
                                     <div className={`space-y-3.5 p-3 rounded-xl border transition-all duration-500 ${
                                         isNightMode 
                                             ? 'bg-stone-950/30 border-stone-850' 
                                             : 'bg-white border-stone-200 shadow-sm'
                                     }`}>
                                         <div className={`text-[10px] font-bold font-mono uppercase tracking-widest border-b pb-1 flex items-center justify-between ${
                                             isNightMode ? 'text-stone-400 border-stone-800' : 'text-stone-550 border-stone-200'
                                         }`}>
                                             <div className="flex items-center gap-1">
                                                 <Sparkles size={11} className="text-yellow-400" />
                                                 <span>瀑布流自定义 (Waterfall)</span>
                                             </div>
                                             <span className="text-[8.5px] text-stone-500 font-bold">CUSTOM</span>
                                         </div>

                                         {/* 1. Velocity speed slider */}
                                         <div className="space-y-1.5">
                                             <div className="flex justify-between text-[10px] text-stone-400">
                                                 <span>流动速度 (Speed)</span>
                                                 <span className="font-mono text-indigo-400 font-bold">{waterfallSpeed} px/s</span>
                                             </div>
                                             <div className="flex items-center gap-2">
                                                 <input 
                                                     type="range" 
                                                     min="120" 
                                                     max="480" 
                                                     step="30"
                                                     value={waterfallSpeed} 
                                                     onChange={(e) => setWaterfallSpeed(Number(e.target.value))}
                                                     className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500"
                                                 />
                                             </div>
                                         </div>

                                         {/* 2. Glow intensity slider */}
                                         <div className="space-y-1.5">
                                             <div className="flex justify-between text-[10px] text-stone-400">
                                                 <span>霓虹光晕强度 (Glow Aura)</span>
                                                 <span className="font-mono text-indigo-400 font-bold">{Math.round(glowIntensity * 100)}%</span>
                                             </div>
                                             <div className="flex items-center gap-2">
                                                 <input 
                                                     type="range" 
                                                     min="0.0" 
                                                     max="2.5" 
                                                     step="0.25"
                                                     value={glowIntensity} 
                                                     onChange={(e) => setGlowIntensity(Number(e.target.value))}
                                                     className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500"
                                                 />
                                             </div>
                                         </div>

                                         {/* Toggles system */}
                                         <div className="grid grid-cols-2 gap-2 pt-1">
                                             {/* A. Particles toggle */}
                                             <button 
                                                 onClick={() => setParticlesEnabled(!particlesEnabled)}
                                                 className={`p-2 rounded-lg text-left border flex flex-col justify-between transition-all cursor-pointer ${
                                                     particlesEnabled 
                                                         ? 'bg-indigo-600/10 border-indigo-500/50 text-white' 
                                                         : 'bg-stone-900/40 border-stone-850 text-stone-500 hover:text-stone-300'
                                                 }`}
                                             >
                                                 <span className="text-[8px] font-mono text-stone-400 uppercase tracking-wider">星尘微粒</span>
                                                 <div className="flex items-center justify-between w-full mt-1">
                                                     <span className="text-[10px] font-bold">{particlesEnabled ? '已开启' : '已关闭'}</span>
                                                     <span className={`w-1.5 h-1.5 rounded-full ${particlesEnabled ? 'bg-indigo-400 animate-pulse' : 'bg-stone-600'}`} />
                                                 </div>
                                             </button>

                                             {/* B. Guide Lines toggle */}
                                             <button 
                                                 onClick={() => setShowGuideLines(!showGuideLines)}
                                                 className={`p-2 rounded-lg text-left border flex flex-col justify-between transition-all cursor-pointer ${
                                                     showGuideLines 
                                                         ? 'bg-indigo-600/10 border-indigo-500/50 text-white' 
                                                         : 'bg-stone-900/40 border-stone-850 text-stone-500 hover:text-stone-300'
                                                 }`}
                                             >
                                                 <span className="text-[8px] font-mono text-stone-400 uppercase tracking-wider">定位辅助线</span>
                                                 <div className="flex items-center justify-between w-full mt-1">
                                                     <span className="text-[10px] font-bold">{showGuideLines ? '已开启' : '已关闭'}</span>
                                                     <span className={`w-1.5 h-1.5 rounded-full ${showGuideLines ? 'bg-indigo-400 animate-pulse' : 'bg-stone-600'}`} />
                                                 </div>
                                             </button>

                                             {/* C. 3D Reflection toggle */}
                                             <button 
                                                 onClick={() => setShowReflection(!showReflection)}
                                                 className={`col-span-2 p-2 rounded-lg text-left border flex flex-col justify-between transition-all cursor-pointer ${
                                                     showReflection 
                                                         ? 'bg-indigo-600/10 border-indigo-500/50 text-white' 
                                                         : 'bg-stone-900/40 border-stone-850 text-stone-500 hover:text-stone-300'
                                                 }`}
                                             >
                                                 <span className="text-[8px] font-mono text-stone-400 uppercase tracking-wider">琴面板镜面 3D 倒影 (Mirror Glass Reflection)</span>
                                                 <div className="flex items-center justify-between w-full mt-1">
                                                     <span className="text-[10px] font-bold">{showReflection ? '物理倒影渲染中...' : '倒影已隐藏'}</span>
                                                     <span className={`w-1.5 h-1.5 rounded-full ${showReflection ? 'bg-indigo-400 animate-pulse' : 'bg-stone-600'}`} />
                                                 </div>
                                             </button>
                                         </div>
                                     </div>

                                     {/* Section 3: Octave Shortcuts */}
                                    <div className={`space-y-2 p-3 rounded-xl border transition-all duration-500 ${
                                        isNightMode 
                                            ? 'bg-stone-950/30 border-stone-850' 
                                            : 'bg-white border-stone-200 shadow-sm'
                                    }`}>
                                        <div className={`text-[10px] font-bold font-mono uppercase tracking-widest border-b pb-1 flex items-center gap-1 ${
                                            isNightMode ? 'text-stone-400 border-stone-800' : 'text-stone-550 border-stone-200'
                                        }`}>
                                            <Compass size={11} className="text-emerald-500" /> OCTAVE NAVIGATOR / 音区快速横移
                                        </div>
                                        <p className={`text-[9.5px] font-sans ${isNightMode ? 'text-stone-500' : 'text-stone-400'}`}>点击平滑跳转对齐到对应键盘音区：</p>
                                        <div className="grid grid-cols-2 gap-1.5">
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
                                                    className={`px-2 py-1.5 text-center text-[10px] font-semibold rounded-lg transition-colors cursor-pointer ${
                                                        isNightMode 
                                                            ? 'bg-stone-800 hover:bg-stone-750 border border-stone-750 text-stone-200' 
                                                            : 'bg-[#faf6f0] hover:bg-rose-100/30 border border-amber-900/10 text-stone-700 hover:text-rose-700'
                                                    }`}
                                                >
                                                    {def.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Section 4: Physical Soundboard & Dolby Acoustics */}
                                    <div className="space-y-3">
                                        <div className={`text-[10px] font-bold font-mono uppercase tracking-widest border-b pb-1 flex items-center gap-1 ${
                                            isNightMode ? 'text-stone-400 border-stone-800' : 'text-stone-550 border-stone-200'
                                        }`}>
                                            <Sliders size={11} className="text-rose-500" /> DOLBY SURROUND & COUPLING / 杜比与物理共振
                                        </div>

                                        {/* Presets Button Links */}
                                        <div className="space-y-1">
                                            <span className={`text-[10px] block font-medium ${isNightMode ? 'text-stone-400' : 'text-stone-600'}`}>声学场馆快捷模式:</span>
                                            <div className={`grid grid-cols-2 gap-1 p-1 rounded-lg ${isNightMode ? 'bg-stone-950/40' : 'bg-stone-100/90'}`}>
                                                {[
                                                    { name: '录音棚 (Studio)', values: { sb: 0.65, sr: 0.35, hh: 1.25, mode: 'player', height: 0.30, width: 1.10, decay: 1.10, wet: 0.12 } },
                                                    { name: '大厅 (Concert)', values: { sb: 1.10, sr: 0.85, hh: 0.90, mode: 'concert', height: 0.95, width: 1.45, decay: 2.80, wet: 0.45 } },
                                                    { name: '教堂 (Cathedral)', values: { sb: 1.25, sr: 1.15, hh: 0.70, mode: 'cathedral', height: 1.60, width: 1.80, decay: 4.65, wet: 0.65 } },
                                                    { name: '全息 (3D Orbit)', values: { sb: 0.95, sr: 0.98, hh: 1.00, mode: 'dolby360', height: 1.15, width: 1.55, decay: 3.40, wet: 0.48 } },
                                                ].map(preset => (
                                                    <button
                                                        key={preset.name}
                                                        onClick={() => {
                                                            setSoundboardScale(preset.values.sb);
                                                            setSympatheticResonance(preset.values.sr);
                                                            setHammerHardness(preset.values.hh);
                                                            setSpatialDolbyMode(preset.values.mode as any);
                                                            setAtmosHeight(preset.values.height);
                                                            setStereowidth(preset.values.width);
                                                            setReverbDecay(preset.values.decay);
                                                            setReverbWet(preset.values.wet);
                                                        }}
                                                        className={`px-2 py-1 text-[9px] font-bold rounded cursor-pointer transition-colors ${
                                                            isNightMode 
                                                                ? 'bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700/65' 
                                                                : 'bg-white hover:bg-rose-100/30 text-stone-700 border border-stone-200/50 hover:border-amber-900/10'
                                                        }`}
                                                    >
                                                        {preset.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Physical Sliders Column */}
                                        <div className={`space-y-2.5 p-3 rounded-xl border ${
                                            isNightMode ? 'bg-stone-950/40 border-stone-850' : 'bg-white border-stone-200 shadow-sm'
                                        }`}>
                                            
                                            {/* Hammer Hardness */}
                                            <div className="flex flex-col gap-1">
                                                <div className={`flex justify-between text-[10px] font-mono ${isNightMode ? 'text-stone-300' : 'text-stone-600'}`}>
                                                    <span>槌头毛毡硬度 (Hammer)</span>
                                                    <span className={`${isNightMode ? 'text-amber-400' : 'text-amber-600'} font-bold`}>{hammerHardness.toFixed(2)}x</span>
                                                </div>
                                                <input 
                                                    type="range" 
                                                    min="0.5" 
                                                    max="1.70" 
                                                    step="0.05"
                                                    value={hammerHardness} 
                                                    onChange={e => setHammerHardness(parseFloat(e.target.value))}
                                                    className={`w-full h-1 rounded appearance-none cursor-pointer accent-amber-500 ${isNightMode ? 'bg-stone-800' : 'bg-stone-200'}`} 
                                                />
                                            </div>

                                            {/* Spruce soundboard Scale */}
                                            <div className="flex flex-col gap-1">
                                                <div className={`flex justify-between text-[10px] font-mono ${isNightMode ? 'text-stone-300' : 'text-stone-600'}`}>
                                                    <span>音板共鸣木腔 (Spruce)</span>
                                                    <span className={`${isNightMode ? 'text-amber-400' : 'text-amber-600'} font-bold`}>{(soundboardScale * 100).toFixed(0)}%</span>
                                                </div>
                                                <input 
                                                    type="range" 
                                                    min="0.1" 
                                                    max="1.8" 
                                                    step="0.05"
                                                    value={soundboardScale} 
                                                    onChange={e => setSoundboardScale(parseFloat(e.target.value))}
                                                    className={`w-full h-1 rounded appearance-none cursor-pointer accent-amber-500 ${isNightMode ? 'bg-stone-800' : 'bg-stone-200'}`} 
                                                />
                                            </div>

                                            {/* Sympathetic Resonance */}
                                            <div className="flex flex-col gap-1">
                                                <div className={`flex justify-between text-[10px] font-mono ${isNightMode ? 'text-stone-300' : 'text-stone-600'}`}>
                                                    <span>同音双弦共鸣 (Resonance)</span>
                                                    <span className={`${isNightMode ? 'text-emerald-400' : 'text-emerald-600'} font-bold`}>{(sympatheticResonance * 100).toFixed(0)}%</span>
                                                </div>
                                                <input 
                                                    type="range" 
                                                    min="0.0" 
                                                    max="1.50" 
                                                    step="0.05"
                                                    value={sympatheticResonance} 
                                                    onChange={e => setSympatheticResonance(parseFloat(e.target.value))}
                                                    className={`w-full h-1 rounded appearance-none cursor-pointer accent-emerald-500 ${isNightMode ? 'bg-stone-800' : 'bg-stone-200'}`} 
                                                />
                                            </div>

                                            {/* Spatial Dolby HRTF preset */}
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-[10px] font-mono ${isNightMode ? 'text-stone-300' : 'text-stone-600'}`}>HRTF 3D 空间定位模式</span>
                                                <select
                                                    value={spatialDolbyMode}
                                                    onChange={e => setSpatialDolbyMode(e.target.value as any)}
                                                    className={`w-full text-[10.5px] p-1.5 rounded outline-none border cursor-pointer transition-colors duration-300 ${
                                                        isNightMode 
                                                            ? 'bg-stone-800 border-stone-700 text-stone-200' 
                                                            : 'bg-[#faf6f0] border-amber-900/10 text-stone-700 hover:border-amber-900/25'
                                                    }`}
                                                >
                                                    <option value="player" className={isNightMode ? 'bg-stone-900 text-stone-205' : 'bg-white text-stone-700'}>演奏者视角 (Atmos Headphone)</option>
                                                    <option value="concert" className={isNightMode ? 'bg-stone-900 text-stone-205' : 'bg-white text-stone-700'}>舞台区前排 (Concert Front)</option>
                                                    <option value="cathedral" className={isNightMode ? 'bg-stone-900 text-stone-205' : 'bg-white text-stone-700'}>大殿混响云圈 (Cathedral Orbit)</option>
                                                    <option value="dolby360" className={isNightMode ? 'bg-stone-900 text-stone-205' : 'bg-white text-stone-700'}>杜比全息定位 (Hologram 360)</option>
                                                </select>
                                            </div>

                                            {/* Room Reverb Decay */}
                                            <div className="flex flex-col gap-1">
                                                <div className={`flex justify-between text-[10px] font-mono ${isNightMode ? 'text-stone-300' : 'text-stone-600'}`}>
                                                    <span>混响尾音空间时间 (Decay)</span>
                                                    <span className={`${isNightMode ? 'text-emerald-400' : 'text-emerald-600'} font-bold`}>{reverbDecay.toFixed(1)}s</span>
                                                </div>
                                                <input 
                                                    type="range" 
                                                    min="0.4" 
                                                    max="8.0" 
                                                    step="0.1"
                                                    value={reverbDecay} 
                                                    onChange={e => setReverbDecay(parseFloat(e.target.value))}
                                                    className={`w-full h-1 rounded appearance-none cursor-pointer accent-emerald-500 ${isNightMode ? 'bg-stone-800' : 'bg-stone-200'}`} 
                                                />
                                            </div>

                                            {/* Reverb Wet */}
                                            <div className="flex flex-col gap-1">
                                                <div className={`flex justify-between text-[10px] font-mono ${isNightMode ? 'text-stone-300' : 'text-stone-600'}`}>
                                                    <span>湿混声比例 (Wetness)</span>
                                                    <span className={`${isNightMode ? 'text-emerald-400' : 'text-emerald-600'} font-bold`}>{(reverbWet * 100).toFixed(0)}%</span>
                                                </div>
                                                <input 
                                                    type="range" 
                                                    min="0.0" 
                                                    max="0.9" 
                                                    step="0.02"
                                                    value={reverbWet} 
                                                    onChange={e => setReverbWet(parseFloat(e.target.value))}
                                                    className={`w-full h-1 rounded appearance-none cursor-pointer accent-emerald-500 ${isNightMode ? 'bg-stone-800' : 'bg-stone-200'}`} 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section EX: MIDI File Drag & Drop Import */}
                                    <div className={`space-y-2 p-3 rounded-xl border border-dashed transition-colors duration-500 ${
                                        isNightMode 
                                            ? 'bg-stone-950/40 border-indigo-500/25 hover:border-indigo-500/50' 
                                            : 'bg-white border-indigo-400/30 shadow-sm hover:bg-[#faf6f0]/20 hover:border-indigo-500/50'
                                    }`}>
                                        <div className="text-[10px] font-bold font-mono text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                                            <Upload className="animate-pulse" size={11.5} /> LOCAL MIDI FILE IMPORT / 导入本地乐谱
                                        </div>
                                        <div 
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                e.currentTarget.classList.add('bg-indigo-500/5');
                                            }}
                                            onDragLeave={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                e.currentTarget.classList.remove('bg-indigo-500/5');
                                            }}
                                            onDrop={async (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                e.currentTarget.classList.remove('bg-indigo-500/5');
                                                const file = e.dataTransfer.files?.[0];
                                                if (file) {
                                                    const arrayBuffer = await file.arrayBuffer();
                                                    try {
                                                        const parsedNotes = parseMidi(arrayBuffer);
                                                        if (parsedNotes.length === 0) {
                                                            setMidiToast({
                                                                text: '⚠️ 解析失败：未在该 MIDI 文件中找到任何可以对应钢琴键盘的音符音阶。请确保文件是标准的标准 MIDI 文件 (拥有 .mid 扩展名)。',
                                                                type: 'error'
                                                            });
                                                            return;
                                                        }
                                                        const cleanFileName = file.name.replace(/\.[^/.]+$/, "");
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
                                                        triggerSongSwitch(newSongId, () => {
                                                            songTimerRef.current = 0;
                                                            songTriggeredKeysRef.current.clear();
                                                            setSongTimer(0);
                                                            setActiveKeys(new Set());
                                                        });
                                                        setMidiToast({
                                                            text: `🎉 MIDI《${cleanFileName}》导入成功！已提取出 ${parsedNotes.length} 个按键时序。你可以随时启动“瀑布跟弹”或“自动弹奏”！`,
                                                            type: 'success'
                                                        });
                                                    } catch (err: any) {
                                                        setMidiToast({
                                                            text: '⚠️ 导入错误：' + (err.message || '未知 MIDI 解析配置冲突'),
                                                            type: 'error'
                                                        });
                                                    }
                                                }
                                            }}
                                            className={`border rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer group transition-all text-center ${
                                                isNightMode 
                                                    ? 'border-stone-850 bg-stone-950/80 hover:bg-stone-900/40 text-stone-200' 
                                                    : 'border-[#dfd4c0]/80 bg-[#faf6f0]/40 hover:bg-[#fffdfa]/80 text-stone-800'
                                            }`}
                                        >
                                            <div className="p-1.5 rounded-full bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition-transform">
                                                <Upload size={14} />
                                            </div>
                                            <div className="space-y-0.5 pointer-events-none">
                                                <span className={`text-[10px] font-bold block ${isNightMode ? 'text-stone-200' : 'text-stone-800'}`}>点击本区域选择乐谱 或 直接拖拽 MIDI 至此</span>
                                                <span className={`text-[8.5px] block font-mono ${isNightMode ? 'text-stone-550' : 'text-stone-500'}`}>支持 *.mid, *.midi 文件 (自动提取 88 健按键)</span>
                                            </div>
                                            <input 
                                                type="file" 
                                                accept=".mid,.midi" 
                                                onChange={handleMidiImport} 
                                                className="hidden" 
                                                id="sidebar-midi-file-input"
                                            />
                                            <label 
                                                htmlFor="sidebar-midi-file-input" 
                                                className="mt-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[9px] rounded-full transition-colors cursor-pointer block"
                                            >
                                                浏览本地文件
                                            </label>
                                        </div>
                                    </div>

                                    {/* Section 5: Keyboard Shortcuts Guide */}
                                    <div className={`p-3 rounded-xl border space-y-1 ${
                                        isNightMode 
                                            ? 'bg-stone-950/40 border-stone-850' 
                                            : 'bg-white border-stone-200 shadow-sm'
                                    }`}>
                                        <div className={`text-[10px] font-bold font-mono flex items-center gap-1 ${
                                            isNightMode ? 'text-stone-400' : 'text-stone-600'
                                        }`}>
                                            <Compass size={12} className="text-amber-500" /> STAGE KEYSTROKES
                                        </div>
                                        <p className={`text-[10px] leading-relaxed font-sans ${
                                            isNightMode ? 'text-stone-400' : 'text-stone-600'
                                        }`}>
                                            PC键盘投射：英文字母 <span className="font-mono text-amber-500 font-bold">A S D F G H J K L ;</span> 映射至标准中音区(C4)，键盘的<span className="font-mono text-amber-500 font-bold">【空格键】</span>可控制暂停/自动弹奏。
                                        </p>
                                    </div>

                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* --- 2. INTERACTIVE STAGE & WATERFALL CANVAS --- */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.97, filter: "blur(10px)" }}
                    animate={{ 
                        opacity: isExiting ? 0 : 1, 
                        scale: isExiting ? 0.94 : 1,
                        filter: isExiting ? "blur(16px)" : "blur(0px)"
                    }}
                    transition={{ 
                        type: "spring",
                        stiffness: 140,
                        damping: 24,
                        delay: isExiting ? 0 : 0.05
                    }}
                    className={`flex-1 min-h-0 flex flex-col relative w-full overflow-hidden transition-colors duration-500 ${
                        isNightMode ? 'bg-stone-950' : 'bg-[#FAF6F0]'
                    }`}
                >
                    
                    {/* The Full Width Scroll wrapper for Canvas + Keyboard */}
                    <div 
                        ref={keyboardScrollRef}
                        className="flex-1 w-full overflow-x-auto overflow-y-hidden custom-scrollbar relative flex flex-col"
                    >
                        {/* Renderable inner space spanning exact full physical width of 52 white keys with 3D cheek blocks */}
                        <div 
                            className={`flex-1 flex flex-col relative min-h-full transition-colors duration-500 ${
                                isNightMode ? 'bg-stone-950' : 'bg-[#FAF6F0]'
                            }`}
                            style={{ width: `${52 * whiteKeyWidth + 64}px` }}
                        >
                            {/* --- Left 3D Wood Cheek Block --- */}
                            <div 
                                className={`absolute top-0 bottom-0 left-0 ${
                                    isNightMode 
                                        ? 'bg-stone-900 border-stone-950 shadow-[5px_0_15px_rgba(0,0,0,0.65)]' 
                                        : 'bg-[#faf6f0]/40 border-rose-100/30 shadow-[5px_0_15px_rgba(253,164,175,0.06)]'
                                } border-r flex flex-col justify-between items-center z-20 transition-colors duration-500`}
                                style={{ width: '32px' }}
                            >
                                <div className="w-5 h-2.5 bg-gradient-to-r from-amber-600 to-amber-400 rounded-sm mt-3 opacity-90 shadow-[0_1px_3px_rgba(0,0,0,0.4)]" />
                                <span className="text-[7.5px] font-mono tracking-widest text-amber-500/40 uppercase rotate-90 my-auto origin-center font-black select-none leading-none">
                                    CONCERT D-274
                                </span>
                                <div className="w-5 h-4 bg-gradient-to-r from-amber-600 to-amber-500 rounded-sm mb-[22px] opacity-80 shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                            </div>

                            {/* --- Right 3D Wood Cheek Block --- */}
                            <div 
                                className={`absolute top-0 bottom-0 right-0 ${
                                    isNightMode 
                                        ? 'bg-stone-900 border-stone-950 shadow-[-5px_0_15px_rgba(0,0,0,0.65)]' 
                                        : 'bg-[#faf6f0]/40 border-rose-100/30 shadow-[-5px_0_15px_rgba(253,164,175,0.06)]'
                                } border-l flex flex-col justify-between items-center z-20 transition-colors duration-500`}
                                style={{ width: '32px' }}
                            >
                                <div className="w-5 h-2.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-sm mt-3 opacity-90 shadow-[0_1px_3px_rgba(0,0,0,0.4)]" />
                                <span className="text-[7.5px] font-mono tracking-widest text-amber-500/40 uppercase rotate-90 my-auto origin-center font-black select-none leading-none">
                                    STEINWAY STUDIO
                                </span>
                                <div className="w-5 h-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-sm mb-[22px] opacity-80 shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                            </div>

                            {/* --- Center Active Playing Stage (Offset by 32px cheekblocks) --- */}
                            <div 
                                className="absolute top-0 bottom-0 flex flex-col"
                                style={{ left: '32px', width: `${52 * whiteKeyWidth}px` }}
                            >
                                {/* Falling Notes Canvas Container */}
                                <div className="flex-1 relative w-full h-full">
                                    <canvas 
                                        ref={canvasRef} 
                                        className="absolute inset-0 w-full h-full z-0 block pointer-events-none"
                                    />


                                    
                                    {/* Ultra-sleek HUD center bar (Concert Master Control Panel) */}
                                    {activeSong.id !== 'free' && (
                                        <div 
                                             onMouseEnter={() => setIsHudVisible(true)}
                                             className={`absolute top-4 left-1/2 -translate-x-1/2 z-30 px-5 py-3.5 rounded-2xl backdrop-blur-2xl border flex flex-col gap-3 w-[440px] max-w-[90vw] shadow-2xl transition-all duration-700 pointer-events-auto ${
                                            isNightMode 
                                                ? 'bg-stone-950/80 border-stone-800/80 shadow-black/80 text-white' 
                                                : `bg-white/94 border-stone-200/60 ${vfxTheme.ring} text-stone-800`
                                        } ${isHudVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 pointer-events-none'}`}>
                                            
                                            {/* Header Row: Title and Main Action Controls */}
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    {/* Pulse Indicator */}
                                                    <div className={`w-2 h-2 rounded-full shrink-0 ${isPlaying ? 'bg-emerald-450 animate-pulse' : 'bg-stone-500'}`} />
                                                    <div className="text-left min-w-0">
                                                        <span className={`text-[8px] font-sans font-black block tracking-widest uppercase leading-none ${isNightMode ? 'text-stone-400' : 'text-stone-500'}`}>NOW PLAYING</span>
                                                        <span className={`font-black text-[11.5px] font-sans block mt-1 tracking-tight leading-none truncate ${isNightMode ? 'text-white' : 'text-stone-900'}`} title={activeSong.title}>
                                                            {activeSong.title}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* Audio Control Action row */}
                                                <div className="flex items-center gap-1 shrink-0">
                                                    {/* Play / Pause button */}
                                                    <button
                                                        onClick={() => setIsPlaying(!isPlaying)}
                                                        className={`p-1.5 rounded-lg transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer ${
                                                            isPlaying 
                                                                ? 'bg-amber-400 text-stone-900 shadow-md shadow-amber-400/20' 
                                                                : `${vfxTheme.primary} shadow-md`
                                                        }`}
                                                        title={isPlaying ? '暂停 (Pause)' : '播放 (Play)'}
                                                    >
                                                        {isPlaying ? <Pause size={11} fill="currentColor" /> : <Play size={11} fill="currentColor" />}
                                                    </button>

                                                    {/* Loop practicing activation */}
                                                    <button
                                                        onClick={() => {
                                                            setLoopEnabled(!loopEnabled);
                                                            if (!loopEnabled && (songTimer < loopStart || songTimer > loopEnd)) {
                                                                jumpToTime(loopStart);
                                                            }
                                                        }}
                                                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                                            loopEnabled 
                                                                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/10' 
                                                                : isNightMode ? 'hover:bg-stone-850 text-stone-400' : 'hover:bg-stone-200 text-stone-600'
                                                        }`}
                                                        title={loopEnabled ? '关闭循环区间' : '开启自定义时段循环练习'}
                                                    >
                                                        <Repeat size={11} className={loopEnabled ? "animate-pulse" : ""} />
                                                    </button>

                                                    {/* Restart button */}
                                                    <button
                                                        onClick={restartSong}
                                                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                                            isNightMode ? 'hover:bg-stone-850 text-stone-400 hover:text-white' : 'hover:bg-stone-200 text-stone-600 hover:text-stone-900'
                                                        }`}
                                                        title="重新开始"
                                                    >
                                                        <RotateCcw size={11} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Progress slider bar with interactive scrubbing */}
                                            <div className="space-y-1.5 w-full">
                                                <div className="relative flex items-center group w-full">
                                                    <input 
                                                        type="range" 
                                                        min="0" 
                                                        max={activeSongDuration || 1} 
                                                        step="0.05"
                                                        value={songTimer} 
                                                        onChange={e => jumpToTime(parseFloat(e.target.value))}
                                                        className={`w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--thumb-color)] [&::-webkit-slider-thumb]:shadow-md ${
                                                            isNightMode ? 'bg-stone-800' : 'bg-stone-200'
                                                        }`}
                                                        style={{
                                                            '--thumb-color': isNightMode ? '#fbbf24' : vfxTheme.track,
                                                            background: (() => {
                                                                const pct = (songTimer / (activeSongDuration || 1)) * 100;
                                                                const accentColor = isNightMode ? '#fbbf24' : vfxTheme.track;
                                                                const trackBg = isNightMode ? '#27272a' : '#e4e4e7';
                                                                
                                                                // If loop is active, paint the loop interval track using dynamic theme colors
                                                                if (loopEnabled) {
                                                                    const startPct = (loopStart / (activeSongDuration || 1)) * 100;
                                                                    const endPct = (loopEnd / (activeSongDuration || 1)) * 100;
                                                                    const midColor = vfxTheme.track;
                                                                    const spanColor = isNightMode ? vfxTheme.trackBgDark : vfxTheme.trackBg;
                                                                    return `linear-gradient(to right, ${trackBg} 0%, ${trackBg} ${startPct}%, ${spanColor} ${startPct}%, ${midColor} ${startPct}%, ${midColor} ${pct}%, ${spanColor} ${pct}%, ${spanColor} ${endPct}%, ${trackBg} ${endPct}%, ${trackBg} 100%)`;
                                                                }
                                                                return `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${pct}%, ${trackBg} ${pct}%, ${trackBg} 100%)`;
                                                            })()
                                                        }}
                                                    />
                                                </div>

                                                {/* Timer Displays */}
                                                <div className="flex justify-between items-center text-[9px] font-mono text-stone-500 tracking-tight">
                                                    <div className="flex items-center gap-1">
                                                        <span>{(() => {
                                                            const mins = Math.floor(songTimer / 60);
                                                            const secs = Math.floor(songTimer % 60);
                                                            return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
                                                        })()}</span>
                                                        <span className="opacity-40">/</span>
                                                        <span>{(() => {
                                                            const mins = Math.floor(activeSongDuration / 60);
                                                            const secs = Math.floor(activeSongDuration % 60);
                                                            return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
                                                        })()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                                        {loopEnabled && (
                                                            <span className={`text-[8px] font-sans tracking-widest uppercase px-1 rounded-sm scale-90 ${vfxTheme.themeTag}`}>
                                                                LOOP ACTIVE
                                                            </span>
                                                        )}
                                                        <span className={isNightMode ? 'text-amber-400' : vfxTheme.text}>
                                                            {isPracticeMode ? '跟弹互动模式' : '自动演奏模式'}进度:{' '}
                                                            <strong className="font-bold">
                                                                {Math.min(100, Math.floor((songTimer / (activeSongDuration || 1)) * 100))}%
                                                            </strong>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Sub-panel layout: Custom practice timeframe controller (appears if loopEnabled active) */}
                                            {loopEnabled && (
                                                <div className={`p-2 rounded-xl flex flex-col gap-2 transition-all ${
                                                    isNightMode ? 'bg-black/40 border border-stone-850' : 'bg-[#FAF8F5] border border-[#8b5a2b]/10'
                                                }`}>
                                                    <div className="flex items-center justify-between text-[9px] font-medium">
                                                        <span className={isNightMode ? 'text-stone-400' : 'text-stone-600'}>🎯 自定义时段循环练习</span>
                                                        <span className="text-amber-500 font-mono scale-95">区间长度: {Math.max(0, Math.floor(loopEnd - loopStart))} 秒</span>
                                                    </div>

                                                    <div className="flex items-center justify-between gap-2 text-[9.5px]">
                                                        {/* Loop Start dial input */}
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-stone-500 text-[8px] uppercase">START:</span>
                                                            <input 
                                                                type="range"
                                                                min="0"
                                                                max={activeSongDuration ? Math.max(0, activeSongDuration - 1) : 0}
                                                                step="1"
                                                                value={loopStart}
                                                                onChange={e => {
                                                                    const val = Math.min(parseFloat(e.target.value), loopEnd - 1);
                                                                    setLoopStart(val);
                                                                    if (songTimerRef.current < val) {
                                                                        jumpToTime(val);
                                                                    }
                                                                }}
                                                                style={{ accentColor: vfxTheme.track }}
                                                                className="w-16 h-1 bg-stone-800 rounded"
                                                            />
                                                            <span className={`font-mono font-bold ${isNightMode ? 'text-stone-300' : 'text-stone-705'}`}>{(() => {
                                                                const mins = Math.floor(loopStart / 60);
                                                                const secs = Math.floor(loopStart % 60);
                                                                return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
                                                            })()}</span>
                                                        </div>

                                                        {/* Quick segment presets */}
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => {
                                                                    setLoopStart(0);
                                                                    setLoopEnd(activeSongDuration / 2);
                                                                    jumpToTime(0);
                                                                }}
                                                                className={`px-1.5 py-0.5 text-[8.5px] rounded border ${
                                                                    isNightMode ? 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white' : 'bg-white border-stone-250 text-stone-600 hover:text-stone-900'
                                                                } cursor-pointer scale-90`}
                                                            >
                                                                前段
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setLoopStart(activeSongDuration / 2);
                                                                    setLoopEnd(activeSongDuration);
                                                                    jumpToTime(activeSongDuration / 2);
                                                                }}
                                                                className={`px-1.5 py-0.5 text-[8.5px] rounded border ${
                                                                    isNightMode ? 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white' : 'bg-white border-stone-250 text-stone-600 hover:text-stone-900'
                                                                } cursor-pointer scale-90`}
                                                            >
                                                                后段
                                                            </button>
                                                        </div>

                                                        {/* Loop End dial input */}
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-stone-500 text-[8px] uppercase">END:</span>
                                                            <input 
                                                                type="range"
                                                                min="1"
                                                                max={activeSongDuration || 1}
                                                                step="1"
                                                                value={loopEnd}
                                                                onChange={e => {
                                                                    const val = Math.max(parseFloat(e.target.value), loopStart + 1);
                                                                    setLoopEnd(val);
                                                                    if (songTimerRef.current > val) {
                                                                        jumpToTime(loopStart);
                                                                    }
                                                                }}
                                                                style={{ accentColor: vfxTheme.track }}
                                                                className="w-16 h-1 bg-stone-800 rounded"
                                                            />
                                                            <span className={`font-mono font-bold ${isNightMode ? 'text-stone-300' : 'text-stone-705'}`}>{(() => {
                                                                const mins = Math.floor(loopEnd / 60);
                                                                const secs = Math.floor(loopEnd % 60);
                                                                return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
                                                            })()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Compact minimalist HUD keyboard helper badge */}
                                    <div className={`absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full backdrop-blur-xl border text-[10px] font-medium font-sans flex items-center gap-2 shadow-lg transition-all duration-500 ${
                                        isNightMode 
                                            ? 'bg-stone-900/70 border-stone-800/80 text-stone-300 shadow-black/20' 
                                            : `bg-white/80 ${vfxTheme.border} text-stone-600 shadow-rose-950/5`
                                    } pointer-events-none`}>
                                        <Keyboard size={11} className={isNightMode ? 'text-amber-400' : vfxTheme.text} />
                                        <span>键盘 [A-S-D-F-G-H-J] 映射中音区 C4 | 支持 MIDI 外设即插即弹</span>
                                    </div>
                                </div>

                                {/* --- 3. 88-KEY PHYSICAL MODEL KEYBOARD --- */}
                                <motion.div 
                                    initial={{ y: 180, opacity: 0 }}
                                    animate={{ 
                                        y: isExiting ? 180 : 0, 
                                        opacity: isExiting ? 0 : 1 
                                    }}
                                    transition={{ 
                                        type: "spring",
                                        stiffness: 130,
                                        damping: 22,
                                        mass: 1,
                                        delay: isExiting ? 0 : 0.25
                                    }}
                                    className={`h-[210px] relative w-full select-none z-10 shrink-0 border-t transition-colors duration-500 ${
                                        isNightMode ? 'border-stone-850 bg-stone-950' : 'border-rose-100/50 bg-[#FAF6F0]'
                                    }`}
                                >
                                    
                                    {/* 3D Gold Polished Fallboard & Red Felt Cushion Overlay (Sits perfectly above key tops) */}
                                    <div 
                                        className="absolute inset-x-0 z-20 pointer-events-none flex flex-col"
                                        style={{ top: '-11px', height: '24px' }}
                                    >
                                        {/* 3D Wood Backboard Panel with gold trim luster */}
                                        <div className={`h-2.5 w-full border-t transition-colors duration-500 ${
                                            isNightMode 
                                                ? 'bg-gradient-to-b from-stone-900 to-stone-950 border-stone-850/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' 
                                                : 'bg-gradient-to-b from-[#e2d5c1] to-[#cfbfab] border-[#eadfcb] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]'
                                        }`} />
                                        {/* Velvet Red Felt Cushion Strip */}
                                        <div className={`h-1 w-full transition-colors duration-500 ${
                                            isNightMode 
                                                ? 'bg-rose-700 border-b border-rose-950 shadow-[0_1px_2px_rgba(0,0,0,0.55)]' 
                                                : 'bg-rose-500 border-b border-rose-400 shadow-[0_1px_2px_rgba(239,68,68,0.25)]'
                                        }`} />
                                        {/* Physical shade casting down over keys tops */}
                                        <div className={`h-3.5 w-full bg-gradient-to-b ${
                                            isNightMode 
                                                ? 'from-black/85 to-transparent' 
                                                : 'from-amber-950/20 to-transparent'
                                        }`} />
                                    </div>

                                    {/* Bottom Piano Keybed Rim / Cushion Stopper Stopper */}
                                    <div 
                                        className={`absolute bottom-0 inset-x-0 h-3 z-15 transition-all duration-500 border-t flex items-center justify-center ${
                                            isNightMode 
                                                ? 'bg-gradient-to-b from-stone-900 to-stone-950 border-stone-800 shadow-[0_-2px_10px_rgba(0,0,0,0.6)]' 
                                                : 'bg-gradient-to-b from-[#dfd4c0] to-[#cbbba3] border-[#ecdcb7]/80 shadow-[0_-2px_8px_rgba(139,92,26,0.08)]'
                                        }`}
                                    >
                                        {/* Subtle brass strip inset line for grand piano look */}
                                        <div className={`h-[1px] w-full ${isNightMode ? 'bg-amber-500/10' : 'bg-amber-600/30'}`} />
                                    </div>
                                    
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

                                            // Sophisticated dynamic key gradient background depending on selected effect profile
                                            const backgroundStyle = isActive
                                                ? (!isNightMode
                                                    ? (waterfallStyle === 'starry'
                                                        ? 'linear-gradient(to bottom, #faf5ff 0%, #c7d2fe 30%, #ffc078 100%)'
                                                        : waterfallStyle === 'ocean'
                                                            ? 'linear-gradient(to bottom, #ecfeff 0%, #a5f3fc 30%, #22d3ee 100%)'
                                                            : waterfallStyle === 'forest'
                                                                ? 'linear-gradient(to bottom, #f0fdf4 0%, #bbf7d0 30%, #34d399 100%)'
                                                                : waterfallStyle === 'sakura'
                                                                    ? 'linear-gradient(to bottom, #fff5f5 0%, #fecdd3 30%, #ff85a2 100%)'
                                                                    : 'linear-gradient(to bottom, #fff1f2 0%, #ffe4e6 30%, #fbcfe8 100%)' // Macaron
                                                    )
                                                    : (waterfallStyle === 'starry'
                                                        ? 'linear-gradient(to bottom, #1e1b4b 0%, #4338ca 35%, #ffc078 100%)'
                                                        : waterfallStyle === 'ocean'
                                                            ? 'linear-gradient(to bottom, #075985 0%, #0284c7 35%, #38bdf8 100%)'
                                                            : waterfallStyle === 'forest'
                                                                ? 'linear-gradient(to bottom, #064e3b 0%, #059669 35%, #6ee7b7 100%)'
                                                                : waterfallStyle === 'sakura'
                                                                    ? 'linear-gradient(to bottom, #500724 0%, #be185d 35%, #ff758f 100%)'
                                                                    : 'linear-gradient(to bottom, #4c0519 0%, #db2777 35%, #fda4af 100%)' // Macaron night
                                                    )
                                                )
                                                : isCorrectPractice
                                                    ? 'linear-gradient(to bottom, #047857 0%, #10b981 12%, #34d399 88%, #059669 100%)'
                                                    : (!isNightMode
                                                        ? 'linear-gradient(to bottom, #eae6e1 0%, #ffffff 8%, #ffffff 92%, #faf6f0 96%, #e6dfd5 100%)'
                                                        : 'linear-gradient(to bottom, #dcd7d4 0%, #fafaf9 4%, #ffffff 18%, #ffffff 92%, #e5e5e7 96%, #a1a1aa 100%)'
                                                    );

                                            const boxShadowStyle = isActive
                                                ? (!isNightMode
                                                    ? (waterfallStyle === 'starry'
                                                        ? 'inset 0 8px 10px rgba(0,0,0,0.06), inset 1px 0 0 rgba(255,255,255,0.45), 0 0 15px rgba(129, 140, 248, 0.45)'
                                                        : waterfallStyle === 'ocean'
                                                            ? 'inset 0 8px 10px rgba(0,0,0,0.05), inset 1px 0 0 rgba(255,255,255,0.45), 0 0 15px rgba(34, 211, 238, 0.4)'
                                                            : waterfallStyle === 'forest'
                                                                ? 'inset 0 8px 10px rgba(0,0,0,0.05), inset 1px 0 0 rgba(255,255,255,0.45), 0 0 12px rgba(52, 211, 153, 0.35)'
                                                                : waterfallStyle === 'sakura'
                                                                    ? 'inset 0 8px 10px rgba(0,0,0,0.06), inset 1px 0 0 rgba(255,255,255,0.45), 0 0 15px rgba(255, 133, 162, 0.45)'
                                                                    : 'inset 0 8px 10px rgba(0,0,0,0.06), inset 1px 0 0 rgba(255,255,255,0.45), 0 0 15px rgba(244, 63, 94, 0.45)' // Macaron default
                                                    )
                                                    : (waterfallStyle === 'starry'
                                                        ? 'inset 0 15px 16px rgba(0,0,0,0.45), inset 1px 0 0 rgba(255,255,255,0.25), 0 0 25px rgba(129, 140, 248, 0.95)'
                                                        : waterfallStyle === 'ocean'
                                                            ? 'inset 0 15px 16px rgba(0,0,0,0.4), inset 1px 0 0 rgba(255,255,255,0.15), 0 0 22px rgba(56, 189, 248, 0.85)'
                                                            : waterfallStyle === 'forest'
                                                                ? 'inset 0 15px 16px rgba(0,0,0,0.5), inset 1px 0 0 rgba(255,255,255,0.1), 0 0 20px rgba(110, 231, 183, 0.8)'
                                                                : waterfallStyle === 'sakura'
                                                                    ? 'inset 0 15px 16px rgba(0,0,0,0.45), inset 1px 0 0 rgba(255,255,255,0.2), 0 0 24px rgba(255, 117, 143, 0.95)'
                                                                    : 'inset 0 15px 16px rgba(0,0,0,0.45), inset 1px 0 0 rgba(255,255,255,0.15), 0 0 22px rgba(253, 164, 175, 0.95)' // Macaron night default
                                                    )
                                                )
                                                : (!isNightMode
                                                    ? 'inset 1px 0 0 rgba(255,255,255,1), inset -1px 0 0 rgba(0,0,0,0.06), 0 1.5px 3px rgba(0,0,0,0.06)'
                                                    : 'inset 1px 0 0 rgba(255,255,255,0.7), inset -1px 0 0 rgba(0,0,0,0.1), 0 3px 5px rgba(0,0,0,0.15)'
                                                );

                                            return (
                                                <button
                                                    key={key.index}
                                                    onMouseDown={() => playNote(key.index)}
                                                    onMouseUp={() => stopNote(key.index)}
                                                    onMouseLeave={() => { if (activeKeys.has(key.index)) stopNote(key.index); }}
                                                    onTouchStart={(e) => { e.preventDefault(); playNote(key.index); }}
                                                    onTouchEnd={(e) => { e.preventDefault(); stopNote(key.index); }}
                                                    className="absolute flex flex-col justify-end items-center pb-4 border-r border-stone-200 rounded-b-[5px] select-none touch-none overflow-hidden"
                                                    style={{
                                                        left: `${pos.left}px`,
                                                        width: `${pos.width}px`,
                                                        top: '-10px',
                                                        height: 'calc(100% + 10px - 14px)',
                                                        background: backgroundStyle,
                                                        color: isActive ? '#ffffff' : '#4b5563',
                                                        boxShadow: boxShadowStyle,
                                                        transform: isActive 
                                                            ? 'translateY(5px)' 
                                                            : 'translateY(0)',
                                                        transformOrigin: 'top center',
                                                        transition: 'transform 0.05s ease-out, background 0.05s ease-out, box-shadow 0.05s ease-out'
                                                    }}
                                                >
                                                    {/* Shiny polished gloss layer overlay */}
                                                    <div className="absolute inset-y-1.5 left-0.5 w-[3px] bg-gradient-to-r from-white/20 to-transparent pointer-events-none rounded-sm z-10" />

                                                    {/* Style-specific keyboard key animation overlays */}
                                                    {isActive && (
                                                        <>
                                                            {waterfallStyle === 'forest' && (
                                                                <div className="absolute inset-x-0 bottom-0 top-[50%] bg-gradient-to-t from-emerald-500/20 to-transparent animate-pulse pointer-events-none" />
                                                            )}
                                                            {waterfallStyle === 'starry' && (
                                                                <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-b from-yellow-250 to-transparent opacity-80 blur-[1px] animate-pulse pointer-events-none" />
                                                            )}
                                                            {waterfallStyle === 'sakura' && (
                                                                <div className="absolute inset-0 bg-rose-250/15 animate-pulse pointer-events-none" />
                                                            )}
                                                            {waterfallStyle === 'ocean' && (
                                                                <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-cyan-400/20 to-transparent animate-pulse pointer-events-none" />
                                                            )}
                                                        </>
                                                    )}

                                                    {/* Text marker details */}
                                                    {showLabel && (
                                                        <span className={`text-[10px] font-black uppercase tracking-tight select-none font-sans pointer-events-none z-10 ${isActive ? 'text-white' : 'text-stone-400'}`}>
                                                            {key.name}
                                                        </span>
                                                    )}
                                                    {key.name === 'C4' && (
                                                        <span className="absolute top-2.5 text-[8.5px] uppercase font-black tracking-wider text-amber-500 pointer-events-none bg-amber-400/15 py-0.5 px-1.5 rounded-full ring-1 ring-amber-400/20 z-10">
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

                                            const backgroundStyle = isActive
                                                ? (!isNightMode
                                                    ? (waterfallStyle === 'starry'
                                                        ? 'linear-gradient(to bottom, #4338ca 0%, #6366f1 15%, #ffc078 100%)'
                                                        : waterfallStyle === 'ocean'
                                                            ? 'linear-gradient(to bottom, #0284c7 0%, #0ea5e9 15%, #a5f3fc 100%)'
                                                            : waterfallStyle === 'forest'
                                                                ? 'linear-gradient(to bottom, #047857 0%, #059669 15%, #bbf7d0 100%)'
                                                                : waterfallStyle === 'sakura'
                                                                    ? 'linear-gradient(to bottom, #be185d 0%, #db2777 15%, #fecdd3 100%)'
                                                                    : 'linear-gradient(to bottom, #9d174d 0%, #db2777 15%, #fbcfe8 100%)' // Macaron
                                                    )
                                                    : (waterfallStyle === 'starry'
                                                        ? 'linear-gradient(to bottom, #1e1b4b 0%, #312e81 15%, #ffc078 100%)'
                                                        : waterfallStyle === 'ocean'
                                                            ? 'linear-gradient(to bottom, #075985 0%, #0369a1 15%, #38bdf8 100%)'
                                                            : waterfallStyle === 'forest'
                                                                ? 'linear-gradient(to bottom, #064e3b 0%, #047857 15%, #6ee7b7 100%)'
                                                                : waterfallStyle === 'sakura'
                                                                    ? 'linear-gradient(to bottom, #500724 0%, #881337 15%, #ff758f 100%)'
                                                                    : 'linear-gradient(to bottom, #4c0519 0%, #9f1239 15%, #fda4af 100%)' // Macaron night
                                                    )
                                                )
                                                : isCorrectPractice
                                                    ? 'linear-gradient(to right, #064e3b 0%, #10b981 25%, #6ee7b7 60%, #059669 85%, #022c22 100%)'
                                                    : (!isNightMode
                                                        ? 'linear-gradient(to right, #100f0d 0%, #302d28 18%, #282420 45%, #12100f 88%, #050504 100%)'
                                                        : 'linear-gradient(to right, #141210 0%, #3a3530 18%, #2e2a24 45%, #151311 88%, #080706 100%)'
                                                    );

                                            const boxShadowStyle = isActive
                                                ? (!isNightMode
                                                    ? (waterfallStyle === 'starry'
                                                        ? '-1px 1px 1.5px rgba(0,0,0,0.2), inset 0 8px 10px rgba(0,0,0,0.2), 0 0 12px rgba(129, 140, 248, 0.45)'
                                                        : waterfallStyle === 'ocean'
                                                            ? '-1px 1px 1.5px rgba(0,0,0,0.2), inset 0 8px 10px rgba(0,0,0,0.2), 0 0 12px rgba(34, 211, 238, 0.4)'
                                                            : waterfallStyle === 'forest'
                                                                ? '-1px 1px 1.5px rgba(0,0,0,0.2), inset 0 8px 10px rgba(0,0,0,0.2), 0 0 10px rgba(52, 211, 153, 0.35)'
                                                                : waterfallStyle === 'sakura'
                                                                    ? '-1px 1px 1.5px rgba(0,0,0,0.2), inset 0 8px 10px rgba(0,0,0,0.2), 0 0 12px rgba(255, 133, 162, 0.45)'
                                                                    : '-1px 1px 1.5px rgba(0,0,0,0.2), inset 0 8px 10px rgba(0,0,0,0.2), 0 0 12px rgba(244, 63, 94, 0.45)' // Macaron default
                                                    )
                                                    : (waterfallStyle === 'starry'
                                                        ? '-1px 1.5px 2px rgba(0,0,0,0.4), inset 0 10px 12px rgba(0,0,0,0.45), 0 0 22px rgba(129, 140, 248, 0.95)'
                                                        : waterfallStyle === 'ocean'
                                                            ? '-1px 1.5px 2px rgba(0,0,0,0.4), inset 0 10px 12px rgba(0,0,0,0.45), 0 0 20px rgba(56, 189, 248, 0.85)'
                                                            : waterfallStyle === 'forest'
                                                                ? '-1px 1.5px 2px rgba(0,0,0,0.4), inset 0 10px 12px rgba(0,0,0,0.45), 0 0 18px rgba(110, 231, 183, 0.8)'
                                                                : waterfallStyle === 'sakura'
                                                                    ? '-1px 1.5px 2px rgba(0,0,0,0.4), inset 0 10px 12px rgba(0,0,0,0.45), 0 0 20px rgba(255, 117, 143, 0.95)'
                                                                    : '-1px 1.5px 2px rgba(0,0,0,0.4), inset 0 10px 12px rgba(0,0,0,0.45), 0 0 20px rgba(253, 164, 175, 0.95)' // Macaron night default
                                                    )
                                                )
                                                : (!isNightMode
                                                    ? '-1.5px 2px 4px rgba(0,0,0,0.4), inset 1px 1px 1px rgba(255,255,255,0.1)'
                                                    : '-2px 3px 6px rgba(0,0,0,0.5), inset 1px 1px 1px rgba(255,255,255,0.15)'
                                                );

                                            return (
                                                <button
                                                    key={key.index}
                                                    onMouseDown={() => playNote(key.index)}
                                                    onMouseUp={() => stopNote(key.index)}
                                                    onMouseLeave={() => { if (activeKeys.has(key.index)) stopNote(key.index); }}
                                                    onTouchStart={(e) => { e.preventDefault(); playNote(key.index); }}
                                                    onTouchEnd={(e) => { e.preventDefault(); stopNote(key.index); }}
                                                    className="absolute pointer-events-auto rounded-b-[4px] select-none touch-none overflow-hidden"
                                                    style={{
                                                        left: `${pos.left}px`,
                                                        width: `${pos.width}px`,
                                                        top: '-10px',
                                                        height: 'calc(62% + 10px - 7px)', // Standard physical black key height ratio plus extension
                                                        background: backgroundStyle,
                                                        border: '1px solid #141210',
                                                        boxShadow: boxShadowStyle,
                                                        transform: isActive
                                                            ? 'translateY(4px)'
                                                            : 'translateY(0)',
                                                        transformOrigin: 'top center',
                                                        transition: 'transform 0.05s ease-out, background 0.05s ease-out, box-shadow 0.05s ease-out'
                                                    }}
                                                >
                                                    {/* Side reflection highlight overlay */}
                                                    <div className="absolute inset-y-1 left-0.5 w-[2px] bg-white/10 pointer-events-none rounded-sm z-10" />

                                                    {/* Style-specific black key overlays */}
                                                    {isActive && (
                                                        <>
                                                            {waterfallStyle === 'matrix' && (
                                                                <div className="absolute inset-0 overflow-hidden font-mono text-[7px] text-[#22c55e]/50 flex flex-col items-center justify-start pointer-events-none select-none my-1">
                                                                    <span className="animate-pulse">0</span>
                                                                    <span className="animate-pulse [animation-delay:0.15s]">1</span>
                                                                </div>
                                                            )}
                                                            {waterfallStyle === 'sunset' && (
                                                                <div className="absolute inset-x-0 bottom-0 top-[50%] bg-gradient-to-t from-red-500/35 to-transparent animate-pulse pointer-events-none" />
                                                            )}
                                                            {waterfallStyle === 'gold' && (
                                                                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-b from-yellow-300 to-transparent opacity-90 blur-[0.5px] animate-pulse pointer-events-none" />
                                                            )}
                                                        </>
                                                    )}

                                                    {/* black keys label text markers */}
                                                    {fontSizeMode === 'all' && (
                                                        <span className="absolute bottom-2.5 inset-x-0 text-center text-[7.5px] font-black uppercase text-stone-200 pointer-events-none opacity-80 scale-90 z-10">
                                                            {key.pitchClass}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* --- 4. BOTTOM DASHBOARD FOOTER STATUS BAR --- */}
                <motion.footer 
                    initial={{ y: 70, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 70, opacity: 0 }}
                    transition={{ duration: 1.0, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className={`px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs transition-colors duration-500 z-10 shrink-0 ${
                        isNightMode 
                            ? 'bg-stone-900 border-stone-850 text-stone-400' 
                            : 'bg-white border-rose-100/50 text-stone-600 shadow-[0_-4px_12px_rgba(253,164,175,0.03)]'
                    }`}
                >
                    <div className="flex items-center gap-4.5">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse-soft" />
                            <span className={`font-bold transition-colors ${isNightMode ? 'text-stone-200' : 'text-stone-800'}`}>钢琴引擎已就绪</span>
                        </div>
                        <div className="text-stone-500">
                            已就绪琴键: <span className={`font-mono font-bold transition-colors ${isNightMode ? 'text-stone-300' : 'text-stone-700'}`}>88 / 88 keys</span>
                        </div>
                    </div>

                    {isPracticeMode && (
                        <div className={`font-bold px-4 py-1.5 rounded-full flex items-center gap-2 border animate-fadeIn transition-colors ${
                            isNightMode
                                ? 'text-blue-400 bg-blue-500/10 border-blue-500/25'
                                : 'text-blue-600 bg-blue-500/5 border-blue-200/50'
                        }`}>
                            <Sparkles className="animate-pulse" size={13} />
                            <span>跟弹模式：瀑布将在按键处暂停，弹出绿光标记琴键即可继续！</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-stone-500">
                        <Award size={13} className="text-amber-550" />
                        <span className={`transition-colors ${isNightMode ? 'text-stone-400' : 'text-stone-600'}`}>理论与演奏并进 • 正在演奏: {user?.name || '爱乐客'}</span>
                    </div>
                </motion.footer>

            </motion.div>
        </AnimatePresence>
    );
};

export default Piano88Page;
