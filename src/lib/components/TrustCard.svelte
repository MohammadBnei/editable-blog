<script>
  import RichText from './RichText.svelte';
  import SecondaryButton from './SecondaryButton.svelte';
  import { isEditing } from '$lib/stores.js';

  let { content = $bindable(''), index, onDelete, onMoveUp, onMoveDown } = $props();
</script>

<a class="hover-3d my-12 mx-2 cursor-pointer w-full">
  <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
    <RichText multiLine bind:content />
    {#if $isEditing}
      <div class="flex gap-2">
        <SecondaryButton on:click={onMoveUp}>↑</SecondaryButton>
        <SecondaryButton on:click={onMoveDown}>↓</SecondaryButton>
        <SecondaryButton on:click={onDelete}>Delete</SecondaryButton>
      </div>
    {/if}
  </div>

  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
</a>
