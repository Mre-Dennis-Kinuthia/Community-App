/** Maps member booking resourceType to SpaceAssetType enum values */
export const RESOURCE_TO_ASSET_TYPE: Record<string, string> = {
  "hot-desk": "hot_desk",
  "meeting-room": "meeting_room",
  "private-office": "private_office",
  "event-space": "event_space",
}

export function resourceTypeToAssetType(resourceType: string): string | null {
  return RESOURCE_TO_ASSET_TYPE[resourceType] ?? null
}

export function assetTypeToResourceType(assetType: string): string {
  const map: Record<string, string> = {
    hot_desk: "hot-desk",
    dedicated_desk: "hot-desk",
    meeting_room: "meeting-room",
    private_office: "private-office",
    phone_booth: "meeting-room",
    event_space: "event-space",
  }
  return map[assetType] ?? assetType.replace(/_/g, "-")
}
