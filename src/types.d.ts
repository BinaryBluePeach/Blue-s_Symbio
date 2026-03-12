declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const OVERLAY_WINDOW_WEBPACK_ENTRY: string;
declare const OVERLAY_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

declare module "*.png" {
  const src: string;
  export default src;
}
declare module "*.jpg" {
  const src: string;
  export default src;
}
declare module "*.svg" {
  const src: string;
  export default src;
}

interface ElectronAPI {
  openOverlay: () => void;
  closeOverlay: () => void;
  openOverlayFrame: () => void;
  closeOverlayFrame: () => void;
  sendPrompt: (prompt: string) => void;
  setPrompt: (prompt: string) => void;
  setHotMic: (isActive: boolean) => void;
  getScreenshot: () => void;
  generateText: (prompt: string) => void;
  onPromptSent: (callback: (prompt: string) => void) => () => void;
  onHotMicToggled: (callback: (isActive: boolean) => void) => () => void;
  onScreenshot: (
    callback: (data: {
      image: string;
      height: number;
      width: number;
      prompt: string;
    }) => void,
  ) => () => void;
  onGeneratedText: (callback: (text: string) => void) => () => void;
  onError: (callback: (error: string) => void) => () => void;
}

interface Window {
  electronAPI: ElectronAPI;
}
