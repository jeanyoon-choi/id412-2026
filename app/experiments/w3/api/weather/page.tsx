"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

// The weather right now, somewhere on Earth, as a field of wind.
// Data: Open-Meteo, a free weather API that needs no key, so the page can call it directly.
const CITIES = [
  { name: "Daejeon", latitude: 36.37, longitude: 127.36 },
  { name: "Reykjavik", latitude: 64.15, longitude: -21.94 },
  { name: "Dubai", latitude: 25.2, longitude: 55.27 },
  { name: "Wellington", latitude: -41.29, longitude: 174.78 },
];
const STREAKS = 400; // number of wind streaks

type Weather = { temperature: number; windSpeed: number; windDirection: number; cloudCover: number };
const CALM: Weather = { temperature: 15, windSpeed: 0, windDirection: 0, cloudCover: 0 };

export default function WeatherField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const weatherRef = useRef(CALM); // the latest weather, read by the draw loop
  const [city, setCity] = useState(CITIES[0]);
  const [weather, setWeather] = useState<Weather | null>(null); // the same, for the text on the page
  const [error, setError] = useState("");

  // Ask the API whenever the city changes.
  useEffect(() => {
    let cancelled = false; // a slow answer for the previous city must not overwrite the new one
    async function load() {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}` +
        "&current=temperature_2m,wind_speed_10m,wind_direction_10m,cloud_cover";
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (cancelled) return;
        const now = {
          temperature: data.current.temperature_2m, // °C
          windSpeed: data.current.wind_speed_10m, // km/h
          windDirection: data.current.wind_direction_10m, // degrees, where the wind comes FROM (0 = north)
          cloudCover: data.current.cloud_cover, // %
        };
        weatherRef.current = now;
        setWeather(now);
        setError("");
      } catch {
        if (!cancelled) setError("could not reach api.open-meteo.com");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [city]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    const streaks = Array.from({ length: STREAKS }, () => ({ x: Math.random(), y: Math.random(), seed: Math.random() }));
    let frame = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      const { width, height } = canvas;
      const now = weatherRef.current;

      // Parameters from the data:
      const hue = 240 - Math.max(0, Math.min(40, now.temperature + 5)) * 6; // -5 °C blue → 35 °C red
      const speed = now.windSpeed / 2000; // screen widths per frame
      const heading = ((now.windDirection + 180) * Math.PI) / 180; // where the wind blows TO
      const visible = 1 - (now.cloudCover / 100) * 0.7; // more cloud, fainter streaks

      context.fillStyle = "rgba(0, 0, 0, 0.1)"; // see-through black: streaks leave trails
      context.fillRect(0, 0, width, height);
      context.lineWidth = 2;

      for (const streak of streaks) {
        const step = speed * (0.5 + streak.seed);
        const nextX = streak.x + Math.sin(heading) * step; // heading 0 = north = up the screen
        const nextY = streak.y - Math.cos(heading) * step;
        context.strokeStyle = `hsla(${hue}, 80%, 65%, ${visible})`;
        context.beginPath();
        context.moveTo(streak.x * width, streak.y * height);
        context.lineTo(nextX * width, nextY * height);
        context.stroke();
        // Leaving the screen: come back at a random place.
        const outside = nextX < 0 || nextX > 1 || nextY < 0 || nextY > 1;
        streak.x = outside ? Math.random() : nextX;
        streak.y = outside ? Math.random() : nextY;
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
      <p className={styles.readout}>
        {error || (weather ? `${city.name} · ${weather.temperature} °C · wind ${weather.windSpeed} km/h from ${weather.windDirection}° · cloud ${weather.cloudCover} %` : "loading…")}
      </p>
      <div className={styles.cities}>
        {CITIES.map((option) => (
          <button key={option.name} className={option === city ? styles.active : styles.city} onClick={() => setCity(option)}>
            {option.name}
          </button>
        ))}
      </div>
    </main>
  );
}
