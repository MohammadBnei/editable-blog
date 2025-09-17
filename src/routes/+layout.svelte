<script>
  import '@fontsource/jost/400.css';
  import '@fontsource/jost/500.css';
  import '@fontsource/jost/600.css';
  import '@fontsource/jost/700.css';

  import '../app.css';

  import { currentLang } from '$lib/stores';
  let { data, children } = $props();

  currentLang.set(data.lang);
</script>

<svelte:head>
  <meta charset="utf-8" />
  <link rel="icon" href="/favicon.png" />
  <meta name="viewport" content="width=device-width" />
</svelte:head>

{@render children()}
