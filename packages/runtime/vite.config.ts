import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";
import dts from "vite-plugin-dts";

const tsconfigPath = fileURLToPath(new URL("./tsconfig.json", import.meta.url));

export default defineConfig({
  plugins: [
    dts({
      tsconfigPath,
      include: ["src"],
      entryRoot: "src",
      outDir: "dist",
    }),
  ],
  build: {
    lib: {
      entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      formats: ["es"],
      fileName: "index",
    },
  },
});
