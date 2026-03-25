import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import { defineConfig } from "vite-plus";

export default defineConfig({
  server: {
    open: true,
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "./src/"),
      "@mixin/components": resolve(__dirname, "../packages/components/src/index.ts"),
      "@mixin/runtime": resolve(__dirname, "../packages/runtime/src/index.ts"),
      "@wendraw/lib": resolve(__dirname, "../packages/lib/src/index.ts"),
      "@wendraw/lib2": resolve(__dirname, "../packages/inner/lib2/src/index.ts"),
      "@wendraw/ui": resolve(__dirname, "../packages/ui/src/index.ts"),
    },
  },
  plugins: [vue(), UnoCSS()],
});
