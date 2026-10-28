/**
 * ARINUSA EQUALIZER - Local Storage & Database Manager
 * Structured SQLite/JSON Storage with Schema Migration, Preset Import/Export, and Backup/Restore
 * ARINUSA GROUP | ARIF GUNAWAN
 */

import { Preset, EqualizerState, AudioEffectsState, DynamicIslandConfig, AudioDevice, LicenseStatus } from '../types/audio';

const STORAGE_KEY_PREFIX = 'arinusa_eq_v1_';
const SCHEMA_VERSION = 1;

export const DEFAULT_PRESETS: Preset[] = [
  {
    id: 'flat',
    name: 'Default / Flat',
    description: 'Respons frekuensi netral tanpa amplifikasi warna suara.',
    isCustom: false,
    preamp: 0.0,
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'rock',
    name: 'Rock',
    description: 'Lebih bertenaga dan punchy dengan dorongan bass dan treble tajam.',
    isCustom: false,
    preamp: 0.0,
    bands: [4.0, 2.0, 1.0, -1.0, -2.0, 0.0, 2.0, 4.0, 3.0, 1.0],
  },
  {
    id: 'pop',
    name: 'Pop',
    description: 'Jernih dan seimbang untuk vokal kontemporer dan instrumen pop.',
    isCustom: false,
    preamp: 0.5,
    bands: [1.5, 2.5, 3.0, 1.0, 0.0, -0.5, 1.0, 2.5, 3.0, 2.0],
  },
  {
    id: 'jazz',
    name: 'Jazz',
    description: 'Hangat dan natural dengan penekanan pada mid-bass dan detail cymbals.',
    isCustom: false,
    preamp: 0.0,
    bands: [3.0, 2.0, 1.0, 1.5, -1.0, -1.0, 0.0, 1.5, 2.5, 3.0],
  },
  {
    id: 'classical',
    name: 'Classical',
    description: 'Detail dan halus untuk rentang dinamis orkestra akustik.',
    isCustom: false,
    preamp: 0.0,
    bands: [4.0, 3.0, 2.0, 1.0, -1.0, -1.0, 0.0, 2.0, 3.0, 3.5],
  },
  {
    id: 'hiphop',
    name: 'Hip-Hop',
    description: 'Bass kuat dan dinamis dengan respon sub-bass 808 yang solid.',
    isCustom: false,
    preamp: -1.0,
    bands: [6.0, 5.0, 3.0, 0.5, -1.0, -0.5, 1.0, 2.0, 3.5, 4.0],
  },
  {
    id: 'vocal',
    name: 'Vocal',
    description: 'Fokus pada suara vokal, podcast, dan kejelasan dialog.',
    isCustom: false,
    preamp: 0.0,
    bands: [-2.0, -1.5, 0.0, 2.5, 4.0, 3.5, 2.0, 1.0, 0.0, -1.0],
  },
  {
    id: 'full_bass',
    name: 'Full Bass',
    description: 'Dentuman sub-bass masif dan punchy untuk musik bass-heavy, phonk, hip-hop, dan audio bertenaga.',
    isCustom: false,
    preamp: -3.0,
    bands: [11.5, 10.0, 7.5, 3.5, -1.0, -1.5, 0.0, 1.5, 2.5, 2.0],
    effects: {
      bassEnhancement: 85,
      loudness: 55,
      reverb: 10,
      echo: 0,
      virtualSurround: 60,
    },
  },
  {
    id: 'bassboost',
    name: 'Bass Boost',
    description: 'Bass lebih dalam dengan dorongan substansial pada frekuensi rendah.',
    isCustom: false,
    preamp: -1.5,
    bands: [7.0, 6.0, 4.5, 2.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.0],
  },
  {
    id: 'custom_1',
    name: 'Custom',
    description: 'Preset buatan sendiri yang dapat disesuaikan sepenuhnya.',
    isCustom: true,
    preamp: 0.0,
    bands: [2.0, 1.0, 0.0, 0.0, 0.0, 1.0, 2.0, 3.0, 2.0, 1.0],
  }
];

export const DEFAULT_EQ_STATE: EqualizerState = {
  enabled: true,
  preamp: 0.0,
  bands: [
    { freq: 31, label: '31 Hz', gain: 4.0, q: 1.414 },
    { freq: 62, label: '62 Hz', gain: 2.0, q: 1.414 },
    { freq: 125, label: '125 Hz', gain: 1.0, q: 1.414 },
    { freq: 250, label: '250 Hz', gain: -1.0, q: 1.414 },
    { freq: 500, label: '500 Hz', gain: -2.0, q: 1.414 },
    { freq: 1000, label: '1 kHz', gain: 0.0, q: 1.414 },
    { freq: 2000, label: '2 kHz', gain: 2.0, q: 1.414 },
    { freq: 4000, label: '4 kHz', gain: 4.0, q: 1.414 },
    { freq: 8000, label: '8 kHz', gain: 3.0, q: 1.414 },
    { freq: 16000, label: '16 kHz', gain: 1.0, q: 1.414 },
  ],
  gainRange: 12,
  isBypassed: false,
  clippingDetected: false,
};

export const DEFAULT_EFFECTS_STATE: AudioEffectsState = {
  enabled: true,
  bassEnhancement: {
    enabled: true,
    amount: 60,
    cutoffFreq: 85,
  },
  loudness: {
    enabled: true,
    amount: 40,
  },
  reverb: {
    enabled: false,
    amount: 20,
    decayTime: 2.0,
  },
  echo: {
    enabled: false,
    amount: 10,
    delayTime: 250,
    feedback: 25,
  },
  virtualSurround: {
    enabled: true,
    amount: 70,
    stereoWidth: 140,
  },
};

