/**
 * ARINUSA EQUALIZER - Electron Preload Script
 * Secure IPC Bridge between Electron Main Process and React Renderer
 * ARINUSA GROUP | ARIF GUNAWAN
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,

  // Window Controls
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),

  // C: Drive Filesystem Setup
  createCDriveDirectories: (targetPath) => ipcRenderer.invoke('system:create-c-drive-folders', targetPath),
  getInstallDirectory: () => ipcRenderer.invoke('system:get-install-path'),
  registerWindowsApo: () => ipcRenderer.invoke('system:register-sapo'),

  // Windows Global System Media Transport Controls (GSMTC)
  getMediaSession: () => ipcRenderer.invoke('system:get-media-session'),
  controlMedia: (action) => ipcRenderer.invoke('system:control-media', action),

  // Dynamic Island Window Sync
  syncIslandState: (data) => ipcRenderer.send('island:sync-state', data),
  onIslandMessage: (callback) => {
    ipcRenderer.on('island:message', (_event, data) => callback(data));
  },

  // Audio Notifications
  sendNotification: (title, body) => ipcRenderer.send('app:notify', { title, body }),
});
