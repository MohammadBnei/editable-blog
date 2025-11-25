<script>
  import TrustCard from './TrustCard.svelte';

  let { trustCards = $bindable([]) } = $props();
</script>

<div class="bg-white pb-6 sm:pb-12">
  <div class="max-w-(--breakpoint-lg) mx-auto px-6">
    <div class="font-bold text-sm sm:text-base py-12 sm:pt-24 pb-8">WHY TRUST MY EXPERTISE</div>

    {#each trustCards as card, i}
      <TrustCard
        title={card.title}
        pain={card.pain}
        architecture={card.architecture}
        impact={card.impact}
      />
    {/each}
  </div>
</div>
