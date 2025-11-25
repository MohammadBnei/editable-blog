<script>
  import TrustCard from './TrustCard.svelte';
  import { isEditing } from '$lib/stores.js';

  let { trustCards = $bindable([]) } = $props();

  function addTrustCard() {
    trustCards.push('<h2>New Trust Item</h2><p>Add your content here...</p>');
    trustCards = trustCards; // trigger update
  }

  function deleteTrustCard(index) {
    trustCards.splice(index, 1);
    trustCards = trustCards; // trigger update
  }

  function moveTrustCard(index, direction) {
    let toIndex;
    if (direction === 'up' && index > 0) {
      toIndex = index - 1;
    } else if (direction === 'down' && index < trustCards.length - 1) {
      toIndex = index + 1;
    } else {
      return; // operation not possible
    }
    // Remove item from original position
    const element = trustCards.splice(index, 1)[0];
    // Insert at new position
    trustCards.splice(toIndex, 0, element);
    trustCards = trustCards; // trigger update
  }
</script>

<div class="bg-white pb-6 sm:pb-12">
  <div class="max-w-(--breakpoint-lg) mx-auto px-6">
    <div class="font-bold text-sm sm:text-base py-12 sm:pt-24 pb-8">WHY TRUST MY EXPERTISE</div>
    
    {#each trustCards as content, i}
      <TrustCard
        bind:content={trustCards[i]}
        index={i}
        onDelete={() => deleteTrustCard(i)}
        onMoveUp={() => moveTrustCard(i, 'up')}
        onMoveDown={() => moveTrustCard(i, 'down')}
      />
    {/each}

    {#if $isEditing}
      <div class="text-center pb-12 border-b border-gray-100">
        <SecondaryButton on:click={addTrustCard}>Add Trust Item</SecondaryButton>
      </div>
    {/if}
  </div>
</div>
