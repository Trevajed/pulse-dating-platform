import pages from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    pages({
      entry: 'src/index.tsx'
    }),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: true,
    rollupOptions: {
      output: {
        format: 'es'
      }
    }
  }
})
