export type Role = 'player' | 'impostor';

export interface PlayerCard {
  number: number;
  role: Role;
  word: string; 
}

export interface FoodEntry {
  word: string;
  hint: string;
}

export function resolveImpostorCount(players: number, impostors: number, auto: boolean): number {
  if (!auto) return impostors;
  if (players < 9)  return 1;
  if (players < 19) return 2;
  return 3;
}

export function parseCSV(raw: string): FoodEntry[] {
  return raw
    .split('\n')
    .slice(1)  
    .filter(l => l.trim())
    .map(l => {
      const [word, hint] = l.split(',').map(s => s.trim());
      return { word, hint };
    });
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Shuffle array (Fisher-Yates) ---
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildCards(players: number, impostorCount: number, entry: FoodEntry): PlayerCard[] {
  // build role list: N players, M impostors
  const roles: Role[] = [
    ...Array(players - impostorCount).fill('player'),
    ...Array(impostorCount).fill('impostor'),
  ];
  const shuffledRoles = shuffle(roles);

  return shuffledRoles.map((role, i) => ({
    number: i + 1,
    role,
    word: role === 'player' ? entry.word : entry.hint,
  }));
}

export function pickStartingPlayer(players: number): number {
  return Math.floor(Math.random() * players) + 1;
}
