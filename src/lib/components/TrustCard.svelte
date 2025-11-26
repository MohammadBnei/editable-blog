<script>
  import RichText from './RichText.svelte';
  import SecondaryButton from './SecondaryButton.svelte';
  import { isEditing } from '$lib/stores.js';

  let { content = $bindable(''), index, onDelete, onMoveUp, onMoveDown } = $props();
</script>

<div class="card bg-base-100 shadow-xl mb-6">
  <div class="card-body">
    <RichText multiLine bind:content />
    {#if $isEditing}
      <div class="card-actions justify-end mt-4">
        <SecondaryButton on:click={onMoveUp}>↑</SecondaryButton>
        <SecondaryButton on:click={onMoveDown}>↓</SecondaryButton>
        <SecondaryButton on:click={onDelete}>Delete</SecondaryButton>
      </div>
    {/if}
  </div>
</div>
