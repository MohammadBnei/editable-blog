<script>
  let { post } = $props();
  let isInterview = $derived(post.metadata.format === 'interview');

  let hasMermaid = $derived(
    post.content.includes('class="mermaid') ||
      (post.metadata.qa ?? []).some(turn => turn.aHtml?.includes('class="mermaid'))
  );

  $effect(() => {
    if (hasMermaid) {
      Promise.all([import('mermaid'), import('svg-pan-zoom')]).then(
        ([{ default: mermaid }, { default: svgPanZoom }]) => {
          mermaid.initialize({
            startOnLoad: false,
            theme: document.documentElement.dataset.theme === 'notebook-dark' ? 'dark' : 'default'
          });
          mermaid.run({ querySelector: '.mermaid' }).then(() => {
            document.querySelectorAll('.mermaid svg').forEach(svg => {
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
          });
        }
      );
    }
  });
</script>

<header class="mb-10">
  {#if isInterview}
    <p class="mb-2 font-mono text-xs font-bold uppercase tracking-wide text-primary">Q&amp;A</p>
  {/if}
  <h1 class="mb-2 font-mono text-4xl font-extrabold tracking-tight">{post.metadata.title}</h1>
  <div class="font-mono text-base-content/70">{post.metadata.date}</div>
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
