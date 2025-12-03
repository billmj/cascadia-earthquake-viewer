import { defineConfig } from 'vite';
import cesium from 'vite-plugin-cesium';

export default defineConfig({
  plugins: [cesium()],
  server: { 
    port: 5173,
    host: '0.0.0.0'  // Listen on all interfaces
  }
});