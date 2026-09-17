const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('lens', {
  onUpdate: (cb) => ipcRenderer.on('update', (_e, p) => cb(p)),
  resize: (h) => ipcRenderer.send('resize', h),
  copy: (t) => ipcRenderer.send('copy', t),
  hide: () => ipcRenderer.send('hide'),
});
