/**
 * ARINUSA EQUALIZER - Real-time Frequency Spectrum Visualizer
 * High-performance HTML5 Canvas Visualizer powered by Web Audio AnalyserNode API
 * ARINUSA GROUP | ARIF GUNAWAN
 */

import React, { useRef, useEffect, useState } from 'react';
import { audioEngine } from '../services/audioEngine';
import { Activity, Radio, BarChart3, Waves, Volume2 } from 'lucide-react';

export type VisualizerMode = 'bars' | 'wave' | 'peaks';

interface AudioSpectrumVisualizerProps {
  variant?: 'full' | 'compact' | 'island-expanded';
  height?: number;
  className?: string;
  showControls?: boolean;
}

export const AudioSpectrumVisualizer: React.FC<AudioSpectrumVisualizerProps> = ({
  variant = 'full',
  height = 130,
  className = '',
  showControls = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<VisualizerMode>('bars');
  const [peakDb, setPeakDb] = useState<number>(-60);
  const peaksRef = useRef<number[]>([]);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioEngine.getAnalyserNode();
    const bufferLength = analyser ? analyser.frequencyBinCount : 256;
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

    // Peak hold decay needles
    const barCount = variant === 'compact' ? 12 : variant === 'island-expanded' ? 28 : 54;
    if (peaksRef.current.length !== barCount) {
      peaksRef.current = new Array(barCount).fill(0);
    }

    let lastTime = performance.now();

    const render = (time: number) => {
      animId = requestAnimationFrame(render);
      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      const width = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, width, h);

      // Read from AnalyserNode
      audioEngine.getSpectrumData(freqData);
      audioEngine.getWaveformData(timeData);

      // Check if there is actual audio activity
      let maxVal = 0;
      for (let i = 0; i < freqData.length; i++) {
        if (freqData[i] > maxVal) maxVal = freqData[i];
      }

      // Convert maxVal to approx dBFS
      if (maxVal > 0) {
        const db = Math.round(20 * Math.log10(maxVal / 255));
        setPeakDb((prev) => Math.round(prev * 0.85 + db * 0.15));
      } else {
        setPeakDb((prev) => Math.max(-60, prev - 2));
      }

      // 1. WAVEFORM / OSCILLOSCOPE MODE
      if (mode === 'wave') {
        ctx.lineWidth = variant === 'compact' ? 1.5 : 2;
        ctx.strokeStyle = '#00E5FF';
        ctx.shadowColor = 'rgba(0, 229, 255, 0.7)';
        ctx.shadowBlur = 8;
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * h) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;

        // Subtle center guide line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(width, h / 2);
        ctx.stroke();
        return;
      }

      // 2. FREQUENCY SPECTRUM BARS (Default & Peaks)
      const barSpacing = variant === 'compact' ? 2 : 3;
      const barWidth = Math.max(2, (width - (barCount - 1) * barSpacing) / barCount);

      // Frequency bands evaluation (sub-bass to treble, log-spaced)
      for (let i = 0; i < barCount; i++) {
        // Non-linear power distribution for natural perception of sound frequencies
        const logIndex = Math.floor(Math.pow(i / barCount, 1.6) * (bufferLength * 0.85));
        const sample = freqData[logIndex] || 0;

        // Bar height with minimum 2px aesthetic floor
        const normalized = sample / 255;
        const barHeight = Math.max(2, normalized * (h - 8));

        // Peak Hold logic (falls slowly by gravity)
        if (barHeight > peaksRef.current[i]) {
          peaksRef.current[i] = barHeight;
        } else {
          peaksRef.current[i] = Math.max(2, peaksRef.current[i] - dt * 45); // decay speed
        }

        const x = i * (barWidth + barSpacing);
        const y = h - barHeight;

        // Color Gradient based on frequency range:
        // Bass (Cyan) -> Mids (Electric Blue) -> Highs (Deep Cobalt/Ice)
        const grad = ctx.createLinearGradient(0, y, 0, h);
        if (i < barCount * 0.3) {
          // Bass
          grad.addColorStop(0, '#00F5FF');
          grad.addColorStop(1, 'rgba(0, 163, 255, 0.25)');
        } else if (i < barCount * 0.7) {
          // Midrange
          grad.addColorStop(0, '#38BDF8');
          grad.addColorStop(1, 'rgba(37, 99, 235, 0.25)');
        } else {
          // Treble
          grad.addColorStop(0, '#818CF8');
          grad.addColorStop(1, 'rgba(79, 70, 229, 0.25)');
        }

        ctx.fillStyle = grad;

        // Draw rounded top bar
        const radius = Math.min(barWidth / 2, 2);
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0]);
        ctx.fill();

        // Draw Peak Cap needle
        if (mode === 'peaks' || variant === 'full') {
          const peakY = Math.max(0, h - peaksRef.current[i] - 1);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(x, peakY, barWidth, 1.5);
        }
      }

      // 3. Grid line overlays for Full variant
      if (variant === 'full') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        [-6, -12, -24, -36].forEach((db) => {
          const lineY = h * (1 - Math.pow(10, db / 20));
          if (lineY > 0 && lineY < h) {
            ctx.beginPath();
            ctx.moveTo(0, lineY);
            ctx.lineTo(width, lineY);
            ctx.stroke();
          }
        });
        ctx.setLineDash([]);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [mode, variant]);

  // Nominal labels for full spectrum footer
  const freqLabels = ['31', '62', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];

  if (variant === 'compact') {
    return (
      <div className={`relative flex items-center ${className}`}>
        <canvas
          ref={canvasRef}
          width={72}
          height={height || 20}
          className="w-18 h-5 block"
        />
      </div>
    );
  }

  if (variant === 'island-expanded') {
    return (
      <div className={`relative w-full rounded-xl bg-[#060D1A]/80 border border-cyan-500/25 p-2 ${className}`}>
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 px-1">
          <span className="flex items-center gap-1 font-semibold text-cyan-300">
            <Radio className="w-2.5 h-2.5 animate-pulse text-cyan-400" />
            <span>Real-time Analyser</span>
          </span>
          <span className="font-mono text-cyan-400 font-bold">
            {peakDb > -60 ? `${peakDb} dBFS` : 'Idle'}
          </span>
        </div>
        <canvas
          ref={canvasRef}
          width={340}
          height={48}
          className="w-full h-12 block rounded-lg"
        />
      </div>
    );
  }

  // Full Variant for HomeView
  return (
    <div className={`p-4 rounded-2xl bg-[#091224] border border-[#192C50] space-y-3 shadow-xl ${className}`}>
      {/* Visualizer Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Visualizer Spektrum Frekuensi Real-Time
              </h3>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00e5ff] animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">
              Analisis sinyal audio pasca-pemrosesan (EQ, Preamp & Efek) via Web Audio AnalyserNode.
            </p>
          </div>
        </div>

        {/* View Mode Switcher and dB Meter */}
        <div className="flex items-center gap-3">
          {/* Real Peak Meter Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0C162A] border border-[#182C50] text-xs font-mono">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Peak:</span>
            <span className={`font-bold ${peakDb > -3 ? 'text-amber-400' : 'text-cyan-400'}`}>
              {peakDb > -60 ? `${peakDb} dB` : '-∞ dB'}
            </span>
          </div>

          {showControls && (
            <div className="flex items-center bg-[#0E1A33] p-1 rounded-xl border border-[#1A2E54] text-xs">
              <button
                onClick={() => setMode('bars')}
                className={`p-1.5 rounded-lg transition-colors ${
                  mode === 'bars'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilan Balok Spektrum"
              >
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setMode('wave')}
                className={`p-1.5 rounded-lg transition-colors ${
                  mode === 'wave'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilan Bentuk Gelombang (Oscilloscope)"
              >
                <Waves className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Spectrum Canvas */}
      <div className="relative rounded-xl overflow-hidden bg-[#060D1A] border border-[#15233E]">
        <canvas
          ref={canvasRef}
          width={760}
          height={height}
          className="w-full h-28 block"
        />

        {/* Sub-band labels strip */}
        <div className="flex items-center justify-between px-3 py-1 bg-[#050A14] border-t border-[#121E36] text-[10px] font-mono text-slate-400">
          {freqLabels.map((f) => (
            <span key={f} className="hover:text-cyan-400 transition-colors">
              {f}Hz
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
