/**
 * Imports Impact Hub Nairobi space photos into public/landing and public/hub.
 * Run: node scripts/import-hub-photos.mjs
 *
 * Workspace/booking gallery (public/hub/booking/) is left unchanged on purpose.
 */
import { mkdir, copyFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.join(__dirname, "..")
const assetsDir = "/home/nansi/.cursor/projects/home-nansi-Work/assets"

const SRC = {
  gardenLawn:
    "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_IMG-20260821-WA0013-d9f23f9e-4c16-43c0-8baf-402e8247df3a.jpg",
  soloDesk:
    "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_IMG-20260820-WA0077-31f6443e-6713-4f56-8da4-f1e2e2c9f9b2.jpg",
  receptionBranded:
    "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_IMG-20260821-WA0016-40b3f77f-a5f2-4f90-a630-90de04737a9f.jpg",
  communityTable:
    "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_Space_1-fc0d78fd-5789-40e0-9cb4-ed956dd706c1.jpg",
  gardenPatio:
    "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_IMG-20260821-WA0014-940e6d29-3fab-403f-b625-9a2572babef0.jpg",
  coworkingL:
    "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_IMG-20260820-WA0055-c8e644f3-fdb7-4db9-87b2-3ae571940185.jpg",
  outdoorBar:
    "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_IMG-20260821-WA0017-68c4dfb0-db19-487b-a9d6-f881ad133eaf.jpg",
  coworkingWindow:
    "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_IMG-20260820-WA0086-4d793699-2bd5-4c1e-8833-04c1570022d6.jpg",
  receptionGlass:
    "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_IMG-20260820-WA0092-95a7c17c-91ba-490d-9725-a7395c3b79cc.jpg",
  receptionGlassAlt:
    "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_IMG-20260820-WA0089-fb1aaa7c-cda8-4b07-8735-9a44bd227bc1.jpg",
  exteriorBuilding:
    "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_IMG-20260820-WA0097-f90633cb-e2dc-4b7c-88fb-4ff873ff463f.jpg",
}

/**
 * Landing page + auth + OG.
 * Each slot uses a distinct source so the homepage does not repeat photos.
 */
const LANDING = {
  "hero.jpg": { key: "exteriorBuilding", width: 1920 },
  "auth-panel.jpg": { key: "receptionBranded", width: 1400 },
  "pillar-programs.jpg": { key: "communityTable", width: 1200 },
  "pillar-coworking.jpg": { key: "coworkingL", width: 1200 },
  "pillar-innovation.jpg": { key: "outdoorBar", width: 1200 },
  "pillar-partnerships.jpg": { key: "receptionGlass", width: 1200 },
}

/**
 * Shared hub library. Filenames are stable so existing references keep working.
 * Avoid pairing HUB_IMAGES used on the landing page with LANDING sources:
 *   hero ≈ exterior-day
 *   auth ≈ coworking-branded
 *   pillar-programs ≈ communityTable (landing only)
 *   pillar-coworking ≈ coworking-shared
 *   pillar-innovation ≈ exterior-dusk-alt
 *   pillar-partnerships ≈ private-office-alt
 */
const HUB = {
  "exterior-day.jpg": { key: "exteriorBuilding", width: 1600 },
  "exterior-day-alt.jpg": { key: "gardenLawn", width: 1600 },
  "exterior-dusk.jpg": { key: "gardenPatio", width: 1600 },
  "exterior-dusk-alt.jpg": { key: "outdoorBar", width: 1600 },
  "exterior-path.jpg": { key: "gardenPatio", width: 1600 },
  "coworking-branded.jpg": { key: "receptionBranded", width: 1400 },
  "coworking-shared.jpg": { key: "coworkingL", width: 1400 },
  "coworking-plants.jpg": { key: "coworkingWindow", width: 1400 },
  "private-office.jpg": { key: "soloDesk", width: 1400 },
  "private-office-alt.jpg": { key: "receptionGlass", width: 1400 },
  "private-office-lamps.jpg": { key: "receptionGlassAlt", width: 1400 },
  "private-office-window.jpg": { key: "receptionGlassAlt", width: 1400 },
  "desk-detail.jpg": { key: "soloDesk", width: 1400 },
}

async function writeJpeg(srcPath, destPath, width) {
  await sharp(srcPath)
    .rotate()
    .resize(width, null, { withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(destPath)
}

async function main() {
  const landingDir = path.join(frontendRoot, "public", "landing")
  const hubDir = path.join(frontendRoot, "public", "hub")
  await mkdir(landingDir, { recursive: true })
  await mkdir(hubDir, { recursive: true })

  for (const [filename, { key, width }] of Object.entries(LANDING)) {
    const src = path.join(assetsDir, SRC[key])
    const dest = path.join(landingDir, filename)
    await writeJpeg(src, dest, width)
    console.log("landing/", filename)
  }

  for (const [filename, { key, width }] of Object.entries(HUB)) {
    const src = path.join(assetsDir, SRC[key])
    const dest = path.join(hubDir, filename)
    await writeJpeg(src, dest, width)
    console.log("hub/", filename)
  }

  console.log("Skipped hub/booking/ (workspace gallery left unchanged)")

  const adminHub = path.join(
    frontendRoot,
    "..",
    "..",
    "Community-app-admin",
    "public",
    "hub"
  )
  await mkdir(adminHub, { recursive: true })
  for (const filename of Object.keys(HUB)) {
    await copyFile(path.join(hubDir, filename), path.join(adminHub, filename))
  }
  console.log("Copied hub photos to Community-app-admin/public/hub/ (booking skipped)")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
