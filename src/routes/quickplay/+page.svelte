<script lang="ts">
  // quickplay/+page.svelte
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Minus, Plus, MoveRight, Dices } from "@lucide/svelte";
  import { i18n, t } from "$lib/i18n.svelte";
  import { getAllDatasets } from "$lib/categories";
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
    players = Math.min(MAX_PLAYERS, Math.max(3, v));
  }
  function clampImpostors(v: number) {
    impostors = Math.min(MAX_IMPOSTORS, Math.max(1, v));
  }

  // start game
  function startGame() {
    // entries will need to have several options and just 
    // randomly choose between those options
    const datasets = getAllDatasets(i18n.lang);
    const entries = parseCSV(pickRandom(datasets));
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
  <h2 class="text-4xl font-extrabold tracking-tight">{t('home.quickPlay')}</h2>
  <div class="flex flex-col items-center align-middle justify-center gap-4">
    <h3> {t('setup.categoriesAvailable')}</h3>
    <p class="text-muted-foreground text-sm -mt-4">{t('setup.quickPlayCategories')}</p>
  </div>

  <Card.Root class="w-full max-w-sm flex flex-col items-center justify-center align-middle p-4">
    <Card.Content class="flex flex-col items-center justify-center align-middle gap-5 p-2">

      <!-- Players -->
      <div class="flex flex-col items-center justify-center align-middle gap-2">
        <Label class="text-sm font-semibold">
          {t('setup.players')} <span class="text-muted-foreground font-normal">(3-{MAX_PLAYERS})</span>
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
          {t('setup.impostors')} <span class="text-muted-foreground font-normal">(1-{MAX_IMPOSTORS})</span>
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
        <span class="block w-full text-sm wrap-break-word">{t('setup.autoImpostors')}</span>
      </Label>

    </Card.Content>
  </Card.Root>

  <Button class="w-full max-w-sm py-6 text-lg font-bold" onclick={startGame}>
    {t('common.startGame')}
  </Button>

  <Button
    variant="outline"
    class="w-full max-w-sm py-6 text-lg font-bold"
    onclick={() => goto("/")}>
    {t('common.goBack')}
  </Button>

</main>


<!-- reveal screen (one card at a time) -->
{:else if screen === "reveal"}
<main class="min-h-screen flex flex-col items-center justify-center gap-6 p-6">

  <p class="text-muted-foreground text-md">
    {t('reveal.passPhoneToNum', { number: card.number })}
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
      <p class="text-4xl font-semibold">{t('reveal.tapToReveal')}</p>
      <p class="text-xs text-muted-foreground">{t('reveal.keepSecret')}</p>
    {:else}
      <p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {card.role === "impostor" ? t('reveal.youAreImpostor') : t('reveal.youArePlayer')}
      </p>
      <p class="text-5xl font-extrabold">{card.word}</p>
      <p class="text-xs text-muted-foreground mt-2">
        {card.role === "impostor" ? t('reveal.hintImpostor') : t('reveal.hintPlayer')}
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
            {t('reveal.nextPlayer')}
          </span>
          <MoveRight class="self-center align-middle" />
        </div>
      {:else}
        <div class="flex flex-row items-center align-middle justify-center gap-2">
          <span>
            {t('common.startGame')}
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

  <p class="text-muted-foreground text-sm uppercase tracking-widest">{t('start.gameOn')}</p>
  <h2 class="text-5xl font-extrabold">
    {t('start.playerStartsNum', { number: startingPlayer })}
  </h2>
  <p class="text-muted-foreground">{t('start.goesFirst')}</p>

  <Button variant="outline" class="mt-8 w-full max-w-xs"
    onclick={() => { screen = "setup"; }}>
    {t('start.playAgain')}
  </Button>

</main>
{/if}
