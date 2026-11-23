import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

// The parent guide is React; the practice zone (src/practice) is Solid.
const practice = /src[\\/]practice[\\/]/

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    cloudflare(),
    tailwindcss(),
    react({ exclude: practice }),
    babel({ presets: [reactCompilerPreset()], exclude: [practice, /node_modules/] }),
    solid({ include: practice }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        practice: resolve(import.meta.dirname, 'practice/index.html'),
      },
    },
  },
})
