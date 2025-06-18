import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['quantum-medical-frontend.vercel.app', "ucielbustamante.online"],
  },
})
