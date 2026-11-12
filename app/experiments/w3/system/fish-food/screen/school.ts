// The system: a school of fish and the pellets dropped into it. No drawing here, only the rules.
// Every fish follows the same rules each frame, and sees only the fish near it and in front of it.
// The school (its streams, its turns, the wave of panic that runs through it) is what comes out.
// Distances are in px, speeds in px per second.

const SEE = 40; // how far a fish notices other fish
const BLIND = -0.35; // a fish does not see what is behind it (−1 = sees all round, 1 = only straight ahead)
const PERSONAL = 14; // closer than this is too close
const SEPARATE = 950; // 1. push away from fish that are too close
const ALIGN = 2.6; // 2. swim the way the neighbours swim
const COHERE = 0.5; // 3. drift toward the middle of the neighbours
const SMELL = 110; // how far the smell of a flake spreads in the end
const SOAK = 5; // seconds until a flake has soaked and its crumbs have drifted that far
const HUNGER = 3; // 4. swim to the nearest food
const FLEE = 1500; // 5. swim away from anything bitter
const CATCH = 0.92; // 6. how much of a neighbour's alarm a fish takes over: panic spreads from fish to fish
const CALM = 0.5; // alarm lost per second
const MARGIN = 50; // 7. turn back this far from the edge of the screen
const EDGE = 5;
const WANDER = 0.5; // a slow pull to one side that keeps changing, so a school never swims straight for long
const MIN_SPEED = 18;
const CRUISE = 40; // the speed of a calm fish
const RUSH = 150; // the speed of a fish in full alarm
const MOUTH = 7; // closer than this, the fish bites the food
const BITE = 1.6; // how much of a flake one fish eats per second: a flake is nibbled away, not swallowed whole

export const BITTER = 10; // the life of a bitter tablet: it dissolves and is gone after this many seconds
const REACH = 130; // how far its bitterness has spread in the water by then

export type Fish = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  heading: number; // radians, where the body points; it follows the velocity a little late
  tail: number; // the phase of the tail beat
  alarm: number; // 0 calm .. 1 panic
  mood: number; // the phase of its wandering
};

export type Pellet = {
  x: number;
  y: number;
  kind: "food" | "bitter";
  left: number; // bitter: seconds of life left. food: how much of it is left, 1 → 0
  age: number;
  look: number; // 0..1, drawn when it fell: its own turn and shape
};

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
      mood: Math.random() * 100,
    };
  });
}

// How far the bitterness of a tablet has spread: fast at first, then slower, as ink does in water.
export function spread(pellet: Pellet) {
  return REACH * (0.25 + 0.75 * Math.sqrt(1 - pellet.left / BITTER));
}

// How far a flake can be smelt: it soaks, crumbles, and its crumbs drift outward on the surface.
export function scent(pellet: Pellet) {
  return SMELL * (0.25 + 0.75 * Math.min(1, pellet.age / SOAK));
}

// How strong it still is: full for most of its life, thinning out in the last 3 seconds.
export function strength(pellet: Pellet) {
  return Math.min(1, pellet.left / 3);
}

// One message from a mobile is one pellet. Food stays until it is eaten; bitter dissolves.
export function drop(pellets: Pellet[], x: number, y: number, kind: Pellet["kind"]) {
  pellets.push({ x, y, kind, left: kind === "bitter" ? BITTER : 1, age: 0, look: Math.random() });
}

// The grid. Comparing every fish with every other fish is count × count checks: too slow for a big school.
// So the water is cut into square cells as wide as a fish can see. A fish only checks the fish in its own cell
// and the 8 cells round it. `first[cell]` is one fish in that cell, `next[fish]` the next fish in the same cell (−1: none).
let first = new Int32Array(0);
let next = new Int32Array(0);

// One step of time (dt seconds). Moves every fish and returns the pellets that are still there.
export function step(school: Fish[], pellets: Pellet[], width: number, height: number, dt: number): Pellet[] {
  // Sort the fish into the cells.
  const columns = Math.ceil(width / SEE) + 2; // one spare column on each side, for fish just outside the screen
  const rows = Math.ceil(height / SEE) + 2;
  if (first.length !== columns * rows) first = new Int32Array(columns * rows);
  if (next.length !== school.length) next = new Int32Array(school.length);
  const cellOf = (value: number, cells: number) => Math.min(cells - 1, Math.max(0, Math.floor(value / SEE) + 1));
  first.fill(-1);
  for (let i = 0; i < school.length; i++) {
    const cell = cellOf(school[i].y, rows) * columns + cellOf(school[i].x, columns);
    next[i] = first[cell];
    first[cell] = i;
  }

  for (let i = 0; i < school.length; i++) {
    const fish = school[i];
    const faceX = Math.cos(fish.heading);
    const faceY = Math.sin(fish.heading);
    // Every rule adds a push (ax, ay). The fish follows the sum.
    // Wandering: a push to the left or the right of where it swims, slowly changing.
    fish.mood += dt;
    const side = Math.sin(fish.mood * 0.6) * WANDER;
    let ax = -fish.vy * side;
    let ay = fish.vx * side;

    // 1–3 and 6. The neighbours: only the fish in the 9 cells round this one.
    let neighbours = 0;
    let vx = 0;
    let vy = 0;
    let cx = 0;
    let cy = 0;
    let alarmSeen = 0;
    const column = cellOf(fish.x, columns);
    const row = cellOf(fish.y, rows);
    for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
      for (let c = Math.max(0, column - 1); c <= Math.min(columns - 1, column + 1); c++) {
        for (let j = first[r * columns + c]; j !== -1; j = next[j]) {
          if (j === i) continue;
          const other = school[j];
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
          if (other.alarm > alarmSeen) alarmSeen = other.alarm;
        }
      }
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
      if (dx > REACH || dx < -REACH || dy > REACH || dy < -REACH) continue; // far away: no need to measure
      const distance = Math.max(1, Math.hypot(dx, dy));
      if (pellet.kind === "bitter") {
        const reach = spread(pellet);
        if (distance > reach) continue; // the bitterness has not come this far
        const fear = (1 - distance / reach) * strength(pellet); // the closer, the stronger
        ax -= (dx / distance) * fear * FLEE;
        ay -= (dy / distance) * fear * FLEE;
        fish.alarm = Math.max(fish.alarm, fear);
      } else if (distance < foodDistance && distance < scent(pellet)) {
        food = pellet;
        foodDistance = distance;
      }
    }
    if (food) {
      ax += (((food.x - fish.x) / foodDistance) * RUSH * 0.6 - fish.vx) * HUNGER;
      ay += (((food.y - fish.y) / foodDistance) * RUSH * 0.6 - fish.vy) * HUNGER;
      if (foodDistance < MOUTH) food.left -= BITE * dt; // nibbled
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
    fish.tail += dt * (5.2 + limited * 0.018); // a faster fish beats its tail faster
  }

  for (const pellet of pellets) {
    pellet.age += dt;
    if (pellet.kind === "bitter") pellet.left -= dt; // dissolving
  }
  return pellets.filter((pellet) => pellet.left > 0);
}
