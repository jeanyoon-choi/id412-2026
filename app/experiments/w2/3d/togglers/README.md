# 3D Togglers

Forty iOS switches fill the phone. Slide a finger across them without lifting it ("finger skating"): every switch you pass flips. On the laptop, a white wireframe sheet of water on black: each switch that is on is a point that keeps pushing the surface up and down, and the waves spread, cross and interfere.

- Route: /experiments/w2/3d/togglers/mobile (phone) · /experiments/w2/3d/togglers/screen (laptop)
- Week: W2 · Tech: Socket.io, Three.js (React Three Fiber), a wave simulation, Tone.js
- Inputs: 40 switches, flipped by sliding, with one finger or several (discrete choices, continuous gesture) → screen
- Parameters: COLS × ROWS (5 × 8, `grid.ts`), SPEED (0.22), DAMPING (0.996), PUSH (0.035), REACH (3), PER_CELL (16), STEPS (2) (`Field.tsx`)

## How it works
- `grid.ts` holds the grid size; both pages import it. Switch number = row × 5 + column, the same on both sides, so the phone's layout is the surface's layout (top row = far edge).
- Mobile: pointer handlers on the whole page. The switch under a finger is found by arithmetic on the grid's box. A `Map` remembers which switch each finger is on; arriving on a new one flips it once.
- After every flip the phone sends the whole list of 40 booleans (`switches`).
- Screen: `Field.tsx` simulates a surface of 80 × 128 points with the wave equation: each point is pulled toward the average of its four neighbours, and keeps a little less energy every step (`DAMPING`).
- A switch that is on pushes the points around its place up and down with a sine, each at its own rhythm. Everything else follows from the simulation.
- Sound (`screen/sound.ts`): one sine voice per switch, sounding while the switch is on. Row → pitch (near edge low, far edge high, on a five-note scale), column → left … right, and its loudness swells in the rhythm of its push on the water (`rhythm()` in `grid.ts`). Voices of the same row are 1.5 Hz apart, so they beat against each other. If the browser holds the sound back, click anywhere on the screen page.
- The surface is drawn as 128 lines (`lineSegments` along the rows); every frame the heights are copied into the geometry.

## Run
pnpm dev → open /screen and click the /mobile link in its corner (new tab); press and drag across the switches with the mouse. With a phone: open the same address with your computer's IP (same Wi-Fi).

## Status / next
Written and type-checked. Next: let a switch change the wave speed in its area instead of making waves, or let the switches on the mobile light up in the rhythm of their voice.
