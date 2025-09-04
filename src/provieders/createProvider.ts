import { BaseProvider } from "./BaseProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { QianfanProvieder } from "./QianfanProvieder";

// 这是一个工厂函数

export function createProvider(providerName: string): BaseProvider {
  switch (providerName) {
    case "qianfan":
      return new QianfanProvieder(
        process.env["QIANFAN_ACCESS_KEY"],
        process.env["QIANFAN_SECRET_KEY"],
      );
    case "dashscope":
      return new OpenAIProvider(
        process.env["DASH_SCOPE_API_KEY"],
        "https://dashscope.aliyuncs.com/compatible-mode/v1",
      );
    default:
      throw new Error(`Invalid provider name:${providerName}`);
  }
}
