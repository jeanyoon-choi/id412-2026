"use client";

import { useEffect, useRef } from "react";
import * as Tone from "tone";
import styles from "./page.module.css";

// Sound that comes from a system, not from a finger. Click drops a ball; after that the balls play.
// Two kinds of sound from the same simulation:
// discrete — every bounce is one event → one note.  continuous — how much is moving → how bright the hum is.
const GRAVITY = 1400; // px per second²
const BOUNCE = 0.78; // part of the speed a ball keeps after a bounce
const QUIET = 80; // px per second: a slower hit makes no note
const NOTES = [523.25, 440, 392, 329.63, 293.66, 261.63, 220, 196]; // Hz, C major pentatonic, high → low

type Ball = { x: number; y: number; vx: number; vy: number; radius: number; note: number };

// The instrument. Notes: a small bell for the events. Hum: one low tone through a filter that opens and closes.
function build() {
  const notes = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.002, decay: 0.3, sustain: 0, release: 0.3 },
  }).toDestination();
  const level = new Tone.Gain(0).toDestination();
  const tone = new Tone.Filter(120, "lowpass").connect(level);
  new Tone.Oscillator(55, "sawtooth").connect(tone).start();
  return { notes, level, tone };
}

export default function Bounce() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const balls = useRef<Ball[]>([]);
  const sound = useRef<ReturnType<typeof build> | null>(null);

  async function handleDown(event: React.PointerEvent) {
    await Tone.start(); // audio may only start inside a tap or click
    if (!sound.current) sound.current = build();
    // A larger ball plays a lower note.
    const note = Math.floor(Math.random() * NOTES.length);
    balls.current.push({ x: event.clientX, y: event.clientY, vx: Math.random() * 400 - 200, vy: 0, radius: 6 + note * 3, note });
  }

  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    let frame = 0;
    let last = performance.now();

    function resize() {
      const dpr = window.devicePixelRatio;
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    // Discrete: one bounce → one note. A harder hit is louder.
    function hit(ball: Ball, speed: number) {
      if (speed < QUIET) return;
      sound.current?.notes.triggerAttackRelease(NOTES[ball.note], 0.2, undefined, Math.min(1, speed / 1200));
    }

    function draw(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      let moving = 0; // the speed of all balls together

      for (const ball of balls.current) {
        ball.vy += GRAVITY * dt;
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        // The floor and the two walls: turn round, keep BOUNCE of the speed, make a sound.
        if (ball.y > innerHeight - ball.radius && ball.vy > 0) {
          ball.y = innerHeight - ball.radius;
          hit(ball, ball.vy);
          ball.vy *= -BOUNCE;
          ball.vx *= 0.98;
        }
        if ((ball.x < ball.radius && ball.vx < 0) || (ball.x > innerWidth - ball.radius && ball.vx > 0)) {
          hit(ball, Math.abs(ball.vx));
          ball.vx *= -BOUNCE;
        }
        moving += Math.hypot(ball.vx, ball.vy);
      }
      // A ball that lies still on the floor is gone.
      balls.current = balls.current.filter((ball) => ball.y < innerHeight - ball.radius - 1 || Math.abs(ball.vy) > QUIET / 2);

      // Continuous: the more movement, the louder and brighter the hum. Set every frame, so it glides.
      const energy = Math.min(1, moving / 6000);
      sound.current?.level.gain.rampTo(energy * 0.35, 0.1);
      sound.current?.tone.frequency.rampTo(120 + energy * 2400, 0.1);

      context.clearRect(0, 0, innerWidth, innerHeight);
      context.fillStyle = "white";
      for (const ball of balls.current) {
        context.beginPath();
        context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        context.fill();
      }
      // The hum, drawn: a line along the floor, as long as the energy.
      context.fillRect(0, innerHeight - 1, innerWidth * energy, 1);

      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main className={styles.container} onPointerDown={handleDown}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <p className={styles.hint}>click to drop a ball · a bounce is a note · the hum is how much is moving</p>
    </main>
  );
}
