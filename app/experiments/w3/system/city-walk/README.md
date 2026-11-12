# City Walk

Shibuya crossing in the early evening, built from real map data. Every phone is one walker seeing the city in first person; the screen sees the whole city from above, with a beam of light on each walker. Many phones, one shared place.

- Route: /experiments/w3/system/city-walk/mobile (phones) · /experiments/w3/system/city-walk/screen (laptop)
- Week: W3 · Tech: Socket.io, Three.js (one shader for the sky, one for the edge)
- Inputs: phone drag, up / down walks and left / right turns (continuous) → every other device
- Parameters: SPEED, TURN, STICK (mobile) · TIMEOUT, EASE, BEAM (`common/Walkers.tsx`) · SOLID, FADE, LIMIT (`common/shibuya.ts`) · SUN, HAZE (`common/Sky.tsx`)

## How it works
- Three folders: `mobile/` and `screen/` are the two pages, `common/` is what both use.
- `common/shibuya.json` holds building outlines with heights, roads, zebra crossings and rails within 275 m of the crossing, from OpenStreetMap (© OpenStreetMap contributors). `shibuya.ts` reads it and answers `blocked(x, z)`.
- Every device builds the same city from the same file, so a position means the same place everywhere. `geometry.ts` turns the outlines into walls, roofs and road ribbons; `textures.ts` draws the windows and road markings on a canvas.
- Each phone makes an id and a colour once, moves its own camera, and sends `pose` `{ id, hue, x, z, yaw }` about 15 times a second, also when standing still.
- Screen and phones keep the latest pose per id (`useWalkers`). No message for `TIMEOUT` ms means that walker has left: the relay does not announce it.
- The data stops at some distance. Beyond `SOLID` the buildings are drawn as drifting points that thin out to nothing at `FADE` (`Edge.tsx`).

## Run
pnpm dev → open /screen, then click the /mobile link in its corner a few times (each tab is one walker; drag with the mouse). With phones: pnpm dev:mobile, same Wi-Fi.

## Status / next
Works with fake walkers and with mobile tabs on one laptop; not yet tried on real phones. Next: give each walker a trail on the screen, or let the screen send something back to one phone.
