"use client"

import { Badge } from "@/components/ui/badge"
import {
  getPartnerTypeIcon,
  PARTNER_CATEGORY_STYLES,
  PARTNER_TYPE_STYLES,
} from "@/lib/partner-utils"
import { cn } from "@/lib/utils"

type PartnerBadgesProps = {
  type: string
  category?: string | null
  locationType?: string | null
  featured?: boolean
  className?: string
}

export function PartnerBadges({
  type,
  category,
  locationType,
  featured = false,
  className,
}: PartnerBadgesProps) {
  const TypeIcon = getPartnerTypeIcon(type)

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <Badge className={PARTNER_TYPE_STYLES[type] ?? PARTNER_TYPE_STYLES.Partner}>
        <TypeIcon className="mr-1 h-3 w-3" />
        {type}
      </Badge>
      {category ? (
        <Badge className={PARTNER_CATEGORY_STYLES[category] ?? PARTNER_CATEGORY_STYLES.Ecosystem}>
          {category}
        </Badge>
      ) : null}
      {locationType ? <Badge variant="outline">{locationType}</Badge> : null}
      {featured ? <Badge variant="secondary">Featured</Badge> : null}
    </div>
  )
}
