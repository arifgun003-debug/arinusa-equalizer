/**
 * ARINUSA EQUALIZER - Settings & Preferences View
 * Dynamic Island preferences, Windows startup, Local Database Backup/Restore, and Diagnostics
 * ARINUSA GROUP | ARIF GUNAWAN
 */

import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Sparkles, 
  Database, 
  Monitor, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  FileText,
  Shield,
  Layers
} from 'lucide-react';
import { DynamicIslandConfig } from '../../types/audio';
import { storage } from '../../services/storage';
import { downloadFile } from '../../services/windowsApoBridge';

interface SettingsViewProps {
  islandConfig: DynamicIslandConfig;
  onUpdateIslandConfig: (newConfig: Partial<DynamicIslandConfig>) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  islandConfig,
  onUpdateIslandConfig,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [scaleFactor, setScaleFactor] = useState<'100' | '125' | '150'>('100');
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExportBackup = () => {
    const jsonStr = storage.exportFullBackup();
    downloadFile(`arinusa_equalizer_full_backup_${new Date().toISOString().slice(0, 10)}.json`, jsonStr, 'application/json');
    setBackupMessage('Cadangan konfigurasi berhasil diekspor!');
    setTimeout(() => setBackupMessage(null), 3000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = storage.importFullBackup(content);
      if (ok) {
        setBackupMessage('Cadangan berhasil dipulihkan! Halaman akan memuat ulang.');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setBackupMessage('Gagal memulihkan cadangan. Format tidak valid.');
        setTimeout(() => setBackupMessage(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan seluruh pengaturan ke setelan awal pabrik?')) {
      storage.resetToFactoryDefaults();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#091224] border border-[#192C50]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600/20 text-cyan-400 border border-blue-500/30">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Pengaturan & Preferensi</h1>
            <p className="text-xs text-slate-400">
              Konfigurasi Dynamic Island, database lokal, skala antarmuka Windows, dan diagnostik.
            </p>
          </div>
        </div>
      </div>

      {backupMessage && (
        <div className="p-3.5 rounded-xl bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 text-xs font-semibold">
          {backupMessage}
        </div>
      )}

      {/* Grid: Dynamic Island Settings (Left) + Database & System (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Dynamic Island Configuration Card */}
        <div className="p-5 rounded-2xl bg-[#091224] border border-[#192C50] space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-[#162747]">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              Konfigurasi ARINUSA Dynamic Island
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            {/* Enable Island Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-semibold block">Tampilkan Dynamic Island</span>
                <span className="text-[11px] text-slate-400">Kapsul mengambang di atas semua jendela</span>
              </div>
              <button
                onClick={() => onUpdateIslandConfig({ enabled: !islandConfig.enabled })}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  islandConfig.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                    islandConfig.enabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Position Picker */}
            <div className="space-y-1.5">
              <span className="text-slate-300 font-medium block">Posisi Dok Kapsul</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'top-center', label: 'Tengah Atas' },
                  { id: 'top-right', label: 'Kanan Atas' },
                  { id: 'bottom-right', label: 'Kanan Bawah' },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => onUpdateIslandConfig({ position: pos.id as any })}
                    className={`py-2 px-2 rounded-xl border text-center font-semibold text-[11px] transition-all ${
                      islandConfig.position === pos.id
                        ? 'bg-blue-950/60 border-cyan-400 text-cyan-300'
                        : 'bg-[#0B152B] border-[#182C50] text-slate-400 hover:text-white'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transparency Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-300 font-medium">Transparansi Latar Kapsul</span>
                <span className="font-mono text-cyan-400 font-bold">{islandConfig.transparency}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={islandConfig.transparency}
                onChange={(e) =>
                  onUpdateIslandConfig({ transparency: parseInt(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Auto Start Toggle */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-slate-200 font-semibold block">Jalankan Saat Windows Mulai</span>
                <span className="text-[11px] text-slate-400">Mulai otomatis di latar belakang (Startup task)</span>
              </div>
              <button
                onClick={() =>
                  onUpdateIslandConfig({
                    autoStartWithWindows: !islandConfig.autoStartWithWindows,
                  })
                }
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  islandConfig.autoStartWithWindows ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                    islandConfig.autoStartWithWindows ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Media Session Integration Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-semibold block">Kontrol Media Windows Session API</span>
                <span className="text-[11px] text-slate-400">Tampilkan judul lagu dan kontrol play/pause</span>
              </div>
              <button
                onClick={() =>
                  onUpdateIslandConfig({
                    showMediaControls: !islandConfig.showMediaControls,
                  })
                }
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  islandConfig.showMediaControls ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                    islandConfig.showMediaControls ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Local Storage & SQLite Database Card */}
        <div className="p-5 rounded-2xl bg-[#091224] border border-[#192C50] space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-[#162747]">
            <Database className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              Penyimpanan Lokal & Basis Data
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <p className="text-slate-400 leading-relaxed">
              Semua pengaturan equalizer, preset pengguna, profil perangkat, dan status lisensi disimpan secara lokal di sistem Anda tanpa transmisi data sensitif ke cloud eksternal.
            </p>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleExportBackup}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#0E1A33] hover:bg-[#152549] text-cyan-400 border border-cyan-500/30 font-semibold transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Ekspor Cadangan</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportBackup}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#0E1A33] hover:bg-[#152549] text-slate-300 hover:text-white border border-[#1A2E54] font-semibold transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Pulihkan Cadangan</span>
              </button>
            </div>

            {/* Factory Reset */}
            <div className="pt-2 border-t border-[#162747] flex items-center justify-between">
              <div>
                <span className="text-red-400 font-semibold block">Kembalikan ke Setelan Pabrik</span>
                <span className="text-[11px] text-slate-400">Hapus semua preset kustom dan reset EQ</span>
              </div>
              <button
                onClick={handleFactoryReset}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold transition-colors"
              >
                Reset Pabrik
              </button>
            </div>
          </div>
        </div>

        {/* Windows Interface Scale & Appearance */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-[#091224] border border-[#192C50] space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-[#162747]">
            <Monitor className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              Tampilan, Skala DPI & Bahasa
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Theme switcher */}
            <div className="space-y-1.5">
              <span className="text-slate-300 font-medium block">Tema Warna</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { if (!isDarkMode) onToggleDarkMode(); }}
                  className={`flex-1 py-2 rounded-xl border text-center font-semibold transition-all ${
                    isDarkMode
                      ? 'bg-blue-950/60 border-cyan-400 text-cyan-300'
                      : 'bg-[#0B152B] border-[#182C50] text-slate-400'
                  }`}
                >
                  Dark Navy (Bawaan)
                </button>
                <button
                  onClick={() => { if (isDarkMode) onToggleDarkMode(); }}
                  className={`flex-1 py-2 rounded-xl border text-center font-semibold transition-all ${
                    !isDarkMode
                      ? 'bg-slate-200 text-slate-900 border-cyan-500'
                      : 'bg-[#0B152B] border-[#182C50] text-slate-400'
                  }`}
                >
                  Mode Terang
                </button>
              </div>
            </div>

            {/* DPI Scale */}
            <div className="space-y-1.5">
              <span className="text-slate-300 font-medium block">Skala Tampilan Windows</span>
              <select
                value={scaleFactor}
                onChange={(e) => setScaleFactor(e.target.value as any)}
                className="w-full bg-[#060D1A] border border-[#1E345C] text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
              >
                <option value="100">100% (Standar FHD)</option>
                <option value="125">125% (Rekomendasi 2K)</option>
                <option value="150">150% (High DPI / 4K)</option>
              </select>
            </div>

            {/* Language */}
            <div className="space-y-1.5">
              <span className="text-slate-300 font-medium block">Bahasa Aplikasi</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full bg-[#060D1A] border border-[#1E345C] text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
              >
                <option value="id">Bahasa Indonesia (Utama)</option>
                <option value="en">English (US)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
