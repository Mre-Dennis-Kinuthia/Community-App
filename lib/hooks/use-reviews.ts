// Mock hook for reviews data
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
  const reviews: Review[] = useMemo(() => [
    {
      id: "1",
      name: "Sarah Kimani",
      role: "Founder",
      company: "GreenTech Solutions",
      rating: 5,
      quote: "The perfect workspace for my startup. Great community and all the amenities I need.",
      date: new Date(2025, 11, 15),
      category: "solo-worker",
    },
    {
      id: "2",
      name: "David Ochieng",
      role: "Product Manager",
      company: "Tech Corp",
      rating: 5,
      quote: "Our team loves the meeting rooms. Professional setup and reliable WiFi.",
      date: new Date(2025, 11, 10),
      category: "team",
    },
    {
      id: "3",
      name: "Mary Wanjiku",
      role: "Freelancer",
      rating: 4,
      quote: "First time here and I'm impressed. Clean, quiet, and affordable.",
      date: new Date(2025, 11, 5),
      category: "first-time",
    },
    {
      id: "4",
      name: "James Mwangi",
      role: "Consultant",
      rating: 5,
      quote: "Best coworking space in Nairobi. The community events are a bonus!",
      date: new Date(2025, 10, 28),
      category: "solo-worker",
    },
    {
      id: "5",
      name: "Grace Otieno",
      role: "Designer",
      company: "Creative Studio",
      rating: 5,
      quote: "Perfect for creative work. Great lighting and comfortable spaces.",
      date: new Date(2025, 10, 20),
      category: "team",
    },
  ], [workspaceId])

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

