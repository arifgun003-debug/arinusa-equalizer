/**
 * ARINUSA EQUALIZER - Audio Effects Suite
 * Real DSP effect processors: Bass Enhancement, Loudness, Reverb, Echo, Virtual Surround
 * ARINUSA GROUP | ARIF GUNAWAN
 */

import React from 'react';
import { 
  Wand2, 
  Flame, 
  Volume2, 
  Compass, 
  Repeat, 
  Maximize, 
  Sparkles,
  Info
} from 'lucide-react';
import { AudioEffectsState } from '../../types/audio';

interface EffectsViewProps {
  effects: AudioEffectsState;
  onUpdateEffects: (updater: (prev: AudioEffectsState) => AudioEffectsState) => void;
}

export const EffectsView: React.FC<EffectsViewProps> = ({
  effects,
  onUpdateEffects
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#091224] border border-[#192C50]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600/20 text-cyan-400 border border-blue-500/30">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Suite Efek Audio DSP</h1>
            <p className="text-xs text-slate-400">
              Modul pemrosesan sinyal digital untuk memperkaya dimensi, ruang akustik, dan kedalaman suara.
            </p>
          </div>
        </div>

        {/* Master Effects Toggle */}
        <div className="flex items-center gap-3 bg-[#0E1A33] px-3.5 py-1.5 rounded-xl border border-[#1A2E54]">
          <span className="text-xs font-semibold text-slate-300">Master DSP:</span>
          <button
            onClick={() => onUpdateEffects((p) => ({ ...p, enabled: !p.enabled }))}
            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
              effects.enabled ? 'bg-cyan-500 shadow-[0_0_10px_#00e5ff]' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                effects.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-xs font-bold text-cyan-400">
            {effects.enabled ? 'AKTIF' : 'BYPASS'}
          </span>
        </div>
      </div>

      {/* Grid of 5 DSP Effect Processors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Bass Enhancement */}
        <div className="p-5 rounded-2xl bg-[#091224] border border-[#192C50] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                <Flame className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Bass Enhancement</h3>
                <span className="text-[11px] text-slate-400">
                  Sub-bass harmonic generator & low-shelf drive
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                onUpdateEffects((p) => ({
                  ...p,
                  bassEnhancement: { ...p.bassEnhancement, enabled: !p.bassEnhancement.enabled },
                }))
              }
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                effects.bassEnhancement.enabled && effects.enabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                  effects.bassEnhancement.enabled && effects.enabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Intensitas Kedalaman (Amount)</span>
                <span className="font-mono text-cyan-400 font-bold">{effects.bassEnhancement.amount}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={effects.bassEnhancement.amount}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  onUpdateEffects((p) => ({
                    ...p,
                    bassEnhancement: { ...p.bassEnhancement, amount: val },
                  }));
                }}
                disabled={!effects.enabled || !effects.bassEnhancement.enabled}
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-cyan-400 disabled:opacity-40"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Frekuensi Cutoff Bass</span>
                <span className="font-mono text-cyan-400 font-bold">{effects.bassEnhancement.cutoffFreq} Hz</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                step="5"
                value={effects.bassEnhancement.cutoffFreq}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  onUpdateEffects((p) => ({
                    ...p,
                    bassEnhancement: { ...p.bassEnhancement, cutoffFreq: val },
                  }));
                }}
                disabled={!effects.enabled || !effects.bassEnhancement.enabled}
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-cyan-400 disabled:opacity-40"
              />
            </div>
          </div>
        </div>

        {/* 2. Loudness Compensation */}
        <div className="p-5 rounded-2xl bg-[#091224] border border-[#192C50] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Volume2 className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Loudness Compensation</h3>
                <span className="text-[11px] text-slate-400">
                  Kontur psikoakustik Fletcher-Munson pada volume rendah
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                onUpdateEffects((p) => ({
                  ...p,
                  loudness: { ...p.loudness, enabled: !p.loudness.enabled },
                }))
              }
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                effects.loudness.enabled && effects.enabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                  effects.loudness.enabled && effects.enabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Kompensasi Keseimbangan</span>
                <span className="font-mono text-cyan-400 font-bold">{effects.loudness.amount}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={effects.loudness.amount}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  onUpdateEffects((p) => ({
                    ...p,
                    loudness: { ...p.loudness, amount: val },
                  }));
                }}
                disabled={!effects.enabled || !effects.loudness.enabled}
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-cyan-400 disabled:opacity-40"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Menjaga kejelasan instrumen bass dan treble secara otomatis bahkan saat volume Windows diputar pelan.
            </p>
          </div>
        </div>

        {/* 3. Reverb Studio Ambience */}
        <div className="p-5 rounded-2xl bg-[#091224] border border-[#192C50] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Compass className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Reverb (Ruang Akustik)</h3>
                <span className="text-[11px] text-slate-400">
                  Konvolusi respon impuls ruang studio stereo
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                onUpdateEffects((p) => ({
                  ...p,
                  reverb: { ...p.reverb, enabled: !p.reverb.enabled },
                }))
              }
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                effects.reverb.enabled && effects.enabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                  effects.reverb.enabled && effects.enabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Wet / Dry Mix</span>
                <span className="font-mono text-cyan-400 font-bold">{effects.reverb.amount}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={effects.reverb.amount}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  onUpdateEffects((p) => ({
                    ...p,
                    reverb: { ...p.reverb, amount: val },
                  }));
                }}
                disabled={!effects.enabled || !effects.reverb.enabled}
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-cyan-400 disabled:opacity-40"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Waktu Peluruhan (Decay Time)</span>
                <span className="font-mono text-cyan-400 font-bold">{effects.reverb.decayTime.toFixed(1)} dtk</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.1"
                value={effects.reverb.decayTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateEffects((p) => ({
                    ...p,
                    reverb: { ...p.reverb, decayTime: val },
                  }));
                }}
                disabled={!effects.enabled || !effects.reverb.enabled}
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-cyan-400 disabled:opacity-40"
              />
            </div>
          </div>
        </div>

        {/* 4. Echo Tape Delay */}
        <div className="p-5 rounded-2xl bg-[#091224] border border-[#192C50] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Repeat className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Echo (Tape Delay)</h3>
                <span className="text-[11px] text-slate-400">
                  Gema analog dengan umpan balik tempo
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                onUpdateEffects((p) => ({
                  ...p,
                  echo: { ...p.echo, enabled: !p.echo.enabled },
                }))
              }
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                effects.echo.enabled && effects.enabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                  effects.echo.enabled && effects.enabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Intensitas Gema (Amount)</span>
                <span className="font-mono text-cyan-400 font-bold">{effects.echo.amount}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={effects.echo.amount}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  onUpdateEffects((p) => ({
                    ...p,
                    echo: { ...p.echo, amount: val },
                  }));
                }}
                disabled={!effects.enabled || !effects.echo.enabled}
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-cyan-400 disabled:opacity-40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-300">Waktu Tunda: {effects.echo.delayTime} ms</span>
                <input
                  type="range"
                  min="50"
                  max="600"
                  step="10"
                  value={effects.echo.delayTime}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    onUpdateEffects((p) => ({
                      ...p,
                      echo: { ...p.echo, delayTime: val },
                    }));
                  }}
                  disabled={!effects.enabled || !effects.echo.enabled}
                  className="w-full h-1 bg-slate-800 rounded-lg cursor-pointer accent-cyan-400 disabled:opacity-40"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-300">Feedback: {effects.echo.feedback}%</span>
                <input
                  type="range"
                  min="5"
                  max="75"
                  step="5"
                  value={effects.echo.feedback}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    onUpdateEffects((p) => ({
                      ...p,
                      echo: { ...p.echo, feedback: val },
                    }));
                  }}
                  disabled={!effects.enabled || !effects.echo.enabled}
                  className="w-full h-1 bg-slate-800 rounded-lg cursor-pointer accent-cyan-400 disabled:opacity-40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 5. Virtual Surround */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-[#091224] border border-[#192C50] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Maximize className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Virtual Surround 3D Spatial</h3>
                <span className="text-[11px] text-slate-400">
                  Pelebaran citra stereo dan efek Haas cross-feed untuk headphone dan speaker
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                onUpdateEffects((p) => ({
                  ...p,
                  virtualSurround: { ...p.virtualSurround, enabled: !p.virtualSurround.enabled },
                }))
              }
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                effects.virtualSurround.enabled && effects.enabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                  effects.virtualSurround.enabled && effects.enabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Intensitas Spasial 3D</span>
                <span className="font-mono text-cyan-400 font-bold">{effects.virtualSurround.amount}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={effects.virtualSurround.amount}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  onUpdateEffects((p) => ({
                    ...p,
                    virtualSurround: { ...p.virtualSurround, amount: val },
                  }));
                }}
                disabled={!effects.enabled || !effects.virtualSurround.enabled}
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-cyan-400 disabled:opacity-40"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Lebar Stereo (Stereo Width)</span>
                <span className="font-mono text-cyan-400 font-bold">{effects.virtualSurround.stereoWidth}%</span>
              </div>
              <input
                type="range"
                min="100"
                max="200"
                step="5"
                value={effects.virtualSurround.stereoWidth}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  onUpdateEffects((p) => ({
                    ...p,
                    virtualSurround: { ...p.virtualSurround, stereoWidth: val },
                  }));
                }}
                disabled={!effects.enabled || !effects.virtualSurround.enabled}
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-cyan-400 disabled:opacity-40"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
