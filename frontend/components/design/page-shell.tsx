import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageShellProps {
  title: string
  description?: string
  actions?: ReactNode
  filters?: ReactNode
  back?: ReactNode
  children?: ReactNode
  className?: string
}

export function PageShell({
  title,
  description,
  actions,
  filters,
  back,
  children,
  className,
}: PageShellProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {back ? <div>{back}</div> : null}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:shrink-0 lg:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
      {filters ? <div>{filters}</div> : null}
      {children}
    </div>
  )
}
