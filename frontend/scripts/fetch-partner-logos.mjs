/**
 * Downloads official partner logos for the landing page into public/partners/.
 * Run: node scripts/fetch-partner-logos.mjs
 */
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, "..", "public", "partners")

const REMOTE = {
  "amani-institute.png":
    "https://nairobi.impacthub.net/wp-content/uploads/2023/12/Amani-Institute-300x96.png",
  "sndbx-capital.jpg": "https://nairobi.impacthub.net/wp-content/uploads/2023/12/SNDBX.jpg",
  "circular-innovation-hub.png":
    "https://nairobi.impacthub.net/wp-content/uploads/2023/12/CIH-LOGO@4x-300x187.png",
  "digital-africa.png": "https://digitalafrica.co/dal_logo.png",
  "ilri.png": "https://www.ilri.org/themes/custom/bootstrap_ilri/images/logo.png",
  "cgiar.svg": "https://www.cgiar.org/assets/img/cgiar/logo.svg",
  "doen.png":
    "https://www.google.com/s2/favicons?domain=doen.nl&sz=256",
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; ImpactHubNairobi/1.0)" },
  })
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function main() {
  await mkdir(outDir, { recursive: true })

  for (const [name, url] of Object.entries(REMOTE)) {
    const buf = await fetchBuffer(url)
    const dest = path.join(outDir, name)
    if (name === "digital-africa.png") {
      await sharp(buf)
        .resize(400, null, { withoutEnlargement: true })
        .png({ quality: 90 })
        .toFile(dest)
    } else if (name === "cgiar.svg") {
      await sharp(buf, { density: 300 })
        .resize(280, null)
        .png()
        .toFile(path.join(outDir, "cgiar.png"))
    } else {
      await writeFile(dest, buf)
    }
    console.log("wrote", name)
  }

  console.log("Partner logos written to public/partners/")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
