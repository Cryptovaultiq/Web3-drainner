import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimize: {
    esbuild: {
      supported: {
        bigint: true
      }
    }
  },
  ssr: {
    noExternal: ['@walletconnect/ethereum-provider']
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
