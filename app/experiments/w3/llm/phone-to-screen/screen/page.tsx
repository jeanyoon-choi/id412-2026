"use client";

import { useCallback, useEffect, useState } from "react";
import { useSocket } from "@/hooks/shared/useSocket";
import styles from "./page.module.css";

// The screen receives a sentence from the phone, asks the LLM (through our Route Handler),
// and shows the answer. Phone → socket → screen → API → screen.
export default function PhoneToScreenScreen() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("The room is listening.");
  const [waiting, setWaiting] = useState(false);
  const [phonePath, setPhonePath] = useState("");

  const onMessage = useCallback(async (type: string, data: unknown) => {
    if (type !== "prompt") return;
    setPrompt(data as string);
    setWaiting(true);

    const response = await fetch("/api/llm-phone-to-screen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: data }),
    });
    const result = await response.json();

    setAnswer(result.text ?? `Error: ${result.error}`);
    setWaiting(false);
  }, []);

  const { connected, status } = useSocket("llm-phone-to-screen", onMessage);

  useEffect(() => {
    setPhonePath(window.location.pathname.replace(/\/screen$/, "/mobile"));
  }, []);

  return (
    <main className={styles.container}>
      <p className={styles.prompt}>{prompt && `“${prompt}”`}</p>
      <p className={waiting ? `${styles.answer} ${styles.waiting}` : styles.answer}>{answer}</p>
      <p className={styles.status}>
        {connected ? "connected" : status} · open{" "}
        <a href={phonePath} target="_blank" className={styles.link}>
          {phonePath}
        </a>
      </p>
    </main>
  );
}
