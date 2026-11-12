"use client";

import { useRef, useState } from "react";
import { useSocket } from "@/hooks/shared/useSocket";
import styles from "./page.module.css";

// The phone is a trackball. Drag to turn the 3D shape on the screen; the button changes the shape.
const SEND_INTERVAL = 33; // ms, about 30 messages per second

export default function RotateMobile() {
  const { send, connected, status } = useSocket("3d-rotate");
  const [dragging, setDragging] = useState(false);
  const last = useRef({ x: 0, y: 0 }); // previous finger position, px
  const moved = useRef({ x: 0, y: 0 }); // movement not sent yet, in screen widths
  const lastSent = useRef(0);

  function handleDown(event: React.PointerEvent) {
    last.current = { x: event.clientX, y: event.clientY };
    setDragging(true);
  }

  function handleMove(event: React.PointerEvent) {
    if (!dragging) return;
    // How far the finger moved since the last event, divided by the phone's width:
    // the same swipe turns the shape the same amount on any phone.
    moved.current.x += (event.clientX - last.current.x) / window.innerWidth;
    moved.current.y += (event.clientY - last.current.y) / window.innerWidth;
    last.current = { x: event.clientX, y: event.clientY };

    const now = performance.now();
    if (now - lastSent.current < SEND_INTERVAL) return;
    lastSent.current = now;
    send("rotate", moved.current); // continuous: everything moved since the last message
    moved.current = { x: 0, y: 0 };
  }

  return (
    <main className={styles.pad} onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={() => setDragging(false)} onPointerCancel={() => setDragging(false)}>
      <p className={styles.status}>{connected ? "connected · drag to turn" : status}</p>
      {/* discrete: one message per tap. stopPropagation: a tap on the button is not a drag. */}
      <button className={styles.button} onPointerDown={(event) => event.stopPropagation()} onClick={() => send("next")}>
        next shape
      </button>
    </main>
  );
}
