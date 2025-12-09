<script>
  import { Canvas, T, useTask } from '@threlte/core';
  import { interactivity } from '@threlte/extras';
  import { Spring } from 'svelte/motion';
  import { WebGPURenderer } from 'three/webgpu';

  let renderMode = $state('manual');

  // Initialize interactivity plugin
  interactivity();

  // Spring for smooth scaling animation
  const scale = new Spring(1);

  // State for rotation
  let rotation = $state(0);

  // Use Threlte's task hook for animation
  useTask(delta => {
    rotation += delta; // Rotate based on time delta for frame-rate independence
  });
</script>

<!-- Perspective Camera -->
<T.PerspectiveCamera
  makeDefault
  position={[10, 10, 10]}
  oncreate={ref => {
    ref.lookAt(0, 1, 0); // Make the camera look at the cube's initial position
  }}
/>

<!-- Directional Light for shadows and shading -->
<T.DirectionalLight position={[0, 10, 10]} castShadow />

<!-- The interactive, animated cube -->
<T.Mesh
  rotation.y={rotation}
  position.y={1}
  scale={scale.current}
  onpointerenter={() => {
    scale.target = 1.5; // Scale up on hover
  }}
  onpointerleave={() => {
    scale.target = 1; // Scale down on hover exit
  }}
  castShadow
>
  <T.BoxGeometry args={[1, 2, 1]} />
  <T.MeshStandardMaterial color="hotpink" />
</T.Mesh>

<!-- The floor for shadows -->
<T.Mesh rotation.x={-Math.PI / 2} receiveShadow>
  <T.CircleGeometry args={[4, 40]} />
  <T.MeshStandardMaterial color="white" />
</T.Mesh>
