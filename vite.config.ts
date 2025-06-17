// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/ramadan/', // مهم جدًا
  plugins: [react()],
})
