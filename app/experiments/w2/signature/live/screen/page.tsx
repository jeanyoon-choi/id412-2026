"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/shared/useSocket";
import styles from "./page.module.css";

// The laptop shows the signature while it is being written on the phone.
const WIDTH = 0.7; // the phone's pad is drawn this wide, as a fraction of the screen
const INK = 5; // px, line thickness

type Point = [number, number];

export default function SignatureLiveScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const last = useRef<Point | null>(null); // end of the stroke so far
  const [phonePath, setPhonePath] = useState("");

  const onMessage = useCallback((type: string, data: unknown) => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    if (type === "start") last.current = null; // the next point begins a new stroke
    if (type === "clear") context.clearRect(0, 0, canvas.width, canvas.height);
    if (type === "points") {
      // Fractions of the pad's width → px on this screen, centred.
      const scale = window.innerWidth * WIDTH;
      const left = (window.innerWidth - scale) / 2;
      const top = window.innerHeight * 0.15;
      for (const [x, y] of data as Point[]) {
        const point: Point = [left + x * scale, top + y * scale];
        if (last.current) {
          context.beginPath();
          context.moveTo(...last.current);
          context.lineTo(...point);
          context.stroke();
        }
        last.current = point;
      }
    }
  }, []);

  const { connected, status } = useSocket("signature-live", onMessage);

  useEffect(() => {
    setPhonePath(window.location.pathname.replace(/\/screen$/, "/mobile"));
    const canvas = canvasRef.current!;
    const dpr = window.devicePixelRatio;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    const context = canvas.getContext("2d")!;
    context.scale(dpr, dpr);
    context.lineWidth = INK;
    context.lineCap = "round";
    context.lineJoin = "round";
  }, []);

  return (
    <main className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <p className={styles.status}>
        {connected ? "connected" : status} · open{" "}
        <a href={phonePath} target="_blank" className={styles.link}>
          {phonePath}
        </a>
      </p>
    </main>
  );
}
