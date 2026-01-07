// Mock hook for workspace data
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
  const workspace: Workspace = useMemo(() => ({
    id: workspaceId,
    name: "Impact Hub Nairobi Workspace",
    location: "Nairobi, Kenya",
    address: "Ngong Road, Nairobi",
    valueProposition: "Professional workspace in the heart of Nairobi's innovation district",
    startingPrice: 1500,
    currency: "KES",
    rating: 4.8,
    reviewCount: 127,
    images: [
      "/modern-boardroom.png",
      "/collaborative-lab.jpg",
      "/small-focus-room.jpg",
    ],
    amenities: [
      { icon: "wifi", label: "Wi-Fi Speed", value: "100 Mbps" },
      { icon: "power", label: "Power", value: "24/7 Available" },
      { icon: "noise", label: "Noise Level", value: "Quiet" },
      { icon: "coffee", label: "Coffee", value: "Premium" },
      { icon: "community", label: "Community", value: "Active" },
      { icon: "accessibility", label: "Accessibility", value: "Wheelchair Access" },
    ],
    whoIsThisFor: "Perfect for entrepreneurs, remote workers, and teams looking for a professional yet collaborative environment.",
    openingHours: "Monday - Friday: 8:00 AM - 8:00 PM, Saturday: 9:00 AM - 5:00 PM",
    houseRules: [
      "Respectful noise levels",
      "Clean up after use",
      "No smoking",
      "Book in advance"
    ],
    securityInfo: "24/7 security, CCTV, access cards required",
    coordinates: {
      lat: -1.2921,
      lng: 36.8219,
    },
    landmarks: [
      "5 min from Nairobi CBD",
      "Near Ngong Road",
      "Close to public transport"
    ],
    companyLogos: [
      "Acumen Fund",
      "Impact Hub Global",
      "Partners"
    ]
  }), [workspaceId])

  return {
    workspace,
    isLoading: false,
    error: null,
  }
}

