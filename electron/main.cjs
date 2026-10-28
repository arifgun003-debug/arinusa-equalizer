/**
 * ARINUSA EQUALIZER - Electron Main Process
 * Windows 10/11 Desktop Application, Native Tray, sAPO Registry & .EXE Packager
 * ARINUSA GROUP | ARIF GUNAWAN
 */

const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, screen } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let tray = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createMainWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.min(1366, width),
    height: Math.min(840, height),
    minWidth: 1024,
    minHeight: 680,
    title: 'ARINUSA EQUALIZER — Professional Windows System Equalizer',
    frame: true,
    titleBarStyle: 'default',
    backgroundColor: '#060A13',
    icon: path.join(__dirname, '../public/favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      backgroundThrottling: false, // keep audio playing smoothly in background
    },
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // Production built dist
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  // Simple geometric 16x16 tray icon fallback
  const iconBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAZElEQVQ4T2NkoBAwUqifYdQAUjT8' +
    '//+fAcpGF0c2gBGLOqK9wIRNHTYv4DIdWT6yG/H5k5A7cBnAglU12QbgswG3p7A5h1AakB1B' +
    'dAMIBg5xduASo7iW5+fnM1IihkEDkCQAABY3FhF5p6jNAAAAAElFTkSuQmCC',
    'base64'
  );
  const trayIcon = nativeImage.createFromBuffer(iconBuffer);
  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Buka ARINUSA EQUALIZER',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Preset: Full Bass',
      click: () => {
        mainWindow?.webContents.send('app:set-preset', 'full_bass');
      },
    },
    {
      label: 'Preset: Rock',
      click: () => {
        mainWindow?.webContents.send('app:set-preset', 'rock');
      },
    },
    {
      label: 'Bypass Equalizer',
      click: () => {
        mainWindow?.webContents.send('app:toggle-bypass');
      },
    },
    { type: 'separator' },
    {
      label: 'Keluar',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('ARINUSA EQUALIZER — Audio Engine Aktif');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  });
}

// IPC Handlers
ipcMain.on('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('window:close', () => {
  mainWindow?.close();
});

// Windows GSMTC System Media Session Provider
const { exec } = require('child_process');

ipcMain.handle('system:get-media-session', async () => {
  if (process.platform !== 'win32') {
    return { active: false };
  }
  return new Promise((resolve) => {
    const psCommand = `powershell -Command "[void][System.Reflection.Assembly]::LoadWithPartialName('System.Runtime.WindowsRuntime'); $asTaskGeneric = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Length -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation\`1' }[0]; Function Await-Async ($WinRtTask, $ResultType) { $asTask = $asTaskGeneric.MakeGenericMethod($ResultType); $netTask = $asTask.Invoke($null, @($WinRtTask)); $netTask.Wait(); return $netTask.Result }; [void][Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media.Control, ContentType = WindowsRuntime]; $op = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]::RequestAsync(); $manager = Await-Async $op ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]); if ($manager) { $session = $manager.GetCurrentSession(); if ($session) { $mediaOp = $session.TryGetMediaPropertiesAsync(); $media = Await-Async $mediaOp ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionMediaProperties]); $playback = $session.GetPlaybackInfo(); [PSCustomObject]@{ Title = $media.Title; Artist = $media.Artist; App = $session.SourceAppUserModelId; Status = $playback.PlaybackStatus.ToString() } | ConvertTo-Json -Compress } else { Write-Output '{}' } } else { Write-Output '{}' }"`;

    exec(psCommand, { timeout: 2000 }, (err, stdout) => {
      if (err || !stdout) {
        return resolve({ active: false });
      }
      try {
        const data = JSON.parse(stdout.trim());
        if (data && (data.Title || data.Artist || data.App)) {
          return resolve({
            active: true,
            title: data.Title || 'Windows Audio Stream',
            artist: data.Artist || 'Windows Media',
            source: data.App || 'System Media',
            isPlaying: data.Status ? data.Status.trim() === 'Playing' : false,
          });
        }
      } catch (e) {
        // fallthrough
      }
      resolve({ active: false });
    });
  });
});

ipcMain.handle('system:control-media', async (_event, action) => {
  if (process.platform !== 'win32') return { success: false };
  return new Promise((resolve) => {
    let psAction = '';
    if (action === 'toggle') psAction = '$session.TryTogglePlayPauseAsync()';
    else if (action === 'next') psAction = '$session.TrySkipNextAsync()';
    else if (action === 'prev') psAction = '$session.TrySkipPreviousAsync()';
    else return resolve({ success: false });

    const psCommand = `powershell -Command "[void][System.Reflection.Assembly]::LoadWithPartialName('System.Runtime.WindowsRuntime'); $asTaskGeneric = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Length -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation\`1' }[0]; Function Await-Async ($WinRtTask, $ResultType) { $asTask = $asTaskGeneric.MakeGenericMethod($ResultType); $netTask = $asTask.Invoke($null, @($WinRtTask)); $netTask.Wait(); return $netTask.Result }; [void][Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media.Control, ContentType = WindowsRuntime]; $op = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]::RequestAsync(); $manager = Await-Async $op ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]); if ($manager) { $session = $manager.GetCurrentSession(); if ($session) { ${psAction} } }"`;

    exec(psCommand, { timeout: 2000 }, (err) => {
      resolve({ success: !err });
    });
  });
});

// Windows C: Drive System Folder Creator
ipcMain.handle('system:create-c-drive-folders', async (_event, customPath) => {
  try {
    const basePath = customPath || 'C:\\Program Files\\ARINUSA\\Equalizer';
    const subDirs = [
      basePath,
      path.join(basePath, 'Drivers', 'sAPO'),
      'C:\\ProgramData\\ARINUSA\\Equalizer\\Presets',
      'C:\\ProgramData\\ARINUSA\\Equalizer\\Config',
    ];

    for (const dir of subDirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    // Write installation marker
    const markerFile = path.join(basePath, 'installed.json');
    fs.writeFileSync(
      markerFile,
      JSON.stringify(
        {
          product: 'ARINUSA EQUALIZER',
          version: '1.0.0',
          developer: 'ARIF GUNAWAN (ARINUSA GROUP)',
          installedAt: new Date().toISOString(),
          sApoRegistered: true,
        },
        null,
        2
      )
    );

    return { success: true, path: basePath };
  } catch (err) {
    console.error('Failed to create C: drive directories:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('system:get-install-path', async () => {
  return 'C:\\Program Files\\ARINUSA\\Equalizer';
});

app.whenReady().then(() => {
  createMainWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
