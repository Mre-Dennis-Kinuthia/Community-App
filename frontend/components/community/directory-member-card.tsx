"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getImageDisplayUrl } from "@/lib/stored-image"
import { getInitials } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { CommunityMember } from "@/types/community"

type DirectoryMemberCardProps = {
  member: CommunityMember
  className?: string
  compact?: boolean
  asLink?: boolean
}

export function DirectoryMemberCard({
  member,
  className,
  compact = false,
  asLink = true,
}: DirectoryMemberCardProps) {
  const avatarUrl = getImageDisplayUrl(member.avatar || member.image)
  const initials = getInitials(member.name, member.email)

  const content = (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border-2 border-[var(--cd-green)] bg-white px-4 py-5 text-center shadow-sm transition-shadow hover:shadow-md",
        compact ? "w-[9.5rem] shrink-0" : "w-full",
        className
      )}
    >
      <Avatar className={cn("border border-[var(--cd-green)]/20", compact ? "h-16 w-16" : "h-24 w-24")}>
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={member.name || "Member"} /> : null}
        <AvatarFallback className="bg-[var(--cd-green)]/10 text-base font-semibold text-[var(--cd-green)]">
          {initials}
        </AvatarFallback>
      </Avatar>

      <h3
        className={cn(
          "mt-3 font-semibold leading-tight text-[var(--cd-green)]",
          compact ? "text-sm line-clamp-2" : "text-lg"
        )}
      >
        {member.name || "Anonymous"}
      </h3>

      {member.organization ? (
        <p className={cn("mt-1 text-[var(--cd-green)]/80", compact ? "text-[11px] line-clamp-2" : "text-sm")}>
          {member.organization}
        </p>
      ) : null}

      {member.role ? (
        <p className={cn("text-[var(--cd-green)]/65", compact ? "text-[10px] line-clamp-1" : "text-xs")}>
          {member.role}
        </p>
      ) : null}
    </div>
  )

  if (!asLink) return content

  return (
    <Link href={`/community/${member.id}`} className="block shrink-0">
      {content}
    </Link>
  )
}
