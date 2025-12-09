<script lang="ts">
  import { T, useTask, useFrame, useThrelte } from '@threlte/core';
  import { FlyControls } from 'three-stdlib';
  import { Color, PerspectiveCamera, Scene, Fog, BoxGeometry, MeshPhongMaterial, Mesh, DirectionalLight, SRGBColorSpace } from 'three';
  import LensflareLight from './LensflareLight.svelte'; // Import the new component

  // Threlte context
  const { renderer, camera, invalidate } = useThrelte();

  // Camera setup
  let mainCamera: PerspectiveCamera;
  $effect(() => {
    if (camera.current) {
      mainCamera = camera.current as PerspectiveCamera;
      mainCamera.position.set(0, 0, 250);
      mainCamera.fov = 40;
      mainCamera.near = 1;
      mainCamera.far = 15000;
      mainCamera.updateProjectionMatrix();
    }
  });

  // Scene background and fog
  let mainScene: Scene;
  $effect(() => {
    if (renderer.current && camera.current) {
      mainScene = renderer.current.scene;
      mainScene.background = new Color().setHSL(0.51, 0.4, 0.01, SRGBColorSpace);
      mainScene.fog = new Fog(mainScene.background, 3500, 15000);
    }
  });

  // FlyControls setup
  let controls: FlyControls;
  $effect(() => {
    if (mainCamera && renderer.current?.domElement) {
      controls = new FlyControls(mainCamera, renderer.current.domElement);
      controls.movementSpeed = 2500;
      controls.rollSpeed = Math.PI / 6;
      controls.autoForward = false;
      controls.dragToLook = false;
    }
  });

  // Animation loop for controls
  useFrame((_, delta) => {
    if (controls) {
      controls.update(delta);
      invalidate(); // Request a new frame if controls update
    }
  });

  // World: many cubes
  $effect(() => {
    if (mainScene) {
      const s = 250;
      const geometry = new BoxGeometry(s, s, s);
      const material = new MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, shininess: 50 });

      for (let i = 0; i < 3000; i++) {
        const mesh = new Mesh(geometry, material);
        mesh.position.x = 8000 * (2.0 * Math.random() - 1.0);
        mesh.position.y = 8000 * (2.0 * Math.random() - 1.0);
        mesh.position.z = 8000 * (2.0 * Math.random() - 1.0);
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        mesh.rotation.z = Math.random() * Math.PI;
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        mainScene.add(mesh);
      }
    }
  });
</script>

<!-- Directional Light -->
<T.DirectionalLight
  position={[0, -1, 0]}
  color={new Color().setHSL(0.1, 0.7, 0.5)}
  intensity={0.15}
/>

<!-- Lensflare Lights -->
<LensflareLight h={0.55} s={0.9} l={0.5} position={[5000, 0, -1000]} />
<LensflareLight h={0.08} s={0.8} l={0.5} position={[0, 0, -1000]} />
<LensflareLight h={0.995} s={0.5} l={0.9} position={[5000, 5000, -1000]} />

<!-- The floor for shadows (optional, removed from original example) -->
<!-- <T.Mesh rotation.x={-Math.PI / 2} receiveShadow>
  <T.CircleGeometry args={[4, 40]} />
  <T.MeshStandardMaterial color="white" />
</T.Mesh> -->
