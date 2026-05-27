import { ImageResponse } from "next/og"

export const alt = "Impact Hub Nairobi Community Platform"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
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
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 8,
            background: "#A6192E",
            marginBottom: 28,
          }}
        >
          <span style={{ fontSize: 56, fontWeight: 700, color: "white" }}>IH</span>
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: "#171717",
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          Impact Hub Nairobi
        </div>
        <div
          style={{
            fontSize: 26,
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
