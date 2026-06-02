"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { MobilePageHeader, MobileStatsStrip, MobileBreadcrumbsHidden } from "@/components/mobile/mobile-page-shell"
import { toast } from "@/lib/toast"
import { badgeClassForLabel, badgeNeutral, badgePrimary } from "@/lib/badge-styles"
import { cn } from "@/lib/utils"
import {
  CreditCard,
  Download,
  ExternalLink,
  Phone,
  Loader2,
  CalendarClock,
  Receipt,
  HelpCircle,
  Mail,
  ArrowRight,
} from "lucide-react"
import { format } from "date-fns"
import { HUB_CONTACT_EMAIL } from "@/lib/hub-contact"

const MEMBERSHIP_EMAIL = `mailto:${HUB_CONTACT_EMAIL}?subject=Impact%20Hub%20Nairobi%20%E2%80%94%20Billing`

interface BillingPlan {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  interval: string
}

interface Subscription {
  id: string
  status: string
  cancelAtPeriodEnd: boolean
  plan: {
    id: string
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

function invoiceStatusClass(status: string) {
  const s = status.toLowerCase()
  if (s === "paid" || s === "succeeded") return badgePrimary
  if (s === "open" || s === "pending" || s === "draft") return badgeNeutral
  return badgeClassForLabel(status)
}

function normalizeSubscription(raw: unknown): Subscription | null {
  if (!raw || typeof raw !== "object") return null
  const s = raw as Record<string, unknown>
  const plan = s.plan
  if (!plan || typeof plan !== "object") return null
  const p = plan as Record<string, unknown>
  const priceRaw = p.price
  const price =
    typeof priceRaw === "number"
      ? priceRaw
      : typeof priceRaw === "string"
        ? Number(priceRaw)
        : NaN
  if (!s.id || typeof s.id !== "string") return null
  if (!s.status || typeof s.status !== "string") return null
  if (typeof s.cancelAtPeriodEnd !== "boolean") return null
  if (!p.id || typeof p.id !== "string") return null
  if (!p.name || typeof p.name !== "string") return null
  if (!p.currency || typeof p.currency !== "string") return null
  if (!p.interval || typeof p.interval !== "string") return null
  if (!s.currentPeriodEnd || typeof s.currentPeriodEnd !== "string") return null

  return {
    id: s.id,
    status: s.status,
    cancelAtPeriodEnd: s.cancelAtPeriodEnd,
    plan: {
      id: p.id,
      name: p.name,
      price: Number.isFinite(price) ? price : 0,
      currency: p.currency,
      interval: p.interval,
    },
    currentPeriodEnd: s.currentPeriodEnd,
  }
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [mpesaPhone, setMpesaPhone] = useState("")
  const [mpesaAmount, setMpesaAmount] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const [changePlanOpen, setChangePlanOpen] = useState(false)
  const [scheduleCancelOpen, setScheduleCancelOpen] = useState(false)
  const [resumeOpen, setResumeOpen] = useState(false)
  const [immediateCancelOpen, setImmediateCancelOpen] = useState(false)
  const [plans, setPlans] = useState<BillingPlan[]>([])
  const [plansLoading, setPlansLoading] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState("")
  const [subscriptionActionLoading, setSubscriptionActionLoading] = useState(false)
  const [subscribePhone, setSubscribePhone] = useState("")
  const [subscribePlanId, setSubscribePlanId] = useState("")
  const [subscribeLoading, setSubscribeLoading] = useState(false)
  const [availablePlans, setAvailablePlans] = useState<BillingPlan[]>([])

  async function loadBilling(options?: { silent?: boolean }) {
    const silent = Boolean(options?.silent)
    try {
      if (!silent) setIsLoading(true)
      const response = await fetch("/api/billing", { credentials: "include" })
      if (response.ok) {
        const data = await response.json()
        setSubscription(normalizeSubscription(data.subscription))
        setPaymentMethod(data.paymentMethods?.[0] || null)
        setInvoices(data.invoices || [])
      }
    } catch (error) {
      console.error("Failed to fetch billing data:", error)
      toast.error("Could not load billing", "Refresh the page or try again in a moment.")
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadBilling()
  }, [])

  useEffect(() => {
    if (isLoading || subscription) return
    void (async () => {
      try {
        const response = await fetch("/api/billing/plans", { credentials: "include" })
        const data = await response.json()
        const list = Array.isArray(data.plans) ? (data.plans as BillingPlan[]) : []
        setAvailablePlans(list)
        setSubscribePlanId(list[0]?.id ?? "")
      } catch {
        setAvailablePlans([])
      }
    })()
  }, [isLoading, subscription])

  async function handleSubscribe() {
    if (!subscribePlanId || !subscribePhone.trim()) {
      toast.error("Choose a plan and enter your M-Pesa number")
      return
    }
    setSubscribeLoading(true)
    try {
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planId: subscribePlanId, phoneNumber: subscribePhone.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Subscribe failed")

      if (data.pending && data.paymentId) {
        toast.success(data.message || "Check your phone to approve M-Pesa")
        const paymentId = data.paymentId as string
        for (let i = 0; i < 40; i++) {
          await new Promise((r) => setTimeout(r, 3000))
          const statusRes = await fetch(`/api/billing/payments/${paymentId}/status`, {
            credentials: "include",
          })
          const status = await statusRes.json()
          if (status.completed) {
            toast.success("Membership activated")
            await loadBilling({ silent: true })
            return
          }
          if (status.failed) throw new Error("M-Pesa payment was not completed")
        }
        toast.error("Payment still pending. Refresh billing after approving on your phone.")
        return
      }

      toast.success(data.message || "Membership active")
      await loadBilling({ silent: true })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start membership")
    } finally {
      setSubscribeLoading(false)
    }
  }

  async function loadPlansForChange() {
    setPlansLoading(true)
    try {
      const response = await fetch("/api/billing/plans", { credentials: "include" })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        toast.error("Could not load plans", data.error || "Try again later.")
        setPlans([])
        return
      }
      const list = Array.isArray(data.plans) ? (data.plans as BillingPlan[]) : []
      setPlans(list)
      const currentId = subscription?.plan.id
      const preferred = list.find((pl) => pl.id !== currentId) ?? list[0]
      setSelectedPlanId(preferred?.id ?? "")
    } catch (e) {
      console.error(e)
      toast.error("Could not load plans", "Network error.")
      setPlans([])
    } finally {
      setPlansLoading(false)
    }
  }

  async function patchSubscription(body: Record<string, unknown>) {
    setSubscriptionActionLoading(true)
    try {
      const response = await fetch("/api/billing/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        toast.error("Update failed", typeof data.error === "string" ? data.error : "Please try again.")
        return
      }
      toast.success("Subscription updated", typeof data.message === "string" ? data.message : "")
      setChangePlanOpen(false)
      setScheduleCancelOpen(false)
      setResumeOpen(false)
      setImmediateCancelOpen(false)
      await loadBilling({ silent: true })
    } catch (error) {
      console.error(error)
      toast.error("Update failed", "Network error — try again.")
    } finally {
      setSubscriptionActionLoading(false)
    }
  }

  const handleMpesaPayment = async () => {
    if (!mpesaPhone.trim()) {
      toast.error("Phone required", "Enter the M-Pesa number that should receive the STK prompt.")
      return
    }
    const amount = Number(mpesaAmount)
    if (!mpesaAmount || Number.isNaN(amount) || amount <= 0) {
      toast.error("Amount required", "Enter an amount in KES greater than zero.")
      return
    }

    try {
      setIsProcessingPayment(true)
      const response = await fetch("/api/billing/mpesa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          phoneNumber: mpesaPhone,
          amount,
          description: "Membership payment",
        }),
      })

