import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export const alt = "Impact Hub Nairobi — For Impact Startups & Innovators"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

async function readDataUrl(relativePath: string, mime: string): Promise<string | null> {
  try {
    const buffer = await readFile(join(process.cwd(), "public", relativePath))
    return `data:${mime};base64,${buffer.toString("base64")}`
  } catch {
    return null
  }
}

export default async function Image() {
  const [heroSrc, logoSrc] = await Promise.all([
    readDataUrl("landing/hero.jpg", "image/jpeg"),
    readDataUrl("brand/impact-hub-nairobi-logo.png", "image/png"),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
          overflow: "hidden",
          background: "#1c395c",
        }}
      >
        {heroSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroSrc}
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
              "linear-gradient(to top, rgba(10,31,56,0.95) 0%, rgba(28,57,92,0.75) 45%, rgba(28,57,92,0.35) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            padding: "56px 64px",
            gap: 20,
          }}
        >
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoSrc}
              alt=""
              width={360}
              height={162}
              style={{ objectFit: "contain", objectPosition: "left" }}
            />
          ) : (
            <div style={{ fontSize: 40, fontWeight: 700, color: "#ffffff" }}>
              Impact Hub Nairobi
            </div>
          )}
          <div style={{ fontSize: 44, fontWeight: 700, color: "#ffffff", lineHeight: 1.15, maxWidth: 900 }}>
            For Impact Startups &amp; Innovators
          </div>
          <div style={{ fontSize: 24, color: "rgba(255,255,255,0.88)", maxWidth: 820, lineHeight: 1.4 }}>
            Member platform — workspace, events, programs, and community
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 8,
              fontSize: 18,
              color: "#ffd546",
              fontWeight: 600,
            }}
          >
            Inclusive and sustainable innovation at scale
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
