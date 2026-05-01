import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    host: true,
    port: 5173,
    allowedHosts: "all", // ✅ ADD THIS
  },

  preview: {
    host: true,
    port: process.env.PORT || 4173,
    allowedHosts: "all", // ✅ already correct
  },
});