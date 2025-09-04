import { ipcRenderer, contextBridge } from "electron";
import { CreateChatProps } from "./types";
import { UpdateCallback } from "./types";
contextBridge.exposeInMainWorld("API", {
  //渲染->主
  startChat: (data: CreateChatProps) => ipcRenderer.send("start-chat", data),
  OnupdateMessage: (callback: UpdateCallback) =>
    ipcRenderer.on("update-message", (event, data) => {
      callback(data);
    }),
  handleImageFie: (ImageFilename: string, ImageFilcontent: ArrayBuffer) =>
    ipcRenderer.invoke("handle-image-file", ImageFilename, ImageFilcontent),
});

contextBridge.exposeInMainWorld("electronAPI", {
  getConfig: () => ipcRenderer.invoke("get-config"),
  updateConfig: (config: Partial<{ language: "zh" | "en"; fontSize: number }>) =>
    ipcRenderer.invoke("update-config", config),
  getProviderConfig: (providerName: string) =>
    ipcRenderer.invoke("get-provider-config", providerName),
  updateProviderConfig: (providerName: string, values: Record<string, any>) =>
    ipcRenderer.invoke("update-provider-config", providerName, values),
});
