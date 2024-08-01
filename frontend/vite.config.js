import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    port: 5000,
    open: true,
    proxy: {
      "/socket.io": {
        target: "https://prodigy-fs-04-92ck.onrender.com",
        ws: true,
        changeOrigin: true,
      },
      "/api": {
        target: "https://prodigy-fs-04-92ck.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    watch: {
      usePolling: true,
    },
  },
});
