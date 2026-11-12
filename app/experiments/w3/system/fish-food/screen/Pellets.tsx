"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BITTER, scent, spread, strength, type Pellet } from "./school";

// What the mobiles dropped, as things in the water, lit by the same lights as the fish.
// Food: a flake of fish food. Thin, curled, uneven, turning slowly on the surface. It gets smaller as the fish nibble it.
//   In the water it soaks and crumbles: fine crumbs drift away from it on the surface, as far as scent() in school.ts says.
//   The crumbs you see are the water where a fish can smell the food. As the flake is eaten, they thin out.
// Bitter: a tablet with a score line, lying on the floor. It gets smaller as it dissolves and is gone after BITTER seconds.
//   What it gives off spreads over the floor like ink in water, as far as spread() in school.ts says:
//   the dark water you see is exactly the water the fish flee.
const MAX = 400; // of one kind drawn at once
const SURFACE = 62; // px above the floor: above every fish
const FLAKES = ["#b3261e", "#e07b1a", "#e8c23a", "#4f7a2a", "#6b3f1d"]; // the colours of flake food

// A flake about one unit wide: a thin sheet with an uneven edge, bent a little like a dried leaf. Made once.
// It is built ring by ring from the middle outward, so the light falls smoothly over the bend.
const RINGS = 4;
const SPOKES = 28;

function flakeShape() {
  const points: number[] = [];
  const corners: number[] = [];
  for (let ring = 0; ring <= RINGS; ring++) {
    for (let spoke = 0; spoke < SPOKES; spoke++) {
      const angle = (spoke / SPOKES) * Math.PI * 2;
      // How far the edge is from the middle in this direction: never the same twice round.
      const edge = 0.78 + 0.13 * Math.sin(2 * angle + 1) + 0.08 * Math.sin(5 * angle) + 0.05 * Math.sin(9 * angle + 2);
      const x = Math.cos(angle) * edge * (ring / RINGS);
      const z = Math.sin(angle) * edge * (ring / RINGS);
      points.push(x, 0.2 * x * x - 0.08 * z * z, z); // the bend
      if (ring === RINGS) continue;
      // Two triangles between this ring and the next.
      const here = ring * SPOKES + spoke;
      const beside = ring * SPOKES + ((spoke + 1) % SPOKES);
      corners.push(here, here + SPOKES, beside, beside, here + SPOKES, beside + SPOKES);
    }
  }
  const flake = new THREE.BufferGeometry();
  flake.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  flake.setIndex(corners);
  flake.computeVertexNormals();
  return flake;
}

