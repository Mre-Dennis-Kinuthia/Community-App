/**
 * UI feature toggles. Routes and nav items stay in the codebase; set flags to false to hide/block.
 */
export const FEATURE_FLAGS = {
  programsAndResources: true,
  myProjects: false,
  investmentsDealflow: false,
  projectsAndInitiatives: false,
  // Workspace platform expansion
  spaceInventory: true,
  visitorManagement: true,
  deliveryManagement: true,
  operationsModule: true,
  accessControl: true,
  advancedReporting: true,
} as const

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS

/** Whether a platform feature flag is enabled */
export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  return FEATURE_FLAGS[flag]
}

const NAV_HREF_FLAGS: Record<string, FeatureFlagKey> = {
  "/resources": "programsAndResources",
  "/opportunities": "programsAndResources",
  "/dashboard/projects": "myProjects",
  "/dashboard/visitors": "visitorManagement",
  "/dashboard/deliveries": "deliveryManagement",
  "/investments": "investmentsDealflow",
  "/projects": "projectsAndInitiatives",
}

/** Whether a sidebar/mobile nav link should render */
export function isNavHrefEnabled(href: string): boolean {
  const flag = NAV_HREF_FLAGS[href]
  if (!flag) return true
  return FEATURE_FLAGS[flag]
}

/** Whether a pathname is blocked (redirect away in middleware) */
export function isDeactivatedRoute(pathname: string): boolean {
  if (!FEATURE_FLAGS.programsAndResources) {
    if (pathname === "/resources" || pathname.startsWith("/resources/")) return true
    if (pathname === "/opportunities" || pathname.startsWith("/opportunities/")) return true
  }
  if (!FEATURE_FLAGS.myProjects) {
    if (pathname === "/dashboard/projects" || pathname.startsWith("/dashboard/projects/")) return true
  }
  if (!FEATURE_FLAGS.investmentsDealflow) {
    if (pathname === "/investments" || pathname.startsWith("/investments/")) return true
  }
  if (!FEATURE_FLAGS.projectsAndInitiatives) {
    if (pathname === "/projects" || pathname.startsWith("/projects/")) return true
  }
  if (!FEATURE_FLAGS.visitorManagement) {
    if (pathname === "/dashboard/visitors" || pathname.startsWith("/dashboard/visitors/")) return true
  }
  if (!FEATURE_FLAGS.deliveryManagement) {
    if (pathname === "/dashboard/deliveries" || pathname.startsWith("/dashboard/deliveries/")) return true
  }
  return false
}

/** Filter global search result types */
export function isSearchTypeEnabled(type: string): boolean {
  if (type === "project" && !FEATURE_FLAGS.projectsAndInitiatives) return false
  if (type === "resource" && !FEATURE_FLAGS.programsAndResources) return false
  return true
}

export function isSearchHrefEnabled(href: string): boolean {
  if (!FEATURE_FLAGS.projectsAndInitiatives && (href === "/projects" || href.startsWith("/projects/"))) {
    return false
  }
  if (!FEATURE_FLAGS.programsAndResources && (href === "/resources" || href.startsWith("/resources/"))) {
    return false
  }
  if (!FEATURE_FLAGS.programsAndResources && (href === "/opportunities" || href.startsWith("/opportunities/"))) {
    return false
  }
  if (!FEATURE_FLAGS.investmentsDealflow && href.startsWith("/investments")) {
    return false
  }
  return true
}
