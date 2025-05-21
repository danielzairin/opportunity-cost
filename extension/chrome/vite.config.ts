import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: "public/manifest.json",
          dest: ".",
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "build",
    rollupOptions: {
      input: {
        main: "./index.html",
        options: "./options.html",
        background: "./src/lib/background.js",
        storage: "./src/lib/storage.ts",
        content: "./src/lib/content.js",
        constants: "./src/lib/constants.ts",
      },
      output: {
        entryFileNames: () => {
          return "[name].js";
        },
      },
    },
  },
});
