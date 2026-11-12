"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/shared/useSocket";
import { HEADLINES, STOCKS } from "./market";
import styles from "./page.module.css";

// A trading terminal for a market that does not exist. The mobile sends one number, sentiment
// (-1..+1). Every stock takes a random step ten times a second; sentiment tilts all the steps.
const TICK = 100; // ms between two price updates
const PULL = 0.0022; // how far full sentiment moves a stock of beta 1, per tick
const NOISE = 0.0018; // size of the random part of every step
const CALM = 0.985; // after the finger lifts, sentiment keeps this much per tick
const HISTORY = 600; // index values kept for the chart (one minute)
const NEWS_EVERY = 2500; // ms between two headlines

type Row = { price: number; change: number; flash: number }; // change: since the open, as a fraction. flash: +1 / -1 / 0 this tick

export default function MarketScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef(0); // sentiment asked for by the mobile
  const held = useRef(false); // is a finger on the mobile right now?
  const [rows, setRows] = useState<Row[]>(() => STOCKS.map((stock) => ({ price: stock.price, change: 0, flash: 0 })));
  const [index, setIndex] = useState({ value: 1000, change: 0 });
  const [mood, setMood] = useState(0);
  const [news, setNews] = useState<{ time: string; text: string }[]>([]);
  const [phonePath, setPhonePath] = useState("");

  const onMessage = useCallback((type: string, data: unknown) => {
    if (type === "sentiment") {
      target.current = data as number;
      held.current = true;
    }
    if (type === "release") held.current = false;
  }, []);

  const { connected, status } = useSocket("market", onMessage);

  useEffect(() => {
    setPhonePath(window.location.pathname.replace(/\/screen$/, "/mobile"));
    const prices = STOCKS.map((stock) => stock.price);
    const history: number[] = [1000];
    let sentiment = 0;

    const market = setInterval(() => {
      // 1. The mood: follow the finger, or drift back to zero once it has lifted.
      if (!held.current) target.current *= CALM;
      sentiment += (target.current - sentiment) * 0.15;

      // 2. Every stock: a step that is partly the mood (times its beta), partly chance.
      const next = STOCKS.map((stock, i) => {
        const step = sentiment * PULL * stock.beta + (Math.random() - 0.5) * 2 * NOISE * (1 + Math.abs(sentiment));
        const before = prices[i];
        prices[i] = Math.max(1, before * (1 + step));
        return { price: prices[i], change: prices[i] / stock.price - 1, flash: Math.sign(Math.round(prices[i] / 10) - Math.round(before / 10)) };
      });

      // 3. The index: the average of all changes, starting at 1000.
      const value = 1000 * (1 + next.reduce((sum, row) => sum + row.change, 0) / next.length);
      history.push(value);
      if (history.length > HISTORY) history.shift();

      setRows(next);
      setIndex({ value, change: value / 1000 - 1 });
      setMood(sentiment);
      drawChart(canvasRef.current!, history);
    }, TICK);

    // The newswire: a headline that fits the mood.
    const wire = setInterval(() => {
      const list = sentiment > 0.25 ? HEADLINES.up : sentiment < -0.25 ? HEADLINES.down : HEADLINES.flat;
      const text = list[Math.floor(Math.random() * list.length)];
      const time = new Date().toLocaleTimeString("en-GB");
      setNews((lines) => [{ time, text }, ...lines].slice(0, 5));
    }, NEWS_EVERY);

    return () => {
      clearInterval(market);
      clearInterval(wire);
    };
  }, []);

  const colour = (value: number) => (value > 0 ? styles.up : value < 0 ? styles.down : undefined);
  const signed = (value: number) => `${value >= 0 ? "+" : ""}${(value * 100).toFixed(2)}%`;

  return (
    <main className={styles.terminal}>
      <header className={styles.header}>
        <span className={styles.name}>XDX COMPOSITE</span>
        <span className={styles.last}>{index.value.toFixed(2)}</span>
        <span className={colour(index.change)}>{signed(index.change)}</span>
        <span className={styles.mood}>
          SENTIMENT <b className={colour(mood)}>{mood >= 0 ? "+" : ""}{mood.toFixed(2)}</b>
        </span>
        <span className={styles.link}>
          {connected ? "LIVE" : status} · <a href={phonePath} target="_blank">{phonePath}</a>
        </span>
      </header>

      <section className={styles.chart}>
        <canvas ref={canvasRef} />
      </section>

      <section className={styles.board}>
        <div className={`${styles.row} ${styles.head}`}>
          <span>TICKER</span>
          <span>NAME</span>
          <span>LAST</span>
          <span>%CHG</span>
        </div>
        {STOCKS.map((stock, i) => (
          <div key={stock.ticker} className={styles.row}>
            <span className={styles.ticker}>{stock.ticker}</span>
            <span className={styles.company}>{stock.name}</span>
            <span className={rows[i].flash > 0 ? styles.flashUp : rows[i].flash < 0 ? styles.flashDown : undefined}>{Math.round(rows[i].price).toLocaleString("en-US")}</span>
            <span className={colour(rows[i].change)}>{signed(rows[i].change)}</span>
          </div>
        ))}
      </section>

      <section className={styles.news}>
        {news.map((line, i) => (
          <p key={line.time + line.text + i}>
            <span>{line.time}</span> {line.text}
          </p>
        ))}
      </section>
    </main>
  );
}

// The index as a line: the last minute, scaled to fit, green above the open and red below it.
function drawChart(canvas: HTMLCanvasElement, history: number[]) {
  const dpr = window.devicePixelRatio;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }
  const context = canvas.getContext("2d")!;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);

  const low = Math.min(...history, 995);
  const high = Math.max(...history, 1005);
  const y = (value: number) => height - 12 - ((value - low) / (high - low)) * (height - 24);

  // The open (1000), as a dotted line.
  context.strokeStyle = "#444";
  context.setLineDash([2, 4]);
  context.beginPath();
  context.moveTo(0, y(1000));
  context.lineTo(width, y(1000));
  context.stroke();
  context.setLineDash([]);

  context.strokeStyle = history[history.length - 1] >= 1000 ? "#30d158" : "#ff453a";
  context.lineWidth = 2;
  context.beginPath();
  history.forEach((value, i) => {
    const x = (i / (HISTORY - 1)) * width;
    if (i === 0) context.moveTo(x, y(value));
    else context.lineTo(x, y(value));
  });
  context.stroke();
}
