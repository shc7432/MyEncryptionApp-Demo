import vue from '@vitejs/plugin-vue'

export default ({
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
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      external: ['../../lib/encryption/main.bundle.js']
    }
  },
  base: '/webstatic/my-encryption-app/'
})