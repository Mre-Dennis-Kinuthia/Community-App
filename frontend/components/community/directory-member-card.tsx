"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getImageDisplayUrl } from "@/lib/stored-image"
import { cn, getInitials } from "@/lib/utils"
import type { CommunityMember } from "@/types/community"

type DirectoryMemberCardProps = {
  member: CommunityMember
  className?: string
  asLink?: boolean
  /** Fixed width for horizontal carousels; grid layouts omit this. */
  carousel?: boolean
}

export function DirectoryMemberCard({
  member,
  className,
  asLink = true,
  carousel = false,
}: DirectoryMemberCardProps) {
  const avatarUrl = getImageDisplayUrl(member.avatar || member.image)
  const initials = getInitials(member.name, member.email)

  const content = (
    <div
      className={cn(
        "flex h-[10.5rem] flex-col items-center rounded-xl border border-border bg-card px-3 py-3 text-center transition-colors hover:border-primary/40 hover:bg-muted/20 md:h-[11.5rem] md:py-4",
        carousel ? "w-[9.5rem]" : "w-full",
        className
      )}
    >
        <Avatar className="h-14 w-14 shrink-0 md:h-16 md:w-16">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={member.name || "Member"} /> : null}
        <AvatarFallback className="text-sm font-medium">{initials}</AvatarFallback>
      </Avatar>

      <div className="mt-3 flex w-full flex-1 flex-col items-center">
        <h3 className="line-clamp-2 min-h-[2.25rem] w-full text-xs font-semibold leading-tight text-foreground md:text-sm md:min-h-[2.5rem]">
          {member.name || "Anonymous"}
        </h3>
        <p className="mt-1 line-clamp-1 w-full min-h-[0.875rem] text-[10px] text-muted-foreground md:text-xs md:min-h-[1rem]">
          {member.organization || "\u00A0"}
        </p>
        <p className="line-clamp-1 w-full min-h-[0.875rem] text-[10px] text-muted-foreground/80 md:min-h-[1rem]">
          {member.role || "\u00A0"}
        </p>
      </div>
    </div>
  )

  if (!asLink) return content

  return (
    <Link
      href={`/community/${member.id}`}
      className={cn("block shrink-0", carousel ? "w-[9.5rem]" : "w-full")}
    >
      {content}
    </Link>
  )
}
