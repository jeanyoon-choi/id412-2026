"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { useSocket } from "@/hooks/shared/useSocket";
import styles from "./page.module.css";

// The laptop shows one 3D shape. Dragging on the phone turns it; "next shape" swaps the geometry.
const TURN = 4; // radians per screen-width of dragging
const EASE = 0.12; // 0..1, how fast the shape catches up with the phone
const SHAPES = 4;

type Rotation = { x: number; y: number };

function Shape({ target, shape }: { target: React.RefObject<Rotation>; shape: number }) {
  const mesh = useRef<Mesh>(null);

  // Every frame: move the real rotation a little toward the rotation the phone asked for.
  useFrame(() => {
    const rotation = mesh.current!.rotation;
    rotation.x += (target.current.x - rotation.x) * EASE;
    rotation.y += (target.current.y - rotation.y) * EASE;
  });

  return (
    <mesh ref={mesh}>
      {shape === 0 && <torusKnotGeometry args={[1, 0.35, 160, 24]} />}
      {shape === 1 && <boxGeometry args={[1.8, 1.8, 1.8]} />}
      {shape === 2 && <icosahedronGeometry args={[1.5, 0]} />}
      {shape === 3 && <coneGeometry args={[1.2, 2.2, 6]} />}
      {/* Colour = which way each face points: no lights needed, and the turning is easy to read. */}
      <meshNormalMaterial flatShading />
    </mesh>
  );
}

export default function RotateScreen() {
  const target = useRef<Rotation>({ x: 0.4, y: 0.6 }); // rotation asked for by the phone, radians
  const [shape, setShape] = useState(0);
  const [phonePath, setPhonePath] = useState("");

  const onMessage = useCallback((type: string, data: unknown) => {
    if (type === "rotate") {
      const moved = data as Rotation;
      target.current.y += moved.x * TURN; // drag left/right → turn around the vertical axis
      target.current.x += moved.y * TURN; // drag up/down → tip forward/back
    }
    if (type === "next") setShape((current) => (current + 1) % SHAPES);
  }, []);

  const { connected, status } = useSocket("3d-rotate", onMessage);

  useEffect(() => {
    setPhonePath(window.location.pathname.replace(/\/screen$/, "/mobile"));
  }, []);

  return (
    <main className={styles.container}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <Shape target={target} shape={shape} />
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
