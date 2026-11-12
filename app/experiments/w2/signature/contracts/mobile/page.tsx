"use client";

import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/shared/useSocket";
import styles from "./page.module.css";

// Sign once, press Send. The whole signature goes to the screen in one message.
// Positions are divided by the pad's width, so the signature keeps its shape.
type Point = [number, number];

export default function SignatureContractsMobile() {
  const { send, connected, status } = useSocket("signature-contracts");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Point[][]>([]); // every stroke so far, in px
  const drawing = useRef(false);
  const [signed, setSigned] = useState(false); // is there anything to send?
  const [sent, setSent] = useState(false);

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

  function place(event: React.PointerEvent): Point {
    const box = canvasRef.current!.getBoundingClientRect();
    return [event.clientX - box.left, event.clientY - box.top];
  }

  function handleDown(event: React.PointerEvent) {
    drawing.current = true;
    strokes.current.push([place(event)]);
    setSigned(true);
    setSent(false);
  }

  function handleMove(event: React.PointerEvent) {
    if (!drawing.current) return;
    const stroke = strokes.current[strokes.current.length - 1];
    stroke.push(place(event));
    // A curve through the middle of the last points instead of straight segments: smoother ink.
    const context = canvasRef.current!.getContext("2d")!;
    const [a, b, c] = [stroke[stroke.length - 3] ?? stroke[0], stroke[stroke.length - 2], stroke[stroke.length - 1]];
    context.beginPath();
    context.moveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    context.quadraticCurveTo(b[0], b[1], (b[0] + c[0]) / 2, (b[1] + c[1]) / 2);
    context.stroke();
  }

  function clear() {
    const canvas = canvasRef.current!;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    strokes.current = [];
    setSigned(false);
    setSent(false);
  }

  function submit() {
    const width = canvasRef.current!.clientWidth;
    // px → fractions of the pad's width, rounded to keep the message small.
    const signature = strokes.current.map((stroke) => stroke.map(([x, y]) => [Math.round((x / width) * 1000) / 1000, Math.round((y / width) * 1000) / 1000]));
    send("signature", signature); // discrete: one message, the whole signature
    setSent(true);
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
        <canvas ref={canvasRef} className={styles.pad} onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={() => (drawing.current = false)} onPointerCancel={() => (drawing.current = false)} />
        <div className={styles.line}>
          <span className={styles.cross}>✕</span>
          <p className={styles.caption}>{sent ? "Sent." : "Sign above the line."}</p>
        </div>
      </div>

      <footer className={styles.footer}>
        <button className={styles.send} onClick={submit} disabled={!signed || sent}>
          {sent ? "Sent" : "Send"}
        </button>
      </footer>
    </main>
  );
}
