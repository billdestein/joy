import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    define: { global: 'globalThis' },
    plugins: [react()],
    resolve: {
        alias: {
            'react-better-frames': resolve(__dirname, '../frontend/frames/src/index.ts'),
        },
    },
    server: {
        proxy: {
            '/v1': { target: 'http://localhost:8080', changeOrigin: true },
        },
    },
})
