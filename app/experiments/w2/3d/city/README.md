# 3D City

A generated city on the laptop, run from the mobile. The mobile is an iOS 26 app with three modes:

- **Settings**: 5 sliders and 6 switches, each with its name, its value and what its two ends mean. They are the city's parameters. The Time slider runs from midnight to midnight; the sky, the sun, the lit windows and the traffic follow it.
- **Navigate**: a map of the city, moved like in a maps app. The screen's camera looks at the place in the centre of the map.
- **Statistics**: the city's figures (population, GDP, traffic, logistics), sent back from the screen. While this mode is open, the screen colours the city by the chosen statistic and writes the figures over it.

The screen also makes the city's sound, live, from the same numbers.

- Route: /experiments/w2/3d/city/mobile (mobile) · /experiments/w2/3d/city/screen (laptop)
- Week: W2 · Tech: Socket.io (both directions), Three.js (React Three Fiber), instancing, a shader, Tone.js
- Inputs (mobile → screen):
  - Settings: sliders Time, Height, Downtown, Spread, Fog · switches Lights, Traffic, River, Wave, Twist, Wireframe (finger skating: slide across the rows without lifting)
  - Navigate: 1 finger = move · 2 fingers: pinch = zoom, turn = rotate, side by side and dragged up or down = tilt · the compass = north up, straight down. With a mouse: drag = move, wheel = zoom, shift + wheel = rotate, alt + wheel = tilt
  - Statistics: the row under the finger is the statistic shown
- Output back (screen → mobile): the figures, twice a second
- Parameters: names, ends and start values (`controls.ts`), the street plan (`plan.ts`), the numbers of the statistics model (`screen/stats.ts`), EASE (`screen/City.tsx`), CARS (`screen/Traffic.tsx`), GLIDE and SCALE (`screen/sound.ts`)

## Messages
| type | from → to | data |
|---|---|---|
| `controls` | mobile → screen | 5 slider values, 6 switch values |
| `view` | mobile → screen | x, z, zoom, bearing, pitch |
| `layer` | mobile → screen | "people", "gdp", "traffic", "freight", or null when the Statistics mode is closed |
| `stats` | screen → mobile | the city's figures |

## How it works
- `controls.ts` and `plan.ts` are imported by both pages: the same names, the same city on both sides.
- Mobile, `page.tsx`: the socket, the mode switch, and the three pages side by side (`Settings.tsx`, `Navigate.tsx`, `Statistics.tsx`).
- Settings: the row is found from the finger's y; on a slider row the value is the finger's x along the track; a switch flips once each time a finger arrives on its row. While a finger is on a row, its thumb turns to glass.
- Navigate: every finger's last place is kept in a `Map`. One finger moving moves the centre; with two, the change of the line between them gives zoom and rotation. The map is an SVG of the same street plan, drawn once and moved by one `transform`.
- Screen, `City.tsx`: keeps its own copy of every control and eases it toward the received one, so nothing jumps. Every frame each of the 1,600 buildings (one `instancedMesh`) gets a target height and moves a step toward it; then its floor area, residents, workers and output are worked out from its size.
- `stats.ts`: the model behind the figures. Invented numbers, but they follow from the city: floor area → people; time of day → who is at home or at work, how many vehicles are out.
- Statistics on the screen: each building's value goes to the shader (`aValue`) and becomes its colour; `Hud.tsx` writes the totals and a 24-hour curve; `Labels.tsx` places five texts on the highest buildings or on five vehicles by turning their 3D points into places on the page.
- `sky.ts` turns the time into a sky colour, a sun direction and an amount of day. `shader.ts` draws walls, windows, edges, fog and the statistic's colour. `Traffic.tsx`: vehicles are points that run along the streets.
- `sound.ts` (Tone.js), three voices: filtered noise ← vehicles out; two sawtooth waves ← the city's height (pitch) and the time of day (brightness); bell notes ← Lights and the night. Fog adds reverb, Wave makes the hum swell, zooming in makes it louder. Click "sound off" on the screen to start it.

## Run
pnpm dev → open /screen and click the /mobile link in its corner (new tab). With a mobile: open the same address with your computer's IP (same Wi-Fi).

## Status / next
Checked with two browser tabs on the laptop: the three modes, the figures coming back, the sound starting without errors. Not yet checked: a real mobile (two-finger zoom, rotate and tilt), and how the sound sounds. Next: your own parameters in `controls.ts`, your own statistics in `stats.ts`.