// A tablet seen from the side, from the middle of the top to the middle of the bottom; turned round, it is the tablet.
function tabletShape() {
  const side = [
    [0, 2.6],
    [6, 2.3],
    [10, 1.5],
    [11, 0.8],
    [11, -0.8],
    [10, -1.5],
    [6, -2.3],
    [0, -2.6],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(side, 40);
}

// The ink: one flat square per tablet, as wide as the bitterness has spread. The shader paints a cloud in it.
const INK_VERTEX = `
attribute vec2 ink; // how strong (0..1), and a number of its own so no two clouds look alike
varying vec2 v_place;
varying vec2 v_ink;

void main() {
  v_place = uv * 2.0 - 1.0; // −1..1 across the square
  v_ink = ink;
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
`;

const INK_FRAGMENT = `
uniform float u_time;
varying vec2 v_place;
varying vec2 v_ink;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
// Noise at three sizes, added up: large billows with small curls on them.
float billows(vec2 p) { return noise(p) * 0.55 + noise(p * 2.1) * 0.3 + noise(p * 4.3) * 0.15; }

void main() {
  vec2 drift = vec2(v_ink.y * 37.0, u_time * 0.06);
  // The edge of the cloud is pushed in and out by the billows, so it is never a circle.
  float reach = length(v_place) + (billows(v_place * 2.2 + drift) - 0.5) * 0.7;
  float thick = smoothstep(0.95, 0.0, reach); // dense in the middle, nothing at the rim
  thick *= 0.55 + 0.45 * billows(v_place * 4.0 - drift); // strands inside the cloud
  gl_FragColor = vec4(0.0, 0.0, 0.0, thick * v_ink.x * 0.85);
}
`;

// The crumbs: one flat square per flake, as wide as its smell has spread. The shader scatters grains in it.
const CRUMB_VERTEX = `
attribute vec3 crumb; // how much of the flake is left (0..1), a number of its own, how wide the square is (px)
varying vec2 v_place;
varying vec3 v_crumb;

void main() {
  v_place = uv * 2.0 - 1.0; // −1..1 across the square
  v_crumb = crumb;
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
`;

const CRUMB_FRAGMENT = `
uniform float u_time;
varying vec2 v_place;
varying vec3 v_crumb;

const float CELLS = 12.0; // the square is cut into 24 × 24 cells; a cell holds one crumb, or none

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
  vec2 grid = v_place * CELLS + v_crumb.y * 53.0;
  vec2 cell = floor(grid);
  vec2 inside = fract(grid);
  float a = hash(cell);
  float b = hash(cell + 7.3);
  float c = hash(cell + 13.1);

  // Where the crumb lies in its cell: its own spot, rocking a little on the water.
  vec2 spot = 0.5 + 0.28 * vec2(sin(a * 6.28 + u_time * 0.5), cos(b * 6.28 + u_time * 0.4));
  // Its size: 0.7 to 2.2 px, whatever the size of the square.
  float size = (0.7 + c * 1.5) * CELLS / v_crumb.z;
  float grain = smoothstep(size, size * 0.55, length(inside - spot));

  // Many crumbs near the flake, few far from it, and fewer everywhere as the flake is eaten.
  float there = step(a, (1.0 - length(v_place)) * v_crumb.x);

  // The colours of flake food.
  vec3 colour = b < 0.3 ? vec3(0.62, 0.2, 0.12) : b < 0.6 ? vec3(0.8, 0.45, 0.13) : b < 0.8 ? vec3(0.82, 0.68, 0.25) : vec3(0.36, 0.24, 0.12);
  gl_FragColor = vec4(colour, grain * there);
}
`;

export function Pellets({ pellets, width, height }: { pellets: React.RefObject<Pellet[]>; width: number; height: number }) {
  const flakes = useRef<THREE.InstancedMesh>(null);
  const tablets = useRef<THREE.InstancedMesh>(null);
  const scores = useRef<THREE.InstancedMesh>(null);
  const inks = useRef<THREE.InstancedMesh>(null);
  const cloud = useRef<THREE.ShaderMaterial>(null);
  // The square the ink is painted in, lying flat, with room for one `ink` value per tablet.
  const square = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2);
    geometry.setAttribute("ink", new THREE.InstancedBufferAttribute(new Float32Array(MAX * 2), 2));
    return geometry;
  }, []);
  const uniforms = useMemo(() => ({ u_time: { value: 0 } }), []);
  // The same for the crumbs of the flakes.
  const crumbs = useRef<THREE.InstancedMesh>(null);
  const scatter = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2);
    geometry.setAttribute("crumb", new THREE.InstancedBufferAttribute(new Float32Array(MAX * 3), 3));
    return geometry;
  }, []);
  const flake = useMemo(flakeShape, []);
  const tablet = useMemo(tabletShape, []);
  const place = useMemo(() => new THREE.Object3D(), []);
  const colour = useMemo(() => new THREE.Color(), []);

  // Every slot needs a colour once, so the colour buffer exists before the first frame.
  useLayoutEffect(() => {
    for (let i = 0; i < MAX; i++) flakes.current!.setColorAt(i, colour.set(FLAKES[0]));
  }, [colour]);

  useFrame(({ clock }) => {
    uniforms.u_time.value = clock.elapsedTime;
    const ink = square.attributes.ink as THREE.InstancedBufferAttribute;
    const crumb = scatter.attributes.crumb as THREE.InstancedBufferAttribute;
    let foods = 0;
    let bitters = 0;
    for (const pellet of pellets.current) {
      const x = pellet.x - width / 2;
      const z = pellet.y - height / 2;
      // `look` (0..1) was drawn when the pellet fell: its own turn, size and colour.
      if (pellet.kind === "food" && foods < MAX) {
        const size = (4.5 + pellet.look * 2.5) * (0.4 + 0.6 * pellet.left); // smaller as it is eaten
        place.position.set(x, SURFACE, z);
        place.rotation.set(0, pellet.look * 6.28 + pellet.age * (pellet.look - 0.5) * 0.8, 0); // turning slowly
        place.scale.set(size, size, size * (0.65 + pellet.look * 0.35));
        place.updateMatrix();
        flakes.current!.setMatrixAt(foods, place.matrix);
        flakes.current!.setColorAt(foods, colour.set(FLAKES[Math.floor(pellet.look * 997) % FLAKES.length]));
        // Its crumbs, on the surface round it, as wide as the rule says the smell has spread.
        const reach = scent(pellet);
        place.position.set(x, SURFACE - 1, z);
        place.rotation.set(0, pellet.look * 6.28, 0);
        place.scale.setScalar(reach);
        place.updateMatrix();
        crumbs.current!.setMatrixAt(foods, place.matrix);
        crumb.setXYZ(foods++, pellet.left, pellet.look, reach);
      } else if (pellet.kind === "bitter" && bitters < MAX) {
        // The tablet, on the floor.
        place.position.set(x, 2, z);
        place.rotation.set(0, pellet.look * 6.28, 0);
        place.scale.setScalar(0.5 * (0.25 + 0.75 * (pellet.left / BITTER))); // smaller as it dissolves
        place.updateMatrix();
        tablets.current!.setMatrixAt(bitters, place.matrix);
        scores.current!.setMatrixAt(bitters, place.matrix);
        // Its ink, just above the floor, as wide as the rule says the bitterness has spread.
        place.position.set(x, 0.5 + bitters * 0.01, z);
        place.scale.setScalar(spread(pellet));
        place.updateMatrix();
        inks.current!.setMatrixAt(bitters, place.matrix);
        ink.setXY(bitters++, strength(pellet), pellet.look);
      }
    }
    // Only the first `count` instances are drawn.
    flakes.current!.count = crumbs.current!.count = foods;
    tablets.current!.count = scores.current!.count = inks.current!.count = bitters;
    for (const mesh of [flakes, crumbs, tablets, scores, inks]) mesh.current!.instanceMatrix.needsUpdate = true;
    ink.needsUpdate = true;
    crumb.needsUpdate = true;
    flakes.current!.instanceColor!.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={inks} args={[square, undefined, MAX]} frustumCulled={false}>
        <shaderMaterial ref={cloud} vertexShader={INK_VERTEX} fragmentShader={INK_FRAGMENT} uniforms={uniforms} transparent depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={crumbs} args={[scatter, undefined, MAX]} frustumCulled={false}>
        <shaderMaterial vertexShader={CRUMB_VERTEX} fragmentShader={CRUMB_FRAGMENT} uniforms={uniforms} transparent depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={flakes} args={[flake, undefined, MAX]} frustumCulled={false}>
        <meshStandardMaterial roughness={0.85} side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={tablets} args={[tablet, undefined, MAX]} frustumCulled={false}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.55} />
      </instancedMesh>
      {/* The score line: a groove across the top of the tablet */}
      <instancedMesh ref={scores} args={[undefined, undefined, MAX]} frustumCulled={false}>
        <boxGeometry args={[18, 5.5, 1.3]} />
        <meshStandardMaterial color="#000000" roughness={1} />
      </instancedMesh>
    </>
  );
}
