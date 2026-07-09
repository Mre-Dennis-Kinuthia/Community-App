/**
 * Downloads partner logos for the landing page into public/partners/.
 * Run: node scripts/fetch-partner-logos.mjs
 */
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, "..", "public", "partners")

const IHN = "https://nairobi.impacthub.net/wp-content/uploads"

const REMOTE = {
  // Strategic
  "amani-institute.png": `${IHN}/2023/12/Amani-Institute-300x96.png`,
  "sndbx-capital.jpg": `${IHN}/2023/12/SNDBX.jpg`,
  "circular-innovation-hub.png": `${IHN}/2023/12/CIH-LOGO@4x-300x187.png`,
  "digital-africa.png": "https://digitalafrica.co/dal_logo.png",
  "ilri.png": "https://www.ilri.org/themes/custom/bootstrap_ilri/images/logo.png",
  "cgiar.svg": "https://www.cgiar.org/assets/img/cgiar/logo.svg",
  "doen.png": "https://www.google.com/s2/favicons?domain=doen.nl&sz=256",
  // Implementation (IHN carousel + official sites)
  "prochange.png": `${IHN}/2023/12/logo-mustard-bg@2x-1-300x300.png`,
  "human-edge.png": `${IHN}/2023/12/Human-Edge-300x225.png`,
  "scio-network.png": `${IHN}/2024/02/SCIO-logo-full-dark-300x128.png`,
  "ansa-africa.png": `${IHN}/2023/12/ANSA-AFRICA-LOGO-2023-Normal-300x300.png`,
  "hays.png": `${IHN}/2024/02/Hays-Logo-300x102.jpg`,
  "impact-loop.png": `${IHN}/2024/02/Impact-loop-logo-300x152.png`,
  "un-live.png": `${IHN}/2023/12/UNLiveLogo-300x103.png`,
  "shared-studios.png": `${IHN}/2023/12/expo2020-shared-studios-logo-300x200.png`,
  "enviu.svg": "https://enviu.org/wp-content/uploads/Enviu-Logo-Blue.svg",
  "green-belt-movement.jpg":
    "https://www.greenbeltmovement.org/wp-content/uploads/2025/03/GBM-LOGO-e1741334373203-300x155.jpg",
  "wasafiri.png": "https://wasafiri.org/apple-touch-icon.png",
  "startup-grind.png": "https://www.google.com/s2/favicons?domain=startupgrind.com&sz=256",
  "estdev.png": "https://www.google.com/s2/favicons?domain=estdev.ee&sz=256",
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
    } else if (name === "enviu.svg") {
      await sharp(buf, { density: 300 })
        .resize(280, null)
        .png()
        .toFile(path.join(outDir, "enviu.png"))
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
