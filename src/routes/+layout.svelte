<script>
  import '@fontsource/jost/400.css';
  import '@fontsource/jost/500.css';
  import '@fontsource/jost/600.css';
  import '@fontsource/jost/700.css';

  import '../app.css';

  import { currentLang, currentUser } from '$lib/stores';
  let { data, children } = $props();

  currentLang.set(data.lang);
  currentUser.set(data.currentUser);
</script>

<svelte:head>
  <meta charset="utf-8" />
  <link rel="icon" href="/favicon.png" />
  <meta name="viewport" content="width=device-width" />

  <title>{data.title}</title>
  <meta name="description" content={data.pitch} />
  <link rel="alternate" hreflang="en" href="https://bnei.dev" />
  <link rel="canonical" href="https://bnei.dev" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://bnei.dev" />
  <meta property="og:title" content={data.title} />
  <meta property="og:description" content={data.pitch} />
  <meta property="og:image" content="https://bnei.dev{data.bioPicture}" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://bnei.dev" />
  <meta property="twitter:title" content={data.title} />
  <meta property="twitter:description" content={data.pitch} />
  <meta property="twitter:image" content="https://bnei.dev/{data.bioPicture}" />
</svelte:head>

<main class="snap-y">
  {@render children()}
</main>
