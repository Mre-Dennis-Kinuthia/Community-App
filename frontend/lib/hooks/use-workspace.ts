import useSWR from "swr"

export interface Workspace {
  id: string
  name: string
  location: string
  address: string
  valueProposition: string
  startingPrice: number
  currency: string
  rating: number
  reviewCount: number
  images: string[]
  amenities: {
    icon: string
    label: string
    value: string
  }[]
  whoIsThisFor: string
  openingHours: string
  houseRules: string[]
  securityInfo: string
  coordinates: {
    lat: number
    lng: number
  }
  landmarks: string[]
  companyLogos?: string[]
}

interface WorkspaceApiResponse {
  workspace: Workspace | null
}

export function useWorkspace(workspaceId: string) {
  const key = workspaceId ? `/api/workspace?id=${workspaceId}` : null
  const { data, error, isLoading } = useSWR<WorkspaceApiResponse>(key)

  return {
    workspace: data?.workspace ?? null,
    isLoading,
    error: error?.message ?? null,
  }
}
