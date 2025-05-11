import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

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
        target: "esnext",
        sourcemap: true,
        rollupOptions: {
            external: [
                
            ],
        }
    },
    optimizeDeps: {
        esbuildOptions: {
            target: 'es2022' // 确保设置为支持 top-level await 的版本
        },
        exclude: [
            
        ]
    },
    base: '/webstatic/my-encryption-app/'
})