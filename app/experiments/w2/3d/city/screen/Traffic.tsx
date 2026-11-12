"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { BufferAttribute, Points, PointsMaterial } from "three";
import type { LayerKey, SliderKey, Stats, SwitchKey } from "../controls";
import { SIZE, STREETS, random, streetAt } from "../plan";
import { TRUCK_EVERY, TRUCK_LOAD, activity, type Mark } from "./stats";

const CARS = 1400;

// The colour of a vehicle in each view: [the ones driving one way, the other way, the trucks].
const COLOURS: Record<LayerKey | "none", number[][]> = {
  none: [[1, 0.95, 0.85], [1, 0.12, 0.08], [1, 0.95, 0.85]], // headlights and tail lights
  people: [[0.2, 0.22, 0.26], [0.2, 0.22, 0.26], [0.2, 0.22, 0.26]],
  gdp: [[0.2, 0.22, 0.26], [0.2, 0.22, 0.26], [0.2, 0.22, 0.26]],
  traffic: [[0.5, 0.95, 1], [0.5, 0.95, 1], [0.5, 0.95, 1]],
  freight: [[0.2, 0.22, 0.26], [0.2, 0.22, 0.26], [1, 0.7, 0.2]],
};

type Props = {
  s: Record<SliderKey, number>; // the eased sliders and switches (see City.tsx)
  p: Record<SwitchKey, number>;
  layer: React.RefObject<LayerKey | null>;
  stats: React.RefObject<Stats>; // written here: traffic, speed, freight
  marks: React.RefObject<Mark[]>; // written here: the texts on five vehicles
};

// Vehicles are points of light that drive along the streets. How many are out depends on the time of day.
export function Traffic({ s, p, layer, stats, marks }: Props) {
  const points = useRef<Points>(null);
  const material = useRef<PointsMaterial>(null);
  const shown = useRef<LayerKey | "none" | null>(null);

  const { cars, positions, colours } = useMemo(() => {
    const cars = Array.from({ length: CARS }, (_, n) => {
      const forward = random(n + 0.2) > 0.5;
      return {
        alongX: random(n) > 0.5, // drives along x, or along z
        street: streetAt(Math.floor(random(n + 0.4) * STREETS)) + (forward ? 0.16 : -0.16), // its lane
        start: random(n + 0.6) * SIZE,
        speed: (2 + random(n + 0.8) * 4) * (forward ? 1 : -1),
        truck: n % TRUCK_EVERY === 0,
      };
    });
    return { cars, positions: new Float32Array(CARS * 3), colours: new Float32Array(CARS * 3) };
  }, []);

  useFrame(({ clock }) => {
    const geometry = points.current!.geometry;
    const key = layer.current;
    const now = activity(s.time);

    // The colours change only when the view changes.
    if ((key ?? "none") !== shown.current) {
      shown.current = key ?? "none";
      const [one, other, truck] = COLOURS[shown.current];
      cars.forEach((car, n) => colours.set(car.truck ? truck : car.speed > 0 ? one : other, n * 3));
      (geometry.attributes.color as BufferAttribute).needsUpdate = true;
      material.current!.size = key === "traffic" || key === "freight" ? 1.1 : 0.32; // the vehicles are the subject: bigger
    }

    // Where every vehicle is now.
    const gap = 1 + s.spread * 0.7; // the streets spread with the city (same as in City.tsx)
    const attribute = geometry.attributes.position as BufferAttribute;
    cars.forEach((car, n) => {
      const travelled = car.start + clock.elapsedTime * car.speed;
      const along = (((travelled % SIZE) + SIZE) % SIZE) - SIZE / 2; // off one end, back on at the other
      attribute.setXYZ(n, (car.alongX ? along : car.street) * gap, 0.06, (car.alongX ? car.street : along) * gap);
    });
    attribute.needsUpdate = true;

    // How many are out: the Traffic switch × the time of day (two rush hours).
    const out = Math.round(CARS * (0.12 + p.traffic * 0.88) * now.traffic);
    geometry.setDrawRange(0, out);

    // The figures: the fuller the streets, the slower.
    const speed = 54 - 34 * (out / CARS);
    stats.current.traffic = out;
    stats.current.speed = speed;
    stats.current.freight = (out / TRUCK_EVERY) * TRUCK_LOAD * (0.4 + 0.6 * now.freight);

    // Five vehicles get a text.
    if (key === "traffic" || key === "freight") {
      const step = key === "freight" ? TRUCK_EVERY * 9 : 61;
      marks.current = [0, 1, 2, 3, 4]
        .map((k) => k * step + (key === "freight" ? 0 : 3))
        .filter((n) => n < out)
        .map((n) => ({
          x: attribute.getX(n),
          y: 0.3,
          z: attribute.getZ(n),
          text: key === "freight" ? `T-${String(n).padStart(4, "0")} · ${Math.round(TRUCK_LOAD * (0.5 + random(n)))} t` : `V-${String(n).padStart(4, "0")} · ${Math.round((speed * Math.abs(cars[n].speed)) / 4)} km/h`,
        }));
    }
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colours, 3]} />
      </bufferGeometry>
      <pointsMaterial ref={material} size={0.32} vertexColors sizeAttenuation />
    </points>
  );
}
