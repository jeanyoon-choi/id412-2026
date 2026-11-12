// The street plan, used by the screen (to build the city) and by the mobile (to draw its map).
// LOTS × LOTS building lots, a street after every BLOCK lots.
export const LOTS = 40;
export const BLOCK = 4;
export const STREET = 0.8; // width of a street (a lot is 1 wide)
export const STREETS = LOTS / BLOCK - 1; // 9 streets each way
export const SIZE = LOTS + STREETS * STREET; // the city is SIZE × SIZE, centred on 0

// Where lot number i sits along one axis.
export function lotAt(i: number) {
  return i + 0.5 + Math.floor(i / BLOCK) * STREET - SIZE / 2;
}

// Where street number s runs.
export function streetAt(s: number) {
  return (s + 1) * BLOCK + (s + 0.5) * STREET - SIZE / 2;
}

// The same "random" number every time for the same input: the city does not change on reload,
// and it is the same city on the mobile and on the screen.
// (Whole-number arithmetic only: the server and the browser must get exactly the same number.)
export function random(seed: number) {
  let hash = Math.imul(Math.round(seed * 10) ^ 0x9e3779b9, 0x85ebca6b);
  hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
  return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
}

// The river: where it is at depth z, and whether a place is in it.
export const RIVER_WIDTH = 4.6;
export function riverAt(z: number) {
  return 9 + Math.sin(z * 0.13) * 5;
}
export function inRiver(x: number, z: number) {
  return Math.abs(x - riverAt(z)) < RIVER_WIDTH / 2;
}

// Every lot: where it is and how big its building's footprint is.
export const PLAN = Array.from({ length: LOTS * LOTS }, (_, n) => {
  const i = n % LOTS;
  const j = Math.floor(n / LOTS);
  return {
    n,
    i,
    j,
    x: lotAt(i),
    z: lotAt(j),
    width: 0.5 + random(n) * 0.4,
    depth: 0.5 + random(n + 0.3) * 0.4,
    empty: random(n + 0.5) > 0.9, // no building here
  };
});
