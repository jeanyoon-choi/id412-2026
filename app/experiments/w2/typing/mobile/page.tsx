"use client";

import { useState } from "react";
import { useSocket } from "@/hooks/shared/useSocket";
import styles from "./page.module.css";

// A message composer and nothing else. Every key press is sent ("typing"),
// and the arrow sends the sentence ("message").
export default function TypingMobile() {
  const { send, connected, status } = useSocket("typing");
  const [text, setText] = useState("");
  const [sent, setSent] = useState<string[]>([]); // what you have said so far

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setText(event.target.value);
    send("typing", event.target.value); // continuous: the draft, letter by letter
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    send("message", text); // discrete: the finished sentence
    send("typing", "");
    setSent([...sent, text]);
    setText("");
  }

  return (
    <main className={styles.container}>
      <div className={styles.thread}>
        {!connected && <p className={styles.problem}>{status}</p>}
        {sent.map((line, index) => (
          <p key={index} className={styles.bubble}>
            {line}
          </p>
        ))}
      </div>
      <form className={styles.composer} onSubmit={submit}>
        <input className={styles.input} value={text} onChange={handleChange} placeholder="Message" autoFocus enterKeyHint="send" />
        <button className={styles.send} disabled={!text.trim()} aria-label="Send">
          ↑
        </button>
      </form>
    </main>
  );
}
