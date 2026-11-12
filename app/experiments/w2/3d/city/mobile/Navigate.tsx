"use client";

import { memo, useRef, useState } from "react";
import { START_VIEW, type View } from "../controls";
import { BLOCK, LOTS, PLAN, RIVER_WIDTH, SIZE, STREET, inRiver, lotAt, riverAt } from "../plan";
import styles from "./navigate.module.css";

const UNITS = 2.6; // map units on the page per unit of city, at zoom 1 (the page is 200 units on its longer side)
type Point = { x: number; y: number };

// A map of the city, moved like in a maps app. The place at the centre of the map is where the screen's camera looks.
// 1 finger: move. 2 fingers: pinch = zoom, turn = rotate; side by side and dragged up or down = tilt.
export function Navigate({ river, onChange }: { river: boolean; onChange: (view: View) => void }) {
  const [view, setView] = useState(START_VIEW);
  const now = useRef(view); // the same view, readable inside the pointer handlers
  const fingers = useRef(new Map<number, Point>()); // where each finger is

  function change(next: View) {
    const edge = SIZE / 2;
    now.current = {
      x: Math.min(edge, Math.max(-edge, next.x)),
      z: Math.min(edge, Math.max(-edge, next.z)),
      zoom: Math.min(10, Math.max(0.6, next.zoom)),
      bearing: next.bearing,
      pitch: Math.min(1, Math.max(0, next.pitch)),
    };
    setView(now.current);
    onChange(now.current);
  }

  // The map moved by (dx, dy) pixels under the fingers: the centre goes the other way, turned by the bearing.
  function moved(view: View, dx: number, dy: number, box: DOMRect) {
    const pixels = (view.zoom * UNITS * Math.max(box.width, box.height)) / 200; // pixels per unit of city
    const cos = Math.cos(view.bearing);
    const sin = Math.sin(view.bearing);
    return { ...view, x: view.x - (dx * cos - dy * sin) / pixels, z: view.z - (dx * sin + dy * cos) / pixels };
  }

  function down(event: React.PointerEvent) {
    fingers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
  }

  function move(event: React.PointerEvent) {
    const before = fingers.current.get(event.pointerId);
    if (!before) return; // this finger is not down
    const box = event.currentTarget.getBoundingClientRect();
    const [a0, b0] = [...fingers.current.values()]; // the first two fingers, before this move
    fingers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const [a1, b1] = [...fingers.current.values()]; // and after

    if (!b0) {
      change(moved(now.current, a1.x - a0.x, a1.y - a0.y, box)); // one finger: move
      return;
    }
    // Two fingers: compare the line between them, before and after.
    const distance0 = Math.hypot(b0.x - a0.x, b0.y - a0.y);
    const distance1 = Math.hypot(b1.x - a1.x, b1.y - a1.y);
    const turn = Math.atan2(b1.y - a1.y, b1.x - a1.x) - Math.atan2(b0.y - a0.y, b0.x - a0.x);
    const dx = (a1.x + b1.x - a0.x - b0.x) / 2; // how far their middle moved
    const dy = (a1.y + b1.y - a0.y - b0.y) / 2;
    const sideBySide = Math.abs(b1.y - a1.y) < distance1 * 0.4;

    let next = { ...now.current, zoom: now.current.zoom * (distance0 > 10 ? distance1 / distance0 : 1), bearing: now.current.bearing - turn };
    if (sideBySide) next = moved({ ...next, pitch: next.pitch - dy / 250 }, dx, 0, box); // side by side: up and down is the tilt
    else next = moved(next, dx, dy, box);
    change(next);
  }

  function up(event: React.PointerEvent) {
    fingers.current.delete(event.pointerId);
  }

  // On a laptop: the wheel zooms, shift + wheel rotates, alt + wheel tilts.
  function wheel(event: React.WheelEvent) {
    const amount = (event.deltaY || event.deltaX) * 0.003;
    if (event.shiftKey) change({ ...now.current, bearing: now.current.bearing + amount });
    else if (event.altKey) change({ ...now.current, pitch: now.current.pitch - amount });
    else change({ ...now.current, zoom: now.current.zoom * Math.exp(-amount) });
  }

  const degrees = (-view.bearing * 180) / Math.PI;
  return (
    <div className={styles.container} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onWheel={wheel}>
      {/* Tilted like a 3D map: the more pitch, the flatter the map lies */}
      <svg className={styles.map} viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid slice" style={{ transform: `perspective(700px) rotateX(${view.pitch * 52}deg) scale(${1 + view.pitch * 0.5})` }}>
        <g transform={`rotate(${degrees}) scale(${view.zoom * UNITS}) translate(${-view.x} ${-view.z})`}>
          <Plan river={river} />
        </g>
      </svg>
      {/* The place the screen looks at */}
      <div className={styles.centre} />
      {/* The compass: its needle points north. Touch it: north up, straight down. */}
      <button
        className={styles.compass}
        onPointerDown={(event) => {
          event.stopPropagation();
          change({ ...now.current, bearing: 0, pitch: 0 });
        }}
      >
        <svg viewBox="-12 -12 24 24" style={{ transform: `rotate(${degrees}deg)` }}>
          <path d="M0 -9 L3.2 0 L-3.2 0 Z" fill="#ff453a" />
          <path d="M0 9 L3.2 0 L-3.2 0 Z" fill="white" />
        </svg>
      </button>
      <p className={styles.readout}>
        zoom {view.zoom.toFixed(1)}× · {Math.round((((view.bearing * 180) / Math.PI) % 360 + 360) % 360)}° · tilt {Math.round(view.pitch * 100)}%
      </p>
    </div>
  );
}

// The city from above: streets, blocks, the footprint of every building, the river. Drawn once.
const Plan = memo(function Plan({ river }: { river: boolean }) {
  const blocks = [];
  for (let j = 0; j < LOTS; j += BLOCK) {
    for (let i = 0; i < LOTS; i += BLOCK) {
      blocks.push(<rect key={`${i}-${j}`} x={lotAt(i) - 0.5} y={lotAt(j) - 0.5} width={BLOCK} height={BLOCK} rx={0.25} />);
    }
  }
  const course = Array.from({ length: 41 }, (_, k) => (k / 40 - 0.5) * (SIZE + 30)).map((z) => `${riverAt(z)},${z}`);
  return (
    <>
      <rect className={styles.streets} x={-SIZE / 2 - STREET} y={-SIZE / 2 - STREET} width={SIZE + STREET * 2} height={SIZE + STREET * 2} rx={1} />
      <g className={styles.blocks}>{blocks}</g>
      <g className={styles.buildings}>
        {PLAN.filter((lot) => !lot.empty && !(river && inRiver(lot.x, lot.z))).map((lot) => (
          <rect key={lot.n} x={lot.x - lot.width / 2} y={lot.z - lot.depth / 2} width={lot.width} height={lot.depth} />
        ))}
      </g>
      {river && <polyline className={styles.river} points={course.join(" ")} strokeWidth={RIVER_WIDTH} />}
    </>
  );
});
