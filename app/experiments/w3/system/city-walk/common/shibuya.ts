import data from "./shibuya.json";

// The plan of the city: the real buildings and roads around Shibuya crossing, Tokyo.
// shibuya.json comes from OpenStreetMap (© OpenStreetMap contributors): building outlines with their heights,
// and the middle lines of roads, zebra crossings and rails. Units are metres; (0, 0) is the crossing;
// −z is north. Every device reads the same file, so a position means the same place everywhere.

export const SOLID = 190; // m from the crossing: up to here the city is built
export const FADE = 270; // from SOLID to here it dissolves into a cloud of points
export const LIMIT = 180; // walkers stay inside this
export const SHOP = 4.5; // height of a ground floor
export const FLOOR = 3.3; // height of every floor above it

export type Point = [number, number]; // x, z
export type Building = { points: Point[]; height: number; distance: number; tint: number };
export type Road = { kind: "road" | "crossing" | "rail"; width: number; points: Point[] };

// What one phone tells the others about itself.
export type Pose = { id: string; hue: number; x: number; z: number; yaw: number };

// The file stores an outline as one flat list: x, z, x, z, …
function pairs(flat: number[]): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < flat.length; i += 2) points.push([flat[i], flat[i + 1]]);
  return points;
}

export const BUILDINGS: Building[] = data.buildings.map((building, index) => {
  const points = pairs(building.p);
  const x = points.reduce((sum, point) => sum + point[0], 0) / points.length;
  const z = points.reduce((sum, point) => sum + point[1], 0) / points.length;
  return {
    points,
    height: building.h,
    distance: Math.hypot(x, z), // from the crossing to the middle of the building
    tint: (index * 0.618) % 1, // 0..1, the same on every device: picks the wall colour
  };
});

export const ROADS: Road[] = data.roads.map((road) => ({ kind: road.k as Road["kind"], width: road.w, points: pairs(road.p) }));

// Is (x, z) inside this outline? Count how many edges a line from the point to the right crosses: odd = inside.
function inside(points: Point[], x: number, z: number) {
  let hit = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [x1, z1] = points[i];
    const [x2, z2] = points[j];
    if (z1 > z !== z2 > z && x < x1 + ((z - z1) / (z2 - z1)) * (x2 - x1)) hit = !hit;
  }
  return hit;
}

// Can a walker stand at (x, z)? Not outside the city and not inside a building.
// The walker is a small square: if any of its corners is in a building, the place is taken.
const BODY = 0.6; // metres kept between a walker and a wall
export function blocked(x: number, z: number) {
  if (Math.hypot(x, z) > LIMIT) return true;
  for (const building of BUILDINGS) {
    if (Math.abs(building.distance - Math.hypot(x, z)) > 120) continue; // far away: skip the slow test
    for (const [dx, dz] of [[-BODY, -BODY], [BODY, -BODY], [BODY, BODY], [-BODY, BODY]]) {
      if (inside(building.points, x + dx, z + dz)) return true;
    }
  }
  return false;
}
