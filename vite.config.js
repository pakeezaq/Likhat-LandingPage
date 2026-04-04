import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        founding: 'founding-circle.html',
        privacy: 'privacy.html',
        terms: 'terms.html',
        delete: 'delete-account.html'
      }
    }
  }
})
