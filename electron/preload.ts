import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  saveDocx: (data: { buffer: ArrayBuffer; defaultFileName: string }) => {
    return ipcRenderer.invoke('save-docx', {
      buffer: Array.from(new Uint8Array(data.buffer)),
      defaultFileName: data.defaultFileName,
    })
  },
})
