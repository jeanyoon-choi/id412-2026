"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Fish } from "./school";

// The goldfish of experiments-jyc (goldfishes, rendering/goldfish-scene.ts, the "naturalistic" body):
// the same shapes, sizes, colours and tail motion, made lighter so that thousands can swim at once.
//  - Each shape has few corners, because a fish is small on the screen.
//  - Everything that does not move on a fish is ONE shape: body, tail root and eyes (solid), and the three fins.
//  - Each shape is ONE InstancedMesh for the whole school: three draw calls, however many fish there are.
//  - Each frame a fish needs two places only: its own, and its tail's.
const SCALE = 0.6; // 1 = a fish about 19 px long
const DEPTH = 46; // px, the range of heights the school swims at
const TAIL_SWING = 0.38; // radians
const BODY = "#cf741c";
const FIN = "#e7b365";
const EYE = "#050403";

// Moves a shape to its place on the fish (position, rotation, scale) and paints it one colour.
function part(geometry: THREE.BufferGeometry, colour: string, px: number, py: number, pz: number, rx: number, ry: number, rz: number, sx: number, sy: number, sz: number) {
  const place = new THREE.Object3D();
  place.position.set(px, py, pz);
  place.rotation.set(rx, ry, rz);
  place.scale.set(sx, sy, sz);
  place.updateMatrix();
  const placed = geometry.clone().applyMatrix4(place.matrix);
  const paint = new THREE.Color(colour);
  const colours = new Float32Array(placed.attributes.position.count * 3);
  for (let i = 0; i < colours.length; i += 3) paint.toArray(colours, i);
  placed.setAttribute("color", new THREE.BufferAttribute(colours, 3));
  return placed;
}

// The shapes, for a fish that looks along +x. Made once.
function shapes() {
  const fan = new THREE.Shape();
  fan.moveTo(0.45, 1.12);
  fan.bezierCurveTo(-1.25, 1.82, -3.62, 3.92, -5.8, 4.12);
  fan.bezierCurveTo(-5.28, 2.1, -3.72, 0.64, -2.02, 0);
  fan.bezierCurveTo(-3.72, -0.64, -5.28, -2.1, -5.8, -4.12);
  fan.bezierCurveTo(-3.62, -3.92, -1.25, -1.82, 0.45, -1.12);
  fan.closePath();
  const tail = new THREE.ExtrudeGeometry(fan, { bevelEnabled: false, curveSegments: 4, depth: 0.5, steps: 1 });
  tail.translate(0, 0, -0.25);

  const blade = new THREE.Shape();
  blade.moveTo(-2.1, 0);
  blade.bezierCurveTo(-1.05, 1.4, 0.35, 2.9, 2.35, 2.7);
  blade.bezierCurveTo(1.45, 1.2, 0.45, 0.24, -2.1, 0);
  blade.closePath();
  const fin = new THREE.ExtrudeGeometry(blade, { bevelEnabled: false, curveSegments: 3, depth: 0.25, steps: 1 });
  fin.translate(0, 0, -0.125);

  const ball = new THREE.SphereGeometry(1, 12, 8);
  const eye = new THREE.SphereGeometry(0.43, 6, 4);
  const root = new THREE.CylinderGeometry(0.68, 1.2, 2.5, 8, 1).rotateZ(Math.PI / 2);

  const solid = mergeGeometries([
    part(ball, BODY, 0.15, 0, 0, 0, 0, 0, 5.65, 3.38, 2.72),
    part(root, BODY, -5.35, 0, 0, 0, 0, 0, 1, 1.08, 1.12),
    part(eye, EYE, 3.85, 2.1, 2.45, 0, 0, 0, 2, 2, 2),
    part(eye, EYE, 3.85, 2.1, -2.45, 0, 0, 0, 2, 2, 2),
  ]);
  const fins = mergeGeometries([
    part(fin, FIN, -0.9, 2.75, 0, 0.08, 0, 0, 1, 0.95, 1), // on the back
    part(fin, FIN, 1.25, -0.1, 2.28, 0.8, -0.12, -0.3, 0.88, 0.68, 0.84),
    part(fin, FIN, 1.25, -0.1, -2.28, -0.8, 0.12, -0.3, 0.88, 0.68, 0.84),
  ]);
  return { solid, fins, tail };
}

export function Goldfish({ school, width, height }: { school: Fish[]; width: number; height: number }) {
  const solids = useRef<THREE.InstancedMesh>(null);
  const fins = useRef<THREE.InstancedMesh>(null);
  const tails = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(shapes, []);
  const count = school.length;

  // Scratch objects, reused every frame.
  const scratch = useMemo(() => ({ whole: new THREE.Object3D(), tail: new THREE.Object3D(), out: new THREE.Matrix4() }), []);

  useFrame(({ clock }) => {
    const { whole, tail, out } = scratch;
    whole.scale.setScalar(SCALE);
    tail.position.set(-6.05, 0, 0); // where the tail fin is fixed to the body

    for (let index = 0; index < count; index++) {
      const fish = school[index];
      const lean = THREE.MathUtils.clamp(fish.vy / 110, -0.24, 0.24);
      // Every fish has its own height in the water, and drifts a little round it.
      const level = (Math.sin(index * 9.73) + 1) / 2;
      const swim = 8 + level * DEPTH + Math.sin(clock.elapsedTime * 0.55 + index * 2.173) * DEPTH * 0.16;

      // The fish: the water's (x, y) is the scene's (x, z).
      whole.position.set(fish.x - width / 2, swim, fish.y - height / 2);
      whole.rotation.set(lean * 0.18, -fish.heading, lean);
      whole.updateMatrix();
      solids.current!.setMatrixAt(index, whole.matrix);
      fins.current!.setMatrixAt(index, whole.matrix);

      // The tail: the fish's place × the tail's place on a fish, swinging.
      tail.rotation.set(index % 2 ? -0.58 : 0.58, Math.sin(fish.tail) * TAIL_SWING, 0);
      tail.updateMatrix();
      tails.current!.setMatrixAt(index, out.multiplyMatrices(whole.matrix, tail.matrix));
    }
    for (const mesh of [solids, fins, tails]) mesh.current!.instanceMatrix.needsUpdate = true;
  });

  // frustumCulled={false}: the instances move, the mesh's own bounding box does not know.
  return (
    <>
      <instancedMesh ref={solids} args={[geometry.solid, undefined, count]} frustumCulled={false}>
        <meshStandardMaterial vertexColors roughness={0.27} metalness={0.055} />
      </instancedMesh>
      <instancedMesh ref={fins} args={[geometry.fins, undefined, count]} frustumCulled={false}>
        <meshStandardMaterial vertexColors roughness={0.4} transparent opacity={0.72} side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={tails} args={[geometry.tail, undefined, count]} frustumCulled={false}>
        <meshStandardMaterial color={FIN} roughness={0.4} transparent opacity={0.72} side={THREE.DoubleSide} />
      </instancedMesh>
    </>
  );
}
