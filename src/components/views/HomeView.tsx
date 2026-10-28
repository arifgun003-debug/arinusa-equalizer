/**
 * ARINUSA EQUALIZER - Main Dashboard (Beranda)
 * Matches the official reference mockup layout and design specifications
 * ARINUSA GROUP | ARIF GUNAWAN
 */

import React, { useState } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Flame, 
  Volume2, 
  Sparkles, 
  Check, 
  ChevronRight, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Folder, 
  Activity, 
  Trash2, 
  RefreshCw,
  Disc,
  Radio,
  FileAudio,
  Headphones,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { 
  EqualizerState, 
  Preset, 
  AudioEffectsState, 
  DynamicIslandConfig, 
  AudioDevice, 
  AudioEngineStatus 
} from '../../types/audio';
import { FrequencyCurveCanvas } from '../FrequencyCurveCanvas';
import { AudioSpectrumVisualizer } from '../AudioSpectrumVisualizer';
import { NavTab } from '../Sidebar';

interface HomeViewProps {
  eqState: EqualizerState;
  onUpdateEqState: (updater: (prev: EqualizerState) => EqualizerState) => void;
  presets: Preset[];
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
  effectsState: AudioEffectsState;
  onUpdateEffects: (updater: (prev: AudioEffectsState) => AudioEffectsState) => void;
  masterVolume: number;
  onChangeMasterVolume: (vol: number) => void;
  islandConfig: DynamicIslandConfig;
  onUpdateIslandConfig: (newConfig: Partial<DynamicIslandConfig>) => void;
  onNavigateTab: (tab: NavTab) => void;
  outputDeviceName: string;
  inputDeviceName: string;
  sampleRate: number;
  engineStatus: AudioEngineStatus;
  nowPlaying: {
    title: string;
    artist: string;
    source: string;
    isPlaying: boolean;
    duration: number;
    currentTime: number;
  };
  onTogglePlayback: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSwitchAudioSource: (type: 'demo_rock' | 'demo_synth' | 'demo_bass' | 'system' | 'mic') => void;
  onOpenAuditModal: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  eqState,
  onUpdateEqState,
  presets,
  activePresetId,
  onSelectPreset,
  effectsState,
  onUpdateEffects,
  masterVolume,
  onChangeMasterVolume,
  islandConfig,
  onUpdateIslandConfig,
  onNavigateTab,
  outputDeviceName,
  inputDeviceName,
  sampleRate,
  engineStatus,
  nowPlaying,
  onTogglePlayback,
  onNextTrack,
  onPrevTrack,
  onSwitchAudioSource,
  onOpenAuditModal
}) => {
  const [cleanBufferNotice, setCleanBufferNotice] = useState(false);

  const handleBandGainChange = (index: number, newGain: number) => {
    onUpdateEqState((prev) => {
      const newBands = [...prev.bands];
      if (newBands[index]) {
        newBands[index] = { ...newBands[index], gain: newGain };
      }
      return { ...prev, bands: newBands };
    });
  };

  const handleResetEq = () => {
    onUpdateEqState((prev) => ({
      ...prev,
      preamp: 0.0,
      bands: prev.bands.map((b) => ({ ...b, gain: 0.0 })),
      isBypassed: false,
    }));
  };

  const handleCleanBuffer = () => {
    setCleanBufferNotice(true);
    setTimeout(() => setCleanBufferNotice(false), 2500);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Top Welcome Banner & System Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#0C162E] via-[#0E1A36] to-[#0A1326] border border-[#1B2F55]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Selamat Datang, Arif Gunawan 👋
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Nikmati pengalaman audio terbaik di Windows 10/11 dengan Dynamic Island interaktif.
          </p>
        </div>

        {/* 3 Status Indicators */}
        <div className="flex items-center gap-4 text-xs">
          {/* Audio Engine */}
          <div 
            onClick={onOpenAuditModal}
            className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
            title="Klik untuk melihat Status Teknis Audio Engine"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 leading-none">Audio Engine</span>
              <span className="text-xs font-semibold text-emerald-400">Aktif</span>
            </div>
          </div>

          {/* Output Device */}
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 leading-none">Output</span>
              <span className="text-xs font-semibold text-slate-200 max-w-[120px] truncate">
                {outputDeviceName}
              </span>
            </div>
          </div>

          {/* Sample Rate */}
          <div className="flex items-center gap-2 font-mono">
            <Disc className="w-4 h-4 text-blue-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 leading-none">Sample Rate</span>
              <span className="text-xs font-semibold text-slate-200">
                {(sampleRate / 1000).toFixed(3).replace('.', ',')} Hz
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 10-Band Equalizer (Left) + Presets & Effects (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Equalizer 10-Band Card (8 Cols) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#091224] border border-[#192C50] space-y-4 shadow-xl">
          {/* EQ Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-600/20 text-cyan-400 border border-blue-500/30">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">Equalizer 10-Band</h2>
                <p className="text-[11px] text-slate-400">
                  Sesuaikan frekuensi audio sesuai preferensi Anda.
                </p>
              </div>
            </div>

            {/* EQ Header Controls: Quick Full Bass + Test Play + Toggle Aktif + Reset */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Quick Full Bass Preset Shortcut */}
              <button
                onClick={() => onSelectPreset('full_bass')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-600/30 to-amber-500/20 hover:from-red-600/50 hover:to-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                title="Aktifkan preset Full Bass secara instan"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Full Bass</span>
              </button>

              {/* Instant Audio Test button */}
              <button
                onClick={onTogglePlayback}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  nowPlaying.isPlaying
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_#34d399]'
                    : 'bg-[#122240] text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500 hover:text-slate-950'
                }`}
                title={nowPlaying.isPlaying ? "Hentikan Pemutaran Audio" : "Putar Audio untuk Menguji Suara Equalizer"}
              >
                {nowPlaying.isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                <span>{nowPlaying.isPlaying ? 'Audio Aktif' : 'Uji Suara EQ'}</span>
              </button>

              {/* Toggle Aktif */}
              <div className="flex items-center gap-1.5 bg-[#0E1A33] px-2 py-1 rounded-lg border border-[#1A2E54]">
                <button
                  onClick={() => onUpdateEqState((prev) => ({ ...prev, isBypassed: !prev.isBypassed }))}
                  className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                    !eqState.isBypassed ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${
                      !eqState.isBypassed ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-[11px] font-semibold text-slate-200">
                  {!eqState.isBypassed ? 'Aktif' : 'Bypass'}
                </span>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleResetEq}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0E1A33] hover:bg-[#152549] text-slate-300 hover:text-white border border-[#1A2E54] text-xs font-medium transition-colors"
                title="Reset EQ ke 0 dB"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Frequency Curve Canvas & Preamp Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Grafik Respons Frekuensi Akurat (Transfer Function DSP)</span>
              <div className="flex items-center gap-2">
                <span>Preamp:</span>
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
                  className="w-20 h-1 bg-slate-800 rounded-lg cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            {/* Interactive Canvas */}
            <FrequencyCurveCanvas
              bands={eqState.bands}
              preamp={eqState.preamp}
              gainRange={eqState.gainRange}
              isBypassed={eqState.isBypassed}
              onBandGainChange={handleBandGainChange}
            />
          </div>

          {/* 10 Vertical Sliders Bar with Tactile Nudge Controls */}
          <div className="pt-2">
            <div className="grid grid-cols-10 gap-1 sm:gap-2">
              {eqState.bands.map((band, idx) => {
                const gain = band.gain;
                const formattedGain = gain > 0 ? `+${gain.toFixed(1)}` : gain.toFixed(1);

                return (
                  <div key={band.freq} className="flex flex-col items-center space-y-1">
                    {/* +0.5 dB Quick Step Button */}
                    <button
                      onClick={() => handleBandGainChange(idx, Math.min(12, gain + 0.5))}
                      disabled={eqState.isBypassed}
                      className="w-5 h-4 flex items-center justify-center rounded bg-[#101D36] hover:bg-cyan-500 hover:text-slate-950 text-slate-400 text-[10px] font-bold border border-[#1A2E54] transition-colors disabled:opacity-30"
                      title={`Tambah 0.5 dB pada ${band.label}`}
                    >
                      +
                    </button>

                    {/* Gain dB Readout Badge */}
                    <span
                      className={`text-[9px] font-mono px-1 py-0.2 rounded transition-colors ${
                        gain > 0
                          ? 'text-cyan-400 bg-cyan-950/40 font-semibold'
                          : gain < 0
                          ? 'text-blue-400 bg-blue-950/40'
                          : 'text-slate-400'
                      }`}
                    >
                      {formattedGain}
                    </span>

                    {/* Vertical Slider Track Container */}
                    <div className="relative h-28 flex items-center justify-center py-1">
                      {/* Vertical line indicator */}
                      <div className="absolute w-0.5 h-full bg-[#182C50] rounded-full pointer-events-none" />
                      {/* Zero dB tick mark */}
                      <div className="absolute w-2.5 h-[1px] bg-cyan-500/40 pointer-events-none" />

                      <input
                        type="range"
                        min="-12"
                        max="12"
                        step="0.5"
                        value={band.gain}
                        onChange={(e) => handleBandGainChange(idx, parseFloat(e.target.value))}
                        disabled={eqState.isBypassed}
                        className="vertical-eq h-24 w-4 bg-transparent cursor-pointer z-10"
                        title={`${band.label}: ${formattedGain} dB`}
                      />
                    </div>

                    {/* -0.5 dB Quick Step Button */}
                    <button
                      onClick={() => handleBandGainChange(idx, Math.max(-12, gain - 0.5))}
                      disabled={eqState.isBypassed}
                      className="w-5 h-4 flex items-center justify-center rounded bg-[#101D36] hover:bg-cyan-500 hover:text-slate-950 text-slate-400 text-[10px] font-bold border border-[#1A2E54] transition-colors disabled:opacity-30"
                      title={`Kurang 0.5 dB pada ${band.label}`}
                    >
                      -
                    </button>

                    {/* Frequency Label */}
                    <span className="text-[10px] font-semibold text-slate-300 tracking-tight text-center whitespace-nowrap pt-0.5">
                      {band.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Presets (Top) + Efek Audio (Bottom) (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Preset Suara Card */}
          <div className="p-4 rounded-2xl bg-[#091224] border border-[#192C50] space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white tracking-wide">Preset Suara</h2>
              <button
                onClick={() => onNavigateTab('presets')}
                className="px-2.5 py-1 rounded-lg bg-[#0F1C36] hover:bg-[#16274B] text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-colors"
              >
                Kelola
              </button>
            </div>

            {/* Presets List */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {presets.slice(0, 8).map((preset) => {
                const isSelected = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onSelectPreset(preset.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/15 border border-cyan-500/40 text-white shadow-[0_0_12px_rgba(0,229,255,0.1)]'
                        : 'bg-[#0B152B] hover:bg-[#101D3B] text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-[#152546] text-slate-400'
                        }`}
                      >
                        {preset.name.charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold truncate">{preset.name}</span>
                        <span className="text-[10px] text-slate-400 truncate">
                          {preset.description}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Efek Audio Card */}
          <div className="p-4 rounded-2xl bg-[#091224] border border-[#192C50] space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white tracking-wide">Efek Audio</h2>
              </div>

              {/* Master Efek Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onUpdateEffects((prev) => ({ ...prev, enabled: !prev.enabled }))
                  }
                  className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                    effectsState.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${
                      effectsState.enabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-semibold text-slate-300">
                  {effectsState.enabled ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>

            {/* List of 5 Effects */}
            <div className="space-y-3 pt-1">
              {/* 1. Bass Enhancement */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-medium">Bass Enhancement</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 text-[11px]">
                      {effectsState.bassEnhancement.amount}%
                    </span>
                    <button
                      onClick={() =>
                        onUpdateEffects((p) => ({
                          ...p,
                          bassEnhancement: {
                            ...p.bassEnhancement,
                            enabled: !p.bassEnhancement.enabled,
                          },
                        }))
                      }
                      className={`w-6 h-3.5 flex items-center rounded-full p-0.5 ${
                        effectsState.bassEnhancement.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`bg-white w-2.5 h-2.5 rounded-full transform transition-transform ${
                          effectsState.bassEnhancement.enabled ? 'translate-x-2.5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={effectsState.bassEnhancement.amount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    onUpdateEffects((p) => ({
                      ...p,
                      bassEnhancement: { ...p.bassEnhancement, amount: val },
                    }));
                  }}
                  className="w-full h-1 bg-slate-800 rounded-lg cursor-pointer accent-cyan-400"
                />
              </div>

              {/* 2. Loudness Compensation */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-medium">Loudness</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 text-[11px]">
                      {effectsState.loudness.amount}%
                    </span>
                    <button
                      onClick={() =>
                        onUpdateEffects((p) => ({
                          ...p,
                          loudness: { ...p.loudness, enabled: !p.loudness.enabled },
                        }))
                      }
                      className={`w-6 h-3.5 flex items-center rounded-full p-0.5 ${
                        effectsState.loudness.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`bg-white w-2.5 h-2.5 rounded-full transform transition-transform ${
                          effectsState.loudness.enabled ? 'translate-x-2.5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={effectsState.loudness.amount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    onUpdateEffects((p) => ({
                      ...p,
                      loudness: { ...p.loudness, amount: val },
                    }));
                  }}
                  className="w-full h-1 bg-slate-800 rounded-lg cursor-pointer accent-cyan-400"
                />
              </div>

              {/* 3. Reverb */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-medium">Reverb (Ruang/Ambience)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 text-[11px]">
                      {effectsState.reverb.amount}%
                    </span>
                    <button
                      onClick={() =>
                        onUpdateEffects((p) => ({
                          ...p,
                          reverb: { ...p.reverb, enabled: !p.reverb.enabled },
                        }))
                      }
                      className={`w-6 h-3.5 flex items-center rounded-full p-0.5 ${
                        effectsState.reverb.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`bg-white w-2.5 h-2.5 rounded-full transform transition-transform ${
                          effectsState.reverb.enabled ? 'translate-x-2.5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={effectsState.reverb.amount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    onUpdateEffects((p) => ({
                      ...p,
                      reverb: { ...p.reverb, amount: val },
                    }));
                  }}
                  className="w-full h-1 bg-slate-800 rounded-lg cursor-pointer accent-cyan-400"
                />
              </div>

              {/* 4. Echo */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-medium">Echo (Gema Suara)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 text-[11px]">
                      {effectsState.echo.amount}%
                    </span>
                    <button
                      onClick={() =>
                        onUpdateEffects((p) => ({
                          ...p,
                          echo: { ...p.echo, enabled: !p.echo.enabled },
                        }))
                      }
                      className={`w-6 h-3.5 flex items-center rounded-full p-0.5 ${
                        effectsState.echo.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`bg-white w-2.5 h-2.5 rounded-full transform transition-transform ${
                          effectsState.echo.enabled ? 'translate-x-2.5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={effectsState.echo.amount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    onUpdateEffects((p) => ({
                      ...p,
                      echo: { ...p.echo, amount: val },
                    }));
                  }}
                  className="w-full h-1 bg-slate-800 rounded-lg cursor-pointer accent-cyan-400"
                />
              </div>

              {/* 5. Virtual Surround */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-medium">Virtual Surround</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 text-[11px]">
                      {effectsState.virtualSurround.amount}%
                    </span>
                    <button
                      onClick={() =>
                        onUpdateEffects((p) => ({
                          ...p,
                          virtualSurround: {
                            ...p.virtualSurround,
                            enabled: !p.virtualSurround.enabled,
                          },
                        }))
                      }
                      className={`w-6 h-3.5 flex items-center rounded-full p-0.5 ${
                        effectsState.virtualSurround.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`bg-white w-2.5 h-2.5 rounded-full transform transition-transform ${
                          effectsState.virtualSurround.enabled ? 'translate-x-2.5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={effectsState.virtualSurround.amount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    onUpdateEffects((p) => ({
                      ...p,
                      virtualSurround: { ...p.virtualSurround, amount: val },
                    }));
                  }}
                  className="w-full h-1 bg-slate-800 rounded-lg cursor-pointer accent-cyan-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Frequency Spectrum Visualizer (AnalyserNode) */}
      <AudioSpectrumVisualizer variant="full" height={110} />

      {/* Bottom Row: Perangkat Audio + Sekarang Diputar + 4 Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Perangkat Audio strip (3 Cols) */}
        <div className="md:col-span-3 p-4 rounded-2xl bg-[#091224] border border-[#192C50] space-y-3">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Perangkat Audio</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Output:</span>
              <span className="font-semibold text-slate-200 truncate max-w-[130px]" title={outputDeviceName}>
                {outputDeviceName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Input:</span>
              <span className="font-semibold text-slate-200 truncate max-w-[130px]" title={inputDeviceName}>
                {inputDeviceName}
              </span>
            </div>

            {/* Volume slider */}
            <div className="pt-1 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Volume Sistem:</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {Math.round(masterVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={masterVolume}
                onChange={(e) => onChangeMasterVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Sekarang Diputar (Now Playing) card (5 Cols) */}
        <div className="md:col-span-5 p-4 rounded-2xl bg-[#091224] border border-[#192C50] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Disc className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Sekarang Diputar</h3>
            </div>

            {/* Audio Source Quick Select */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSwitchAudioSource('demo_synth')}
                className="px-2 py-0.5 rounded text-[10px] bg-[#142342] hover:bg-cyan-500/20 text-cyan-400 font-semibold border border-cyan-500/30"
                title="Putar Synthwave Groove"
              >
                Synth
              </button>
              <button
                onClick={() => onSwitchAudioSource('demo_rock')}
                className="px-2 py-0.5 rounded text-[10px] bg-[#142342] hover:bg-cyan-500/20 text-cyan-400 font-semibold border border-cyan-500/30"
                title="Putar Rock Riff"
              >
                Rock
              </button>
              <button
                onClick={() => onSwitchAudioSource('demo_bass')}
                className="px-2 py-0.5 rounded text-[10px] bg-[#142342] hover:bg-cyan-500/20 text-cyan-400 font-semibold border border-cyan-500/30"
                title="Frekuensi Sweep 20Hz-20kHz"
              >
                Sweep
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-800 flex items-center justify-center text-white shrink-0 shadow-lg">
                <Disc className={`w-6 h-6 ${nowPlaying.isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">{nowPlaying.title}</span>
                <span className="text-[11px] text-cyan-400 font-medium truncate">{nowPlaying.source}</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {nowPlaying.isPlaying ? 'Media Playing (Realtime DSP)' : 'Session Standby'}
                </span>
              </div>
            </div>

            {/* Media Player Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onPrevTrack}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={onTogglePlayback}
                className="p-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all"
              >
                {nowPlaying.isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
              <button
                onClick={onNextTrack}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Real-time Spectrum mini strip in Now Playing */}
          <div className="pt-2 border-t border-[#142340] flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Sinyal Audio Aktif</span>
            </span>
            <AudioSpectrumVisualizer variant="compact" height={18} />
          </div>
        </div>

        {/* 4 Quick Action Tiles (4 Cols) */}
        <div className="md:col-span-4 grid grid-cols-4 gap-2">
          {/* 1. File & Folder */}
          <button
            onClick={() => onNavigateTab('presets')}
            className="p-3 rounded-2xl bg-[#091224] hover:bg-[#101D38] border border-[#192C50] hover:border-cyan-500/40 flex flex-col items-center justify-center gap-1.5 text-center transition-all group"
          >
            <Folder className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-semibold text-slate-300">File & Folder</span>
          </button>

          {/* 2. Monitor Sistem */}
          <button
            onClick={() => onNavigateTab('equalizer')}
            className="p-3 rounded-2xl bg-[#091224] hover:bg-[#101D38] border border-[#192C50] hover:border-cyan-500/40 flex flex-col items-center justify-center gap-1.5 text-center transition-all group"
          >
            <Activity className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-semibold text-slate-300">Monitor Sistem</span>
          </button>

          {/* 3. Pembersih File / Buffer */}
          <button
            onClick={handleCleanBuffer}
            className="p-3 rounded-2xl bg-[#091224] hover:bg-[#101D38] border border-[#192C50] hover:border-cyan-500/40 flex flex-col items-center justify-center gap-1.5 text-center transition-all group"
          >
            <Trash2 className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-semibold text-slate-300">
              {cleanBufferNotice ? 'Dibersihkan!' : 'Pembersih'}
            </span>
          </button>

          {/* 4. Backup & Restore */}
          <button
            onClick={() => onNavigateTab('settings')}
            className="p-3 rounded-2xl bg-[#091224] hover:bg-[#101D38] border border-[#192C50] hover:border-cyan-500/40 flex flex-col items-center justify-center gap-1.5 text-center transition-all group"
          >
            <RefreshCw className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-semibold text-slate-300">Backup</span>
          </button>
        </div>
      </div>

      {/* Dynamic Island Mode Showcase Strip (Matching mockup lower showcase) */}
      <div className="p-4 rounded-2xl bg-[#081020] border border-[#162747] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Pilihan Tampilan Dynamic Island Desktop
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Kapsul kontrol audio mengambang siap pakai kapan saja
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Compact */}
          <button
            onClick={() => onUpdateIslandConfig({ mode: 'compact', enabled: true })}
            className={`p-3 rounded-xl border text-left transition-all ${
              islandConfig.mode === 'compact'
                ? 'bg-blue-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                : 'bg-[#0B152B] border-[#1A2D50] hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">Dynamic Island - Compact</span>
              {islandConfig.mode === 'compact' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
            </div>
            <p className="text-[11px] text-slate-400">
              Tampilan kapsul kecil di atas layar. Tetap informatif, tidak mengganggu aktivitas.
            </p>
          </button>

          {/* Expanded */}
          <button
            onClick={() => onUpdateIslandConfig({ mode: 'expanded', enabled: true })}
            className={`p-3 rounded-xl border text-left transition-all ${
              islandConfig.mode === 'expanded'
                ? 'bg-blue-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                : 'bg-[#0B152B] border-[#1A2D50] hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">Dynamic Island - Expanded</span>
              {islandConfig.mode === 'expanded' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
            </div>
            <p className="text-[11px] text-slate-400">
              Panel kontrol lengkap dengan akses cepat ke equalizer, bass boost, dan perangkat.
            </p>
          </button>

          {/* Mini */}
          <button
            onClick={() => onUpdateIslandConfig({ mode: 'mini', enabled: true })}
            className={`p-3 rounded-xl border text-left transition-all ${
              islandConfig.mode === 'mini'
                ? 'bg-blue-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                : 'bg-[#0B152B] border-[#1A2D50] hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">Dynamic Island - Mini</span>
              {islandConfig.mode === 'mini' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
            </div>
            <p className="text-[11px] text-slate-400">
              Mode minimal untuk pekerjaan atau game intensif. Menampilkan status esensial.
            </p>
          </button>

          {/* Hidden */}
          <button
            onClick={() => onUpdateIslandConfig({ mode: 'hidden' })}
            className={`p-3 rounded-xl border text-left transition-all ${
              islandConfig.mode === 'hidden'
                ? 'bg-blue-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                : 'bg-[#0B152B] border-[#1A2D50] hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">Dynamic Island - Hidden</span>
              {islandConfig.mode === 'hidden' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
            </div>
            <p className="text-[11px] text-slate-400">
              Sembunyikan kapsul jika tidak diperlukan. Semua pengaturan tetap dapat diakses kapan saja.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
