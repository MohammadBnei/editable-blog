<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { getJournalEntries } from '$lib/journal.remote';
  import JournalItem from '$lib/components/JournalItem.svelte';

  let { data } = $props();
  let limit = $state(10);
  let entries = $state(data.entries);

  async function loadMore() {
    limit += 10;
    entries = await getJournalEntries({ limit });
  }

  async function refresh() {
    await invalidateAll();
    entries = await getJournalEntries({ limit });
  }
</script>

<div class="p-4 max-w-4xl mx-auto flex flex-col gap-8">
  <header class="flex justify-between items-center">
    <h1 class="text-3xl font-bold">Journal</h1>
    <a href="/journal/new" class="btn btn-primary btn-sm">Add New Entry</a>
  </header>

  <section class="flex flex-col gap-4">
    {#if entries.length === 0}
      <div class="text-center py-12 opacity-50">
        <p>No journal entries yet. Start writing above!</p>
      </div>
    {:else}
      <div class="list bg-base-100 rounded-box shadow-sm border border-base-content/5">
        {#each entries as entry (entry.id)}
          <JournalItem {entry} onrefresh={refresh} />
        {/each}
      </div>

      {#if entries.length >= limit}
        <button class="btn btn-ghost btn-sm mx-auto" onclick={loadMore}> Load more </button>
      {/if}
    {/if}
  </section>
</div>
