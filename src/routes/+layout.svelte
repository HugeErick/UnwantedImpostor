<script lang="ts">
import '../app.css';
import { ModeWatcher } from 'mode-watcher';
import unwantedfavicon from "$lib/assets/unwantedfavicon.svg";

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
  {@render children?.()}
</div>
