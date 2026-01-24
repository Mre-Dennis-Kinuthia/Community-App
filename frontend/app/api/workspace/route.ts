import { NextRequest, NextResponse } from "next/server"
import { corsHeaders, handleOptions } from "@/middleware-cors"

/**
 * Handle OPTIONS preflight for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * GET /api/workspace
 * Get workspace information
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const workspaceId = searchParams.get("id") || "impact-hub-nairobi"

    // For now, return static data. In production, fetch from database
    const workspace = {
      id: workspaceId,
      name: "Ikigai Space - Impact Hub Nairobi",
      location: "Nairobi, Kenya",
      address: "Senteu Plaza, Galana Road, Kilimani, Nairobi",
      valueProposition: "A vibrant co-working space designed for social entrepreneurs and innovators. Experience a collaborative environment with modern amenities, networking opportunities, and a supportive community focused on creating positive impact.",
      startingPrice: 2500,
      currency: "KES",
      rating: 4.8,
      reviewCount: 127,
      images: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80",
        "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80",
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80",
      ],
      amenities: [
        { icon: "wifi", label: "High-Speed WiFi", value: "100 Mbps" },
        { icon: "power", label: "Power Outlets", value: "At every desk" },
        { icon: "coffee", label: "Coffee & Tea", value: "Complimentary" },
        { icon: "community", label: "Community", value: "Networking events" },
        { icon: "noise", label: "Noise Level", value: "Quiet zones available" },
        { icon: "accessibility", label: "Accessibility", value: "Wheelchair accessible" },
      ],
      whoIsThisFor: "Perfect for entrepreneurs, freelancers, remote workers, startups, and social innovators looking for a professional workspace with a vibrant community.",
      openingHours: "Monday - Friday: 8:00 AM - 8:00 PM | Saturday: 9:00 AM - 5:00 PM | Sunday: Closed",
      houseRules: [
        "Respect quiet zones and maintain a professional environment",
        "Clean up after yourself and keep shared spaces tidy",
        "No smoking inside the premises",
        "Be mindful of noise levels during calls",
        "Follow security protocols and badge in/out",
      ],
      securityInfo: "24/7 security, CCTV surveillance, secure access with key cards, and on-site security personnel during business hours.",
      coordinates: { lat: -1.2921, lng: 36.8219 },
      landmarks: ["Kilimani Shopping Centre", "Yaya Centre", "Nairobi Hospital", "University of Nairobi"],
      companyLogos: ["Ikigai", "Impact Hub", "Social Enterprise"],
    }

    return NextResponse.json({ workspace }, { headers: corsHeaders })
  } catch (error: any) {
    console.error("[WORKSPACE API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch workspace" },
      { status: 500, headers: corsHeaders }
    )
  }
}
