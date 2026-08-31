import { Prisma, type PrismaClient } from "@prisma/client"
import {
  WORKSPACE_PRICING_CATEGORIES,
  catalogPlanSeed,
  legacyPricingCategoryIdForPlanName,
} from "@/lib/workspace-pricing"

/** Create or refresh Finance plans so they match published price categories. */
export async function ensureCatalogMembershipPlans(prisma: PrismaClient) {
  const existing = await prisma.plan.findMany({
    select: { id: true, name: true, pricingCategoryId: true },
  })
  const claimed = new Set<string>()

  for (const category of WORKSPACE_PRICING_CATEGORIES) {
    const seed = catalogPlanSeed(category)
    let plan =
      existing.find((p) => p.pricingCategoryId === category.id && !claimed.has(p.id)) ??
      existing.find((p) => {
        if (claimed.has(p.id) || p.pricingCategoryId) return false
        return legacyPricingCategoryIdForPlanName(p.name) === category.id
      })

    const data = {
      name: seed.name,
      description: seed.description,
      price: new Prisma.Decimal(seed.price),
      currency: "KES",
      interval: seed.interval,
      features: seed.features,
      isActive: true,
      pricingCategoryId: seed.pricingCategoryId,
    }

    if (plan) {
      claimed.add(plan.id)
      await prisma.plan.update({ where: { id: plan.id }, data })
    } else {
      const created = await prisma.plan.create({ data })
      claimed.add(created.id)
      existing.push({
        id: created.id,
        name: seed.name,
        pricingCategoryId: seed.pricingCategoryId,
      })
    }
  }
}
