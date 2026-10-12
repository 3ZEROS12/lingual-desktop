import { contextBridge, ipcRenderer } from "electron";

// 1. In-Situ Companion & HUD API
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
  reportHeight: (height: number) => {
    ipcRenderer.send("lingual:resize-hud", height);
  },
  toggleMode: () => {
    ipcRenderer.send("lingual:toggle-mode");
  },
  triggerPreSendRewrite: () => {
    ipcRenderer.send("lingual:trigger-rewrite");
  },
  copyText: (text: string) => {
    ipcRenderer.send("lingual:copy-text", text);
  },
  selectTranslation: (slot: number) => {
    ipcRenderer.send("lingual:select", slot);
  },
  undo: () => {
    ipcRenderer.send("lingual:undo");
  },
  dismiss: () => {
    ipcRenderer.send("lingual:dismiss");
  },
  submitSpotlightInput: (text: string) => {
    ipcRenderer.send("lingual:submit-spotlight", text);
  },
  dragMove: (dx: number, dy: number) => {
    ipcRenderer.send("lingual:drag-move", { dx, dy });
  },
  saveCapsulePos: () => {
    ipcRenderer.send("lingual:save-capsule-pos");
  },
  openSettings: () => {
    ipcRenderer.send("lingual:open-settings");
  },
});

// 2. Gabriel-Style Settings Window API
contextBridge.exposeInMainWorld("lingualSettingsAPI", {
  getConfig: () => ipcRenderer.invoke("lingual:get-config"),
  saveConfig: (patch: any) => ipcRenderer.invoke("lingual:save-config", patch),
  onModeChanged: (callback: (data: any) => void) => {
    ipcRenderer.on("lingual:mode-changed", (_event, data) => callback(data));
  },
  testConnection: (params: any) => ipcRenderer.invoke("lingual:test-connection", params),
  aiTuneSlots: (promptText: string) => ipcRenderer.invoke("lingual:ai-tune-slots", promptText),
  detectLocalAI: () => ipcRenderer.invoke("lingual:detect-local-ai"),
  closeWindow: () => ipcRenderer.send("lingual:close-settings"),
  openLogFile: () => ipcRenderer.send("lingual:open-log-file"),
  getRecentLogs: () => ipcRenderer.invoke("lingual:get-recent-logs"),
});
