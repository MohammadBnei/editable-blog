<script lang="ts">
  import { isEditing } from '$lib/stores.js';
  import PlainTextEditor from './PlainTextEditor.svelte';

  let { content = $bindable<string>(), multiLine = false } = $props();
</script>

{#if $isEditing}
  <PlainTextEditor {multiLine} bind:content />
{:else}
  <div class="whitespace-pre-wrap">
    {content}
  </div>
{/if}
