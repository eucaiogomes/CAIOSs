import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    proxy: {
      '/hermes-api': {
        target: 'http://127.0.0.1:9119',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hermes-api/, ''),
        ws: true,
      },
    },
  },
})