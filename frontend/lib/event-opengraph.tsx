import { ImageResponse } from "next/og"
import { prisma } from "@/lib/prisma"
import { findEventByPublicParam } from "@/lib/event-slug"
import { parseStoredImageId } from "@/lib/stored-image"
import { getStoredImageBytes } from "@/lib/stored-image-server"
import { eventTimezone, formatEventDate, formatEventTime } from "@/lib/event-datetime"

export const eventOgSize = { width: 1200, height: 630 }
export const eventOgContentType = "image/png"
export const eventOgAlt = "Impact Hub Nairobi event"

function toDataUrl(bytes: Buffer | Uint8Array, mimeType: string): string {
  const buffer = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes)
  return `data:${mimeType};base64,${buffer.toString("base64")}`
}

export async function renderEventOpenGraphImage(param: string) {
  const event = await findEventByPublicParam(prisma, param)
  const title = event?.title?.trim() || "Impact Hub Nairobi Event"
  const tz = eventTimezone(event?.timezone)
  const when = event?.startDate
    ? `${formatEventDate(event.startDate, tz, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: undefined,
      })} · ${formatEventTime(event.startDate, tz)}`
    : "Impact Hub Nairobi"

  let coverSrc: string | null = null
  const storedId = parseStoredImageId(event?.imageUrl)
  if (storedId) {
    const image = await getStoredImageBytes(storedId)
    const bytes = image?.data
    if (image && bytes && bytes.length > 0 && bytes.length < 1_500_000) {
      coverSrc = toDataUrl(bytes, image.mimeType)
    }
  } else if (event?.imageUrl && /^https?:\/\//i.test(event.imageUrl)) {
    coverSrc = event.imageUrl
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
          overflow: "hidden",
          background: "#0a1f38",
        }}
      >
        {coverSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverSrc}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(10,31,56,0.96) 0%, rgba(10,31,56,0.55) 48%, rgba(10,31,56,0.2) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "56px 64px",
            gap: 16,
            width: "100%",
            height: "100%",
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#ffd546",
            }}
          >
            Impact Hub Nairobi
          </div>
          <div
            style={{
              fontSize: title.length > 70 ? 42 : 52,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.15,
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 24, color: "rgba(255,255,255,0.88)" }}>{when}</div>
        </div>
      </div>
    ),
    { ...eventOgSize }
  )
}
