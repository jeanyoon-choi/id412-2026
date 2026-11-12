"use client";

import { useState } from "react";
import styles from "./page.module.css";

// The projector's picture is bigger than the wall and not lined up with it.
// So the page is black, and the content lives in a frame that is moved and sized
// until it sits exactly on the wall. Four numbers per projector, in % of the window.
// Starting values: measured once in the Black Room. Tune with the sliders, then write them here.
const FRAMES = {
  left: { top: 13.6, left: 0, width: 99.5, height: 58.2 },
  right: { top: 4.9, left: 5.4, width: 78.3, height: 53.8 },
};

type Side = keyof typeof FRAMES;
type Edge = keyof (typeof FRAMES)["left"];
const EDGES: Edge[] = ["top", "left", "width", "height"];

export function MappingFrame({ side, children }: { side: Side; children: React.ReactNode }) {
  const [frame, setFrame] = useState(FRAMES[side]);
  const [tuning, setTuning] = useState(true); // sliders visible?

  return (
    <main className={styles.room}>
      <div
        className={tuning ? `${styles.frame} ${styles.outline}` : styles.frame}
        style={{ top: `${frame.top}vh`, left: `${frame.left}vw`, width: `${frame.width}vw`, height: `${frame.height}vh` }}
      >
        {children}
      </div>

      {tuning ? (
        <div className={styles.controls}>
          <strong>{side} projector</strong>
          {EDGES.map((edge) => (
            <label key={edge} className={styles.control}>
              {edge} {frame[edge].toFixed(1)}
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={frame[edge]}
                onChange={(event) => setFrame({ ...frame, [edge]: Number(event.target.value) })}
              />
            </label>
          ))}
          <button className={styles.button} onClick={() => setTuning(false)}>
            hide
          </button>
        </div>
      ) : (
        // Invisible corner button: click the top-left corner to get the sliders back.
        <button className={styles.corner} onClick={() => setTuning(true)} aria-label="Show the mapping sliders" />
      )}
    </main>
  );
}
