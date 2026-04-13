const { contextBridge, ipcRenderer } = require('electron/renderer')
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// Enable remote debugging
console.log('Preload script loaded');

// Example of exposing APIs to the renderer process
// window.addEventListener('DOMContentLoaded', () => {
//   // Your preload code here
// });

// Expose APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  sendVoice: (audio) => ipcRenderer.send('send-voice', audio),
  setTitle: (title) => ipcRenderer.send('set-title', title)
});