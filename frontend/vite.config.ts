import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3999,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3998',
        changeOrigin: true,
      },
    },
  },
})
