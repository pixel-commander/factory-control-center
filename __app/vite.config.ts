import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@components': path.resolve(import.meta.dirname, '../__shared/components'),
      '@atoms': path.resolve(import.meta.dirname, '../__shared/atoms'),
      '@dashboards': path.resolve(import.meta.dirname, '../__shared/dashboards'),
    },
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
})
