<script>
  import WebsiteHeader from './../../lib/components/WebsiteHeader.svelte';
  import Scene from '$lib/components/Scene.svelte';
  import { Canvas } from '@threlte/core';

  let showUserMenu = $state(false);
</script>

<WebsiteHeader bind:showUserMenu></WebsiteHeader>

<div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1;">
  <Canvas>
    <Scene />
  </Canvas>
</div>

<style>
  /* Basic styling to make the canvas fill the viewport */
  div {
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1; /* Ensure it's behind other content if any */
  }
</style>
