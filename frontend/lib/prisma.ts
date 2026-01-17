import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if we're in a build phase (DATABASE_URL not available during static analysis)
// During Vercel build, DATABASE_URL might not be set until runtime
const isBuildTime = !process.env.DATABASE_URL;

// Prisma 7 requires an adapter for direct database connections
function createPrismaClient(): PrismaClient {
  if (typeof window !== "undefined" || process.env.NEXT_RUNTIME === "edge") {
    throw new Error("Prisma cannot be used in Edge runtime");
  }

  const connectionString = process.env.DATABASE_URL;
  
  // During build, if DATABASE_URL is missing, create a placeholder that won't break imports
  if (!connectionString) {
    if (isBuildTime) {
      // Return a proxy that satisfies static analysis but throws if actually used
      return new Proxy({} as PrismaClient, {
        get(_target, prop) {
          if (prop === "then" || typeof prop === "symbol") {
            return undefined;
          }
          // Return a no-op function for any method call during build
          return () => {
            // This should never execute during build, but if it does, provide helpful error
            throw new Error(
              `Prisma Client is not available during build. ` +
              `Operation '${String(prop)}' requires DATABASE_URL to be set at runtime.`
            );
          };
        },
      }) as PrismaClient;
    }
    throw new Error("DATABASE_URL is not set");
  }

  // Lazy load dependencies only when actually creating the client
  const { Pool } = require("pg");
  const { PrismaPg } = require("@prisma/adapter-pg");

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

// Create or get cached Prisma client
export const prisma = (() => {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const client = createPrismaClient();
  
  if (process.env.NODE_ENV !== "production" && !isBuildTime) {
    globalForPrisma.prisma = client;
  }
  
  return client;
})();
