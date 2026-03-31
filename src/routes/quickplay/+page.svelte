<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import foodRaw from '$lib/assets/final_food.csv?raw';
  import {
    parseCSV,
    buildCards,
    pickRandom,
    pickStartingPlayer,
    resolveImpostorCount,
    type PlayerCard,
  } from '$lib/game';

  // ── State ──────────────────────────────────────────────
  type Screen = 'setup' | 'reveal' | 'start';

  let screen  = $state<Screen>('setup');
  let players = $state(6);
  let impostors    = $state(1);
  let autoImpostor = $state(false);

  let cards        = $state<PlayerCard[]>([]);
  let currentCard  = $state(0);       // index into cards[]
  let cardFlipped  = $state(false);
  let startingPlayer = $state(0);

  // derived: actual impostor count (respects auto toggle)
  let resolvedImpostors = $derived(resolveImpostorCount(players, impostors, autoImpostor));

  // ── Constraints ────────────────────────────────────────
  const MAX_PLAYERS   = 25;
  const MAX_IMPOSTORS = 3;

  function clampPlayers(v: number) {
    players = Math.min(MAX_PLAYERS, Math.max(2, v));
  }
  function clampImpostors(v: number) {
    impostors = Math.min(MAX_IMPOSTORS, Math.max(1, v));
  }

  // ── Start game ─────────────────────────────────────────
  function startGame() {
    const entries = parseCSV(foodRaw);
    const entry   = pickRandom(entries);
    cards         = buildCards(players, resolvedImpostors, entry);
    currentCard   = 0;
    cardFlipped   = false;
    screen        = 'reveal';
  }

  // ── Card reveal flow ───────────────────────────────────
  function flipCard() {
    cardFlipped = true;
  }

  function nextCard() {
    if (currentCard < cards.length - 1) {
      currentCard++;
      cardFlipped = false;
    } else {
      startingPlayer = pickStartingPlayer(players);
      screen = 'start';
    }
  }

  let card = $derived(cards[currentCard]);
</script>

<!-- ═══════════════════════════════════════════════════════
     SETUP SCREEN
════════════════════════════════════════════════════════ -->
{#if screen === 'setup'}
<main class="min-h-screen flex flex-col items-center justify-center gap-6 p-6">

  <h2 class="text-3xl font-extrabold tracking-tight">Quick Play</h2>
  <p class="text-muted-foreground text-sm -mt-4">Category: 🍎 Food</p>

  <Card.Root class="w-full max-w-sm">
    <Card.Content class="flex flex-col gap-5 pt-4">

      <!-- Players -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold">
          Players <span class="text-muted-foreground font-normal">(2–{MAX_PLAYERS})</span>
        </label>
        <div class="flex items-center gap-3">
          <Button variant="outline" size="icon"
            onclick={() => clampPlayers(players - 1)}>−</Button>
          <span class="text-2xl font-bold w-8 text-center">{players}</span>
          <Button variant="outline" size="icon"
            onclick={() => clampPlayers(players + 1)}>+</Button>
        </div>
      </div>

      <!-- Impostors -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold">
          Impostors <span class="text-muted-foreground font-normal">(1–{MAX_IMPOSTORS})</span>
        </label>
        <div class="flex items-center gap-3" class:opacity-40={autoImpostor}>
          <Button variant="outline" size="icon" disabled={autoImpostor}
            onclick={() => clampImpostors(impostors - 1)}>−</Button>
          <span class="text-2xl font-bold w-8 text-center">{resolvedImpostors}</span>
          <Button variant="outline" size="icon" disabled={autoImpostor}
            onclick={() => clampImpostors(impostors + 1)}>+</Button>
        </div>
      </div>

      <!-- Auto impostor toggle -->
      <label class="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          class="w-4 h-4 accent-primary"
          bind:checked={autoImpostor}
        />
        <span class="text-sm">Auto-manage impostors based on player count</span>
      </label>

    </Card.Content>
  </Card.Root>

  <Button class="w-full max-w-sm py-6 text-lg font-bold" onclick={startGame}>
    Start Game
  </Button>

</main>


<!-- ═══════════════════════════════════════════════════════
     REVEAL SCREEN  (one card at a time)
════════════════════════════════════════════════════════ -->
{:else if screen === 'reveal'}
<main class="min-h-screen flex flex-col items-center justify-center gap-6 p-6">

  <p class="text-muted-foreground text-sm">
    Pass the phone to <span class="font-bold text-foreground">Player #{card.number}</span>
  </p>

  <!-- Card -->
  <div
    class="
      w-full max-w-xs min-h-56 rounded-2xl border flex flex-col items-center
      justify-center gap-4 p-8 text-center cursor-pointer select-none
      transition-all duration-300
      {cardFlipped
        ? card.role === 'impostor'
          ? 'bg-destructive/10 border-destructive'
          : 'bg-primary/5 border-primary'
        : 'bg-muted border-border'}
    "
    onclick={!cardFlipped ? flipCard : undefined}
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === 'Enter' && !cardFlipped && flipCard()}
  >
    {#if !cardFlipped}
      <span class="text-4xl">👆</span>
      <p class="text-lg font-semibold">Tap to reveal</p>
      <p class="text-xs text-muted-foreground">Make sure no one else is watching</p>
    {:else}
      <p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {card.role === 'impostor' ? '🕵️ You are the Impostor' : '✅ You are a Player'}
      </p>
      <p class="text-4xl font-extrabold">{card.word}</p>
      <p class="text-xs text-muted-foreground mt-2">
        {card.role === 'impostor' ? 'This is your hint — stay sneaky.' : 'This is the secret word.'}
      </p>
    {/if}
  </div>

  <!-- Progress -->
  <p class="text-xs text-muted-foreground">
    {currentCard + 1} / {cards.length}
  </p>

  {#if cardFlipped}
    <Button class="w-full max-w-xs" onclick={nextCard}>
      {currentCard < cards.length - 1 ? 'Next Player →' : 'Start Game →'}
    </Button>
  {/if}

</main>


<!-- ═══════════════════════════════════════════════════════
     START SCREEN
════════════════════════════════════════════════════════ -->
{:else if screen === 'start'}
<main class="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center">

  <p class="text-muted-foreground text-sm uppercase tracking-widest">Game on!</p>
  <h2 class="text-5xl font-extrabold">
    Player #{startingPlayer}
  </h2>
  <p class="text-muted-foreground">goes first</p>

  <Button variant="outline" class="mt-8 w-full max-w-xs"
    onclick={() => { screen = 'setup'; }}>
    Play Again
  </Button>

</main>
{/if}
