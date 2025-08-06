import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import federation from "@originjs/vite-plugin-federation";

// https://vite.dev/config/
// https://www.npmjs.com/package/@originjs/vite-plugin-federation

export default defineConfig({
  server: {
    port: 5001,
    cors: true,
  },
  plugins: [
    react(),
    federation({
      name: 'host',
      filename: 'remoteEntry.js',
      remotes: {
        dashboard: 'http://localhost:3001/assets/remoteEntry.js',
        sidebar: 'http://localhost:4001/assets/remoteEntry.js',
        trend: 'http://localhost:6001/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
})
