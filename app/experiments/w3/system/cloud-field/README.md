# Cloud Field

One slow sky of clouds on the screen. Every phone is a pressure centre in it: a low gathers cloud and turns the air one way, a high clears the sky and turns it the other way, and heat tints the light. The shader adds all phones up at every pixel, like forces.

- Route: /experiments/w3/system/cloud-field/mobile (phones) · /experiments/w3/system/cloud-field/screen (laptop)
- Week: W3 · Tech: Socket.io, GLSL
- Inputs: phone drag on a map (position), two sliders (pressure, heat), all continuous → screen
- Parameters: RADIUS, COVER, SWIRL, SCALE, WIND (`screen/shader.ts`) · EASE, TIMEOUT, MAX_POINTS (screen) · SEND_INTERVAL (mobile)

## How it works
- Each phone makes an id once and sends its whole state `centre` `{ id, x, y, pressure, heat }` about 15 times a second, also when nothing changes.
- The screen keeps one centre per id and eases it toward the phone's values, so the sky follows slowly.
- Every frame the centres go to the shader as one list (`u_points`, `u_count`). The shader loops over them: each adds cover, a turn of the air and heat, weighted by distance.
- The clouds themselves are fbm noise (as in w1/glsl/noise-field); the phones only move its threshold and bend where it is read.
- A phone that goes silent is not cut out: its pressure eases to zero, then it is forgotten.

## Run
pnpm dev → open /screen, then click the /mobile link in its corner (several tabs = several centres). With phones: pnpm dev:mobile, same Wi-Fi.

## Status / next
Works with fake phones and with mobile tabs on one laptop; not yet tried on real phones. Up to 16 phones. Next: add a third parameter (wind direction), or drive a Tone.js layer with the summed cover.
