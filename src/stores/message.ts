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
  const updataMessage = async (
    messageId: number,
    data: Partial<MessageProps>,
  ) => {
    await db.message.update(messageId, data);
    // 先找到回复的 filterMessage的Id 在更新items
    const replyMessageId = items.value.findIndex(
      (item) => item.id === messageId,
    );
    if (replyMessageId !== -1) {
      items.value[replyMessageId] = {
        ...items.value[replyMessageId],
        ...data,
      };
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
