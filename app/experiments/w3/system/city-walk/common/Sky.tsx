"use client";

import * as THREE from "three";

// Early evening: the sun is low in the west, the sky still has colour, the windows are already lit.
// `near` and `far` are where the haze starts and where it hides everything. The phone stands in the
// street and needs it close; the screen looks from far above and needs it far.
const SUN: [number, number, number] = [-300, 120, 160]; // where the sun is, seen from the crossing
const HAZE = "#c8a593"; // the colour of the horizon; far things fade into it

// The sky is the inside of a huge ball. Its colour depends only on the direction you look:
// warm at the horizon, deep blue overhead, brighter toward the sun.
const VERTEX = `
varying vec3 v_direction;

void main() {
  v_direction = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT = `
uniform vec3 u_sun;
varying vec3 v_direction;

void main() {
  vec3 direction = normalize(v_direction);
  float height = max(direction.y, 0.0); // 0 at the horizon, 1 straight up
  vec3 horizon = vec3(0.85, 0.62, 0.50);
  vec3 zenith = vec3(0.16, 0.22, 0.42);
  vec3 colour = mix(horizon, zenith, pow(height, 0.45));

  // The glow around the sun.
  float toward = max(dot(direction, normalize(u_sun)), 0.0);
  colour += vec3(1.0, 0.55, 0.25) * pow(toward, 6.0) * 0.5;

  gl_FragColor = vec4(colour, 1.0);
}
`;

const uniforms = { u_sun: { value: new THREE.Vector3(...SUN) } };

export function Sky({ near, far }: { near: number; far: number }) {
  return (
    <>
      <mesh>
        <sphereGeometry args={[9000, 32, 16]} />
        {/* BackSide: we look at the ball from inside. No fog and no tone mapping: the colours are used as written. */}
        <shaderMaterial vertexShader={VERTEX} fragmentShader={FRAGMENT} uniforms={uniforms} side={THREE.BackSide} fog={false} toneMapped={false} depthWrite={false} />
      </mesh>
      <fog attach="fog" args={[HAZE, near, far]} />

      {/* Light from the whole sky (cool, from above) and from the street (warm, from below) */}
      <hemisphereLight args={["#b9c6ea", "#5a4a40", 2.2]} />
      {/* The sun. Its shadow camera is a box that has to hold the whole city. */}
      <directionalLight
        position={SUN}
        color="#ffb27a"
        intensity={3.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-300}
        shadow-camera-right={300}
        shadow-camera-top={300}
        shadow-camera-bottom={-300}
        shadow-camera-near={1}
        shadow-camera-far={900}
        shadow-bias={-0.0006}
      />
    </>
  );
}
