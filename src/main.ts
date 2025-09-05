import { app, BrowserWindow, ipcMain, protocol, Menu } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { CreateChatProps } from "./types";

import { createProvider } from "./provieders/createProvider";
//能直接从环境变量读取的库
import "dotenv/config";

// 把图片转化成base64
import fs from "fs/promises";

import { lookup } from "mime-types";
import { ConfigManager } from "./ConfigManager";
import { createAppMenu } from "./menu";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = async () => {
  const configManager = ConfigManager.getInstance();
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  
  // 创建菜单，传入 mainWindow 参数
  createAppMenu(mainWindow);
  
  protocol.handle("safe-file", async (request) => {
    // 提取纯文件路径（去掉协议头）
    let filepath = decodeURIComponent(request.url.slice("safe-file://".length));
    // 兼容 Windows: safe-file:///C:/... 在解析后会多一个前导斜杠，需要去掉
    if (/^\/[A-Za-z]:\//.test(filepath)) {
      filepath = filepath.slice(1);
    }

    console.log("filepath", filepath);
    // 读取文件
    const data = await fs.readFile(filepath);
    const contentType =
      (lookup(filepath) as string) || "application/octet-stream";
    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
      },
    });
  });
  
  ipcMain.on("start-chat", async (event, data: CreateChatProps) => {
    const { messages, providerName, selectedModel, messageId } = data;

    try {
      const ChatModel = createProvider(providerName);
      const response = await ChatModel.chat(messages, selectedModel);
      for await (const chunk of response) {
        mainWindow.webContents.send("update-message", {
          messageId,
          data: chunk,
        });
      }
    } catch (error: any) {
      console.error("start-chat error", error);
      mainWindow.webContents.send("update-message", {
        messageId,
        data: {
          is_end: true,
          result:
            (error && (error.message || (typeof error === "string" ? error : ""))) ||
            "API 调用失败",
          is_error: true,
        },
      });
    }
  });
  // 图片的转换先变成Buffer
  // const imageBuffer = await fs.readFile(
  //   "C:/Users/Lenovo/Desktop/屏幕截图 2025-06-13 143022.png",
  // );
  // 在变成base64
  // const base64Image = imageBuffer.toString("base64");
  ipcMain.handle(
    "handle-image-file",
    async (event, imageFilename, content: ArrayBuffer) => {
      const userDatapath = app.getPath("userData");
      console.log("jjjjj", userDatapath);

      const imagesDir = path.join(userDatapath, "images");

      await fs.mkdir(imagesDir, { recursive: true });

      // 拷贝到的位置
      const imagePath = path.join(imagesDir, imageFilename);
      // 拷贝
      try {
        const buffer = Buffer.from(content);
        // 写入目标文件
        await fs.writeFile(imagePath, buffer);

        console.log(`文件已成功拷贝到：${imagePath}`);
        return imagePath; // 可以返回拷贝后的路径，供渲染进程使用
      } catch (error) {
        console.error("文件拷贝失败：", error);
        throw error; // 抛出错误，让渲染进程捕获
      }
    },
  );

  ipcMain.handle("get-config", async () => {
    return await configManager.getConfig();
  });
  ipcMain.handle("update-config", async (event, partial) => {
    return await configManager.updateConfig(partial ?? {});
  });

  ipcMain.handle("get-provider-config", async (event, providerName: string) => {
    return await configManager.getProviderConfig(providerName);
  });
  ipcMain.handle(
    "update-provider-config",
    async (event, providerName: string, values: Record<string, any>) => {
      return await configManager.updateProviderConfig(providerName, values ?? {});
    },
  );
  
  // 右键菜单处理
  ipcMain.on("show-context-menu", (event, conversationId, ) => {
    const template = [
      {
        label: "删除对话",
        click: () => {
          mainWindow.webContents.send("context-menu-action", "delete", conversationId);
        },
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    menu.popup({
      window: mainWindow,
      
    });
  });
  
  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    await mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
  // const response = await openai.chat.completions.create({
  //   model: "qwen-vl-plus", // 此处以qwen-vl-max为例，可按需更换模型名称。模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
  //   messages: [
  //     {
  //       role: "user",
  //       content: [
  //         {
  //           type: "image_url",
  //           image_url: { url: `data:image/png;base64,${base64Image}` },
  //         },
  //         { type: "text", text: "这是什么图片？" },
  //       ],
  //     },
  //   ],
  // });
  // console.log(JSON.stringify(response));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
