<template>
  <div class="flex items-center justify-between h-screen">
    <div class="bg-gray-200 border-gray-300 h-full w-[300px] border-r">
      <div class="h-[90%] overflow-y-auto">
        <conversation-list :items="items" />
      </div>

      <div class="h-[10%] grid grid-cols-2 gap-2 p-2">
        <Button icon-name="radix-icons:chat-bubble" @click="handleclick">
          新建聊天
        </Button>

        <router-link to="/settings">
          <Button icon-name="radix-icons:gear" plain> 应用设置 </Button>
        </router-link>
      </div>
    </div>
    <div class="flex-1 h-full">
      <RouterView />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Button from "./components/Button.vue";
import { useRouter } from "vue-router";
import { useConversationStore } from "./stores/conversation";
import { db, initProviders } from "./db";
import ConversationList from "./components/ConversationList.vue";

import { computed, onMounted, ref } from "vue";
const conversationStore = useConversationStore();
const items = computed(() => conversationStore.items);
const router = useRouter();

onMounted(async () => {
  await initProviders();
  await conversationStore.getConversations();
});
const handleclick = () => {
  router.push("/");
};
</script>
