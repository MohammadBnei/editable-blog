<script>
  import '@fontsource/jost/400.css';
  import '@fontsource/jost/500.css';
  import '@fontsource/jost/600.css';
  import '@fontsource/jost/700.css';
  import WebsiteHeader from '$lib/components/WebsiteHeader.svelte';

  import '../app.css';

  export let data;
</script>

<WebsiteHeader currentLang={data.lang} />
<slot />
