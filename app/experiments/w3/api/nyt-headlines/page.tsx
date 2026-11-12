"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

// Today's New York Times front page, one headline at a time, as large as the screen allows.
// The page calls our own Route Handler (app/api/nyt-headlines/route.ts), which holds the key.
const INTERVAL = 4000; // ms each headline stays

type Headline = { title: string; section: string };

export default function NytHeadlines() {
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState("");

  // Once, on load: get the headlines.
  useEffect(() => {
    async function load() {
      const response = await fetch("/api/nyt-headlines");
      const data = await response.json();
      if (data.error) setError(data.error);
      else setHeadlines(data.headlines);
    }
    load();
  }, []);

  // Then: the next headline every INTERVAL ms.
  useEffect(() => {
    if (headlines.length === 0) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % headlines.length), INTERVAL);
    return () => clearInterval(timer);
  }, [headlines]);

  const headline = headlines[index];

  return (
    <main className={styles.container}>
      {error && <p className={styles.error}>Error: {error}</p>}
      {headline && (
        // key: a new headline is a new element, so the fade-in animation plays again
        <div key={index} className={styles.headline}>
          <p className={styles.section}>
            {headline.section} · {index + 1} / {headlines.length}
          </p>
          <h1 className={styles.title}>{headline.title}</h1>
        </div>
      )}
    </main>
  );
}
