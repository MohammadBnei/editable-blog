<script lang="ts">
  import type { JournalEntry } from '$lib/journal.remote';
  import { deleteJournalEntry, updateJournalEntry } from '$lib/journal.remote';

  let { entry, onrefresh }: { entry: JournalEntry; onrefresh: () => void } = $props();

  let frictionColor = $derived(
    entry.friction_score === null ? 'badge-ghost' :
    entry.friction_score < 4 ? 'badge-success' :
    entry.friction_score < 7 ? 'badge-warning' : 'badge-error'
  );
</script>

<div class="list-row items-center gap-4 p-4 hover:bg-base-200 transition-colors relative">
  <a href="/journal/{entry.id}" class="flex flex-col gap-1 list-col-grow">
    <div class="flex items-center gap-2">
      <h3 class="font-bold text-lg">{entry.title}</h3>
      {#if entry.friction_score !== null}
        <span class="badge {frictionColor} badge-sm">Friction: {entry.friction_score}</span>
      {/if}
      {#if entry.category}
        <span class="badge badge-outline badge-sm">{entry.category}</span>
      {/if}
    </div>
    
    {#if entry.summary}
      <p class="text-sm opacity-70 line-clamp-2">{entry.summary}</p>
    {/if}
    
    <span class="text-xs opacity-50">
      {new Date(entry.created_at).toLocaleDateString('fr-FR')}
    </span>
  </a>

  <div class="flex gap-2">
    <a href="/journal/{entry.id}/edit" class="btn btn-square btn-ghost btn-sm" aria-label="Edit">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </a>
    <form
      {...deleteJournalEntry}
    >
      <input {...deleteJournalEntry.fields.id.as('hidden')} value={entry.id} />
      <button class="btn btn-square btn-ghost btn-sm text-error" aria-label="Delete">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </form>
  </div>
</div>
