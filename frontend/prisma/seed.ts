import { config } from "dotenv"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { hashPassword } from "../lib/auth-utils"

// Load environment variables FIRST before importing Prisma
config({ path: ".env.local" })
config({ path: ".env" })

// Prisma 7 requires an adapter for direct database connections
const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding database...")

  // Create a test user
  const testEmail = "demo@impacthub.co.ke"
  const testPassword = "password123"

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: testEmail },
  })

  if (existingUser) {
    console.log("✅ Test user already exists:", testEmail)
    return
  }

  // Create test user
  const hashedPassword = await hashPassword(testPassword)
  const user = await prisma.user.create({
    data: {
      email: testEmail,
      name: "Demo User",
      password: hashedPassword,
    },
  })

  console.log("✅ Created test user:", user.email)
  console.log("   Email:", testEmail)
  console.log("   Password:", testPassword)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
