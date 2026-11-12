# Fish Food

A 3D scene of water on plain white, seen from above and a little from the side: thousands of small goldfish swim as schools at different depths. Mobiles drop things into it: food pulls the fish in and is nibbled away, bitter spreads like ink and frightens them, and the fright runs through the school from fish to fish. Nobody steers a fish.

- Route: /experiments/w3/system/fish-food/mobile (mobiles) · /experiments/w3/system/fish-food/screen (laptop)
- Week: W3 · Tech: Socket.io, Three.js (instanced meshes, two small shaders)
- Inputs: tap or slide on the full-screen map (discrete, one pellet per message), choice of food or bitter (discrete) → screen
- Parameters: SEE, BLIND, PERSONAL, SEPARATE, ALIGN, COHERE, SMELL, SOAK, HUNGER, FLEE, CATCH, CALM, WANDER, BITE, BITTER, REACH (`screen/school.ts`) · WATER, MOST, VIEW (screen) · SCALE, DEPTH, TAIL_SWING (`screen/Goldfish.tsx`) · STEP (mobile)

## How it works
- `screen/school.ts` is the system, with no drawing in it. Every fish follows the same rules each frame and sees only the fish near it and in front of it: keep apart, swim along, stay together, go to food, flee bitter, catch the neighbours' alarm, turn back at the edge, wander.
- Alarm is what makes the school visible: a fish in bitter water is frightened, its neighbours take over 92 % of that, theirs 92 % of that. A frightened fish swims faster and lines up harder.
- A mobile sends one message per pellet: `drop` `{ x, y, kind }`, position 0..1. The whole mobile is the map (its corners are the water's corners); the food / bitter choice is a bar fixed at the bottom. A tap is one pellet; a finger that slides scatters one every STEP px.
- Food is a flake of fish food on the surface. It soaks and crumbles: crumbs drift away from it as far as `scent()` says, and only inside them can a fish smell it. Every fish that reaches the flake bites a little off (BITE), so the flake gets smaller and the crumbs thinner until it is gone.
- Bitter is a tablet on the floor that lives BITTER seconds (10). Its bitterness spreads as far as `spread()` says and thins out as `strength()` says; `Pellets.tsx` paints the ink cloud from those same two numbers, so the dark water is the water the fish flee.
- The number of fish follows the size of the window: one per WATER px², MOST at most (about 2000 on a laptop, 5000 on a 1080p screen).
- The screen owns the whole state. The mobiles only see their own pellets.

## Fast enough for thousands
- The grid in `school.ts`: fish are sorted into cells as wide as a fish can see, so each fish checks 9 cells, not the whole school. One step takes about 1.2 ms for 2000 fish and 4.6 ms for 5000 (measured in Node on this laptop).
- `Goldfish.tsx` is the goldfish of experiments-jyc (goldfishes, `rendering/goldfish-scene.ts`) with fewer corners. Everything that does not move on a fish is merged into one shape, so the school is three `InstancedMesh` (three draw calls) and each fish needs two matrices per frame.

## Run
pnpm dev → open /screen, then click the /mobile link in its corner and tap or slide on the map. With mobiles: pnpm dev:mobile, same Wi-Fi.

## Status / next
Works on one laptop with the mobile page in a second tab; not yet tried on real mobiles or at 1080p with 5000 fish. Next: a note (Tone.js) for every flake eaten and a hum that follows the school's alarm, as in `sound/bounce`.
