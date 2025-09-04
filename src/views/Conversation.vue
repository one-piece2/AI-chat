<script lang="ts" setup>
import { MessageProps } from "../types";
import { useRoute } from "vue-router";
import { MessageListInstance, MessageStatus } from "../types";
import { useMessageStore } from "../stores/message";
import { db } from "../db";
import MessageList from "../components/MessageList.vue";
import MessageInput from "../components/MessageInput.vue";
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useConversationStore } from "../stores/conversation";
import dayjs from "dayjs";
const route = useRoute();
const messageStore = useMessageStore();
const conversationStore = useConversationStore();
const filtermessage = computed(() => messageStore.items);
const conversation = computed(() =>
  conversationStore.getConversationbyId(Number(route.params.id)),
);
const sendedMessages = computed(() =>
  filtermessage.value
    .filter(
      (message) => message.status !== "loading" && message.status !== "error",
    )
    .map((message) => {
      return {
        role: message.type === "question" ? "user" : ("assistant" as any),
        content: message.content,
        ...(message.imagePath && { imagePath: message.imagePath }),
      };
    }),
);
const messageListRef = ref<MessageListInstance>();
const initMessageId = parseInt(route.query.init as string);
const messageScrollToBottom = async () => {
  await nextTick();
  if (messageListRef.value) {
    messageListRef.value.ref.scrollIntoView({
      block: "end",
      behavior: "smooth",
    });
  }
};
//这个函数可以让你继续聊天，也带图片的。 在Home中我们也支持首次聊天的时候添加图片。
const handleCreate = async (question: string, imagePath?: File) => {
  let Imagepath: string | undefined;
  if (question) {
    // let copiedImagePath: string | undefined
    if (imagePath) {
      try {
        const imageName = imagePath.name;
        const imagecotent = await imagePath.arrayBuffer();
        Imagepath = await window.API.handleImageFie(imageName, imagecotent);
        console.log("copiedImagePath", Imagepath);
      } catch (error) {
        console.error("Failed to copy image:", error);
      }
    }
    const date = new Date().toISOString();
    await messageStore.createInitialMessage({
      content: question,
      type: "question",
      conversationId: Number(route.params.id),
      createdAt: date,
      updatedAt: date,
      ...(Imagepath && { imagePath: Imagepath }),
    });
    await createInitialMessage();
  }
};

const createInitialMessage = async () => {
  const createdMessage: Omit<MessageProps, "id"> = {
    content: "",
    type: "answer",
    status: "loading",
    conversationId: Number(route.params.id),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const newMessageId = await messageStore.createInitialMessage(createdMessage);

  if (conversation.value) {
    const provider = await db.provider
      .where({
        id: conversation.value.providerId,
      })
      .first();
    if (provider) {
      window.API.startChat({
        messageId: newMessageId,
        selectedModel: conversation.value.selectedModel,
        providerName: provider.name,
        messages: sendedMessages.value,
      });
    }
  }
};
let BackData = "";
onMounted(async () => {
  await messageStore.getMessagesByConversationId(Number(route.params.id));
  await messageScrollToBottom();
  if (initMessageId) {
    await createInitialMessage();
  }
  //相当于注册了事件
  window.API.OnupdateMessage(async (streamData) => {
    BackData += streamData.data.result;
    const MessageId = streamData.messageId;
    const UpdatedMessage = {
      status: streamData.data.is_end
        ? "finished"
        : ("streaming" as MessageStatus),
      content: BackData,
      updatedAt: new Date().toISOString(),
    };
    await messageStore.updataMessage(MessageId, UpdatedMessage);
    await nextTick();
    await messageScrollToBottom();
    if (streamData.data.is_end) {
      BackData = "";
    }
  });
});

watch(
  () => route.params.id,
  async (newVal, oldVal) => {
    await messageStore.getMessagesByConversationId(Number(newVal));
    await messageScrollToBottom();
  },
  { immediate: true },
);
</script>

<template>
  <div
    v-if="conversation"
    class="h-[5%] bg-green-200 border-b-2 border-gray-300 flex items-center align-middle px-3 justify-between"
  >
    <h3 class="font-semibold text-gray-900">
      {{ conversation.title }}
    </h3>
    <span class="text-sm text-gray-500 mr-8">{{
      dayjs(conversation.updatedAt).format("YYYY-MM-DD")
    }}</span>
  </div>
  <div class="w-[75%] mx-auto h-[95%]">
    <div class="h-[80%] overflow-y-auto">
      <MessageList ref="messageListRef" :messages="filtermessage" />
    </div>
    <div class="h-[15%] flex items-center">
      <MessageInput
        :disabled="messageStore.isMessageLoading()"
        @create="handleCreate"
      />
    </div>
  </div>
</template>

<style scoped></style>
