"use client";

import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/shared/useSocket";
import styles from "./page.module.css";

// The phone is one pressure centre in the sky. The map is the screen in small: drag to place the centre.
// Two sliders set what it does there. The whole state goes to the screen about 15 times a second.
const SEND_INTERVAL = 66; // ms

type Point = { x: number; y: number; pressure: number; heat: number };

export default function CloudFieldMobile() {
  const { send, connected, status } = useSocket("cloud-field");
  const [point, setPoint] = useState<Point>({ x: 0.5, y: 0.5, pressure: -0.6, heat: 0 });
  const latest = useRef(point);

  useEffect(() => {
    latest.current = point;
  }, [point]);

  // Once, in the browser: this phone's id and a random place. Then keep sending the latest state,
  // also when nothing changes: that is how the screen knows this phone is still here.
  useEffect(() => {
    const id = Math.random().toString(36).slice(2, 8);
    setPoint((old) => ({ ...old, x: 0.2 + Math.random() * 0.6, y: 0.2 + Math.random() * 0.6 }));
    const timer = setInterval(() => send("centre", { id, ...latest.current }), SEND_INTERVAL);
    return () => clearInterval(timer);
  }, [send]);

  // Position inside the map, 0..1, wherever the map sits on the phone.
  function place(event: React.PointerEvent<HTMLDivElement>) {
    if (event.buttons === 0 && event.pointerType === "mouse") return; // a mouse must be pressed
    const box = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width));
    const y = Math.max(0, Math.min(1, (event.clientY - box.top) / box.height));
    setPoint((old) => ({ ...old, x, y }));
  }

  return (
    <main className={styles.container}>
      <p className={styles.status}>{connected ? "connected" : status}</p>

      <div className={styles.map} onPointerDown={place} onPointerMove={place}>
        <div className={styles.centre} style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }} />
      </div>

      <label className={styles.slider}>
        <span>
          <span>low · gathers</span>
          <span>pressure</span>
          <span>clears · high</span>
        </span>
        <input
          type="range"
          min={-1}
          max={1}
          step={0.01}
          value={point.pressure}
          onChange={(event) => setPoint({ ...point, pressure: Number(event.target.value) })}
        />
      </label>

      <label className={styles.slider}>
        <span>
          <span>cold</span>
          <span>heat</span>
          <span>warm</span>
        </span>
        <input
          type="range"
          min={-1}
          max={1}
          step={0.01}
          value={point.heat}
          onChange={(event) => setPoint({ ...point, heat: Number(event.target.value) })}
        />
      </label>
    </main>
  );
}
