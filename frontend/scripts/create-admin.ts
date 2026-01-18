import "dotenv/config"
import { prisma } from "../lib/prisma"
import { hashPassword } from "../lib/auth-utils"

/**
 * Script to create an admin user
 * Usage: tsx scripts/create-admin.ts <email> <password> <role>
 * Example: tsx scripts/create-admin.ts admin@impacthub.co.ke password123 super_admin
 */

async function main() {
  const email = process.argv[2]
  const password = process.argv[3]
  const role = process.argv[4] || "super_admin"

  if (!email || !password) {
    console.error("Usage: tsx scripts/create-admin.ts <email> <password> [role]")
    console.error("Example: tsx scripts/create-admin.ts admin@impacthub.co.ke password123 super_admin")
    process.exit(1)
  }

  const validRoles = ["super_admin", "content_manager", "community_manager", "programs_manager", "finance_ops"]
  if (!validRoles.includes(role)) {
    console.error(`Invalid role. Must be one of: ${validRoles.join(", ")}`)
    process.exit(1)
  }

  try {
    const normalizedEmail = email.toLowerCase().trim()
    const hashedPassword = await hashPassword(password)

    // Check if admin already exists
    const existing = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      console.log(`Admin user ${normalizedEmail} already exists. Updating...`)
      const updated = await prisma.adminUser.update({
        where: { email: normalizedEmail },
        data: {
          password: hashedPassword,
          role: role as any,
        },
      })
      console.log(`✅ Admin user updated:`)
      console.log(`   Email: ${updated.email}`)
      console.log(`   Role: ${updated.role}`)
    } else {
      const admin = await prisma.adminUser.create({
        data: {
          email: normalizedEmail,
          name: email.split("@")[0], // Use email prefix as name
          password: hashedPassword,
          role: role as any,
        },
      })
      console.log(`✅ Admin user created:`)
      console.log(`   ID: ${admin.id}`)
      console.log(`   Email: ${admin.email}`)
      console.log(`   Role: ${admin.role}`)
      console.log(`   Created: ${admin.createdAt}`)
    }
  } catch (error) {
    console.error("Error creating admin user:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
