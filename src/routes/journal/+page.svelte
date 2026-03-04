<script lang="ts">
  import { getJournalEntries, createJournalEntry } from '$lib/journal.remote';
  import JournalItem from './JournalItem.svelte';

  let limit = $state(10);
  const entries = $derived(getJournalEntries({ limit }));

  const { title, summary, friction_score, category, data, metadata } = createJournalEntry.fields;
</script>

<div class="p-4 max-w-4xl mx-auto flex flex-col gap-8">
  <header class="flex justify-between items-center">
    <h1 class="text-3xl font-bold">Journal</h1>
  </header>

  <section class="card bg-base-200 shadow-sm">
    <form {...createJournalEntry} class="card-body gap-4">
      <h2 class="card-title text-sm uppercase tracking-wider opacity-70">New Entry</h2>

      <div class="fieldset">
        <label class="floating-label">
          <input
            {...createJournalEntry.fields.title.as('text')}
            class="input w-full"
            placeholder="Title"
            required
          />
          <span>Title</span>
        </label>
        {#each title.issues() as issue}
          <p class="text-error text-xs mt-1">{issue.message}</p>
        {/each}
      </div>

      <div class="fieldset">
        <label class="floating-label">
          <textarea
            {...summary.as('text')}
            class="textarea w-full h-24"
            placeholder="How was your day?"
          ></textarea>
          <span>Summary</span>
        </label>
      </div>

      <div class="flex items-center gap-4">
        <div class="flex-1">
          <span class="label text-xs">Friction Score</span>
          <input
            {...friction_score.as('range')}
            min="0"
            max="10"
            step="1"
            class="range range-primary"
          />
        </div>

        <button class="btn btn-primary" disabled={createJournalEntry.pending}>
          {#if createJournalEntry.pending}
            <span class="loading loading-spinner"></span>
          {/if}
          Create Entry
        </button>
      </div>
    </form>
  </section>

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
