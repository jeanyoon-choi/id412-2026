"use client";

import { useState } from "react";
import styles from "./page.module.css";

// Prompt in, text out. The page never talks to the model directly:
// it calls our own Route Handler (app/api/llm-text/route.ts), which holds the key.
export default function LlmText() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("Ask something.");
  const [waiting, setWaiting] = useState(false);

  async function ask(event: React.FormEvent) {
    event.preventDefault();
    if (!prompt.trim() || waiting) return;
    setWaiting(true);

    const response = await fetch("/api/llm-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();

    setAnswer(data.text ?? `Error: ${data.error}`);
    setPrompt("");
    setWaiting(false);
  }

  return (
    <main className={styles.container}>
      <p className={waiting ? `${styles.answer} ${styles.waiting}` : styles.answer}>{answer}</p>
      <form className={styles.form} onSubmit={ask}>
        <input
          className={styles.input}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="type a prompt, press Enter"
          autoFocus
        />
      </form>
    </main>
  );
}
