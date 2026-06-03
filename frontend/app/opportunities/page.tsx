import { redirect } from "next/navigation"

/** Member-facing opportunities hub (Programs tab on Resources). */
export default function OpportunitiesPage() {
  redirect("/resources?tab=programs")
}
