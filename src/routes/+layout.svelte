<script lang="ts">
  // layout
  import '../app.css';
  import { ModeWatcher } from 'mode-watcher';
  import unwantedfavicon from "$lib/assets/unwantedfavicon.svg";
  import { Globe } from "@lucide/svelte";
  import { page } from "$app/state";
  import { Button } from "$lib/components/ui/button/index.js";
  import { i18n, t } from "$lib/i18n.svelte";
  import Footer from '$lib/components/Footer.svelte';
	import { goto } from '$app/navigation';

  let { children } = $props();

</script>

<svelte:head>
  <link rel="icon" href={unwantedfavicon} />
</svelte:head>

<ModeWatcher />

<div
  class="
  min-h-screen bg-(--customWhite) dark:bg-(--darkGray)
  rubikal flex flex-col
  items-center antialiased
  "
>
  <div class="absolute top-2 left-2 p-2 z-50">
    <div class="flex justify-center align-middle gap-2">
      <Button
        variant="outline"
        disabled={i18n.locked}
        onclick={() => i18n.toggle()}
        aria-label={t("layout.toggleLanguage")}
        title={i18n.locked ? t("layout.toggleLanguageLocked") : t("layout.toggleLanguage")}
        class="flex items-center gap-1.5 font-semibold text-xs uppercase disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Globe class="size-4" />
        <span>{i18n.lang.toUpperCase()}</span>
      </Button>

      {#if i18n.cancelGame}
        <Button
        variant="destructive"
        onclick={() => i18n.cancelGame?.()}
        aria-label={t("layout.cancelGame")}
        title={t("layout.cancelGameTT")}
        class="flex items-center gap-1.5 font-semibold text-xs uppercase"
      >
        <span>{t("layout.cancelGame")}</span>
        </Button>
      {/if}

      {#if page.url.pathname !== "/" }
        <Button
          variant="outline"
          onclick={() => goto("/")}
          aria-label={t('common.goBack')}
          title={t('common.goBack')}
          class="flex items-center gap-1.5 font-semibold text-xs uppercase"
        >
          {t('common.goBack')}
        </Button>
      {/if}
    </div>
  </div>
  {@render children?.()}
  <Footer />
</div>
