<script lang="ts" setup>
import { ConversationProps } from "../types";
defineProps<{ items: ConversationProps[] }>();
import { useConversationStore } from "../stores/conversation";
import dayjs from "dayjs";
const ConversationStore = useConversationStore();
import { useRouter } from "vue-router";
const router = useRouter();
const handleclick = (item: ConversationProps) => {
  router.push({ path: `/conversation/${item.id}` });
  ConversationStore.slectedId = item.id;
};
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
