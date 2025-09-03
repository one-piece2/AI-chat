// 扩展window全局接口

import { CreateChatProps, UpdateCallback } from "./src/types";

export interface ElectronAPI {
  startChat: (data: CreateChatProps) => void;
  OnupdateMessage: (callback: UpdateCallback) => any;
  handleImageFie: (
    ImageFilename: string,
    ImageFilcontent: ArrayBuffer,
  ) => Promise<string>;
}
declare global {
  interface Window {
    API: ElectronAPI;
  }
}
