import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
  return (
    <div className="container mx-auto max-w-4xl py-10">
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/placeholder-user.jpg" alt="Member profile" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">John Doe</h1>
            <p className="text-muted-foreground">Tech Entrepreneur • Member since Jan 2024</p>
          </div>
        </div>
        <Button>Edit Profile</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>About Me</CardTitle>
              <CardDescription>Tell the community about yourself and your work.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Share your story..."
                  className="min-h-[100px]"
                  defaultValue="Passionate about building tech solutions for local impact in Nairobi."
                />
              </div>
              <div className="space-y-2">
                <Label>Skills & Interests</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Product Design</Badge>
                  <Badge variant="secondary">FinTech</Badge>
                  <Badge variant="secondary">Social Impact</Badge>
                  <Badge variant="outline">+ Add Skill</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input id="linkedin" placeholder="linkedin.com/in/..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" placeholder="https://..." />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Membership</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Plan</span>
                <Badge>Fixed Desk</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <span className="text-sm text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Next Billing</span>
                <span className="text-sm">Feb 1, 2026</span>
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                Manage Billing
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg bg-muted p-2">
                  <div className="text-xl font-bold">12</div>
                  <div className="text-xs text-muted-foreground">Events</div>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <div className="text-xl font-bold">45</div>
                  <div className="text-xs text-muted-foreground">Connections</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
