/**
 * Community member types and interfaces
 */

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
  experienceLevel: string | null
  availability: string[]
  interests: string[]
  connections: number
  followers: number
  projectsInvolved: number[]
  featured: boolean
  joinedDate: Date | string
  achievements: string[]
  experience?: MemberExperience[]
  education?: MemberEducation[]
  isConnected?: boolean
  mutualConnections?: CommunityMember[]
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
