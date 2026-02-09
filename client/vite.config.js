import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,            // important for tunnels/LAN
    allowedHosts: true,    // ✅ allow all hosts (ngrok, etc.)
    proxy: {
      '/api': {
        target: 'http://localhost:5880',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
