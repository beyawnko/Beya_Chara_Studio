import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// If building on GitHub Pages, set base to '/<repo>/' via env
const base = process.env.GITHUB_PAGES_BASE || '/'

export default defineConfig({
  plugins: [react()],
  base,
})
