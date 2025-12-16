<script>
  import { classNames } from '$lib/util';
  import Modal from './Modal.svelte';
  import NotEditable from './NotEditable.svelte';
  import Search from './Search.svelte';
  import { isEditing, currentUser, currentLang } from '$lib/stores'; // Import currentLang store
  import { goto, invalidateAll } from '$app/navigation';
  import { headerLinks, brandLink } from '$lib/headerLinks'; // Import headerLinks and brandLink

  let { showUserMenu = $bindable(), showSearch } = $props();

  function onKeyDown(e) {
    // Close modals
    if (e.key === 'Escape') {
      showSearch = false;
      showUserMenu = false;
    }
    // Trigger the search panel
    if (e.key === 'k' && e.metaKey) {
      showSearch = true;
    }
    // Turn on editing
    if (e.key === 'e' && e.metaKey) {
      $isEditing = true;
    }
  }

  async function setLanguage(lang) {
    // Remove the 'lang' URL parameter
    const url = new URL(window.location.toString());
    if (url.searchParams.has('lang')) {
      url.searchParams.delete('lang');
      goto(url.toString());
    }

    const response = await fetch('/api/set-lang', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ lang })
    });

    if (response.ok) {
      // Update the Svelte store immediately
      $currentLang = lang;
      invalidateAll();
    }
  }

  let toggleLangValue = $derived($currentLang === 'en' ? 'fr' : 'en');
</script>

{#if showSearch}
  <Modal position="top" close={() => (showSearch = false)}>
    <Search bind:showSearch />
  </Modal>
{/if}

<div
  class={classNames(
    'backdrop-blur-xs bg-white bg-opacity-95 transition-colors duration-500 z-10 text-sm px-2',
    !$isEditing ? 'sticky top-0' : ''
  )}
>
  <div class="max-w-dvh lg:max-w-(--breakpoint-lg) mx-auto py-4">
    <NotEditable>
      <div class="flex items-center relative">
        <!-- Mobile Burger Button (visible only on small screens) -->
        <button
          class="btn btn-square btn-ghost lg:hidden ml-2"
          popovertarget="mobile-menu-popover"
          style="anchor-name:--mobile-menu-anchor"
          aria-label="Open menu"
        >
          <!-- Burger SVG Placeholder -->
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>

        <!-- Mobile Dropdown Menu (visible only on small screens) -->
        <ul
          class="dropdown menu w-52 rounded-box bg-base-100 shadow-sm lg:hidden"
          popover
          id="mobile-menu-popover"
          style="position-anchor:--mobile-menu-anchor"
        >
          <li><a href={brandLink.href}>{brandLink.name}</a></li>
          {#each headerLinks as link}
            <li><a href={link.href}>{link.name}</a></li>
          {/each}
        </ul>

        <!-- Desktop Navigation (hidden on small screens) -->
        <div class="hidden lg:flex lg:items-center lg:space-x-6">
          <!-- Brand Link (Mohammad-Amine Banaei) -->
          <a class="font-medium px-2 py-1 rounded-md hover:text-black" href={brandLink.href}>
            {brandLink.name}
          </a>
          <!-- Spacer to push other links to the right -->
          <div class="flex-1"></div>
          <!-- Other Header Links -->
          {#each headerLinks as link}
            <a class="font-medium px-2 py-1 rounded-md hover:text-black" href={link.href}>
              {link.name}
            </a>
          {/each}
        </div>

        <div class="flex-1"></div>

        <!-- Search Button -->
        <button
          title="Search"
          class="mr-6 hover:text-black cursor-pointer"
          onclick={() => (showSearch = true)}
          aria-label="Search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </button>

        <!-- Desktop User Menu (hidden on small screens) -->
        {#if $currentUser}
          <button
            onclick={() => (showUserMenu = !showUserMenu)}
            class="ml-0 hover:text-black cursor-pointer"
            title={$currentUser.name}
            aria-label="User Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
              />
            </svg>
          </button>
        {/if}

        <!-- Language Toggle -->
        <button
          onclick={() => setLanguage(toggleLangValue)}
          class={`ml-4 uppercase hover:underline cursor-pointer`}
          aria-label="Toggle Language">{$currentLang}</button
        >
      </div>
    </NotEditable>
  </div>
</div>

<svelte:window onkeydown={onKeyDown} />
