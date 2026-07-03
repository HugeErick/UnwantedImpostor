<script lang="ts">
  // customgame/+page.svelte
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Minus, Plus, MoveRight, Dices } from "@lucide/svelte";
  import WorkingOnGUI from "$lib/components/WorkingOnGUI.svelte";

  import foodRaw from "$lib/assets/final_food.csv?raw";
  import sportsRaw from "$lib/assets/sports.csv?raw";
  import countriesRaw from "$lib/assets/countries.csv?raw";
  import {
    parseCSV,
    buildCards,
    parseCSVForHintless,
    buildCardsForHintless,
    pickRandom,
    pickStartingPlayer,
    resolveImpostorCount,
    type PlayerCard,
  } from "$lib/game";

  // match state 
  type Screen = "setup" | "reveal" | "start";
  type GameType = "classic" | "hintless";
  let gameType = $state<GameType>("classic");

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
    const datasets = [foodRaw, sportsRaw, countriesRaw];
    const rawData = pickRandom(datasets);

    if (gameType === "hintless") {
      const entries = parseCSVForHintless(rawData);
      const entry   = pickRandom(entries);
      cards = buildCardsForHintless(players, resolvedImpostors, entry);
    } else {
      const entries = parseCSV(rawData);
      const entry   = pickRandom(entries);
      cards = buildCards(players, resolvedImpostors, entry);
    }

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
  <main class="min-h-screen min-w-screen flex flex-col justify-center gap-4 p-4 max-w-4xl">
    <div class="flex flex-col gap-4 items-center my-4">

      <!-- categories -->
      <h2 class="text-4xl font-extrabold tracking-tight">Custom Game</h2>
      <div class="flex flex-col items-center align-middle justify-center gap-4">
        <h3> Categories available:</h3>
        <!-- TODO inyect automatically the categories -->
        <p class="text-muted-foreground text-sm -mt-4">Food | Sports | Countries</p>
      </div>
    </div>

    <!-- settings -->
    <div class="flex flex-col justify-center align-middle">
      <div class="sm:flex self-center mb-4 gap-2 text-2xl font-semibold">
        <Label class="text-2xl font-semibold"> 
            Game Mode :
        </Label>
        <span>
          {gameType.toString().toUpperCase()}
        </span>
      </div>

      <ButtonGroup.Root class="self-center my-2 mb-4">
        <Button
          variant="outline"
          class={gameType === "classic" ? "text-(--blendedMagenta) font-semibold" : ""}
          onclick={() => gameType = "classic"}
        >
          Classic
        </Button>
        <Button
          variant="outline"
          class={gameType === "hintless" ? "text-(--blendedMagenta) font-semibold" : ""}
          onclick={() => gameType = "hintless"}
        >
          Hintless
        </Button>
      </ButtonGroup.Root>

      <div
        class="w-full flex flex-col sm:flex-row sm:gap-6 gap-2 justify-center align-middle p-2 items-center"
        id="customSettings"
      >
        <Card.Root class="w-full h-full max-w-sm flex flex-col items-center justify-center align-middle p-4">
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

        <Card.Root class="w-full h-full max-w-sm flex flex-col items-center justify-center align-middle p-4">
          <Card.Content class="flex flex-col items-center justify-center align-middle gap-5 p-2">
            <WorkingOnGUI feature="Naming players" />
          </Card.Content>
        </Card.Root>
      </div>

    </div>

    <div class="flex flex-col sm:gap-4 gap-2 items-center my-2">

      <Button class="w-full max-w-sm py-6 text-lg font-bold" onclick={startGame}>
        Start Game
      </Button>

      <Button
        variant="outline"
        class="w-full max-w-sm py-6 text-lg font-bold"
        onclick={() => goto("/")}>
        Go back
      </Button>
    </div>

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
        {#if card.role === "impostor" && card.word === ""}
          <p class="text-3xl font-extrabold tracking-tight text-destructive">
            No clue 4 u
          </p>
        {:else}
          <p class="text-5xl font-extrabold">{card.word}</p>
        {/if}

        <p class="text-xs text-muted-foreground mt-2">
          {card.role === "impostor"
            ? card.word === "" ? "hintless mode active" : "This is your hint — stay sneaky." : "This is the secret word."}
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
