"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useSocket } from "@/hooks/shared/useSocket";
import { Goldfish } from "./Goldfish";
import { Pellets } from "./Pellets";
import { createSchool, drop, step, type Pellet } from "./school";
import * as THREE from "three";
import styles from "./page.module.css";

// The screen is the water, seen from above and a little from the side, so the depth of the school shows. The school swims by its own rules (school.ts);
// mobiles only drop pellets into it. Nobody steers a fish: food pulls them, bitter frightens them,
// and the fright runs through the school from fish to fish.
const WATER = 420; // px² of water per fish: a bigger screen holds a bigger school
const MOST = 5000; // fish at most
const VIEW = new THREE.Vector3(0, 0.8, 0.6); // from where the camera looks at the water: above, and a little in front

type Drop = { x: number; y: number; kind: Pellet["kind"] }; // x, y in 0..1, as the mobile sends them

// Everything inside the canvas. The water is as many scene units wide and deep as the window has px.
function Pond({ drops }: { drops: React.RefObject<Drop[]> }) {
  const { width, height } = useThree((state) => state.size);
  const camera = useThree((state) => state.camera as THREE.PerspectiveCamera);

  // The camera stands back just far enough to see all of the water.
  useLayoutEffect(() => {
    const up = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const across = up * (width / height);
    const behind = (height / 2) * VIEW.z; // the near edge of the water is this much closer than its middle
    const distance = Math.max(width / 2 / across, ((height / 2) * VIEW.y) / up) + behind;
    camera.position.copy(VIEW).multiplyScalar(distance * 1.04);
    camera.near = distance * 0.3;
    camera.far = distance * 3;
    camera.lookAt(0, 12, 0);
    camera.updateProjectionMatrix();
  }, [camera, width, height]);
  // Made once, for the size the window has now.
  const [school] = useState(() => createSchool(Math.min(MOST, Math.round((width * height) / WATER)), width, height));
  const pellets = useRef<Pellet[]>([]);

  // Priority −1: this runs before the parts that draw, so they draw this frame's positions.
  useFrame((_, delta) => {
    // What arrived since the last frame: into the water.
    for (const { x, y, kind } of drops.current.splice(0)) drop(pellets.current, x * width, y * height, kind);
    // Capped, so a tab that was in the background does not jump.
    pellets.current = step(school, pellets.current, width, height, Math.min(0.05, delta));
  }, -1);

  return (
    <>
      <color attach="background" args={["#ffffff"]} />
      {/* The lights of the goldfish in experiments-jyc: the sky, a warm key light, a cool light from behind */}
      <hemisphereLight args={["#fff7e6", "#4a5261", 1.85]} />
      <directionalLight position={[-0.5, 1, 0.72]} color="#ffe0a8" intensity={4.6} />
      <directionalLight position={[0.72, 0.45, -0.85]} color="#91b8d8" intensity={2.15} />
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
            <Canvas dpr={[1, 2]} gl={{ toneMappingExposure: 1.13 }} camera={{ fov: 40 }}>
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
