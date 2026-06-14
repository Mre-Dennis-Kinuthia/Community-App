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
        "flex h-[11.5rem] flex-col items-center rounded-xl border border-border bg-card px-3 py-4 text-center transition-colors hover:border-primary/40 hover:bg-muted/20",
        carousel ? "w-[9.5rem]" : "w-full",
        className
      )}
    >
      <Avatar className="h-16 w-16 shrink-0">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={member.name || "Member"} /> : null}
        <AvatarFallback className="text-sm font-medium">{initials}</AvatarFallback>
      </Avatar>

      <div className="mt-3 flex w-full flex-1 flex-col items-center">
        <h3 className="line-clamp-2 min-h-[2.5rem] w-full text-sm font-semibold leading-tight text-foreground">
          {member.name || "Anonymous"}
        </h3>
        <p className="mt-1 line-clamp-1 w-full min-h-[1rem] text-xs text-muted-foreground">
          {member.organization || "\u00A0"}
        </p>
        <p className="line-clamp-1 w-full min-h-[1rem] text-[11px] text-muted-foreground/80">
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
