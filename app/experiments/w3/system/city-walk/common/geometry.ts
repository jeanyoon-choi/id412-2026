import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Building, Road } from "./shibuya";

// Turns the plan (outlines and middle lines) into shapes Three.js can draw.
// Each function returns ONE geometry for the whole city, so the whole city is a handful of draw calls.

// Wall colours. A building picks one with its tint; towers are glass.
const WALLS = ["#e6e1d6", "#cfd4d8", "#d8c9b6", "#bfc5ca", "#ece6d6", "#c8b5a3", "#b9b3aa"];
const GLASS = "#9fb6cc";

function geometry(positions: number[], uvs: number[], colours?: number[]) {
  const result = new THREE.BufferGeometry();
  result.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  result.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  if (colours) result.setAttribute("color", new THREE.Float32BufferAttribute(colours, 3));
  result.computeVertexNormals();
  return result;
}

// The walls of every building between two heights: one rectangle per edge of each outline.
// uv counts metres along the wall (u) and up the wall (v), divided by the size of one picture,
// so the window picture repeats at its real size on every building.
export function walls(buildings: Building[], bottom: number, top: (building: Building) => number, tileWidth: number, tileHeight: number) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const colours: number[] = [];
  const colour = new THREE.Color();

  for (const building of buildings) {
    const y0 = bottom;
    const y1 = top(building);
    if (y1 <= y0) continue;
    colour.set(building.height > 60 ? GLASS : WALLS[Math.floor(building.tint * WALLS.length)]);

    let along = 0; // metres walked round the outline so far
    building.points.forEach(([x1, z1], index) => {
      const [x2, z2] = building.points[(index + 1) % building.points.length];
      const length = Math.hypot(x2 - x1, z2 - z1);
      const [u1, u2] = [along / tileWidth, (along + length) / tileWidth];
      const [v1, v2] = [(y0 - bottom) / tileHeight, (y1 - bottom) / tileHeight];
      // Two triangles: a–c–b and a–d–c, with a, b at the bottom and d, c above them.
      positions.push(x1, y0, z1, x2, y1, z2, x2, y0, z2, x1, y0, z1, x1, y1, z1, x2, y1, z2);
      uvs.push(u1, v1, u2, v2, u2, v1, u1, v1, u1, v2, u2, v2);
      for (let i = 0; i < 6; i++) colours.push(colour.r, colour.g, colour.b);
      along += length;
    });
  }
  return geometry(positions, uvs, colours);
}

// The roofs: each outline filled in, lifted to the height of its building.
export function roofs(buildings: Building[]) {
  const parts = buildings.map((building) => {
    const shape = new THREE.Shape(building.points.map(([x, z]) => new THREE.Vector2(x, z)));
    // A Shape lies flat in x–y. Turning it a quarter round the x axis lays it down in x–z.
    return new THREE.ShapeGeometry(shape).rotateX(Math.PI / 2).translate(0, building.height, 0);
  });
  return mergeGeometries(parts);
}

// Roads, crossings and rails: a flat ribbon along each middle line, as wide as the road.
// u goes across the ribbon (0..1), v counts metres along it, so markings repeat at a real size.
export function ribbons(roads: Road[], kind: Road["kind"], y: number, tileLength: number) {
  const positions: number[] = [];
  const uvs: number[] = [];

  for (const road of roads) {
    if (road.kind !== kind) continue;
    let along = 0;
    for (let index = 0; index < road.points.length - 1; index++) {
      const [x1, z1] = road.points[index];
      const [x2, z2] = road.points[index + 1];
      const length = Math.hypot(x2 - x1, z2 - z1);
      if (length === 0) continue;
      // (sx, sz): half the width, at a right angle to the road.
      const sx = (-(z2 - z1) / length) * (road.width / 2);
      const sz = ((x2 - x1) / length) * (road.width / 2);
      const [v1, v2] = [along / tileLength, (along + length) / tileLength];
      positions.push(x1 + sx, y, z1 + sz, x2 + sx, y, z2 + sz, x1 - sx, y, z1 - sz, x1 - sx, y, z1 - sz, x2 + sx, y, z2 + sz, x2 - sx, y, z2 - sz);
      uvs.push(0, v1, 0, v2, 1, v1, 1, v1, 0, v2, 1, v2);
      along += length;
    }
  }
  return geometry(positions, uvs);
}

// The edge of the city as a cloud: random points on the walls and roofs of the outer buildings
// and on the ground around them. Fewer points the further out, until nothing is left.
export function cloud(buildings: Building[], from: number, to: number) {
  const positions: number[] = [];
  const fade = (distance: number) => Math.max(0, Math.min(1, (distance - from) / (to - from))); // 0 at `from`, 1 at `to`

  for (const building of buildings) {
    const thin = 1 - fade(building.distance); // 1 = dense, 0 = gone
    building.points.forEach(([x1, z1], index) => {
      const [x2, z2] = building.points[(index + 1) % building.points.length];
      const area = Math.hypot(x2 - x1, z2 - z1) * building.height;
      for (let i = 0; i < area * 0.35 * thin * thin; i++) {
        const t = Math.random();
        positions.push(x1 + (x2 - x1) * t, Math.random() * building.height, z1 + (z2 - z1) * t);
      }
    });
    // The roof: points along lines from the first corner to every edge. Not even, but it reads as a top.
    const [ax, az] = building.points[0];
    for (let i = 0; i < building.points.length * 6 * thin; i++) {
      const [bx, bz] = building.points[Math.floor(Math.random() * building.points.length)];
      const t = Math.random();
      positions.push(ax + (bx - ax) * t, building.height, az + (bz - az) * t);
    }
  }

  // The ground: a ring of points, thinning outward.
  for (let i = 0; i < 9000; i++) {
    const distance = from + (to - from) * Math.random() ** 2;
    const angle = Math.random() * Math.PI * 2;
    positions.push(Math.cos(angle) * distance, 0.1, Math.sin(angle) * distance);
  }

  const result = new THREE.BufferGeometry();
  result.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return result;
}
