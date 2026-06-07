"use client"

import { useEffect, useMemo, useState } from "react"
import { isPasswordPwnedClient } from "@/lib/hibp-client"
import { PASSWORD_MIN_LENGTH, PASSWORD_PWNED_MESSAGE } from "@/lib/password-policy"
import {
  MIN_PASSWORD_STRENGTH_SCORE,
  PASSWORD_STRENGTH_LABELS,
  scorePassword,
} from "@/lib/password-strength"
import { cn } from "@/lib/utils"

type PasswordStrengthMeterProps = {
  password: string
  email?: string
  name?: string
  className?: string
  onPwnedChange?: (pwned: boolean | null) => void
}

const BAR_COLORS = [
  "bg-destructive",
  "bg-orange-500",
  "bg-amber-500",
  "bg-lime-500",
  "bg-green-600",
] as const

export function PasswordStrengthMeter({
  password,
  email,
  name,
  className,
  onPwnedChange,
}: PasswordStrengthMeterProps) {
  const strength = useMemo(
    () => scorePassword(password, { email, name }),
    [password, email, name]
  )
  const [pwned, setPwned] = useState<boolean | null>(null)
  const [breachCheckPending, setBreachCheckPending] = useState(false)

  useEffect(() => {
    onPwnedChange?.(pwned)
  }, [pwned, onPwnedChange])

  useEffect(() => {
    if (password.length < PASSWORD_MIN_LENGTH) {
      setPwned(null)
      setBreachCheckPending(false)
      return
    }

    setBreachCheckPending(true)
    let cancelled = false

    const timer = setTimeout(() => {
      void isPasswordPwnedClient(password)
        .then((isPwned) => {
          if (!cancelled) setPwned(isPwned)
        })
        .catch(() => {
          if (!cancelled) setPwned(null)
        })
        .finally(() => {
          if (!cancelled) setBreachCheckPending(false)
        })
    }, 400)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [password])

  if (!password) return null

  const score = strength?.score ?? 0
  const barWidth = `${((score + 1) / 5) * 100}%`

  return (
    <div
      id="password-strength"
      className={cn("space-y-2", className)}
      aria-live="polite"
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span
            className={cn(
              "font-medium",
              score <= 1 && "text-destructive",
              score === 2 && "text-amber-600",
              score >= 3 && "text-green-700"
            )}
          >
            {strength?.label ?? "Very weak"}
          </span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={4}
          aria-valuenow={score}
          aria-label={`Password strength: ${strength?.label ?? "Very weak"}`}
        >
          <div
            className={cn("h-full rounded-full transition-all duration-300", BAR_COLORS[score])}
            style={{ width: barWidth }}
          />
        </div>
      </div>

      {strength?.feedback ? (
        <p className="text-xs text-muted-foreground">{strength.feedback}</p>
      ) : null}

      {password.length >= PASSWORD_MIN_LENGTH && score < MIN_PASSWORD_STRENGTH_SCORE ? (
        <p className="text-xs text-destructive" role="alert">
          Need at least &quot;{PASSWORD_STRENGTH_LABELS[MIN_PASSWORD_STRENGTH_SCORE]}&quot; strength
          to continue.
        </p>
      ) : null}

      {breachCheckPending ? (
        <p className="text-xs text-muted-foreground">Checking against known data breaches…</p>
      ) : null}

      {pwned ? (
        <p className="text-xs text-destructive" role="alert">
          {PASSWORD_PWNED_MESSAGE}
        </p>
      ) : null}

      {!breachCheckPending && pwned === false && password.length >= PASSWORD_MIN_LENGTH ? (
        <p className="text-xs text-green-700">Not found in known data breaches.</p>
      ) : null}
    </div>
  )
}
