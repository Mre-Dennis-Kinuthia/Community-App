export async function autoImportFromRegistrationResponse(data: {
  calendarInvite?: { content: string; filename: string }
  calendarLinks?: { icsPath: string }
}): Promise<boolean> {
  if (data.calendarInvite) {
    return autoImportEventToCalendar({
      icsContent: data.calendarInvite.content,
      filename: data.calendarInvite.filename,
    })
  }
  if (data.calendarLinks?.icsPath) {
    return autoImportEventToCalendar({ icsPath: data.calendarLinks.icsPath })
  }
  return false
}

/** Import a calendar invite on the member's device (no Google Calendar tab). */
export async function autoImportEventToCalendar(options: {
  icsPath?: string
  icsContent?: string
  filename?: string
}): Promise<boolean> {
  if (typeof window === "undefined") return false

  let ics = options.icsContent
  if (!ics && options.icsPath) {
    const res = await fetch(options.icsPath)
    if (!res.ok) return false
    ics = await res.text()
  }
  if (!ics) return false

  const filename = options.filename || "event.ics"
  const mime = "text/calendar;charset=utf-8"
  const file = new File([ics], filename, { type: mime })

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename })
      return true
    } catch {
      // User dismissed share sheet — fall through to direct import.
    }
  }

  const blob = new Blob([ics], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.style.display = "none"
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 120_000)
  return true
}
