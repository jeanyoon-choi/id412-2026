"use client";

import { useRef, useState } from "react";
import * as Tone from "tone";
import styles from "./page.module.css";

// The weather of a place, right now, as a sound that never stops. Data → parameters → sound.
// Nothing is triggered: four numbers hold four continuous layers where they are.
const GLIDE = 4; // seconds, how slowly the sound moves to a new place

const PLACES = [
  { name: "Daejeon", latitude: 36.35, longitude: 127.38 },
  { name: "Reykjavík", latitude: 64.15, longitude: -21.94 },
  { name: "Singapore", latitude: 1.35, longitude: 103.82 },
  { name: "Cairo", latitude: 30.04, longitude: 31.24 },
  { name: "Ushuaia", latitude: -54.8, longitude: -68.3 },
];

type Weather = { temperature: number; wind: number; rain: number; cloud: number };

// value → 0..1 between low and high
function scale(value: number, low: number, high: number) {
  return Math.max(0, Math.min(1, (value - low) / (high - low)));
}

// The instrument: three layers into one filter into the speakers.
function build() {
  const sky = new Tone.Filter(8000, "lowpass").toDestination();

  // Air: two sine waves, a fifth apart.
  const air = new Tone.Gain(0.25).connect(sky);
  const root = new Tone.Oscillator(110, "sine").connect(air).start();
  const fifth = new Tone.Oscillator(165, "sine").connect(air).start();

  // Wind: pink noise through a filter that sweeps slowly up and down (the gusts).
  const windLevel = new Tone.Gain(0).connect(sky);
  const windTone = new Tone.Filter(600, "bandpass").connect(windLevel);
  new Tone.Noise("pink").connect(windTone).start();
  new Tone.LFO(0.13, 300, 1100).connect(windTone.frequency).start();

  // Rain: the highest part of white noise.
  const rainLevel = new Tone.Gain(0).connect(sky);
  const rainTone = new Tone.Filter(5000, "highpass").connect(rainLevel);
  new Tone.Noise("white").connect(rainTone).start();

  return { sky, root, fifth, windLevel, rainLevel };
}

export default function WeatherSound() {
  const sound = useRef<ReturnType<typeof build> | null>(null);
  const [place, setPlace] = useState("");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState("");

  async function listen(target: (typeof PLACES)[number]) {
    await Tone.start(); // audio may only start inside a tap or click
    if (!sound.current) sound.current = build();
    setPlace(target.name);

    const response = await fetch("/api/weather", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(target),
    });
    const result = await response.json();
    if (result.error) return setError(result.error);
    setError("");
    setWeather(result);

    // The mapping. Each line: one number from the data → one parameter of the sound.
    const { sky, root, fifth, windLevel, rainLevel } = sound.current;
    const pitch = 55 * Math.pow(4, scale(result.temperature, -20, 40)); // −20 °C: 55 Hz … 40 °C: 220 Hz
    root.frequency.rampTo(pitch, GLIDE);
    fifth.frequency.rampTo(pitch * 1.5, GLIDE);
    windLevel.gain.rampTo(scale(result.wind, 0, 50) * 0.8, GLIDE); // 50 km/h: full
    rainLevel.gain.rampTo(scale(result.rain, 0, 2) * 0.3, GLIDE); // 2 mm: full
    sky.frequency.rampTo(8000 * Math.pow(0.08, scale(result.cloud, 0, 100)), GLIDE); // clear: 8000 Hz … overcast: 640 Hz
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.place}>{place || "Where?"}</h1>

      {weather && (
        <dl className={styles.mapping}>
          <dt>temperature</dt>
          <dd>{weather.temperature} °C</dd>
          <dd>pitch of the air</dd>
          <dt>wind</dt>
          <dd>{weather.wind} km/h</dd>
          <dd>loudness of the wind</dd>
          <dt>rain</dt>
          <dd>{weather.rain} mm</dd>
          <dd>loudness of the rain</dd>
          <dt>cloud</dt>
          <dd>{weather.cloud} %</dd>
          <dd>how muffled it all is</dd>
        </dl>
      )}
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.places}>
        {PLACES.map((target) => (
          <button key={target.name} className={target.name === place ? styles.chosen : styles.button} onClick={() => listen(target)}>
            {target.name}
          </button>
        ))}
      </div>
    </main>
  );
}
