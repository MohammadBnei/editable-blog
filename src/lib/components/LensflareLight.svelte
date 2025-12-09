<script lang="ts">
  import { T, useLoader } from '@threlte/core';
  import { Lensflare, LensflareElement } from 'three-stdlib';
  import { PointLight, TextureLoader, Color } from 'three';

  export let position: [number, number, number] = [0, 0, 0];
  export let h: number; // Hue
  export let s: number; // Saturation
  export let l: number; // Lightness

  // Load textures for lensflares
  const textureFlare0 = useLoader(TextureLoader, '/textures/lensflare/lensflare0.png');
  const textureFlare3 = useLoader(TextureLoader, '/textures/lensflare/lensflare3.png');

  let lightColor = new Color();
  $effect(() => {
    lightColor.setHSL(h, s, l);
  });

  let pointLight: PointLight;
  let lensflare: Lensflare;

  function createLensflare(ref: PointLight) {
    pointLight = ref;
    if ($textureFlare0 && $textureFlare3) {
      lensflare = new Lensflare();
      lensflare.addElement(new LensflareElement($textureFlare0, 700, 0, lightColor));
      lensflare.addElement(new LensflareElement($textureFlare3, 60, 0.6));
      lensflare.addElement(new LensflareElement($textureFlare3, 70, 0.7));
      lensflare.addElement(new LensflareElement($textureFlare3, 120, 0.9));
      lensflare.addElement(new LensflareElement($textureFlare3, 70, 1));
      pointLight.add(lensflare);
    }
  }

  // Reactively update lensflare elements if textures change (though they are static here)
  $effect(() => {
    if (pointLight && lensflare && $textureFlare0 && $textureFlare3) {
      // Clear existing elements and re-add
      while (lensflare.elements.length > 0) {
        lensflare.elements.pop();
      }
      lensflare.addElement(new LensflareElement($textureFlare0, 700, 0, lightColor));
      lensflare.addElement(new LensflareElement($textureFlare3, 60, 0.6));
      lensflare.addElement(new LensflareElement($textureFlare3, 70, 0.7));
      lensflare.addElement(new LensflareElement($textureFlare3, 120, 0.9));
      lensflare.addElement(new LensflareElement($textureFlare3, 70, 1));
    }
  });
</script>

<T.PointLight
  {position}
  color={lightColor}
  intensity={1.5}
  distance={2000}
  decay={0}
  on:create={({ ref }) => createLensflare(ref)}
/>
