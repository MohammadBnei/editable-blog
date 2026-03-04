<script lang="ts">
  import { getJournalEntries, createJournalEntry } from '$lib/journal.remote';
  import JournalItem from './JournalItem.svelte';

  let limit = $state(10);
  const entries = $derived(getJournalEntries({ limit }));
</script>

<div class="p-4 max-w-4xl mx-auto flex flex-col gap-8">
  <header class="flex justify-between items-center">
    <h1 class="text-3xl font-bold">Journal</h1>
    <a href="/journal/new" class="btn btn-primary btn-sm">Add New Entry</a>
  </header>

  <section class="flex flex-col gap-4">
    {#await entries}
      <div class="flex justify-center p-12">
        <span class="loading loading-dots loading-lg"></span>
      </div>
    {:then data}
      {#if data.length === 0}
        <div class="text-center py-12 opacity-50">
          <p>No journal entries yet. Start writing above!</p>
        </div>
      {:else}
        <div class="list bg-base-100 rounded-box shadow-sm border border-base-content/5">
          {#each data as entry (entry.id)}
            <JournalItem {entry} onrefresh={() => entries.refresh()} />
          {/each}
        </div>

        {#if data.length >= limit}
          <button class="btn btn-ghost btn-sm mx-auto" onclick={() => (limit += 10)}>
            Load more
          </button>
        {/if}
      {/if}
    {:catch error}
      <div class="alert alert-error">
        <span>Error loading entries: {error.message}</span>
      </div>
    {/await}
  </section>
</div>
