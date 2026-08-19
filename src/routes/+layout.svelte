<script>
  import '../lib/index.css';
  import { afterNavigate, goto } from '$app/navigation';
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { langPref } from '$lib/stores/lang.svelte.js';

  let { children } = $props();
  let menuEl = $state();
  let settingsEl = $state();
  let mobileSettingsEl = $state();

  let showLangNotice = $state(false);
  let requestedLang = $state('fr');
  let langNoticeTimeout;

  onMount(() => {
    langPref.hydrate();
  });

  const isPostPage = $derived(/^\/(blog|portfolio)\/(fr\/)?[^/]+$/.test(page.url.pathname));
  const currentLang = $derived(/^\/(blog|portfolio)\/fr\//.test(page.url.pathname) ? 'fr' : 'en');
  const translationUrl = $derived(page.data?.translationUrl ?? null);
  const activeLang = $derived(isPostPage ? currentLang : langPref.value);

  afterNavigate(() => {
    menuEl?.hidePopover();
    settingsEl?.hidePopover();
    mobileSettingsEl?.hidePopover();
  });

  function setWidth(w) {
    document.documentElement.dataset.width = w;
    localStorage.setItem('content-width', w);
  }

  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    localStorage.setItem('theme', t);
  }

  function setLang(l) {
    langPref.value = l;

    if (isPostPage && l !== currentLang) {
      if (translationUrl) {
        goto(translationUrl);
      } else {
        requestedLang = l;
        showLangNotice = true;
        clearTimeout(langNoticeTimeout);
        langNoticeTimeout = setTimeout(() => (showLangNotice = false), 4000);
      }
    }
  }
</script>

<div class="flex min-h-screen flex-col bg-base-100 font-serif text-base-content">
  <header class="sticky top-0 z-10 border-b border-base-300 bg-base-100/90 backdrop-blur">
    <div class="mx-auto flex max-w-(--content-w) items-center justify-between px-4 py-5">
      <a
        href="/"
        class="font-mono text-lg font-bold tracking-tight hover:text-primary transition-colors"
        >bnei.dev</a
      >
      <nav class="hidden gap-1 font-mono text-sm font-medium uppercase tracking-wide sm:flex">
        <a href="/blog" class="rounded-field px-3 py-1.5 hover:bg-base-300/60 transition-colors"
          >Articles</a
        >
        <a
          href="/portfolio"
          class="rounded-field px-3 py-1.5 hover:bg-base-300/60 transition-colors">Portfolio</a
        >
        <a href="/resume" class="rounded-field px-3 py-1.5 hover:bg-base-300/60 transition-colors"
          >Resume</a
        >
      </nav>

      <button
        popovertarget="settings-popover"
        style="anchor-name:--settings-anchor"
        class="btn btn-ghost btn-square hidden sm:inline-flex"
        aria-label="Settings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
      <div
        bind:this={settingsEl}
        id="settings-popover"
        popover
        style="position-anchor:--settings-anchor"
        class="dropdown dropdown-end mt-2 w-56 rounded-box border border-base-300 bg-base-100 p-3 font-mono text-xs shadow-lg"
      >
        <div class="flex flex-col gap-3">
          {@render settingsControls()}
        </div>
      </div>

      <button
        popovertarget="menu-popover"
        style="anchor-name:--menu-anchor"
        class="btn btn-ghost btn-square sm:hidden"
        aria-label="Toggle menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div
        bind:this={menuEl}
        id="menu-popover"
        popover
        style="position-anchor:--menu-anchor"
        class="dropdown dropdown-end mt-2 rounded-box border border-base-300 bg-base-100 p-2 font-mono text-sm font-medium uppercase tracking-wide shadow-lg"
      >
        <ul class="menu w-full gap-1 p-0">
          <li><a href="/blog" class="rounded-field hover:bg-base-300/60">Articles</a></li>
          <li><a href="/portfolio" class="rounded-field hover:bg-base-300/60">Portfolio</a></li>
          <li><a href="/resume" class="rounded-field hover:bg-base-300/60">Resume</a></li>
          <li>
            <button
              type="button"
              popovertarget="mobile-settings-popover"
              style="anchor-name:--mobile-settings-anchor"
              class="rounded-field hover:bg-base-300/60">Settings</button
            >
          </li>
        </ul>
      </div>
      <div
        bind:this={mobileSettingsEl}
        id="mobile-settings-popover"
        popover
        style="position-anchor:--mobile-settings-anchor"
        class="dropdown dropdown-end w-56 rounded-box border border-base-300 bg-base-100 p-3 font-mono text-xs shadow-lg"
      >
        <div class="flex flex-col gap-3">
          {@render settingsControls()}
        </div>
      </div>
    </div>
  </header>

  {#snippet settingsControls()}
    <div>
      <p class="mb-1.5 uppercase tracking-wide text-base-content/50">Theme</p>
      <div class="flex gap-1">
        <button
          type="button"
          data-t="notebook"
          class="theme-toggle flex-1 rounded-field px-2 py-1.5 hover:bg-base-300/60 transition-colors"
          onclick={() => setTheme('notebook')}>Light</button
        >
        <button
          type="button"
          data-t="notebook-dark"
          class="theme-toggle flex-1 rounded-field px-2 py-1.5 hover:bg-base-300/60 transition-colors"
          onclick={() => setTheme('notebook-dark')}>Dark</button
        >
      </div>
    </div>
    <div class="hidden sm:block">
      <p class="mb-1.5 uppercase tracking-wide text-base-content/50">Width</p>
      <div class="flex gap-1">
        <button
          type="button"
          data-w="cozy"
          class="w-toggle flex-1 rounded-field px-2 py-1.5 hover:bg-base-300/60 transition-colors"
          onclick={() => setWidth('cozy')}>S</button
        >
        <button
          type="button"
          data-w="comfortable"
          class="w-toggle flex-1 rounded-field px-2 py-1.5 hover:bg-base-300/60 transition-colors"
          onclick={() => setWidth('comfortable')}>M</button
        >
        <button
          type="button"
          data-w="wide"
          class="w-toggle flex-1 rounded-field px-2 py-1.5 hover:bg-base-300/60 transition-colors"
          onclick={() => setWidth('wide')}>L</button
        >
      </div>
    </div>
    <div>
      <p class="mb-1.5 uppercase tracking-wide text-base-content/50">Language</p>
      <div class="flex gap-1">
        <button
          type="button"
          class="flex-1 rounded-field px-2 py-1.5 transition-colors hover:bg-base-300/60"
          class:bg-base-300={activeLang === 'en'}
          class:text-primary={activeLang === 'en'}
          onclick={() => setLang('en')}>EN</button
        >
        <button
          type="button"
          class="flex-1 rounded-field px-2 py-1.5 transition-colors hover:bg-base-300/60"
          class:bg-base-300={activeLang === 'fr'}
          class:text-primary={activeLang === 'fr'}
          onclick={() => setLang('fr')}>FR</button
        >
      </div>
    </div>
  {/snippet}

  <main class="mx-auto w-full max-w-[var(--content-w)] flex-1 px-4 py-12">
    {@render children()}
  </main>

  <footer
    class="mx-auto w-full max-w-[var(--content-w)] px-4 py-12 text-center font-mono text-sm text-base-content/70"
  >
    &copy; {new Date().getFullYear()} bnei.dev
  </footer>

  {#if showLangNotice}
    <div class="toast toast-end toast-bottom z-20">
      <div class="alert alert-warning font-mono text-sm">
        <span
          >This post isn't available in {requestedLang === 'fr' ? 'French' : 'English'} yet.</span
        >
      </div>
    </div>
  {/if}
</div>
