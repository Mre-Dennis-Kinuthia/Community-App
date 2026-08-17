/** Local Impact Hub Nairobi space photos (see scripts/import-hub-photos.mjs). */
export const LANDING_IMAGES = {
  hero: "/landing/hero.jpg",
  authPanel: "/landing/auth-panel.jpg",
  pillars: {
    programs: "/landing/pillar-programs.jpg",
    coworking: "/landing/pillar-coworking.jpg",
    innovation: "/landing/pillar-innovation.jpg",
    partnerships: "/landing/pillar-partnerships.jpg",
  },
} as const

/**
 * Hub interior/exterior photos for landing sections.
 * Avoid pairing with LANDING_IMAGES that share the same source
 * (hero≈exterior-day, coworking≈coworking-shared, auth≈coworking-branded).
 */
export const HUB_IMAGES = {
  exteriorDayAlt: "/hub/exterior-day-alt.jpg",
  exteriorDusk: "/hub/exterior-dusk.jpg",
  exteriorDuskAlt: "/hub/exterior-dusk-alt.jpg",
  exteriorPath: "/hub/exterior-path.jpg",
  coworkingPlants: "/hub/coworking-plants.jpg",
  privateOffice: "/hub/private-office.jpg",
  privateOfficeAlt: "/hub/private-office-alt.jpg",
  privateOfficeLamps: "/hub/private-office-lamps.jpg",
  privateOfficeWindow: "/hub/private-office-window.jpg",
  deskDetail: "/hub/desk-detail.jpg",
} as const

export const IHN_BRAND = {
  primary: "#822929",
  navy: "#1c395c",
  navyDeep: "#0a1f38",
  surface: "#f3f5f8",
  surfaceAlt: "#edeff2",
  cream: "#faf9f6",
  gold: "#ffd546",
} as const
