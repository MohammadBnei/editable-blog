<script lang="ts">
  import { createJournalEntry, updateJournalEntry } from '$lib/journal.remote';
  import { goto } from '$app/navigation';
  import type { JournalEntry } from '$lib/journal.remote';

  let { entry = null }: { entry?: JournalEntry | null } = $props();

  const isEdit = $derived(!!entry);
  const form = $derived(isEdit ? updateJournalEntry : createJournalEntry);
  
  // Fields mapping
  const title = $derived(isEdit ? updateJournalEntry.fields.updates.title : createJournalEntry.fields.title);
  const summary = $derived(isEdit ? updateJournalEntry.fields.updates.summary : createJournalEntry.fields.summary);
  const friction_score = $derived(isEdit ? updateJournalEntry.fields.updates.friction_score : createJournalEntry.fields.friction_score);

  $effect(() => {
    if (entry) {
      updateJournalEntry.fields.set({
        id: entry.id,
        updates: {
          title: entry.title,
          summary: entry.summary || '',
          friction_score: entry.friction_score || 0,
          category: entry.category || ''
        }
      });
    }
  });
</script>

<section class="card bg-base-200 shadow-sm">
  <form
    {...form.enhance(async ({ submit }) => {
      await submit();
      goto('/journal');
    })}
    class="card-body gap-4"
  >
    {#if isEdit}
      <input {...updateJournalEntry.fields.id.as('hidden', entry?.id)} />
    {/if}

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
          placeholder="Summary"
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
      <button class="btn btn-primary" disabled={form.pending}>
        {#if form.pending}
          <span class="loading loading-spinner"></span>
        {/if}
        {isEdit ? 'Update Entry' : 'Save Entry'}
      </button>
    </div>
  </form>
</section>
