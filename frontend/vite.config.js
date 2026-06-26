/**
 * Capa: Configuración de build (Vite)
 * Descripción: Define plugins, alias de rutas y proxy de desarrollo hacia el backend.
 *
 * Conexiones:
 *   - Alias: @ → ./src (usado en todos los imports @/...)
 *   - Proxy dev: /api → http://localhost:3000
 *   - Puerto dev: 5173
 *
 * Notas:
 *   - En producción, VITE_API_URL puede apuntar al backend real.
 *   - Tailwind se integra vía @tailwindcss/vite.
 */
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})