import { BaseProvider } from "./BaseProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { QianfanProvieder } from "./QianfanProvieder";

// 这是一个工厂函数

export function createProvider(providerName: string): BaseProvider {
  switch (providerName) {
    case "qianfan": {
      const accessKey = process.env["QIANFAN_ACCESS_KEY"];
      const secretKey = process.env["QIANFAN_SECRET_KEY"];
      if (!accessKey || !secretKey) {
        throw new Error(
          "Missing Qianfan credentials: please set QIANFAN_ACCESS_KEY and QIANFAN_SECRET_KEY in your environment (.env)",
        );
      }
      return new QianfanProvieder(accessKey, secretKey);
    }
    case "dashscope": {
      // 注意：环境变量名为 DASHSCOPE_API_KEY（无下划线）
      const apiKey = process.env["DASHSCOPE_API_KEY"];
      if (!apiKey) {
        throw new Error(
          "Missing DashScope API key: please set DASHSCOPE_API_KEY in your environment (.env)",
        );
      }
      return new OpenAIProvider(
        apiKey,
        "https://dashscope.aliyuncs.com/compatible-mode/v1",
      );
    }
    default:
      throw new Error(`Invalid provider name:${providerName}`);
  }
}
