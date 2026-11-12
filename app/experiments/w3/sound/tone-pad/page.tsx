"use client";

import { useRef, useState } from "react";
import * as Tone from "tone";
import styles from "./page.module.css";

// The screen is an instrument. Press and drag: left/right is the pitch, up/down is the brightness.
const LOW = 110; // Hz, pitch at the left edge (A2)
const HIGH = 880; // Hz, pitch at the right edge (A5)
const GLIDE = 0.05; // seconds, how smoothly the sound follows the pointer

export default function TonePad() {
  const synth = useRef<Tone.Synth | null>(null);
  const filter = useRef<Tone.Filter | null>(null);
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);

  // Pointer position → 0..1 → sound parameters.
  function read(event: React.PointerEvent) {
    const x = event.clientX / window.innerWidth;
    const y = event.clientY / window.innerHeight;
    return {
      x,
      y,
      frequency: LOW * Math.pow(HIGH / LOW, x), // equal steps on screen = equal steps in pitch
      cutoff: 200 * Math.pow(40, 1 - y), // 200 Hz (bottom, dull) → 8000 Hz (top, bright)
    };
  }

  async function handleDown(event: React.PointerEvent) {
    const { x, y, frequency, cutoff } = read(event);
    await Tone.start(); // audio may only start inside a tap or click

    // Build the instrument once: synth → filter → speakers.
    if (!synth.current) {
      filter.current = new Tone.Filter(cutoff, "lowpass").toDestination();
      synth.current = new Tone.Synth({ oscillator: { type: "sawtooth" } }).connect(filter.current);
    }
    filter.current!.frequency.value = cutoff;
    synth.current.triggerAttack(frequency); // note on
    setPoint({ x, y });
  }

  function handleMove(event: React.PointerEvent) {
    if (!point || !synth.current) return;
    const { x, y, frequency, cutoff } = read(event);
    synth.current.frequency.rampTo(frequency, GLIDE);
    filter.current!.frequency.rampTo(cutoff, GLIDE);
    setPoint({ x, y });
  }

  function handleUp() {
    synth.current?.triggerRelease(); // note off
    setPoint(null);
  }

  return (
    <main className={styles.pad} onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={handleUp} onPointerCancel={handleUp}>
      <p className={styles.hint}>press and drag · → pitch · ↑ brightness</p>
      {point && <div className={styles.dot} style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }} />}
    </main>
  );
}
