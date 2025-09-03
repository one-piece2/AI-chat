<script lang="ts" setup>
import { MessageProps } from "../types";
import { Icon } from "@iconify/vue";
defineProps<{ messages: MessageProps[] }>();
import dayjs from "dayjs";
import VueMarkdown from "vue-markdown-render";
import markdownHilightjs from "markdown-it-highlightjs";

import { ref } from "vue";
const plungs = [markdownHilightjs];
const messageList = ref<HTMLDivElement>();
defineExpose({ ref: messageList });
</script>

<template>
  <div ref="messageList" class="message-list">
    <div
      v-for="message in messages"
      :key="message.id"
      class="message-item border-b border-gray-400 p-4"
    >
      <div v-if="message.type === 'question'" class="text-right">
        <div
          class="inline-block bg-green-700 text-white p-2 rounded-lg max-w-[70%]"
        >
          <img
            v-if="message.imagePath"
            :src="`safe-file:///${encodeURI(message.imagePath.replace(/\\/g, '/'))}`"
            alt="t"
            class="w-24 h-24 rounded"
          />
          <VueMarkdown :source="message.content" />`
        </div>
        <div class="text-xs text-gray-500 mt-1">
          {{ dayjs(message.createdAt).format("YYYY-MM-DD") }}
        </div>
      </div>
      <div v-else class="text-left">
        <div class="inline-block bg-gray-200 p-2 rounded-lg max-w-[70%]">
          <div v-if="message.status === 'loading'">
            <Icon icon="eos-icons:three-dots-loading"></Icon>
          </div>
          <div
            v-else
            class="prose prose-headings:my-0 prose-p:my-1 prose-strong:my-1 prose-li:my-1 prose-ul:my-2"
          >
            <VueMarkdown :plugins="plungs" :source="message.content" />`
          </div>
        </div>
        <div class="text-xs text-gray-500 mt-1">
          {{ dayjs(message.createdAt).format("YYYY-MM-DD") }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
