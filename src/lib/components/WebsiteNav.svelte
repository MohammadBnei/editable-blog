<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  // This component would typically have props for navigation items,
  // but for this example, we'll focus on the language switcher.

  export let currentLang; // This should be passed from the layout data

  function setLanguage(newLang) {
    const url = new URL($page.url);
    url.searchParams.set('lang', newLang);
    goto(url.toString());
  }
</script>

<nav>
  <!-- Example navigation links -->
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>

  <!-- Language switcher -->
  <div class="language-switcher">
    <button on:click={() => setLanguage('en')} class:active={currentLang === 'en'}>English</button>
    <button on:click={() => setLanguage('fr')} class:active={currentLang === 'fr'}>Français</button>
  </div>
</nav>

<style>
  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #f0f0f0;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    gap: 1rem;
  }

  a {
    text-decoration: none;
    color: #333;
  }

  .language-switcher button {
    padding: 0.5rem 1rem;
    margin-left: 0.5rem;
    border: 1px solid #ccc;
    background-color: #fff;
    cursor: pointer;
  }

  .language-switcher button.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }
</style>
