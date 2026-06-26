import { prisma } from "@/lib/prisma"

export function connectionPairFilter(userIdA: string, userIdB: string) {
  return {
    OR: [
      { fromUserId: userIdA, toUserId: userIdB },
      { fromUserId: userIdB, toUserId: userIdA },
    ],
  }
}

export async function findConnectionBetween(userIdA: string, userIdB: string) {
  return prisma.connection.findFirst({
    where: connectionPairFilter(userIdA, userIdB),
  })
}
