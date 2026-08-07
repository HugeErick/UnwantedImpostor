# UnwantedImpostor

[![Sveltekit](https://img.shields.io/badge/sveltekit-2.22%2B-orangered)](https://svelte.dev)
[![Svelte 5](https://img.shields.io/badge/svelte-5.0%2B-red)](https://svelte.dev)
[![tailwindcss](https://img.shields.io/badge/tailwindcss->=4.0-orange)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9%2B-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

An interactive, local pass-and-play party game inspired by Impostor & Undercover. Players pass a single device around to reveal secret words or hints, then engage in discussion to unmask the hidden impostor(s)!

---

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [License](#license)
- [Contact](#contact)

---

## Description

UnwantedImpostor is a web-based social deduction party game built for mobile and desktop browsers. Players take turns tapping the screen to view their assigned role and word in secret. While most players receive the exact same secret word, the Impostor receives either a subtle hint (Classic Mode) or no clue at all (Hintless Mode).

After everyone has viewed their card, a randomly chosen player opens the round. Players describe their word without being too explicit, trying to catch the Impostor while the Impostor tries to blend in!

---

## Features

- Full Bilingual Support (English & Spanish):
  - Complete UI translation in both English and Spanish.
  - One-click language switcher with automatic browser detection and `localStorage` persistence.
  - Localized word & hint CSV datasets for all categories (`Food`, `Sports`, `Countries`).

- Quick Play:
  - Instant setup with automatic random selection from all available word categories.

- Custom Game Setup:
  - Player Counts: Support for 3 to 25 players.
  - Impostors: Choose 1 to 3 impostors, or enable Auto-manage to scale impostor count based on group size.
  - Game Modes:
    - Classic: The Impostor receives a related hint word to help them stay sneaky.
    - Hintless: The Impostor receives no clue at all, maximizing suspense.
  - Category Selectors: Enable or disable specific categories (`Food`, `Sports`, `Countries`).
  - Custom Player Names: Optional persistent player names.

- Modern & Accessible Design:
  - Dark mode support via `mode-watcher`.
  - Accessible UI components built with TailwindCSS v4 and Lucide icons.

---

## Tech Stack

- Framework: [SvelteKit](https://svelte.dev) & Svelte 5 (Runes)
- Styling: [TailwindCSS v4](https://tailwindcss.com) & [Bits UI](https://bits-ui.com/)
- Icons: [Lucide Svelte](https://lucide.dev)
- Language: [TypeScript](https://www.typescriptlang.org/)
- Package Manager: [pnpm](https://pnpm.io/)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contact

Erick Gonzalez Parada - <erick.parada101@gmail.com>

Project Link: [https://github.com/HugeErick/UnwantedImpostor](https://github.com/HugeErick/UnwantedImpostor)
