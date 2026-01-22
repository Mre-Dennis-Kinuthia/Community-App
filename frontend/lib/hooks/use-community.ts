import { useState, useEffect, useCallback } from "react"
import {
  CommunityMember,
  CommunityMembersResponse,
  CommunityMemberResponse,
  CommunityFilters,
} from "@/types/community"

interface UseCommunityMembersOptions extends CommunityFilters {
  enabled?: boolean
}

export function useCommunityMembers(options: UseCommunityMembersOptions = {}) {
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

  const [data, setData] = useState<CommunityMembersResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = useCallback(async () => {
    if (!enabled) return

    try {
      setIsLoading(true)
      setError(null)

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

      const response = await fetch(`/api/community?${params.toString()}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch members")
      }

      const result: CommunityMembersResponse = await response.json()
      setData(result)
    } catch (err: any) {
      setError(err.message || "An error occurred")
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [
    enabled,
    page,
    limit,
    search,
    industry,
    role,
    experience,
    location,
    skills,
    sort,
    featured,
    connectionsOnly,
  ])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  return {
    data,
    members: data?.members || [],
    pagination: data?.pagination,
    filters: data?.filters,
    userConnections: data?.userConnections || [],
    isLoading,
    error,
    refetch: fetchMembers,
  }
}

export function useCommunityMember(memberId: string | null) {
  const [member, setMember] = useState<CommunityMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!memberId) {
      setIsLoading(false)
      return
    }

    async function fetchMember() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/community/${memberId}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Member not found")
          }
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch member")
        }

        const result: CommunityMemberResponse = await response.json()
        setMember(result.member)
      } catch (err: any) {
        setError(err.message || "An error occurred")
        setMember(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMember()
  }, [memberId])

  return {
    member,
    isLoading,
    error,
  }
}
