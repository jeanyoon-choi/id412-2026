"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BITTER, type Pellet } from "./school";

// What the mobiles dropped. Food: small brown pellets floating near the surface.
// Bitter: a red cloud that spreads in the water and thins out as it dissolves.
const MAX_FOOD = 400;
const MAX_BITTER = 16;
const FLOAT = 50; // px above the floor

// A soft round blot, bright in the middle and gone at the rim.
function blotTexture() {
  const element = document.createElement("canvas");
  element.width = element.height = 128;
  const context = element.getContext("2d")!;
  const fade = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  fade.addColorStop(0, "rgba(255, 255, 255, 1)");
  fade.addColorStop(0.4, "rgba(255, 255, 255, 0.45)");
  fade.addColorStop(1, "rgba(255, 255, 255, 0)");
  context.fillStyle = fade;
  context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(element);
}

export function Pellets({ pellets, width, height }: { pellets: React.RefObject<Pellet[]>; width: number; height: number }) {
  const food = useRef<THREE.InstancedMesh>(null);
  const bitter = useRef<THREE.InstancedMesh>(null);
  const blot = useMemo(blotTexture, []);
  const scratch = useMemo(() => ({ object: new THREE.Object3D(), colour: new THREE.Color() }), []);

  useFrame(() => {
    const { object, colour } = scratch;
    let foods = 0;
    let bitters = 0;
    for (const pellet of pellets.current) {
      object.position.set(pellet.x - width / 2, FLOAT, pellet.y - height / 2);
      if (pellet.kind === "food" && foods < MAX_FOOD) {
        object.rotation.set(0, 0, 0);
        object.scale.setScalar(Math.min(1, pellet.age * 4)); // it appears quickly, not at once
        object.updateMatrix();
        food.current!.setMatrixAt(foods++, object.matrix);
      } else if (pellet.kind === "bitter" && bitters < MAX_BITTER) {
        const left = pellet.left / BITTER; // 1 → 0 as it dissolves
        object.rotation.set(-Math.PI / 2, 0, 0); // lying flat
        object.scale.setScalar(40 + (1 - left) * 220); // the cloud spreads
        object.updateMatrix();
        bitter.current!.setMatrixAt(bitters, object.matrix);
        // The cloud is added to what is behind it, so a darker colour is a thinner cloud.
        bitter.current!.setColorAt(bitters++, colour.set("#e94a58").multiplyScalar(left * 0.9));
      }
    }
    // Only the first `count` instances are drawn.
    food.current!.count = foods;
    bitter.current!.count = bitters;
    food.current!.instanceMatrix.needsUpdate = true;
    bitter.current!.instanceMatrix.needsUpdate = true;
    if (bitter.current!.instanceColor) bitter.current!.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={food} args={[undefined, undefined, MAX_FOOD]} castShadow frustumCulled={false}>
        <sphereGeometry args={[2.6, 10, 8]} />
        <meshStandardMaterial color="#b98a52" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={bitter} args={[undefined, undefined, MAX_BITTER]} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={blot} blending={THREE.AdditiveBlending} transparent depthWrite={false} />
      </instancedMesh>
    </>
  );
}
