/**
 * ARINUSA EQUALIZER
 * Professional Windows System Equalizer + Dynamic Island Desktop
 * ARINUSA GROUP | ARIF GUNAWAN
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { DynamicIsland } from './components/DynamicIsland';
import { HomeView } from './components/views/HomeView';
import { EqualizerView } from './components/views/EqualizerView';
import { PresetsView } from './components/views/PresetsView';
import { EffectsView } from './components/views/EffectsView';
import { DeviceManagerView } from './components/views/DeviceManagerView';
import { SettingsView } from './components/views/SettingsView';
import { AboutLicenseView } from './components/views/AboutLicenseView';
import { AudioAuditModal } from './components/views/AudioAuditModal';
import { FirstTimeSetupModal } from './components/FirstTimeSetupModal';

import { 
  EqualizerState, 
  Preset, 
  AudioEffectsState, 
  DynamicIslandConfig, 
  AudioDevice, 
  AudioEngineStatus,
  AudioEngineType,
  LicenseStatus 
} from './types/audio';
import { storage, DEFAULT_PRESETS } from './services/storage';
import { audioEngine } from './services/audioEngine';

export default function App() {
  // Navigation & Theme State
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [showFirstInstallModal, setShowFirstInstallModal] = useState<boolean>(() => !storage.hasCompletedFirstInstall());

  // Audio Engine & Hardware State
  const [engineStatus, setEngineStatus] = useState<AudioEngineStatus>('active');
  const [sampleRate, setSampleRate] = useState<number>(48000);
  const [engineType, setEngineType] = useState<AudioEngineType>('webaudio_live');
  const [outputDevices, setOutputDevices] = useState<AudioDevice[]>([
    { deviceId: 'default', label: 'Default Device (Speakers/Headphones)', kind: 'audiooutput', isDefault: true, sampleRate: 48000, channels: 2 }
  ]);
  const [inputDevices, setInputDevices] = useState<AudioDevice[]>([
    { deviceId: 'default', label: 'Default Device (Stereo Mix / Microphone)', kind: 'audioinput', isDefault: true, sampleRate: 48000, channels: 2 }
  ]);
  const [selectedOutputId, setSelectedOutputId] = useState<string>('default');
  const [selectedInputId, setSelectedInputId] = useState<string>('default');
  const [isSystemCaptureActive, setIsSystemCaptureActive] = useState<boolean>(false);
  const [activeSourceLabel, setActiveSourceLabel] = useState<string>('Standby');

  // Media Playback State (Default Idle - No Autoplay Demo)
  const [nowPlaying, setNowPlaying] = useState({
    title: 'Tidak Ada Media Aktif',
    artist: 'Windows Media Session',
    source: 'GSMTC Standby',
    isPlaying: false,
    duration: 0,
    currentTime: 0,
  });

  // Windows Media Session Polling
  useEffect(() => {
    if (window.electronAPI?.getMediaSession) {
      const fetchSession = async () => {
        try {
          const session = await window.electronAPI!.getMediaSession();
          if (session && session.active) {
            setNowPlaying((prev) => ({
              ...prev,
              title: session.title || 'Windows Audio Stream',
              artist: session.artist || 'System Media',
              source: session.source || 'Windows App',
              isPlaying: !!session.isPlaying,
            }));
            setActiveSourceLabel(session.source || 'Windows Media');
          }
        } catch (err) {
          // ignore polling errors
        }
      };

      fetchSession();
      const timer = setInterval(fetchSession, 2500);
      return () => clearInterval(timer);
    }
  }, []);

  // Core Persistent State
  const [eqState, setEqState] = useState<EqualizerState>(() => storage.getEqualizerState());
  const [presets, setPresets] = useState<Preset[]>(() => storage.getPresets());
  const [activePresetId, setActivePresetId] = useState<string>(() => storage.getActivePresetId());
  const [effectsState, setEffectsState] = useState<AudioEffectsState>(() => storage.getEffectsState());
  const [islandConfig, setIslandConfig] = useState<DynamicIslandConfig>(() => storage.getIslandConfig());
  const [masterVolume, setMasterVolume] = useState<number>(() => storage.getMasterVolume());
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>(() => storage.getLicenseStatus());

  // Enumerate Real Audio Devices via browser mediaDevices
  const refreshDevices = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devs = await navigator.mediaDevices.enumerateDevices();
        const outputs: AudioDevice[] = [];
        const inputs: AudioDevice[] = [];

        devs.forEach((d, idx) => {
          if (d.kind === 'audiooutput') {
            outputs.push({
              deviceId: d.deviceId || `out_${idx}`,
              label: d.label || (idx === 0 ? 'Speakers (High Definition Audio Device)' : `Audio Output ${idx + 1}`),
              kind: 'audiooutput',
              isDefault: idx === 0,
              sampleRate: 48000,
              channels: 2,
            });
          } else if (d.kind === 'audioinput') {
            inputs.push({
              deviceId: d.deviceId || `in_${idx}`,
              label: d.label || (idx === 0 ? 'Microphone / System Loopback' : `Audio Input ${idx + 1}`),
              kind: 'audioinput',
              isDefault: idx === 0,
              sampleRate: 48000,
              channels: 2,
            });
          }
        });

        if (outputs.length > 0) setOutputDevices(outputs);
        if (inputs.length > 0) setInputDevices(inputs);
      }
    } catch (err) {
      console.warn('Device enumeration fallback', err);
    }
  }, []);

  // Initialize Audio Engine on first interaction
  useEffect(() => {
    refreshDevices();
    audioEngine.initialize().then((status) => {
      setEngineStatus(status);
      setSampleRate(audioEngine.getSampleRate());
    });

    // Auto-save changes
    storage.saveEqualizerState(eqState);
    audioEngine.setBands(eqState.bands, eqState.isBypassed);
    audioEngine.setPreamp(eqState.preamp, eqState.isBypassed);
  }, [eqState, refreshDevices]);

  useEffect(() => {
    storage.saveEffectsState(effectsState);
    audioEngine.setEffects(effectsState);
  }, [effectsState]);

  useEffect(() => {
    storage.saveMasterVolume(masterVolume);
    audioEngine.setMasterVolume(masterVolume);
  }, [masterVolume]);

  useEffect(() => {
    storage.saveIslandConfig(islandConfig);
  }, [islandConfig]);

  useEffect(() => {
    storage.savePresets(presets);
  }, [presets]);

  useEffect(() => {
    storage.setActivePresetId(activePresetId);
  }, [activePresetId]);

  // Select Preset handler
  const handleSelectPreset = (presetId: string) => {
    const found = presets.find((p) => p.id === presetId);
    if (!found) return;

    setActivePresetId(presetId);
    setEqState((prev) => ({
      ...prev,
      preamp: found.preamp,
      bands: prev.bands.map((band, idx) => ({
        ...band,
        gain: found.bands[idx] ?? band.gain,
      })),
      isBypassed: false,
    }));
  };

  // Toggle System Audio Capture
  const handleToggleSystemCapture = async () => {
    if (isSystemCaptureActive) {
      audioEngine.stopAllAudio();
      setIsSystemCaptureActive(false);
      setNowPlaying((prev) => ({ ...prev, isPlaying: false }));
      setActiveSourceLabel('Audio Nonaktif');
    } else {
      const ok = await audioEngine.captureSystemAudio();
      if (ok) {
        setIsSystemCaptureActive(true);
        setNowPlaying({
          title: 'Windows System Audio Capture',
          artist: 'YouTube, Spotify, Games & Browser',
          source: 'Windows Loopback',
          isPlaying: true,
          duration: 0,
          currentTime: 0,
        });
        setActiveSourceLabel('Windows Loopback');
      }
    }
  };

  // Switch Audio Source (Synthetic Demo / Acoustic Test Tracks)
  const handleSwitchAudioSource = (type: 'demo_rock' | 'demo_synth' | 'demo_bass' | 'system' | 'mic') => {
    if (type === 'system') {
      handleToggleSystemCapture();
      return;
    }

    if (type === 'demo_rock') {
      audioEngine.startSynthDemo('rock');
      setNowPlaying({
        title: 'Penguji Audio Studio (Rock Riff)',
        artist: 'Internal DSP Test Generator',
        source: 'Acoustic Test Audio',
        isPlaying: true,
        duration: 180,
        currentTime: 24,
      });
      setActiveSourceLabel('Test Audio (Rock)');
    } else if (type === 'demo_synth') {
      audioEngine.startSynthDemo('synthwave');
      setNowPlaying({
        title: 'Penguji Audio Studio (Synthwave)',
        artist: 'Internal DSP Test Generator',
        source: 'Acoustic Test Audio',
        isPlaying: true,
        duration: 240,
        currentTime: 30,
      });
      setActiveSourceLabel('Test Audio (Synth)');
    } else if (type === 'demo_bass') {
      audioEngine.startSynthDemo('sweep');
      setNowPlaying({
        title: 'Kalibrasi Frekuensi (20Hz - 20kHz)',
        artist: 'Acoustic Sweep Generator',
        source: 'Calibration Tool',
        isPlaying: true,
        duration: 10,
        currentTime: 1,
      });
      setActiveSourceLabel('Frequency Sweep');
    }
  };

  // Toggle Playback
  const handleTogglePlayback = async () => {
    if (window.electronAPI?.controlMedia) {
      await window.electronAPI.controlMedia('toggle');
      const res = await window.electronAPI.getMediaSession();
      if (res && res.active) {
        setNowPlaying((prev) => ({ ...prev, isPlaying: !!res.isPlaying }));
        return;
      }
    }

    if (nowPlaying.isPlaying) {
      audioEngine.stopAllAudio();
      setNowPlaying((prev) => ({ ...prev, isPlaying: false }));
    } else {
      audioEngine.startSynthDemo('synthwave');
      setNowPlaying((prev) => ({
        ...prev,
        title: 'Penguji Audio Studio (Synthwave)',
        artist: 'Internal DSP Test Generator',
        source: 'Acoustic Test Audio',
        isPlaying: true,
      }));
      setActiveSourceLabel('Test Audio (Synth)');
    }
  };

  const handleNextTrack = async () => {
    if (window.electronAPI?.controlMedia) {
      await window.electronAPI.controlMedia('next');
      return;
    }
    handleSwitchAudioSource('demo_rock');
  };

  const handlePrevTrack = async () => {
    if (window.electronAPI?.controlMedia) {
      await window.electronAPI.controlMedia('prev');
      return;
    }
    handleSwitchAudioSource('demo_synth');
  };

  // Save new preset
  const handleSaveNewPreset = (preset: Preset) => {
    setPresets((prev) => [...prev, preset]);
    handleSelectPreset(preset.id);
  };

  const handleDeletePreset = (presetId: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== presetId));
    if (activePresetId === presetId) {
      handleSelectPreset('flat');
    }
  };

  const handleResetFactoryPresets = () => {
    setPresets(DEFAULT_PRESETS);
    handleSelectPreset('rock');
  };

  const activePreset = presets.find((p) => p.id === activePresetId) || presets[0];
  const activeOutputDevice = outputDevices.find((d) => d.deviceId === selectedOutputId) || outputDevices[0];
  const activeInputDevice = inputDevices.find((d) => d.deviceId === selectedInputId) || inputDevices[0];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#060A13] text-slate-100' : 'bg-slate-100 text-slate-900'} flex flex-col font-sans transition-colors duration-200`}>
      {/* 1. ARINUSA DYNAMIC ISLAND DESKTOP (Floating Widget) */}
      <DynamicIsland
        config={islandConfig}
        onUpdateConfig={(updates) => setIslandConfig((prev) => ({ ...prev, ...updates }))}
        activePreset={activePreset}
        isEqEnabled={!eqState.isBypassed}
        onToggleEq={() => setEqState((prev) => ({ ...prev, isBypassed: !prev.isBypassed }))}
        effects={effectsState}
        onToggleBassBoost={() =>
          setEffectsState((prev) => ({
            ...prev,
            bassEnhancement: {
              ...prev.bassEnhancement,
              enabled: !prev.bassEnhancement.enabled,
            },
          }))
        }
        masterVolume={masterVolume}
        onChangeMasterVolume={setMasterVolume}
        outputDeviceName={activeOutputDevice.label}
        nowPlaying={nowPlaying}
        onTogglePlayback={handleTogglePlayback}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        onOpenEqView={() => setCurrentTab('equalizer')}
        onOpenSettingsView={() => setCurrentTab('settings')}
      />

      {/* 2. Top Window Frame Header */}
      <Header
        engineStatus={engineStatus}
        sampleRate={sampleRate}
        outputDeviceName={activeOutputDevice.label}
        isSystemCaptureActive={isSystemCaptureActive}
        onToggleSystemCapture={handleToggleSystemCapture}
        isDynamicIslandVisible={islandConfig.enabled && islandConfig.mode !== 'hidden'}
        onToggleDynamicIsland={() =>
          setIslandConfig((prev) => ({
            ...prev,
            enabled: !prev.enabled,
            mode: prev.mode === 'hidden' ? 'compact' : prev.mode,
          }))
        }
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenAuditModal={() => setShowAuditModal(true)}
        activeSourceLabel={activeSourceLabel}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 3. Main Workspace: Sidebar + Content Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar (Bisa Dibuka-Tutup & Rapi) */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isActivated={licenseStatus.isActivated}
          registeredUser={licenseStatus.registeredTo}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto px-5 py-5 sm:px-8">
          <div className="max-w-[1440px] mx-auto">
            {currentTab === 'home' && (
              <HomeView
                eqState={eqState}
                onUpdateEqState={setEqState}
                presets={presets}
                activePresetId={activePresetId}
                onSelectPreset={handleSelectPreset}
                effectsState={effectsState}
                onUpdateEffects={setEffectsState}
                masterVolume={masterVolume}
                onChangeMasterVolume={setMasterVolume}
                islandConfig={islandConfig}
                onUpdateIslandConfig={(cfg) => setIslandConfig((p) => ({ ...p, ...cfg }))}
                onNavigateTab={setCurrentTab}
                outputDeviceName={activeOutputDevice.label}
                inputDeviceName={activeInputDevice.label}
                sampleRate={sampleRate}
                engineStatus={engineStatus}
                nowPlaying={nowPlaying}
                onTogglePlayback={handleTogglePlayback}
                onNextTrack={handleNextTrack}
                onPrevTrack={handlePrevTrack}
                onSwitchAudioSource={handleSwitchAudioSource}
                onOpenAuditModal={() => setShowAuditModal(true)}
              />
            )}

            {currentTab === 'equalizer' && (
              <EqualizerView
                eqState={eqState}
                onUpdateEqState={setEqState}
                presets={presets}
                activePresetId={activePresetId}
                onSelectPreset={handleSelectPreset}
                onSaveAsNewPreset={(name) => {
                  const newPreset: Preset = {
                    id: `custom_${Date.now()}`,
                    name,
                    description: 'Preset kustom buatan studio equalizer.',
                    isCustom: true,
                    preamp: eqState.preamp,
                    bands: eqState.bands.map((b) => b.gain),
                  };
                  handleSaveNewPreset(newPreset);
                }}
              />
            )}

            {currentTab === 'presets' && (
              <PresetsView
                presets={presets}
                activePresetId={activePresetId}
                onSelectPreset={handleSelectPreset}
                onSaveNewPreset={handleSaveNewPreset}
                onDeletePreset={handleDeletePreset}
                onResetFactoryPresets={handleResetFactoryPresets}
                currentEqState={eqState}
              />
            )}

            {currentTab === 'effects' && (
              <EffectsView
                effects={effectsState}
                onUpdateEffects={setEffectsState}
              />
            )}

            {currentTab === 'devices' && (
              <DeviceManagerView
                outputDevices={outputDevices}
                inputDevices={inputDevices}
                selectedOutputId={selectedOutputId}
                onSelectOutputDevice={setSelectedOutputId}
                selectedInputId={selectedInputId}
                onSelectInputDevice={setSelectedInputId}
                onRefreshDevices={refreshDevices}
                engineType={engineType}
                onSelectEngineType={setEngineType}
                sampleRate={sampleRate}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                islandConfig={islandConfig}
                onUpdateIslandConfig={(cfg) => setIslandConfig((p) => ({ ...p, ...cfg }))}
                isDarkMode={isDarkMode}
                onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              />
            )}

            {currentTab === 'about' && (
              <AboutLicenseView
                licenseStatus={licenseStatus}
                onRefreshLicense={() => setLicenseStatus(storage.getLicenseStatus())}
              />
            )}
          </div>
        </main>
      </div>

      {/* 4. Bottom Brand & Technical Footer Strip */}
      <footer className="h-10 bg-[#050912] border-t border-[#14223A] px-5 flex items-center justify-between text-[11px] text-slate-400 select-none">
        <div className="flex items-center gap-4">
          <span className="font-bold text-white tracking-wide">ARINUSA GROUP</span>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="hidden md:inline">Satu Visi. Banyak Peluang. Tumbuh Bersama.</span>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-slate-400">
          <span>Windows 10/11</span>
          <span>•</span>
          <span>Equalizer Sistem</span>
          <span>•</span>
          <span>Dynamic Island Desktop</span>
          <span>•</span>
          <span>DSP Audio Engine</span>
          <span>•</span>
          <span>Penyimpanan Lokal</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-cyan-400 font-semibold">ARINUSA EQUALIZER v1.0.0</span>
          <span>•</span>
          <span>Developed by <strong className="text-slate-200">ARIF GUNAWAN</strong></span>
        </div>
      </footer>

      {/* 5. Technical Audit & Validation Modal */}
      <AudioAuditModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        engineStatus={engineStatus}
        sampleRate={sampleRate}
      />

      {/* 6. First-Time Disk C: Installation & Permission Modal */}
      <FirstTimeSetupModal
        isOpen={showFirstInstallModal}
        onComplete={(path) => {
          setShowFirstInstallModal(false);
          handleSelectPreset('full_bass');
        }}
        onClose={() => setShowFirstInstallModal(false)}
      />
    </div>
  );
}
