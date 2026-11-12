"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";

// The artwork. It is drawn in wall pixels: the two walls together are one strip of 3595 × 602.
// The left projector shows x = 0..1920, the right one x = 1920..3595.
// Replace draw() with your own piece; keep the idea: size from the container, never from the window.
const WALL = { left: { x: 0, width: 1920 }, right: { x: 1920, width: 1675 } };
const TOTAL_WIDTH = 3595;
const HEIGHT = 602;
const SPEED = 300; // wall px per second

export function Content({ side }: { side: "left" | "right" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    const wall = WALL[side];
    canvas.width = wall.width; // the canvas is always in wall pixels; CSS stretches it to the frame
    canvas.height = HEIGHT;
    let frame = 0;

    function draw() {
      context.fillStyle = "#111";
      context.fillRect(0, 0, wall.width, HEIGHT);

      // Everything below is drawn in strip coordinates, shifted so this wall's part is visible.
      context.save();
      context.translate(-wall.x, 0);

      // A grid every 100 px, with its x position written on it: check where the walls meet.
      context.strokeStyle = "#555";
      context.fillStyle = "#999";
      context.font = "20px ui-monospace, Menlo, monospace";
      for (let x = 0; x <= TOTAL_WIDTH; x += 100) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, HEIGHT);
        context.stroke();
        context.fillText(String(x), x + 6, 24);
      }

      // A ball crossing the whole strip. Its position comes from the clock,
      // so two laptops show the same ball without talking to each other.
      const x = ((Date.now() / 1000) * SPEED) % TOTAL_WIDTH;
      context.fillStyle = "white";
      context.beginPath();
      context.arc(x, HEIGHT / 2, 80, 0, Math.PI * 2);
      context.fill();

      context.restore();

      // The border of this wall: it should sit exactly on the wall's edges.
      context.strokeStyle = "white";
      context.lineWidth = 6;
      context.strokeRect(3, 3, wall.width - 6, HEIGHT - 6);

      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(frame);
  }, [side]);

  return <canvas ref={canvasRef} className={styles.content} />;
}
