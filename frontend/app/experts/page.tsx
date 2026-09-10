import { Suspense } from "react"
import ExpertsPageClient from "./experts-client"

export const dynamic = "force-dynamic"

export default function ExpertsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExpertsPageClient />
    </Suspense>
  )
}
