import type { Metadata } from "next"
import ProgramsPageClient from "./programs-client"

export const metadata: Metadata = {
  title: "Programs & Initiatives | Impact Hub Nairobi",
  description:
    "Explore Impact Hub Nairobi programmes and initiatives — including Advancing Agricultural Circularity (AAC), climate acceleration, and thematic venture support.",
}

export default function ProgramsPage() {
  return <ProgramsPageClient />
}
