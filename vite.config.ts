import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import federation from "@originjs/vite-plugin-federation";

// https://vite.dev/config/
// https://www.npmjs.com/package/@originjs/vite-plugin-federation

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'host',
      filename: 'remoteEntry.js',
      remotes: {
        dashboard: 'dashboard@http://localhost:3001/remoteEntry.js',
        sidebar: 'sidebar@http://localhost:3002/remoteEntry.js',
        trend: 'trend@http://localhost:3003/remoteEntry.js',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
})
