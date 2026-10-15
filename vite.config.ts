import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' pozwala otworzyć zbudowaną stronę z dowolnego folderu lub GitHub Pages
export default defineConfig({
  base: './',
  plugins: [react()],
})
