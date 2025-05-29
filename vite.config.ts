import { defineConfig } from 'vite'
import cp from 'vite-plugin-cp'

export default defineConfig({
  build: {
    lib: {
      entry: './lib/main.ts',
      name: 'twind-scope',
      fileName: 'twind-scope',
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  plugins: [
    cp({
      targets: [
        {
          src: './dist/twind-scope.js',
          dest: '../js',
        },
      ],
    }),
  ],
})
