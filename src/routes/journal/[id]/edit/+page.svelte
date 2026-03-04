<script lang="ts">
	import JournalForm from '$lib/components/JournalForm.svelte';
  import { getJournalEntry } from '$lib/journal.remote';
  import { page } from '$app/state';

  const id = Number(page.params.id);
  const entryQuery = $derived(getJournalEntry(id));
</script>

<div class="p-4 max-w-2xl mx-auto flex flex-col gap-8">
  <header>
    <a href="/journal/{id}" class="btn btn-ghost btn-sm mb-4">← Back to Details</a>
    <h1 class="text-3xl font-bold">Edit Entry</h1>
  </header>

  {#await entryQuery}
    <div class="flex justify-center p-12"><span class="loading loading-spinner loading-lg"></span></div>
  {:then entry}
    <JournalForm {entry} />
  {/await}
</div>
