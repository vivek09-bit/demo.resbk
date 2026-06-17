import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// No backend proxy needed — all data is demo/mock
export default defineConfig({
  plugins: [react()],
})
