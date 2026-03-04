<script lang="ts">
  import { createJournalEntry } from '$lib/journal.remote';
  import { goto } from '$app/navigation';

  const { title, summary, friction_score } = createJournalEntry.fields;
</script>

<div class="p-4 max-w-2xl mx-auto flex flex-col gap-8">
  <header>
    <a href="/journal" class="btn btn-ghost btn-sm mb-4">← Back to List</a>
    <h1 class="text-3xl font-bold">New Journal Entry</h1>
  </header>

  <section class="card bg-base-200 shadow-sm">
    <form 
      use:createJournalEntry.enhance={async ({ submit }) => {
        const result = await submit();
        if (result) goto(`/journal`);
      }}
      method="POST"
      class="card-body gap-4"
    >
      <div class="fieldset">
        <label class="floating-label">
          <input
            {...title.as('text')}
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
            class="textarea w-full h-32"
            placeholder="How was your day?"
          ></textarea>
          <span>Summary</span>
        </label>
      </div>

      <div class="flex flex-col gap-2">
        <span class="label text-xs">Friction Score</span>
        <input
          {...friction_score.as('range')}
          min="0"
          max="10"
          step="1"
          class="range range-primary"
        />
        <div class="flex justify-between px-2 text-xs opacity-50">
          <span>0</span><span>5</span><span>10</span>
        </div>
      </div>

      <div class="card-actions justify-end mt-4">
        <button class="btn btn-primary" disabled={createJournalEntry.pending}>
          {#if createJournalEntry.pending}
            <span class="loading loading-spinner"></span>
          {/if}
          Save Entry
        </button>
      </div>
    </form>
  </section>
</div>
