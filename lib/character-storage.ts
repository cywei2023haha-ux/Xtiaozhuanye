/** R2 bucket root for character set image folders */
export const CHARACTER_OUTPUT_PREFIX = "My_AI_Output";

export const CHARACTER_SLOT_COUNT = 5;

/** Slot filenames: 01.webp … 05.webp */
export function characterSlotFilename(slot: number): string {
  const n = Math.min(Math.max(Math.floor(slot), 1), CHARACTER_SLOT_COUNT);
  return `${String(n).padStart(2, "0")}.webp`;
}

export function buildCharacterObjectKey(folderSlug: string, slot: number): string {
  const safeFolder = folderSlug.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${CHARACTER_OUTPUT_PREFIX}/${safeFolder}/${characterSlotFilename(slot)}`;
}

export function slugifyCharacterFolder(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9._-]/g, "");
}

export function formatCharacterDisplayName(folderSlug: string): string {
  return folderSlug
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
