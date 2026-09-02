<script>
  let { data } = $props();
  let { post } = $derived(data);

  // LinkedIn's hard limit on a post body.
  const MAX_CHARS = 3000;
  // Roughly where the "…see more" fold falls on a desktop feed. Approximate on purpose —
  // LinkedIn varies it by viewport, and a precise-looking number here would be a lie.
  const FOLD_CHARS = 210;

  let body = $state(null);
  let text = $state('');
  let copied = $state(false);

  // The pasteable text is the RENDERED text, not the markdown source: LinkedIn has no
  // markdown, so what you want on the clipboard is exactly what innerText gives — paragraphs
  // separated by blank lines, no syntax. This is also why no raw-markdown plumbing exists.
  $effect(() => {
    if (body) text = body.innerText.trim();
  });

  let chars = $derived(text.length);
  let over = $derived(chars > MAX_CHARS);

  async function copy() {
    await navigator.clipboard.writeText(text);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }
</script>

<svelte:head>
  <title>{post.metadata.title}</title>
</svelte:head>

<a
  href="/linkedin"
  class="mb-8 inline-flex items-center gap-1 font-mono text-sm font-medium text-base-content/60 transition-colors hover:text-primary"
>
  <span aria-hidden="true">&larr;</span> Back to drafts
</a>

<header class="mb-6">
  <h1 class="mb-2 font-mono text-3xl font-extrabold tracking-tight">{post.metadata.title}</h1>
  {#if post.metadata.source}
    <a href={post.metadata.source} class="font-mono text-sm text-primary hover:underline">
      from {post.metadata.source}
    </a>
  {/if}
</header>

<div class="mb-6 flex flex-wrap items-center gap-4">
  <button class="btn btn-primary btn-sm" onclick={copy} disabled={!text}>
    {copied ? 'Copied' : 'Copy'}
  </button>
  <span class="font-mono text-sm" class:text-error={over} class:text-base-content-70={!over}>
    {chars} / {MAX_CHARS}
    {#if over}— too long for LinkedIn{/if}
  </span>
</div>

{#if text}
  <section class="mb-6 rounded-box border border-base-300 bg-base-200 p-5">
    <h2 class="mb-2 font-mono text-xs uppercase tracking-wide text-base-content/50">
      Before the fold (~{FOLD_CHARS} chars)
    </h2>
    <p class="leading-relaxed">
      {text.slice(0, FOLD_CHARS)}{#if chars > FOLD_CHARS}<span class="text-base-content/40"
          >… see more</span
        >{/if}
    </p>
  </section>
{/if}

<article class="prose prose-lg max-w-none whitespace-pre-line" bind:this={body}>
  {@html post.content}
</article>
