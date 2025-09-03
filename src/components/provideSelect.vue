<script setup lang="ts">
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectPortal,
  SelectRoot,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'radix-vue'
import {ProviderProps} from "../types";
import {Icon} from "@iconify/vue";
defineProps<{items:ProviderProps[]}>();
const currenModel =defineModel<string>()
</script>

<template>
<div class="provider-select w-full">
  <SelectRoot v-model="currenModel">
    <SelectTrigger class="flex w-full items-center justify-between
        rounded-md py-1.5 px-3 shadow-sm border outline-none data-[placeholder]:text-gray-400">
      <SelectValue placeholder="Select a model..."/>
      <Icon icon="radix-icons:chevron-down" class="h-5 w-5"/>
    </SelectTrigger>
    <select-portal>
      <select-content class="bg-white rounded-md shadow-md z-[100] border">
        <select-viewport class="p-2">
          <div v-for="item in items" :key="item.id">
           <select-label class="flex items-center px-6 h-7 text-gray-500">
             <img :src="item.avatar" :alt="item.name"  class="h-5 w-5 mr-2 rounded"/>
             {{item.name}}
           </select-label>
             <select-group>
               <select-item v-for="(model,index) in item.models" :key="index" :value="`${item.id}/${model}`" class="flex
               items-center px-8 h-7 outline-none rounded relative
               cursor-pointer text-green-700 data-[highlighted]:bg-green-700 data-[highlighted]:text-white">
                 <SelectItemIndicator class="absolute left-1 w-[25px] inline-flex items-center justify-center">
                   <Icon icon="radix-icons:check" />
                 </SelectItemIndicator>
                   <select-item-text>
                     {{model}}
                   </select-item-text>
               </select-item>
             </select-group>
            <SelectSeparator class="h-[1px] bg-green-300 my-2" />

          </div>
        </select-viewport>
      </select-content>
    </select-portal>
  </SelectRoot>
</div>


</template>

<style scoped>

</style>