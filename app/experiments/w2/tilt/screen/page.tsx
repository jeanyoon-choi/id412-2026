"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/shared/useSocket";
import styles from "./page.module.css";

// The laptop shows a ball on a table. Tilting the phone tilts the table: the ball rolls.
const GRAVITY = 0.6; // px per frame², how hard a full tilt pulls
const FRICTION = 0.98; // 1 = rolls forever, lower = stops sooner
const BOUNCE = 0.6; // speed kept after hitting a wall
const RADIUS = 30; // px

export default function TiltScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tilt = useRef({ x: 0, y: 0 }); // last tilt from the phone, -1..1
  const [phonePath, setPhonePath] = useState("");

  const onMessage = useCallback((type: string, data: unknown) => {
    if (type === "tilt") tilt.current = data as { x: number; y: number };
  }, []);

  const { connected, status } = useSocket("tilt", onMessage);

  useEffect(() => {
    setPhonePath(window.location.pathname.replace(/\/screen$/, "/mobile"));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    const ball = { x: window.innerWidth / 2, y: window.innerHeight / 2, vx: 0, vy: 0 };
    let frame = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      const { width, height } = canvas;

      // Tilt is the acceleration, not the position: the ball speeds up while the phone leans.
      ball.vx = (ball.vx + tilt.current.x * GRAVITY) * FRICTION;
      ball.vy = (ball.vy + tilt.current.y * GRAVITY) * FRICTION;
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Walls: put the ball back inside and reverse its speed.
      if (ball.x < RADIUS || ball.x > width - RADIUS) {
        ball.x = Math.max(RADIUS, Math.min(width - RADIUS, ball.x));
        ball.vx *= -BOUNCE;
      }
      if (ball.y < RADIUS || ball.y > height - RADIUS) {
        ball.y = Math.max(RADIUS, Math.min(height - RADIUS, ball.y));
        ball.vy *= -BOUNCE;
      }

      context.fillStyle = "rgba(0, 0, 0, 0.2)"; // a see-through layer: the ball leaves a short trail
      context.fillRect(0, 0, width, height);
      context.fillStyle = "white";
      context.beginPath();
      context.arc(ball.x, ball.y, RADIUS, 0, Math.PI * 2);
      context.fill();

      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <p className={styles.status}>
        {connected ? "connected" : status} · open{" "}
        <a href={phonePath} target="_blank" className={styles.link}>
          {phonePath}
        </a>{" "}
        on a phone
      </p>
    </main>
  );
}
