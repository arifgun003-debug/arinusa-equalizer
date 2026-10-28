/**
 * ARINUSA EQUALIZER - Presets Management Studio
 * Complete preset library with import/export JSON, custom presets, and factory reset
 * ARINUSA GROUP | ARIF GUNAWAN
 */

import React, { useState, useRef } from 'react';
import { 
  Bookmark, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Disc,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { Preset, EqualizerState } from '../../types/audio';
import { downloadFile } from '../../services/windowsApoBridge';

interface PresetsViewProps {
  presets: Preset[];
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
  onSaveNewPreset: (preset: Preset) => void;
  onDeletePreset: (presetId: string) => void;
  onResetFactoryPresets: () => void;
  currentEqState: EqualizerState;
}

export const PresetsView: React.FC<PresetsViewProps> = ({
  presets,
  activePresetId,
  onSelectPreset,
  onSaveNewPreset,
  onDeletePreset,
  onResetFactoryPresets,
  currentEqState
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const newPreset: Preset = {
      id: `custom_${Date.now()}`,
      name: newPresetName.trim(),
      description: newPresetDesc.trim() || 'Preset kustom pengguna.',
      isCustom: true,
      preamp: currentEqState.preamp,
      bands: currentEqState.bands.map((b) => b.gain),
    };

    onSaveNewPreset(newPreset);
    setNewPresetName('');
    setNewPresetDesc('');
    setShowCreateModal(false);
  };

  const handleExportJson = () => {
    const data = JSON.stringify(presets, null, 2);
    downloadFile(`arinusa_equalizer_presets_${new Date().toISOString().slice(0, 10)}.json`, data, 'application/json');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          parsed.forEach((p) => {
            if (p.name && Array.isArray(p.bands) && p.bands.length === 10) {
              onSaveNewPreset({
                ...p,
                id: `imported_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                isCustom: true,
              });
            }
          });
          setImportStatus('Preset berhasil diimpor!');
          setTimeout(() => setImportStatus(null), 3000);
        }
      } catch (err) {
        console.error('Import failed', err);
        setImportStatus('Format file JSON tidak valid.');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#091224] border border-[#192C50]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600/20 text-cyan-400 border border-blue-500/30">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Koleksi Preset Suara</h1>
            <p className="text-xs text-slate-400">
              Kelola profil equalizer suara bawaan studio dan buat konfigurasi kustom Anda sendiri.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Create New Preset */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_12px_rgba(0,229,255,0.25)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Preset Baru</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E1A33] hover:bg-[#152549] text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-colors"
            title="Ekspor semua preset ke file JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor JSON</span>
          </button>

          {/* Import JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJson}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E1A33] hover:bg-[#152549] text-slate-300 hover:text-white border border-[#1A2E54] text-xs font-semibold transition-colors"
            title="Impor preset dari file JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Impor JSON</span>
          </button>

          {/* Factory Reset */}
          <button
            onClick={onResetFactoryPresets}
            className="p-2 rounded-xl bg-[#0E1A33] hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-[#1A2E54] transition-colors"
            title="Kembalikan preset bawaan pabrik"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Import notification toast */}
      {importStatus && (
        <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 text-xs font-semibold">
          {importStatus}
        </div>
      )}

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((preset) => {
          const isSelected = activePresetId === preset.id;
          return (
            <div
              key={preset.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'bg-gradient-to-b from-[#0E1D3B] to-[#0A1428] border-cyan-400/80 shadow-[0_0_20px_rgba(0,229,255,0.18)]'
                  : 'bg-[#091224] border-[#182C50] hover:border-slate-500'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 shadow-md'
                          : 'bg-[#142342] text-slate-300'
                      }`}
                    >
                      {preset.name.charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white truncate">{preset.name}</span>
                        {preset.isCustom && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase font-semibold">
                            Kustom
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 line-clamp-1">{preset.description}</span>
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  )}
                </div>

                {/* Mini Visualizer representation of 10 bands */}
                <div className="h-14 bg-[#050B16] rounded-xl p-2 flex items-center justify-between gap-1 border border-[#14223E]">
                  {preset.bands.map((gain, i) => {
                    const normHeight = Math.max(4, Math.min(36, 18 + gain * 1.5));
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                        <div
                          className={`w-full rounded-sm transition-all ${
                            isSelected
                              ? 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]'
                              : 'bg-slate-600'
                          }`}
                          style={{ height: `${normHeight}px` }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-[#162747]">
                <div className="text-[11px] font-mono text-slate-400">
                  Preamp: <strong className="text-cyan-400">{preset.preamp >= 0 ? `+${preset.preamp}` : preset.preamp} dB</strong>
                </div>

                <div className="flex items-center gap-1.5">
                  {preset.isCustom && (
                    <button
                      onClick={() => onDeletePreset(preset.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Hapus Preset Kustom"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => onSelectPreset(preset.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-[#122240] hover:bg-[#1A305A] text-slate-300 hover:text-white'
                    }`}
                  >
                    {isSelected ? 'Sedang Digunakan' : 'Gunakan'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Preset Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0B152B] border border-cyan-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Buat Preset Kustom Baru</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Pengaturan 10-Band Equalizer dan Preamp saat ini akan disimpan sebagai profil preset baru.
            </p>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Nama Preset</label>
                <input
                  type="text"
                  placeholder="Contoh: EDM Club Boost"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl bg-[#060D1A] border border-[#1F3660] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Deskripsi Singkat (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Fokus pada sub-bass dan cymbals tajam"
                  value={newPresetDesc}
                  onChange={(e) => setNewPresetDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#060D1A] border border-[#1F3660] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
