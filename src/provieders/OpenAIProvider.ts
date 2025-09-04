import OpenAI from "openai";
import { BaseProvider } from "./BaseProvider";
import { ChatMessageProps, UniversalChunkProps } from "../types";
import { converMessages } from "../helper";

export class OpenAIProvider extends BaseProvider {
  private client: OpenAI;
  constructor(apiKey: string, baseURL: string) {
    super();
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL,
    });
  }
  async chat(messages: ChatMessageProps[], modelName: string) {
    const convermessage = await converMessages(messages);
    const stream = await this.client.chat.completions.create({
      model: modelName,
      stream: true,
      messages: convermessage,
    });
    const slef = this;
    return {
      async *[Symbol.asyncIterator]() {
        for await (const chunk of stream) {
          yield slef.transformResponse(chunk);
        }
      },
    };
  }

  protected transformResponse(
    chunk: OpenAI.Chat.Completions.ChatCompletionChunk,
  ): UniversalChunkProps {
    const choice = chunk.choices[0];
    return {
      is_end: choice.finish_reason === "stop",
      result: choice.delta.content || "",
    };
  }
}
