"use client";

import { useState } from "react";
import { useSocket } from "@/hooks/shared/useSocket";
import styles from "./page.module.css";

// The phone drops pellets into the tank. The map is the screen in small: tap where the pellet should fall.
// Two kinds: food pulls the fish, bitter drives them away. Each tap is one message.
type Kind = "food" | "bitter";
type Drop = { key: number; x: number; y: number; kind: Kind };

export default function FishFoodMobile() {
  const { send, connected, status } = useSocket("fish-food");
  const [kind, setKind] = useState<Kind>("food");
  const [drops, setDrops] = useState<Drop[]>([]); // the last taps, shown on the map while they fade

  function drop(event: React.PointerEvent<HTMLDivElement>) {
    // Position inside the map, 0..1, wherever the map sits on the phone.
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    send("drop", { x, y, kind }); // discrete: one pellet
    setDrops((list) => [...list.slice(-11), { key: performance.now(), x, y, kind }]);
  }

  return (
    <main className={styles.container}>
      <p className={styles.status}>{connected ? "connected · tap the map" : status}</p>

      <div className={styles.map} onPointerDown={drop}>
        {drops.map((mark) => (
          <div
            key={mark.key}
            className={mark.kind === "food" ? styles.food : styles.bitter}
            style={{ left: `${mark.x * 100}%`, top: `${mark.y * 100}%` }}
          />
        ))}
      </div>

      <div className={styles.kinds}>
        <button className={kind === "food" ? styles.chosen : styles.kind} onClick={() => setKind("food")}>
          food
        </button>
        <button className={kind === "bitter" ? styles.chosen : styles.kind} onClick={() => setKind("bitter")}>
          bitter
        </button>
      </div>
    </main>
  );
}
