import useSWR from "swr"

export interface WorkspaceListItem {
  id: string
  name: string
  slug: string
  location: string
  startingPrice: number
  currency: string
  valueProposition: string
  coverImage?: string
}

interface WorkspacesApiResponse {
  workspaces: WorkspaceListItem[]
  error?: string
}

export function useWorkspaces() {
  const { data, error, isLoading } = useSWR<WorkspacesApiResponse>("/api/workspaces")

  return {
    workspaces: data?.workspaces ?? [],
    isLoading,
    error: error?.message ?? data?.error ?? null,
  }
}
