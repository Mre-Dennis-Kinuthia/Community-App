import { Suspense } from "react"
import PartnersPageClient from "./partners-client"

export const dynamic = 'force-dynamic'

export default function PartnersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PartnersPageClient />
    </Suspense>
  )
}
