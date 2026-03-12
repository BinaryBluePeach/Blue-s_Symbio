import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  openOverlay: () => ipcRenderer.send("open-overlay"),
  closeOverlay: () => ipcRenderer.send("close-overlay"),
  openOverlayFrame: () => ipcRenderer.send("open-overlay-frame"),
  closeOverlayFrame: () => ipcRenderer.send("close-overlay-frame"),

  sendPrompt: (prompt: string) => ipcRenderer.send("send-prompt", prompt),
  setPrompt: (prompt: string) => ipcRenderer.send("set-prompt", prompt),
  setHotMic: (isActive: boolean) => ipcRenderer.send("set-hotmic", isActive),

  getScreenshot: () => ipcRenderer.send("get-screenshot"),
  generateText: (prompt: string) => ipcRenderer.send("generate-text", prompt),

  onPromptSent: (callback: (prompt: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, prompt: string) =>
      callback(prompt);
    ipcRenderer.on("prompt-sent", handler);
    return () => ipcRenderer.removeListener("prompt-sent", handler);
  },

  onHotMicToggled: (callback: (isActive: boolean) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, isActive: boolean) =>
      callback(isActive);
    ipcRenderer.on("hotmic-toggled", handler);
    return () => ipcRenderer.removeListener("hotmic-toggled", handler);
  },

  onScreenshot: (
    callback: (data: {
      image: string;
      height: number;
      width: number;
      prompt: string;
    }) => void,
  ) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      data: { image: string; height: number; width: number; prompt: string },
    ) => callback(data);
    ipcRenderer.on("screenshot", handler);
    return () => ipcRenderer.removeListener("screenshot", handler);
  },

  onGeneratedText: (callback: (text: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, text: string) =>
      callback(text);
    ipcRenderer.on("generated-text", handler);
    return () => ipcRenderer.removeListener("generated-text", handler);
  },

  onError: (callback: (error: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, error: string) =>
      callback(error);
    ipcRenderer.on("error", handler);
    return () => ipcRenderer.removeListener("error", handler);
  },
});
