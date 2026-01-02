import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Users } from "lucide-react"

export default function BookingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Book a Space</h1>
          <p className="text-muted-foreground">Reserve meeting rooms or workspaces for your next session.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" className="rounded-md border" />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Available Spaces</CardTitle>
              <CardDescription>Showing available slots for selected date.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "The Boardroom",
                    capacity: "12 people",
                    price: "2,500 KES/hr",
                    image: "/modern-boardroom.png",
                  },
                  {
                    name: "Innovation Lab",
                    capacity: "20 people",
                    price: "4,000 KES/hr",
                    image: "/collaborative-lab.jpg",
                  },
                  {
                    name: "Focus Pod 1",
                    capacity: "2 people",
                    price: "500 KES/hr",
                    image: "/small-focus-room.jpg",
                  },
                ].map((space, i) => (
                  <div key={i} className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row">
                    <img
                      src={space.image || "/placeholder.svg"}
                      alt={space.name}
                      className="h-24 w-full rounded-md object-cover sm:w-32"
                    />
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{space.name}</h3>
                          <span className="text-sm font-bold text-primary">{space.price}</span>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> {space.capacity}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Level 2
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Select>
                          <SelectTrigger className="h-8 w-[140px]">
                            <SelectValue placeholder="Select Time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="09:00">09:00 AM</SelectItem>
                            <SelectItem value="10:00">10:00 AM</SelectItem>
                            <SelectItem value="11:00">11:00 AM</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm">Book Now</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
