import type { ReactNode } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DataListProps {
  children: ReactNode
  className?: string
}

export function DataList({ children, className }: DataListProps) {
  return (
    <div
      className={cn(
        "min-w-0 max-w-full overflow-hidden rounded-md border border-border bg-card",
        className
      )}
    >
      {children}
    </div>
  )
}

interface DataListRowProps {
  href?: string
  onClick?: () => void
  children: ReactNode
  className?: string
  showChevron?: boolean
}

export function DataListRow({
  href,
  onClick,
  children,
  className,
  showChevron = true,
}: DataListRowProps) {
  const rowClass = cn(
    "group flex min-w-0 max-w-full items-center gap-2 overflow-hidden border-b border-border px-3 py-2.5 text-[13px] transition-colors last:border-b-0 md:gap-3 md:px-4 md:py-3 md:text-sm",
    "hover:bg-muted/50",
    (href || onClick) && "cursor-pointer",
    className
  )

  const content = (
    <>
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
        {children}
      </div>
      {showChevron && (href || onClick) ? (
        <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 sm:block" />
      ) : null}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={rowClass}>
        {content}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(rowClass, "w-full text-left")}>
        {content}
      </button>
    )
  }

  return <div className={rowClass}>{content}</div>
}

interface DataListMetaProps {
  children: ReactNode
  className?: string
  mono?: boolean
}

export function DataListMeta({ children, className, mono }: DataListMetaProps) {
  return (
    <span
      className={cn(
        "max-w-full truncate text-xs text-muted-foreground sm:shrink-0 sm:max-w-[9rem]",
        mono && "font-mono tabular-nums",
        className
      )}
    >
      {children}
    </span>
  )
}

interface DataListPrimaryProps {
  title: string
  subtitle?: string
  className?: string
}

export function DataListPrimary({ title, subtitle, className }: DataListPrimaryProps) {
  return (
    <div className={cn("min-w-0 w-full flex-1", className)}>
      <p className="truncate font-medium text-foreground">{title}</p>
      {subtitle ? (
        <p className="truncate text-xs text-muted-foreground sm:font-mono">{subtitle}</p>
      ) : null}
    </div>
  )
}
