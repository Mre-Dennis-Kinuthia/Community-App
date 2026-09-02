import { ImageResponse } from "next/og"
import sharp from "sharp"
import { prisma } from "@/lib/prisma"
import { getAppBaseUrl } from "@/lib/app-url"
import { findEventByPublicParam } from "@/lib/event-slug"
import { parseStoredImageId } from "@/lib/stored-image"
import { getStoredImageBytes } from "@/lib/stored-image-server"
import { eventTimezone, formatEventDate, formatEventTime } from "@/lib/event-datetime"

/** Standard link-preview size (WhatsApp, Slack, LinkedIn). */
export const eventOgSize = { width: 1200, height: 630 }
export const eventOgContentType = "image/jpeg"
export const eventOgAlt = "Impact Hub Nairobi event"

const OG_CANVAS = { r: 10, g: 31, b: 56, alpha: 1 as const }

function toBuffer(data: Buffer | Uint8Array): Buffer {
  return Buffer.isBuffer(data) ? data : Buffer.from(data)
}

function imageResponse(body: Buffer, contentType: string) {
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  })
}

async function fetchImageBytes(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, { redirect: "follow" })
    if (!res.ok) return null
    const bytes = toBuffer(new Uint8Array(await res.arrayBuffer()))
    return bytes.length > 0 ? bytes : null
  } catch {
    return null
  }
}

async function loadEventFlyerBuffer(imageUrl: string | null | undefined): Promise<Buffer | null> {
  const storedId = parseStoredImageId(imageUrl)

  if (storedId) {
    const image = await getStoredImageBytes(storedId)
    if (image?.data && image.data.length > 0) {
      return toBuffer(image.data)
    }
    return fetchImageBytes(`${getAppBaseUrl()}/api/images/${storedId}`)
  }

  if (imageUrl && /^https?:\/\//i.test(imageUrl)) {
    return fetchImageBytes(imageUrl)
  }

  if (imageUrl?.startsWith("/")) {
    return fetchImageBytes(`${getAppBaseUrl()}${imageUrl}`)
  }

  return null
}

async function flyerToOgJpeg(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize(eventOgSize.width, eventOgSize.height, {
      fit: "contain",
      background: OG_CANVAS,
    })
    .flatten({ background: { r: OG_CANVAS.r, g: OG_CANVAS.g, b: OG_CANVAS.b } })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer()
}

function renderTitleCard(title: string, when: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          fontFamily: "system-ui, sans-serif",
          overflow: "hidden",
          background: "#0a1f38",
        }}
      >
        <div
          style={{
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

export async function renderEventOpenGraphImage(param: string) {
  const event = await findEventByPublicParam(prisma, param)
  const flyer = await loadEventFlyerBuffer(event?.imageUrl)

  if (flyer) {
    try {
      return imageResponse(await flyerToOgJpeg(flyer), eventOgContentType)
    } catch (error) {
      console.error("[event-og] flyer resize failed, serving original bytes", error)
      return imageResponse(flyer, "image/png")
    }
  }

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

  const png = await renderTitleCard(title, when)
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer()))
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer()
  return imageResponse(jpeg, eventOgContentType)
}
