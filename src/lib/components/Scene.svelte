<script>
  import { T, useTask, useLoader } from '@threlte/core';
  import { interactivity } from '@threlte/extras';
  import { Spring } from 'svelte/motion';
  import { GLTFLoader } from 'three-stdlib'; // Import GLTFLoader

  // Initialize interactivity plugin
  interactivity();

  // Spring for smooth scaling animation (can be applied to the GLTF model if desired)
  const scale = new Spring(1);

  // State for rotation (can be applied to the GLTF model if desired)
  let rotation = $state(0);

  // Use Threlte's task hook for animation
  useTask(delta => {
    // Example: Apply rotation to the GLTF model if it's loaded
    if ($gltf && $gltf.scene) {
      $gltf.scene.rotation.y += delta;
    }
  });

  // Load the GLTF model
  // Assuming 'static/model.gltf' exists. Adjust path as needed.
  const gltf = useLoader(GLTFLoader, '/model.gltf');
</script>

<!-- Perspective Camera -->
<T.PerspectiveCamera
  makeDefault
  position={[10, 10, 10]}
  oncreate={ref => {
    ref.lookAt(0, 0, 0); // Make the camera look at the center of the scene
  }}
/>

<!-- Directional Light for shadows and shading -->
<T.DirectionalLight position={[0, 10, 10]} castShadow />

<!-- The loaded GLTF model -->
{#if $gltf}
  <T is={$gltf.scene} position.y={0} scale={scale.current} castShadow receiveShadow />
{/if}

<!-- The floor for shadows -->
<T.Mesh rotation.x={-Math.PI / 2} receiveShadow>
  <T.CircleGeometry args={[4, 40]} />
  <T.MeshStandardMaterial color="white" />
</T.Mesh>
