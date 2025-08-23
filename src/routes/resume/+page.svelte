<script>
  import { marked } from 'marked';

  let { data } = $props();
  let htmlContent = $state('');

  $effect(() => {
    if (data.content) {
      htmlContent = marked(data.content);
    }
  });
</script>

<div class="prose">
  {@html htmlContent}
</div>

<style>
  /* Basic styling for markdown content, adjust as needed */
  .prose {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
</style>
