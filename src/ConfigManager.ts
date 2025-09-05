import { app } from "electron";
import path from "node:path";
import fs from "fs/promises";
import { AppConfig, FullConfigFile, ProviderConfigValues } from "./types";

export class ConfigManager {
  private static instance: ConfigManager | null = null;
  private readonly configFilePath: string;
  // 缓存完整配置（包含 providers）
  private cachedConfig: FullConfigFile | null = null;

  private readonly defaultConfig: FullConfigFile = {
    language: "zh",
    fontSize: 14,
    providers: {},
  };

  private constructor() {
    const userDataPath = app.getPath("userData");
    // 配置文件路径
    this.configFilePath = path.join(userDataPath, "config.json");
  }

  // 获取实例的方法
  public static getInstance(): ConfigManager {
    if (!this.instance) {
      this.instance = new ConfigManager();
    }
    return this.instance;
  }

  // 读取基础配置（language、fontSize）
  public async getConfig(): Promise<AppConfig> {
    const raw = await this.readFull();
    const merged = this.applyDefaults(raw);
    return merged;
  }
  // 更新基础配置
  public async updateConfig(partial: Partial<AppConfig>): Promise<AppConfig> {
    const raw = await this.readFull();
    //基础配置
    const current = this.applyDefaults(raw);
    //更新后的基础配置
    const next: AppConfig = this.applyDefaults({ ...current, ...partial });
    const toWrite: FullConfigFile = {
      ...raw,
      ...next,
      providers: raw.providers || {},
    };
    await this.writeFull(toWrite);
    this.cachedConfig = toWrite;
    return next;
  }

  // Provider 配置读取
  public async getProviderConfig(
    providerName: string,
  ): Promise<ProviderConfigValues> {
    const raw = await this.readFull();
    return (raw.providers || {})[providerName] || {};
  }

  // Provider 配置写入（局部合并）
  public async updateProviderConfig(
    providerName: string,
    values: ProviderConfigValues,
  ): Promise<ProviderConfigValues> {
    //全部配置
    const raw = await this.readFull();
    //现在的ProviderConfigValues
    const current = (raw.providers || {})[providerName] || {};
    //更新后的ProviderConfigValues
    const next = { ...current, ...values };
    // 兼容旧文件：无 providers 时补上
    const providers = { ...(raw.providers || {}), [providerName]: next };
    const toWrite: FullConfigFile = { ...raw, providers };
    await this.writeFull(toWrite);
    this.cachedConfig = toWrite;
    return next;
  }

  // 读写完整文件
  private async readFull(): Promise<FullConfigFile> {
    if (this.cachedConfig) return this.cachedConfig;
    try {
      const content = await fs.readFile(this.configFilePath, "utf-8");
      const parsed = JSON.parse(content);
      // 兼容旧文件：无 providers 时补上
      const file: FullConfigFile = {
        language: parsed?.language ?? this.defaultConfig.language,
        fontSize: Number(parsed?.fontSize) || this.defaultConfig.fontSize,
        providers: parsed?.providers ?? {},
      };
      this.cachedConfig = file;
      return file;
    } catch {
      await this.writeFull(this.defaultConfig);
      this.cachedConfig = this.defaultConfig;
      return this.defaultConfig;
    }
  }

  private async writeFull(raw: FullConfigFile): Promise<void> {
    //获取文件目录
    const dir = path.dirname(this.configFilePath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      this.configFilePath,
      JSON.stringify(raw, null, 2),
      "utf-8",
    );
  }

  private applyDefaults(input: Partial<FullConfigFile>): AppConfig {
    const language = input?.language === "en" ? "en" : "zh";
    let fontSize = Number(input?.fontSize);
    if (!Number.isFinite(fontSize) || fontSize <= 0) {
      fontSize = this.defaultConfig.fontSize;
    }
    return { language, fontSize };
  }
}
