import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,      // 사용할 포트 번호 지정
    strictPort: true // 이미 사용 중이면 다른 번호로 바꾸지 않고 에러를 띄워줌
  }
})