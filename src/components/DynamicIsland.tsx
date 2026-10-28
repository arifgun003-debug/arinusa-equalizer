/**
 * ARINUSA DYNAMIC ISLAND DESKTOP
 * Floating Interactive Capsule Window with 4 Modes: Compact, Expanded, Mini, Hidden
 * ARINUSA GROUP | ARIF GUNAWAN
 */

import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Sliders, 
  Flame, 
  Speaker, 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  Maximize2, 
  Minimize2, 
  X,
  Disc,
  Radio,
  Sparkles
} from 'lucide-react';
import { DynamicIslandMode, DynamicIslandConfig, Preset, AudioEffectsState } from '../types/audio';
import { AudioSpectrumVisualizer } from './AudioSpectrumVisualizer';

interface DynamicIslandProps {
  config: DynamicIslandConfig;
  onUpdateConfig: (newConfig: Partial<DynamicIslandConfig>) => void;
  activePreset: Preset;
  isEqEnabled: boolean;
  onToggleEq: () => void;
  effects: AudioEffectsState;
  onToggleBassBoost: () => void;
  masterVolume: number;
  onChangeMasterVolume: (vol: number) => void;
  outputDeviceName: string;
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
  onOpenEqView: () => void;
  onOpenSettingsView: () => void;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  config,
  onUpdateConfig,
  activePreset,
  isEqEnabled,
  onToggleEq,
  effects,
  onToggleBassBoost,
  masterVolume,
  onChangeMasterVolume,
  outputDeviceName,
  nowPlaying,
  onTogglePlayback,
  onNextTrack,
  onPrevTrack,
  onOpenEqView,
  onOpenSettingsView,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(masterVolume);

  if (!config.enabled || config.mode === 'hidden') {
    return (
      <div className="fixed top-2 right-4 z-50">
        <button
          onClick={() => onUpdateConfig({ mode: 'compact' })}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#091325]/90 border border-cyan-500/40 text-cyan-400 text-xs font-semibold shadow-lg hover:bg-cyan-500/20 transition-all backdrop-blur-md"
          title="Tampilkan Dynamic Island"
        >
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>Buka Dynamic Island</span>
        </button>
      </div>
    );
  }

  const handleMuteToggle = () => {
    if (isMuted) {
      onChangeMasterVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(masterVolume);
      onChangeMasterVolume(0);
      setIsMuted(true);
    }
  };

  // Compute position styles
  const getPositionClasses = () => {
    switch (config.position) {
      case 'top-right':
        return 'top-4 right-6';
      case 'bottom-right':
        return 'bottom-6 right-6';
      case 'top-center':
      default:
        return 'top-3 left-1/2 -translate-x-1/2';
    }
  };

  const opacityStyle = {
    backgroundColor: `rgba(9, 17, 34, ${config.transparency / 100})`,
  };

