import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// Dev server proxies API + uploads to the Express backend on :5000.
export default defineConfig({
  plugins: [react()],
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "https://gym-membership-system-2ixg.onrender.com", changeOrigin: true },
      "/uploads": { target: "https://gym-membership-system-2ixg.onrender.com", changeOrigin: true },
    },
  },
});
