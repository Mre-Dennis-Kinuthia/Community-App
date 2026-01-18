#!/usr/bin/env tsx
/**
 * Sync Prisma schema from Community App to Admin App
 * 
 * This script copies the Prisma schema from Community-App/frontend/prisma/schema.prisma
 * to Community-app-admin/prisma/schema.prisma to keep them in sync.
 * 
 * Usage:
 *   npm run db:sync-schema
 *   npm run db:sync-schema:watch  (watch mode for development)
 */

import { readFileSync, writeFileSync, watch } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Paths relative to this script's location
const COMMUNITY_APP_ROOT = resolve(__dirname, "../")
const ADMIN_APP_ROOT = resolve(__dirname, "../../../Community-app-admin")

const SOURCE_SCHEMA = resolve(COMMUNITY_APP_ROOT, "prisma/schema.prisma")
const TARGET_SCHEMA = resolve(ADMIN_APP_ROOT, "prisma/schema.prisma")

function syncSchema() {
  try {
    // Check if source schema exists
    const fs = require("fs")
    if (!fs.existsSync(SOURCE_SCHEMA)) {
      console.error("❌ [PRISMA SYNC] Source schema not found!")
      console.error(`   Source: ${SOURCE_SCHEMA}`)
      return false
    }

    // Check if target directory exists, create if not
    const targetDir = dirname(TARGET_SCHEMA)
    if (!fs.existsSync(targetDir)) {
      console.log("[PRISMA SYNC] Creating target directory:", targetDir)
      fs.mkdirSync(targetDir, { recursive: true })
    }

    console.log("[PRISMA SYNC] Reading schema from:", SOURCE_SCHEMA)
    const schemaContent = readFileSync(SOURCE_SCHEMA, "utf-8")
    
    console.log("[PRISMA SYNC] Writing schema to:", TARGET_SCHEMA)
    writeFileSync(TARGET_SCHEMA, schemaContent, "utf-8")
    
    console.log("✅ [PRISMA SYNC] Schema synced successfully!")
    console.log(`   Source: ${SOURCE_SCHEMA}`)
    console.log(`   Target: ${TARGET_SCHEMA}`)
    
    return true
  } catch (error) {
    console.error("❌ [PRISMA SYNC] Error syncing schema:", error)
    if (error instanceof Error) {
      if (error.message.includes("ENOENT")) {
        console.error("   Make sure both schema files exist:")
        console.error(`   - Source: ${SOURCE_SCHEMA}`)
        console.error(`   - Target directory: ${dirname(TARGET_SCHEMA)}`)
      }
    }
    return false
  }
}

// Main execution
const isWatchMode = process.argv.includes("--watch") || process.argv.includes("-w")

if (isWatchMode) {
  console.log("👀 [PRISMA SYNC] Watch mode enabled. Monitoring for changes...")
  console.log(`   Watching: ${SOURCE_SCHEMA}`)
  
  // Initial sync
  syncSchema()
  
  // Watch for changes
  watch(SOURCE_SCHEMA, { persistent: true }, (eventType) => {
    if (eventType === "change") {
      console.log("\n📝 [PRISMA SYNC] Schema file changed, syncing...")
      syncSchema()
    }
  })
  
  console.log("\n💡 [PRISMA SYNC] Press Ctrl+C to stop watching")
} else {
  // One-time sync
  const success = syncSchema()
  process.exit(success ? 0 : 1)
}
