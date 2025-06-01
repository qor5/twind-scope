import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './lib/main.ts',
      name: 'twind-scope',
      fileName: (format) =>
        `twind-scope.${
          format === 'umd' ? 'js' : format === 'es' ? 'esm.js' : 'js'
        }`,
      formats: ['es', 'umd'],
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        unused: true,
        drop_console: false,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
      mangle: true,
    },
  },
})
