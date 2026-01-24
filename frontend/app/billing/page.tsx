"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { toast } from "@/lib/toast"
import { CreditCard, Download, ExternalLink, Phone, ShieldCheck, Loader2 } from "lucide-react"
import { format } from "date-fns"

interface Subscription {
  id: string
  status: string
  plan: {
    name: string
    price: number
    currency: string
    interval: string
  }
  currentPeriodEnd: string
}

interface PaymentMethod {
  id: string
  brand: string | null
  last4: string | null
  expiryMonth: number | null
  expiryYear: number | null
}

interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  currency: string
  status: string
  createdAt: string
  paidAt: string | null
  pdfUrl: string | null
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [mpesaPhone, setMpesaPhone] = useState("")
  const [mpesaAmount, setMpesaAmount] = useState("25000")
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  useEffect(() => {
    async function fetchBillingData() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/billing")
        if (response.ok) {
          const data = await response.json()
          setSubscription(data.subscription)
          setPaymentMethod(data.paymentMethods?.[0] || null)
          setInvoices(data.invoices || [])
        }
      } catch (error) {
        console.error("Failed to fetch billing data:", error)
        toast.error("Error", "Failed to load billing information")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBillingData()
  }, [])

  const handleMpesaPayment = async () => {
    if (!mpesaPhone.trim()) {
      toast.error("Enter a phone number", "Please provide an M-Pesa phone number.")
      return
    }
    if (!mpesaAmount || Number(mpesaAmount) <= 0) {
      toast.error("Enter a valid amount", "Amount must be greater than 0.")
      return
    }

    try {
      setIsProcessingPayment(true)
      const response = await fetch("/api/billing/mpesa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: mpesaPhone,
          amount: Number(mpesaAmount),
          description: "Subscription payment",
        }),
      })

      if (response.ok) {
        toast.success("STK push sent", "Check your phone to complete the payment.")
        setMpesaPhone("")
      } else {
        const errorData = await response.json()
        toast.error("Payment failed", errorData.error || "Please try again.")
      }
    } catch (error) {
      console.error("M-Pesa payment error:", error)
      toast.error("Payment failed", "Please try again.")
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Default values if no subscription
  const plan = subscription
    ? {
        name: subscription.plan.name,
        price: `${subscription.plan.currency} ${subscription.plan.price.toLocaleString()} / ${subscription.plan.interval}`,
        status: subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1),
        renewsOn: format(new Date(subscription.currentPeriodEnd), "MMM d, yyyy"),
      }
    : {
        name: "No active plan",
        price: "N/A",
        status: "Inactive",
        renewsOn: "N/A",
      }

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
                {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : paymentMethod ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {paymentMethod.brand || "Card"} •••• {paymentMethod.last4 || "****"}
                    </p>
                    {paymentMethod.expiryMonth && paymentMethod.expiryYear && (
                      <p className="text-xs text-muted-foreground">
                        Expires {String(paymentMethod.expiryMonth).padStart(2, "0")} / {paymentMethod.expiryYear}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No payment method on file</p>
              )}
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                Update Payment Method
              </Button>
            </CardContent>
          </Card>

          {/* M-Pesa STK Push */}
          <Card>
            <CardHeader>
              <CardTitle>Pay with M-Pesa</CardTitle>
              <CardDescription>Initiate an STK Push to complete your payment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mpesa-phone">M-Pesa Phone Number</Label>
                <Input
                  id="mpesa-phone"
                  placeholder="07XX XXX XXX"
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mpesa-amount">Amount (KES)</Label>
                <Input
                  id="mpesa-amount"
                  type="number"
                  min="1"
                  value={mpesaAmount}
                  onChange={(e) => setMpesaAmount(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleMpesaPayment}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Pay with M-Pesa (STK Push)
                  </>
                )}
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{format(new Date(invoice.createdAt), "MMM d, yyyy")}</TableCell>
                      <TableCell>{invoice.currency} {invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{invoice.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {invoice.pdfUrl && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label="View invoice"
                                onClick={() => window.open(invoice.pdfUrl!, "_blank")}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label="Download invoice"
                                onClick={() => {
                                  const link = document.createElement("a")
                                  link.href = invoice.pdfUrl!
                                  link.download = `${invoice.invoiceNumber}.pdf`
                                  link.click()
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

