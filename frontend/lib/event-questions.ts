export type RegistrationQuestionType = "text" | "textarea" | "select"

export interface RegistrationQuestion {
  id: string
  label: string
  type: RegistrationQuestionType
  required: boolean
  options?: string[]
}

export function parseRegistrationQuestions(raw: unknown): RegistrationQuestion[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(
      (q): q is RegistrationQuestion =>
        typeof q === "object" &&
        q !== null &&
        typeof (q as RegistrationQuestion).id === "string" &&
        typeof (q as RegistrationQuestion).label === "string"
    )
    .map((q) => ({
      id: q.id,
      label: q.label,
      type: q.type === "textarea" || q.type === "select" ? q.type : "text",
      required: Boolean(q.required),
      options: Array.isArray(q.options) ? q.options.filter(Boolean) : undefined,
    }))
}

export function validateRegistrationAnswers(
  questions: RegistrationQuestion[],
  answers: Record<string, string>
): string | null {
  for (const q of questions) {
    const value = answers[q.id]?.trim() ?? ""
    if (q.required && !value) {
      return `"${q.label}" is required`
    }
  }
  return null
}

export function formatEventPrice(price: number | null | undefined, currency = "KES"): string | null {
  if (price == null || price <= 0) return null
  try {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price)
  } catch {
    return `${currency} ${price}`
  }
}

export function isPaidEvent(price: number | null | undefined): boolean {
  return price != null && price > 0
}
