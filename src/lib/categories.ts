import foodRaw from "$lib/assets/final_food.csv?raw";
import sportsRaw from "$lib/assets/sports.csv?raw";
import countriesRaw from "$lib/assets/countries.csv?raw";

import esFoodRaw from "$lib/assets/es_final_food.csv?raw";
import esSportsRaw from "$lib/assets/es_sports.csv?raw";
import esCountriesRaw from "$lib/assets/es_countries.csv?raw";

import type { Language, TranslationKey } from "$lib/i18n.svelte";

export type CategoryId = "food" | "sports" | "countries";

export interface CategoryInfo {
  id: CategoryId;
  translationKey: TranslationKey;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: "food", translationKey: "categories.food" },
  { id: "sports", translationKey: "categories.sports" },
  { id: "countries", translationKey: "categories.countries" },
];

export function getCategoryData(id: CategoryId, lang: Language): string {
  if (lang === "es") {
    switch (id) {
      case "food": return esFoodRaw;
      case "sports": return esSportsRaw;
      case "countries": return esCountriesRaw;
    }
  }
  switch (id) {
    case "food": return foodRaw;
    case "sports": return sportsRaw;
    case "countries": return countriesRaw;
  }
}

export function getAllDatasets(lang: Language): string[] {
  return CATEGORIES.map((c) => getCategoryData(c.id, lang));
}
