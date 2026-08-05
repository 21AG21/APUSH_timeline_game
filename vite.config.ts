import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // No `base` override: the site is served from the domain root on Vercel.
  // Setting a subpath here (e.g. for GitHub Pages project sites) makes every
  // asset resolve under that prefix and the deployed page renders blank.
  plugins: [react()],
  server: {
    allowedHosts: true
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
