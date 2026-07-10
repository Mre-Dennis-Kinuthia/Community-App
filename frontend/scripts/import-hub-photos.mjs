/**
 * Imports Impact Hub Nairobi space photos into public/landing and public/hub.
 * Run: node scripts/import-hub-photos.mjs
 */
import { mkdir, copyFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.join(__dirname, "..")
const assetsDir =
  "/home/nansi/.cursor/projects/home-nansi-Work/assets"

const SRC = {
  ihn5: "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_IHN_5-64c97b5e-f710-420e-b30d-ad4f47f3a033.png",
  ihn6: "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_IHN_6-b3351eb0-2cf3-412e-bc0a-07b931b8606f.png",
  ihn7: "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_IHN_7-c3496635-dcc6-412b-82e0-44a3f947694b.png",
  ihn8: "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_IHN_8-5f64ab1c-4629-4c1d-be9b-c97f4c740208.png",
  ihn9: "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_IHN_9-82965dae-1900-4ac1-b5f2-06d9c76deae5.png",
  ihn10: "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_IHN_10-6079d73c-752d-4175-9cec-c8a4d4b245af.png",
  ihn11: "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_IHN_11-b07570e8-d9e2-4e8a-948a-06ad47132068.png",
  ihn12: "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_IHN_12-1cde4d41-0271-4d54-b143-ddb3bbbed0f5.png",
  ihn13: "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_IHN_13-ad49a1c9-d4db-4333-a368-1baa13423776.png",
  room1: "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_Room_1-c44d0218-1ddc-4a40-b486-70dfed64eb0e.png",
  room2: "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_Room_2-d32d7a70-aa00-42c1-8bc7-d54bed7b2b89.png",
  room3: "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_Room_3-b12c232d-0e2a-420d-a1d3-a4eae4f3043d.png",
  room4: "c__Users_HomePC_AppData_Roaming_Cursor_User_workspaceStorage_2a19be2fbd444bced0afbecccf4f1fcf_images_Room_4-eb93342e-8ee5-477d-a887-7f1ac6635515.png",
}

const LANDING = {
  "hero.jpg": { key: "ihn7", width: 1920 },
  "auth-panel.jpg": { key: "room1", width: 1400 },
  // Keep original IHN marketing art for most pillars; only coworking uses hub space photos.
  "pillar-coworking.jpg": { key: "room2", width: 1200 },
}

/** Original nairobi.impacthub.net marketing images for non-coworking pillars. */
const LANDING_REMOTE = {
  "pillar-programs.jpg":
    "https://nairobi.impacthub.net/wp-content/uploads/2025/07/IHN-support-1024x683.jpg",
  "pillar-innovation.jpg":
    "https://nairobi.impacthub.net/wp-content/uploads/2025/07/Global-gathering-group-photo-1024x683.jpg",
  "pillar-partnerships.jpg":
    "https://nairobi.impacthub.net/wp-content/uploads/2025/07/Partnership-1024x683.jpg",
}

const HUB = {
  "exterior-day.jpg": { key: "ihn7", width: 1600 },
  "exterior-day-alt.jpg": { key: "ihn9", width: 1600 },
  "exterior-dusk.jpg": { key: "room4", width: 1600 },
  "exterior-dusk-alt.jpg": { key: "ihn8", width: 1600 },
  "exterior-path.jpg": { key: "ihn6", width: 1600 },
  "coworking-branded.jpg": { key: "room1", width: 1400 },
  "coworking-shared.jpg": { key: "room2", width: 1400 },
  "coworking-plants.jpg": { key: "room3", width: 1400 },
  "private-office.jpg": { key: "ihn11", width: 1400 },
  "private-office-alt.jpg": { key: "ihn5", width: 1400 },
  "private-office-lamps.jpg": { key: "ihn12", width: 1400 },
  "private-office-window.jpg": { key: "ihn10", width: 1400 },
  "desk-detail.jpg": { key: "ihn13", width: 1400 },
}

async function writeJpeg(srcPath, destPath, width) {
  await sharp(srcPath)
    .rotate()
    .resize(width, null, { withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(destPath)
}

async function fetchBuffer(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
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

  for (const [filename, url] of Object.entries(LANDING_REMOTE)) {
    const buf = await fetchBuffer(url)
    await writeFile(path.join(landingDir, filename), buf)
    console.log("landing/", filename, "(original)")
  }

  for (const [filename, { key, width }] of Object.entries(HUB)) {
    const src = path.join(assetsDir, SRC[key])
    const dest = path.join(hubDir, filename)
    await writeJpeg(src, dest, width)
    console.log("hub/", filename)
  }

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
  console.log("Copied hub photos to Community-app-admin/public/hub/")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
