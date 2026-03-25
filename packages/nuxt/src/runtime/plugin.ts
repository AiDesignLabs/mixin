import type { NuxtApp } from "nuxt/app";
import { defineNuxtPlugin } from "nuxt/app";
import MixinComponents from "@mixin/components";

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  nuxtApp.vueApp.use(MixinComponents as any);
});
