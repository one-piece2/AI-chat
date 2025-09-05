<script lang="ts" setup>
import { ConversationProps } from "../types";
import { useConversationStore } from "../stores/conversation";
import dayjs from "dayjs";
import { useRouter } from "vue-router";

defineProps<{ items: ConversationProps[] }>();

const ConversationStore = useConversationStore();
const router = useRouter();

const handleclick = (item: ConversationProps) => {
  router.push({ path: `/conversation/${item.id}` });
  ConversationStore.slectedId = item.id;
};

// 触发 Electron 右键菜单
const handleContextMenu = (event: MouseEvent, item: ConversationProps) => {
  event.preventDefault();
  // 通过 IPC 发送右键菜单事件
  window.electronAPI?.showContextMenu?.(item.id);
};

// 处理右键菜单操作
const handleContextMenuAction = async (action: string, conversationId: number) => {
  if (action === "delete") {
    try {
      // 确认删除
      const confirmed = confirm('确定要删除这个对话吗？删除后无法恢复。');
      if (confirmed) {
        await ConversationStore.deleteConversation(conversationId);
        
        // 如果当前在删除的对话页面，跳转到首页
        
        const currentPath = router.currentRoute.value.path;
        if (currentPath.includes(`/conversation/${conversationId}`)) {
          router.push('/');
        }
      }
    } catch (error) {
      console.error('删除对话失败:', error);
      alert('删除对话失败，请重试');
    }
  }
};

// 监听右键菜单事件
import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
  window.electronAPI?.onContextMenuAction?.(handleContextMenuAction);
});

onUnmounted(() => {
  window.electronAPI?.removeContextMenuAction?.();
});
</script>

<template>
  <div class="conversation-list">
    <div
      v-for="item in items"
      :key="item.id"
      :class="{
        'bg-green-100 hover:bg-gray-300':
          ConversationStore.slectedId === item.id,
        'bg-white hover:bg-gray-200': ConversationStore.slectedId !== item.id,
      }"
      class="item border-gray-300 border-t cursor-pointer bg-white hover:bg-gray-300 p-2"
      @click="handleclick(item)"
      @contextmenu="handleContextMenu($event, item)"
    >
      <div
        class="flex justify-between items-center text-sm leading-5 text-gray-500"
      >
        <span>{{ item.selectedModel }}</span>
        <span>{{ dayjs(item.updatedAt).format("YYYY-MM-DD") }}</span>
      </div>
      <h2 class="font-semibold leading-6 truncate">{{ item.title }}</h2>
    </div>
  </div>
</template>

<style scoped></style>
