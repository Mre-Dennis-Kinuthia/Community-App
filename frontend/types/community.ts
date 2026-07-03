/**
 * Community member types and interfaces
 */

export type MemberConnectionStatus =
  | "none"
  | "connected"
  | "pending_sent"
  | "pending_received"

export interface MemberProjectSummary {
  id: string
  title: string
  category: string | null
  stage: string | null
  imageUrl: string | null
}

export interface MemberEventSummary {
  id: string
  title: string
  startDate: string
  location: string | null
}

export interface MutualConnectionSummary {
  id: string
  name: string
  avatar: string | null
  role: string | null
}

export interface CommunityMember {
  id: string
  name: string
  email: string
  avatar: string | null
  image?: string | null
  bio: string
  fullBio?: string
  skills: string[]
  location: string | null
  industry: string | null
  role: string | null
  memberType: string | null
  membershipTier?: string | null
  membershipLabel?: string | null
  organization: string | null
  experienceLevel: string | null
  availability: string[]
  interests: string[]
  socialLinks?: { linkedin?: string } | null
  connections: number
  followers: number
  following: number
  projectsInvolved: number[]
  projects?: MemberProjectSummary[]
  recentEvents?: MemberEventSummary[]
  featured: boolean
  joinedDate: Date | string
  profileUpdatedAt?: string | null
  achievements: string[]
  experience?: MemberExperience[]
  education?: MemberEducation[]
  isConnected?: boolean
  connectionStatus?: MemberConnectionStatus
  connectionId?: string | null
  isFollowing?: boolean
  isSelf?: boolean
  mutualConnections?: MutualConnectionSummary[]
}

export interface MemberExperience {
  company: string
  role: string
  period: string
  description: string
}

export interface MemberEducation {
  institution: string
  degree: string
  period: string
}

export interface CommunityMembersResponse {
  members: CommunityMember[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: {
    skills: string[]
    locations: string[]
  }
  userConnections: string[]
}

export interface CommunityMemberResponse {
  member: CommunityMember
}

export type SortOption = "newest" | "oldest" | "most_connected" | "most_active" | "alphabetical"

export interface CommunityFilters {
  search?: string
  industry?: string
  role?: string
  experience?: string
  location?: string
  skills?: string[]
  sort?: SortOption
  featured?: boolean
  connectionsOnly?: boolean
  page?: number
  limit?: number
}
