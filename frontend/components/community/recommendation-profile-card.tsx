"use client"

import { Linkedin } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
  const hasSkills = member.skills.length > 0
  const hasInterests = member.interests.length > 0

  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card px-5 py-6",
        className
      )}
    >
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-28 w-28">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={member.name || "Member"} /> : null}
          <AvatarFallback className="text-2xl font-medium">{initials}</AvatarFallback>
        </Avatar>

        <h2 className="mt-4 text-xl font-semibold">{member.name || "Anonymous"}</h2>

        {member.organization ? (
          <p className="mt-1 text-sm text-muted-foreground">{member.organization}</p>
        ) : null}

        {member.role ? (
          <p className="text-sm text-muted-foreground/80">{member.role}</p>
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
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{bio}</p>
      ) : (
        <p className="mt-5 text-sm italic text-muted-foreground/60">No bio yet.</p>
      )}

      {hasSkills ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {member.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs font-normal">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      {hasInterests ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Interests</p>
          <div className="flex flex-wrap gap-1.5">
            {member.interests.map((interest) => (
              <Badge key={interest} variant="outline" className="text-xs font-normal">
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" className="h-11 rounded-full" onClick={onIgnore}>
          Skip
        </Button>
        <Button type="button" className="h-11 rounded-full" onClick={onContact} disabled={contactLoading}>
          {contactLoading ? "Sending…" : "Connect"}
        </Button>
      </div>
    </article>
  )
}
