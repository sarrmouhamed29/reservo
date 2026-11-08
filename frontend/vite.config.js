import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Bind mounts on Docker for Windows emit no file events: poll so edits show up.
    watch: { usePolling: true, interval: 300 },
    proxy: {
      '/api': {
        target: 'http://nginx',
        changeOrigin: true,
      },
      '/sanctum': {
        target: 'http://nginx',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    coverage: {
      reporter: ['text', 'lcov'],
    },
  },
})
