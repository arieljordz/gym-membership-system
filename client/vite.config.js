import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev server proxies API + uploads to the Express backend on :5000.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: true },
      "/uploads": { target: "http://localhost:5000", changeOrigin: true },
    },
  },
});
