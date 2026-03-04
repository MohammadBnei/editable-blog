<script lang="ts">
  import { getJournalEntry, deleteJournalEntryForm } from '$lib/journal.remote';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';

  const id = Number(page.params.id);
  const { data } = $props();
  const entry = data.entry;

  console.log({id})

  let frictionColor = $derived.by(() => {
    if (entry.friction_score === null) return 'badge-ghost';
    if (entry.friction_score < 4) return 'badge-success';
    if (entry.friction_score < 7) return 'badge-warning';
    return 'badge-error';
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
        {...deleteJournalEntryForm.enhance(async ({ submit }) => {
          if (confirm('Delete this entry?')) {
            await submit();
            goto('/journal');
          }
        })}
      >
        <input {...deleteJournalEntryForm.fields.id.as('number')} value={id} hidden />
        <button class="btn btn-error btn-outline btn-sm">Delete</button>
      </form>
    </div>
  </header>

  <article
    class="prose max-w-none bg-base-100 p-8 rounded-box shadow-sm border border-base-content/5"
  >
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

  {#if Object.keys(entry.metadata).length > 0}
    <section>
      <h3 class="text-xl font-bold mb-4">Metadata</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {#each Object.entries(entry.metadata) as [key, value]}
          <div class="stat bg-base-100 border border-base-content/5 rounded-box">
            <div class="stat-title capitalize">{key.replace(/_/g, ' ')}</div>
            <div class="stat-value text-lg">
              {#if Array.isArray(value)}
                <div class="flex flex-wrap gap-1 mt-1">
                  {#each value as item}
                    <span class="badge badge-sm badge-soft">{item}</span>
                  {/each}
                </div>
              {:else}
                {value}
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  {#if entry.data?.messages?.length > 0}
    <section class="flex flex-col gap-4">
      <h3 class="text-xl font-bold">Conversation</h3>
      <div class="bg-base-200/50 p-6 rounded-box border border-base-content/5">
        {#each entry.data.messages as message}
          <div class="chat {message.type === 'question' ? 'chat-start' : 'chat-end'}">
            <div class="chat-header opacity-50 text-xs mb-1">
              {message.type === 'question' ? 'Assistant' : 'User'}
              <time class="ml-1">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
            </div>
            <div
              class="chat-bubble {message.type === 'question'
                ? ''
                : 'chat-bubble-primary'}"
            >
              {message.text}
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}
</div>
