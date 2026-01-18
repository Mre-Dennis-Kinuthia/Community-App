import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders } from "@/middleware-cors"

/**
 * Middleware for admin API routes
 * - Checks authentication
 * - Verifies admin user
 * - Checks role-based permissions
 */

export async function requireAdmin(request: NextRequest) {
  try {
    // Get session
    const session = await auth()
    
    if (!session?.user?.id) {
      return {
        error: NextResponse.json(
          { error: "Unauthorized" },
          { 
            status: 401,
            headers: corsHeaders(request),
          }
        ),
        admin: null,
      }
    }

    // Check if user is an admin
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: session.user.email?.toLowerCase() },
    })

    if (!adminUser) {
      return {
        error: NextResponse.json(
          { error: "Forbidden: Admin access required" },
          { 
            status: 403,
            headers: corsHeaders(request),
          }
        ),
        admin: null,
      }
    }

    return {
      error: null,
      admin: adminUser,
    }
  } catch (error) {
    console.error("[ADMIN MIDDLEWARE] Error:", error)
    return {
      error: NextResponse.json(
        { error: "Internal server error" },
        { 
          status: 500,
          headers: corsHeaders(request),
        }
      ),
      admin: null,
    }
  }
}

/**
 * Check if admin has required role/permission
 */
export function hasPermission(
  adminRole: string,
  requiredRole: string | string[]
): boolean {
  const roles = ["super_admin", "content_manager", "community_manager", "programs_manager", "finance_ops"]
  const roleHierarchy: Record<string, number> = {
    super_admin: 5,
    content_manager: 4,
    community_manager: 3,
    programs_manager: 2,
    finance_ops: 1,
  }

  const adminLevel = roleHierarchy[adminRole] || 0
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  
  // Super admin has access to everything
  if (adminRole === "super_admin") return true

  // Check if admin role matches any required role
  return requiredRoles.some((role) => {
    const requiredLevel = roleHierarchy[role] || 0
    return adminLevel >= requiredLevel
  })
}
