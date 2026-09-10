export type Expert = {
  id: string
  slug: string
  name: string
  title: string
  organization: string | null
  industry: string | null
  location: string | null
  bio: string
  photoUrl: string | null
  expertise: string[]
  initiatives: string[]
  bookingUrl: string | null
  linkedInUrl: string | null
  isFeatured: boolean
  eventsCount: number
}

export type ExpertEvent = {
  id: string
  title: string
  slug: string | null
  shortCode: string | null
  description: string
  startDate: string
  endDate: string | null
  locationType: string
  onlineUrl: string | null
  imageUrl: string | null
  visibility: string
}

export type ExpertsListResponse = {
  experts: Expert[]
  total: number
  filters: {
    expertise: string[]
    initiatives: string[]
    industries?: string[]
  }
}
