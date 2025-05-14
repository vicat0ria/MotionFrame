import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import envCompatible from "vite-plugin-env-compatible";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  base: "/MotionFrame/",
  plugins: [react(), envCompatible()],
  resolve: {
    dedupe: ["three"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ["**/*.mp4"],
});
