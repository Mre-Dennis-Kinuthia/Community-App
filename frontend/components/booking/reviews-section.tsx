"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Quote } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import type { Review } from "@/lib/hooks/use-reviews"

interface ReviewsSectionProps {
  reviews: Review[]
  filter: string
  onFilterChange: (filter: string) => void
}

export function ReviewsSection({ reviews, filter, onFilterChange }: ReviewsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>What Members Say</CardTitle>
            <CardDescription>Real reviews from our community</CardDescription>
          </div>
          <Select value={filter} onValueChange={onFilterChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="solo-worker">Solo Workers</SelectItem>
              <SelectItem value="team">Teams</SelectItem>
              <SelectItem value="first-time">First-Time Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No reviews found</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.avatar} />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {review.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{review.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {review.category === "solo-worker" && "Solo"}
                        {review.category === "team" && "Team"}
                        {review.category === "first-time" && "First Time"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {review.role}
                      {review.company && ` • ${review.company}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < review.rating
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <Quote className="h-4 w-4 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground italic mb-2">
                  "{review.quote}"
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(review.date, "MMM d, yyyy")}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

