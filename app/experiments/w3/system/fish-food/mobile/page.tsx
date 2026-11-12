"use client";

import { useRef, useState } from "react";
import { useSocket } from "@/hooks/shared/useSocket";
import styles from "./page.module.css";

// The mobile drops pellets into the water. The whole mobile is the map: its corners are the corners of the screen.
// A tap drops one pellet. A finger that slides over the map scatters them along its path, one every STEP px.
// Two kinds: food pulls the fish, bitter drives them away. One pellet is one message.
const STEP = 22; // px the finger travels between two pellets

type Kind = "food" | "bitter";
type Drop = { key: number; x: number; y: number; kind: Kind };

export default function FishFoodMobile() {
  const { send, connected, status } = useSocket("fish-food");
  const [kind, setKind] = useState<Kind>("food");
  const [drops, setDrops] = useState<Drop[]>([]); // the last pellets, shown on the map while they fade
  const last = useRef<{ x: number; y: number } | null>(null); // where the finger dropped the last pellet; null = not touching
  const dropped = useRef(0); // how many pellets so far: the key of each mark

  function drop(event: React.PointerEvent<HTMLDivElement>) {
    // Position on the map, 0..1 across and 0..1 down, whatever the shape of the mobile.
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return; // the finger left the map
    send("drop", { x, y, kind }); // discrete: one pellet
    setDrops((list) => [...list.slice(-59), { key: dropped.current++, x, y, kind }]);
    last.current = { x: event.clientX, y: event.clientY };
  }

  function start(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId); // keep getting the moves of this finger
    drop(event);
  }

  function slide(event: React.PointerEvent<HTMLDivElement>) {
    if (!last.current) return;
    if (Math.hypot(event.clientX - last.current.x, event.clientY - last.current.y) >= STEP) drop(event);
  }

  function end() {
    last.current = null;
  }

  return (
    <main className={styles.map} onPointerDown={start} onPointerMove={slide} onPointerUp={end} onPointerCancel={end}>
      {drops.map((mark) => (
        <div
          key={mark.key}
          className={mark.kind === "food" ? styles.food : styles.bitter}
          style={{ left: `${mark.x * 100}%`, top: `${mark.y * 100}%` }}
        />
      ))}

      <p className={styles.status}>{connected ? "Tap or slide to drop" : status}</p>

      {/* Fixed at the bottom, under the thumb. A touch here must not reach the map: stopPropagation. */}
      <div className={styles.kinds} role="group" aria-label="What to drop" onPointerDown={(event) => event.stopPropagation()}>
        <button type="button" aria-pressed={kind === "food"} onClick={() => setKind("food")}>
          Food
        </button>
        <button type="button" aria-pressed={kind === "bitter"} onClick={() => setKind("bitter")}>
          Bitter
        </button>
      </div>
    </main>
  );
}
