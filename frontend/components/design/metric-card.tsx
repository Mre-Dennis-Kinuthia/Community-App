import type { ReactNode } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string
  value: string | number
  description?: string
  icon?: LucideIcon
  href?: string
  className?: string
  highlight?: boolean
}

export function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  href,
  className,
  highlight,
}: MetricCardProps) {
  const content = (
    <div
      className={cn(
        "rounded-md border border-border bg-card px-4 py-4 transition-colors",
        href && "hover:bg-muted/50",
        highlight && "border-primary/30",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden /> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
        {value}
      </p>
      {description ? (
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block min-w-0">
        {content}
      </Link>
    )
  }

  return content
}

export function MetricCardGrid({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>{children}</div>
  )
}
