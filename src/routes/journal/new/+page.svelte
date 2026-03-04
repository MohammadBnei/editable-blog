<script lang="ts">
  import JournalForm from '$lib/components/JournalForm.svelte';
</script>

<div class="p-4 max-w-2xl mx-auto flex flex-col gap-8">
  <header>
    <a href="/journal" class="btn btn-ghost btn-sm mb-4">← Back to List</a>
    <h1 class="text-3xl font-bold">New Journal Entry</h1>
  </header>

  <JournalForm />
</div>
