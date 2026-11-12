"use client";

import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/shared/useSocket";
import styles from "./page.module.css";

// The phone is a tilt sensor. Its angles go to the screen about 30 times a second.
// The sensor only works over https (pnpm dev:mobile), and iOS asks for permission after a tap.
const SEND_INTERVAL = 33; // ms

// iOS adds requestPermission() to the event class; TypeScript does not know it.
type OrientationEventClass = { requestPermission?: () => Promise<"granted" | "denied"> };

export default function TiltMobile() {
  const { send, connected, status: socketStatus } = useSocket("tilt");
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState("");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const lastSent = useRef(0);

  async function start() {
    const eventClass = window.DeviceOrientationEvent as unknown as OrientationEventClass | undefined;
    if (!eventClass) return setStatus(window.isSecureContext ? "no tilt sensor here" : "tilt needs https (pnpm dev:mobile)");
    // iOS: the permission pop-up only opens inside a tap handler. Android has no pop-up.
    if (eventClass.requestPermission) {
      const answer = await eventClass.requestPermission();
      if (answer !== "granted") return setStatus("permission denied");
    }
    setStarted(true);
  }

  useEffect(() => {
    if (!started) return;

    function handleOrientation(event: DeviceOrientationEvent) {
      // gamma: left/right tilt, -90..90°. beta: front/back tilt, -180..180°.
      // Both become -1..1, where ±45° is the full range.
      const x = Math.max(-1, Math.min(1, (event.gamma ?? 0) / 45));
      const y = Math.max(-1, Math.min(1, (event.beta ?? 0) / 45));
      setTilt({ x, y });

      const now = performance.now();
      if (now - lastSent.current < SEND_INTERVAL) return;
      lastSent.current = now;
      send("tilt", { x, y }); // continuous
    }

    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [started, send]);

  return (
    <main className={styles.container}>
      <p className={styles.status}>
        {connected ? "connected" : socketStatus} {status && `· ${status}`}
      </p>
      {started ? (
        <p className={styles.values}>
          x {tilt.x.toFixed(2)}
          <br />y {tilt.y.toFixed(2)}
        </p>
      ) : (
        <button className={styles.button} onClick={start}>
          start tilt
        </button>
      )}
    </main>
  );
}
