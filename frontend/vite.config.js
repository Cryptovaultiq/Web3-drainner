import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimize: {
    esbuild: {
      supported: {
        bigint: true
      }
    },
    include: ['@walletconnect/ethereum-provider']
  },
  ssr: {
    noExternal: ['@walletconnect/ethereum-provider']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
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
