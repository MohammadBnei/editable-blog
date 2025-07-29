<script>
  import WebsiteNav from '$lib/components/WebsiteNav.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import EditorToolbar from '$lib/components/tools/EditorToolbar.svelte';
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';

  export let showUserMenu = false;
  export let currentLang; // New prop for current language
  const dispatch = createEventDispatcher();

  async function setLanguage(lang) {
    const response = await fetch('/api/set-lang', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ lang })
    });

    if (response.ok) {
      // Reload the page to apply language changes
      goto(window.location.pathname, { invalidateAll: true });
    }
  }
</script>

<EditorToolbar on:cancel={() => dispatch('cancel')} on:save={() => dispatch('save')} />
<WebsiteNav bind:showUserMenu />
<div class="lang-switch">
  <button on:click={() => setLanguage('en')} class:active={currentLang === 'en'}>EN</button>
  <button on:click={() => setLanguage('fr')} class:active={currentLang === 'fr'}>FR</button>
</div>
{#if showUserMenu}
  <Modal on:close={() => (showUserMenu = false)}>
    <div class="w-full flex flex-col space-y-4 p-4 sm:p-6">
      <slot />
    </div>
  </Modal>
{/if}
