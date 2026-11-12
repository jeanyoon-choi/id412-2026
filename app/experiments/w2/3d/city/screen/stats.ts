import type { LayerKey } from "../controls";

// The model behind the statistics. The numbers are invented, but they follow from the city on the screen:
// a building's floor area from its size, people from floor area, traffic from the time of day.
export const FLOOR = 0.38; // height of one storey (the same as a row of windows in shader.ts)
export const LOT_AREA = 900; // m² of one lot: a lot is 30 m wide
export const PER_RESIDENT = 40; // m² of home per resident
export const PER_WORKER = 22; // m² of office per worker
export const OUTPUT = 95000; // $ per worker per year
export const TRUCK_EVERY = 7; // every 7th vehicle is a truck
export const TRUCK_LOAD = 14; // tonnes

// A text that follows one building or one vehicle on the screen.
export type Mark = { x: number; y: number; z: number; text: string };

// 1 at `centre` o'clock, falling to 0 within about `width` hours on both sides (around the clock).
function around(hour: number, centre: number, width: number) {
  const away = Math.min(Math.abs(hour - centre), 24 - Math.abs(hour - centre));
  return Math.exp(-((away / width) ** 2));
}

// What the city is doing at a time of day (0 = 00:00, 0.5 = 12:00), each 0..1.
export function activity(time: number) {
  const hour = time * 24;
  const work = around(hour, 13, 4.5); // people at work
  return {
    work,
    home: 1 - 0.75 * work, // people at home
    traffic: 0.12 + 0.88 * Math.max(around(hour, 8.5, 1.6), around(hour, 18.2, 2), 0.55 * around(hour, 13, 3.5)), // two rush hours
    freight: 0.25 + 0.75 * Math.max(around(hour, 5, 2.5), around(hour, 22, 2.5)), // deliveries before dawn and at night
  };
}

// The curve drawn for each statistic: which activity it follows.
export function curveOf(layer: LayerKey, time: number) {
  const now = activity(time);
  if (layer === "traffic") return now.traffic;
  if (layer === "freight") return now.freight;
  return now.work;
}

// The colours of a statistic on the buildings: low, middle, high.
export const RAMPS: Record<LayerKey, [string, string, string]> = {
  people: ["#0b1d3a", "#1fa3a8", "#f4f1a6"],
  gdp: ["#1a0f33", "#b0399a", "#ffd27a"],
  traffic: ["#14171c", "#14171c", "#14171c"], // the buildings step back: the vehicles carry the colour
  freight: ["#14171c", "#14171c", "#14171c"],
};
