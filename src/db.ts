import Dexie, { type EntityTable } from "dexie";
import { ProviderProps, ConversationProps, MessageProps } from "./types";
import { providers } from "./testdata";

export const db = new Dexie("aiChatDatabase") as Dexie & {
  //provider是表的名称
  provider: EntityTable<ProviderProps, "id">;
  //conversation
  conversation: EntityTable<ConversationProps, "id">;
  //message
  message: EntityTable<MessageProps, "id">;
};

db.version(1).stores({
  provider: "++id, name",
  conversation: "++id,providerId",
  message: "++id,conversationId",
});

// 初始要添加满供应商的信息 把他加入数据库
export const initProviders = async () => {
  const count = await db.provider.count();
  if (count === 0) {
    await db.provider.bulkAdd(providers);
  }
};
