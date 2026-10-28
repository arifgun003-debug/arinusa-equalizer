@echo off
:: ============================================================================
:: ARINUSA EQUALIZER - Windows .EXE Installer Builder Script
:: ARINUSA GROUP | ARIF GUNAWAN
:: Membangun aplikasi menjadi installer Windows .EXE mandiri (NSIS & Portable)
:: ============================================================================

echo =======================================================
echo   MEMULAI BUILD ARINUSA EQUALIZER (.EXE INSTALLER)
echo   Pengembang: ARIF GUNAWAN (ARINUSA GROUP)
echo =======================================================
echo.

echo [1/3] Menyiapkan dependensi Electron & React...
call npm install
if %errorLevel% neq 0 (
    echo [ERROR] Gagal menginstal dependensi.
    pause
    exit /b 1
)

echo.
echo [2/3] Membangun bundle frontend React Vite...
call npm run build
if %errorLevel% neq 0 (
    echo [ERROR] Build Vite gagal.
    pause
    exit /b 1
)

echo.
echo [3/3] Memaketkan aplikasi ke installer Windows .EXE x64...
call npx electron-builder --win --x64
if %errorLevel% neq 0 (
    echo [ERROR] Gagal memaketkan Electron EXE.
    pause
    exit /b 1
)

echo.
echo =======================================================
echo   SUKSES! File installer EXE berhasil dibuat:
echo   Lokasi: dist_electron\ARINUSA-Equalizer-Setup-1.0.0.exe
echo =======================================================
pause
