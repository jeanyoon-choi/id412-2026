"use client";

import { useState } from "react";
import { useSocket } from "@/hooks/shared/useSocket";
import styles from "./page.module.css";

// The phone only sends words. It does not call the LLM: the screen does.
export default function PhoneToScreenMobile() {
  const { send, connected, status } = useSocket("llm-phone-to-screen");
  const [text, setText] = useState("");
  const [sent, setSent] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    send("prompt", text); // discrete: one message per sentence
    setSent(text);
    setText("");
  }

  return (
    <main className={styles.container}>
      <p className={styles.status}>{connected ? "connected · say something to the room" : status}</p>
      <form className={styles.form} onSubmit={submit}>
        <input className={styles.input} value={text} onChange={(event) => setText(event.target.value)} placeholder="type here" />
        <button className={styles.button}>send</button>
      </form>
      {sent && <p className={styles.sent}>sent: {sent}</p>}
    </main>
  );
}
