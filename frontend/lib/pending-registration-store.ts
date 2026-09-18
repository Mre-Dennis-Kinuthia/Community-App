import "server-only"

import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import {
  buildPendingRegistration,
  mergePendingRegistrationFile,
  type PendingRegistration,
  type PendingRegistrationFile,
} from "@/lib/pending-registration"

function fileCandidates(): string[] {
  const name = "pending-registrations.json"
  return [
    join(process.cwd(), "data", name),
    join("/tmp", "impact-hub", name),
  ]
}

async function readStore(path: string): Promise<PendingRegistrationFile | null> {
  try {
    const raw = await readFile(path, "utf8")
    const parsed = JSON.parse(raw) as PendingRegistrationFile
    if (!parsed || !Array.isArray(parsed.signups)) return null
    return parsed
  } catch {
    return null
  }
}

export async function capturePendingRegistrationJson(input: {
  email: string
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  organisational?: boolean
}): Promise<{ signup: PendingRegistration; json: string; filePath: string | null }> {
  const signup = buildPendingRegistration(input)
  let existing: PendingRegistrationFile | null = null
  for (const path of fileCandidates()) {
    existing = await readStore(path)
    if (existing) break
  }

  const next = mergePendingRegistrationFile(existing, signup)
  const json = `${JSON.stringify(next, null, 2)}\n`

  let filePath: string | null = null
  for (const path of fileCandidates()) {
    try {
      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, json, "utf8")
      filePath = path
      break
    } catch (error) {
      console.warn("[PENDING REGISTRATIONS] Could not write", path, error)
    }
  }

  return {
    signup,
    json: `${JSON.stringify(signup, null, 2)}\n`,
    filePath,
  }
}
