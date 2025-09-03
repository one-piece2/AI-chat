import { defineStore } from "pinia";
import { ConversationProps } from "../types";
import { ref } from "vue";
import { db } from "../db";
export interface ConversationStore {
  items: ConversationProps[];
}
export const useConversationStore = defineStore("conversation", () => {
  const items = ref<ConversationProps[]>([]);
  const slectedId = ref<number>(-1);
  const getConversations = async () => {
    items.value = await db.conversation.toArray();
  };
  const createConversation = async (
    Createdata: Omit<ConversationProps, "id">,
  ) => {
    const newID = await db.conversation.add(Createdata);
    // items.value.push({
    //   id: newID,
    //   ...Createdata,
    // });
    await getConversations();
    return newID;
  };

  const getConversationbyId = (id: number): ConversationProps => {
    return items.value.find((item) => item.id === id);
  };

  return {
    items,
    getConversations,
    createConversation,
    getConversationbyId,
    slectedId,
  };
});
