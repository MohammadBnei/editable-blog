<script>
  import RichText from './RichText.svelte';
  import SecondaryButton from './SecondaryButton.svelte';
  import { isEditing } from '$lib/stores.js';

  let { content = $bindable(''), index, onDelete, onMoveUp, onMoveDown } = $props();
</script>

<div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
  {#if $isEditing}
    <div class="mb-4">
      <RichText multiLine bind:content />
    </div>
    <div class="flex gap-2">
      <SecondaryButton on:click={onMoveUp}>↑</SecondaryButton>
      <SecondaryButton on:click={onMoveDown}>↓</SecondaryButton>
      <SecondaryButton on:click={onDelete}>Delete</SecondaryButton>
    </div>
  {:else}
    <div class="prose md:prose-lg">
      <RichText multiLine bind:content />
    </div>
  {/if}
</div>
