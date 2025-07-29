<script>
  import '@fontsource/jost/400.css';
  import '@fontsource/jost/500.css';
  import '@fontsource/jost/600.css';
  import '@fontsource/jost/700.css';

  import '../app.css';

  import { currentLang } from '$lib/stores';
  let {data} = $props()
  
  currentLang.set(data.lang);
</script>

<slot />
