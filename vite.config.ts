import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  resolve: {
    alias: {
      "@coka/coka": "/packages/coka/src/index.ts"
    },
  },
  server: {
    proxy: {
      '/micro': {
        changeOrigin: true,
        target: 'http://api.baizhun.cn'
      }
    }
  }
})
