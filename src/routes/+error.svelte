<script>
  import { page } from '$app/state';
</script>

<svelte:head>
  <title>{page.status} - bnei.dev</title>
</svelte:head>

<div class="flex flex-col items-center gap-6 py-16 text-center sm:py-24">
  <p class="font-mono text-6xl font-extrabold tracking-tight text-primary">{page.status}</p>
  <h1 class="font-mono text-2xl font-bold">
    {page.status === 404 ? 'Page not found' : 'Something went wrong'}
  </h1>
  <p class="max-w-prose text-base-content/70">
    {page.error?.message || "The page you're looking for doesn't exist or was moved."}
  </p>
  <a href="/" class="btn btn-primary rounded-field">Back home</a>
</div>
