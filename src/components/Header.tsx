/**
 * ARINUSA EQUALIZER - Top Desktop Header & Window Frame
 * ARINUSA GROUP | ARIF GUNAWAN
 */

import React from 'react';
import { 
  Volume2, 
  Layers, 
  Radio, 
  Minus, 
  Square, 
  X, 
  Sun, 
  Moon,
  Sparkles,
  ShieldCheck,
  Disc,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { AudioEngineStatus } from '../types/audio';

interface HeaderProps {
  engineStatus: AudioEngineStatus;
  sampleRate: number;
  outputDeviceName: string;
  isSystemCaptureActive: boolean;
  onToggleSystemCapture: () => void;
  isDynamicIslandVisible: boolean;
  onToggleDynamicIsland: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAuditModal: () => void;
  activeSourceLabel: string;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  engineStatus,
  sampleRate,
  outputDeviceName,
  isSystemCaptureActive,
  onToggleSystemCapture,
  isDynamicIslandVisible,
  onToggleDynamicIsland,
  isDarkMode,
  onToggleDarkMode,
  onOpenAuditModal,
  activeSourceLabel,
  isSidebarCollapsed = false,
  onToggleSidebar
}) => {
  return (
    <header className="h-14 bg-[#070D1A]/95 border-b border-[#1A2846] flex items-center justify-between px-4 z-40 select-none">
      {/* Brand & Wordmark */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-[#122240] transition-colors"
            title={isSidebarCollapsed ? "Buka Menu Samping" : "Tutup Menu Samping"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        )}

        {/* Modern Stylized Glowing 'A' Logo */}
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-800 shadow-[0_0_15px_rgba(0,229,255,0.4)]">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 22h4.5l2.2-4.5h6.6L17.5 22H22L12 2zm0 6.5l2.4 4.9H9.6L12 8.5z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-white text-base">ARINUSA EQUALIZER</span>
            <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 rounded">
              v1.0 Pro
            </span>
          </div>
          <span className="text-[11px] text-slate-400 -mt-0.5">Suara Lebih Baik, Hidup Lebih Asik</span>
        </div>
      </div>

      {/* Middle Status Telemetry Bar */}
      <div className="hidden lg:flex items-center gap-5 text-xs text-slate-300">
        {/* Engine Status */}
        <button 
          onClick={onOpenAuditModal}
          title="Klik untuk melihat Audit & Validasi Teknis Audio Windows"
          className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0F192C] border border-[#1E3154] hover:border-cyan-500/40 transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span className="text-slate-400">Audio Engine:</span>
          <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[11px]">
            {engineStatus === 'active' ? 'Aktif' : 'Standby'}
          </span>
        </button>

        {/* Output Device */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0F192C] border border-[#1E3154]">
          <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Output:</span>
          <span className="text-slate-200 font-medium max-w-[130px] truncate" title={outputDeviceName}>
            {outputDeviceName}
          </span>
        </div>

        {/* Sample Rate */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0F192C] border border-[#1E3154] font-mono tabular-nums">
          <Disc className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400">Sample Rate:</span>
          <span className="text-slate-200 font-medium">
            {(sampleRate / 1000).toFixed(3).replace('.', ',')} kHz
          </span>
        </div>

        {/* Active Source indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-950/60 border border-blue-800/40 text-[11px] text-blue-300">
          <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>Sumber: <strong className="text-white">{activeSourceLabel}</strong></span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Real System Audio Capture Button */}
        <button
          onClick={onToggleSystemCapture}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isSystemCaptureActive
              ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-900 font-bold shadow-[0_0_12px_rgba(0,229,255,0.3)]'
          }`}
          title="Tangkap audio seluruh sistem Windows (YouTube, Spotify, Games) untuk diproses equalizer"
        >
          <Radio className="w-3.5 h-3.5" />
          <span>{isSystemCaptureActive ? 'Putus Audio Sistem' : 'Tangkap Audio Sistem'}</span>
        </button>

        {/* Dynamic Island Quick Toggle */}
        <button
          onClick={onToggleDynamicIsland}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            isDynamicIslandVisible 
              ? 'bg-[#152544] text-cyan-400 border-cyan-500/40 shadow-[0_0_10px_rgba(0,229,255,0.2)]'
              : 'bg-[#0E182C] text-slate-400 border-[#1E3154] hover:text-white'
          }`}
          title="Tampilkan / Sembunyikan ARINUSA Dynamic Island Desktop"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Dynamic Island</span>
        </button>

        {/* Technical Audit Modal button */}
        <button
          onClick={onOpenAuditModal}
          className="p-2 rounded-lg bg-[#0E182C] text-slate-400 hover:text-cyan-400 border border-[#1E3154] transition-colors"
          title="Validasi Arsitektur Audio & Windows APO"
        >
          <ShieldCheck className="w-4 h-4" />
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg bg-[#0E182C] text-slate-400 hover:text-white border border-[#1E3154] transition-colors"
          title={isDarkMode ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Windows Window Controls */}
        <div className="hidden sm:flex items-center gap-1 pl-2 ml-1 border-l border-[#1A2846]">
          <button
            onClick={() => window.electronAPI?.minimizeWindow()}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Minimalkan Jendela"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => window.electronAPI?.maximizeWindow()}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Maksimalkan / Pulihkan"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={() => window.electronAPI?.closeWindow()}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
            title="Tutup Aplikasil"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
