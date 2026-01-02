import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, CreditCard, Building2, TrendingUp, AlertCircle, Check, X } from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hub Management</h1>
            <p className="text-muted-foreground">Oversee members, spaces, and platform operations.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-transparent">
              Reports
            </Button>
            <Button>Hub Settings</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">452</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.2M KES</div>
              <p className="text-xs text-muted-foreground">+5.4% from target</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hub Occupancy</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">84%</div>
              <p className="text-xs text-muted-foreground">Peak hours: 10AM - 3PM</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Across all rooms today</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Pending Member Approvals</CardTitle>
              <CardDescription>New applications awaiting verification.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { name: "Alice Wambui", email: "alice@startup.co", plan: "Hot Desk" },
                    { name: "Peter Kamau", email: "p.kamau@design.ke", plan: "Fixed Desk" },
                    { name: "Grace Atieno", email: "grace@impact.org", plan: "Community" },
                  ].map((pending, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="font-medium">{pending.name}</div>
                        <div className="text-xs text-muted-foreground">{pending.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{pending.plan}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Critical updates for hub operations.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4 items-start rounded-lg border p-3 bg-destructive/5">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Maintenance Required</p>
                    <p className="text-xs text-muted-foreground">AC unit in Meeting Room B is malfunctioning.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start rounded-lg border p-3">
                  <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Membership Milestone</p>
                    <p className="text-xs text-muted-foreground">Community has grown by 50 members this quarter.</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  View All Notifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
