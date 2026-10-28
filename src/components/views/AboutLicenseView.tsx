/**
 * ARINUSA EQUALIZER - About & Commercial Licensing View
 * Product identity, Commercial license activation, Windows Installer & APO Distribution package
 * ARINUSA GROUP | ARIF GUNAWAN
 */

import React, { useState } from 'react';
import { 
  Info, 
  ShieldCheck, 
  Key, 
  Download, 
  FileCode, 
  Terminal, 
  CheckCircle2, 
  Package, 
  Copy, 
  Check,
  ExternalLink,
  Award,
  Layers
} from 'lucide-react';
import { LicenseStatus } from '../../types/audio';
import { LicensingService } from '../../services/licensing';
import { 
  WINDOWS_APO_REGISTRY_BAT, 
  CPP_APO_FILTER_SOURCE, 
  ELECTRON_BUILDER_CONFIG, 
  BUILD_WINDOWS_EXE_BAT,
  downloadFile 
} from '../../services/windowsApoBridge';

interface AboutLicenseViewProps {
  licenseStatus: LicenseStatus;
  onRefreshLicense: () => void;
}

export const AboutLicenseView: React.FC<AboutLicenseViewProps> = ({
  licenseStatus,
  onRefreshLicense
}) => {
  const [inputKey, setInputKey] = useState('');
  const [activationMsg, setActivationMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;

    const success = LicensingService.activateLicense(inputKey);
    if (success) {
      setActivationMsg({ text: 'Lisensi komersial berhasil diaktivasi secara offline!', success: true });
      onRefreshLicense();
      setInputKey('');
    } else {
      setActivationMsg({
        text: 'Kunci lisensi tidak valid. Format: ARN-PRO-2026-XXXX-XXXX',
        success: false,
      });
    }
  };

  const handleGenerateKey = () => {
    const demoKey = LicensingService.generateDemoLicenseKey();
    setInputKey(demoKey);
  };

  const handleCopyKey = () => {
    if (licenseStatus.licenseKey) {
      navigator.clipboard.writeText(licenseStatus.licenseKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Product Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0C1730] via-[#0E1E42] to-[#0A1326] border border-[#1F3A6C] shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-800 flex items-center justify-center text-white shadow-[0_0_25px_rgba(0,229,255,0.4)]">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 22h4.5l2.2-4.5h6.6L17.5 22H22L12 2zm0 6.5l2.4 4.9H9.6L12 8.5z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-wide">ARINUSA EQUALIZER</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  PRO v1.0.0
                </span>
              </div>
              <p className="text-xs text-cyan-400 font-semibold mt-0.5">
                Professional Windows System Equalizer + Dynamic Island Desktop
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Dikembangkan oleh <strong className="text-slate-200">ARIF GUNAWAN</strong> • Brand: <strong className="text-slate-200">ARINUSA GROUP</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Lisensi Komersial Aktif</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 font-mono">Target: Windows 10/11 x64</span>
          </div>
        </div>
      </div>

      {/* Grid: Licensing Status (Left) + Windows APO Installer Distribution (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: License Card (6 Cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#091224] border border-[#192C50] space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#162747]">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">Informasi Lisensi</h2>
            </div>
            <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
              {licenseStatus.tier}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#0B152B] border border-[#182C50]">
              <div>
                <span className="text-slate-400 block text-[11px]">Terdaftar Atas Nama</span>
                <span className="text-white font-bold text-sm">{licenseStatus.registeredTo}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Organisasi / Brand</span>
                <span className="text-white font-bold text-sm">{licenseStatus.organization}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Masa Berlaku</span>
                <span className="text-cyan-400 font-semibold">{licenseStatus.expiryDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Status Validasi</span>
                <span className="text-emerald-400 font-semibold">Offline Kriptografis</span>
              </div>
            </div>

            {/* License Key Display */}
            <div className="p-3 rounded-xl bg-[#060D1A] border border-[#1E345C] space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Kunci Lisensi Terpasang
              </span>
              <div className="flex items-center justify-between font-mono text-cyan-300 font-bold text-xs">
                <span>{licenseStatus.licenseKey || 'ARN-PRO-2026-WIN11-COMMERCIAL'}</span>
                <button
                  onClick={handleCopyKey}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Salin Kunci"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Features list */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Hak Penggunaan & Fitur Komersial:
              </span>
              <div className="space-y-1">
                {licenseStatus.featuresUnlocked.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-300 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Offline Key Input */}
            <form onSubmit={handleActivate} className="pt-2 border-t border-[#162747] space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-semibold text-slate-300">
                  Aktivasi Kunci Lisensi Baru
                </label>
                <button
                  type="button"
                  onClick={handleGenerateKey}
                  className="text-[10px] text-cyan-400 hover:underline"
                >
                  Generate Contoh Kunci
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ARN-PRO-2026-XXXX-XXXX"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#060D1A] border border-[#1E345C] text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  Aktivasi
                </button>
              </div>
              {activationMsg && (
                <div
                  className={`text-[11px] p-2 rounded-lg font-semibold ${
                    activationMsg.success
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {activationMsg.text}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Windows Installer & APO Distribution Bundle (6 Cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#091224] border border-[#192C50] space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#162747]">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">
                Paket Installer Windows .EXE & Driver APO
              </h2>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold">Siap Distribusi</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Paket berkas sumber dan skrip otomatis untuk membangun installer mandiri Windows x64 (`ARINUSA-Equalizer-Setup.exe`) dan mendaftarkan filter Audio Processing Object ke registry Windows 10/11:
          </p>

          <div className="space-y-2.5">
            {/* Download 1: Windows APO Registry Installer */}
            <div className="p-3 rounded-xl bg-[#0B152B] border border-[#182C50] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">arinusa_apo_install.bat</span>
                  <span className="text-[10px] text-slate-400 truncate">
                    Skrip registrasi COM DLL sAPO ke endpoint Windows MMDevices
                  </span>
                </div>
              </div>
              <button
                onClick={() => downloadFile('arinusa_apo_install.bat', WINDOWS_APO_REGISTRY_BAT, 'text/plain')}
                className="px-3 py-1.5 rounded-lg bg-[#122240] hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 text-xs font-semibold border border-cyan-500/30 transition-all flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh</span>
              </button>
            </div>

            {/* Download 2: C++ Native APO Filter Source */}
            <div className="p-3 rounded-xl bg-[#0B152B] border border-[#182C50] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">ArinusaApoEngine.cpp</span>
                  <span className="text-[10px] text-slate-400 truncate">
                    Source code C++ native IAudioProcessingObjectRT 10-band filter
                  </span>
                </div>
              </div>
              <button
                onClick={() => downloadFile('ArinusaApoEngine.cpp', CPP_APO_FILTER_SOURCE, 'text/x-c++src')}
                className="px-3 py-1.5 rounded-lg bg-[#122240] hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 text-xs font-semibold border border-cyan-500/30 transition-all flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh</span>
              </button>
            </div>

            {/* Download 3: Electron Builder Config */}
            <div className="p-3 rounded-xl bg-[#0B152B] border border-[#182C50] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Package className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">electron-builder.yml</span>
                  <span className="text-[10px] text-slate-400 truncate">
                    Konfigurasi packaging NSIS installer .EXE dan uninstaller
                  </span>
                </div>
              </div>
              <button
                onClick={() => downloadFile('electron-builder.yml', ELECTRON_BUILDER_CONFIG, 'text/yaml')}
                className="px-3 py-1.5 rounded-lg bg-[#122240] hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 text-xs font-semibold border border-cyan-500/30 transition-all flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh</span>
              </button>
            </div>

            {/* Download 4: Windows .EXE 1-Click Builder Batch Script */}
            <div className="p-3 rounded-xl bg-[#0B152B] border border-cyan-500/40 flex items-center justify-between gap-3 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
              <div className="flex items-center gap-2.5 min-w-0">
                <Terminal className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">build_windows_exe.bat</span>
                  <span className="text-[10px] text-amber-300 font-semibold truncate">
                    Skrip otomatis membuat ARINUSA-Equalizer-Setup-1.0.0.exe
                  </span>
                </div>
              </div>
              <button
                onClick={() => downloadFile('build_windows_exe.bat', BUILD_WINDOWS_EXE_BAT, 'application/x-bat')}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Script EXE</span>
              </button>
            </div>
          </div>

          {/* Terminal Build Command */}
          <div className="p-3 rounded-xl bg-[#060D1A] border border-[#182C50] space-y-1.5">
            <span className="text-[11px] font-bold text-slate-300 block">
              Perintah Terminal untuk Membangun File .EXE:
            </span>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#040810] border border-[#142340] font-mono text-xs text-cyan-300">
              <code>npm run build:exe</code>
              <span className="text-[10px] text-slate-500">Output: dist_electron\*.exe</span>
            </div>
          </div>

          {/* Clean Uninstall Guide */}
          <div className="p-3 rounded-xl bg-[#070D1A] border border-[#182A4A] space-y-1">
            <span className="text-[11px] font-bold text-slate-300 block">
              Prosedur Pencopotan (Clean Uninstall):
            </span>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Uninstaller otomatis menghapus key registry di `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\MMDevices`, membatalkan registrasi COM DLL (`regsvr32 /u`), dan mengembalikan format asli endpoint audio Windows tanpa residu sistem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
