"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useSocket } from "@/hooks/shared/useSocket";
import { Goldfish } from "./Goldfish";
import { Pellets } from "./Pellets";
import { createSchool, drop, step, type Pellet } from "./school";
import { Tank, type Ring } from "./Tank";
import styles from "./page.module.css";

// The screen is the tank, seen from straight above. The school swims by its own rules (school.ts);
// mobiles only drop pellets into it. Nobody steers a fish: food pulls them, bitter frightens them,
// and the fright runs through the school from fish to fish.
const COUNT = 220; // fish

type Drop = { x: number; y: number; kind: Pellet["kind"] }; // x, y in 0..1, as the mobile sends them

// Everything inside the canvas. One scene unit is one px of the screen.
function Pond({ drops }: { drops: React.RefObject<Drop[]> }) {
  const { width, height } = useThree((state) => state.size);
  // Made once, for the size the window has now.
  const [school] = useState(() => createSchool(COUNT, width, height));
  const pellets = useRef<Pellet[]>([]);
  const rings = useRef<Ring[]>([]);

  // Priority −1: this runs before the parts that draw, so they draw this frame's positions.
  useFrame(({ clock }, delta) => {
    // What arrived since the last frame: into the water, with a ring where it fell.
    for (const { x, y, kind } of drops.current.splice(0)) {
      drop(pellets.current, x * width, y * height, kind);
      rings.current.push({ x: x * width, y: y * height, born: clock.elapsedTime });
    }
    // Capped, so a tab that was in the background does not jump.
    pellets.current = step(school, pellets.current, width, height, Math.min(0.05, delta));
  }, -1);

  return (
    <>
      {/* Light from the whole sky, and a warm sun that throws the shadows of the fish on the floor */}
      <hemisphereLight args={["#d7e0ff", "#11141d", 1.55]} />
      <directionalLight
        position={[-220, 600, -160]}
        color="#ffd6a0"
        intensity={2.15}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-width / 2}
        shadow-camera-right={width / 2}
        shadow-camera-top={height / 2}
        shadow-camera-bottom={-height / 2}
        shadow-camera-near={1}
        shadow-camera-far={1500}
        shadow-radius={4}
      />
      <Tank width={width} height={height} rings={rings} />
      <Goldfish school={school} width={width} height={height} />
      <Pellets pellets={pellets} width={width} height={height} />
    </>
  );
}

export default function FishFoodScreen() {
  const drops = useRef<Drop[]>([]);
  const [phonePath, setPhonePath] = useState("");

  const onMessage = useCallback((type: string, data: unknown) => {
    if (type === "drop") drops.current.push(data as Drop);
  }, []);

  const { connected, status } = useSocket("fish-food", onMessage);

  useEffect(() => {
    setPhonePath(window.location.pathname.replace(/\/screen$/, "/mobile"));
  }, []);

  return (
    <main className={styles.container}>
      {/* orthographic: no perspective, like a map. The camera hangs above the middle and looks straight down. */}
      <Canvas orthographic shadows dpr={[1, 2]} camera={{ position: [0, 400, 0], up: [0, 0, -1], near: 1, far: 1000 }}>
        <Pond drops={drops} />
      </Canvas>
      <p className={styles.status}>
        {connected ? "connected" : status} · open{" "}
        {/* A new tab with the mobile page: test both sides on one laptop. */}
        <a href={phonePath} target="_blank" className={styles.link}>
          {phonePath}
        </a>
      </p>
    </main>
  );
}
