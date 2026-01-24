import { useState, useEffect } from "react"

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
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWorkspace() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/workspace?id=${workspaceId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch workspace")
        }
        const data = await response.json()
        setWorkspace(data.workspace)
      } catch (err: any) {
        setError(err.message || "Failed to load workspace")
        setWorkspace(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkspace()
  }, [workspaceId])

  return {
    workspace,
    isLoading,
    error,
  }
}

