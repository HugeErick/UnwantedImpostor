// lib/categories.ts
import type { Language, TranslationKey } from "$lib/i18n.svelte";

// eagerly grab every csv in assets as raw text at build time.
// adding a new file here requires zero code changes.
const csvModules = import.meta.glob("./assets/*.csv", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

// filename (without extension) -> raw content
const fileMap: Record<string, string> = {};
for (const path in csvModules) {
  const filename = path.split("/").pop()!.replace(/\.csv$/, "");
  fileMap[filename] = csvModules[path];
}

export type CategoryId = string;

export interface CategoryInfo {
  id: CategoryId;
  translationKey: TranslationKey;
}

// derive the set of category ids from filenames, stripping the "es_" prefix.
const ids = new Set<string>();
for (const filename in fileMap) {
  const id = filename.startsWith("es_") ? filename.slice(3) : filename;
  ids.add(id);
}

export const CATEGORIES: CategoryInfo[] = [...ids].sort().map((id) => ({
  id,
  // convention: translation key is always "categories.<id>"
  // make sure you add this key to both locale files when adding a category.
  translationKey: `categories.${id}` as TranslationKey,
}));

export function getCategoryData(id: CategoryId, lang: Language): string {
  if (lang === "es") {
    const esContent = fileMap[`es_${id}`];
    if (esContent) return esContent;
    // fall back to English if no Spanish file exists yet
  }
  return fileMap[id];
}

export function getAllDatasets(lang: Language): string[] {
  return CATEGORIES.map((c) => getCategoryData(c.id, lang));
}
