<script lang="ts">
  // layout
  import '../app.css';
  import { ModeWatcher } from 'mode-watcher';
  import unwantedfavicon from "$lib/assets/unwantedfavicon.svg";
  import { Globe } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { i18n, t } from "$lib/i18n.svelte";

  let { children } = $props();

</script>

<svelte:head>
  <link rel="icon" href={unwantedfavicon} />
</svelte:head>

<ModeWatcher />

<div
  class="
  bg-(--customWhite) dark:bg-(--darkGray) rubikal
  flex flex-col items-center justify-center antialiased
  "
>
  <div class="absolute top-2 left-2 p-2 z-50">
    <div class="flex justify-center align-middle">
      <Button
        variant="outline"
        onclick={() => i18n.toggle()}
        aria-label={t('layout.toggleLanguage')}
        title={t('layout.toggleLanguage')}
        class="flex items-center gap-1.5 font-semibold text-xs uppercase"
      >
        <Globe class="size-4" />
        <span>{i18n.lang.toUpperCase()}</span>
      </Button>

    </div>
  </div>
  {@render children?.()}
</div>
