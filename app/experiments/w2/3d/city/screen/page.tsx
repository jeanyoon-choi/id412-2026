"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useSocket } from "@/hooks/shared/useSocket";
import { NO_STATS, START, type Controls, type LayerKey, type Stats, type View } from "../controls";
import { City } from "./City";
import { Hud } from "./Hud";
import { Labels } from "./Labels";
import { startSound } from "./sound";
import type { Mark } from "./stats";
import styles from "./page.module.css";

// The laptop shows a generated city. The mobile has three modes:
// Settings → the city's parameters · Navigate → the camera · Statistics → the figures drawn over the city.
export default function CityScreen() {
  // Read by the city every frame.
  const controls = useRef<Controls>(START);
  const view = useRef<View | null>(null);
  const layerRef = useRef<LayerKey | null>(null);
  // Written by the city every frame.
  const stats = useRef<Stats>({ ...NO_STATS });
  const marks = useRef<Mark[]>([]);
  const markElements = useRef<(HTMLDivElement | null)[]>([]);
  // The same, for the text on the page (updated twice a second).
  const [layer, setLayer] = useState<LayerKey | null>(null);
  const [shown, setShown] = useState({ stats: NO_STATS, time: START.sliders[0] });
  const sound = useRef<Awaited<ReturnType<typeof startSound>> | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [mobilePath, setMobilePath] = useState("");

  const onMessage = useCallback((type: string, data: unknown) => {
    if (type === "controls") controls.current = data as Controls;
    if (type === "view") view.current = data as View;
    if (type === "layer") {
      layerRef.current = data as LayerKey | null;
      setLayer(data as LayerKey | null);
      if (!data) marks.current = [];
    }
  }, []);

  const { send, connected, status } = useSocket("3d-city", onMessage);

  // Twice a second: show the figures, send them back to the mobile, tune the sound.
  useEffect(() => {
    const timer = setInterval(() => {
      setShown({ stats: { ...stats.current }, time: controls.current.sliders[0] });
      send("stats", stats.current);
      sound.current?.update(controls.current, stats.current, view.current);
    }, 500);
    return () => clearInterval(timer);
  }, [send]);

  useEffect(() => {
    setMobilePath(window.location.pathname.replace(/\/screen$/, "/mobile"));
    return () => sound.current?.stop();
  }, []);

  async function toggleSound() {
    if (sound.current) {
      sound.current.stop();
      sound.current = null;
    } else {
      sound.current = await startSound();
    }
    setSoundOn(sound.current !== null);
  }

  return (
    <main className={styles.container}>
      <Canvas camera={{ fov: 32, near: 0.5, far: 600 }}>
        <City controls={controls} view={view} layer={layerRef} stats={stats} marks={marks} />
        <Labels marks={marks} elements={markElements} />
      </Canvas>
      {/* The five texts that follow buildings or vehicles: placed by Labels.tsx */}
      {[0, 1, 2, 3, 4].map((k) => (
        <div
          key={k}
          className={styles.mark}
          ref={(element) => {
            markElements.current[k] = element;
          }}
        />
      ))}
      <p className={styles.status}>
        {connected ? "connected" : status} · open{" "}
        <a href={mobilePath} target="_blank" className={styles.link}>
          {mobilePath}
        </a>{" "}
        ·{" "}
        <button className={styles.link} onClick={toggleSound}>
          sound {soundOn ? "on" : "off"}
        </button>
      </p>
      {layer && <Hud layer={layer} stats={shown.stats} time={shown.time} />}
    </main>
  );
}
