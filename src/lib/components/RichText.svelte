<script lang="ts">
  import SecondaryButton from '$lib/components/SecondaryButton.svelte';
  import { isEditing } from '$lib/stores';
  import { Streamdown } from 'svelte-streamdown';

  let { content = $bindable<string>() } = $props();
</script>

{#if $isEditing}
  <div class="w-full m-auto">
    <!-- svelte-ignore element_invalid_self_closing_tag -->
    <textarea
      bind:value={content}
      class="min-w-3xs lg:min-w-2xl h-64 p-4 border border-gray-300 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm textarea"
      placeholder="Write your markdown here..."
    />
  </div>
{:else}
  {#key content}
    <Streamdown
      {content}
      animation={{ enabled: false }}
      allowedLinkPrefixes={['btn:', 'mailto:', '*']}
      unwrapDisallowed="true"
    >
      {#snippet link({ children, token })}
        {#if token.href.startsWith('btn:')}
          <SecondaryButton>
            <a class="no-underline" href={token.href.replace('btn:', '')}>
              {token.text.replaceAll('btn:', '')}
            </a>
          </SecondaryButton>
        {:else}
          <a class="link" href={token.href}>{token.text}</a>
        {/if}
      {/snippet}
    </Streamdown>
  {/key}
{/if}
