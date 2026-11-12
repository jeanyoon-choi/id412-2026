import * as THREE from "three";

// The city's surfaces are small pictures drawn on a canvas, once, in the browser. No image files.
// Wall makers return `map` (the colours) and `emissiveMap` (what glows: the lit windows).
// Every picture repeats: geometry.ts says how many metres one picture covers.

function canvas(width: number, height: number) {
  const element = document.createElement("canvas");
  element.width = width;
  element.height = height;
  return { element, context: element.getContext("2d")! };
}

function texture(element: HTMLCanvasElement) {
  const result = new THREE.CanvasTexture(element);
  result.colorSpace = THREE.SRGBColorSpace;
  result.wrapS = result.wrapT = THREE.RepeatWrapping;
  result.anisotropy = 8; // stays sharp when seen at a flat angle, as roads and walls are from eye height
  return result;
}

// Upper floors: 8 windows wide, 8 floors high. About a third of the windows are lit.
export function floorTextures() {
  const wall = canvas(512, 512);
  const glow = canvas(512, 512);
  wall.context.fillStyle = "#f2f0ec";
  wall.context.fillRect(0, 0, 512, 512);
  glow.context.fillStyle = "#000";
  glow.context.fillRect(0, 0, 512, 512);

  for (let floor = 0; floor < 8; floor++) {
    wall.context.fillStyle = "#a9a8a4"; // the slab between two floors
    wall.context.fillRect(0, floor * 64 + 58, 512, 6);
    for (let bay = 0; bay < 8; bay++) {
      const [x, y] = [bay * 64 + 9, floor * 64 + 10];
      wall.context.fillStyle = "#1c232e"; // glass
      wall.context.fillRect(x, y, 46, 38);
      wall.context.fillStyle = "#d8d6d0"; // the bar down the window
      wall.context.fillRect(x + 22, y, 2, 38);
      if (Math.random() < 0.35) {
        glow.context.fillStyle = ["#ffcf85", "#ffe2b0", "#e6efff"][Math.floor(Math.random() * 3)];
        glow.context.fillRect(x, y, 46, 38);
      }
    }
  }
  return { map: texture(wall.element), emissiveMap: texture(glow.element) };
}

// Ground floors: a sign band, shop windows with the lights on, a door.
export function shopTextures() {
  const wall = canvas(256, 64);
  const glow = canvas(256, 64);
  wall.context.fillStyle = "#e9e6e0";
  wall.context.fillRect(0, 0, 256, 64);
  wall.context.fillStyle = "#33363b"; // the sign band
  wall.context.fillRect(0, 4, 256, 11);
  glow.context.fillStyle = "#000";
  glow.context.fillRect(0, 0, 256, 64);

  for (const [x, width] of [[8, 60], [76, 60], [164, 84]]) {
    wall.context.fillStyle = "#27303b";
    wall.context.fillRect(x, 20, width, 44);
    glow.context.fillStyle = "#ffc98a";
    glow.context.fillRect(x, 20, width, 44);
  }
  wall.context.fillStyle = "#15181c"; // the door
  wall.context.fillRect(142, 24, 16, 40);
  // Signs: a few short bright strips in the band.
  for (const [x, colour] of [[14, "#ff5a4d"], [92, "#fff3d6"], [180, "#58c7ff"]] as const) {
    glow.context.fillStyle = colour;
    glow.context.fillRect(x, 7, 40, 5);
  }
  return { map: texture(wall.element), emissiveMap: texture(glow.element) };
}

// Asphalt with a few thousand faint specks, used for the ground and under the markings.
function asphalt(context: CanvasRenderingContext2D, width: number, height: number, colour: string) {
  context.fillStyle = colour;
  context.fillRect(0, 0, width, height);
  for (let i = 0; i < (width * height) / 40; i++) {
    context.fillStyle = Math.random() < 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.15)";
    context.fillRect(Math.random() * width, Math.random() * height, 2, 2);
  }
}

// A road, seen from above: left to right is across the road, top to bottom is along it.
export function roadTexture() {
  const road = canvas(128, 256);
  asphalt(road.context, 128, 256, "#2c2e32");
  road.context.fillStyle = "#c9c9c4"; // the line at each side
  road.context.fillRect(6, 0, 3, 256);
  road.context.fillRect(119, 0, 3, 256);
  road.context.fillStyle = "#d9c57a"; // the dashed line in the middle
  road.context.fillRect(62, 0, 4, 128);
  return texture(road.element);
}

// A zebra crossing: white bars one after another along the way people walk.
export function crossingTexture() {
  const crossing = canvas(64, 64);
  asphalt(crossing.context, 64, 64, "#2c2e32");
  crossing.context.fillStyle = "#d6d6d2";
  crossing.context.fillRect(0, 0, 64, 34);
  return texture(crossing.element);
}

// The ground between the roads: paving.
export function groundTexture() {
  const ground = canvas(256, 256);
  asphalt(ground.context, 256, 256, "#6a6a6c");
  return texture(ground.element);
}
