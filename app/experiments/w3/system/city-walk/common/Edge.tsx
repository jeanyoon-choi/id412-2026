"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cloud } from "./geometry";
import { BUILDINGS, FADE, SOLID } from "./shibuya";

// The edge of the city. The data stops somewhere; instead of a cut, the outer buildings are drawn
// as points that drift apart, more and more the further out they are.
const VERTEX = `
uniform float u_time;
uniform float u_from;
uniform float u_to;
varying float v_fade;

void main() {
  // 0 where the built city ends, 1 where nothing is left.
  v_fade = clamp((length(position.xz) - u_from) / (u_to - u_from), 0.0, 1.0);

  // Each point sways around its place. Its own position is its seed, so no two move alike.
  vec3 seed = position * 0.37;
  vec3 drift = vec3(sin(u_time * 0.5 + seed.y + seed.z), sin(u_time * 0.4 + seed.x), cos(u_time * 0.45 + seed.x + seed.y));
  vec3 moved = position + drift * v_fade * 4.0;

  vec4 seen = modelViewMatrix * vec4(moved, 1.0);
  gl_Position = projectionMatrix * seen;
  gl_PointSize = clamp(260.0 / -seen.z, 1.5, 6.0); // nearer points are larger
}
`;

const FRAGMENT = `
varying float v_fade;

void main() {
  if (length(gl_PointCoord - 0.5) > 0.5) discard; // a round point, not a square
  gl_FragColor = vec4(vec3(0.95, 0.9, 0.84), (1.0 - v_fade) * 0.8);
}
`;

export function Edge() {
  const material = useRef<THREE.ShaderMaterial>(null);
  // Only the buildings beyond the built city become points.
  const geometry = useMemo(() => cloud(BUILDINGS.filter((building) => building.distance >= SOLID), SOLID, FADE), []);
  const uniforms = useMemo(() => ({ u_time: { value: 0 }, u_from: { value: SOLID }, u_to: { value: FADE } }), []);

  useFrame(({ clock }) => {
    if (material.current) material.current.uniforms.u_time.value = clock.elapsedTime;
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial ref={material} vertexShader={VERTEX} fragmentShader={FRAGMENT} uniforms={uniforms} transparent depthWrite={false} />
    </points>
  );
}
