/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    saveDocx: (data: {
      buffer: ArrayBuffer
      defaultFileName: string
    }) => Promise<{ success: boolean; filePath?: string; error?: string }>
  }
}
