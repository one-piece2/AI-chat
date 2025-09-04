// 扩展window全局接口

import { CreateChatProps, UpdateCallback, AppConfig } from "./src/types";

export interface ElectronAPI {
  startChat: (data: CreateChatProps) => void;
  OnupdateMessage: (callback: UpdateCallback) => any;
  handleImageFie: (
    ImageFilename: string,
    ImageFilcontent: ArrayBuffer,
  ) => Promise<string>;
}

export interface ElectronConfigAPI {
  getConfig: () => Promise<AppConfig>;
  updateConfig: (config: Partial<AppConfig>) => Promise<AppConfig>;
  getProviderConfig: (providerName: string) => Promise<Record<string, any>>;
  updateProviderConfig: (
    providerName: string,
    values: Record<string, any>,
  ) => Promise<Record<string, any>>;
}

declare global {
  interface Window {
    API: ElectronAPI;
    electronAPI: ElectronConfigAPI;
  }
}
