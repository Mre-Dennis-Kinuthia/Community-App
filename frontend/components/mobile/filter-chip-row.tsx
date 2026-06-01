"use client"

import { cn } from "@/lib/utils"

interface FilterChipRowProps {
  children: React.ReactNode
  className?: string
}

/** Horizontally scrollable chip row — keeps filters off the vertical stack on mobile. */
export function FilterChipRow({ children, className }: FilterChipRowProps) {
  return (
    <div
      className={cn(
        "-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {children}
    </div>
  )
}
