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
        "overflow-hidden rounded-md border border-border bg-card",
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
    "group flex min-w-0 items-center gap-3 border-b border-border px-4 py-3 text-sm transition-colors last:border-b-0",
    "hover:bg-muted/50",
    (href || onClick) && "cursor-pointer",
    className
  )

  const content = (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-3">{children}</div>
      {showChevron && (href || onClick) ? (
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
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
        "shrink-0 text-xs text-muted-foreground",
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
    <div className={cn("min-w-0 flex-1", className)}>
      <p className="truncate font-medium text-foreground">{title}</p>
      {subtitle ? (
        <p className="truncate font-mono text-xs text-muted-foreground">{subtitle}</p>
      ) : null}
    </div>
  )
}
