import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#802B2B",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            color: "white",
            fontFamily: "Arial, sans-serif",
            lineHeight: 1,
            paddingLeft: 18,
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 400, letterSpacing: "0.02em" }}>IMPACT</span>
          <span style={{ fontSize: 52, fontWeight: 700, marginTop: 6 }}>HUB</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
