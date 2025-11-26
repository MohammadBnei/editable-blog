<script>
  import BaseButton from '$lib/components/BaseButton.svelte';

  let { disabled, type = 'button', size, href } = $props();
</script>

<BaseButton
  {href}
  {type}
  {size}
  {disabled}
  styles="font-medium hover:bg-gray-100 focus:ring-gray-100 border-2 border-gray-100 bg-white"
  on:click
>
  <slot />
</BaseButton>
