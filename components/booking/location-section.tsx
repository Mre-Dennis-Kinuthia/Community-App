"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, Shield, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Workspace } from "@/lib/hooks/use-workspace"

interface LocationSectionProps {
  workspace: Workspace
}

export function LocationSection({ workspace }: LocationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location & Logistics
        </CardTitle>
        <CardDescription>Everything you need to know</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Address */}
        <div>
          <p className="text-sm font-medium mb-1">Address</p>
          <p className="text-sm text-muted-foreground">{workspace.address}</p>
        </div>

        {/* Map Placeholder */}
        <div className="aspect-video rounded-lg bg-muted border border-border/50 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Map view</p>
            <p className="text-xs text-muted-foreground mt-1">
              {workspace.coordinates.lat}, {workspace.coordinates.lng}
            </p>
          </div>
        </div>

        {/* Landmarks */}
        {workspace.landmarks.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Nearby Landmarks</p>
            <div className="flex flex-wrap gap-2">
              {workspace.landmarks.map((landmark, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {landmark}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Opening Hours */}
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Opening Hours</p>
            <p className="text-sm text-muted-foreground">{workspace.openingHours}</p>
          </div>
        </div>

        {/* Security Info */}
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Security</p>
            <p className="text-sm text-muted-foreground">{workspace.securityInfo}</p>
          </div>
        </div>

        {/* House Rules */}
        {workspace.houseRules.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">House Rules</p>
            <ul className="space-y-1">
              {workspace.houseRules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

