export interface BookingAddOnCatalogItem {
  id: string
  name: string
  price: number
  pricingModel?: "per_pax"
}

/** Labels for add-on IDs stored on `WorkspaceBooking.addOns`. */
export const BOOKING_ADD_ON_CATALOG: BookingAddOnCatalogItem[] = [
  {
    id: "beverages",
    name: "Tea, coffee, milk & water",
    price: 0,
  },
  {
    id: "whiteboard",
    name: "Whiteboard",
    price: 0,
  },
  {
    id: "parking",
    name: "Parking",
    price: 0,
  },
  {
    id: "pastries",
    name: "Pastries",
    price: 400,
    pricingModel: "per_pax",
  },
]

const catalogById = new Map(BOOKING_ADD_ON_CATALOG.map((item) => [item.id, item]))

export function inferPastriesPax(addOns: string[], addOnsPrice: number): number | undefined {
  if (!addOns.includes("pastries") || addOnsPrice <= 0) return undefined
  const pastries = catalogById.get("pastries")
  if (!pastries?.price) return undefined
  const pax = Math.round(addOnsPrice / pastries.price)
  return pax >= 1 ? pax : undefined
}

export interface ResolvedBookingAddOn {
  id: string
  name: string
  lineTotal: number
  detail?: string
}

export function resolveBookingAddOns(input: {
  addOnIds: string[]
  addOnsPrice?: number
  pastriesPax?: number
}): ResolvedBookingAddOn[] {
  const addOnIds = input.addOnIds.filter(Boolean)
  if (addOnIds.length === 0) return []

  const pastriesPax =
    input.pastriesPax ?? inferPastriesPax(addOnIds, input.addOnsPrice ?? 0)

  return addOnIds.map((id) => {
    const item = catalogById.get(id)
    const name = item?.name ?? id.replace(/-/g, " ")
    if (id === "pastries" && item?.pricingModel === "per_pax") {
      const pax = Math.max(1, pastriesPax ?? 1)
      const lineTotal = item.price * pax
      return {
        id,
        name,
        lineTotal,
        detail: `${pax} PAX`,
      }
    }
    const lineTotal = item?.price ?? 0
    return {
      id,
      name,
      lineTotal,
      detail: lineTotal === 0 ? "Included" : undefined,
    }
  })
}

export function formatBookingAddOnsPlainText(input: {
  addOnIds: string[]
  addOnsPrice?: number
  pastriesPax?: number
}): string {
  const items = resolveBookingAddOns(input)
  if (items.length === 0) return "None"
  return items
    .map((item) => {
      const price =
        item.lineTotal === 0
          ? "Included"
          : `KES ${item.lineTotal.toLocaleString("en-KE")}`
      return item.detail ? `${item.name} (${item.detail}) — ${price}` : `${item.name} — ${price}`
    })
    .join("\n")
}

export function formatBookingAddOnsHtml(input: {
  addOnIds: string[]
  addOnsPrice?: number
  pastriesPax?: number
}): string {
  const items = resolveBookingAddOns(input)
  if (items.length === 0) {
    return "<p><strong>Add-ons:</strong> None</p>"
  }
  const lines = items
    .map((item) => {
      const price =
        item.lineTotal === 0
          ? "Included"
          : `KES ${item.lineTotal.toLocaleString("en-KE")}`
      const label = item.detail ? `${item.name} (${item.detail})` : item.name
      return `<li>${label} — ${price}</li>`
    })
    .join("")
  return `<p><strong>Add-ons:</strong></p><ul style="margin:8px 0;padding-left:20px;">${lines}</ul>`
}
