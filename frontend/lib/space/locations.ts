import { prisma } from "@/lib/prisma"

export class LocationResolutionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "LocationResolutionError"
  }
}

/** Ensure a Location row exists for each active workspace listing. */
export async function ensureLocationForWorkspace(workspaceId: string) {
  const existing = await prisma.location.findFirst({
    where: { workspaceId, isActive: true },
  })
  if (existing) return existing

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, isActive: true, deletedAt: null },
  })
  if (!workspace) {
    throw new LocationResolutionError("Workspace not found")
  }

  const bySlug = await prisma.location.findUnique({ where: { slug: workspace.slug } })
  if (bySlug) {
    if (!bySlug.workspaceId) {
      return prisma.location.update({
        where: { id: bySlug.id },
        data: { workspaceId: workspace.id, isActive: true },
      })
    }
    if (bySlug.workspaceId === workspace.id) return bySlug
  }

  const slug = bySlug ? `${workspace.slug}-${workspace.id.slice(-6)}` : workspace.slug

  return prisma.location.create({
    data: {
      name: workspace.name,
      slug,
      address: workspace.address ?? workspace.location ?? null,
      workspaceId: workspace.id,
      isActive: true,
    },
  })
}

/** Sync hub locations from workspace listings (idempotent). */
export async function syncHubLocationsFromWorkspaces() {
  const workspaces = await prisma.workspace.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { name: "asc" },
  })

  const locations = []
  for (const workspace of workspaces) {
    locations.push(await ensureLocationForWorkspace(workspace.id))
  }

  // Include any manually created locations not tied to a workspace
  const manual = await prisma.location.findMany({
    where: { isActive: true, workspaceId: null },
    orderBy: { name: "asc" },
  })

  const byId = new Map<string, (typeof locations)[0]>()
  for (const loc of [...locations, ...manual]) {
    byId.set(loc.id, loc)
  }

  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export type HubLocation = {
  id: string
  name: string
  slug: string
  workspaceId: string | null
  workspaceName: string | null
}

export async function listHubLocations(): Promise<HubLocation[]> {
  const rows = await syncHubLocationsFromWorkspaces()
  const workspaceIds = rows.map((r) => r.workspaceId).filter(Boolean) as string[]
  const workspaces =
    workspaceIds.length > 0
      ? await prisma.workspace.findMany({
          where: { id: { in: workspaceIds } },
          select: { id: true, name: true },
        })
      : []
  const workspaceNames = new Map(workspaces.map((w) => [w.id, w.name]))

  return rows.map((loc) => ({
    id: loc.id,
    name: loc.name,
    slug: loc.slug,
    workspaceId: loc.workspaceId,
    workspaceName: loc.workspaceId ? workspaceNames.get(loc.workspaceId) ?? loc.name : null,
  }))
}

export async function resolveLocationId(input: {
  locationId?: string | null
  workspaceId?: string | null
}): Promise<string> {
  const hubs = await listHubLocations()

  if (input.locationId) {
    const match = hubs.find((h) => h.id === input.locationId)
    if (match) return match.id
  }

  if (input.workspaceId) {
    const loc = await ensureLocationForWorkspace(input.workspaceId)
    return loc.id
  }

  if (hubs.length === 0) {
    throw new LocationResolutionError(
      "No hubs available yet. Ask an admin to add a workspace listing."
    )
  }

  if (hubs.length === 1) {
    return hubs[0].id
  }

  throw new LocationResolutionError("Please select which hub this is for.")
}
