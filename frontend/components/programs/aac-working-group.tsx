import Image from "next/image"
import { AAC_PARTNERS } from "@/lib/aac-program"
import {
  AAC_WORKING_GROUP_MEMBERS,
  AAC_WORKING_GROUP_OBSERVERS,
  AAC_WORKING_GROUP_SECRETARIAT,
  type AacWorkingGroupMember,
} from "@/lib/aac-working-group"
import { cn } from "@/lib/utils"

const DARK_LOGOS = new Set(AAC_PARTNERS.filter((p) => p.onDark).map((p) => p.logo))

function MemberCard({ member, compact = false }: { member: AacWorkingGroupMember; compact?: boolean }) {
  const darkLogo = member.logo ? DARK_LOGOS.has(member.logo) : false
  const initials = member.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-lg border border-[#edeff2] bg-white p-4 shadow-sm",
        compact && "p-3"
      )}
    >
      <div className="flex items-start gap-3">
        {member.photo ? (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-[#edeff2] bg-[#faf9f6]">
            <Image
              src={member.photo}
              alt={member.name}
              fill
              sizes="56px"
              unoptimized
              className="object-cover"
            />
          </div>
        ) : member.logo ? (
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border",
              darkLogo ? "border-[#0a1f38] bg-[#0a1f38]" : "border-[#edeff2] bg-[#faf9f6]"
            )}
          >
            <Image
              src={member.logo}
              alt=""
              width={48}
              height={48}
              unoptimized
              className="max-h-10 w-auto max-w-[2.5rem] object-contain"
            />
          </div>
        ) : (
          <div
            aria-hidden
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#812926]/10 text-sm font-semibold text-[#812926]"
          >
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-snug text-[#0a1f38]">{member.name}</h3>
          <p className="mt-0.5 text-xs leading-snug text-[#1c395c]/80">{member.role}</p>
          <p className="mt-1 text-[11px] font-medium text-[#812926]">{member.organization}</p>
        </div>
      </div>
      {member.bio && !compact ? (
        <details className="mt-3 border-t border-[#edeff2] pt-2">
          <summary className="cursor-pointer text-[11px] font-medium text-[#1c395c]/70 hover:text-[#812926]">
            Profile
          </summary>
          <p className="mt-2 text-xs leading-relaxed text-[#1c395c]/80">{member.bio}</p>
        </details>
      ) : null}
    </article>
  )
}

function CohortBlock({
  label,
  title,
  description,
  members,
  compact,
}: {
  label: string
  title: string
  description?: string
  members: readonly AacWorkingGroupMember[]
  compact?: boolean
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#812926]">{label}</p>
      <h3 className="mt-1 text-base font-semibold text-[#0a1f38] md:text-lg">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#1c395c]/70 md:text-sm">{description}</p>
      ) : null}
      <ul
        className={cn(
          "mt-5 grid gap-3",
          compact ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        )}
      >
        {members.map((member) => (
          <li key={`${member.cohort}-${member.name}`}>
            <MemberCard member={member} compact={compact} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AacWorkingGroup() {
  return (
    <div className="space-y-12">
      <CohortBlock
        label="Conveners"
        title="Impact Hub Nairobi secretariat"
        description="The IHN team that convenes the working group and holds the programme together."
        members={AAC_WORKING_GROUP_SECRETARIAT}
        compact
      />
      <CohortBlock
        label={`${AAC_WORKING_GROUP_MEMBERS.length} members`}
        title="Working group"
        description="Practitioners, enterprises, researchers, and ecosystem partners co-designing circular agriculture in Kenya. Organisation profiles and links will be added next."
        members={AAC_WORKING_GROUP_MEMBERS}
      />
      <CohortBlock
        label="Observers"
        title="Funders and ecosystem observers"
        description="Partners who sit with the working group to learn, connect, and strengthen the wider ecosystem."
        members={AAC_WORKING_GROUP_OBSERVERS}
      />
    </div>
  )
}
