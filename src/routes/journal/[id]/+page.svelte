<script lang="ts">
  import { getJournalEntry, updateJournalEntry } from '$lib/journal.remote';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';

  const id = Number(page.params.id);
  const entryQuery = $derived(getJournalEntry(id));

  // Initialize form fields once data is loaded
  $effect(() => {
    entryQuery.then(data => {
        updateJournalEntry.fields.set({
            id,
            updates: {
                title: data.title,
                summary: data.summary || '',
                friction_score: data.friction_score || 0,
                category: data.category || ''
            }
        });
    });
  });

  const { updates } = updateJournalEntry.fields;
</script>

<div class="p-4 max-w-2xl mx-auto flex flex-col gap-8">
  <header>
    <a href="/journal" class="btn btn-ghost btn-sm mb-4">← Back to List</a>
    <h1 class="text-3xl font-bold">Edit Entry</h1>
  </header>

  {#await entryQuery}
    <div class="flex justify-center p-12"><span class="loading loading-spinner loading-lg"></span></div>
  {:then entry}
    <section class="card bg-base-200 shadow-sm">
      <form 
        use:updateJournalEntry.enhance={async ({ submit }) => {
          await submit();
          goto('/journal');
        }}
        method="POST"
        class="card-body gap-4"
      >
        <input type="hidden" name="id" value={id} />
        
        <div class="fieldset">
          <label class="floating-label">
            <input
              {...updates.title.as('text')}
              class="input w-full"
              placeholder="Title"
              required
            />
            <span>Title</span>
          </label>
        </div>

        <div class="fieldset">
          <label class="floating-label">
            <textarea
              {...updates.summary.as('text')}
              class="textarea w-full h-32"
              placeholder="Summary"
            ></textarea>
            <span>Summary</span>
          </label>
        </div>

        <div class="flex flex-col gap-2">
          <span class="label text-xs">Friction Score</span>
          <input
            {...updates.friction_score.as('range')}
            min="0"
            max="10"
            step="1"
            class="range range-primary"
          />
        </div>

        <div class="card-actions justify-end mt-4">
          <button class="btn btn-primary" disabled={updateJournalEntry.pending}>
            {#if updateJournalEntry.pending}
              <span class="loading loading-spinner"></span>
            {/if}
            Update Entry
          </button>
        </div>
      </form>
    </section>
  {/await}
</div>
