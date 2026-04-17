<script lang="ts">
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Minus, Plus, MoveRight, Dices } from "@lucide/svelte";
  import foodRaw from "$lib/assets/final_food.csv?raw";
  import {
    parseCSV,
    buildCards,
    pickRandom,
    pickStartingPlayer,
    resolveImpostorCount,
    type PlayerCard,
  } from "$lib/game";

  // match state 
  type Screen = "setup" | "reveal" | "start";

  let screen  = $state<Screen>("setup");
  let players = $state(6);
  let impostors    = $state(1);
  let autoImpostor = $state(false);

  let cards        = $state<PlayerCard[]>([]);
  let currentCard  = $state(0);       // index into cards[]
  let cardFlipped  = $state(false);
  let startingPlayer = $state(0);

  // derived: actual impostor count (respects auto toggle)
  let resolvedImpostors = $derived(resolveImpostorCount(players, impostors, autoImpostor));

  // constraints  
  const MAX_PLAYERS   = 25;
  const MAX_IMPOSTORS = 3;

  function clampPlayers(v: number) {
    players = Math.min(MAX_PLAYERS, Math.max(2, v));
  }
  function clampImpostors(v: number) {
    impostors = Math.min(MAX_IMPOSTORS, Math.max(1, v));
  }

  // start game
  function startGame() {
    // entries will need to have several options and just 
    // randomly choose between those options
    const entries = parseCSV(foodRaw);
    // entry = word choosen
    const entry   = pickRandom(entries);
    cards         = buildCards(players, resolvedImpostors, entry);
    currentCard   = 0;
    cardFlipped   = false;
    screen        = "reveal";
  }

  // card reveal flow 
  function flipCard() {
    cardFlipped = true;
  }

  function nextCard() {
    if (currentCard < cards.length - 1) {
      currentCard++;
      cardFlipped = false;
    } else {
      startingPlayer = pickStartingPlayer(players);
      screen = "start";
    }
  }

  let card = $derived(cards[currentCard]);
</script>

<!-- setup screen -->
{#if screen === "setup"}
<main class="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
  <h2 class="text-4xl font-extrabold tracking-tight">Quick Play</h2>
  <div class="flex flex-col items-center align-middle justify-center gap-4">
    <h3> Categories available:</h3>
    <p class="text-muted-foreground text-sm -mt-4">Food</p>
  </div>

  <Card.Root class="w-full max-w-sm flex flex-col items-center justify-center align-middle p-4">
    <Card.Content class="flex flex-col items-center justify-center align-middle gap-5 p-2">

      <!-- Players -->
      <div class="flex flex-col items-center justify-center align-middle gap-2">
        <Label class="text-sm font-semibold">
          Players <span class="text-muted-foreground font-normal">(2-{MAX_PLAYERS})</span>
        </Label>
        <div class="flex items-center align-middle justify-center text-center gap-2">
          <Button
            variant="outline"
            size="icon" 
            class="m-1"
            onclick={() => clampPlayers(players - 1)}
          >
            <Minus />
          </Button>
          <span class="text-2xl font-bold w-6 text-center mx-4">{players}</span>
          <Button
            variant="outline"
            size="icon"
            class="m-1"
            onclick={() => clampPlayers(players + 1)}
          >
            <Plus />
          </Button>
        </div>
      </div>

      <!-- Impostors -->
      <div class="flex flex-col items-center justify-center align-middle gap-2">
        <Label class="text-sm font-semibold">
          Impostors <span class="text-muted-foreground font-normal">(1-{MAX_IMPOSTORS})</span>
        </Label>
        <div class="flex items-center align-middle justify-center text-center gap-2" class:opacity-40={autoImpostor}>
          <Button
            variant="outline"
            size="icon"
            class="m-1"
            disabled={autoImpostor}
            onclick={() => clampImpostors(impostors - 1)}
          >
            <Minus />
          </Button>
          <span class="text-2xl font-bold w-6 text-center mx-4">{resolvedImpostors}</span>
          <Button
            variant="outline"
            size="icon"
            class="m-1"
            disabled={autoImpostor}
            onclick={() => clampImpostors(impostors + 1)}
          >
            <Plus />
          </Button>
        </div>
      </div>

      <!-- Auto impostor toggle -->
      <Label class="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          class="w-4 h-4 accent-primary"
          bind:checked={autoImpostor}
        />
        <span class="block w-full text-sm wrap-break-word">Auto-manage impostors <br /> based on player count</span>
      </Label>

    </Card.Content>
  </Card.Root>

  <Button class="w-full max-w-sm py-6 text-lg font-bold" onclick={startGame}>
    Start Game
  </Button>

  <Button
    variant="outline"
    class="w-full max-w-sm py-6 text-lg font-bold"
    onclick={() => goto("/")}>
    Go back
  </Button>

</main>


<!-- reveal screen (one card at a time) -->
{:else if screen === "reveal"}
<main class="min-h-screen flex flex-col items-center justify-center gap-6 p-6">

  <p class="text-muted-foreground text-md">
    Pass the phone to <span class="font-bold text-foreground">Player #{card.number}</span>
  </p>

  <!-- Card -->
  <div
    class="
      w-full max-w-xs min-h-56 rounded-2xl border flex flex-col items-center
      justify-center gap-4 p-8 text-center cursor-pointer select-none
      transition-all duration-300
      {cardFlipped
        ? card.role === "impostor"
          ? "bg-destructive/10 border-destructive"
          : "bg-primary/5 border-primary"
        : "bg-muted border-border"}
    "
    onclick={!cardFlipped ? flipCard : undefined}
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === "Enter" && !cardFlipped && flipCard()}
  >
    {#if !cardFlipped}
      <p class="text-4xl font-semibold">Tap to reveal</p>
      <p class="text-xs text-muted-foreground">Make sure no one else is watching</p>
    {:else}
      <p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {card.role === "impostor" ? "You are the Impostor" : "You are a Player"}
      </p>
      <p class="text-5xl font-extrabold">{card.word}</p>
      <p class="text-xs text-muted-foreground mt-2">
        {card.role === "impostor" ? "This is your hint — stay sneaky." : "This is the secret word."}
      </p>
    {/if}
  </div>

  <!-- Progress -->
  <p class="text-xs text-muted-foreground">
    {currentCard + 1} / {cards.length}
  </p>

  {#if cardFlipped}
    <Button variant="outline" class="w-full max-w-xs" onclick={nextCard}>
      {#if currentCard < cards.length - 1}
        <div class="flex flex-row items-center align-middle justify-center gap-2">
          <span>
            Next Player
          </span>
          <MoveRight class="self-center align-middle" />
        </div>
      {:else}
        <div class="flex flex-row items-center align-middle justify-center gap-2">
          <span>
            Start Game
          </span>
          <Dices />
        </div>
      {/if}
    </Button>
  {/if}

</main>

<!-- start screen -->
{:else if screen === "start"}
<main class="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center">

  <p class="text-muted-foreground text-sm uppercase tracking-widest">Game on!</p>
  <h2 class="text-5xl font-extrabold">
    Player #{startingPlayer}
  </h2>
  <p class="text-muted-foreground">goes first</p>

  <Button variant="outline" class="mt-8 w-full max-w-xs"
    onclick={() => { screen = "setup"; }}>
    Play Again
  </Button>

</main>
{/if}
