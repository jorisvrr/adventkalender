// Bouwt de app opnieuw bij elke wijziging en serveert dist/ op je netwerk,
// zodat je hem op je telefoon kunt openen (zelfde wifi).
import { spawn } from 'node:child_process'

const vite = 'node_modules/vite/bin/vite.js'
const run = (args) => spawn(process.execPath, [vite, ...args], { stdio: 'inherit' })

const build = run(['build', '--watch'])
const preview = run(['preview', '--host', '--port', '4173'])

const stop = () => {
  build.kill()
  preview.kill()
  process.exit()
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
