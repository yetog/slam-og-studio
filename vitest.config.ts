import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@dsp': path.resolve(__dirname, './src/dsp'),
      '@effects': path.resolve(__dirname, './src/effects'),
      '@instruments': path.resolve(__dirname, './src/instruments'),
    },
  },
})
