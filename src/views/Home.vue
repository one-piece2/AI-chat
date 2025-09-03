<script lang="ts" setup>
import provideSelect from "../components/provideSelect.vue";
import MessageInput from "../components/MessageInput.vue";
import { computed, onMounted, ref } from "vue";
import { db } from "../db";
import { ProviderProps } from "../types";
import { useRouter } from "vue-router";
import { useConversationStore } from "../stores/conversation";
const modelnameandId = ref<string>("");
const conversationStore = useConversationStore();
const router = useRouter();
const providers = ref<ProviderProps[]>([]);
onMounted(async () => {
  //刚刚在APP里面插入的数据，现在取出
  providers.value = await db.provider.toArray();
});
const modelInfo = computed(() => {
  const [providerId, modelName] = modelnameandId.value.split("/");
  return { providerId: parseInt(providerId), modelName };
});
const dbCreateconversation = async (question: string, selectedImage?: File) => {
  let ImagePath: string | undefined;
  if (selectedImage) {
    try {
      const content = await selectedImage.arrayBuffer();
      ImagePath = await window.API.handleImageFie(selectedImage.name, content);
      console.log(ImagePath);
    } catch (error) {
      console.log(error);
    }
  }
  //会返回id
  const createData = {
    title: question,
    selectedModel: modelInfo.value.modelName,
    providerId: modelInfo.value.providerId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const conversationid = await conversationStore.createConversation(createData);

  const newMessageId = await db.message.add({
    type: "question",
    content: question,
    conversationId: Number(conversationid),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...(ImagePath && { imagePath: ImagePath }),
  });
  router.push(`/conversation/${conversationid}?init=${newMessageId}`);
};
</script>

<template>
  <div class="w-[80%] mx-auto h-full">
    <div class="h-[80%] flex items-center">
      <provideSelect v-model="modelnameandId" :items="providers" />
    </div>
    <div class="h-[20%] flex items-center">
      <MessageInput
        :disabled="modelnameandId === ''"
        @create="dbCreateconversation"
      />
    </div>
  </div>
</template>

<style scoped></style>
