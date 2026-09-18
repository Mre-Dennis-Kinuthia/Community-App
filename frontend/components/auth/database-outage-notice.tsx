"use client"

import { useEffect, useState } from "react"

type DatabaseHealth = { ok: boolean } | null

export function useDatabaseHealth() {
  const [health, setHealth] = useState<DatabaseHealth>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch("/api/health/database", { cache: "no-store" })
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean }
        if (!cancelled) setHealth({ ok: data.ok === true && res.ok })
      } catch {
        if (!cancelled) setHealth({ ok: false })
      }
    }
    void load()
    const id = window.setInterval(load, 60_000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  return health
}

export function DatabaseOutageNotice({
  title,
  children,
}: {
  title: string
  children: string
}) {
  return (
    <div
      role="status"
      className="mb-4 rounded-md border border-[#812926]/20 bg-[#fdf2f4] px-3 py-3 text-sm text-[#0a1f38]"
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-1 leading-relaxed text-[#1c395c]/90">{children}</p>
    </div>
  )
}
