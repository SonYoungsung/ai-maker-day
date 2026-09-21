import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages로 배포할 때 저장소 이름에 맞춰 base를 조정하세요.
// 예) 저장소가 https://<user>.github.io/ai-edu 라면 base: "/ai-edu/"
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",
});
