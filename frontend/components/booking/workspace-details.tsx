"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Shield, Users, Info, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Workspace } from "@/lib/hooks/use-workspace"

interface WorkspaceDetailsProps {
  workspace: Workspace
}

export function WorkspaceDetails({ workspace }: WorkspaceDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Value Proposition */}
      {workspace.valueProposition && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              About This Workspace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {workspace.valueProposition}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Who This Is For */}
      {workspace.whoIsThisFor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Who This Space Is For
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {workspace.whoIsThisFor}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Practical Information Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Opening Hours */}
        {workspace.openingHours && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-5 w-5" />
                Opening Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{workspace.openingHours}</p>
            </CardContent>
          </Card>
        )}

        {/* Security Info */}
        {workspace.securityInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{workspace.securityInfo}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* House Rules */}
      {workspace.houseRules && workspace.houseRules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>House Rules</CardTitle>
            <CardDescription>Please follow these guidelines during your visit</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {workspace.houseRules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Landmarks */}
      {workspace.landmarks && workspace.landmarks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Nearby Landmarks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {workspace.landmarks.map((landmark, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {landmark}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
