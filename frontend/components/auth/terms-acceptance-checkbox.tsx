"use client"

import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { PRIVACY_POLICY_PATH, TERMS_OF_SERVICE_PATH } from "@/lib/app-url"
import { cn } from "@/lib/utils"

type TermsAcceptanceCheckboxProps = {
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  error?: string | null
  className?: string
}

export function TermsAcceptanceCheckbox({
  id,
  checked,
  onCheckedChange,
  error,
  className,
}: TermsAcceptanceCheckboxProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-start gap-3">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5"
        />
        <label htmlFor={id} className="cursor-pointer text-sm leading-relaxed text-muted-foreground">
          I have read and agree to the{" "}
          <Link
            href={TERMS_OF_SERVICE_PATH}
            className="font-medium text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href={PRIVACY_POLICY_PATH}
            className="font-medium text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </Link>
          .
        </label>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
