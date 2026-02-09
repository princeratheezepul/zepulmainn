import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: 'all', // ✅ allow ngrok & other public tunnels
    proxy: {
      '/api': {
        target: 'http://localhost:5880', // backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
