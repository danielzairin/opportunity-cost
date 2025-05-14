import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
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
      "@": "./src",
    },
  },
  build: {
    outDir: "build",
    rollupOptions: {
      input: {
        main: "./index.html",
        options: "./options.html",
      },
    },
  },
});
