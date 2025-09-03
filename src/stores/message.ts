import { defineStore } from "pinia";
import { db } from "../db";
import {
  MessageProps,
  ChatMessageProps,
  UpdatgedStreamData,
  MessageStatus,
} from "../types";
import { ref } from "vue";

export const useMessageStore = defineStore("message", () => {
  const items = ref<MessageProps[]>([]);
  const getMessagesByConversationId = async (conversationId: number) => {
    items.value = await db.message.where({ conversationId }).toArray();
  };
  const createInitialMessage = async (
    createdMessage: Omit<MessageProps, "id">,
  ) => {
    const newMessageId = await db.message.add(createdMessage);
    await getMessagesByConversationId(createdMessage.conversationId);
    return newMessageId;
  };

  const getLastQuestion = (conversationId: number) => {
    // 修复：使用 slice().reverse().find() 替代 findLast()
    return items.value
      .slice()
      .reverse()
      .find(
        (item) =>
          item.conversationId === conversationId && item.type === "question",
      );
  };
  const updataMessage = async (datas: UpdatgedStreamData) => {
    // 先更新进数据库，在更新给filtermessage
    const { messageId, data } = datas;
    const currentMessage = items.value.find((item) => item.id === messageId);
    if (currentMessage) {
      const UpdatedMessage = {
        status: data.is_end ? "finished" : ("streaming" as MessageStatus),
        content: currentMessage.content + data.result,
        updatedAt: new Date().toISOString(),
      };
      await db.message.update(messageId, UpdatedMessage);
      // 先找到回复的 filterMessage的Id
      const replyMessageId = items.value.findIndex(
        (item) => item.id === messageId,
      );
      if (replyMessageId !== -1) {
        items.value[replyMessageId] = {
          ...items.value[replyMessageId],
          ...UpdatedMessage,
        };
      }
    }
  };
  const isMessageLoading = () => {
    return items.value.some(
      (item) => item.status === "loading" || item.status === "streaming",
    );
  };
  return {
    items,
    getMessagesByConversationId,
    createInitialMessage,
    getLastQuestion,
    updataMessage,
    isMessageLoading,
  };
});
