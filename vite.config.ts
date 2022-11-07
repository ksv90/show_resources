import react from '@vitejs/plugin-react';
import { defineConfig, splitVendorChunkPlugin } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'build',
  },
  plugins: [react(), splitVendorChunkPlugin()],
});
