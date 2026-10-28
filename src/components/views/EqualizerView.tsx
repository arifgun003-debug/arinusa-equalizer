/**
 * ARINUSA EQUALIZER - Full Studio Equalizer View
 * Professional 10-Band Graphic & Parametric EQ Studio with Frequency Inspector & Clipping Protection
 * ARINUSA GROUP | ARIF GUNAWAN
 */

import React, { useState } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  AlertTriangle, 
  ShieldCheck, 
  Volume2, 
  Check, 
  Maximize2,
  Bookmark,
  Flame
} from 'lucide-react';
import { EqualizerState, Preset } from '../../types/audio';
import { FrequencyCurveCanvas } from '../FrequencyCurveCanvas';

interface EqualizerViewProps {
  eqState: EqualizerState;
  onUpdateEqState: (updater: (prev: EqualizerState) => EqualizerState) => void;
  presets: Preset[];
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
  onSaveAsNewPreset: (name: string) => void;
}

export const EqualizerView: React.FC<EqualizerViewProps> = ({
  eqState,
  onUpdateEqState,
  presets,
  activePresetId,
  onSelectPreset,
  onSaveAsNewPreset
}) => {
  const [newPresetName, setNewPresetName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleBandGainChange = (index: number, newGain: number) => {
    onUpdateEqState((prev) => {
      const newBands = [...prev.bands];
      if (newBands[index]) {
        newBands[index] = { ...newBands[index], gain: newGain };
      }
      return { ...prev, bands: newBands };
    });
  };

  const handleBandQChange = (index: number, newQ: number) => {
    onUpdateEqState((prev) => {
      const newBands = [...prev.bands];
      if (newBands[index]) {
        newBands[index] = { ...newBands[index], q: newQ };
      }
      return { ...prev, bands: newBands };
    });
  };

  const handleReset = () => {
    onUpdateEqState((prev) => ({
      ...prev,
      preamp: 0.0,
      bands: prev.bands.map((b) => ({ ...b, gain: 0.0 })),
      isBypassed: false,
    }));
  };

  const handleSavePresetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    onSaveAsNewPreset(newPresetName.trim());
    setNewPresetName('');
    setShowSaveModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#091224] border border-[#192C50]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-cyan-400 border border-blue-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Studio Equalizer 10-Band Presisi
              </h1>
              <p className="text-xs text-slate-400">
                Kontrol filter IIR Biquad bertingkat dengan respons kurva analitis real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Full Bass Preset */}
          <button
            onClick={() => onSelectPreset('full_bass')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600/30 to-amber-500/20 hover:from-red-600/50 hover:to-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)]"
            title="Aktifkan preset Full Bass secara instan"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Preset Full Bass</span>
          </button>

          {/* Range Selector ±12dB vs ±18dB */}
          <div className="flex items-center bg-[#0E1A33] p-1 rounded-xl border border-[#1A2E54] text-xs">
            <button
              onClick={() => onUpdateEqState((prev) => ({ ...prev, gainRange: 12 }))}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                eqState.gainRange === 12
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ±12 dB
            </button>
            <button
              onClick={() => onUpdateEqState((prev) => ({ ...prev, gainRange: 18 }))}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                eqState.gainRange === 18
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ±18 dB
            </button>
          </div>

          {/* Bypass A/B Comparison Switch */}
          <button
            onClick={() => onUpdateEqState((prev) => ({ ...prev, isBypassed: !prev.isBypassed }))}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              eqState.isBypassed
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
            }`}
            title="Bandingkan suara equalizer aktif dengan suara flat original"
          >
            {eqState.isBypassed ? 'Bypass (Suara Asli)' : 'Equalizer Aktif'}
          </button>

          {/* Save As Preset Button */}
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F1D38] hover:bg-[#162B54] text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Simpan Preset</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-[#0E1A33] hover:bg-[#152549] text-slate-400 hover:text-white border border-[#1A2E54] transition-colors"
            title="Reset ke Flat 0 dB"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Large Frequency Canvas & Preamp Monitor */}
      <div className="p-5 rounded-2xl bg-[#091224] border border-[#192C50] space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Visualisasi Respons Frekuensi (20 Hz - 20 kHz)</span>
            <span className="text-slate-500">•</span>
            <span className="text-cyan-400">Tarik titik kontrol atau geser fader di bawah</span>
          </div>

          {/* Preamp with Clipping Warning Indicator */}
          <div className="flex items-center gap-3 bg-[#0C162A] px-3 py-1.5 rounded-xl border border-[#1A2E52]">
            <span className="text-slate-400">Preamp Gain:</span>
            <span className="font-mono text-cyan-400 font-bold">
              {eqState.preamp >= 0 ? `+${eqState.preamp.toFixed(1)}` : eqState.preamp.toFixed(1)} dB
            </span>
            <input
              type="range"
              min="-12"
              max="12"
              step="0.5"
              value={eqState.preamp}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onUpdateEqState((prev) => ({ ...prev, preamp: val }));
              }}
              className="w-24 h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-cyan-400"
            />

            {/* Clipping Protection badge */}
            <div className="flex items-center gap-1 pl-2 border-l border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-400">Soft-Limiter Aktif</span>
            </div>
          </div>
        </div>

        {/* High-Res Canvas */}
        <FrequencyCurveCanvas
          bands={eqState.bands}
          preamp={eqState.preamp}
          gainRange={eqState.gainRange}
          isBypassed={eqState.isBypassed}
          onBandGainChange={handleBandGainChange}
          className="h-56"
        />
      </div>

      {/* 10 Precision Sliders with Q-Factor Controls */}
      <div className="p-6 rounded-2xl bg-[#091224] border border-[#192C50] space-y-4 shadow-xl">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
            10-Band Filter Bank (Biquad Peaking / Shelf Filters)
          </span>
          <span className="font-mono text-[11px]">Rentang: ±{eqState.gainRange} dB</span>
        </div>

        <div className="grid grid-cols-10 gap-2 sm:gap-4 pt-2">
          {eqState.bands.map((band, idx) => {
            const gain = band.gain;
            const formattedGain = gain > 0 ? `+${gain.toFixed(1)}` : gain.toFixed(1);

            return (
              <div key={band.freq} className="flex flex-col items-center space-y-1.5">
                {/* +0.5 dB Nudge Button */}
                <button
                  onClick={() => handleBandGainChange(idx, Math.min(eqState.gainRange, gain + 0.5))}
                  disabled={eqState.isBypassed}
                  className="w-6 h-5 flex items-center justify-center rounded bg-[#101D36] hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-xs font-bold border border-[#1A2E54] transition-colors disabled:opacity-30"
                  title={`Tambah 0.5 dB pada ${band.label}`}
                >
                  +
                </button>

                {/* dB Readout */}
                <div
                  className={`text-xs font-mono px-1.5 py-0.5 rounded font-bold transition-colors ${
                    gain > 0
                      ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-500/30'
                      : gain < 0
                      ? 'text-blue-300 bg-blue-950/60 border border-blue-500/30'
                      : 'text-slate-400 bg-slate-800/40'
                  }`}
                >
                  {formattedGain}
                </div>

                {/* Vertical Slider */}
                <div className="relative h-40 flex items-center justify-center py-2">
                  <div className="absolute w-1 h-full bg-[#162744] rounded-full pointer-events-none" />
                  <div className="absolute w-3.5 h-[1px] bg-cyan-500/40 pointer-events-none" />

                  <input
                    type="range"
                    min={-eqState.gainRange}
                    max={eqState.gainRange}
                    step="0.5"
                    value={band.gain}
                    onChange={(e) => handleBandGainChange(idx, parseFloat(e.target.value))}
                    disabled={eqState.isBypassed}
                    className="vertical-eq h-36 w-5 bg-transparent cursor-pointer z-10"
                    title={`${band.label}: ${formattedGain} dB`}
                  />
                </div>

                {/* -0.5 dB Nudge Button */}
                <button
                  onClick={() => handleBandGainChange(idx, Math.max(-eqState.gainRange, gain - 0.5))}
                  disabled={eqState.isBypassed}
                  className="w-6 h-5 flex items-center justify-center rounded bg-[#101D36] hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-xs font-bold border border-[#1A2E54] transition-colors disabled:opacity-30"
                  title={`Kurang 0.5 dB pada ${band.label}`}
                >
                  -
                </button>

                {/* Frequency Nominal Label */}
                <span className="text-xs font-bold text-slate-200 tracking-tight text-center pt-0.5">
                  {band.label}
                </span>

                {/* Q Factor fine tuner */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 font-mono">Q: {band.q.toFixed(2)}</span>
                  <input
                    type="range"
                    min="0.5"
                    max="4.0"
                    step="0.1"
                    value={band.q}
                    onChange={(e) => handleBandQChange(idx, parseFloat(e.target.value))}
                    className="w-12 h-1 bg-slate-800 rounded accent-blue-400 cursor-pointer mt-0.5"
                    title={`Lebar pita (Bandwidth Q Factor): ${band.q.toFixed(2)}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preset Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0B152B] border border-cyan-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Simpan Sebagai Preset Baru</h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Konfigurasi 10 band dan preamp saat ini akan disimpan ke penyimpanan lokal Anda.
            </p>
            <form onSubmit={handleSavePresetSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Masukkan nama preset (cth: My Rock Bass)"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl bg-[#060D1A] border border-[#1F3660] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!newPresetName.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50"
                >
                  Simpan Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
