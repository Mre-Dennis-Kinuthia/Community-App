export interface LandingCommunityPreview {
  memberCount: number
  upcomingEventsCount: number
  featuredMembers: Array<{
    name: string
    image: string | null
    role: string | null
    industry: string | null
    organization: string | null
  }>
}
