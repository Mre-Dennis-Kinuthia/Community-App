"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { AUTH_LINK, AUTH_PRIMARY_BTN } from "@/components/auth/auth-form-styles"
import { Loader2 } from "lucide-react"

function ConfirmNewsletterContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const [status, setStatus] = useState<"ready" | "loading" | "success" | "error">(
    token ? "ready" : "error"
  )
  const [message, setMessage] = useState(
    token
      ? "Confirm that you want to receive Impact Hub Nairobi updates."
      : "This confirmation link is incomplete. Please subscribe again."
  )

  const confirm = async () => {
    setStatus("loading")
    try {
      const response = await fetch("/api/newsletter/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const result = await response.json()
      if (!response.ok) {
        setStatus("error")
        setMessage(result.error || "Could not confirm this subscription.")
        return
      }
      setStatus("success")
      setMessage(result.message || "Your subscription is confirmed.")
    } catch {
      setStatus("error")
      setMessage("Could not confirm this subscription. Please try again.")
    }
  }

  return (
    <AuthPageShell title="Newsletter confirmation" subtitle={message}>
      <div className="space-y-4">
        {status === "ready" && (
          <Button className={AUTH_PRIMARY_BTN} onClick={() => void confirm()}>
            Confirm subscription
          </Button>
        )}
        {status === "loading" && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {status === "success" && (
          <p className="text-center text-sm">
            <Link href="/" className={AUTH_LINK}>
              Return to Impact Hub Nairobi
            </Link>
          </p>
        )}
        {status === "error" && (
          <p className="text-center text-sm">
            <Link href="/newsletter" className={AUTH_LINK}>
              Subscribe again
            </Link>
          </p>
        )}
      </div>
    </AuthPageShell>
  )
}

export default function ConfirmNewsletterPage() {
  return (
    <Suspense
      fallback={
        <AuthPageShell title="Newsletter confirmation" subtitle="Loading confirmation…">
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </AuthPageShell>
      }
    >
      <ConfirmNewsletterContent />
    </Suspense>
  )
}
