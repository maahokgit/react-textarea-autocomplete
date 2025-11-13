import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'example',
  resolve: {
    alias: {
      '@webscopeio/react-textarea-autocomplete': path.resolve(__dirname, './src/index.ts'),
    },
  },
  server: {
    port: 8080,
  },
});

