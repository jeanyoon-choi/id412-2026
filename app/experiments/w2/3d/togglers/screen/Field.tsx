"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { BufferAttribute, LineSegments } from "three";
import { COLS, COUNT, ROWS } from "../grid";

// A sheet of water, simulated. Every switch that is on is a point that keeps pushing the surface
// up and down; the waves spread, meet and interfere. Nothing here is animated by hand:
// each frame the surface moves by the wave equation.
const PER_CELL = 16; // simulation points per switch, along each side
const W = COLS * PER_CELL; // 80 points across
const H = ROWS * PER_CELL; // 128 points deep
const SPEED = 0.22; // how fast waves travel (must stay below 0.5 or the simulation explodes)
const DAMPING = 0.996; // energy kept per step: 1 = waves never die
const STEPS = 2; // simulation steps per frame
const PUSH = 0.035; // how hard a source pushes, per step
const REACH = 3; // a source pushes the points within this many steps of it
const SCALE = 0.1; // world units between two points

export function Field({ switches }: { switches: React.RefObject<boolean[]> }) {
  const lines = useRef<LineSegments>(null);

  const { height, velocity, positions, indices, sources } = useMemo(() => {
    const height = new Float32Array(W * H); // how high the surface is at every point
    const velocity = new Float32Array(W * H); // how fast it is moving up or down
    const positions = new Float32Array(W * H * 3);
    for (let z = 0; z < H; z++) {
      for (let x = 0; x < W; x++) {
        positions.set([(x - W / 2) * SCALE, 0, (z - H / 2) * SCALE], (z * W + x) * 3);
      }
    }
    // Lines only along the rows: the surface is drawn as 128 ridgelines.
    const indices: number[] = [];
    for (let z = 0; z < H; z++) {
      for (let x = 0; x < W - 1; x++) indices.push(z * W + x, z * W + x + 1);
    }
    // Where each switch pushes: the middle of its cell. Each one has its own rhythm.
    const sources = Array.from({ length: COUNT }, (_, index) => ({
      at: (Math.floor(index / COLS) * PER_CELL + PER_CELL / 2) * W + (index % COLS) * PER_CELL + PER_CELL / 2,
      frequency: 2.2 + ((index * 7) % 11) * 0.22, // radians per second
    }));
    return { height, velocity, positions, indices, sources };
  }, []);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;

    for (let step = 0; step < STEPS; step++) {
      // 1. The switches that are on push the surface.
      sources.forEach((source, index) => {
        if (!switches.current[index]) return;
        const push = Math.sin(time * source.frequency) * PUSH;
        for (let dz = -REACH; dz <= REACH; dz++) {
          for (let dx = -REACH; dx <= REACH; dx++) {
            const near = 1 - Math.hypot(dx, dz) / (REACH + 1); // strongest in the middle, fading outward
            if (near > 0) velocity[source.at + dz * W + dx] += push * near;
          }
        }
      });

      // 2. The wave equation: a point is pulled toward the average of its four neighbours.
      for (let z = 1; z < H - 1; z++) {
        for (let x = 1; x < W - 1; x++) {
          const i = z * W + x;
          const neighbours = height[i - 1] + height[i + 1] + height[i - W] + height[i + W];
          velocity[i] = (velocity[i] + (neighbours - height[i] * 4) * SPEED) * DAMPING;
        }
      }
      for (let i = 0; i < height.length; i++) height[i] += velocity[i];
    }

    // 3. Copy the heights into the geometry.
    const attribute = lines.current!.geometry.attributes.position as BufferAttribute;
    for (let i = 0; i < height.length; i++) attribute.setY(i, height[i]);
    attribute.needsUpdate = true;
  });

  return (
    <lineSegments ref={lines} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="index" args={[new Uint32Array(indices), 1]} />
      </bufferGeometry>
      <lineBasicMaterial color="white" transparent opacity={0.85} />
    </lineSegments>
  );
}
