import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Formula-1-Legends/' : '/',
  plugins: [react()],
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5188,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 5188,
  },
}))
