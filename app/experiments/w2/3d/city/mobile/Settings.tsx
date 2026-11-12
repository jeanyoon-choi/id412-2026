"use client";

import { useRef, useState } from "react";
import { SLIDERS, START, SWITCHES, valueText, type Controls } from "../controls";
import styles from "./settings.module.css";

// The iOS Settings screen, played by finger skating: the finger does not have to grab a thumb or lift.
// It sets the slider of the row it is on to its own x, and flips each switch once as it arrives on its row.
// Several fingers can play at once.
// onChange: every new set of values goes to the page, which sends it to the screen.
export function Settings({ onChange }: { onChange: (controls: Controls) => void }) {
  const slidersRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null); // the first track: all tracks have the same left and width
  const switchesRef = useRef<HTMLDivElement>(null);
  const [controls, setControls] = useState<Controls>(START);
  const now = useRef(controls); // the same values, readable inside the pointer handlers
  const fingers = useRef(new Map<number, { slider: number; toggle: number }>()); // the row each finger is on (-1 = none)
  const [touched, setTouched] = useState({ sliders: [] as number[], toggles: [] as number[] }); // rows under a finger: their thumbs turn to glass

  // Which row of a list is at this y? Plain arithmetic on the list's box.
  function rowAt(list: HTMLDivElement, y: number, count: number) {
    const box = list.getBoundingClientRect();
    const row = Math.floor(((y - box.top) / box.height) * count);
    return row >= 0 && row < count ? row : -1;
  }

  function showTouched() {
    const all = [...fingers.current.values()];
    setTouched({ sliders: all.map((finger) => finger.slider), toggles: all.map((finger) => finger.toggle) });
  }

  function skate(event: React.PointerEvent) {
    const last = fingers.current.get(event.pointerId);
    if (event.type === "pointermove" && !last) return; // this finger is not down
    let { sliders, switches } = now.current;

    // On a slider row: its value is the finger's x along the track.
    const slider = rowAt(slidersRef.current!, event.clientY, SLIDERS.length);
    if (slider >= 0) {
      const track = trackRef.current!.getBoundingClientRect();
      const value = Math.min(1, Math.max(0, (event.clientX - track.left) / track.width));
      sliders = sliders.map((old, index) => (index === slider ? value : old));
    }

    // On a switch row: it flips once per visit.
    const toggle = rowAt(switchesRef.current!, event.clientY, SWITCHES.length);
    if (toggle >= 0 && toggle !== last?.toggle) switches = switches.map((old, index) => (index === toggle ? !old : old));

    fingers.current.set(event.pointerId, { slider, toggle });
    if (slider !== last?.slider || toggle !== last?.toggle) showTouched();
    if (sliders === now.current.sliders && switches === now.current.switches) return; // nothing changed
    now.current = { sliders, switches };
    setControls(now.current);
    onChange(now.current);
  }

  function lift(event: React.PointerEvent) {
    fingers.current.delete(event.pointerId);
    showTouched();
  }

  return (
    <div className={styles.container} onPointerDown={skate} onPointerMove={skate} onPointerUp={lift} onPointerCancel={lift}>
      <div ref={slidersRef} className={styles.sliders}>
        {SLIDERS.map((slider, index) => (
          <div key={slider.key} className={styles.row}>
            <div className={styles.head}>
              <span>{slider.name}</span>
              <span className={styles.value}>{valueText(slider.key, controls.sliders[index])}</span>
            </div>
            <div className={styles.line}>
              <span className={styles.end}>{slider.low}</span>
              <div ref={index === 0 ? trackRef : undefined} className={styles.track}>
                <div className={styles.filled} style={{ width: `${controls.sliders[index] * 100}%` }} />
                <div className={touched.sliders.includes(index) ? `${styles.thumb} ${styles.glass}` : styles.thumb} style={{ left: `${controls.sliders[index] * 100}%` }} />
              </div>
              <span className={`${styles.end} ${styles.high}`}>{slider.high}</span>
            </div>
          </div>
        ))}
      </div>

      <div ref={switchesRef} className={styles.switches}>
        {SWITCHES.map((item, index) => (
          <div key={item.key} className={styles.row}>
            <div className={styles.head}>
              <span>{item.name}</span>
              <div className={controls.switches[index] ? `${styles.switch} ${styles.on}` : styles.switch}>
                <div className={touched.toggles.includes(index) ? `${styles.knob} ${styles.glass}` : styles.knob} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
