# Fish Food

A pond seen from straight above: 220 goldfish swim as schools over a gravel floor, with their shadows under them and light rippling on the stones. Mobiles drop into it: a pinch of food pulls the fish in and gets eaten, a bitter drop frightens them, and the fright runs through the school from fish to fish. Nobody steers a fish.

- Route: /experiments/w3/system/fish-food/mobile (mobiles) · /experiments/w3/system/fish-food/screen (laptop)
- Week: W3 · Tech: Socket.io, Three.js (instanced meshes, two small shaders)
- Inputs: tap on a map (discrete), choice of food or bitter (discrete) → screen
- Parameters: SEE, BLIND, PERSONAL, SEPARATE, ALIGN, COHERE, SMELL, HUNGER, FLEE, CATCH, CALM (`screen/school.ts`) · COUNT (screen) · COATS, LENGTH (`screen/Goldfish.tsx`)

## How it works
- `screen/school.ts` is the system, with no drawing in it. Every fish follows seven rules each frame and sees only the fish near it and in front of it: keep apart, swim along, stay together, go to food, flee bitter, catch the neighbours' alarm, turn back at the edge.
- Alarm is what makes the school visible: a fish near a bitter drop is frightened, its neighbours take over 90 % of that, theirs 90 % of that. A frightened fish swims faster and lines up harder.
- A mobile sends one message per tap: `drop` `{ x, y, kind }`, position 0..1 on a small map of the screen. The screen turns it into 12 food pellets or one bitter drop, and a ring on the water.
- `Goldfish.tsx` draws every fish from five parts (body, tail, side fins, back fin, eyes), each part one `InstancedMesh` for the whole school. The tail swings with the fish's own beat.
- `Tank.tsx` is the water in three layers: the floor (it catches the shadows), the caustics, and the surface with the rings and the dark edges.
- The screen owns the whole state. The mobiles only see their own taps.

## Run
pnpm dev → open /screen, then click the /mobile link in its corner and tap the map. With mobiles: pnpm dev:mobile, same Wi-Fi.

## Status / next
Works with fake drops on one laptop; not yet tried on real mobiles. Next: a note (Tone.js) for every pellet eaten and a hum that follows the school's alarm, as in `sound/bounce`.
