import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import csvWordsPlugin from './csv-words-plugin.js'

export default defineConfig({
  plugins: [csvWordsPlugin(), react()],
  base: '/purrdle/',
})
