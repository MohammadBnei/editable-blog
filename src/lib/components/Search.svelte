<script>
  import { onMount } from 'svelte';
  import { debounce, classNames } from '$lib/util';
  import { searchLinks, authLinks } from '$lib/headerLinks'; // Import searchLinks
  import { goto } from '$app/navigation';
  import { currentUser } from '$lib/stores'; // Import currentLang store

  export let showSearch;
  let value;
  let result = searchLinks; // Use searchLinks as initial shortcuts
  let selectedResult = 0;
  let input;
  let resultsEl;

  onMount(() => {
    input.focus();
    if ($currentUser) {
      result.push(...authLinks);
    }
  });

  async function search() {
    result = searchLinks; // Use searchLinks as shortcuts when no search value
    if ($currentUser) {
      result.push(...authLinks);
    }
    if (value) {
      const response = await fetch(`/api/search?q=${value}`);
      result = await response.json();
    }
    selectedResult = 0;
  }

  function navigate() {
    const currentResult = result[selectedResult];
    if (currentResult) {
      goto(currentResult.href); // Use href instead of url
    }
    showSearch = false;
  }

  function prevResult() {
    if (selectedResult > 0) {
      selectedResult -= 1;
    }
    scrollIntoViewIfNeeded();
  }

  function nextResult() {
    if (selectedResult < result.length - 1) {
      selectedResult += 1;
    }
    scrollIntoViewIfNeeded();
  }

  function scrollIntoViewIfNeeded() {
    let node = resultsEl.childNodes[selectedResult];
    if (node.scrollIntoViewIfNeeded) {
      node.scrollIntoViewIfNeeded();
    }
  }

  function onKeyDown(e) {
    switch (e.keyCode) {
      case 38: // up
        prevResult();
        e.preventDefault();
        break;
      case 40: // down
        nextResult();
        e.preventDefault();
        break;
      case 13:
        navigate();
        break;
    }
  }
</script>

<div class="relative border-b border-gray-100 flex space-x-4 items-center px-4 sm:px-6 py-2">
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
  <input
    bind:this={input}
    bind:value
    use:debounce={{ value, func: search, duration: 50 }}
    autocomplete="off"
    id="search"
    name="search"
    class="block w-full border-none bg-transparent px-0 py-2 placeholder-gray-300 focus:border-black focus:text-gray-900 focus:placeholder-gray-400 focus:outline-hidden focus:ring-0"
    placeholder="Search website ..."
    type="text"
  />
  <button
    class="bg-gray-100 rounded-md px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900"
    on:click={() => (showSearch = false)}>ESC</button
  >
</div>

{#if result.length > 0}
  <div class="font-bold text-sm px-4 sm:px-6 py-4 border-b border-gray-100">
    {value ? 'BEST MATCHES' : 'SHORTCUTS'}
  </div>
{/if}
<div class="overflow-y-auto" bind:this={resultsEl}>
  {#each result as item, i}
    <a
      on:click={() => (showSearch = false)}
      class={classNames(
        'block px-4 sm:px-6 py-3 border-b border-gray-100 text-gray-600 hover:text-black',
        selectedResult === i ? 'bg-gray-100' : ''
      )}
      href={item.href}>{item.name}</a
    >
  {/each}
  <!-- <label class="toggle text-base-content">
    <input type="checkbox" value="dark" class="theme-controller" />

    <svg aria-label="sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
      ><g
        stroke-linejoin="round"
        stroke-linecap="round"
        stroke-width="2"
        fill="none"
        stroke="currentColor"
        ><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"
        ></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path
          d="M2 12h2"
        ></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path
          d="m19.07 4.93-1.41 1.41"
        ></path></g
      ></svg
    >

    <svg aria-label="moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
      ><g
        stroke-linejoin="round"
        stroke-linecap="round"
        stroke-width="2"
        fill="none"
        stroke="currentColor"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></g
      ></svg
    >
  </label> -->
</div>

<svelte:window on:keydown={onKeyDown} />
