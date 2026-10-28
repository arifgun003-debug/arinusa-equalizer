/**
 * ARINUSA EQUALIZER - Real Mathematical Frequency Response & FFT Spectrum Canvas
 * Renders the exact summed dB transfer function of all active Biquad filters
 * and real-time audio FFT spectrum analysis overlay.
 * ARINUSA GROUP | ARIF GUNAWAN
 */

import React, { useRef, useEffect } from 'react';
import { EqBandConfig } from '../types/audio';
import { audioEngine, NOMINAL_FREQUENCIES } from '../services/audioEngine';

interface FrequencyCurveCanvasProps {
  bands: EqBandConfig[];
  preamp: number;
  gainRange: number; // 12 or 18
  isBypassed: boolean;
  onBandGainChange: (index: number, newGain: number) => void;
  className?: string;
}

export const FrequencyCurveCanvas: React.FC<FrequencyCurveCanvasProps> = ({
  bands,
  preamp,
  gainRange,
  isBypassed,
  onBandGainChange,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef<number | null>(null);

  // Generate 128 log-spaced frequency points from 20Hz to 20kHz
  const numPoints = 128;
  const freqPoints = useRef<Float32Array>(new Float32Array(numPoints));

  useEffect(() => {
    const minFreq = 20;
    const maxFreq = 20000;
    for (let i = 0; i < numPoints; i++) {
      // Logarithmic distribution
      freqPoints.current[i] = minFreq * Math.pow(maxFreq / minFreq, i / (numPoints - 1));
    }
  }, []);

  // Map frequency (20Hz - 20kHz) to X coordinate on canvas (logarithmic)
  const freqToX = (freq: number, width: number) => {
    const minF = 20;
    const maxF = 20000;
    return (Math.log10(freq / minF) / Math.log10(maxF / minF)) * width;
  };

  // Map dB to Y coordinate on canvas
  const dbToY = (db: number, height: number) => {
    // Top is +gainRange, Bottom is -gainRange
    const range = gainRange;
    const normalized = (range - db) / (2 * range); // 0 at +range, 1 at -range
    return Math.max(10, Math.min(height - 10, normalized * height));
  };

  // Map Y to dB for dragging
  const yToDb = (y: number, height: number) => {
    const normalized = y / height;
    const db = gainRange - normalized * (2 * gainRange);
    return Math.max(-gainRange, Math.min(gainRange, Math.round(db * 2) / 2));
  };

  // Real-time animation loop for curve + FFT spectrum
  useEffect(() => {
    let animId: number;
    const spectrumData = new Uint8Array(256);

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Grid Lines (+12, +6, 0, -6, -12 dB)
      ctx.lineWidth = 1;
      const dbSteps = gainRange === 18 ? [18, 12, 6, 0, -6, -12, -18] : [12, 6, 0, -6, -12];

      dbSteps.forEach((db) => {
        const y = dbToY(db, height);
        ctx.beginPath();
        if (db === 0) {
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)'; // Cyan center line
          ctx.setLineDash([4, 4]);
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.setLineDash([2, 4]);
        }
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        // Label
        ctx.setLineDash([]);
        ctx.fillStyle = db === 0 ? 'rgba(0, 229, 255, 0.7)' : 'rgba(148, 163, 184, 0.5)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(`${db > 0 ? '+' : ''}${db} dB`, 8, y - 4);
      });

      // Draw Vertical Frequency Grid Lines
      const gridFreqs = [50, 100, 250, 500, 1000, 2000, 5000, 10000, 20000];
      gridFreqs.forEach((f) => {
        const x = freqToX(f, width);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.setLineDash([2, 4]);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      });

      // 2. Draw Real-time FFT Audio Spectrum Bars in background
      audioEngine.getSpectrumData(spectrumData);
      const barCount = 48;
      const barWidth = width / barCount;

      for (let i = 0; i < barCount; i++) {
        // Sample non-linearly across spectrumData
        const dataIdx = Math.floor(Math.pow(i / barCount, 1.4) * (spectrumData.length / 2));
        const val = spectrumData[dataIdx] || 0;
        const barHeight = (val / 255) * (height * 0.75);

        if (barHeight > 2) {
          const x = i * barWidth;
          const y = height - barHeight;

          const grad = ctx.createLinearGradient(0, y, 0, height);
          grad.addColorStop(0, 'rgba(0, 229, 255, 0.28)');
          grad.addColorStop(1, 'rgba(37, 99, 235, 0.02)');

          ctx.fillStyle = grad;
          ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
        }
      }

      // 3. Draw Real Filter Response Curve
      const responseDb = audioEngine.getFrequencyResponse(freqPoints.current);

      ctx.beginPath();
      ctx.setLineDash([]);
      ctx.lineWidth = 2.5;

      const curvePoints: { x: number; y: number }[] = [];
      for (let i = 0; i < numPoints; i++) {
        const freq = freqPoints.current[i];
        const db = isBypassed ? 0 : responseDb[i];
        const x = freqToX(freq, width);
        const y = dbToY(db, height);
        curvePoints.push({ x, y });
      }

      if (curvePoints.length > 0) {
        ctx.moveTo(curvePoints[0].x, curvePoints[0].y);
        for (let i = 1; i < curvePoints.length; i++) {
          ctx.lineTo(curvePoints[i].x, curvePoints[i].y);
        }

        // Stroke glowing line
        ctx.strokeStyle = isBypassed ? 'rgba(148, 163, 184, 0.6)' : '#00E5FF';
        ctx.shadowColor = isBypassed ? 'transparent' : 'rgba(0, 229, 255, 0.6)';
        ctx.shadowBlur = isBypassed ? 0 : 10;
        ctx.stroke();

        // Fill area under curve
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        const areaGrad = ctx.createLinearGradient(0, 0, 0, height);
        areaGrad.addColorStop(0, isBypassed ? 'rgba(148, 163, 184, 0.08)' : 'rgba(0, 229, 255, 0.25)');
        areaGrad.addColorStop(1, 'rgba(7, 13, 26, 0.0)');
        ctx.fillStyle = areaGrad;
        ctx.shadowBlur = 0;
        ctx.fill();
      }

      // 4. Draw Interactive Control Nodes for each of the 10 bands
      bands.forEach((band, idx) => {
        const x = freqToX(band.freq, width);
        const y = dbToY(isBypassed ? 0 : band.gain + preamp, height);

        // Halo
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 229, 255, 0.2)';
        ctx.fill();

        // Inner solid node
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [bands, preamp, gainRange, isBypassed]);

  // Handle Dragging Nodes on Canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Find closest band node
    let closestIdx = -1;
    let minDistance = 22; // click threshold

    bands.forEach((band, idx) => {
      const nodeX = freqToX(band.freq, canvas.width);
      const nodeY = dbToY(isBypassed ? 0 : band.gain + preamp, canvas.height);
      const dist = Math.hypot(mouseX - nodeX, mouseY - nodeY);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    if (closestIdx !== -1) {
      isDraggingRef.current = closestIdx;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
    const newDb = yToDb(mouseY, canvas.height) - preamp;
    onBandGainChange(isDraggingRef.current, newDb);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = null;
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-[#060D1A] border border-[#172644] ${className}`}>
      <canvas
        ref={canvasRef}
        width={800}
        height={190}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-44 cursor-crosshair block"
      />
      {/* Bypass indicator banner if active */}
      {isBypassed && (
        <div className="absolute top-2 right-3 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
          EQ DIBYPASS (Netral)
        </div>
      )}
    </div>
  );
};
