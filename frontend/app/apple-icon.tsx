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
          background: "#A6192E",
          borderRadius: 40,
        }}
      >
        <svg width="120" height="120" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="4.25" fill="white" />
          <circle cx="24" cy="11.5" r="2.75" fill="white" />
          <circle cx="13.5" cy="33.5" r="2.75" fill="white" />
          <circle cx="34.5" cy="33.5" r="2.75" fill="white" />
          <path
            d="M24 14.25V19.75M16.1 31.35L20.4 26.65M31.9 31.35L27.6 26.65"
            stroke="white"
            strokeWidth="2.25"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}
