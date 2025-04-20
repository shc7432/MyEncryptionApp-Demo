import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 5173
  },
  build: {
    target: 'es2022'
  },
  base: '/webstatic/my-encryption-app/'
})