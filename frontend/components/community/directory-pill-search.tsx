"use client"

import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

type DirectoryPillSearchProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function DirectoryPillSearch({
  value,
  onChange,
  placeholder = "All contacts",
  className,
}: DirectoryPillSearchProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--cd-green)]" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-full border-2 border-[var(--cd-green)] bg-white pl-12 pr-11 text-sm text-[var(--cd-green)] placeholder:text-[var(--cd-green)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--cd-green)]/25"
      />
      {value.length > 0 ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--cd-green)]/60 hover:bg-[var(--cd-green)]/5 hover:text-[var(--cd-green)]"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  )
}
