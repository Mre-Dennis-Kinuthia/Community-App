import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FilterBarProps {
  children: ReactNode
  className?: string
}

export function FilterBar({ children, className }: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center",
        className
      )}
    >
      {children}
    </div>
  )
}

interface FilterBarItemProps {
  children: ReactNode
  className?: string
}

export function FilterBarItem({ children, className }: FilterBarItemProps) {
  return (
    <div className={cn("w-full min-w-0 sm:w-auto sm:min-w-[140px]", className)}>
      {children}
    </div>
  )
}

export function FilterBarSearch({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type="search"
      className={cn(
        "border-input placeholder:text-muted-foreground h-9 w-full min-w-0 rounded-md border bg-background px-3 text-sm outline-none transition-colors",
        "focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px]",
        className
      )}
      {...props}
    />
  )
}
