import { renderEventOpenGraphImage, eventOgAlt, eventOgContentType, eventOgSize } from "@/lib/event-opengraph"

export const runtime = "nodejs"
export const alt = eventOgAlt
export const size = eventOgSize
export const contentType = eventOgContentType
export const revalidate = 3600

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return renderEventOpenGraphImage(id)
}
