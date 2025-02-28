import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import envCompatible from "vite-plugin-env-compatible";
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [react(), envCompatible(), tailwindcss()],
  base: "/MotionFrame/", 
});

