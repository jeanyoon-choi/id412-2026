"use client";

import { useEffect, useState } from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useSocket } from "@/hooks/shared/useSocket";
import { City } from "../common/City";
import { Sky } from "../common/Sky";
import { Figure, useWalkers } from "../common/Walkers";
import styles from "./page.module.css";

// The screen sees the whole city from above and everyone walking in it.
// It only listens: each phone moves itself, the screen draws what the phones report.
export default function CityWalkScreen() {
  const { walkers, ids, onMessage } = useWalkers();
  const { connected, status } = useSocket("city-walk", onMessage);
  const [phonePath, setPhonePath] = useState("");

  useEffect(() => {
    setPhonePath(window.location.pathname.replace(/\/screen$/, "/mobile"));
  }, []);

  return (
    <main className={styles.container}>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [330, 360, 330], fov: 35, near: 1, far: 12000 }}>
        {/* From up here the haze starts beyond the city: it only hides the empty ground around it */}
        <Sky near={700} far={2600} />
        <City />
        {ids.map((id) => (
          <Figure key={id} id={id} walkers={walkers} />
        ))}
        {/* The view turns slowly around the crossing */}
        <OrbitControls autoRotate autoRotateSpeed={0.3} enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 - 0.2} />
      </Canvas>

      <p className={styles.status}>
        {connected ? "connected" : status} · open{" "}
        {/* A new tab with the mobile page: test both sides on one laptop. Open several for several walkers. */}
        <a href={phonePath} target="_blank" className={styles.link}>
          {phonePath}
        </a>
      </p>
      <p className={styles.count}>{ids.length}</p>
      <p className={styles.credit}>Shibuya, Tokyo · map data © OpenStreetMap contributors</p>
    </main>
  );
}
