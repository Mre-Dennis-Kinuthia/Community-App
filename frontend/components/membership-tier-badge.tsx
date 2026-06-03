import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type MembershipSummary = {
  tier?: string | null
  label?: string | null
}

const TIER_STYLES: Record<string, string> = {
  community: "bg-muted text-muted-foreground",
  star_connect: "bg-primary/10 text-primary border-primary/20",
  organisational: "bg-violet-500/10 text-violet-700 border-violet-500/20 dark:text-violet-300",
}

export function MembershipTierBadge({
  membership,
  className,
}: {
  membership?: MembershipSummary | null
  className?: string
}) {
  const label = membership?.label
  const tier = membership?.tier ?? "community"
  if (!label) return null

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        TIER_STYLES[tier] ?? "",
        className
      )}
    >
      {label}
    </Badge>
  )
}
