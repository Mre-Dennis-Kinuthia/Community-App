import type { Metadata } from "next"
import { buildEventShareMetadata } from "@/lib/event-metadata"

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params
  return buildEventShareMetadata(id)
}

export default function EventDetailLayout({ children }: LayoutProps) {
  return children
}
