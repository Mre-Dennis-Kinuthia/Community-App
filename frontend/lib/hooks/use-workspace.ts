import useSWR from "swr"

export interface Workspace {
  id: string
  name: string
  location: string
  address: string
  googleMapsUrl?: string
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
  pricing?: Record<string, unknown> | null
}

interface WorkspaceApiResponse {
  workspace: Workspace | null
  error?: string
}

/**
 * Fetch workspace details used by the member booking flow.
 *
 * We treat the argument as the workspace *slug* so that
 * admins can manage workspaces from the Community-app-admin
 * Workspaces screen. If no slug is provided, the API will
 * return the first active workspace.
 */
/**
 * @param workspaceSlug - slug from URL, or undefined for default (oldest active).
 * Pass `null` to skip fetching (e.g. while user picks a space).
 */
export function useWorkspace(workspaceSlug?: string | null) {
  const key =
    workspaceSlug === null
      ? null
      : workspaceSlug
        ? `/api/workspace?slug=${encodeURIComponent(workspaceSlug)}`
        : "/api/workspace"
  const { data, error, isLoading } = useSWR<WorkspaceApiResponse>(key)

  return {
    workspace: data?.workspace ?? null,
    isLoading,
    error: error?.message ?? data?.error ?? null,
  }
}
