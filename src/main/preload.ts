import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("lingualAPI", {
  onTranslationData: (callback: (data: any) => void) => {
    ipcRenderer.on("lingual:data", (_event, data) => callback(data));
  },
  onSpotlightOpen: (callback: () => void) => {
    ipcRenderer.on("lingual:spotlight-open", () => callback());
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