      if (response.ok) {
        const data = await response.json().catch(() => ({}))
        const isStub = data.launchMode === "stub"
        toast.success(
          isStub ? "Payment recorded" : "Check your phone",
          data.message ||
            (isStub
              ? "M-Pesa STK may still be rolling out — your request was saved."
              : "Complete the prompt on your handset to finish.")
        )
        setMpesaPhone("")
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error("Payment not started", errorData.error || "Please try again.")
      }
    } catch (error) {
      console.error("M-Pesa payment error:", error)
      toast.error("Payment failed", "Network error — try again.")
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const hasPlan = Boolean(subscription)
  const planStatus = subscription
    ? subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)
    : "No active subscription"

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-4 md:space-y-8">
        <MobileBreadcrumbsHidden>
          <Breadcrumbs items={[{ label: "Profile", href: "/profile" }, { label: "Billing" }]} />
        </MobileBreadcrumbsHidden>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <MobilePageHeader
            title="Billing & payments"
            description="Membership, saved payment methods, and invoices for your Impact Hub Nairobi account."
          />
          <Button variant="outline" size="sm" className="shrink-0" asChild>
            <a href={MEMBERSHIP_EMAIL}>
              <Mail className="mr-2 h-4 w-4" />
              Email membership
            </a>
          </Button>
        </div>

        <MobileStatsStrip
          loading={isLoading}
          items={[
            {
              label: "Plan",
              value: hasPlan ? subscription!.plan.name : "None",
              icon: CreditCard,
            },
            {
              label: "Status",
              value: planStatus,
              icon: CalendarClock,
            },
            {
              label: "Invoices",
              value: invoices.length,
              icon: Receipt,
            },
          ]}
        />

        {/* Plan summary */}
        <section className="overflow-hidden rounded-xl border border-border/80 bg-card">
          <div className="border-b border-border bg-muted/30 px-4 py-5 md:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Current plan
                </p>
                {isLoading ? (
                  <div className="flex items-center gap-2 py-1">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading…</span>
                  </div>
                ) : hasPlan ? (
                  <>
                    <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                      {subscription!.plan.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {subscription!.plan.currency}{" "}
                      {subscription!.plan.price.toLocaleString()} per {subscription!.plan.interval}
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold tracking-tight">No subscription on file</h2>
                    <p className="text-sm text-muted-foreground max-w-xl">
                      Workspace and programmes may be billed separately. Book space from the hub or contact
                      membership to align a plan.
                    </p>
                  </>
                )}
              </div>
              {!isLoading && (
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 self-start",
                    hasPlan ? badgePrimary : badgeNeutral
                  )}
                >
                  {planStatus}
                </Badge>
              )}
            </div>
          </div>
          <div className="grid gap-4 px-6 py-5 md:grid-cols-2 md:px-8 md:py-6">
            <div className="flex gap-3 rounded-md border border-border bg-background px-4 py-3">
              <CalendarClock className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Next period ends</p>
                <p className="text-sm font-medium">
                  {hasPlan
                    ? format(new Date(subscription!.currentPeriodEnd), "MMMM d, yyyy")
                    : "—"}
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-md border border-border bg-background px-4 py-3">
              <Receipt className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Recent invoices</p>
                <p className="text-sm font-medium">
                  {isLoading ? "…" : `${invoices.length} on file`}
                </p>
              </div>
            </div>
          </div>
          {hasPlan && subscription!.cancelAtPeriodEnd ? (
            <div className="border-t border-border bg-muted/40 px-6 py-3 md:px-8">
              <p className="text-sm text-foreground">
                Renewal is turned off. You keep access until{" "}
                <span className="font-medium">
                  {format(new Date(subscription!.currentPeriodEnd), "MMMM d, yyyy")}
                </span>
                . Use &quot;Keep subscription&quot; below if you want the plan to continue after that date.
              </p>
            </div>
          ) : null}
          <div className="flex flex-col gap-3 border-t border-border px-6 py-4 md:flex-row md:flex-wrap md:items-start md:justify-between md:px-8">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {hasPlan ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={subscriptionActionLoading}
                    onClick={() => setChangePlanOpen(true)}
                  >
                    Change plan
                  </Button>
                  {subscription!.cancelAtPeriodEnd ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={subscriptionActionLoading}
                      onClick={() => setResumeOpen(true)}
                    >
                      Keep subscription
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={subscriptionActionLoading}
                      onClick={() => setScheduleCancelOpen(true)}
                    >
                      Cancel at end of period
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={subscriptionActionLoading}
                    onClick={() => setImmediateCancelOpen(true)}
                  >
                    Cancel immediately
                  </Button>
                </div>
              ) : null}
              {!isLoading && !hasPlan ? (
                <Button variant="outline" size="sm" className="w-fit" asChild>
                  <a href={MEMBERSHIP_EMAIL}>Membership questions</a>
                </Button>
              ) : null}
              {hasPlan ? (
                <p className="text-xs text-muted-foreground max-w-xl">
                  For refunds, tax receipts, or unusual billing,{" "}
                  <a href={MEMBERSHIP_EMAIL} className="font-medium underline underline-offset-2">
                    email membership
                  </a>
                  .
                </p>
              ) : null}
            </div>
            <Button variant="ghost" size="sm" asChild className="shrink-0 md:mt-0">
              <Link href="/booking">
                Book workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {!isLoading && !hasPlan && availablePlans.length > 0 ? (
          <section className="rounded-xl border border-border/80 bg-card p-6 md:p-8 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Start monthly membership</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Community membership (not workspace desk booking). Pay with M-Pesa to activate your plan.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
              <div className="space-y-2">
                <Label htmlFor="subscribe-plan">Plan</Label>
                <Select value={subscribePlanId} onValueChange={setSubscribePlanId}>
                  <SelectTrigger id="subscribe-plan">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlans.map((pl) => (
                      <SelectItem key={pl.id} value={pl.id}>
                        {pl.name} — {pl.currency} {pl.price.toLocaleString()}/{pl.interval === "yearly" ? "yr" : "mo"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subscribe-phone">M-Pesa phone</Label>
                <Input
                  id="subscribe-phone"
                  placeholder="07XX XXX XXX"
                  value={subscribePhone}
                  onChange={(e) => setSubscribePhone(e.target.value)}
                />
              </div>
            </div>
            <Button disabled={subscribeLoading} onClick={() => void handleSubscribe()}>
              {subscribeLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                "Subscribe now"
              )}
            </Button>
          </section>
        ) : null}

        <Dialog
          open={changePlanOpen}
          onOpenChange={(open) => {
            setChangePlanOpen(open)
            if (open) void loadPlansForChange()
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Change plan</DialogTitle>
              <DialogDescription>
                Choose an active membership plan. Your current period dates stay the same; membership may contact
                you about any price difference.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-1">
              {plansLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading plans…</span>
                </div>
              ) : plans.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active plans are available to switch to online. Please email membership for help.
                </p>
              ) : (
                <>
                  <Label htmlFor="billing-plan-select">New plan</Label>
                  <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                    <SelectTrigger id="billing-plan-select" className="w-full min-w-0">
                      <SelectValue placeholder="Choose a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((pl) => (
                        <SelectItem key={pl.id} value={pl.id}>
                          {pl.name} — {pl.currency} {pl.price.toLocaleString()} / {pl.interval}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setChangePlanOpen(false)}>
                Close
              </Button>
              <Button
                type="button"
                disabled={
                  plansLoading ||
                  plans.length === 0 ||
                  !selectedPlanId ||
                  subscriptionActionLoading
                }
                onClick={() => void patchSubscription({ action: "change_plan", planId: selectedPlanId })}
              >
                {subscriptionActionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Confirm change"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={scheduleCancelOpen} onOpenChange={setScheduleCancelOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cancel at end of period?</DialogTitle>
              <DialogDescription>
                {subscription
                  ? `You will keep access until ${format(new Date(subscription.currentPeriodEnd), "MMMM d, yyyy")}. The subscription will not renew after that. You can turn renewal back on any time before then.`
                  : "You will keep access until the end of the current period. The subscription will not renew after that."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setScheduleCancelOpen(false)}>
                Back
              </Button>
              <Button
                type="button"
                disabled={subscriptionActionLoading}
                onClick={() => void patchSubscription({ action: "schedule_cancel" })}
              >
                {subscriptionActionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Schedule cancellation"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={resumeOpen} onOpenChange={setResumeOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Keep your subscription?</DialogTitle>
              <DialogDescription>
                Turn renewal back on. Your plan will continue after{" "}
                {subscription
                  ? format(new Date(subscription.currentPeriodEnd), "MMMM d, yyyy")
                  : "the current period"}
                .
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setResumeOpen(false)}>
                Back
              </Button>
              <Button
                type="button"
                disabled={subscriptionActionLoading}
                onClick={() => void patchSubscription({ action: "resume" })}
              >
                {subscriptionActionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Resume renewal"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={immediateCancelOpen} onOpenChange={setImmediateCancelOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cancel immediately?</DialogTitle>
              <DialogDescription>
                This marks your subscription as cancelled right away. You may lose member access depending on
                hub rules. For refunds or partial periods, contact membership.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setImmediateCancelOpen(false)}>
                Back
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={subscriptionActionLoading}
                onClick={() => void patchSubscription({ action: "cancel_immediately" })}
              >
                {subscriptionActionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Cancel subscription now"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="border-border lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Payment method</CardTitle>
              <CardDescription>Card or wallet we have stored for you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : paymentMethod ? (
                <div className="flex items-start gap-3 rounded-md border border-border p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                    <CreditCard className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {(paymentMethod.brand || "Card").toUpperCase()} ending {paymentMethod.last4 || "••••"}
                    </p>
                    {paymentMethod.expiryMonth != null && paymentMethod.expiryYear != null && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Expires {String(paymentMethod.expiryMonth).padStart(2, "0")} /{" "}
                        {paymentMethod.expiryYear}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No card on file. M-Pesa or membership team can help you add one when billing is enabled for
                  your account.
                </p>
              )}
              <Button variant="outline" className="w-full" asChild>
                <a href={MEMBERSHIP_EMAIL}>Update payment details</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">M-Pesa payment</CardTitle>
              <CardDescription>
                Optional STK push for amounts you have agreed with membership. If live checkout is not enabled,
                you will see a message from the server instead of a phone prompt.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mpesa-phone">Safaricom number</Label>
                  <Input
                    id="mpesa-phone"
                    placeholder="07XX XXX XXX"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    autoComplete="tel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mpesa-amount">Amount (KES)</Label>
                  <Input
                    id="mpesa-amount"
                    type="number"
                    min="1"
                    placeholder="e.g. 25000"
                    value={mpesaAmount}
                    onChange={(e) => setMpesaAmount(e.target.value)}
                  />
                </div>
              </div>
              <Button
                className="w-full sm:w-auto"
                variant="default"
                onClick={handleMpesaPayment}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Request STK push
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Invoices */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">Invoice history</CardTitle>
                <CardDescription>Last ten invoices tied to your account.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="px-6 py-12 text-center sm:px-0">
                <Receipt className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  No invoices yet. When membership generates a bill, it will appear here with a receipt link
                  when available.
                </p>
              </div>
            ) : (
              <ul className="space-y-2 px-4 pb-4 md:hidden">
                {invoices.map((invoice) => (
                  <li
                    key={invoice.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/80 p-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {format(new Date(invoice.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-xs font-medium tabular-nums">
                        {invoice.currency} {invoice.amount.toLocaleString()}
                      </span>
                      <Badge variant="outline" className={cn("text-[10px]", invoiceStatusClass(invoice.status))}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {!isLoading && invoices.length > 0 && (
              <div className="hidden divide-y divide-border border-t border-border md:block">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-medium truncate">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(invoice.createdAt), "MMM d, yyyy")}
                        {invoice.paidAt
                          ? ` · Paid ${format(new Date(invoice.paidAt), "MMM d, yyyy")}`
                          : null}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                      <span className="text-sm font-medium tabular-nums">
                        {invoice.currency} {invoice.amount.toLocaleString()}
                      </span>
                      <Badge variant="outline" className={invoiceStatusClass(invoice.status)}>
                        {invoice.status}
                      </Badge>
                      {invoice.pdfUrl ? (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => window.open(invoice.pdfUrl!, "_blank")}
                          >
                            <ExternalLink className="mr-1.5 h-4 w-4" />
                            Open
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => {
                              const link = document.createElement("a")
                              link.href = invoice.pdfUrl!
                              link.download = `${invoice.invoiceNumber}.pdf`
                              link.click()
                            }}
                          >
                            <Download className="mr-1.5 h-4 w-4" />
                            PDF
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="rounded-md border border-dashed border-border bg-muted/20 px-4 py-3 flex gap-3 text-sm text-muted-foreground">
          <HelpCircle className="h-5 w-5 shrink-0 text-foreground/70" />
          <p>
            Questions about charges, tax receipts, or corporate billing?{" "}
            <a href={MEMBERSHIP_EMAIL} className="font-medium text-foreground underline underline-offset-2">
              Contact the membership team
            </a>
            .
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
