<script lang="ts">
  // WorkingOnGUI.svelte component
  // a to-do GUI for final user to see
  import { TrafficCone } from "@lucide/svelte";
  import { t } from "$lib/i18n.svelte";

  export let feature: string;
</script>


<div class="w-full h-full flex flex-col items-center justify-center align-middle gap-4">
  <TrafficCone class="sm:size-22 size-10 opacity-90 text-zinc-500" />
  <span class="text-2xl font-semibold text-center">
    {t('workingOnGUI.title')}
  </span>
  <span class="text-lg bg-(--customGold)/50 p-1 rounded-md">
    {feature}
  </span>
</div>

