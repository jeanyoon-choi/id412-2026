"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Fish } from "./school";

// Every goldfish is five parts: body, tail fin, two side fins, a back fin, two eyes.
// Each part is ONE InstancedMesh for the whole school, so 220 fish cost five draw calls.
// Each frame, every part of every fish gets its place: where the fish is × where the part sits on a fish.
const LENGTH = 30; // px, nose to tail root of a fish of size 1
const LOW = 16; // px above the floor, the deepest a fish swims
const HIGH = 46; // px above the floor, the shallowest

// Body and fin colours. Most fish are orange; a few are red, a few pale.
const COATS = [
  { body: "#cf741c", fin: "#e9a14e" },
  { body: "#d9631a", fin: "#ee9a4c" },
  { body: "#cf741c", fin: "#e9a14e" },
  { body: "#e07a1f", fin: "#f0b060" },
  { body: "#d9631a", fin: "#ee9a4c" },
  { body: "#c9481f", fin: "#e88a4a" },
  { body: "#cf741c", fin: "#e9a14e" },
  { body: "#efe2cf", fin: "#f6e6cf" },
];

// The shapes, for a fish one unit long that looks along +x. Made once.
function shapes() {
  // Body: a ball, flattened, then thinned toward the tail (and a little toward the nose).
  const body = new THREE.SphereGeometry(0.5, 24, 14).scale(1, 0.44, 0.38);
  const points = body.attributes.position;
  for (let i = 0; i < points.count; i++) {
    const x = points.getX(i);
    const thin = x < 0 ? 1 - 0.62 * Math.pow(-x / 0.5, 1.4) : 1 - 0.28 * Math.pow(x / 0.5, 2);
    points.setY(i, points.getY(i) * thin);
    points.setZ(i, points.getZ(i) * thin);
  }
  body.computeVertexNormals();

  // Tail fin: a fan with a notch, drawn flat and then laid down. It starts at (0, 0) so it can swing there.
  const fan = new THREE.Shape();
  fan.moveTo(0, 0);
  fan.bezierCurveTo(-0.15, 0.1, -0.42, 0.4, -0.66, 0.38);
  fan.quadraticCurveTo(-0.52, 0.13, -0.44, 0);
  fan.quadraticCurveTo(-0.52, -0.13, -0.66, -0.38);
  fan.bezierCurveTo(-0.42, -0.4, -0.15, -0.1, 0, 0);
  const tail = new THREE.ShapeGeometry(fan, 8).rotateX(-Math.PI / 2);

  // Side fin: a small oval that starts at (0, 0).
  const fin = new THREE.CircleGeometry(0.1, 14).scale(1.5, 0.75, 1).translate(0.15, 0, 0).rotateX(-Math.PI / 2);
  const back = new THREE.BoxGeometry(0.42, 0.06, 0.03).translate(-0.02, 0.2, 0);
  const eye = new THREE.SphereGeometry(0.034, 10, 8);
  return { body, tail, fin, back, eye };
}

export function Goldfish({ school, width, height }: { school: Fish[]; width: number; height: number }) {
  const body = useRef<THREE.InstancedMesh>(null);
  const tail = useRef<THREE.InstancedMesh>(null);
  const fins = useRef<THREE.InstancedMesh>(null);
  const backs = useRef<THREE.InstancedMesh>(null);
  const eyes = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(shapes, []);
  const count = school.length;

  // Colours never change: set once.
  useLayoutEffect(() => {
    const colour = new THREE.Color();
    school.forEach((fish, index) => {
      const coat = COATS[Math.floor(fish.coat * COATS.length)];
      body.current!.setColorAt(index, colour.set(coat.body));
      backs.current!.setColorAt(index, colour.set(coat.body).multiplyScalar(0.7));
      tail.current!.setColorAt(index, colour.set(coat.fin));
      fins.current!.setColorAt(index * 2, colour);
      fins.current!.setColorAt(index * 2 + 1, colour);
    });
    for (const mesh of [body, tail, fins, backs]) mesh.current!.instanceColor!.needsUpdate = true;
  }, [school]);

  // Scratch objects, reused every frame.
  const scratch = useMemo(() => ({ whole: new THREE.Matrix4(), part: new THREE.Matrix4(), out: new THREE.Matrix4(), place: new THREE.Vector3(), turn: new THREE.Quaternion(), size: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0) }), []);

  useFrame(() => {
    const { whole, part, out, place, turn, size, up } = scratch;
    // Where a part sits on the fish: turned by `angle` round the up axis, then moved to (x, y, z).
    const at = (mesh: THREE.InstancedMesh, index: number, angle: number, x: number, y: number, z: number) => {
      part.makeRotationY(angle).setPosition(x, y, z);
      mesh.setMatrixAt(index, out.multiplyMatrices(whole, part));
    };

    school.forEach((fish, index) => {
      const beat = Math.sin(fish.tail);
      // The fish: the tank's (x, y) is the scene's (x, z); depth lifts it off the floor.
      // The head swings a little against the tail, as a swimming body does.
      place.set(fish.x - width / 2, LOW + fish.depth * (HIGH - LOW), fish.y - height / 2);
      turn.setFromAxisAngle(up, -fish.heading + beat * 0.09);
      whole.compose(place, turn, size.setScalar(LENGTH * fish.size));

      at(body.current!, index, 0, 0, 0, 0);
      at(backs.current!, index, 0, 0, 0, 0);
      at(tail.current!, index, -Math.sin(fish.tail - 1) * 0.6, -0.42, 0, 0); // swings behind the body, a little late
      const flutter = Math.sin(fish.tail * 2) * 0.25;
      at(fins.current!, index * 2, -2 - flutter, 0.14, -0.06, 0.13);
      at(fins.current!, index * 2 + 1, 2 + flutter, 0.14, -0.06, -0.13);
      at(eyes.current!, index * 2, 0, 0.36, 0.06, 0.1);
      at(eyes.current!, index * 2 + 1, 0, 0.36, 0.06, -0.1);
    });
    for (const mesh of [body, tail, fins, backs, eyes]) mesh.current!.instanceMatrix.needsUpdate = true;
  });

  // frustumCulled={false}: the instances move, the mesh's own bounding box does not know.
  return (
    <>
      <instancedMesh ref={body} args={[geometry.body, undefined, count]} castShadow frustumCulled={false}>
        {/* Smooth and a little wet */}
        <meshStandardMaterial roughness={0.27} metalness={0.06} />
      </instancedMesh>
      <instancedMesh ref={backs} args={[geometry.back, undefined, count]} frustumCulled={false}>
        <meshStandardMaterial roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={tail} args={[geometry.tail, undefined, count]} castShadow frustumCulled={false}>
        {/* Fins let light through */}
        <meshStandardMaterial roughness={0.4} transparent opacity={0.7} side={THREE.DoubleSide} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={fins} args={[geometry.fin, undefined, count * 2]} frustumCulled={false}>
        <meshStandardMaterial roughness={0.4} transparent opacity={0.7} side={THREE.DoubleSide} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={eyes} args={[geometry.eye, undefined, count * 2]} frustumCulled={false}>
        <meshStandardMaterial color="#050403" roughness={0.1} />
      </instancedMesh>
    </>
  );
}
