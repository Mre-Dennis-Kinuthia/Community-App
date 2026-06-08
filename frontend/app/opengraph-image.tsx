import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export const alt = "Impact Hub Nairobi Community Platform"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  const logoPath = join(process.cwd(), "public", "brand", "impact-hub-nairobi-logo.png")
  let logoSrc: string | null = null
  try {
    const logoBuffer = await readFile(logoPath)
    logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`
  } catch {
    logoSrc = null
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafa",
          fontFamily: "system-ui, sans-serif",
          padding: 48,
        }}
      >
        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoSrc}
            alt=""
            width={420}
            height={190}
            style={{ marginBottom: 28, objectFit: "contain" }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 120,
              height: 120,
              background: "#802B2B",
              marginBottom: 28,
              color: "white",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            IH
          </div>
        )}
        <div
          style={{
            fontSize: 28,
            color: "#525252",
            textAlign: "center",
            maxWidth: 720,
          }}
        >
          Member platform — workspace, events, and community
        </div>
      </div>
    ),
    { ...size }
  )
}
