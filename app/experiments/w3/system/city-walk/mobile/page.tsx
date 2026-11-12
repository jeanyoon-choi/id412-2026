"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useSocket } from "@/hooks/shared/useSocket";
import { City } from "../common/City";
import { blocked, type Pose } from "../common/shibuya";
import { Sky } from "../common/Sky";
import { Figure, useWalkers } from "../common/Walkers";
import styles from "./page.module.css";

// The phone is one walker's eyes. Drag: up / down walks, left / right turns.
// Its pose goes to the room about 15 times a second, also while standing still.
const SPEED = 9; // m per second at full stick
const TURN = 1.6; // radians per second at full stick
const STICK = 70; // px of drag for full stick
const EYE = 1.7; // m, camera height
const SEND_INTERVAL = 66; // ms

type Stick = { x: number; y: number }; // −1..1

// Moves the camera with the stick and tells the room where we are.
function Player({ start, stick, send }: { start: Pose; stick: React.RefObject<Stick>; send: (type: string, data: unknown) => void }) {
  const pose = useRef({ ...start });
  const lastSent = useRef(0);

  useFrame(({ camera }, delta) => {
    const me = pose.current;
    me.yaw -= stick.current.x * TURN * delta;

    // Forward is where the camera looks: (−sin yaw, −cos yaw) on the ground.
    const step = -stick.current.y * SPEED * delta;
    const x = me.x - Math.sin(me.yaw) * step;
    const z = me.z - Math.cos(me.yaw) * step;
    // Each axis is checked on its own, so we slide along a wall instead of sticking to it.
    if (!blocked(x, me.z)) me.x = x;
    if (!blocked(me.x, z)) me.z = z;

    camera.position.set(me.x, EYE, me.z);
    camera.rotation.set(0, me.yaw, 0);

    const now = performance.now();
    if (now - lastSent.current < SEND_INTERVAL) return;
    lastSent.current = now;
    send("pose", me);
  });

  return null;
}

export default function CityWalkMobile() {
  const { walkers, ids, onMessage } = useWalkers();
  const { send, connected, status } = useSocket("city-walk", onMessage);
  const [me, setMe] = useState<Pose | null>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null); // where the drag began
  const [knob, setKnob] = useState<Stick>({ x: 0, y: 0 });
  const stick = useRef<Stick>({ x: 0, y: 0 });

  // Once, in the browser: this phone's id, colour and a free starting place near the crossing.
  useEffect(() => {
    let x = 0;
    let z = 0;
    do {
      x = Math.random() * 30 - 15;
      z = Math.random() * 30 - 15;
    } while (blocked(x, z));
    setMe({ id: Math.random().toString(36).slice(2, 8), hue: Math.floor(Math.random() * 360), x, z, yaw: Math.random() * Math.PI * 2 });
  }, []);

  function handleDown(event: React.PointerEvent) {
    setOrigin({ x: event.clientX, y: event.clientY });
  }

  function handleMove(event: React.PointerEvent) {
    if (!origin) return;
    const x = Math.max(-1, Math.min(1, (event.clientX - origin.x) / STICK));
    const y = Math.max(-1, Math.min(1, (event.clientY - origin.y) / STICK));
    stick.current = { x, y };
    setKnob({ x, y });
  }

  function handleUp() {
    setOrigin(null);
    stick.current = { x: 0, y: 0 };
    setKnob({ x: 0, y: 0 });
  }

  return (
    <main
      className={styles.container}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
    >
      {me && (
        <Canvas shadows dpr={[1, 1.5]} camera={{ fov: 70, near: 0.1, far: 12000 }}>
          {/* From the street the haze is close: far streets fade into the evening */}
          <Sky near={50} far={520} />
          <City />
          {ids.map((id) => (
            <Figure key={id} id={id} walkers={walkers} />
          ))}
          <Player start={me} stick={stick} send={send} />
        </Canvas>
      )}

      <p className={styles.status}>
        {me && <span className={styles.swatch} style={{ background: `hsl(${me.hue}, 90%, 60%)` }} />}
        {connected ? `connected · ${ids.length} other${ids.length === 1 ? "" : "s"}` : status}
      </p>
      {!origin && <p className={styles.hint}>drag: up to walk, sideways to turn</p>}

      {origin && (
        <div className={styles.ring} style={{ left: origin.x, top: origin.y }}>
          <div className={styles.knob} style={{ transform: `translate(${knob.x * STICK}px, ${knob.y * STICK}px)` }} />
        </div>
      )}
    </main>
  );
}
