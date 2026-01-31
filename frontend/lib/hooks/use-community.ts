import useSWR from "swr"
import {
  CommunityMembersResponse,
  CommunityMemberResponse,
  CommunityFilters,
} from "@/types/community"

interface UseCommunityMembersOptions extends CommunityFilters {
  enabled?: boolean
}

function buildCommunityKey(options: UseCommunityMembersOptions): string | null {
  const {
    enabled = true,
    page = 1,
    limit = 20,
    search,
    industry,
    role,
    experience,
    location,
    skills,
    sort = "newest",
    featured,
    connectionsOnly,
  } = options
  if (!enabled) return null
  const params = new URLSearchParams()
  params.set("page", page.toString())
  params.set("limit", limit.toString())
  if (search) params.set("search", search)
  if (industry && industry !== "All") params.set("industry", industry)
  if (role && role !== "All") params.set("role", role)
  if (experience && experience !== "All") params.set("experience", experience)
  if (location && location !== "All") params.set("location", location)
  if (skills && skills.length > 0) params.set("skills", skills.join(","))
  params.set("sort", sort)
  if (featured) params.set("featured", "true")
  if (connectionsOnly) params.set("connectionsOnly", "true")
  return `/api/community?${params.toString()}`
}

export function useCommunityMembers(options: UseCommunityMembersOptions = {}) {
  const key = buildCommunityKey(options)
  const { data, error, isLoading, mutate } = useSWR<CommunityMembersResponse>(
    key,
    { keepPreviousData: true }
  )

  return {
    data,
    members: data?.members || [],
    pagination: data?.pagination,
    filters: data?.filters,
    userConnections: data?.userConnections || [],
    isLoading,
    error: error?.message ?? null,
    refetch: () => mutate(),
  }
}

export function useCommunityMember(memberId: string | null) {
  const key = memberId ? `/api/community/${memberId}` : null
  const { data, error, isLoading } = useSWR<CommunityMemberResponse>(key)

  return {
    member: data?.member ?? null,
    isLoading,
    error: error?.message ?? null,
  }
}
