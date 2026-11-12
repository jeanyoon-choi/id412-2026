// The system: a school of fish and the pellets dropped into it. No drawing here, only the rules.
// Every fish follows the same rules each frame, and sees only the fish near it and in front of it.
// The school (its streams, its turns, the wave of panic that runs through it) is what comes out.
// Distances are in px, speeds in px per second.

const SEE = 110; // how far a fish notices other fish
const BLIND = -0.35; // a fish does not see what is behind it (−1 = sees all round, 1 = only straight ahead)
const PERSONAL = 42; // closer than this is too close
const SEPARATE = 3200; // 1. push away from fish that are too close
const ALIGN = 1.8; // 2. swim the way the neighbours swim
const COHERE = 0.3; // 3. drift toward the middle of the neighbours
const SMELL = 190; // how far a fish notices a pellet
const HUNGER = 3; // 4. swim to the nearest food
const FLEE = 1500; // 5. swim away from anything bitter
const CATCH = 0.9; // 6. how much of a neighbour's alarm a fish takes over: panic spreads from fish to fish
const CALM = 0.45; // alarm lost per second
const MARGIN = 90; // 7. turn back this far from the edge of the screen
const EDGE = 5;
const WANDER = 26; // a little restlessness
const MIN_SPEED = 28;
const CRUISE = 58; // the speed of a calm fish
const RUSH = 230; // the speed of a fish in full alarm
const MOUTH = 12; // closer than this, the fish eats the pellet

export const BITTER = 12; // a bitter drop dissolves after this many seconds
const PINCH = 12; // one tap of food is this many pellets
const SPREAD = 34; // px, how far a pinch scatters

export type Fish = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  heading: number; // radians, where the body points; it follows the velocity a little late
  tail: number; // the phase of the tail beat
  alarm: number; // 0 calm .. 1 panic
  size: number; // 0.75 .. 1.25
  depth: number; // 0 near the floor .. 1 near the surface
  coat: number; // 0..1, picks the colour
};

export type Pellet = { x: number; y: number; kind: "food" | "bitter"; left: number; age: number };

export function createSchool(count: number, width: number, height: number): Fish[] {
  return Array.from({ length: count }, () => {
    const heading = Math.random() * Math.PI * 2;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(heading) * CRUISE,
      vy: Math.sin(heading) * CRUISE,
      heading,
      tail: Math.random() * Math.PI * 2,
      alarm: 0,
      size: 0.75 + Math.random() * 0.5,
      depth: Math.random(),
      coat: Math.random(),
    };
  });
}

// What one tap adds: a pinch of food that scatters, or one bitter drop.
export function drop(pellets: Pellet[], x: number, y: number, kind: Pellet["kind"]) {
  if (kind === "bitter") return pellets.push({ x, y, kind, left: BITTER, age: 0 });
  for (let i = 0; i < PINCH; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * SPREAD;
    pellets.push({ x: x + Math.cos(angle) * distance, y: y + Math.sin(angle) * distance, kind, left: 1, age: 0 });
  }
}

// One step of time (dt seconds). Moves every fish and returns the pellets that are still there.
export function step(school: Fish[], pellets: Pellet[], width: number, height: number, dt: number): Pellet[] {
  for (const fish of school) {
    // Every rule adds a push (ax, ay). The fish follows the sum.
    let ax = (Math.random() - 0.5) * WANDER;
    let ay = (Math.random() - 0.5) * WANDER;
    const faceX = Math.cos(fish.heading);
    const faceY = Math.sin(fish.heading);

    // 1–3 and 6. The neighbours.
    let neighbours = 0;
    let vx = 0;
    let vy = 0;
    let cx = 0;
    let cy = 0;
    let alarmSeen = 0;
    for (const other of school) {
      if (other === fish) continue;
      const dx = other.x - fish.x;
      const dy = other.y - fish.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > SEE * SEE) continue;
      if (d2 < PERSONAL * PERSONAL) {
        const push = SEPARATE / Math.max(9, d2); // the closer, the harder
        ax -= dx * push;
        ay -= dy * push;
      }
      if (dx * faceX + dy * faceY < BLIND * Math.sqrt(d2)) continue; // behind: not seen
      neighbours++;
      vx += other.vx;
      vy += other.vy;
      cx += other.x;
      cy += other.y;
      alarmSeen = Math.max(alarmSeen, other.alarm);
    }
    if (neighbours > 0) {
      const together = ALIGN * (1 + fish.alarm * 2); // a frightened school pulls into one direction
      ax += (vx / neighbours - fish.vx) * together + (cx / neighbours - fish.x) * COHERE;
      ay += (vy / neighbours - fish.vy) * together + (cy / neighbours - fish.y) * COHERE;
    }

    // 4–5. The pellets. Bitter ones all push and frighten; of the food, only the nearest pulls.
    let food: Pellet | null = null;
    let foodDistance = SMELL;
    for (const pellet of pellets) {
      const dx = pellet.x - fish.x;
      const dy = pellet.y - fish.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      if (distance > SMELL) continue;
      if (pellet.kind === "bitter") {
        const fear = 1 - distance / SMELL; // the closer, the stronger
        ax -= (dx / distance) * fear * FLEE;
        ay -= (dy / distance) * fear * FLEE;
        fish.alarm = Math.max(fish.alarm, fear);
      } else if (distance < foodDistance) {
        food = pellet;
        foodDistance = distance;
      }
    }
    if (food) {
      ax += (((food.x - fish.x) / foodDistance) * RUSH * 0.6 - fish.vx) * HUNGER;
      ay += (((food.y - fish.y) / foodDistance) * RUSH * 0.6 - fish.vy) * HUNGER;
      if (foodDistance < MOUTH * fish.size) food.left = 0; // eaten
    }

    // 6. Alarm: taken over from the neighbours a fish can see, then slowly forgotten.
    fish.alarm = Math.max(0, Math.max(fish.alarm, alarmSeen * CATCH) - CALM * dt);

    // 7. The edges: a soft push back, stronger the further out.
    ax += (Math.max(0, MARGIN - fish.x) - Math.max(0, fish.x - width + MARGIN)) * EDGE;
    ay += (Math.max(0, MARGIN - fish.y) - Math.max(0, fish.y - height + MARGIN)) * EDGE;

    // Push → speed → position. A calm fish settles at CRUISE; alarm or food lets it go faster.
    fish.vx += ax * dt;
    fish.vy += ay * dt;
    const speed = Math.hypot(fish.vx, fish.vy) || 1;
    const top = CRUISE + (RUSH - CRUISE) * Math.max(fish.alarm, food ? 0.5 : 0);
    const eased = speed + (Math.min(speed, top) - speed) * Math.min(1, dt * 3); // slow down gently, not at once
    const limited = Math.max(MIN_SPEED, eased);
    fish.vx *= limited / speed;
    fish.vy *= limited / speed;
    fish.x += fish.vx * dt;
    fish.y += fish.vy * dt;

    // The body turns toward where it swims, the short way round, a little late.
    const turn = Math.atan2(fish.vy, fish.vx) - fish.heading;
    fish.heading += Math.atan2(Math.sin(turn), Math.cos(turn)) * Math.min(1, dt * 7);
    fish.tail += dt * (3 + limited * 0.11); // a faster fish beats its tail faster
  }

  for (const pellet of pellets) {
    pellet.age += dt;
    if (pellet.kind === "bitter") pellet.left -= dt; // dissolving
  }
  return pellets.filter((pellet) => pellet.left > 0);
}
