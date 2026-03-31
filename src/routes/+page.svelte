<script lang="ts">
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button/index.js"
  import * as Card from "$lib/components/ui/card/index.js";
</script>

<main class="mx-auto min-h-screen flex flex-col items-center justify-center gap-8 p-4 ">
<div class="flex flex-col items-center gap-2 text-center">
  <h1 class="text-4xl font-extrabold tracking-tight">Impostor Game</h1>
</div>
  <Card.Root class="mt-10 w-full max-w-sm">
    <Card.Content>
      <Button
        variant="outline"
        class="w-full"
        onclick={() => goto("/quickplay")}
      >
        Quick Play
      </Button>
    </Card.Content>
  </Card.Root>
</main>
