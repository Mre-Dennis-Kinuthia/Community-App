export type PresetAvatar = {
  id: string
  path: `/avatars/${string}.svg`
  label: string
}

/** Curated community avatars — static SVGs in /public/avatars. */
export const PRESET_AVATARS: PresetAvatar[] = [
  { id: "panda", path: "/avatars/panda.svg", label: "Panda" },
  { id: "fox", path: "/avatars/fox.svg", label: "Fox" },
  { id: "owl", path: "/avatars/owl.svg", label: "Owl" },
  { id: "bunny", path: "/avatars/bunny.svg", label: "Bunny" },
  { id: "cat", path: "/avatars/cat.svg", label: "Cat" },
  { id: "bear", path: "/avatars/bear.svg", label: "Bear" },
  { id: "penguin", path: "/avatars/penguin.svg", label: "Penguin" },
  { id: "koala", path: "/avatars/koala.svg", label: "Koala" },
  { id: "lion", path: "/avatars/lion.svg", label: "Lion" },
  { id: "frog", path: "/avatars/frog.svg", label: "Frog" },
  { id: "unicorn", path: "/avatars/unicorn.svg", label: "Unicorn" },
  { id: "otter", path: "/avatars/otter.svg", label: "Otter" },
]

const presetPathSet = new Set(PRESET_AVATARS.map((a) => a.path))

export function isPresetAvatarPath(value: string | null | undefined): boolean {
  if (!value?.trim()) return false
  return presetPathSet.has(value.trim() as PresetAvatar["path"])
}

export function getPresetAvatar(value: string | null | undefined): PresetAvatar | undefined {
  if (!value?.trim()) return undefined
  return PRESET_AVATARS.find((a) => a.path === value.trim())
}
