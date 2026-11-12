# Cloud Field

One slow sky of clouds on the screen. Every phone is a pressure centre in it: a low gathers cloud and turns the air one way, a high clears the sky and turns it the other way, and heat tints the light. The shader adds all phones up at every pixel, like forces.

- Route: /experiments/w3/system/cloud-field/mobile (phones) · /experiments/w3/system/cloud-field/screen (laptop)
- Week: W3 · Tech: Socket.io, GLSL, Tone.js
- Inputs: phone drag on a map (position), two sliders (pressure, heat), all continuous → screen (picture and sound)
- Parameters: RADIUS, COVER, SWIRL, SCALE, WIND (`screen/shader.ts`) · EASE, TIMEOUT, MAX_POINTS, SOUND_EVERY (screen) · SCALE, ROOT, STEPS, GLIDE (`screen/sound.ts`) · SEND_INTERVAL (mobile)

## How it works
- Each phone makes an id once and sends its whole state `centre` `{ id, x, y, pressure, heat }` about 15 times a second, also when nothing changes.
- The screen keeps one centre per id and eases it toward the phone's values, so the sky follows slowly.
- Every frame the centres go to the shader as one list (`u_points`, `u_count`). The shader loops over them: each adds cover, a turn of the air and heat, weighted by distance.
- The clouds themselves are fbm noise (as in w1/glsl/noise-field); the phones only move its threshold and bend where it is read.
- A phone that goes silent is not cut out: its pressure eases to zero, then it is forgotten.
- Sound (`screen/sound.ts`, on from the start; if the browser holds it back, the first click or key anywhere on the page lets it go): the same eased numbers drive it, nothing is triggered. Each phone is one voice: x → left/right, y → pitch on a five-note scale, pressure → loudness, heat → brightness. All lows together → loudness of the wind; highs against lows → how clear the whole sound is.

## Run
pnpm dev → open /screen, then click the /mobile link in its corner (several tabs = several centres). With phones: pnpm dev:mobile, same Wi-Fi.

## Status / next
Works with fake phones and with mobile tabs on one laptop; not yet tried on real phones. Up to 16 phones. The sound runs without errors but has not been listened to yet. Next: add a third parameter (wind direction).
