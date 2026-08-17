<script>
  import { formatDate } from '$lib/posts.js';

  let { post } = $props();
  let isInterview = $derived(post.metadata.format === 'interview');

  let hasMermaid = $derived(
    post.content.includes('class="mermaid') ||
      (post.metadata.qa ?? []).some(turn => turn.aHtml?.includes('class="mermaid'))
  );

  // mermaid and svg-pan-zoom are lazy chunks, and mermaid loads one more
  // chunk per diagram type inside run(). A single lost fetch used to leave
  // the raw <pre> source on the page for good — silently, since nothing
  // caught the rejection. Retry once, then say so in the console.
  async function renderMermaid() {
    const [{ default: mermaid }, { default: svgPanZoom }] = await Promise.all([
      import('mermaid'),
      import('svg-pan-zoom')
    ]);
    mermaid.initialize({
      startOnLoad: false,
      theme: document.documentElement.dataset.theme === 'notebook-dark' ? 'dark' : 'default'
    });
    await mermaid.run({ querySelector: '.mermaid:not([data-processed])' });
    // :not([data-panzoom]) so a retry, which re-runs this whole function,
    // cannot attach a second pan-zoom instance to an SVG that already has one.
    document.querySelectorAll('.mermaid svg:not([data-panzoom])').forEach(svg => {
      svg.dataset.panzoom = 'true';
      // mermaid sets an inline max-width matching the diagram's
      // natural size, which would otherwise keep the SVG (and so
      // svg-pan-zoom's sizing/controls) pinned to a small corner
      // instead of filling the container.
      svg.style.maxWidth = 'none';
      svgPanZoom(svg, {
        controlIconsEnabled: true,
        fit: true,
        center: true,
        minZoom: 0.5,
        maxZoom: 10
      });
    });
  }

  $effect(() => {
    if (!hasMermaid) return;
    renderMermaid().catch(() =>
      // One retry, after a beat: the realistic failure is a chunk request
      // dropped on a phone connection, not a broken diagram.
      setTimeout(
        () =>
          renderMermaid().catch(err =>
            console.error('mermaid failed to load, diagrams left as source', err)
          ),
        1000
      )
    );
  });
</script>

<header class="mb-10">
  {#if isInterview}
    <p class="mb-2 font-mono text-xs font-bold uppercase tracking-wide text-primary">Q&amp;A</p>
  {/if}
  <h1 class="mb-2 font-mono text-4xl font-extrabold tracking-tight">{post.metadata.title}</h1>
  <div class="font-mono text-base-content/70">{formatDate(post.metadata.date)}</div>
</header>

<div class="space-y-6 pb-12">
  {#each post.metadata.qa ?? [] as turn, i (i)}
    {#if turn.pause}
      <div
        class="flex items-center gap-3 py-2 font-mono text-xs uppercase tracking-wide text-base-content/50"
      >
        <span class="h-px flex-1 bg-base-300"></span>
        <span>{turn.pause}</span>
        <span class="h-px flex-1 bg-base-300"></span>
      </div>
    {:else}
      <div class="rounded-box border border-base-300 bg-base-200 p-5">
        <div class="font-mono text-xs uppercase tracking-wide text-base-content/50">Q</div>
        <p class="mt-1 font-mono text-sm text-base-content/70">{turn.q}</p>
        <div class="mt-4 border-l-2 border-primary pl-4">
          <div class="font-mono text-xs uppercase tracking-wide text-primary">A</div>
          <div class="prose prose-lg mt-1 max-w-none text-base-content">
            {@html turn.aHtml}
          </div>
        </div>
      </div>
    {/if}
  {/each}
</div>
<article class="prose prose-lg mx-auto prose-a:text-primary">
  {@html post.content}
</article>
