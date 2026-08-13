<script lang="ts">
  // customgame/+page.svelte
  import { untrack } from "svelte";
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js"
  import * as Card from "$lib/components/ui/card/index.js";
  import { Minus, Plus, MoveRight, Dices, X } from "@lucide/svelte";
  import { i18n, t } from "$lib/i18n.svelte";
  import { CATEGORIES, getCategoryData, type CategoryId } from "$lib/categories";
  import {
    parseCSV,
    parseCSVForHintless,
    buildCardsWithNames,
    buildCardsHintlessWithNames,
    pickRandom,
    pickStartingPlayer,
    resolveImpostorCount,
    syncPlayerNames,
    loadStoredNames,
    saveStoredNames,
    type CustomGamePlayerCard,
  } from "$lib/game";

  const CATEGORIES_STORAGE_KEY = "impostor:enabledCategories";

  function loadStoredCategories(): Record<CategoryId, boolean> {
    const fallback = Object.fromEntries(
      CATEGORIES.map((c) => [c.id, true])
    ) as Record<CategoryId, boolean>;
 
    if (typeof localStorage === "undefined") return fallback;
    try {
      const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      // merge so newly-added categories default to enabled
      return { ...fallback, ...parsed };
    } catch {
      return fallback;
    }
  }

  function saveStoredCategories(value: Record<CategoryId, boolean>) {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(value));
    } catch {
      alert(t('customgame.categoriesNotSaved'));
    }
  }

  let enabledCategories = $state<Record<CategoryId, boolean>>(
    untrack(() => loadStoredCategories())
  );

  $effect(() => {
    saveStoredCategories(enabledCategories);
  });

  let activeCategoryCount = $derived(
    Object.values(enabledCategories).filter(Boolean).length
  );

  function toggleCategory(id: CategoryId) {
    // never allow disabling the last remaining category
    if (enabledCategories[id] && activeCategoryCount === 1) return;
    enabledCategories = { ...enabledCategories, [id]: !enabledCategories[id] };
  }

  // match state 
  type Screen = "setup" | "reveal" | "start";


  $effect(() => {
    i18n.locked = screen !== "setup";
    return () => { i18n.locked = false; };
  });

  type GameType = "classic" | "hintless";
  let gameType = $state<GameType>("classic");

  let screen  = $state<Screen>("setup");
  let players = $state(6);
  let impostors    = $state(1);
  let autoImpostor = $state(false);

  let cards        = $state<CustomGamePlayerCard[]>([]);
  let currentCard  = $state(0);       // index into cards[]
  let cardFlipped  = $state(false);
  let startingPlayer = $state(0);

  let playerNames = $state<string[]>(
    syncPlayerNames(untrack(() => players), loadStoredNames()));

  $effect(() => {
    saveStoredNames(playerNames, t('layout.namesNotSaved'));
  });

  // derived: actual impostor count (respects auto toggle)
  let resolvedImpostors = $derived(resolveImpostorCount(players, impostors, autoImpostor));

  let startingPlayerName = $derived(
    playerNames[startingPlayer - 1]?.trim() || `${t('setup.playerPrefix')} ${startingPlayer}`
  );

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
    const activeDatasets = CATEGORIES.filter((c) => enabledCategories[c.id]).map(
      (c) => getCategoryData(c.id, i18n.lang)
    );

    const pool = activeDatasets.length > 0 ? activeDatasets : CATEGORIES.map((c) => getCategoryData(c.id, i18n.lang));
    const rawData = pickRandom(pool);

    if (gameType === "hintless") {
      const entries = parseCSVForHintless(rawData);
      const entry   = pickRandom(entries);
      cards = buildCardsHintlessWithNames(players, resolvedImpostors, entry, playerNames, t('setup.playerPrefix'));
    } else {
      const entries = parseCSV(rawData);
      const entry   = pickRandom(entries);
      cards = buildCardsWithNames(players, resolvedImpostors, entry, playerNames, t('setup.playerPrefix'));
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
      <h2 class="text-4xl font-extrabold tracking-tight">{t('customgame.title')}</h2>
      <div class="flex flex-col items-center align-middle justify-center gap-4">
        <h3> {t('setup.categoriesAvailable')}</h3>
        <div class="flex flex-wrap justify-center gap-2 m-1">
          {#each CATEGORIES as category (category.id)}
            <Button
              variant="ghost"
              size="default"
              class={enabledCategories[category.id]
                ? "text-(--blendedMagenta) font-semibold"
                : "text-muted-foreground opacity-50"}
              onclick={() => toggleCategory(category.id)}
            >
              {t(category.translationKey)}
            </Button>
          {/each}
        </div>
      </div>
    </div>

    <!-- settings -->
    <div class="flex flex-col justify-center align-middle">
      <div class="sm:flex self-center mb-4 gap-2 text-2xl font-semibold">
        <Label class="text-2xl font-semibold"> 
            {t('customgame.gameMode')}
        </Label>
        <span>
          {gameType === "classic" ? t('customgame.classicUpper') : t('customgame.hintlessUpper')}
        </span>
      </div>

      <ButtonGroup.Root class="self-center my-2 mb-4">
        <Button
          variant="outline"
          class={gameType === "classic" ? "text-(--blendedMagenta) font-semibold" : ""}
          onclick={() => gameType = "classic"}
        >
          {t('customgame.classic')}
        </Button>
        <Button
          variant="outline"
          class={gameType === "hintless" ? "text-(--blendedMagenta) font-semibold" : ""}
          onclick={() => gameType = "hintless"}
        >
          {t('customgame.hintless')}
        </Button>
      </ButtonGroup.Root>

      <div
        class="w-full flex flex-col sm:flex-row sm:gap-6 gap-2 justify-center align-middle p-2 items-start"
        id="customSettings"
      >
        <Card.Root class="w-full h-full max-w-sm flex flex-col items-center justify-center align-middle p-4">
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

        <Card.Root class="w-full h-full max-w-sm flex flex-col items-center justify-center align-middle p-4">
          <Card.Content class="flex flex-col items-center justify-center align-middle gap-5 p-2">
            <Label class="font-semibold">
              {t('customgame.playerNames')} <span class="text-muted-foreground font-normal">{t('customgame.optional')}</span>
            </Label>
            <div class="w-full max-h-64 overflow-y-auto flex flex-col gap-2 pr-1">
              {#each Array(players) as _, i}
                <div class="flex items-center gap-4 my-1">
                  <span class="text-md text-muted-foreground w-6 text-right shrink-0">
                    {i + 1}
                  </span>
                  <Input
                    type="text"
                    class=
                    "w-full flex-1 rounded-md
                    border border-input bg-transparent
                    px-2 py-1.5 text-md
                    outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder={t('customgame.playerPlaceholder', { number: i + 1 })}
                    maxlength={20}
                    bind:value={playerNames[i]}
                  />
                  <Button
                    variant="ghost"
                    onclick={() => playerNames[i] = ""}
                  >
                    <X />
                  </Button>
                </div>
              {/each}
            </div>
          </Card.Content>
        </Card.Root>
      </div>
    </div>

    <div class="flex flex-col sm:gap-4 gap-2 items-center my-2">

      <Button class="w-full max-w-sm py-6 text-lg font-bold" onclick={startGame}>
        {t('common.startGame')}
      </Button>

      <Button
        variant="outline"
        class="w-full max-w-sm py-6 text-lg font-bold"
        onclick={() => goto("/")}>
        {t('common.goBack')}
      </Button>
    </div>

  </main>


  <!-- reveal screen (one card at a time) -->
{:else if screen === "reveal"}
  <main class="min-h-screen flex flex-col items-center justify-center gap-6 p-6">

    <p class="text-muted-foreground text-md">
      {t('reveal.passPhoneToName', { name: card.name })}
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
        {#if card.role === "impostor" && card.word === ""}
          <p class="text-3xl font-extrabold tracking-tight text-destructive">
            {t('reveal.noClueForYou')}
          </p>
        {:else}
          <p class="text-5xl font-extrabold">{card.word}</p>
        {/if}

        <p class="text-xs text-muted-foreground mt-2">
          {card.role === "impostor"
            ? card.word === "" ? t('reveal.hintlessActive') : t('reveal.hintImpostor') : t('reveal.hintPlayer')}
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
    {startingPlayerName}
  </h2>
  <p class="text-muted-foreground">{t('start.goesFirst')}</p>

  <Button variant="outline" class="mt-8 w-full max-w-xs"
    onclick={() => { screen = "setup"; }}>
    {t('start.playAgain')}
  </Button>

</main>
{/if}
