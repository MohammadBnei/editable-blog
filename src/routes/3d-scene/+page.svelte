<script>
  import { WebGPURenderer } from 'three/webgpu';
  import WebsiteHeader from './../../lib/components/WebsiteHeader.svelte';
  import Scene from '$lib/components/Scene.svelte';
  import { Canvas } from '@threlte/core';

  let showUserMenu = $state(false);
  let renderMode = $state('manual');
</script>

<WebsiteHeader bind:showUserMenu></WebsiteHeader>

<div>
  <Canvas
    createRenderer={canvas => {
      return new WebGPURenderer({
        canvas,
        antialias: true,
        forceWebGL: false
      });
      renderer.init().then(() => {
        renderMode = 'on-demand';
      });
    }}
  >
    <Scene />
  </Canvas>
</div>
