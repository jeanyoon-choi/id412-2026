"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import type { Mark } from "./stats";

// Five texts that follow a building or a vehicle. The texts are plain HTML on top of the canvas (see page.tsx);
// every frame, the 3D point of each one is turned into a place on the page.
// City.tsx and Traffic.tsx say where and what (marks).
export function Labels({ marks, elements }: { marks: React.RefObject<Mark[]>; elements: React.RefObject<(HTMLDivElement | null)[]> }) {
  const point = useMemo(() => new Vector3(), []);

  useFrame(({ camera, size }) => {
    elements.current.forEach((element, k) => {
      if (!element) return;
      const mark = marks.current[k];
      if (mark) point.set(mark.x, mark.y, mark.z).project(camera); // → -1..1 across the page, and z < 1 if in front of the camera
      const visible = mark !== undefined && point.z < 1;
      element.style.opacity = visible ? "1" : "0";
      if (!visible) return;
      element.style.transform = `translate(${((point.x + 1) / 2) * size.width}px, ${((1 - point.y) / 2) * size.height}px) translateY(-100%)`;
      if (element.textContent !== mark.text) element.textContent = mark.text;
    });
  });

  return null;
}
