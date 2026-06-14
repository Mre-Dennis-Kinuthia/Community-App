"use client"

import { Linkedin } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getImageDisplayUrl } from "@/lib/stored-image"
import { cn, getInitials } from "@/lib/utils"
import type { CommunityMember } from "@/types/community"

type RecommendationProfileCardProps = {
  member: CommunityMember
  onIgnore: () => void
  onContact: () => void
  contactLoading?: boolean
  className?: string
}

export function RecommendationProfileCard({
  member,
  onIgnore,
  onContact,
  contactLoading = false,
  className,
}: RecommendationProfileCardProps) {
  const avatarUrl = getImageDisplayUrl(member.avatar || member.image)
  const initials = getInitials(member.name, member.email)
  const bio = member.fullBio || member.bio
  const linkedinUrl = member.socialLinks?.linkedin?.trim()

  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm",
        className
      )}
    >
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-28 w-28">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={member.name || "Member"} /> : null}
          <AvatarFallback className="text-2xl font-medium">{initials}</AvatarFallback>
        </Avatar>

        <h2 className="mt-4 text-xl font-semibold text-foreground">{member.name || "Anonymous"}</h2>

        {member.organization ? (
          <p className="mt-1 text-sm text-muted-foreground">{member.organization}</p>
        ) : null}

        {member.role ? (
          <p className="text-sm text-muted-foreground">{member.role}</p>
        ) : null}

        {linkedinUrl ? (
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex h-9 w-9 items-center justify-center rounded bg-[#0A66C2] text-white transition-opacity hover:opacity-90"
            aria-label={`${member.name} on LinkedIn`}
          >
            <Linkedin className="h-5 w-5" />
          </a>
        ) : null}
      </div>

      {bio ? (
        <p className="mt-5 text-left text-sm leading-relaxed text-muted-foreground">{bio}</p>
      ) : (
        <p className="mt-5 text-left text-sm italic text-muted-foreground">No bio provided yet.</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" onClick={onIgnore}>
          Skip
        </Button>
        <Button type="button" onClick={onContact} disabled={contactLoading}>
          {contactLoading ? "Sending…" : "Connect"}
        </Button>
      </div>
    </article>
  )
}
