"use client";

import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/shared/useSocket";
import styles from "./page.module.css";

// Sign on the phone; every stroke goes to the screen while you are still writing.
// Positions are divided by the pad's width, so the signature keeps its shape on any screen.
const SEND_INTERVAL = 33; // ms, about 30 messages per second

type Point = [number, number];

export default function SignatureLiveMobile() {
  const { send, connected, status } = useSocket("signature-live");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stroke = useRef<Point[] | null>(null); // the stroke being drawn, in px
  const waiting = useRef<Point[]>([]); // points drawn but not sent yet
  const lastSent = useRef(0);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const dpr = window.devicePixelRatio;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    const context = canvas.getContext("2d")!;
    context.scale(dpr, dpr);
    context.lineWidth = 2.5;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#111";
  }, []);

  // Where the finger is on the pad, in px.
  function place(event: React.PointerEvent): Point {
    const box = canvasRef.current!.getBoundingClientRect();
    return [event.clientX - box.left, event.clientY - box.top];
  }

  // px → fractions of the pad's width (x and y by the same number: the shape is kept).
  function flush() {
    if (waiting.current.length === 0) return;
    const width = canvasRef.current!.clientWidth;
    send("points", waiting.current.map(([x, y]) => [x / width, y / width])); // continuous
    waiting.current = [];
  }

  function handleDown(event: React.PointerEvent) {
    const point = place(event);
    stroke.current = [point];
    waiting.current = [point];
    setSigned(true);
    send("start"); // discrete: a new stroke begins
  }

  function handleMove(event: React.PointerEvent) {
    const points = stroke.current;
    if (!points) return;
    const point = place(event);
    points.push(point);
    waiting.current.push(point);
    // A curve through the middle of the last points instead of straight segments: smoother ink.
    const context = canvasRef.current!.getContext("2d")!;
    const [a, b, c] = [points[points.length - 3] ?? points[0], points[points.length - 2], point];
    context.beginPath();
    context.moveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    context.quadraticCurveTo(b[0], b[1], (b[0] + c[0]) / 2, (b[1] + c[1]) / 2);
    context.stroke();

    const now = performance.now();
    if (now - lastSent.current < SEND_INTERVAL) return;
    lastSent.current = now;
    flush();
  }

  function handleUp() {
    flush();
    stroke.current = null;
  }

  function clear() {
    const canvas = canvasRef.current!;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    setSigned(false);
    send("clear"); // discrete
  }

  return (
    <main className={styles.container}>
      <header className={styles.bar}>
        <button className={styles.clear} onClick={clear} disabled={!signed}>
          Clear
        </button>
        <span className={styles.title}>Signature</span>
      </header>
      {!connected && <p className={styles.problem}>{status}</p>}

      <div className={styles.sheet}>
        <canvas ref={canvasRef} className={styles.pad} onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={handleUp} onPointerCancel={handleUp} />
        <div className={styles.line}>
          <span className={styles.cross}>✕</span>
          <p className={styles.caption}>Sign above the line.</p>
        </div>
      </div>
    </main>
  );
}
