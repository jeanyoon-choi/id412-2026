"use client";

import { useRef, useState } from "react";
import { useSocket } from "@/hooks/shared/useSocket";
import styles from "./page.module.css";

// One finger moves a whole market. Slide up: everything rallies. Slide down: everything sells off.
// The finger's height becomes one number, sentiment, from -1 (bottom) to +1 (top).
const SEND_INTERVAL = 33; // ms, about 30 messages per second

export default function MarketMobile() {
  const { send, connected, status } = useSocket("market");
  const [sentiment, setSentiment] = useState<number | null>(null); // null = no finger on the glass
  const lastSent = useRef(0);

  function handleMove(event: React.PointerEvent) {
    if (event.buttons === 0 && event.pointerType === "mouse") return; // a mouse must be pressed
    const value = 1 - (event.clientY / window.innerHeight) * 2; // top = +1, middle = 0, bottom = -1
    setSentiment(value);

    const now = performance.now();
    if (now - lastSent.current < SEND_INTERVAL) return;
    lastSent.current = now;
    send("sentiment", value); // continuous
  }

  function handleUp() {
    setSentiment(null);
    send("release"); // discrete: the hand is off the market
  }

  const up = (sentiment ?? 0) >= 0;

  return (
    <main className={styles.container} onPointerDown={handleMove} onPointerMove={handleMove} onPointerUp={handleUp} onPointerCancel={handleUp}>
      <span className={styles.top}>BUY</span>
      <span className={styles.bottom}>SELL</span>
      <div className={styles.middle} />
      {sentiment !== null && (
        <div className={up ? `${styles.level} ${styles.up}` : `${styles.level} ${styles.down}`} style={{ top: `${((1 - sentiment) / 2) * 100}%` }}>
          <span className={styles.value}>
            {up ? "+" : "−"}
            {Math.abs(sentiment).toFixed(2)}
          </span>
        </div>
      )}
      {!connected && <p className={styles.problem}>{status}</p>}
    </main>
  );
}
