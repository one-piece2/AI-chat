<script lang="ts" setup>
import Button from "./Button.vue";
import { ref } from "vue";
import { Icon } from "@iconify/vue";

const inputvalue = ref<string>();
const emit = defineEmits<{
  create: [value: string, selectedImage?: File];
}>();
const Props = defineProps({
  disabled: {
    type: Boolean,

    required: false,
  },
});
const onCreate = () => {
  if (inputvalue.value.trim() !== "") {
    emit("create", inputvalue.value, selectedImage || undefined);
    inputvalue.value = "";
  }
};
const Imageurl = ref<string>("");
const fileInput = ref<HTMLInputElement | null>(null);
const triggerFileInput = () => {
  if (Props.disabled) {
    return;
  }
  fileInput.value?.click();
};
let selectedImage: File | null = null;
const handleFileChange = (e: Event) => {
  const targer = e.target as HTMLInputElement;
  if (targer.files && targer.files.length > 0) {
    selectedImage = targer.files[0];
    console.log(selectedImage);
    const reader = new FileReader();
    reader.readAsDataURL(selectedImage);
    reader.onload = (e) => {
      Imageurl.value = e.target?.result as string;
    };
  }
};
</script>

<template>
  <div
    class="message-input w-full shadow-sm border rounded-lg border-gray-300 py-1 px-2 focus-within:border-green-700"
  >
    <div class="flex items-center relative mb-2">
      <img v-if="Imageurl" :src="Imageurl" class="h-20 w-20 rounded" />
    </div>
    <div class="flex items-center justify-center">
      <!--     accept="image/*"  这个是说明只支持图片-->
      <input
        ref="fileInput"
        accept="image/*"
        class="hidden"
        type="file"
        @change="handleFileChange"
      />
      <Icon
        :class="[
          'mr-2',
          disabled
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-400 cursor-pointer hover:text-gray-600',
        ]"
        height="24"
        icon="radix-icons:image"
        width="24"
        @click="triggerFileInput"
      />
      <input
        v-model="inputvalue"
        :disabled="disabled"
        class="outline-none border-0 shadow-sm border-gray-300 focus:ring-0 flex-1 h-[32px] bg-white p-3 rounded"
        type="text"
      />
      <Button
        :disabled="disabled"
        icon-name="radix-icons:paper-plane"
        @click="onCreate"
        >发送</Button
      >
    </div>
  </div>
</template>

<style scoped></style>
