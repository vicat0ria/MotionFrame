import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import envCompatible from "vite-plugin-env-compatible";
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), envCompatible()],
  base: "/MotionFrame/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ['**/*.mp4'],
})
