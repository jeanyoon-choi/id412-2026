"use client";

import { useRef, useState } from "react";
import { useSocket } from "@/hooks/shared/useSocket";
import styles from "./page.module.css";

// Two fingers hold a sphere. Close together: it is whole. Pull them apart: it breaks into particles.
const SEND_INTERVAL = 33; // ms, about 30 messages per second
const FULL = 0.8; // fingers this far apart (as a fraction of the screen's diagonal) = fully apart

type Finger = { id: number; x: number; y: number };

export default function ParticlesMobile() {
  const { send, connected, status } = useSocket("3d-particles");
  const fingers = useRef(new Map<number, Finger>()); // every finger on the glass, by pointer id
  const [shown, setShown] = useState<Finger[]>([]); // the same fingers, for drawing them
  const lastSent = useRef(0);

  function update() {
    const list = [...fingers.current.values()];
    setShown(list);

    // Two fingers: their distance is the input. Fewer: the sphere closes again.
    let scatter = 0;
    if (list.length >= 2) {
      const distance = Math.hypot(list[0].x - list[1].x, list[0].y - list[1].y);
      const diagonal = Math.hypot(window.innerWidth, window.innerHeight);
      scatter = Math.min(1, distance / (diagonal * FULL));
    }

    const now = performance.now();
    if (list.length >= 2 && now - lastSent.current < SEND_INTERVAL) return;
    lastSent.current = now;
    send("scatter", scatter); // continuous, 0..1
  }

  function handleDown(event: React.PointerEvent) {
    fingers.current.set(event.pointerId, { id: event.pointerId, x: event.clientX, y: event.clientY });
    update();
  }

  function handleMove(event: React.PointerEvent) {
    if (!fingers.current.has(event.pointerId)) return;
    fingers.current.set(event.pointerId, { id: event.pointerId, x: event.clientX, y: event.clientY });
    update();
  }

  function handleUp(event: React.PointerEvent) {
    fingers.current.delete(event.pointerId);
    update();
  }

  return (
    <main className={styles.pad} onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={handleUp} onPointerCancel={handleUp}>
      <p className={styles.status}>{connected ? "connected · two fingers: pull apart, bring together" : status}</p>
      {/* The line between the two fingers: its length is what is sent */}
      {shown.length >= 2 && (
        <svg className={styles.link}>
          <line x1={shown[0].x} y1={shown[0].y} x2={shown[1].x} y2={shown[1].y} />
        </svg>
      )}
      {shown.map((finger) => (
        <div key={finger.id} className={styles.dot} style={{ left: finger.x, top: finger.y }} />
      ))}
      {shown.length < 2 && <p className={styles.hint}>{shown.length === 0 ? "touch with two fingers" : "one more finger"}</p>}
    </main>
  );
}
