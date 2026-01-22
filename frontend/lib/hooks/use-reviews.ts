// TODO: Replace with API call to fetch reviews data
import { useMemo } from "react"

export interface Review {
  id: string
  name: string
  role: string
  company?: string
  avatar?: string
  rating: number
  quote: string
  date: Date
  category: "solo-worker" | "team" | "first-time"
}

export function useReviews(workspaceId: string, filter?: string) {
  // TODO: Replace with API call
  const reviews: Review[] = useMemo(() => [], [workspaceId])

  const filteredReviews = useMemo(() => {
    if (!filter || filter === "all") return reviews
    return reviews.filter(r => r.category === filter)
  }, [reviews, filter])

  return {
    reviews: filteredReviews,
    allReviews: reviews,
    isLoading: false,
  }
}

