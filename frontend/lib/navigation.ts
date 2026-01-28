/**
 * Notify the top loading bar that a programmatic navigation has started.
 * Call this before router.push() or router.replace() when navigating to another page.
 * Link clicks and popstate are handled automatically.
 */
export function startNavigation(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("navigationStart"))
  }
}
