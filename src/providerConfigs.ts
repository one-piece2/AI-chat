export type FieldType = "text" | "password" | "number" | "select" | "textarea";

export interface ProviderConfigItem {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  help?: string;
  options?: { label: string; value: string | number }[];
  defaultValue?: any;
}

// 百度千帆
const qianfanConfig: ProviderConfigItem[] = [
  {
    key: "accessKey",
    label: "Access Key",
    type: "text",
    placeholder: "请输入 Access Key",
    required: true,
  },
  {
    key: "secretKey",
    label: "Secret Key",
    type: "password",
    placeholder: "请输入 Secret Key",
    required: true,
  },
  {
    key: "baseUrl",
    label: "BaseUrl",
    type: "text",
    placeholder: "https://aip.baidubce.com",
    defaultValue: "",
  },
];

// 阿里灵积（通义千问）
const dashscopeConfig: ProviderConfigItem[] = [
  {
    key: "apiKey",
    label: "API Key",
    type: "password",
    placeholder: "请输入 API Key",
    required: true,
  },
  {
    key: "baseUrl",
    label: "BaseUrl",
    type: "text",
    placeholder: "https://dashscope.aliyuncs.com",
  },
];

// DeepSeek
const deepseekConfig: ProviderConfigItem[] = [
  {
    key: "apiKey",
    label: "API Key",
    type: "password",
    placeholder: "请输入 API Key",
    required: true,
  },
  {
    key: "baseUrl",
    label: "BaseUrl",
    type: "text",
    placeholder: "https://api.deepseek.com",
  },
];

export type ProviderConfigMap = Record<string, ProviderConfigItem[]>;

export const providerConfigs: ProviderConfigMap = {
  qianfan: qianfanConfig,
  dashscope: dashscopeConfig,
  deepseek: deepseekConfig,
}; 