import { zxcvbn, zxcvbnOptions, type ZxcvbnResult } from "@zxcvbn-ts/core"
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common"
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en"

let optionsInitialized = false

function ensureZxcvbnOptions() {
  if (optionsInitialized) return
  zxcvbnOptions.setOptions({
    translations: zxcvbnEnPackage.translations,
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    dictionary: {
      ...zxcvbnCommonPackage.dictionary,
      ...zxcvbnEnPackage.dictionary,
    },
  })
  optionsInitialized = true
}

export const PASSWORD_STRENGTH_LABELS = [
  "Very weak",
  "Weak",
  "Fair",
  "Good",
  "Strong",
] as const

/** Minimum zxcvbn score required (0–4). 3 = Good. */
export const MIN_PASSWORD_STRENGTH_SCORE = 3

export type PasswordStrengthLabel = (typeof PASSWORD_STRENGTH_LABELS)[number]

export type ScorePasswordOptions = {
  email?: string
  name?: string
}

export type PasswordStrengthResult = {
  score: number
  label: PasswordStrengthLabel
  feedback: string | null
  crackTimeDisplay: string
}

function buildUserInputs(options: ScorePasswordOptions = {}): string[] {
  const inputs: string[] = ["impacthub", "impact hub", "nairobi", "community"]
  if (options.email) {
    const local = options.email.split("@")[0]?.trim()
    if (local) inputs.push(local.toLowerCase())
    inputs.push(options.email.toLowerCase())
  }
  if (options.name?.trim()) {
    inputs.push(options.name.trim().toLowerCase())
    for (const part of options.name.trim().split(/\s+/)) {
      if (part.length >= 3) inputs.push(part.toLowerCase())
    }
  }
  return inputs
}

export function scorePassword(
  password: string,
  options: ScorePasswordOptions = {}
): PasswordStrengthResult | null {
  if (!password) return null

  ensureZxcvbnOptions()
  const result: ZxcvbnResult = zxcvbn(password, buildUserInputs(options))
  const warning = result.feedback.warning?.trim()
  const suggestion = result.feedback.suggestions[0]?.trim()
  const feedback = warning || suggestion || null

  return {
    score: result.score,
    label: PASSWORD_STRENGTH_LABELS[result.score] ?? "Very weak",
    feedback,
    crackTimeDisplay: result.crackTimesDisplay.offlineSlowHashing1e4PerSecond,
  }
}

export function getPasswordStrengthError(
  password: string,
  options: ScorePasswordOptions = {}
): string | null {
  if (!password) return null

  const result = scorePassword(password, options)
  if (!result || result.score >= MIN_PASSWORD_STRENGTH_SCORE) return null

  const requiredLabel = PASSWORD_STRENGTH_LABELS[MIN_PASSWORD_STRENGTH_SCORE]
  if (result.feedback) {
    return `Password is too weak (${result.label}). ${result.feedback} Aim for at least "${requiredLabel}" strength.`
  }
  return `Password is too weak (${result.label}). Aim for at least "${requiredLabel}" strength.`
}
