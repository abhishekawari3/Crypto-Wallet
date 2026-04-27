import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), nodePolyfills()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three')) return 'vendor-three'
            if (id.includes('ethers')) return 'vendor-ethers'
            if (id.includes('@solana/web3.js')) return 'vendor-solana'
            if (id.includes('bip39') || id.includes('ed25519-hd-key') || id.includes('tweetnacl') || id.includes('bs58')) return 'vendor-crypto'
            if (id.includes('lucide-react')) return 'vendor-icons'
            return 'vendor'
          }
        },
      },
    },
  },
})
