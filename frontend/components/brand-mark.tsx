import { cn } from "@/lib/utils"

type BrandMarkProps = {
  size?: number
  className?: string
}

/** Impact Hub Nairobi mark — brand red tile with hub network symbol */
export function BrandMark({ size = 36, className }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <rect width="48" height="48" rx="12" fill="#A6192E" />
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
  )
}
