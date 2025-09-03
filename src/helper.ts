import { ChatMessageProps } from "./types";
import fs from "fs/promises";
import { lookup } from "mime-types";

export async function converMessages(messages: ChatMessageProps[]) {
  const converMessages = [];
  for (const message of messages) {
    let convertedContent: string | any[];
    if (message.imagePath) {
      // 图片的转换先变成Buffer
      const imageBuffer = await fs.readFile(message.imagePath);
      // 在变成base64
      const base64Image = imageBuffer.toString("base64");
      // 拿到图片后缀名的格式 like：image/png
      const mimeType = lookup(message.imagePath);
      convertedContent = [
        {
          type: "text",
          text: message.content || "",
        },
        {
          type: "image_url",
          image_url: { url: `data:${mimeType};base64,${base64Image}` },
        },
      ];
    } else {
      convertedContent = message.content;
    }
    const { imagePath, ...messageWithoutImagePath } = message;
    converMessages.push({
      ...messageWithoutImagePath,
      content: convertedContent,
    });
  }
  return converMessages;
}
