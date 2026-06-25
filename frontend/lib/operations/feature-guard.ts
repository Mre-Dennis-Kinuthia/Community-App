import { isFeatureEnabled } from "@/lib/feature-flags"

export function isOperationsEnabled(): boolean {
  return isFeatureEnabled("operationsModule")
}
