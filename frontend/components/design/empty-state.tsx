import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md border border-border bg-card px-4 py-8 text-center md:px-6 md:py-12",
        className
      )}
    >
      {Icon ? (
        <Icon className="mb-2 h-6 w-6 text-muted-foreground/60 md:mb-3 md:h-8 md:w-8" aria-hidden />
      ) : null}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mt-0.5 max-w-sm text-xs text-muted-foreground md:mt-1 md:text-sm">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
