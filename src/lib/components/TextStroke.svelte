<script lang="ts">
  import { T, useThrelte } from '@threlte/core';
  import {
    Color,
    Group,
    Mesh,
    MeshBasicMaterial,
    ShapeGeometry,
    Vector3,
    type Object3D
  } from 'three';
  import { FontLoader, Font } from 'three/addons/loaders/FontLoader.js';
  import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
  import { unzipSync, strFromU8 } from 'fflate'; // Using fflate directly

  export let text: string;
  export let size: number = 80;
  export let color: string = '#006699';
  export let strokeColor: string = '#006699';
  export let direction: 'ltr' | 'rtl' | 'tb' = 'ltr';
  export let opacity: number = 0.4;
  export let strokeWidth: number = 5;
  export let position: Vector3 = new Vector3(0, 0, 0);
  export let rotation: [x: number, y: number, z: number] = [0, 0, 0];
  export let scale: number = 1;

  let textGroup = $state<Group>();
  let font: Font | undefined;

  // Load the font
  $effect(() => {
    const fontLoader = new FontLoader();
    // Assuming the font file is in the static directory or accessible via a direct path
    // You might need to adjust this path based on your project structure
    fetch('/fonts/MPLUSRounded1c-Regular.typeface.json.zip')
      .then(response => response.arrayBuffer())
      .then(data => {
        const zip = unzipSync(new Uint8Array(data));
        const strArray = strFromU8(new Uint8Array(zip['MPLUSRounded1c-Regular.typeface.json'].buffer));
        font = new Font(JSON.parse(strArray));
      })
      .catch(error => console.error('Error loading font:', error));
  });

  // Function to generate stroke text
  function generateStrokeText(
    font: Font,
    message: string,
    size: number,
    direction: 'ltr' | 'rtl' | 'tb',
    fillColor: Color,
    strokeColor: Color,
    opacity: number,
    strokeWidth: number
  ): Group {
    const shapes = font.generateShapes(message, size, direction);
    const geometry = new ShapeGeometry(shapes);

    const strokeTextGroup = new Group();

    geometry.computeBoundingBox();
    const xMid = -0.5 * (geometry.boundingBox!.max.x - geometry.boundingBox!.min.x);

    geometry.translate(xMid, 0, 0);

    // Make shape (fill)
    const matLite = new MeshBasicMaterial({
      color: fillColor,
      transparent: true,
      opacity: opacity,
      side: 2 // THREE.DoubleSide
    });
    const textMesh = new Mesh(geometry, matLite);
    textMesh.position.z = -150; // Adjust Z position to avoid z-fighting with stroke
    strokeTextGroup.add(textMesh);

    // Make line shape (stroke)
    const holeShapes: any[] = [];
    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i];
      if (shape.holes && shape.holes.length > 0) {
        for (let j = 0; j < shape.holes.length; j++) {
          const hole = shape.holes[j];
          holeShapes.push(hole);
        }
      }
    }
    shapes.push(...holeShapes);

    const style = SVGLoader.getStrokeStyle(strokeWidth, strokeColor.getStyle());

    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i];
      const points = shape.getPoints();
      const strokeGeometry = SVGLoader.pointsToStroke(points, style);
      strokeGeometry.translate(xMid, 0, 0);
      const matDark = new MeshBasicMaterial({
        color: strokeColor,
        side: 2 // THREE.DoubleSide
      });
      const strokeMesh = new Mesh(strokeGeometry, matDark);
      strokeTextGroup.add(strokeMesh);
    }

    return strokeTextGroup;
  }

  // Re-generate text whenever props or font changes
  $effect(() => {
    if (font && textGroup) {
      // Clear existing children
      while (textGroup.children.length > 0) {
        const child = textGroup.children[0];
        textGroup.remove(child);
        if ((child as Mesh).geometry) (child as Mesh).geometry.dispose();
        if ((child as Mesh).material) {
          if (Array.isArray((child as Mesh).material)) {
            (child as Mesh).material.forEach(m => m.dispose());
          } else {
            ((child as Mesh).material as MeshBasicMaterial).dispose();
          }
        }
      }

      const newTextGroup = generateStrokeText(
        font,
        text,
        size,
        direction,
        new Color(color),
        new Color(strokeColor),
        opacity,
        strokeWidth
      );
      newTextGroup.children.forEach(child => textGroup.add(child));
    }
  });
</script>

{#if font}
  <T.Group
    bind:ref={textGroup}
    position={position}
    rotation={rotation}
    scale={scale}
  />
{/if}

