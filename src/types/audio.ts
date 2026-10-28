/**
 * ARINUSA EQUALIZER - Type Definitions
 * Professional Windows System Equalizer + Dynamic Island Desktop
 * ARINUSA GROUP | ARIF GUNAWAN
 */

export type EqBandFrequency = 31 | 62 | 125 | 250 | 500 | 1000 | 2000 | 4000 | 8000 | 16000;

export interface EqBandConfig {
  freq: EqBandFrequency;
  label: string;
  gain: number; // in dB: -12 to +12 (or up to +18)
  q: number; // default 1.414
}

export interface EqualizerState {
  enabled: boolean;
  preamp: number; // in dB: -12 to +12
  bands: EqBandConfig[];
  gainRange: 12 | 18; // dB range
  isBypassed: boolean;
  clippingDetected: boolean;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  isCustom: boolean;
  preamp: number;
  bands: number[]; // 10 values corresponding to the 10 bands
  effects?: {
    bassEnhancement: number;
    loudness: number;
    reverb: number;
    echo: number;
    virtualSurround: number;
  };
}

export interface AudioEffectsState {
  enabled: boolean;
  bassEnhancement: {
    enabled: boolean;
    amount: number; // 0 - 100 %
    cutoffFreq: number; // Hz (typically 60-120)
  };
  loudness: {
    enabled: boolean;
    amount: number; // 0 - 100 %
  };
  reverb: {
    enabled: boolean;
    amount: number; // 0 - 100 %
    decayTime: number; // seconds (0.5 - 4.0)
  };
  echo: {
    enabled: boolean;
    amount: number; // 0 - 100 %
    delayTime: number; // ms (50 - 800)
    feedback: number; // 0 - 90 %
  };
  virtualSurround: {
    enabled: boolean;
    amount: number; // 0 - 100 %
    stereoWidth: number; // 0 - 200 %
  };
}

export type DynamicIslandMode = 'compact' | 'expanded' | 'mini' | 'hidden';
export type IslandPosition = 'top-center' | 'top-right' | 'bottom-right' | 'floating';

export interface DynamicIslandConfig {
  mode: DynamicIslandMode;
  position: IslandPosition;
  size: 'compact' | 'normal' | 'large';
  transparency: number; // 0 - 100 % (e.g. 85%)
  autoStartWithWindows: boolean;
  showMediaControls: boolean;
  alwaysOnTop: boolean;
  enabled: boolean;
}

export type AudioEngineStatus = 
  | 'active'
  | 'inactive'
  | 'device_unavailable'
  | 'init_error'
  | 'unsupported';

export type AudioEngineType = 
  | 'webaudio_live'
  | 'system_loopback'
  | 'windows_apo'
  | 'virtual_cable';

export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: 'audiooutput' | 'audioinput';
  isDefault: boolean;
  sampleRate: number;
  channels: number;
}

export interface MediaTrack {
  id: string;
  title: string;
  artist: string;
  source: string; // e.g. "YouTube", "Spotify", "Local Audio", "System Loopback"
  duration: number; // seconds
  currentTime: number;
  isPlaying: boolean;
  thumbnailUrl?: string;
}

export interface LicenseStatus {
  tier: 'free' | 'premium';
  isActivated: boolean;
  licenseKey?: string;
  registeredTo: string;
  organization: string;
  expiryDate?: string;
  activatedAt?: string;
  featuresUnlocked: string[];
}

export interface SystemAuditReport {
  timestamp: string;
  audioProcessingObjectSupported: boolean;
  wasapiLoopbackAvailable: boolean;
  nativeDspModuleLoaded: boolean;
  activeSampleRate: number;
  latencyMs: number;
  bufferSize: number;
  systemArchitecture: 'Windows 10/11 x64' | 'Web Platform Engine';
  status: 'VERIFIED' | 'WARNING' | 'CONFIG_REQUIRED';
}

declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      platform: string;
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
      createCDriveDirectories: (targetPath?: string) => Promise<{ success: boolean; path?: string; error?: string }>;
      getInstallDirectory: () => Promise<string>;
      registerWindowsApo: () => Promise<any>;
      getMediaSession: () => Promise<{ active: boolean; title?: string; artist?: string; source?: string; isPlaying?: boolean }>;
      controlMedia: (action: 'toggle' | 'next' | 'prev') => Promise<{ success: boolean }>;
      syncIslandState: (data: any) => void;
      onIslandMessage: (callback: (data: any) => void) => void;
      sendNotification: (title: string, body: string) => void;
    };
  }
}

