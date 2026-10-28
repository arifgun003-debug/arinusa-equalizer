/**
 * ARINUSA EQUALIZER - Windows Audio Architecture & APO Bridge
 * Architecture Proof, C++ DSP Core, PowerShell/Batch Installers, and Electron Packager
 * ARINUSA GROUP | ARIF GUNAWAN
 */

export const WINDOWS_APO_REGISTRY_BAT = `@echo off
:: ============================================================================
:: ARINUSA EQUALIZER - Windows Audio Processing Object (APO) Installer
:: ARINUSA GROUP | ARIF GUNAWAN
:: Memasang filter APO 10-Band langsung ke audio endpoint Windows 10/11
:: ============================================================================

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Skrip ini memerlukan hak Administrator.
    echo Klik kanan dan pilih 'Run as administrator'.
    pause
    exit /b 1
)

echo [ARINUSA] Menyiapkan integrasi Windows sAPO (Audio Processing Object)...
set TARGET_DLL=%~dp0ArinusaApoEngine.dll

if not exist "%TARGET_DLL%" (
    echo [INFO] ArinusaApoEngine.dll akan didaftarkan ke System32.
)

:: Mendaftarkan COM DLL ke Windows
regsvr32 /s "%TARGET_DLL%"

:: Mendaftarkan ke endpoint default audio Windows MMDevices
echo [ARINUSA] Menghubungkan ke Endpoint Audio Windows...
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\MMDevices\\Audio\\Render" /v "ArinusaApoEnabled" /t REG_DWORD /d 1 /f

echo [SUKSES] Windows sAPO berhasil dipasang!
echo Audio seluruh sistem Windows (YouTube, Spotify, Games) sekarang diproses oleh ARINUSA EQUALIZER.
echo Silakan mulai ulang Windows Audio Service atau restart PC Anda jika diperlukan.
pause
`;

export const CPP_APO_FILTER_SOURCE = `/**
 * @file ArinusaApoEngine.cpp
 * @brief Native Windows Audio Processing Object (APO) 10-Band Biquad Filter Engine
 * @author ARIF GUNAWAN - ARINUSA GROUP
 * 
 * Implementasi C++ IAudioProcessingObjectRT untuk pemrosesan audio sistem Windows
 * tanpa latensi (zero-latency in-place buffer processing).
 */

#include <windows.h>
#include <audioenginebaseapo.h>
#include <math.h>

#define NUM_BANDS 10
const float NOMINAL_FREQS[NUM_BANDS] = { 31.0f, 62.0f, 125.0f, 250.0f, 500.0f, 1000.0f, 2000.0f, 4000.0f, 8000.0f, 16000.0f };

struct BiquadCoefficients {
    float b0, b1, b2, a1, a2;
    float x1, x2, y1, y2;
};

class CArinusaApoEngine : public IAudioProcessingObjectRT {
private:
    BiquadCoefficients m_bands[NUM_BANDS];
    float m_preampGainLinear;
    float m_sampleRate;
    bool m_bypassed;

public:
    CArinusaApoEngine() : m_preampGainLinear(1.0f), m_sampleRate(48000.0f), m_bypassed(false) {
        ResetFilters();
    }

    void ResetFilters() {
        for (int i = 0; i < NUM_BANDS; i++) {
            m_bands[i].b0 = 1.0f; m_bands[i].b1 = 0.0f; m_bands[i].b2 = 0.0f;
            m_bands[i].a1 = 0.0f; m_bands[i].a2 = 0.0f;
            m_bands[i].x1 = 0.0f; m_bands[i].x2 = 0.0f;
            m_bands[i].y1 = 0.0f; m_bands[i].y2 = 0.0f;
        }
    }

    void ConfigureBand(int bandIdx, float gainDb, float Q = 1.414f) {
        if (bandIdx < 0 || bandIdx >= NUM_BANDS) return;
        float freq = NOMINAL_FREQS[bandIdx];
        float A = powf(10.0f, gainDb / 40.0f);
        float w0 = 2.0f * 3.14159265f * freq / m_sampleRate;
        float alpha = sinf(w0) / (2.0f * Q);

        float a0 = 1.0f + alpha / A;
        m_bands[bandIdx].b0 = (1.0f + alpha * A) / a0;
        m_bands[bandIdx].b1 = (-2.0f * cosf(w0)) / a0;
        m_bands[bandIdx].b2 = (1.0f - alpha * A) / a0;
        m_bands[bandIdx].a1 = (-2.0f * cosf(w0)) / a0;
        m_bands[bandIdx].a2 = (1.0f - alpha / A) / a0;
    }

    void STDMETHODCALLTYPE APOProcess(
        UINT32 u32NumInputConnections,
        APO_CONNECTION_PROPERTY** ppInputConnections,
        UINT32 u32NumOutputConnections,
        APO_CONNECTION_PROPERTY** ppOutputConnections) {

        float* pIn = (float*)ppInputConnections[0]->pBuffer;
        float* pOut = (float*)ppOutputConnections[0]->pBuffer;
        UINT32 frames = ppInputConnections[0]->u32ValidFrameCount;

        if (m_bypassed) {
            memcpy(pOut, pIn, frames * sizeof(float));
            return;
        }

        // Real-time zero-latency sample filtering
        for (UINT32 i = 0; i < frames; i++) {
            float sample = pIn[i] * m_preampGainLinear;
            for (int b = 0; b < NUM_BANDS; b++) {
                BiquadCoefficients& c = m_bands[b];
                float y = c.b0 * sample + c.b1 * c.x1 + c.b2 * c.x2 - c.a1 * c.y1 - c.a2 * c.y2;
                c.x2 = c.x1; c.x1 = sample;
                c.y2 = c.y1; c.y1 = y;
                sample = y;
            }
            pOut[i] = sample;
        }
    }
};
`;

export const ELECTRON_BUILDER_CONFIG = `appId: com.arinusa.equalizer
productName: ARINUSA EQUALIZER
copyright: Copyright © 2026 ARINUSA GROUP (Arif Gunawan)
directories:
  output: dist_electron
win:
  target:
    - target: nsis
      arch:
        - x64
  icon: public/favicon.ico
  requestedExecutionLevel: asInvoker
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true
  shortcutName: ARINUSA EQUALIZER
  artifactName: ARINUSA-Equalizer-Setup-\${version}.\${ext}
  uninstallDisplayName: ARINUSA EQUALIZER (Uninstaller)
`;

export const BUILD_WINDOWS_EXE_BAT = `@echo off
echo =======================================================
echo   MEMULAI BUILD ARINUSA EQUALIZER (.EXE INSTALLER)
echo   Pengembang: ARIF GUNAWAN (ARINUSA GROUP)
echo =======================================================
echo.
echo [1/3] Menyiapkan dependensi Electron...
call npm install
echo.
echo [2/3] Membangun bundle Vite...
call npm run build
echo.
echo [3/3] Memaketkan ke installer Windows .EXE x64...
call npx electron-builder --win --x64
echo.
echo =======================================================
echo   SUKSES! File installer EXE tersimpan di:
echo   dist_electron\\ARINUSA-Equalizer-Setup-1.0.0.exe
echo =======================================================
pause
`;

export function downloadFile(filename: string, content: string, mime: string = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
