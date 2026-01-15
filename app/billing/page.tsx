"use client"

import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { CreditCard, Download, ExternalLink, ShieldCheck } from "lucide-react"

export default function BillingPage() {
  // In a real app, billing data would come from your backend / Stripe
  const plan = {
    name: "Fixed Desk",
    price: "KES 25,000 / month",
    status: "Active",
    renewsOn: "Feb 1, 2026",
  }

  const paymentMethod = {
    brand: "Visa",
    last4: "4242",
    expiry: "08 / 28",
  }

  const invoices = [
    { id: "INV-2026-002", date: "Jan 1, 2026", amount: "KES 25,000", status: "Paid" },
    { id: "INV-2025-012", date: "Dec 1, 2025", amount: "KES 25,000", status: "Paid" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <Breadcrumbs items={[{ label: "Profile", href: "/profile" }, { label: "Billing" }]} />

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Manage Billing</h1>
            <p className="text-muted-foreground text-base">
              View your membership plan, update payment details, and access invoices.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-transparent">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Billing Help
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Current plan */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Current Membership</CardTitle>
              <CardDescription>Your active Impact Hub Nairobi membership plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{plan.name}</p>
                  <p className="text-xs text-muted-foreground">{plan.price}</p>
                </div>
                <Badge variant="default">{plan.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Next billing date</span>
                <span>{plan.renewsOn}</span>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button size="sm" variant="outline" className="bg-transparent">
                  Update Plan
                </Button>
                <Button size="sm" variant="outline" className="bg-transparent">
                  Cancel Membership
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Securely stored via your payment provider.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {paymentMethod.brand} •••• {paymentMethod.last4}
                    </p>
                    <p className="text-xs text-muted-foreground">Expires {paymentMethod.expiry}</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                Update Payment Method
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>Download receipts and view previous invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{invoice.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="View invoice">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Download invoice">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

