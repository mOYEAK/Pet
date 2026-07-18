import uni from "@dcloudio/vite-plugin-uni";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [uni()],
  server: {
    host: "0.0.0.0",
    port: 5174,
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASE_URL ?? "http://localhost:3000",
        changeOrigin: true
      }
    }
  }
});
