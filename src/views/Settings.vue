<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import type { AppConfig, Language, ProviderProps } from "../types";
import { db } from "../db";
import { providerConfigs } from "../providerConfigs";
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectItemText,
} from "radix-vue";
import {
  NumberFieldRoot,
  NumberFieldInput,
  NumberFieldIncrement,
  NumberFieldDecrement,
} from "radix-vue";
import {
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "radix-vue";
import {
  AccordionRoot,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
} from "radix-vue";

const language = ref<Language>("zh");
const fontSize = ref<number>(14);
const loading = ref<boolean>(true);
const saving = ref<boolean>(false);

const tab = ref<string>("general");
const providers = ref<ProviderProps[]>([]);

// 本地编辑缓冲：{ [providerName]: { [key]: value } }
const providerEditMap = ref<Record<string, Record<string, any>>>({});
// 当前展开的手风琴项（使用 id 字符串）
const openedProviderId = ref<string | undefined>(undefined);

onMounted(async () => {
  try {
    
    const cfg: AppConfig = await window.electronAPI.getConfig();
    language.value = cfg.language;
    fontSize.value = cfg.fontSize;
  } finally {
    loading.value = false;
  }
});

watch(tab, async (value) => {
  if (value === "models" && providers.value.length === 0) {
    providers.value = await db.provider.toArray();
  }
});

watch(openedProviderId, async (id) => {
  if (!id) return;
  const p = providers.value.find((x) => String(x.id) === String(id));
  if (!p) return;
  await onOpenProvider(p.name);
});

const save = async () => {
  if (loading.value) return;
  saving.value = true;
  try {
    const next: Partial<AppConfig> = {
      language: language.value,
      fontSize: fontSize.value,
    };
    await window.electronAPI.updateConfig(next);
    alert('Save Success')
  } finally {
    saving.value = false;
  }
};

const onOpenProvider = async (providerName: string) => {
  if (!providerName) return;
  // 拉取已保存的 provider 配置，填充到编辑缓冲
  const saved = await window.electronAPI.getProviderConfig(providerName);
  const defaults = (providerConfigs as any)[providerName] || [];
  const merged: Record<string, any> = {};
  for (const item of defaults) {
    const key = item.key;
    merged[key] = saved[key] ?? item.defaultValue ?? "";
  }
  providerEditMap.value[providerName] = merged;
};

const saveProvider = async (providerName: string) => {
  const values = providerEditMap.value[providerName] || {};
  // 传输前序列化为普通对象，避免含有 Proxy 导致的结构化克隆失败
  const plain = JSON.parse(JSON.stringify(values));
  await window.electronAPI.updateProviderConfig(providerName, plain);

};
</script>

<template>
  <div class="w-[90%] mx-auto py-6 space-y-6">
    <TabsRoot v-model="tab">
      <TabsList class="flex gap-6 border-b border-gray-200">
        <TabsTrigger value="general" class="pb-2 border-b-2" :class="tab === 'general' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-600'">通用设置</TabsTrigger>
        <TabsTrigger value="models" class="pb-2 border-b-2" :class="tab === 'models' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-600'">模型设置</TabsTrigger>
      </TabsList>

      <TabsContent value="general" class="pt-6 space-y-6">
        <h1 class="text-xl font-semibold">Settings</h1>

        <div class="space-y-2">
          <label class="block text-sm text-gray-600">Language</label>
          <SelectRoot v-model="language">
            <SelectTrigger class="inline-flex items-center justify-between rounded-md border border-gray-600 px-3 py-2 w-60 bg-white text-gray-800">
              <SelectValue :placeholder="'Select language'" />
            </SelectTrigger>
            <SelectContent class="mt-2 rounded-md border border-gray-200 bg-green-200 p-1 w-60">
              <SelectGroup>
                <SelectItem value="zh" class="px-2 py-1.5 rounded hover:bg-green-700 hover:text-white cursor-pointer"><SelectItemText>中文</SelectItemText></SelectItem>
                <SelectItem value="en" class="px-2 py-1.5 rounded hover:bg-green-700 hover:text-white cursor-pointer"><SelectItemText>English</SelectItemText></SelectItem>
              </SelectGroup>
            </SelectContent>
          </SelectRoot>
        </div>

        <div class="space-y-2">
          <label class="block text-sm text-gray-600">Font Size</label>
          <NumberFieldRoot v-model="fontSize" :min="9" :max="48" :step="1">
            <div class="flex items-center gap-2 w-60">
              <NumberFieldDecrement class="px-2 py-1 border border-gray-100 rounded">-</NumberFieldDecrement>
              <NumberFieldIncrement class="px-2 py-1 border border-gray-100 rounded">+</NumberFieldIncrement>
              <NumberFieldInput class="flex-1 px-3 py-2 border border-gray-600 rounded bg-white text-gray-800" />
            </div>
          </NumberFieldRoot>
        </div>

        <div>
          <button
            class="px-4 py-2 rounded-md bg-green-600 text-white disabled:opacity-50"
            :disabled="loading || saving"
            @click="save"
          >
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </TabsContent>

      <TabsContent value="models" class="pt-6">
        <div class="space-y-4">
          <AccordionRoot v-model="openedProviderId" type="single" collapsible class="space-y-3">
            <AccordionItem v-for="p in providers" :key="p.id" :value="String(p.id)" class="border rounded-md">
              <AccordionHeader>
                <AccordionTrigger class="w-full flex items-center justify-between px-4 py-3">
                  <div class="flex items-center gap-3">
                    <img :src="p.avatar" class="w-10 h-10 rounded-full" />
                    <span class="text-gray-800 font-medium">{{ p.title || p.name }}</span>
                  </div>
                  <span class="text-gray-500">展开</span>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent class="px-4 pb-4">
                <div v-if="providerEditMap[p.name]" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <template v-for="cfg in providerConfigs[p.name] || []" :key="cfg.key">
                    <div :class="cfg.type === 'textarea' ? 'md:col-span-2' : ''">
                      <label class="block text-sm text-gray-600 mb-1">{{ cfg.label }}<span v-if="cfg.required" class="text-red-500 ml-1">*</span></label>
                      
                     
                      <input  :type="cfg.type === 'password' ? 'password' : (cfg.type === 'number' ? 'number' : 'text')" class="w-full px-3 py-2 border rounded bg-white text-gray-800" :placeholder="cfg.placeholder || ''" v-model="providerEditMap[p.name][cfg.key]" />
                   
                    </div>
                  </template>
                  <div class="md:col-span-2 flex justify-end">
                    <button class="px-3 py-1.5 rounded bg-purple-600 text-white" @click="saveProvider(p.name)">保存 {{ p.title || p.name }}</button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </AccordionRoot>
        </div>
      </TabsContent>
    </TabsRoot>
  </div>
</template>

<style scoped>
</style>
