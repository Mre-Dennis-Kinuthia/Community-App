#!/usr/bin/env tsx
import { config } from "dotenv"
import { prisma } from "../lib/prisma"

// Load environment variables
config({ path: ".env.local" })
config({ path: ".env" })

async function checkUsers() {
  try {
    console.log("🔍 Checking users in database...\n")

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        // Don't show password hash
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    console.log(`✅ Found ${users.length} user(s) in database:\n`)

    if (users.length === 0) {
      console.log("   No users found. Register a new user to see it here.")
      return
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || "No name"}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Created: ${user.createdAt.toLocaleString()}`)
      console.log(`   Email Verified: ${user.emailVerified ? "Yes" : "No"}`)
      console.log("")
    })

    // Also check related tables
    const accounts = await prisma.account.count()
    const sessions = await prisma.session.count()
    const profiles = await prisma.memberProfile.count()

    console.log("📊 Related data:")
    console.log(`   Accounts: ${accounts}`)
    console.log(`   Sessions: ${sessions}`)
    console.log(`   Member Profiles: ${profiles}`)
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
