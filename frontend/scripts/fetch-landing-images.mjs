/**
 * Downloads and optimizes Impact Hub Nairobi marketing images for the landing/auth pages.
 * Run: node scripts/fetch-landing-images.mjs
 */
import { mkdir, unlink, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const landingDir = path.join(__dirname, "..", "public", "landing")

const REMOTE = {
  hero: "https://nairobi.impacthub.net/wp-content/uploads/2025/08/28-scaled.jpg",
  "pillar-programs": "https://nairobi.impacthub.net/wp-content/uploads/2025/07/IHN-support-1024x683.jpg",
  "pillar-coworking": "https://nairobi.impacthub.net/wp-content/uploads/2025/07/Ikigai-Riverside-4-1024x683.jpg",
  "pillar-innovation":
    "https://nairobi.impacthub.net/wp-content/uploads/2025/07/Global-gathering-group-photo-1024x683.jpg",
  "pillar-partnerships": "https://nairobi.impacthub.net/wp-content/uploads/2025/07/Partnership-1024x683.jpg",
}

async function fetchBuffer(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function main() {
  await mkdir(landingDir, { recursive: true })

  const heroBuffer = await fetchBuffer(REMOTE.hero)
  await sharp(heroBuffer)
    .resize(1920, null, { withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(landingDir, "hero.jpg"))

  for (const [name, url] of Object.entries(REMOTE)) {
    if (name === "hero") continue
    const buf = await fetchBuffer(url)
    await writeFile(path.join(landingDir, `${name}.jpg`), buf)
  }

  await writeFile(
    path.join(landingDir, "auth-panel.jpg"),
    await fetchBuffer(REMOTE["pillar-coworking"])
  )

  console.log("Landing images written to public/landing/")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
