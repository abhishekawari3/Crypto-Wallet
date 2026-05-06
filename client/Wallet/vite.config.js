import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('@solana') ||
              id.includes('borsh') ||
              id.includes('bn.js') ||
              id.includes('bs58') ||
              id.includes('base-x') ||
              id.includes('buffer') ||
              id.includes('safe-buffer') ||
              id.includes('rpc-websockets') ||
              id.includes('jayson') ||
              id.includes('superstruct') ||
              id.includes('text-encoding-utf-8') ||
              id.includes('fast-stable-stringify')
            ) return 'vendor-solana'
            if (id.includes('three')) return 'vendor-three'
            if (id.includes('ethers')) return 'vendor-ethers'
            if (id.includes('bip39') || id.includes('tweetnacl')) return 'vendor-crypto'
            if (id.includes('lucide-react')) return 'vendor-icons'
            return 'vendor'
          }
        },
      },
    },
  },
})
