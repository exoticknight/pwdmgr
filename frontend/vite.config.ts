import { fileURLToPath, URL } from 'node:url'
import UnpluginTypia from '@ryoppippi/unplugin-typia/vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), svelte(), UnpluginTypia()],
  mode: 'development',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
