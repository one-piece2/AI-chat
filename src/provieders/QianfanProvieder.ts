import { BaseProvider } from "./BaseProvider";
import { ChatCompletion } from "@baiducloud/qianfan";
import { ChatMessage } from "@baiducloud/qianfan/dist/src/interface";
import { ChatMessageProps, UniversalChunkProps } from "../types";
import OpenAI from "openai";

export class QianfanProvieder extends BaseProvider {
  private client: any;
  constructor(accessKey: string, secretKey: string) {
    super();
    this.client = new ChatCompletion({
      QIANFAN_ACCESS_KEY: accessKey,
      QIANFAN_SECRET_KEY: secretKey,
    } as any);
  }
  async chat(messages: ChatMessageProps[], modelName: string) {
    const stream = await this.client.chat(
      {
        messages: messages,
        // 流式输出
        stream: true,
      },
      modelName,
    );
    const slef = this;
    // stream是一个异步迭代对象，我们做的是，把处理这个异步迭代对象的数据格式，然后在返回一个新的异步迭代对象。
    return {
      async *[Symbol.asyncIterator]() {
        for await (const chunk of stream) {
          yield slef.transformResponse(chunk);
        }
      },
    };
  }
  protected transformResponse(chunk: UniversalChunkProps): UniversalChunkProps {
    return {
      is_end: chunk.is_end,
      result: chunk.result,
    };
  }
}
