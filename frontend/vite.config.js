import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // or use PostCSS approach

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})