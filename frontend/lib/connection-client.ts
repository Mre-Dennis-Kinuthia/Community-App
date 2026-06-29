type ConnectionActionResult = {
  ok: boolean
  status: number
  data: Record<string, unknown>
  error?: string
}

async function parseJsonResponse(res: Response): Promise<Record<string, unknown>> {
  return res.json().catch(() => ({}))
}

function connectionErrorMessage(
  status: number,
  data: Record<string, unknown>,
  fallback: string
): string {
  if (status === 401) {
    return "Your session may have expired. Please sign in again."
  }
  return typeof data.error === "string" ? data.error : fallback
}

export async function sendConnectionRequest(toUserId: string): Promise<ConnectionActionResult> {
  const res = await fetch("/api/connections", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toUserId }),
  })
  const data = await parseJsonResponse(res)
  return {
    ok: res.ok,
    status: res.status,
    data,
    error: res.ok
      ? undefined
      : connectionErrorMessage(res.status, data, "Could not send connection request"),
  }
}

export async function respondToConnectionRequest(
  connectionId: string,
  status: "accepted" | "rejected"
): Promise<ConnectionActionResult> {
  const res = await fetch(`/api/connections/${connectionId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  const data = await parseJsonResponse(res)
  return {
    ok: res.ok,
    status: res.status,
    data,
    error: res.ok
      ? undefined
      : connectionErrorMessage(res.status, data, "Could not update connection request"),
  }
}
