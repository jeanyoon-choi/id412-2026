"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdditiveBlending, type Points, type ShaderMaterial } from "three";
import { useSocket } from "@/hooks/shared/useSocket";
import { fragmentShader, vertexShader } from "./shader";
import styles from "./page.module.css";

// A slowly turning sphere made of 40,000 particles. Two fingers on the phone pull it apart:
// the farther apart the fingers, the more it scatters.
const COUNT = 40000;
const RADIUS = 1.5;
const FAR = 9; // how far away a particle can fly
const EASE = 0.08; // 0..1, how fast the sphere follows the fingers
const SPIN = 0.15; // radians per second, the sphere always turns

// Two positions per particle: one on the sphere, one somewhere far away.
function makeParticles() {
  const sphere = new Float32Array(COUNT * 3);
  const scatter = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    // Evenly spread points on a sphere (a Fibonacci spiral).
    const y = 1 - (i / (COUNT - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    const angle = i * Math.PI * (3 - Math.sqrt(5));
    sphere.set([Math.cos(angle) * ring * RADIUS, y * RADIUS, Math.sin(angle) * ring * RADIUS], i * 3);
    scatter.set([(Math.random() - 0.5) * FAR * 2, (Math.random() - 0.5) * FAR, (Math.random() - 0.5) * FAR * 2], i * 3);
  }
  return { sphere, scatter };
}

function Particles({ target }: { target: React.RefObject<number> }) {
  const points = useRef<Points>(null);
  const material = useRef<ShaderMaterial>(null);
  const { sphere, scatter } = useMemo(makeParticles, []);
  const uniforms = useMemo(() => ({ uScatter: { value: 0 }, uSize: { value: 30 } }), []);

  // Every frame: turn a little, and move the shader's value a little toward what the phone asked for.
  useFrame((_, delta) => {
    points.current!.rotation.y += SPIN * delta;
    const uScatter = material.current!.uniforms.uScatter;
    uScatter.value += (target.current - uScatter.value) * EASE;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[sphere, 3]} />
        <bufferAttribute attach="attributes-aScatter" args={[scatter, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

export default function ParticlesScreen() {
  const target = useRef(0); // scatter asked for by the phone, 0..1
  const [phonePath, setPhonePath] = useState("");

  const onMessage = useCallback((type: string, data: unknown) => {
    if (type === "scatter") target.current = data as number;
  }, []);

  const { connected, status } = useSocket("3d-particles", onMessage);

  useEffect(() => {
    setPhonePath(window.location.pathname.replace(/\/screen$/, "/mobile"));
  }, []);

  return (
    <main className={styles.container}>
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <Particles target={target} />
      </Canvas>
      <p className={styles.status}>
        {connected ? "connected" : status} · open{" "}
        <a href={phonePath} target="_blank" className={styles.link}>
          {phonePath}
        </a>
      </p>
    </main>
  );
}
