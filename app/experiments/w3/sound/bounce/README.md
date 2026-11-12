# Bounce

Click to drop a ball. After that the balls play: every bounce is a note, and a low hum gets louder and brighter the more there is moving. Two kinds of sound from one simulation: events and a continuous layer.

- Route: /experiments/w3/sound/bounce
- Week: W3 · Tech: Tone.js, Canvas
- Inputs: click (discrete) → a ball; after that the simulation is the input
- Parameters: GRAVITY, BOUNCE (0.78), QUIET (80 px/s), NOTES (8 pitches)

## How it works
- The first click calls `await Tone.start()` and builds the instrument: a `PolySynth` for the notes, and one sawtooth through a lowpass filter for the hum.
- Discrete: when a ball hits the floor or a wall, `hit()` plays one note. The ball's size picks the pitch, the speed of the hit sets the loudness.
- Continuous: every frame the speeds of all balls are added up → 0..1 → the hum's volume and filter, with a short `rampTo` so it glides.
- A ball that lies still is removed. With no balls the hum is silent.
- The white line on the floor is the same 0..1 number, drawn.

## Run
pnpm dev → open the route, click a few times.

## Status / next
The page runs without errors; the sound itself has not been listened to yet. Next: let phones drop the balls (`useSocket`), or use this pattern in `system/fish-food`: a note when a pellet is eaten, a hum for how tight the school is.
