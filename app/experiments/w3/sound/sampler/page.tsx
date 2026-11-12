"use client";

import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import styles from "./page.module.css";

// Four recorded sounds on four pads. A sample is a sound file; Tone.Players loads them and plays them.
// Where you press in a pad sets the speed: higher in the pad = faster and higher in pitch.
// Three pads play once per press. The last one loops until you press it again.
const FOLDER = "/experiments/w3/sound/sampler";
const PADS = [
  { name: "bell", loop: false },
  { name: "wood", loop: false },
  { name: "string", loop: false },
  { name: "breath", loop: true },
];

export default function Sampler() {
  const players = useRef<Tone.Players | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState<Record<string, number>>({}); // pad name → the speed it was started at

  // Load the four files once. The second argument is called when all of them are in memory.
  useEffect(() => {
    const urls = Object.fromEntries(PADS.map((pad) => [pad.name, `${FOLDER}/${pad.name}.wav`]));
    const loaded = new Tone.Players(urls, () => setReady(true)).toDestination();
    players.current = loaded;
    return () => {
      loaded.dispose();
    };
  }, []);

  async function handleDown(event: React.PointerEvent<HTMLButtonElement>, pad: (typeof PADS)[number]) {
    // Height of the press in the pad, 0 (bottom) .. 1 (top). Read it first: after an `await` the event is gone.
    const box = event.currentTarget.getBoundingClientRect();
    const height = 1 - (event.clientY - box.top) / box.height;

    await Tone.start(); // audio may only start inside a tap or click
    if (!ready || !players.current) return;
    const player = players.current.player(pad.name);

    // A looping pad that is on: this press turns it off.
    if (pad.loop && player.state === "started") {
      player.stop();
      return setPlaying((old) => ({ ...old, [pad.name]: 0 }));
    }

    // Height → speed 0.5× .. 2×. Half speed is one octave down.
    const speed = Math.pow(2, height * 2 - 1);

    player.loop = pad.loop;
    player.playbackRate = speed;
    player.start(); // a pad that is still sounding starts again from the beginning
    setPlaying((old) => ({ ...old, [pad.name]: speed }));
    // A one-shot pad lights up for as long as the file lasts at this speed.
    if (!pad.loop) setTimeout(() => setPlaying((old) => (old[pad.name] === speed ? { ...old, [pad.name]: 0 } : old)), (player.buffer.duration / speed) * 1000);
  }

  return (
    <main className={styles.container}>
      {PADS.map((pad) => (
        <button key={pad.name} className={playing[pad.name] ? styles.sounding : styles.pad} onPointerDown={(event) => handleDown(event, pad)}>
          <span>
            {pad.name}
            {pad.loop && " · loop"}
          </span>
          <span>{playing[pad.name] ? `${playing[pad.name].toFixed(2)}×` : ready ? "" : "loading…"}</span>
        </button>
      ))}
    </main>
  );
}
