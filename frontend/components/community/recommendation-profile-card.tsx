"use client"

import { Linkedin } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getImageDisplayUrl } from "@/lib/stored-image"
import { getInitials } from "@/lib/utils"
import { cn } from "@/lib/utils"
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
        "flex flex-col rounded-2xl border-2 border-[var(--cd-green)] bg-white p-6 shadow-sm",
        className
      )}
    >
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-28 w-28 border-2 border-[var(--cd-green)]/15">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={member.name || "Member"} /> : null}
          <AvatarFallback className="bg-[var(--cd-green)]/10 text-2xl font-semibold text-[var(--cd-green)]">
            {initials}
          </AvatarFallback>
        </Avatar>

        <h2 className="mt-4 text-xl font-bold text-[var(--cd-green)]">{member.name || "Anonymous"}</h2>

        {member.organization ? (
          <p className="mt-1 text-sm font-medium text-[var(--cd-green)]/85">{member.organization}</p>
        ) : null}

        {member.role ? (
          <p className="text-sm text-[var(--cd-green)]/70">{member.role}</p>
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
        <p className="mt-5 text-left text-sm leading-relaxed text-[var(--cd-green)]/75">{bio}</p>
      ) : (
        <p className="mt-5 text-left text-sm italic text-[var(--cd-green)]/50">No bio provided yet.</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onIgnore}
          className="h-11 rounded-full bg-[var(--cd-yellow)] text-sm font-semibold text-[var(--cd-green)] transition-opacity hover:opacity-90 active:scale-[0.98]"
        >
          Ignore
        </button>
        <button
          type="button"
          onClick={onContact}
          disabled={contactLoading}
          className="h-11 rounded-full bg-[var(--cd-navy)] text-sm font-semibold text-[var(--cd-yellow)] transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
        >
          {contactLoading ? "Sending…" : "Contact"}
        </button>
      </div>
    </article>
  )
}
