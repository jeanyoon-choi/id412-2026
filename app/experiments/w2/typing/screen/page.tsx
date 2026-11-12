"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/shared/useSocket";
import { APPS, type Line } from "./apps";
import { Phone } from "./Phone";
import styles from "./page.module.css";

// Eight phones, eight chat apps. What is typed on the mobile is sent in all of them at once;
// then every room answers, from an LLM if there is a key, from a list of dummy answers if not.
const COLUMNS = 4;
const ROWS = 2;
const PHONE = { width: 390, height: 844 }; // an iPhone, in points
const SLOWEST = 3200; // ms, the latest an answer arrives

export default function TypingScreen() {
  const [threads, setThreads] = useState<Line[][]>(() => APPS.map((app) => app.before)); // one list of lines per phone
  const [waiting, setWaiting] = useState<boolean[]>(() => APPS.map(() => false)); // which rooms are "typing…"
  const [draft, setDraft] = useState(""); // what is being typed on the mobile right now
  const [zoom, setZoom] = useState(0.4);
  const [source, setSource] = useState(""); // where the last answers came from
  const [phonePath, setPhonePath] = useState("");
  const turn = useRef(0); // counts messages, to pick a different dummy answer and friend each time

  // Add one line to one phone.
  function add(phone: number, line: Line) {
    setThreads((all) => all.map((lines, index) => (index === phone ? [...lines, line] : lines)));
  }

  const onMessage = useCallback(async (type: string, data: unknown) => {
    if (type === "typing") setDraft(data as string);
    if (type !== "message") return;

    const text = data as string;
    const count = turn.current++;
    APPS.forEach((_, phone) => add(phone, { from: -1, text })); // the sentence, sent in every app
    setWaiting(APPS.map(() => true));

    // Ask our Route Handler for one answer per room. Any failure: the dummy answers.
    let replies: Record<string, string> = {};
    try {
      const response = await fetch("/api/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, rooms: APPS.map((app) => ({ app: app.id, persona: app.persona })) }),
      });
      const result = await response.json();
      if (result.replies) replies = Object.fromEntries(result.replies.map((reply: { app: string; text: string }) => [reply.app, reply.text]));
      setSource(result.replies ? "answers: LLM" : `answers: dummy (${result.error})`);
    } catch {
      setSource("answers: dummy");
    }

    // The rooms do not answer together: each one after its own delay.
    APPS.forEach((app, phone) => {
      const answer = replies[app.id] ?? app.dummies[count % app.dummies.length];
      setTimeout(() => {
        add(phone, { from: count % app.friends.length, text: answer });
        setWaiting((all) => all.map((value, index) => (index === phone ? false : value)));
      }, 500 + Math.random() * (SLOWEST - 500));
    });
  }, []);

  const { connected, status } = useSocket("typing", onMessage);

  useEffect(() => {
    setPhonePath(window.location.pathname.replace(/\/screen$/, "/mobile"));
    // The largest phone size that lets 4 × 2 of them fit the window.
    function fit() {
      setZoom(Math.min((window.innerWidth * 0.96) / COLUMNS / (PHONE.width + 24), (window.innerHeight * 0.92) / ROWS / (PHONE.height + 24)));
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <main className={styles.container}>
      <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${COLUMNS}, auto)` }}>
        {APPS.map((app, index) => (
          <Phone key={app.id} app={app} lines={threads[index]} draft={draft} waiting={waiting[index]} zoom={zoom} />
        ))}
      </div>
      <p className={styles.status}>
        {connected ? "connected" : status} · {source && `${source} · `}open{" "}
        <a href={phonePath} target="_blank" className={styles.link}>
          {phonePath}
        </a>
      </p>
    </main>
  );
}
