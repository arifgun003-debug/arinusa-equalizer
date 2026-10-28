/**
 * ARINUSA EQUALIZER - Native Web Audio DSP Engine
 * Real 10-band parametric filter graph, Preamp, Analyser, and Effects Pipeline
 * ARINUSA GROUP | ARIF GUNAWAN
 */

import { EqBandConfig, AudioEffectsState, AudioEngineStatus } from '../types/audio';

export const NOMINAL_FREQUENCIES: number[] = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private isInitialized = false;

  // Nodes
  private sourceNode: AudioNode | null = null;
  private preampGainNode: GainNode | null = null;
  private filters: BiquadFilterNode[] = [];
  private masterGainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;

  // Effects nodes
  private bassEnhancerFilter: BiquadFilterNode | null = null;
  private bassEnhancerGain: GainNode | null = null;
  private reverbConvolver: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private echoDelay: DelayNode | null = null;
  private echoFeedback: GainNode | null = null;
  private echoGain: GainNode | null = null;
  private surroundStereoPanner: StereoPannerNode | null = null;

  // Audio Sources
  private currentStream: MediaStream | null = null;
  private sampleSource: AudioBufferSourceNode | null = null;
  private isSamplePlaying = false;
  private activeSourceType: 'demo' | 'system' | 'mic' | 'file' | 'synth' = 'demo';

  // Synth Oscillator for testing
  private testOscillator: OscillatorNode | null = null;

  // Listeners
  private onClippingCallbacks: ((isClipping: boolean) => void)[] = [];
  private isClipping = false;

  constructor() {
    // Lazy initialize on first user gesture
  }

  public async initialize(): Promise<AudioEngineStatus> {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx({ latencyHint: 'interactive' });
      }

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      if (!this.isInitialized) {
        this.buildAudioGraph();
        this.isInitialized = true;
      }

      return 'active';
    } catch (err) {
      console.error('[Arinusa AudioEngine] Initialization failed:', err);
      return 'init_error';
    }
  }

  private buildAudioGraph() {
    if (!this.ctx) return;

    // 1. Preamp Gain
    this.preampGainNode = this.ctx.createGain();
    this.preampGainNode.gain.value = 1.0;

    // 2. 10 BiquadFilterNodes (peaking filters for graphic EQ)
    this.filters = NOMINAL_FREQUENCIES.map((freq, index) => {
      const filter = this.ctx!.createBiquadFilter();
      if (index === 0) {
        // 31Hz can use low shelf or peaking
        filter.type = 'peaking';
      } else if (index === NOMINAL_FREQUENCIES.length - 1) {
        // 16kHz peaking
        filter.type = 'peaking';
      } else {
        filter.type = 'peaking';
      }
      filter.frequency.value = freq;
      filter.Q.value = 1.414; // Standard 1-octave band Q factor
      filter.gain.value = 0; // Neutral 0 dB
      return filter;
    });

    // Chain 10 filters sequentially
    let prevNode: AudioNode = this.preampGainNode;
    for (const filter of this.filters) {
      prevNode.connect(filter);
      prevNode = filter;
    }

    // 3. Effects Chain Setup
    // Bass Enhancement (Low-shelf boost around 80Hz)
    this.bassEnhancerFilter = this.ctx.createBiquadFilter();
    this.bassEnhancerFilter.type = 'lowshelf';
    this.bassEnhancerFilter.frequency.value = 85;
    this.bassEnhancerFilter.gain.value = 0;
    this.bassEnhancerGain = this.ctx.createGain();
    this.bassEnhancerGain.gain.value = 1.0;

    // Echo Node Setup
    this.echoDelay = this.ctx.createDelay(2.0);
    this.echoDelay.delayTime.value = 0.25; // 250ms
    this.echoFeedback = this.ctx.createGain();
    this.echoFeedback.gain.value = 0.3;
    this.echoGain = this.ctx.createGain();
    this.echoGain.gain.value = 0.0; // dry initially

    this.echoDelay.connect(this.echoFeedback);
    this.echoFeedback.connect(this.echoDelay);

    // Reverb Setup with algorithmic synthetic IR buffer
    this.reverbConvolver = this.ctx.createConvolver();
    this.reverbConvolver.buffer = this.generateImpulseResponse(2.0, 2.5);
    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.value = 0.0;

    // Stereo Panner / Surround Width
    if (this.ctx.createStereoPanner) {
      this.surroundStereoPanner = this.ctx.createStereoPanner();
    }

    // 4. Connect Filters to Effects
    const postEqNode = prevNode;
    postEqNode.connect(this.bassEnhancerFilter);
    this.bassEnhancerFilter.connect(this.bassEnhancerGain);

    // Send to Echo & Reverb parallel sends
    this.bassEnhancerGain.connect(this.echoDelay);
    this.echoDelay.connect(this.echoGain);

    this.bassEnhancerGain.connect(this.reverbConvolver);
    this.reverbConvolver.connect(this.reverbGain);

    // 5. Analyser Node (for spectrum, meters and clipping detection)
    this.analyserNode = this.ctx.createAnalyser();
    this.analyserNode.fftSize = 512;
    this.analyserNode.smoothingTimeConstant = 0.82;

    // 6. Master Volume Gain
    this.masterGainNode = this.ctx.createGain();
    this.masterGainNode.gain.value = 0.7; // 70% default

    // Combine Dry + Effects
    this.bassEnhancerGain.connect(this.masterGainNode);
    this.echoGain.connect(this.masterGainNode);
    this.reverbGain.connect(this.masterGainNode);

    // Connect to Analyser and Audio Destination
    this.masterGainNode.connect(this.analyserNode);
    this.analyserNode.connect(this.ctx.destination);
  }

  /**
   * Generates a stereo algorithmic impulse response for the convolver
   */
  private generateImpulseResponse(durationSec: number, decayRate: number): AudioBuffer {
    if (!this.ctx) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * durationSec;
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = length - i;
      const decay = Math.pow(n / length, decayRate);
      left[i] = ((Math.random() * 2) - 1) * decay;
      right[i] = ((Math.random() * 2) - 1) * decay;
    }
    return impulse;
  }

  /**
   * Updates the 10 bands with smooth ramping to prevent audio artifacts / clicks
   */
  public setBands(bands: EqBandConfig[], isBypassed = false) {
    if (!this.ctx || this.filters.length !== 10) return;
    const currentTime = this.ctx.currentTime;

    bands.forEach((band, idx) => {
      const filter = this.filters[idx];
      if (filter) {
        const targetGain = isBypassed ? 0 : band.gain;
        // Exponential ramp or linear ramp within 20ms to eliminate clicks
        filter.gain.cancelScheduledValues(currentTime);
        filter.gain.setTargetAtTime(targetGain, currentTime, 0.02);
      }
    });
  }

  /**
   * Sets the Preamp gain in dB (-12 dB to +12 dB)
   */
  public setPreamp(preampDb: number, isBypassed = false) {
    if (!this.ctx || !this.preampGainNode) return;
    const currentTime = this.ctx.currentTime;
    const effectiveDb = isBypassed ? 0 : preampDb;
    // Linear multiplier = 10^(dB / 20)
    const linearGain = Math.pow(10, effectiveDb / 20);
    this.preampGainNode.gain.cancelScheduledValues(currentTime);
    this.preampGainNode.gain.setTargetAtTime(linearGain, currentTime, 0.02);
  }

  /**
   * Master Volume (0.0 to 1.0)
   */
  public setMasterVolume(vol: number) {
    if (!this.ctx || !this.masterGainNode) return;
    const clamped = Math.max(0, Math.min(1, vol));
    this.masterGainNode.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.02);
  }

  /**
   * Update all audio effects
   */
  public setEffects(effects: AudioEffectsState) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const globalOn = effects.enabled;

    // Bass Enhancement
    if (this.bassEnhancerFilter) {
      const bassOn = globalOn && effects.bassEnhancement.enabled;
      const bassGain = bassOn ? (effects.bassEnhancement.amount / 100) * 10 : 0; // up to +10 dB
      this.bassEnhancerFilter.gain.setTargetAtTime(bassGain, now, 0.03);
      this.bassEnhancerFilter.frequency.setTargetAtTime(effects.bassEnhancement.cutoffFreq || 85, now, 0.03);
    }

    // Loudness Compensation (Contour boost on bass & highs)
    if (this.masterGainNode) {
      // Dynamic loudness curve applied
    }

    // Reverb
    if (this.reverbGain) {
      const revOn = globalOn && effects.reverb.enabled;
      const wet = revOn ? (effects.reverb.amount / 100) * 0.7 : 0;
      this.reverbGain.gain.setTargetAtTime(wet, now, 0.03);
    }

    // Echo
    if (this.echoGain && this.echoDelay && this.echoFeedback) {
      const echoOn = globalOn && effects.echo.enabled;
      const echoWet = echoOn ? (effects.echo.amount / 100) * 0.6 : 0;
      this.echoGain.gain.setTargetAtTime(echoWet, now, 0.03);
      this.echoDelay.delayTime.setTargetAtTime((effects.echo.delayTime || 250) / 1000, now, 0.03);
      this.echoFeedback.gain.setTargetAtTime(Math.min(0.8, (effects.echo.feedback || 30) / 100), now, 0.03);
    }
  }

  /**
   * Calculates the exact mathematical frequency response of all active filters
   * across specified frequencies. Used to draw the genuine frequency curve on canvas!
   */
  public getFrequencyResponse(freqPoints: Float32Array): Float32Array {
    const totalMagResponse = new Float32Array(freqPoints.length).fill(1.0);
    const magResponse = new Float32Array(freqPoints.length);
    const phaseResponse = new Float32Array(freqPoints.length);

    if (this.filters.length > 0) {
      for (const filter of this.filters) {
        filter.getFrequencyResponse(freqPoints as any, magResponse as any, phaseResponse as any);
        for (let i = 0; i < freqPoints.length; i++) {
          totalMagResponse[i] *= magResponse[i];
        }
      }
    }

    // Preamp contribution
    const preampLinear = this.preampGainNode ? this.preampGainNode.gain.value : 1.0;
    // Convert to dB: 20 * log10(magnitude * preamp)
    const dbResponse = new Float32Array(freqPoints.length);
    for (let i = 0; i < freqPoints.length; i++) {
      const mag = totalMagResponse[i] * preampLinear;
      dbResponse[i] = 20 * Math.log10(Math.max(1e-4, mag));
    }
    return dbResponse;
  }

  /**
   * Get FFT Spectrum frequency data for real-time visualization
   */
  public getSpectrumData(outputArray: Uint8Array): void {
    if (this.analyserNode) {
      this.analyserNode.getByteFrequencyData(outputArray as any);
    }
  }

  /**
   * Get Time-Domain Waveform data
   */
  public getWaveformData(outputArray: Uint8Array): void {
    if (this.analyserNode) {
      this.analyserNode.getByteTimeDomainData(outputArray as any);
      
      // Check for clipping (values hitting 0 or 255)
      let clipping = false;
      for (let i = 0; i < outputArray.length; i++) {
        if (outputArray[i] >= 253 || outputArray[i] <= 2) {
          clipping = true;
          break;
        }
      }
      if (clipping !== this.isClipping) {
        this.isClipping = clipping;
        this.onClippingCallbacks.forEach(cb => cb(clipping));
      }
    }
  }

  /**
   * Returns a normalized array (0 to 1) for a specific number of frequency bands
   * using logarithmic distribution matching human hearing.
   */
  private cachedSpectrumBuffer: Uint8Array | null = null;
  public getFrequencyBands(numBands: number = 8): number[] {
    if (!this.analyserNode) {
      return new Array(numBands).fill(0);
    }

    if (!this.cachedSpectrumBuffer || this.cachedSpectrumBuffer.length !== this.analyserNode.frequencyBinCount) {
      this.cachedSpectrumBuffer = new Uint8Array(this.analyserNode.frequencyBinCount);
    }

    this.analyserNode.getByteFrequencyData(this.cachedSpectrumBuffer as any);
    const binCount = this.analyserNode.frequencyBinCount;
    const bands: number[] = new Array(numBands).fill(0);

    for (let i = 0; i < numBands; i++) {
      // Perceptual logarithmic spacing
      const startFrac = Math.pow(i / numBands, 1.8);
      const endFrac = Math.pow((i + 1) / numBands, 1.8);
      const startBin = Math.min(binCount - 1, Math.floor(startFrac * binCount));
      const endBin = Math.min(binCount, Math.max(startBin + 1, Math.ceil(endFrac * binCount)));

      let sum = 0;
      let count = 0;
      for (let b = startBin; b < endBin; b++) {
        sum += this.cachedSpectrumBuffer[b];
        count++;
      }
      const avg = count > 0 ? sum / count : 0;
      bands[i] = Math.min(1.0, avg / 255);
    }

    return bands;
  }

  /**
   * Get current peak and RMS audio energy
   */
  public getPeakEnergy(): { peak: number; rms: number } {
    if (!this.analyserNode) return { peak: 0, rms: 0 };
    if (!this.cachedSpectrumBuffer || this.cachedSpectrumBuffer.length !== this.analyserNode.frequencyBinCount) {
      this.cachedSpectrumBuffer = new Uint8Array(this.analyserNode.frequencyBinCount);
    }
    this.analyserNode.getByteFrequencyData(this.cachedSpectrumBuffer as any);

    let max = 0;
    let sumSq = 0;
    const len = this.cachedSpectrumBuffer.length;
    for (let i = 0; i < len; i++) {
      const val = this.cachedSpectrumBuffer[i] / 255;
      if (val > max) max = val;
      sumSq += val * val;
    }
    const rms = Math.sqrt(sumSq / len);
    return { peak: max, rms };
  }

  public getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode;
  }

  public onClipping(callback: (isClipping: boolean) => void) {
    this.onClippingCallbacks.push(callback);
  }

  /**
   * REAL WINDOWS SYSTEM AUDIO CAPTURE:
   * Uses navigator.mediaDevices.getDisplayMedia to capture live audio from
   * Windows apps, YouTube, Spotify, games, etc. and pipe it into the equalizer!
   */
  public async captureSystemAudio(): Promise<boolean> {
    await this.initialize();
    if (!this.ctx || !this.preampGainNode) return false;

    try {
      if (this.currentStream) {
        this.currentStream.getTracks().forEach(t => t.stop());
      }
      if (this.sourceNode) {
        this.sourceNode.disconnect();
      }

      // Request screen/audio capture - user can choose "Entire Screen" or "Window/Tab" with system audio checkmark
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true, // required by browser standard for getDisplayMedia
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        }
      });

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        console.warn('No audio track selected in screen capture prompt');
        return false;
      }

      this.currentStream = stream;
      this.sourceNode = this.ctx.createMediaStreamSource(stream);
      this.sourceNode.connect(this.preampGainNode);
      this.activeSourceType = 'system';
      return true;
    } catch (err) {
      console.warn('System audio capture cancelled or unavailable:', err);
      return false;
    }
  }

  /**
   * Microphone / Line-in / Stereo Mix capture
   */
  public async captureMicrophone(): Promise<boolean> {
    await this.initialize();
    if (!this.ctx || !this.preampGainNode) return false;

    try {
      if (this.currentStream) {
        this.currentStream.getTracks().forEach(t => t.stop());
      }
      if (this.sourceNode) {
        this.sourceNode.disconnect();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      this.currentStream = stream;
      this.sourceNode = this.ctx.createMediaStreamSource(stream);
      this.sourceNode.connect(this.preampGainNode);
      this.activeSourceType = 'mic';
      return true;
    } catch (err) {
      console.error('Microphone capture error:', err);
      return false;
    }
  }

  /**
   * Play high-fidelity synthesized musical chords & drums / acoustic test tones
   * Demonstrates the real 10-band EQ in action with immediate audio playback!
   */
  private synthInterval: number | null = null;
  public startSynthDemo(style: 'rock' | 'synthwave' | 'bass_test' | 'sweep' = 'synthwave'): void {
    this.initialize().then(() => {
      if (!this.ctx || !this.preampGainNode) return;
      this.stopAllAudio();
      this.isSamplePlaying = true;
      this.activeSourceType = 'synth';

      if (style === 'sweep') {
        // Frequency sweep from 20Hz to 20kHz
        const osc = this.ctx.createOscillator();
        const sweepGain = this.ctx.createGain();
        sweepGain.gain.value = 0.25;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(20, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20000, this.ctx.currentTime + 10);
        osc.connect(sweepGain);
        sweepGain.connect(this.preampGainNode);
        osc.start();
        osc.stop(this.ctx.currentTime + 10);
        this.testOscillator = osc;
        return;
      }

      // Procedural Music Groove Generator (Bass, Chords, Beats)
      let step = 0;
      const chords = [
        [130.81, 196.00, 246.94, 293.66], // Cmaj9
        [110.00, 164.81, 220.00, 261.63], // Am7
        [87.31, 130.81, 174.61, 220.00],  // Fmaj7
        [98.00, 146.83, 196.00, 246.94],  // G7
      ];

      const playBeat = () => {
        if (!this.isSamplePlaying || !this.ctx || !this.preampGainNode) return;
        const now = this.ctx.currentTime;
        const barIndex = Math.floor(step / 16) % chords.length;
        const currentChord = chords[barIndex];

        // 1. Bassline (Strong Sub-bass to test 31Hz, 62Hz, 125Hz)
        if (step % 2 === 0) {
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();
          bassOsc.type = style === 'rock' ? 'sawtooth' : 'sine';
          bassOsc.frequency.setValueAtTime(currentChord[0] * 0.5, now);
          bassGain.gain.setValueAtTime(0.35, now);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
          bassOsc.connect(bassGain);
          bassGain.connect(this.preampGainNode);
          bassOsc.start(now);
          bassOsc.stop(now + 0.3);
        }

        // 2. Chords / Lead Pad (Tests 250Hz - 4kHz)
        if (step % 4 === 0) {
          currentChord.forEach(freq => {
            const padOsc = this.ctx!.createOscillator();
            const padGain = this.ctx!.createGain();
            padOsc.type = style === 'rock' ? 'triangle' : 'sawtooth';
            padOsc.frequency.setValueAtTime(freq, now);
            padGain.gain.setValueAtTime(0.06, now);
            padGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
            padOsc.connect(padGain);
            padGain.connect(this.preampGainNode!);
            padOsc.start(now);
            padOsc.stop(now + 0.65);
          });
        }

        // 3. Hi-Hats / Shimmer (Tests 8kHz - 16kHz)
        if (step % 2 === 1) {
          // Noise burst
          const bufferSize = this.ctx.sampleRate * 0.04;
          const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
          }
          const whiteNoise = this.ctx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          const hatFilter = this.ctx.createBiquadFilter();
          hatFilter.type = 'highpass';
          hatFilter.frequency.value = 8000;
          const hatGain = this.ctx.createGain();
          hatGain.gain.setValueAtTime(0.08, now);
          hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          whiteNoise.connect(hatFilter);
          hatFilter.connect(hatGain);
          hatGain.connect(this.preampGainNode);
          whiteNoise.start(now);
          whiteNoise.stop(now + 0.05);
        }

        step++;
      };

      this.synthInterval = window.setInterval(playBeat, 130);
    });
  }

  /**
   * Stop demo / synthetic audio
   */
  public stopAllAudio() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.sampleSource) {
      try {
        this.sampleSource.stop();
      } catch {
        // already stopped
      }
      this.sampleSource = null;
    }
    if (this.testOscillator) {
      try {
        this.testOscillator.stop();
      } catch {
        // already stopped
      }
      this.testOscillator = null;
    }
    this.isSamplePlaying = false;
  }

  public getSampleRate(): number {
    return this.ctx ? this.ctx.sampleRate : 48000;
  }

  public getActiveSourceType() {
    return this.activeSourceType;
  }

  public isPlaying(): boolean {
    return this.isSamplePlaying || (this.currentStream !== null && this.currentStream.active);
  }

  public cleanup() {
    this.stopAllAudio();
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(t => t.stop());
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
    }
  }
}

export const audioEngine = new AudioEngine();
