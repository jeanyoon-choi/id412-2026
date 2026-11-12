"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

// Describe a mood or a scene; the model answers with numbers, and the numbers drive the canvas.
// The LLM is not the output here: it is the "parameter conversion" step.
type Parameters = { hue: number; spread: number; count: number; size: number; speed: number; wobble: number; title: string };

const START: Parameters = { hue: 210, spread: 30, count: 60, size: 20, speed: 0.2, wobble: 0.2, title: "waiting room" };
const EASE = 0.03; // how fast the picture moves toward new parameters
const MAX_COUNT = 300;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function LlmParameters() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef(START); // the latest parameters from the model
  const [parameters, setParameters] = useState(START); // the same, for showing on the page
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState("");

  async function ask(event: React.FormEvent) {
    event.preventDefault();
    if (!prompt.trim()) return;
    setStatus("asking…");

    const response = await fetch("/api/llm-parameters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();
    if (data.error) return setStatus(`Error: ${data.error}`);

    // Never trust numbers from outside: keep each one inside its range.
    const p = data.parameters as Parameters;
    const safe = {
      hue: clamp(p.hue, 0, 360),
      spread: clamp(p.spread, 0, 180),
      count: clamp(Math.round(p.count), 5, MAX_COUNT),
      size: clamp(p.size, 2, 120),
      speed: clamp(p.speed, 0, 1),
      wobble: clamp(p.wobble, 0, 1),
      title: p.title,
    };
    target.current = safe;
    setParameters(safe);
    setStatus("");
    setPrompt("");
  }

  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    const current = { ...START }; // eased parameters, what is actually drawn
    // Every circle: a position (0..1), a direction, and its own random number.
    const circles = Array.from({ length: MAX_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      angle: Math.random() * Math.PI * 2,
      seed: Math.random(),
    }));
    let frame = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      const { width, height } = canvas;
      const goal = target.current;

      // Glide toward the new parameters instead of jumping.
      current.hue += (goal.hue - current.hue) * EASE;
      current.spread += (goal.spread - current.spread) * EASE;
      current.count += (goal.count - current.count) * EASE;
      current.size += (goal.size - current.size) * EASE;
      current.speed += (goal.speed - current.speed) * EASE;
      current.wobble += (goal.wobble - current.wobble) * EASE;

      // A see-through black layer instead of a full clear: circles leave short trails.
      context.fillStyle = "rgba(0, 0, 0, 0.12)";
      context.fillRect(0, 0, width, height);

      for (let i = 0; i < current.count; i++) {
        const circle = circles[i];
        circle.angle += (Math.random() - 0.5) * current.wobble; // wobble = how much it changes direction
        circle.x = (circle.x + Math.cos(circle.angle) * current.speed * 0.01 + 1) % 1; // wrap around the edges
        circle.y = (circle.y + Math.sin(circle.angle) * current.speed * 0.01 + 1) % 1;

        const hue = current.hue + (circle.seed - 0.5) * 2 * current.spread;
        context.fillStyle = `hsla(${hue}, 80%, 60%, 0.7)`;
        context.beginPath();
        context.arc(circle.x * width, circle.y * height, current.size * (0.4 + circle.seed), 0, Math.PI * 2);
        context.fill();
      }
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
      {/* What the model sent back, as it is */}
      <pre className={styles.parameters}>{JSON.stringify(parameters, null, 2)}</pre>
      <form className={styles.form} onSubmit={ask}>
        <input
          className={styles.input}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="a mood, a place, a scene… press Enter"
          autoFocus
        />
        <span className={styles.status}>{status}</span>
      </form>
    </main>
  );
}
