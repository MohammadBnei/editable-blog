<script>
  import { goto } from '$app/navigation';
  import { classNames } from '$lib/util';
  import { Streamdown } from 'svelte-streamdown';
  import SecondaryButton from './SecondaryButton.svelte';

  const { article, firstEntry } = $props();
</script>

<div>
  <div
    class={classNames(
      'max-w-(--breakpoint-lg) mx-auto px-6 md:text-xl',
      firstEntry ? 'pt-2 pb-8 sm:pb-12' : 'py-6 sm:py-10'
    )}
  >
    <div class={classNames(article.published_at ? '' : 'opacity-50')}>
      <div>
        <a
          class={classNames('mb-12 text-2xl md:text-3xl font-bold')}
          href={`/blog/${article.slug}`}
        >
          {article.title}
        </a>
      </div>
      <div class="pt-2 pb-4">
        <div class="line-clamp-4 cursor-pointer" onclick={() => goto(`/blog/${article.slug}`)}>
          {#key article}
            <Streamdown animation={{ enabled: false }} content={article.teaser} />
          {/key}
        </div>
      </div>
    </div>
    <div class="pt-2">
      <SecondaryButton size="sm" href={`/blog/${article.slug}`}>
        Continue reading&nbsp;→
      </SecondaryButton>
    </div>
  </div>
</div>
