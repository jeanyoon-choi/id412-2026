"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// The water, seen from straight above, in three layers:
// the stone floor (it catches the shadows of the fish), the light that dances on it, and the surface with its rings.
const SURFACE = 70; // px above the floor
const MAX_RINGS = 8; // the same number as in the shader below

// Where something fell into the water, and when (seconds on the scene's clock).
export type Ring = { x: number; y: number; born: number };

// The floor: dark gravel, drawn once on a canvas.
function floorTexture() {
  const element = document.createElement("canvas");
  element.width = element.height = 512;
  const context = element.getContext("2d")!;
  context.fillStyle = "#39484a";
  context.fillRect(0, 0, 512, 512);
  // Fine gravel: thousands of small stones, each a little lighter or darker than the ground.
  for (let i = 0; i < 14000; i++) {
    const shade = 30 + Math.random() * 70;
    context.fillStyle = `rgba(${shade}, ${shade + 10}, ${shade + 12}, ${0.3 + Math.random() * 0.5})`;
    context.beginPath();
    context.ellipse(Math.random() * 512, Math.random() * 512, 0.8 + Math.random() * 2.4, 0.6 + Math.random() * 1.8, Math.random() * 3, 0, Math.PI * 2);
    context.fill();
  }
  const texture = new THREE.CanvasTexture(element);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

const VERTEX = `
varying vec2 v_place;

void main() {
  v_place = position.xy; // px from the middle of the tank
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Caustics: the net of light that moving water throws on the floor.
// The loop is "Water turbulence" by David Hoskins (Shadertoy MdlXz8), after joltz0r.
const CAUSTICS = `
uniform float u_time;
varying vec2 v_place;

void main() {
  float time = u_time * 0.35;
  vec2 p = mod(v_place / 300.0 * 6.28318, 6.28318) - 250.0;
  vec2 i = p;
  float c = 1.0;
  for (int n = 0; n < 5; n++) {
    float t = time * (1.0 - 3.5 / float(n + 1));
    i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + t) / 0.005), p.y / (cos(i.y + t) / 0.005)));
  }
  c = 1.17 - pow(c / 5.0, 1.4);
  float light = pow(abs(c), 8.0);
  gl_FragColor = vec4(vec3(0.75, 0.95, 1.0) * light * 0.3, 1.0); // added to the floor, not painted over it
}
`;

// The surface: rings that spread from every drop, and darkness toward the edges, as if the tank were deep.
const SURFACE_SHADER = `
uniform float u_time;
uniform vec2 u_size;
uniform vec3 u_rings[${MAX_RINGS}]; // x, y, the time it fell
varying vec2 v_place;

void main() {
  float rings = 0.0;
  for (int k = 0; k < ${MAX_RINGS}; k++) {
    float age = u_time - u_rings[k].z;
    if (age < 0.0 || age > 4.0) continue;
    float reach = length(v_place - u_rings[k].xy);
    float front = age * 90.0; // px: how far the ring has spread
    // Three waves just behind the front, weaker as the ring grows older.
    float wave = sin((reach - front) * 0.22) * smoothstep(front, front - 12.0, reach) * smoothstep(front - 85.0, front - 45.0, reach);
    rings += wave * (1.0 - age / 4.0);
  }
  float edge = smoothstep(0.55, 1.05, length(v_place / (u_size * 0.5)));
  // White where a wave crest catches the light, black toward the edges.
  float crest = max(rings, 0.0) * 0.35;
  gl_FragColor = vec4(vec3(step(edge * 0.75, crest)), max(crest, edge * 0.75));
}
`;

export function Tank({ width, height, rings }: { width: number; height: number; rings: React.RefObject<Ring[]> }) {
  const caustics = useRef<THREE.ShaderMaterial>(null);
  const surface = useRef<THREE.ShaderMaterial>(null);
  const floor = useMemo(floorTexture, []);
  floor.repeat.set(width / 512, height / 512);

  const causticUniforms = useMemo(() => ({ u_time: { value: 0 } }), []);
  const surfaceUniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_size: { value: new THREE.Vector2() },
      u_rings: { value: Array.from({ length: MAX_RINGS }, () => new THREE.Vector3(0, 0, -100)) },
    }),
    [],
  );

  useFrame(({ clock }) => {
    causticUniforms.u_time.value = surfaceUniforms.u_time.value = clock.elapsedTime;
    surfaceUniforms.u_size.value.set(width, height);
    // The newest rings, in the scene's px: (0, 0) is the middle, y grows upward on the plane.
    rings.current.slice(-MAX_RINGS).forEach((ring, k) => {
      surfaceUniforms.u_rings.value[k].set(ring.x - width / 2, height / 2 - ring.y, ring.born);
    });
  });

  // The three planes lie flat: a plane is made standing up, so each is turned a quarter round x.
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={floor} roughness={0.9} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={1}>
        <planeGeometry args={[width, height]} />
        <shaderMaterial ref={caustics} vertexShader={VERTEX} fragmentShader={CAUSTICS} uniforms={causticUniforms} blending={THREE.AdditiveBlending} transparent depthWrite={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={SURFACE}>
        <planeGeometry args={[width, height]} />
        <shaderMaterial ref={surface} vertexShader={VERTEX} fragmentShader={SURFACE_SHADER} uniforms={surfaceUniforms} transparent depthWrite={false} />
      </mesh>
    </>
  );
}
