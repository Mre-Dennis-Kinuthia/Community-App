import type { CommunityMember } from "@/types/community"

export const RECOMMENDED_PREVIEW_LIMIT = 6

type RecommendationOptions = {
  /** Max results; omit for the full pool. */
  limit?: number
  excludeIds?: string[]
}

function isRecommendationCandidate(
  member: CommunityMember,
  connectedIds: Set<string>,
  excludeIds: Set<string>
): boolean {
  if (member.isSelf) return false
  if (connectedIds.has(member.id)) return false
  if (excludeIds.has(member.id)) return false
  return true
}

/** Members worth suggesting — featured first, then well-connected profiles. */
export function getRecommendedMembers(
  members: CommunityMember[],
  connectedIds: string[],
  options: RecommendationOptions = {}
): CommunityMember[] {
  const connected = new Set(connectedIds)
  const exclude = new Set(options.excludeIds ?? [])

  const candidates = members.filter((m) =>
    isRecommendationCandidate(m, connected, exclude)
  )

  const featured = candidates.filter((m) => m.featured)
  const others = candidates
    .filter((m) => !m.featured)
    .sort((a, b) => (b.connections || 0) - (a.connections || 0))

  const ordered = [...featured, ...others]
  const seen = new Set<string>()
  const unique = ordered.filter((m) => {
    if (seen.has(m.id)) return false
    seen.add(m.id)
    return true
  })

  if (options.limit != null) {
    return unique.slice(0, options.limit)
  }
  return unique
}
