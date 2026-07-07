import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor';
            if (id.includes('@radix-ui') || id.includes('lucide-react')) return 'ui';
            if (id.includes('@tanstack') || id.includes('zustand') || id.includes('axios') || id.includes('zod') || id.includes('react-hook-form')) return 'data';
            if (id.includes('jspdf') || id.includes('xlsx') || id.includes('html2canvas')) return 'export';
            return 'deps';
          }
        }
      }
    }
  }
})
