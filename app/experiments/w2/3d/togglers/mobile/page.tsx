"use client";

import { useRef, useState } from "react";
import { useSocket } from "@/hooks/shared/useSocket";
import { COLS, COUNT, ROWS } from "../grid";
import styles from "./page.module.css";

// Finger skating: 40 iOS switches, played without lifting the finger.
// Each switch is a discrete choice (on / off); sliding across them is a continuous gesture.
// Several fingers can skate at once.
export default function TogglersMobile() {
  const { send, connected, status } = useSocket("3d-togglers");
  const gridRef = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState<boolean[]>(() => Array(COUNT).fill(false));
  const onRef = useRef(on); // the same list, readable inside the pointer handlers
  const under = useRef(new Map<number, number>()); // for every finger: the switch it is on right now

  // Which switch is under this finger? Plain arithmetic on the grid's box: no hit-testing of elements.
  function cellAt(event: React.PointerEvent) {
    const box = gridRef.current!.getBoundingClientRect();
    const column = Math.floor(((event.clientX - box.left) / box.width) * COLS);
    const row = Math.floor(((event.clientY - box.top) / box.height) * ROWS);
    if (column < 0 || column >= COLS || row < 0 || row >= ROWS) return -1;
    return row * COLS + column;
  }

  function skate(event: React.PointerEvent) {
    if (event.type === "pointermove" && !under.current.has(event.pointerId)) return; // this finger is not down
    const cell = cellAt(event);
    if (cell === under.current.get(event.pointerId)) return; // still on the same switch: it flips once per visit
    under.current.set(event.pointerId, cell);
    if (cell < 0) return;

    const next = onRef.current.map((value, index) => (index === cell ? !value : value));
    onRef.current = next;
    setOn(next);
    send("switches", next); // the whole list every time: a screen that joins late is right after one flip
  }

  function lift(event: React.PointerEvent) {
    under.current.delete(event.pointerId);
  }

  return (
    <main className={styles.container} onPointerDown={skate} onPointerMove={skate} onPointerUp={lift} onPointerCancel={lift}>
      <div ref={gridRef} className={styles.grid} style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
        {on.map((isOn, index) => (
          <div key={index} className={styles.cell}>
            <div className={isOn ? `${styles.switch} ${styles.on}` : styles.switch}>
              <div className={styles.knob} />
            </div>
          </div>
        ))}
      </div>
      {!connected && <p className={styles.status}>{status}</p>}
    </main>
  );
}
