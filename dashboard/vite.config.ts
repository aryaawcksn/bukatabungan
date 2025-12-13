import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
              return 'utils';
            }
            if (id.includes('react-router-dom')) {
              return 'router';
            }
            return 'vendor';
          }
        }
      }
    },
    target: 'esnext',
    minify: true,
    chunkSizeWarningLimit: 2000,
    sourcemap: false
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react', 'react-router-dom']
  },
  server: {
    fs: {
      strict: false
    }
  },
  preview: {
    port: 4173,
    strictPort: true
  }
})
