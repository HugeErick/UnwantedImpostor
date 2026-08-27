export type Language = "en" | "es";

const LANGUAGE_STORAGE_KEY = "impostor:language";

const translations = {
  en: {
    home: {
      title: "Impostor Game",
      by: "By",
      quickPlay: "Quick Play",
      customGame: "Custom Game",
    },
    setup: {
      categoriesAvailable: "Categories available:",
      quickPlayCategories: "Food | Sports | Countries",
      players: "Players",
      impostors: "Impostors",
      autoImpostors: "Auto-manage impostors based on player count",
      autoImpostorsTT: "1 impostor for 1–8 players, 2 for 9–18 players, and 3 for 19+ players.",
      playerPrefix: "Player",
    },
    categories: {
      food: "Food",
      sports: "Sports",
      countries: "Countries",
    },
    customgame: {
      title: "Custom Game",
      gameMode: "Game Mode :",
      classic: "Classic",
      hintless: "Hintless",
      classicUpper: "CLASSIC",
      hintlessUpper: "HINTLESS",
      playerNames: "Player names",
      optional: "(optional)",
      playerPlaceholder: "Player {number}",
      categoriesNotSaved: "categories are not being saved",
    },
    reveal: {
      passPhoneToNum: "Pass the phone to Player #{number}",
      passPhoneToName: "Pass the phone to {name}",
      tapToReveal: "Tap to reveal",
      keepSecret: "Make sure no one else is watching",
      youAreImpostor: "You are the Impostor",
      youArePlayer: "You are a Player",
      noClueForYou: "No clue 4 u",
      hintlessActive: "hintless mode active",
      hintImpostor: "This is your hint — stay sneaky.",
      hintPlayer: "This is the secret word.",
      nextPlayer: "Next Player",
    },
    start: {
      gameOn: "Game on!",
      playerStartsNum: "Player #{number}",
      goesFirst: "goes first",
      playAgain: "Play Again",
    },
    common: {
      startGame: "Start Game",
      goBack: "Go back",
    },
    workingOnGUI: {
      title: "Working on the following feature:",
    },
    // en layout
    layout: {
      toggleLanguage: "Switch language",
      toggleLanguageLocked: "Language is locked during a game",
      cancelGame: "Cancel game",
      cancelGameTT: "Cancel the current game and return to settings",
      namesNotSaved: "Something went wrong saving persistenly the names",
    },
  },
  es: {
    home: {
      title: "Juego del Impostor",
      by: "Por",
      quickPlay: "Juego Rápido",
      customGame: "Juego Personalizado",
    },
    setup: {
      categoriesAvailable: "Categorías disponibles:",
      quickPlayCategories: "Comida | Deportes | Países",
      players: "Jugadores",
      impostors: "Impostores",
      autoImpostors: "Autogestionar impostores según la cantidad de jugadores",
      autoImpostorsTT: "1 impostor para 1–8 jugadores, 2 para 9–18 jugadores y 3 para 19 o más.",
      playerPrefix: "Jugador",
    },
    categories: {
      food: "Comida",
      sports: "Deportes",
      countries: "Países",
    },
    customgame: {
      title: "Juego Personalizado",
      gameMode: "Modo de Juego :",
      classic: "Clásico",
      hintless: "Sin Pistas",
      classicUpper: "CLÁSICO",
      hintlessUpper: "SIN PISTAS",
      playerNames: "Nombres de los jugadores",
      optional: "(opcional)",
      playerPlaceholder: "Jugador {number}",
      categoriesNotSaved: "Las categorías no se están guardando",
    },
    reveal: {
      passPhoneToNum: "Pasa el teléfono al Jugador #{number}",
      passPhoneToName: "Pasa el teléfono a {name}",
      tapToReveal: "Toca para revelar",
      keepSecret: "Asegúrate de que nadie más esté mirando",
      youAreImpostor: "Eres el Impostor",
      youArePlayer: "Eres un Jugador",
      noClueForYou: "Sin pistas para ti",
      hintlessActive: "modo sin pistas activo",
      hintImpostor: "Esta es tu pista — mantente sigiloso.",
      hintPlayer: "Esta es la palabra secreta.",
      nextPlayer: "Siguiente Jugador",
    },
    start: {
      gameOn: "¡A jugar!",
      playerStartsNum: "Jugador #{number}",
      goesFirst: "comienza primero",
      playAgain: "Jugar de nuevo",
    },
    common: {
      startGame: "Iniciar Juego",
      goBack: "Volver",
    },
    workingOnGUI: {
      title: "Trabajando en la siguiente función:",
    },
    // es layout
    layout: {
      toggleLanguage: "Cambiar idioma",
      toggleLanguageLocked: "El idioma está bloqueado durante una partida",
      cancelGame: "Cancelar partida",
      cancelGameTT: "Cancela la partida actual y vuelve a los ajustes",
      namesNotSaved: "Algo salió mal al guardar los nombres persistentemente",
    },
  },
} as const;

type LeafKeys<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}.${LeafKeys<T[K]>}`
        : K;
    }[keyof T & string]
  : never;

export type TranslationKey = LeafKeys<typeof translations.en>;

function getInitialLanguage(): Language {
  if (typeof localStorage === "undefined") return "en";
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === "en" || stored === "es") return stored;
    if (typeof navigator !== "undefined" && navigator.language?.startsWith("es")) {
      return "es";
    }
  } catch {
    alert("language failed to initialize");
  }
  return "en";
}

let currentLang = $state<Language>(getInitialLanguage());
let gameLocked = $state(false);
let cancelGame = $state<(() => void) | null>(null);

export const i18n = {
  get lang() {
    return currentLang;
  },
  set lang(val: Language) {
    if (gameLocked) return;
    currentLang = val;
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, val);
      } catch {}
    }
  },
  get cancelGame() {
    return cancelGame;
  },
  set cancelGame(fn: (() => void) | null) {
    cancelGame = fn;
  },
  get locked() {
    return gameLocked;
  },
  set locked(val: boolean) {
    gameLocked = val;
  },
  toggle() {
    if (gameLocked) return;
    this.lang = currentLang === "en" ? "es" : "en";
  },
  t(key: TranslationKey, params?: Record<string, string | number>): string {
    const keys = key.split(".");
    let val: any = translations[currentLang];
    for (const k of keys) {
      if (val && typeof val === "object" && k in val) {
        val = val[k];
      } else {
        // fallback to English if key is missing
        let fallbackVal: any = translations.en;
        for (const fk of keys) {
          if (fallbackVal && typeof fallbackVal === "object" && fk in fallbackVal) {
            fallbackVal = fallbackVal[fk];
          }
        }
        val = fallbackVal ?? key;
        break;
      }
    }

    if (typeof val !== "string") return key;

    if (params) {
      return Object.entries(params).reduce((str, [pKey, pVal]) => {
        return str.replaceAll(`{${pKey}}`, String(pVal));
      }, val);
    }

    return val;
  },
};

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  return i18n.t(key, params);
}
