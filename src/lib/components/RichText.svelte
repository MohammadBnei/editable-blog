<script lang="ts">
  import SecondaryButton from '$lib/components/SecondaryButton.svelte';
  import { isEditing } from '$lib/stores';
  import { Streamdown } from 'svelte-streamdown';

  let { content = $bindable<string>() } = $props();
  let textareaElement: HTMLTextAreaElement;
</script>

{#if $isEditing}
  <div class="w-full">
    <textarea
      bind:this={textareaElement}
      bind:value={content}
      class="w-full h-64 p-4 border border-gray-300 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm textarea"
      placeholder="Write your markdown here..."
    />
  </div>
{:else}
  <div class="prose md:prose-xl w-full max-w-full">
    {#key content}
      <Streamdown {content} animation={{ enabled: false }}>
        {#snippet link({ children, token })}
          <SecondaryButton>
            <a class="no-underline" href={token.href}>
              {@render children()}
            </a>
          </SecondaryButton>
        {/snippet}
      </Streamdown>
    {/key}
  </div>
{/if}
