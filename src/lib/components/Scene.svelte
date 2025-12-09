<script lang="ts">
  import { T, useTask, useThrelte } from '@threlte/core';
  import { interactivity, OrbitControls } from '@threlte/extras';
  import { Spring } from 'svelte/motion';
  import King from './models/king.svelte';
  import {
    Vector2,
    Raycaster,
    PlaneGeometry,
    Mesh,
    Vector3,
    PMREMGenerator,
    WebGLRenderTarget,
    Group,
    Color,
    MeshStandardMaterial
  } from 'three';
  import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
  import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
  import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
  import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

  const { scene, size, camera, renderer } = useThrelte();

  // Initialize interactivity plugin
  interactivity();

  // Spring for smooth scaling animation

  let intersectionPoint: Vector3 | undefined;
  let translAccellerationY = 0;
  let translAccellerationX = 0;
  let angleAccelleration = 0;
  let pmrem = new PMREMGenerator(renderer);
  let envMapRT: WebGLRenderTarget;
  let kingRef = $state<Group>();
  let translY = $state(0);
  let translX = $state(0);
  let angleZ = $state(0);
  let followMouse = true; // New state variable to control mouse following

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, $camera);
  const bloomPass = new UnrealBloomPass(new Vector2($size.width, $size.height), 0.275, 1, 0);
  const outputPass = new OutputPass();
  composer.addPass(renderPass);
  composer.addPass(bloomPass);
  composer.addPass(outputPass);

  $effect(() => {
    composer.setSize($size.width, $size.height);
    bloomPass.resolution.set($size.width, $size.height);
  });
  $effect(() => {
    renderPass.camera = $camera;
  });

  const { renderStage } = useThrelte();
  useTask(
    () => {
      if (followMouse && intersectionPoint) { // Only update if followMouse is true
        const targetY = intersectionPoint?.y || 0;
        const targetX = intersectionPoint?.x || 0;
        translAccellerationY += (targetY - translY) * 0.002; // stiffness
        translAccellerationY *= 0.95; // damping
        translY += translAccellerationY;

        translAccellerationX += (targetX - translX) * 0.002; // stiffness
        translAccellerationX *= 0.95; // damping
        translX += translAccellerationX;

        const dir = intersectionPoint
          .clone()
          .sub(new Vector3(translX, translY, 0))
          .normalize();
        const dirCos = dir.dot(new Vector3(0, 1, 0));
        const angle = Math.acos(dirCos) - Math.PI * 0.5;
        angleAccelleration += (angle - angleZ) * 0.01; // stiffness
        angleAccelleration *= 0.85; // damping
        angleZ += angleAccelleration;
      }
      if (envMapRT) {
        envMapRT.dispose();
      }
      if (kingRef) {
        kingRef.visible = false;
        scene.background = null;
        envMapRT = pmrem.fromScene(scene, 0, 0.1, 1000);
        scene.background = new Color('#598889').multiplyScalar(0.05);
        kingRef.visible = true;
        kingRef.traverse(child => {
          if ('material' in child) {
            const material = child.material as MeshStandardMaterial;
            if ('envMapIntensity' in material) {
              material.envMap = envMapRT.texture;
              material.envMapIntensity = 100;
              material.normalScale.set(0.3, 0.3);
            }
          }
        });
      }
      composer.render();
    },
    {
      stage: renderStage
    }
  );

  const planeGeo = new PlaneGeometry(20, 20);
  const mesh = new Mesh(planeGeo);

  const raycaster = new Raycaster();
  const pointer = new Vector2();

  function onpointermove(event: PointerEvent) {
    if (!followMouse) return; // Do nothing if not following mouse
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, $camera);
    const intersects = raycaster.intersectObject(mesh);
    intersectionPoint = intersects[0]?.point;
    // if (intersectionPoint) {
    //   // this prevents the spring motion to be different while the pointer
    //   // spans the x axis
    //   intersectionPoint.x = 3;
    // }
  }

  function oncontextmenu(event: MouseEvent) {
    event.preventDefault(); // Prevent the default right-click context menu
    followMouse = !followMouse; // Toggle followMouse state
  }
</script>

<svelte:window {onpointermove} oncontextmenu={oncontextmenu} />

<!-- Perspective Camera -->
<T.PerspectiveCamera
  makeDefault
  position={[0, 10, 10]}
  fov={75}
  aspect={window.innerWidth / window.innerHeight}
  oncreate={ref => {
    ref.lookAt(0, 0, 0); // Make the camera look at the center of the scene to see both objects
  }}
>
  <OrbitControls enableDamping target={[0, 0, 0]} />
</T.PerspectiveCamera>

<!-- Directional Light for shadows and shading -->
<T.DirectionalLight position={[0, 10, 10]} castShadow />
<T.AmbientLight intensity={0.3} />


<King
  bind:ref={kingRef}
  position={[translX, translY, 0]}
  rotation={[angleZ, 0, angleZ, 'ZXY']}
  scale={2}
>
  <T.MeshStandardMaterial color="orange" />
</King>
