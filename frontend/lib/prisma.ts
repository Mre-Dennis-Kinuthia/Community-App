import { PrismaClient } from "@prisma/client";

// Only import Prisma dependencies in Node.js runtime (not Edge)
let Pool: any;
let PrismaPg: any;

if (typeof window === "undefined" && process.env.NEXT_RUNTIME !== "edge") {
  const pg = require("pg");
  const adapterPg = require("@prisma/adapter-pg");
  Pool = pg.Pool;
  PrismaPg = adapterPg.PrismaPg;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma 7 requires an adapter for direct database connections
// Only initialize in Node.js runtime (not Edge)
function createPrismaClient() {
  if (typeof window !== "undefined" || process.env.NEXT_RUNTIME === "edge") {
    // Return a mock in Edge runtime - should never be called
    throw new Error("Prisma cannot be used in Edge runtime");
  }

  const connectionString = process.env.DATABASE_URL!;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
