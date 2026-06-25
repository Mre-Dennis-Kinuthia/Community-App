import { cn } from "@/lib/utils"

const statusColors = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
  neutral: "bg-muted-foreground/50",
} as const

export type StatusDotVariant = keyof typeof statusColors

interface StatusDotProps {
  label: string
  variant?: StatusDotVariant
  className?: string
}

export function StatusDot({ label, variant = "neutral", className }: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
        className
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusColors[variant])}
        aria-hidden
      />
      <span>{label}</span>
    </span>
  )
}
