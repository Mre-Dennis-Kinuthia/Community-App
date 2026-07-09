/**
 * Regenerates PWA icons from the official square mark.
 * Prefer `npm run brand:assets` when updating the logo source.
 */
import { spawn } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "generate-brand-assets.mjs")
const child = spawn(process.execPath, [script], { stdio: "inherit" })
child.on("exit", (code) => process.exit(code ?? 1))
