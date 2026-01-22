// TODO: Replace with API call to fetch workspace data
import { useMemo } from "react"

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

export function useWorkspace(workspaceId: string) {
  // TODO: Replace with API call
  const workspace: Workspace | null = useMemo(() => null, [workspaceId])

  return {
    workspace,
    isLoading: false,
    error: null,
  }
}

