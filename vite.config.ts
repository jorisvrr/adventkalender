import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const exposedOnNetwork = process.argv.includes('--host')

export default defineConfig(({ command }) => {
  // Vite weigert elk pad met een ':' zolang fs.strict aanstaat, en deze map heet
  // '02:: personal'. Daarom staat strict uit voor de dev-server, maar alleen op localhost:
  // zonder strict kan de dev-server elk bestand op de schijf serveren. Voor de telefoon
  // gebruik je `npm run dev:lan`, dat alleen de build (dist/) serveert.
  if (command === 'serve' && exposedOnNetwork && !process.argv.includes('preview')) {
    throw new Error('Gebruik `npm run dev:lan` om de app op je netwerk te openen (de dev-server blijft op localhost).')
  }
  return {
    plugins: [react()],
    server: { fs: { strict: false } },
    test: { include: ['src/**/*.test.ts'] },
  }
})
