export function omitEventConsentForms<T extends { consentForms?: unknown }>(
  event: T
): Omit<T, "consentForms"> {
  const { consentForms: _consentForms, ...rest } = event
  return rest
}
