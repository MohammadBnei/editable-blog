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

<!-- Add this navigation link -->
<nav>
  <a href="/resume">Resume</a>
</nav>

{@render children()}
