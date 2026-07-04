import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Update this to match your GitHub repo name!
  // If your repo is "sari-sari-credit-ledger", set to "/sari-sari-credit-ledger/"
  // If your repo is "utang.github.io", set to "/"
  base: '/',
})