  return (
    <div
      className={`fixed ${getPositionClasses()} z-50 transition-all duration-300 select-none`}
      style={{ backdropFilter: 'blur(16px)' }}
    >
      {/* 1. MINI MODE */}
      {config.mode === 'mini' && (
        <div
          onClick={() => onUpdateConfig({ mode: 'compact' })}
          style={opacityStyle}
          className="cursor-pointer group flex items-center gap-3 px-4 py-2 rounded-full border border-cyan-500/30 shadow-[0_4px_25px_rgba(0,0,0,0.5)] hover:border-cyan-400/60 transition-all"
        >
          {/* Real-time Spectrum Visualizer */}
          <div className="flex items-center h-4 px-1 py-0.5 rounded bg-blue-950/70 border border-cyan-500/20">
            <AudioSpectrumVisualizer variant="compact" height={16} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white tracking-wide">ARINUSA</span>
            <span className="text-[11px] text-cyan-400 font-medium">EQ Aktif</span>
          </div>

          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
        </div>
      )}

      {/* 2. COMPACT MODE (Default Sleek Capsule matching top of mockup) */}
      {config.mode === 'compact' && (
        <div
          style={opacityStyle}
          className="flex items-center gap-4 px-4 py-2 rounded-full border border-cyan-500/35 shadow-[0_8px_30px_rgba(0,0,0,0.6)] text-white hover:border-cyan-400/70 transition-all"
        >
          {/* Real-time Audio Spectrum & Preset Badge */}
          <div
            onClick={() => onUpdateConfig({ mode: 'expanded' })}
            className="flex items-center gap-2.5 cursor-pointer group"
            title="Klik untuk membuka panel Expanded"
          >
            {/* Real-time Spectrum Waveform */}
            <div className="flex items-center h-5 px-1 py-0.5 rounded-md bg-blue-950/80 border border-cyan-500/30 shadow-inner">
              <AudioSpectrumVisualizer variant="compact" height={20} />
            </div>

            <div className="flex flex-col text-left">
              <span className="text-xs font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                ARINUSA EQUALIZER
              </span>
              <span className="text-[10px] text-cyan-400 font-medium">
                Preset: {activePreset.name} • {isEqEnabled ? 'EQ Aktif' : 'Bypass'}
              </span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#1A2F50]">
            <button
              onClick={handleMuteToggle}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {isMuted || masterVolume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => onChangeMasterVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-slate-700 rounded-lg cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Now Playing Track & Controls */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#1A2F50]">
            <div
              onClick={() => onUpdateConfig({ mode: 'expanded' })}
              className="hidden md:flex flex-col text-left cursor-pointer"
            >
              <span className="text-xs font-medium text-slate-200 max-w-[110px] truncate">
                {nowPlaying.title}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {nowPlaying.source}
              </span>
            </div>

            {/* Media Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={onPrevTrack}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors"
              >
                <SkipBack className="w-3 h-3" />
              </button>
              <button
                onClick={onTogglePlayback}
                className="p-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-[0_0_10px_rgba(0,229,255,0.4)] transition-all"
              >
                {nowPlaying.isPlaying ? (
                  <Pause className="w-3 h-3 fill-current" />
                ) : (
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                )}
              </button>
              <button
                onClick={onNextTrack}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors"
              >
                <SkipForward className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Mode Switchers */}
          <div className="flex items-center gap-1 pl-1">
            <button
              onClick={() => onUpdateConfig({ mode: 'expanded' })}
              className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
              title="Perluas (Expanded Mode)"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateConfig({ mode: 'mini' })}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Mini Mode"
            >
              <Minimize2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* 3. EXPANDED MODE (Full Control Center matching bottom showcase) */}
      {config.mode === 'expanded' && (
        <div
          style={opacityStyle}
          className="w-80 md:w-96 p-4 rounded-3xl border border-cyan-500/40 shadow-[0_12px_45px_rgba(0,0,0,0.7)] text-white space-y-3.5 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#1E3358]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-xs">
                A
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">ARINUSA EQUALIZER</span>
                <span className="text-[10px] text-cyan-400">
                  Preset: {activePreset.name} • {isEqEnabled ? 'EQ Aktif' : 'Bypass'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                Aktif
              </span>
              <button
                onClick={() => onUpdateConfig({ mode: 'compact' })}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="Tutup ke Compact"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Master Volume Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Volume Sistem</span>
              </span>
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

          {/* Track Now Playing Box */}
          <div className="p-3 rounded-2xl bg-[#0F1B34] border border-[#1E365E] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-700 to-cyan-700 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Disc className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">{nowPlaying.title}</span>
                  <span className="text-[10px] text-cyan-400 truncate">{nowPlaying.source}</span>
                </div>
              </div>

              {/* Media buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={onPrevTrack}
                  className="p-1.5 text-slate-300 hover:text-white transition-colors"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onTogglePlayback}
                  className="p-2 rounded-full bg-cyan-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)] hover:bg-cyan-300 transition-all"
                >
                  {nowPlaying.isPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </button>
                <button
                  onClick={onNextTrack}
                  className="p-1.5 text-slate-300 hover:text-white transition-colors"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all"
                style={{
                  width: `${(nowPlaying.currentTime / Math.max(1, nowPlaying.duration)) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Real-Time Frequency Spectrum Visualizer in Island */}
          <AudioSpectrumVisualizer variant="island-expanded" />

          {/* Quick Access Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {/* Equalizer Quick Jump */}
            <button
              onClick={() => {
                onOpenEqView();
                onUpdateConfig({ mode: 'compact' });
              }}
              className="p-2.5 rounded-xl bg-[#0C162A] hover:bg-[#122242] border border-[#1E345C] flex flex-col items-center gap-1 text-center transition-all group"
            >
              <Sliders className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold text-slate-200">Equalizer</span>
            </button>

            {/* Bass Boost Toggle */}
            <button
              onClick={onToggleBassBoost}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                effects.bassEnhancement.enabled
                  ? 'bg-blue-600/30 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                  : 'bg-[#0C162A] hover:bg-[#122242] border-[#1E345C] text-slate-400'
              }`}
            >
              <Flame className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-semibold">Bass Boost</span>
            </button>

            {/* Devices View */}
            <button
              onClick={() => {
                onOpenSettingsView();
                onUpdateConfig({ mode: 'compact' });
              }}
              className="p-2.5 rounded-xl bg-[#0C162A] hover:bg-[#122242] border border-[#1E345C] flex flex-col items-center gap-1 text-center transition-all group"
            >
              <Speaker className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold text-slate-200">Perangkat</span>
            </button>
          </div>

          {/* Bottom Device & Sample Rate Strip */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-[#182B4B]">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-cyan-400 font-semibold">48 kHz</span>
              <span>•</span>
              <span className="truncate max-w-[120px]">{outputDeviceName}</span>
            </div>

            <button
              onClick={() => {
                onOpenSettingsView();
                onUpdateConfig({ mode: 'compact' });
              }}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Pengaturan Island"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