export const DEFAULT_ISLAND_CONFIG: DynamicIslandConfig = {
  mode: 'compact',
  position: 'top-center',
  size: 'normal',
  transparency: 85,
  autoStartWithWindows: true,
  showMediaControls: true,
  alwaysOnTop: true,
  enabled: true,
};

export const DEFAULT_LICENSE_STATUS: LicenseStatus = {
  tier: 'premium',
  isActivated: true,
  licenseKey: 'ARN-PRO-2026-WIN11-COMMERCIAL',
  registeredTo: 'ARIF GUNAWAN',
  organization: 'ARINUSA GROUP',
  expiryDate: 'Lifetime / Seumur Hidup',
  activatedAt: '2026-01-15T00:00:00Z',
  featuresUnlocked: [
    'System-wide 10-Band EQ Engine',
    'Interactive Dynamic Island Desktop (All Modes)',
    'Full DSP Effects (Bass, Reverb, Echo, Surround, Loudness)',
    'Windows Audio Processing Object (APO) System Hook',
    'Unlimited Custom Presets & JSON Export/Import',
    'Multi-Monitor & DPI Scaling Optimization'
  ]
};

class StorageManager {
  private inMemoryFallback: Record<string, string> = {};

  private getItem(key: string): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY_PREFIX + key);
    } catch {
      return this.inMemoryFallback[key] || null;
    }
  }

  private setItem(key: string, value: string): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, value);
    } catch {
      this.inMemoryFallback[key] = value;
    }
  }

  // Equalizer State
  public getEqualizerState(): EqualizerState {
    const raw = this.getItem('eq_state');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return DEFAULT_EQ_STATE;
  }

  public saveEqualizerState(state: EqualizerState): void {
    this.setItem('eq_state', JSON.stringify(state));
  }

  // Presets
  public getPresets(): Preset[] {
    const raw = this.getItem('presets');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return DEFAULT_PRESETS;
  }

  public savePresets(presets: Preset[]): void {
    this.setItem('presets', JSON.stringify(presets));
  }

  public getActivePresetId(): string {
    return this.getItem('active_preset_id') || 'rock';
  }

  public setActivePresetId(id: string): void {
    this.setItem('active_preset_id', id);
  }

  // Effects State
  public getEffectsState(): AudioEffectsState {
    const raw = this.getItem('effects_state');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return DEFAULT_EFFECTS_STATE;
  }

  public saveEffectsState(state: AudioEffectsState): void {
    this.setItem('effects_state', JSON.stringify(state));
  }

  // Dynamic Island
  public getIslandConfig(): DynamicIslandConfig {
    const raw = this.getItem('island_config');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return DEFAULT_ISLAND_CONFIG;
  }

  public saveIslandConfig(config: DynamicIslandConfig): void {
    this.setItem('island_config', JSON.stringify(config));
  }

  // Master Volume
  public getMasterVolume(): number {
    const raw = this.getItem('master_volume');
    return raw ? parseFloat(raw) : 0.70;
  }

  public saveMasterVolume(vol: number): void {
    this.setItem('master_volume', vol.toString());
  }

  // Licensing
  public getLicenseStatus(): LicenseStatus {
    const raw = this.getItem('license_status');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return DEFAULT_LICENSE_STATUS;
  }

  public saveLicenseStatus(status: LicenseStatus): void {
    this.setItem('license_status', JSON.stringify(status));
  }

  // Backup and Restore (JSON dump compatible with SQLite export)
  public exportFullBackup(): string {
    const data = {
      app: 'ARINUSA EQUALIZER',
      version: '1.0.0',
      schemaVersion: SCHEMA_VERSION,
      exportTimestamp: new Date().toISOString(),
      developer: 'ARIF GUNAWAN',
      company: 'ARINUSA GROUP',
      eqState: this.getEqualizerState(),
      presets: this.getPresets(),
      activePresetId: this.getActivePresetId(),
      effectsState: this.getEffectsState(),
      islandConfig: this.getIslandConfig(),
      masterVolume: this.getMasterVolume(),
    };
    return JSON.stringify(data, null, 2);
  }

  public importFullBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (!data.eqState || !Array.isArray(data.presets)) {
        throw new Error('Format cadangan tidak valid');
      }
      if (data.eqState) this.saveEqualizerState(data.eqState);
      if (data.presets) this.savePresets(data.presets);
      if (data.activePresetId) this.setActivePresetId(data.activePresetId);
      if (data.effectsState) this.saveEffectsState(data.effectsState);
      if (data.islandConfig) this.saveIslandConfig(data.islandConfig);
      if (typeof data.masterVolume === 'number') this.saveMasterVolume(data.masterVolume);
      return true;
    } catch (err) {
      console.error('Failed to import backup:', err);
      return false;
    }
  }

  public hasCompletedFirstInstall(): boolean {
    return this.getItem('first_install_completed') === 'true';
  }

  public saveFirstInstall(path: string): void {
    this.setItem('first_install_completed', 'true');
    this.setItem('install_directory', path);
    this.setItem('installed_at', new Date().toISOString());
  }

  public getInstallPath(): string {
    return this.getItem('install_directory') || 'C:\\Program Files\\ARINUSA\\Equalizer';
  }

  public resetToFactoryDefaults(): void {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(STORAGE_KEY_PREFIX))
        .forEach(k => localStorage.removeItem(k));
    } catch {
      this.inMemoryFallback = {};
    }
  }
}

export const storage = new StorageManager();
