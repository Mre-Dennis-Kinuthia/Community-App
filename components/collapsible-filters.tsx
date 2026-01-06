"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CollapsibleFiltersProps {
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function CollapsibleFilters({ children, defaultOpen = false, className }: CollapsibleFiltersProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn("space-y-4", className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full md:hidden justify-between"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>
      <div className={cn(
        "space-y-4 transition-all",
        !isOpen && "hidden md:block",
        isOpen && "block"
      )}>
        {children}
      </div>
    </div>
  )
}

