import { renderEventOpenGraphImage, eventOgAlt, eventOgContentType, eventOgTitleCardSize } from "@/lib/event-opengraph"

export const runtime = "nodejs"
export const alt = eventOgAlt
export const size = eventOgTitleCardSize
export const contentType = eventOgContentType
export const revalidate = 3600

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  return renderEventOpenGraphImage(code)
}
