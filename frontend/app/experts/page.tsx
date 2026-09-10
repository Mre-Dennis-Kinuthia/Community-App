import { Suspense } from "react"
import ExpertsPageClient from "./experts-client"
import ExpertsLoading from "./loading"

export const dynamic = "force-dynamic"

export default function ExpertsPage() {
  return (
    <Suspense fallback={<ExpertsLoading />}>
      <ExpertsPageClient />
    </Suspense>
  )
}
