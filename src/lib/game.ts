export type Role = "player" | "impostor";

export interface PlayerCard {
  number: number;
  role: Role;
  word: string; 
}

export interface CustomGamePlayerCard {
  number: number;
  role: Role;
  word: string; 
  name: string;
}

export interface WordEntry {
  word: string;
  hint: string;
}

export interface WordOnlyEntry {
  word: string;
}

export function resolveImpostorCount(players: number, impostors: number, auto: boolean): number {
  if (!auto) return impostors;
  if (players < 9)  return 1;
  if (players < 19) return 2;
  return 3;
}

export function parseCSV(raw: string): WordEntry[] {
  return raw
    .split("\n")
    .slice(1)  
    .filter(l => l.trim())
    .map(l => {
      const [word, hint] = l.split(",").map(s => s.trim());
      return { word, hint };
    });
}

export function parseCSVForHintless(raw: string): WordOnlyEntry[] {
  return raw
    .split("\n")
    .slice(1)
    .filter(l => l.trim())
    .map(l => {
      const [word] = l.split(",");
      return { word: word.trim() };
    });
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- shuffle array (Fisher-Yates) ---
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function syncPlayerNames(count: number, existing: string[] = []): string[] {
  return Array.from({ length: count }, (_, i) => existing[i] ?? "");
}

function resolveName(names: string[], index: number): string {
  const raw = names[index]?.trim();
  return raw ? raw : `Player ${index + 1}`;
}

const PLAYER_NAMES_STORAGE_KEY = "impostor:playerNames";

export function loadStoredNames(): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(PLAYER_NAMES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function saveStoredNames(names: string[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(PLAYER_NAMES_STORAGE_KEY, JSON.stringify(names));
  } catch {
    alert("Something went wrong saving persistenly the names");
    // ignore quota / serialization errors — names just won't persist this time
  }
}

export function buildCards(players: number, impostorCount: number, entry: WordEntry): PlayerCard[] {
  // build role list: N players, M impostors
  const roles: Role[] = [
    ...Array(players - impostorCount).fill("player"),
    ...Array(impostorCount).fill("impostor"),
  ];
  const shuffledRoles = shuffle(roles);

  return shuffledRoles.map((role, i) => ({
    number: i + 1,
    role,
    word: role === "player" ? entry.word : entry.hint,
  }));
}

export function buildCardsWithNames(
  players: number,
  impostorCount: number,
  entry: WordEntry,
  names: string[] = []
): CustomGamePlayerCard[] {
  // build role list: N players, M impostors
  const roles: Role[] = [
    ...Array(players - impostorCount).fill("player"),
    ...Array(impostorCount).fill("impostor"),
  ];
  const shuffledRoles = shuffle(roles);

  return shuffledRoles.map((role, i) => ({
    number: i + 1,
    role,
    word: role === "player" ? entry.word : entry.hint, 
    name: resolveName(names, i)
  }));
}

export function buildCardsHintlessWithNames(
  players: number,
  impostorCount: number,
  entry: WordOnlyEntry,
  names: string[] = []
): CustomGamePlayerCard[] {
  const roles: Role[] = [
    ...Array(players - impostorCount).fill("player"),
    ...Array(impostorCount).fill("impostor"),
  ];
  const shuffledRoles = shuffle(roles);

  return shuffledRoles.map((role, i) => ({
    number: i + 1,
    role,
    word: role === "player" ? entry.word : "",
    name: resolveName(names, i),
  }));
}

export function pickStartingPlayer(players: number): number {
  return Math.floor(Math.random() * players) + 1;
}

