<script>
  let { metadata } = $props();
</script>

{#if metadata && !metadata.error}
  <div class="card w-72 bg-base-100 shadow-xl compact">
    {#if metadata.image}
      <figure><img src={metadata.image} alt={metadata.title || 'Preview image'} class="w-full h-32 object-cover" /></figure>
    {/if}
    <div class="card-body p-4">
      <h2 class="card-title text-base line-clamp-2">{metadata.title || 'No Title'}</h2>
      <p class="text-xs line-clamp-3">{metadata.description || 'No description available.'}</p>
      {#if metadata.url}
        <div class="card-actions justify-end">
          <a href={metadata.url} target="_blank" rel="noopener noreferrer" class="btn btn-xs btn-primary">Visit</a>
        </div>
      {/if}
    </div>
  </div>
{:else if metadata && metadata.error}
  <div class="card w-72 bg-error text-error-content shadow-xl compact">
    <div class="card-body p-4">
      <h2 class="card-title text-base">Error</h2>
      <p class="text-xs">{metadata.error}</p>
    </div>
  </div>
{/if}
