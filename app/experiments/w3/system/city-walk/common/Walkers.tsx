"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { Pose } from "./shibuya";

// Everyone else in the room. Used by the screen (all phones) and by each phone (the other phones).
const TIMEOUT = 3000; // ms without a message → that walker has left
const EASE = 0.2; // 0..1, how fast a figure catches up with its last message
const BEAM = 320; // m, the light above each walker, so the screen finds them between the towers

type Walker = Pose & { seen: number };

// Keeps the latest pose of every phone we hear, by id.
export function useWalkers() {
  const walkers = useRef(new Map<string, Walker>());
  const [ids, setIds] = useState<string[]>([]);

  const onMessage = useCallback((type: string, data: unknown) => {
    if (type !== "pose") return;
    const pose = data as Pose;
    // A new id: re-render once, so a figure is added. After that only the ref changes.
    if (!walkers.current.has(pose.id)) setIds((list) => [...list, pose.id]);
    walkers.current.set(pose.id, { ...pose, seen: performance.now() });
  }, []);

  // The relay does not say when a phone leaves. Silence is how we know.
  useEffect(() => {
    const timer = setInterval(() => {
      const now = performance.now();
      for (const [id, walker] of walkers.current) {
        if (now - walker.seen < TIMEOUT) continue;
        walkers.current.delete(id);
        setIds((list) => list.filter((other) => other !== id));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return { walkers, ids, onMessage };
}

// One walker: a body, a mark on the ground that points where they look, and a beam of light.
export function Figure({ id, walkers }: { id: string; walkers: React.RefObject<Map<string, Walker>> }) {
  const group = useRef<Group>(null);
  const first = walkers.current.get(id);
  const colour = `hsl(${first?.hue ?? 0}, 90%, 60%)`;

  useFrame(() => {
    const target = walkers.current.get(id);
    if (!group.current || !target) return;
    // Messages arrive ~15 times a second; easing fills the frames in between.
    group.current.position.x += (target.x - group.current.position.x) * EASE;
    group.current.position.z += (target.z - group.current.position.z) * EASE;
    // Turn the short way round (359° → 1° is 2°, not 358°).
    const turn = target.yaw - group.current.rotation.y;
    group.current.rotation.y += Math.atan2(Math.sin(turn), Math.cos(turn)) * EASE;
  });

  return (
    <group ref={group} position={[first?.x ?? 0, 0, first?.z ?? 0]} rotation-y={first?.yaw ?? 0}>
      <mesh position-y={0.9}>
        <cylinderGeometry args={[0.3, 0.3, 1.8, 16]} />
        <meshBasicMaterial color={colour} />
      </mesh>
      {/* On the ground, large enough to see from above: a ring, and a triangle pointing forward (−z) */}
      <mesh position-y={0.15} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[2.2, 2.7, 48]} />
        <meshBasicMaterial color={colour} />
      </mesh>
      <mesh position={[0, 0.15, -5.5]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[1.6, 3, Math.PI / 2]} />
        <meshBasicMaterial color={colour} />
      </mesh>
      <mesh position-y={BEAM / 2}>
        <cylinderGeometry args={[0.35, 0.35, BEAM, 6]} />
        <meshBasicMaterial color={colour} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}
