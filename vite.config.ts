import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // 백엔드(같이모으기-backend) 로컬 구동 시 CORS 없이 붙기 위한 프록시.
    // 실제 배포(Capacitor)에서는 VITE_API_BASE_URL을 절대 주소로 지정해 사용한다.
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_PROXY_TARGET ?? 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
