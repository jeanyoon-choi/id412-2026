"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { useSocket } from "@/hooks/shared/useSocket";
import { createRenderer, type Renderer } from "./renderer";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shader";
import { createSound, type Sound } from "./sound";
import styles from "./page.module.css";

// The screen is one sky. Every phone is a pressure centre in it; the shader adds them all up.
// A phone that goes silent is not cut out: its pressure fades to nothing, and the sky closes over it.
const MAX_POINTS = 16; // the same number as in shader.ts
const EASE = 0.04; // 0..1 per frame, how slowly the sky follows the phones
const TIMEOUT = 3000; // ms without a message → that centre starts to fade
const SOUND_EVERY = 5; // frames between two updates of the sound (about 12 a second: enough for the ear)

type Point = { x: number; y: number; pressure: number; heat: number };
type Centre = { target: Point; now: Point; seen: number };

export default function CloudFieldScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const centres = useRef(new Map<string, Centre>());
  const sound = useRef<Sound | null>(null);
  const [count, setCount] = useState(0);
  const [listening, setListening] = useState(true); // false while the browser holds the sound back
  const [phonePath, setPhonePath] = useState("");

  const onMessage = useCallback((type: string, data: unknown) => {
    if (type !== "centre") return;
    const { id, ...target } = data as Point & { id: string };
    const centre = centres.current.get(id);
    if (centre) {
      centre.target = target;
      centre.seen = performance.now();
    } else if (centres.current.size < MAX_POINTS) {
      // A new phone starts with no pressure and grows into the sky.
      centres.current.set(id, { target, now: { ...target, pressure: 0, heat: 0 }, seen: performance.now() });
      setCount(centres.current.size);
    }
  }, []);

  const { connected, status } = useSocket("cloud-field", onMessage);

  // The sound is on from the start. A browser may hold it back until the first click or key on the page
  // (it does not let a page make sound on its own); then any click or key anywhere lets it go.
  useEffect(() => {
    sound.current = createSound();
    const start = () => Tone.start().then(() => setListening(true));
    start();
    setListening(Tone.getContext().state === "running");
    addEventListener("pointerdown", start);
    addEventListener("keydown", start);
    return () => {
      removeEventListener("pointerdown", start);
      removeEventListener("keydown", start);
      sound.current?.close();
      sound.current = null;
    };
  }, []);

  useEffect(() => {
    setPhonePath(window.location.pathname.replace(/\/screen$/, "/mobile"));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2");
    if (!gl) return;

    let renderer: Renderer;
    try {
      renderer = createRenderer(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    } catch (error) {
      console.error(error);
      return;
    }

    const points = new Float32Array(MAX_POINTS * 4); // x, y, pressure, heat for each centre
    const resize = () => renderer.resize(innerWidth, innerHeight, Math.min(devicePixelRatio || 1, 2));

    let frame = 0;
    let frames = 0;
    const render = (time: number) => {
      // The sound follows the same numbers as the picture, a few times less often.
      const heard = frames++ % SOUND_EVERY === 0 ? sound.current : null;
      let index = 0;
      let lows = 0;
      let highs = 0;
      for (const [id, centre] of centres.current) {
        // Silent for too long: aim for zero, so it fades instead of vanishing.
        if (time - centre.seen > TIMEOUT) centre.target = { ...centre.target, pressure: 0, heat: 0 };

        const { now, target } = centre;
        now.x += (target.x - now.x) * EASE;
        now.y += (target.y - now.y) * EASE;
        now.pressure += (target.pressure - now.pressure) * EASE;
        now.heat += (target.heat - now.heat) * EASE;

        // Faded out completely: forget it.
        if (time - centre.seen > TIMEOUT && Math.abs(now.pressure) < 0.01 && Math.abs(now.heat) < 0.01) {
          centres.current.delete(id);
          setCount(centres.current.size);
          sound.current?.forget(id);
          continue;
        }

        heard?.tune(id, now);
        lows += Math.max(0, -now.pressure);
        highs += Math.max(0, now.pressure);

        // The shader's (0,0) is bottom-left, the phone's is top-left: flip y.
        points.set([now.x, 1 - now.y, now.pressure, now.heat], index * 4);
        index++;
      }
      heard?.weather(lows, highs);
      renderer.render(time / 1000, points, index);
      frame = requestAnimationFrame(render);
    };

    addEventListener("resize", resize);
    resize();
    frame = requestAnimationFrame(render);

    return () => {
      removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
      renderer.destroy();
    };
  }, []);

  return (
    <main className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <p className={styles.status}>
        {connected ? "connected" : status} · open{" "}
        {/* A new tab with the mobile page: test both sides on one laptop. Open several for several centres. */}
        <a href={phonePath} target="_blank" className={styles.link}>
          {phonePath}
        </a>
        {!listening && " · click anywhere for sound"}
      </p>
      <p className={styles.count}>{count}</p>
    </main>
  );
}
