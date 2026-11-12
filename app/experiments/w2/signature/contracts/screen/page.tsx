"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSocket } from "@/hooks/shared/useSocket";
import { Document, type Ink } from "./Document";
import { DOCUMENTS } from "./documents";
import styles from "./page.module.css";

// One signature from the phone. First it is shown as it is. Then it signs 40 documents, faster and faster.
const ALONE = 2800; // ms the signature is shown by itself
const FIRST = 1100; // ms the first document stays
const FASTER = 0.9; // each document stays this fraction of the one before
const FASTEST = 170; // ms, no document goes by quicker than this

type Stroke = [number, number][];

// Strokes (lists of points) → one SVG path, and the box that just fits it.
function toInk(strokes: Stroke[]): Ink {
  const points = strokes.flat();
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  const width = Math.max(...xs) - left || 0.01;
  const height = Math.max(...ys) - top || 0.01;
  const margin = Math.max(width, height) * 0.08;
  const path = strokes.map((stroke) => stroke.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ")).join(" ");
  return { path, viewBox: `${left - margin} ${top - margin} ${width + margin * 2} ${height + margin * 2}` };
}

export default function SignatureContractsScreen() {
  const [strokes, setStrokes] = useState<Stroke[] | null>(null);
  // step: -1 waiting · 0 the signature alone · 1..40 the documents · 41 all of them at once
  const [step, setStep] = useState(-1);
  const [phonePath, setPhonePath] = useState("");
  const ink = useMemo(() => (strokes ? toInk(strokes) : null), [strokes]);

  const onMessage = useCallback((type: string, data: unknown) => {
    if (type !== "signature") return;
    setStrokes(data as Stroke[]);
    setStep(0); // a new signature starts the whole sequence again
  }, []);

  const { connected, status } = useSocket("signature-contracts", onMessage);

  useEffect(() => {
    setPhonePath(window.location.pathname.replace(/\/screen$/, "/mobile"));
  }, []);

  // How long the current step stays on screen.
  const stay = step === 0 ? ALONE : Math.max(FASTEST, FIRST * Math.pow(FASTER, step - 1));

  // Move to the next step when the time is up.
  useEffect(() => {
    if (step < 0 || step > DOCUMENTS.length) return;
    const timer = setTimeout(() => setStep(step + 1), stay);
    return () => clearTimeout(timer);
  }, [step, stay]);

  return (
    <main className={styles.container}>
      {step === -1 && (
        <p className={styles.status}>
          {connected ? "connected · waiting for a signature" : status} · open{" "}
          <a href={phonePath} target="_blank" className={styles.link}>
            {phonePath}
          </a>
        </p>
      )}

      {/* 0: the signature, as it was written */}
      {step === 0 && ink && (
        <svg viewBox={ink.viewBox} className={styles.alone}>
          <path d={ink.path} pathLength={1} className={styles.ink} style={{ animationDuration: "1.6s" }} />
        </svg>
      )}

      {/* 1..40: one document at a time. key = a new element each time, so the animations restart. */}
      {step >= 1 && step <= DOCUMENTS.length && ink && (
        <>
          <div key={step} className={styles.stage} style={{ rotate: `${((step * 37) % 5) - 2}deg` }}>
            <Document doc={DOCUMENTS[step - 1]} ink={ink} number={step} seconds={(stay / 1000) * 0.6} />
          </div>
          <p className={styles.counter}>
            {step} / {DOCUMENTS.length}
          </p>
        </>
      )}

      {/* 41: everything you signed */}
      {step > DOCUMENTS.length && ink && (
        <div className={styles.wall}>
          {DOCUMENTS.map((doc, index) => (
            <Document key={doc.title} doc={doc} ink={ink} number={index + 1} seconds={0.01} />
          ))}
        </div>
      )}
    </main>
  );
}
