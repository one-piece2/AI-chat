import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import { createPinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";
import Home from "./views/Home.vue";
import Conversation from "./views/Conversation.vue";
import Settings from "./views/Settings.vue";
import { useConversationStore } from "./stores/conversation";
import "highlight.js/styles/github-dark-dimmed.css";
const pinia = createPinia();

const routes = [
  { path: "/", component: Home },
  { path: "/conversation/:id", component: Conversation },
  { path: "/settings", component: Settings },
];
const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
router.beforeEach((to) => {
  const store = useConversationStore();
  if (!to.path.startsWith("/conversation")) {
    store.slectedId = -1;
  }
});
createApp(App).use(router).use(pinia).mount("#app");
