"use client"

import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react"
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type SidebarNavTooltipProps = {
  label: string
  group?: string
  children: ReactElement
}

/** Rich hover label for icon-only collapsed sidebar links. */
export function SidebarNavTooltip({ label, group, children }: SidebarNavTooltipProps) {
  const ariaLabel = group ? `${label} (${group})` : label
  const trigger = isValidElement(children)
    ? cloneElement(children, {
        "aria-label": ariaLabel,
        title: undefined,
      } as Record<string, unknown>)
    : children

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        sideOffset={10}
        collisionPadding={12}
        className={cn(
          "z-[100] max-w-[220px] rounded-md border border-border bg-popover px-3 py-2 shadow-md",
          "animate-in fade-in-0 duration-150",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-100",
          "data-[side=right]:slide-in-from-left-1"
        )}
      >
        <TooltipArrow className="fill-popover" width={10} height={5} />
        {group ? (
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground leading-none">
            {group}
          </p>
        ) : null}
        <p className={cn("text-sm font-medium leading-snug text-popover-foreground", group && "mt-1")}>
          {label}
        </p>
      </TooltipContent>
    </Tooltip>
  )
}
