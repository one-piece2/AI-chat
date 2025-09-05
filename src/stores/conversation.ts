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

  // 删除对话及其相关消息
  const deleteConversation = async (conversationId: number) => {
    try {
      // 使用事务确保数据一致性
      //在数据库操作中，transaction（事务）是一组作为单一逻辑单元执行的数据库操作集合，它确保这组操作要么全部成功执行，要么全部失败回滚，从而保证数据的一致性和完整性。
      //[db.conversation, db.message] 声明了事务涉及的两个数据表（对话表和消息表）
      //'rw' 表示事务类型为 “读写”（read-write），允许修改数据。
      await db.transaction('rw', [db.conversation, db.message], async () => {
        // 删除对话相关的所有消息
        await db.message.where('conversationId').equals(conversationId).delete();
        
        // 删除对话
        await db.conversation.delete(conversationId);
      });
      
      // 重新获取对话列表
      await getConversations();
      
      // 如果删除的是当前选中的对话，清除选中状态
      if (slectedId.value === conversationId) {
        slectedId.value = -1;
      }
      
      console.log(`对话 ${conversationId} 删除成功`);
    } catch (error) {
      console.error('删除对话失败:', error);
      throw error;
    }
  };

  return {
    items,
    getConversations,
    createConversation,
    getConversationbyId,
    deleteConversation,
    slectedId,
  };
});
