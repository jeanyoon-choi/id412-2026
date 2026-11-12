"use client";

import { useRef } from "react";
import { LAYERS, short, type LayerKey, type Stats } from "../controls";
import styles from "./statistics.module.css";

// What the city is doing, in figures the screen sends back twice a second.
// The row under the finger is the statistic the screen shows on the city (finger skating: slide across the rows).
export function Statistics({ stats, layer, onChange }: { stats: Stats; layer: LayerKey; onChange: (layer: LayerKey) => void }) {
  const listRef = useRef<HTMLDivElement>(null);

  function skate(event: React.PointerEvent) {
    if (event.type === "pointermove" && event.buttons === 0) return; // a mouse must be pressed
    const box = listRef.current!.getBoundingClientRect();
    const row = Math.floor(((event.clientY - box.top) / box.height) * LAYERS.length);
    if (row >= 0 && row < LAYERS.length && LAYERS[row].key !== layer) onChange(LAYERS[row].key);
  }

  const more = [
    ["Residents", short(stats.residents)],
    ["Buildings", stats.buildings.toLocaleString("en")],
    ["Floor area", `${short(stats.area)} m²`],
    ["Average speed", `${Math.round(stats.speed)} km/h`],
  ];

  return (
    <div className={styles.container} onPointerDown={skate} onPointerMove={skate}>
      <p className={styles.header}>Shown on the city</p>
      <div ref={listRef} className={styles.layers}>
        {LAYERS.map((item) => (
          <div key={item.key} className={styles.row}>
            <svg className={styles.check} viewBox="0 0 16 16" style={{ opacity: item.key === layer ? 1 : 0 }}>
              <path d="M2.5 8.5 L6.2 12 L13.5 3.8" />
            </svg>
            <div className={styles.name}>
              {item.name}
              <span>{item.unit}</span>
            </div>
            <span className={styles.figure}>{item.key === "gdp" ? `$${short(stats.gdp)}` : short(stats[item.key])}</span>
          </div>
        ))}
      </div>

      <p className={styles.header}>More</p>
      <div className={styles.more}>
        {more.map(([name, value]) => (
          <div key={name} className={styles.row}>
            <div className={styles.name}>{name}</div>
            <span className={styles.value}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
