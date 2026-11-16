"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as Tone from "tone";
import { useSocket } from "@/hooks/shared/useSocket";
import { COUNT } from "../grid";
import { Field } from "./Field";
import { createSound, type Sound } from "./sound";
import styles from "./page.module.css";

// The laptop shows a simulated water surface. The phone's 40 switches are 40 places on it:
// a switch that is on keeps making waves there.
export default function TogglersScreen() {
  const switches = useRef<boolean[]>(Array(COUNT).fill(false)); // read by the simulation every frame
  const [count, setCount] = useState(0); // how many are on, for the text
  const [phonePath, setPhonePath] = useState("");
  const sound = useRef<Sound | null>(null);
  const [listening, setListening] = useState(true); // false while the browser holds the sound back

  const onMessage = useCallback((type: string, data: unknown) => {
    if (type !== "switches") return;
    switches.current = data as boolean[];
    setCount((data as boolean[]).filter(Boolean).length);
  }, []);

  const { connected, status } = useSocket("3d-togglers", onMessage);

  useEffect(() => {
    setPhonePath(window.location.pathname.replace(/\/screen$/, "/mobile"));
  }, []);

  // The sound is on from the start. A browser may hold it back until the first click or key on the page
  // (it does not let a page make sound on its own); then any click or key anywhere lets it go.
  useEffect(() => {
    sound.current = createSound();
    const start = () => Tone.start().then(() => setListening(true));
    start();
    setListening(Tone.getContext().state === "running");
    addEventListener("pointerdown", start);
    addEventListener("keydown", start);
    return () => {
      removeEventListener("pointerdown", start);
      removeEventListener("keydown", start);
      sound.current?.close();
      sound.current = null;
    };
  }, []);

  return (
    <main className={styles.container}>
      {/* The phone's top row is the far edge of the surface, its bottom row the near edge. */}
      <Canvas camera={{ position: [0, 9, 12.5], fov: 42 }}>
        <Field switches={switches} sound={sound} />
      </Canvas>
      <p className={styles.status}>
        {connected ? `connected · ${count} / ${COUNT} on` : status} · open{" "}
        <a href={phonePath} target="_blank" className={styles.link}>
          {phonePath}
        </a>
        {!listening && " · click anywhere for sound"}
      </p>
    </main>
  );
}
