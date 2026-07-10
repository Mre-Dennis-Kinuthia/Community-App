/**
 * Regenerates landing/auth images from local Impact Hub Nairobi space photos.
 * Prefer: node scripts/import-hub-photos.mjs
 * This script remains as a thin alias for older docs/scripts.
 */
import { spawn } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const child = spawn(process.execPath, [path.join(__dirname, "import-hub-photos.mjs")], {
  stdio: "inherit",
})
child.on("exit", (code) => process.exit(code ?? 1))
