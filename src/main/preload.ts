import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("lingualAPI", {
  onTranslationData: (callback: (data: any) => void) => {
    ipcRenderer.on("lingual:data", (_event, data) => callback(data));
  },
  onModeChanged: (callback: (mode: string) => void) => {
    ipcRenderer.on("lingual:mode-changed", (_event, mode) => callback(mode));
  },
  onViewState: (callback: (state: "capsule" | "hud" | "spotlight") => void) => {
    ipcRenderer.on("lingual:view-state", (_event, state) => callback(state));
  },
  toggleMode: () => {
    ipcRenderer.send("lingual:toggle-mode");
  },
  selectTranslation: (slot: 1 | 2) => {
    ipcRenderer.send("lingual:select", slot);
  },
  dismiss: () => {
    ipcRenderer.send("lingual:dismiss");
  },
  submitSpotlightInput: (text: string) => {
    ipcRenderer.send("lingual:submit-spotlight", text);
  },
});
