/**
 * Shared fetcher for SWR. Throws on non-ok response so SWR treats it as error.
 */
export async function fetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    let info: unknown
    try {
      info = await res.json()
    } catch {
      info = await res.text()
    }
    const err = new Error(
      typeof (info as { error?: string })?.error === "string"
        ? (info as { error: string }).error
        : "An error occurred while fetching the data."
    ) as Error & { info?: unknown; status?: number }
    err.status = res.status
    err.info = info
    throw err
  }
  return res.json() as Promise<T>
}

export const SWR_CONFIG = {
  dedupingInterval: 2000,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  errorRetryCount: 2,
} as const
