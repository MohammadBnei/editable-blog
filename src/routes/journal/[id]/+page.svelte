<script lang="ts">
  import { getJournalEntry, deleteJournalEntry } from '$lib/journal.remote';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';

  const id = Number(page.params.id);
  const entryQuery = $derived(getJournalEntry(id));

  let frictionColor = $derived.by(() => {
    return entryQuery.then(entry => {
        if (entry.friction_score === null) return 'badge-ghost';
        if (entry.friction_score < 4) return 'badge-success';
        if (entry.friction_score < 7) return 'badge-warning';
        return 'badge-error';
    }).catch(() => 'badge-ghost');
  });
</script>

<div class="p-4 max-w-2xl mx-auto flex flex-col gap-8">
  <header class="flex justify-between items-start">
    <div>
      <a href="/journal" class="btn btn-ghost btn-sm mb-4">← Back to List</a>
      <h1 class="text-3xl font-bold">Journal Entry</h1>
    </div>
    <div class="flex gap-2">
      <a href="/journal/{id}/edit" class="btn btn-outline btn-sm">Edit</a>
      <form
        {...deleteJournalEntry}
      >
        <input {...deleteJournalEntry.fields.id.as('hidden')} value={id} />
        <button class="btn btn-error btn-outline btn-sm">Delete</button>
      </form>
    </div>
  </header>

  {#await entryQuery}
    <div class="flex justify-center p-12"><span class="loading loading-spinner loading-lg"></span></div>
  {:then entry}
    <article class="prose max-w-none bg-base-100 p-8 rounded-box shadow-sm border border-base-content/5">
      <div class="flex items-center gap-4 mb-6">
        <h2 class="m-0">{entry.title}</h2>
        {#await frictionColor then color}
           <span class="badge {color}">Friction: {entry.friction_score ?? 'N/A'}</span>
        {/await}
      </div>

      <p class="text-sm opacity-50">
        Created on {new Date(entry.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}
      </p>

      <div class="divider"></div>

      <div class="whitespace-pre-wrap">
        {entry.summary ?? 'No summary provided.'}
      </div>

      {#if entry.category}
        <div class="mt-8">
          <span class="badge badge-outline">{entry.category}</span>
        </div>
      {/if}
    </article>
  {/await}
</div>
