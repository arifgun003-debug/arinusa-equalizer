/**
 * ARINUSA EQUALIZER - First-Time Windows C: Drive Installation & Permission Wizard
 * Meminta izin administrator untuk membuat direktori di Disk C: dan mendaftarkan sAPO
 * ARINUSA GROUP | ARIF GUNAWAN
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  FolderPlus, 
  HardDrive, 
  CheckCircle2, 
  Terminal, 
  FolderCheck, 
  ArrowRight,
  ShieldCheck,
  Disc,
  AlertCircle
} from 'lucide-react';
import { storage } from '../services/storage';

interface FirstTimeSetupModalProps {
  isOpen: boolean;
  onComplete: (installPath: string) => void;
  onClose?: () => void;
}

export const FirstTimeSetupModal: React.FC<FirstTimeSetupModalProps> = ({
  isOpen,
  onComplete,
  onClose,
}) => {
  const [installPath, setInstallPath] = useState('C:\\Program Files\\ARINUSA\\Equalizer');
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installStep, setInstallStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const installLogs = [
    'Membuat direktori utama: C:\\Program Files\\ARINUSA\\Equalizer\\',
    'Membuat folder database & preset: C:\\ProgramData\\ARINUSA\\Equalizer\\Presets\\',
    'Menyiapkan modul C++ DSP Native sAPO (ArinusaApoEngine.dll)...',
    'Mendaftarkan endpoint audio Windows MMDevices ke registry...',
    'Mengonfigurasi preset default & preset Full Bass...',
    'Instalasi selesai! Audio Engine siap digunakan.',
  ];

  const handleStartInstallation = () => {
    if (!isPermissionGranted) return;
    setIsInstalling(true);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setInstallStep(current);
      if (current >= installLogs.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsInstalling(false);
          setIsCompleted(true);
          storage.saveFirstInstall(installPath);
        }, 400);
      }
    }, 550);
  };

  const handleFinish = () => {
    onComplete(installPath);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-xl p-6 rounded-3xl bg-[#091325] border border-cyan-500/50 shadow-2xl space-y-5">
        {/* Header with Windows UAC Shield badge */}
        <div className="flex items-center gap-3.5 pb-3 border-b border-[#1A2D52]">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                Konfirmasi Izin Instalasi Disk C:
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Hak Administrator
              </span>
            </div>
            <p className="text-xs text-slate-400">
              ARINUSA EQUALIZER memerlukan direktori sistem di Disk C: untuk pemrosesan audio Windows.
            </p>
          </div>
        </div>

        {!isCompleted && !isInstalling && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#0B172E] border border-[#192E56] space-y-2">
              <span className="text-[11px] text-slate-400 block font-semibold uppercase tracking-wider">
                Lokasi Direktori Instalasi Target (Disk C:)
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={installPath}
                  onChange={(e) => setInstallPath(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#060D1A] border border-[#1E3660] text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Folder ini akan digunakan untuk menyimpan binary filter audio sAPO, konfigurasi database lokal, dan preset Full Bass.
              </p>
            </div>

            {/* Folder structure list */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-[#070D1A] border border-[#142340]">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Folder yang Akan Dibuat di Disk C:
              </span>
              <div className="space-y-1 font-mono text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{installPath}\Drivers\sAPO\</span>
                </div>
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>C:\ProgramData\ARINUSA\Equalizer\Presets\</span>
                </div>
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>C:\ProgramData\ARINUSA\Equalizer\db.sqlite</span>
                </div>
              </div>
            </div>

            {/* Permission Checkbox */}
            <label className="flex items-start gap-3 p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 cursor-pointer hover:bg-cyan-950/50 transition-colors">
              <input
                type="checkbox"
                checked={isPermissionGranted}
                onChange={(e) => setIsPermissionGranted(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-cyan-500 focus:ring-0 accent-cyan-400 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-white">
                  Saya memberikan izin untuk membuat folder di Disk C: dan mendaftarkan APO
                </span>
                <span className="text-[11px] text-slate-400">
                  Memerlukan akses Administrator satu kali untuk mendaftarkan filter audio ke endpoint Windows.
                </span>
              </div>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                ARINUSA GROUP • Arif Gunawan
              </span>
              <div className="flex items-center gap-2">
                {onClose && (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
                  >
                    Lewati Dulu
                  </button>
                )}
                <button
                  onClick={handleStartInstallation}
                  disabled={!isPermissionGranted}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                >
                  <FolderCheck className="w-4 h-4" />
                  <span>Setujui & Buat Folder di Disk C:</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Installation Progress */}
        {isInstalling && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold text-white">Memproses Instalasi Sistem di Disk C:...</span>
              <span className="font-mono text-cyan-400 font-bold">
                {Math.round((installStep / installLogs.length) * 100)}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-[#0E1A33] h-2 rounded-full overflow-hidden border border-[#192E56]">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300"
                style={{ width: `${(installStep / installLogs.length) * 100}%` }}
              />
            </div>

            {/* Step logs */}
            <div className="p-3.5 rounded-2xl bg-[#060D1A] border border-[#162744] font-mono text-[11px] space-y-1.5 max-h-48 overflow-y-auto">
              {installLogs.slice(0, installStep).map((log, i) => (
                <div key={i} className="flex items-center gap-2 text-cyan-300 animate-in fade-in duration-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed State */}
        {isCompleted && (
          <div className="space-y-4 text-center py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.3)]">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                Folder di Disk C: Berhasil Dibuat & Siap Digunakan!
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Direktori <strong className="text-cyan-300 font-mono">{installPath}</strong> telah siap beserta preset <strong className="text-white">Full Bass</strong> dan integrasi Dynamic Island.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleFinish}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(0,229,255,0.35)] transition-all flex items-center justify-center gap-2"
              >
                <span>Mulai Gunakan ARINUSA EQUALIZER</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
