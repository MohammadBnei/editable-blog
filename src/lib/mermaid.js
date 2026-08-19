// Client-side mermaid hydration, shared by BlogPost (blog, blog/fr, weekly)
// and Project (portfolio, portfolio/fr). The server-side transform in
// `$lib/cms/content-processor.js` runs over *every* file under `content/`,
// so a portfolio page already ships a correct `<pre class="mermaid">` — it
// just used to have nothing that turned it into an SVG, which renders as a
// 24rem grey box (see `pre.mermaid` in index.css) rather than as a code
// block. This module is the missing half.

export const hasMermaid = html => (html ?? '').includes('class="mermaid');

// mermaid's own theme names, chosen from the daisyUI theme daisyUI writes to
// <html data-theme>. Only the dark variant needs the dark palette.
export const mermaidTheme = theme => (theme === 'notebook-dark' ? 'dark' : 'default');

// svg-pan-zoom attaches a window resize listener per instance, so a
// re-render on theme change has to destroy the old ones or every toggle
// leaks another listener bound to an SVG that no longer exists.
let panZooms = [];

function destroyPanZooms() {
  panZooms.forEach(instance => {
    try {
      instance.destroy();
    } catch {
      // already gone with its SVG; nothing to clean up
    }
  });
  panZooms = [];
}

// mermaid and svg-pan-zoom are lazy chunks, and mermaid loads one more
// chunk per diagram type inside run(). A single lost fetch used to leave
// the raw <pre> source on the page for good — silently, since nothing
// caught the rejection. Retry once, then say so in the console.
async function renderMermaid() {
  const [{ default: mermaid }, { default: svgPanZoom }] = await Promise.all([
    import('mermaid'),
    import('svg-pan-zoom')
  ]);

  // Stash the diagram source before mermaid replaces the <pre>'s content
  // with an SVG. Without this, a re-render (theme toggle) has nothing to
  // re-render *from* — the source is gone.
  document.querySelectorAll('pre.mermaid:not([data-src])').forEach(pre => {
    pre.dataset.src = pre.textContent ?? '';
  });

  mermaid.initialize({
    startOnLoad: false,
    theme: mermaidTheme(document.documentElement.dataset.theme)
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
    panZooms.push(
      svgPanZoom(svg, {
        controlIconsEnabled: true,
        fit: true,
        center: true,
        minZoom: 0.5,
        maxZoom: 10
      })
    );
  });
}

function renderWithRetry() {
  return renderMermaid().catch(() =>
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
}

// Restore every diagram to its source so mermaid.run() will process it
// again under the new theme. mermaid skips [data-processed], and the pan-zoom
// guard is on the SVG that is about to be thrown away.
function resetForRerender() {
  destroyPanZooms();
  document.querySelectorAll('pre.mermaid[data-src]').forEach(pre => {
    pre.removeAttribute('data-processed');
    pre.textContent = pre.dataset.src ?? '';
  });
}

// Call from an $effect. Returns the cleanup function the effect should return.
//
// The theme is a plain DOM + localStorage write in +layout.svelte, not
// reactive state, so an effect cannot depend on it. Watching the attribute
// directly keeps that knowledge here instead of forcing the layout to
// publish a store for one consumer.
export function hydrateMermaid() {
  renderWithRetry();

  const observer = new MutationObserver(() => {
    resetForRerender();
    renderWithRetry();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  return () => {
    observer.disconnect();
    destroyPanZooms();
  };
}
