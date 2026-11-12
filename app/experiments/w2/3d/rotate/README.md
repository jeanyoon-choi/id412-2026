# 3D Rotate

A 3D shape on the laptop, turned from the phone like a trackball: drag a finger and the shape follows; the "next shape" button swaps it (knot, cube, icosahedron, cone). The Three.js version of a mobile-to-screen experiment.

- Route: /experiments/w2/3d/rotate/mobile (phone) · /experiments/w2/3d/rotate/screen (laptop)
- Week: W2 · Tech: Socket.io, Three.js (React Three Fiber)
- Inputs: phone drag (continuous), next-shape button (discrete) → screen
- Parameters: SEND_INTERVAL (33 ms, mobile), TURN (4 rad per screen width), EASE (0.12), SHAPES (4) (screen)

## How it works
- Both pages call `useSocket("3d-rotate", …)`.
- Mobile: pointer events on a full-screen pad. It adds up how far the finger moved (divided by the phone's width) and sends the sum as `rotate` `{ x, y }` at most every `SEND_INTERVAL` ms.
- The button sends `next` once per tap.
- Screen: `onMessage` adds the movement × `TURN` to a target rotation kept in a ref (no re-render per message).
- `useFrame` eases the mesh's rotation toward the target every frame, so 30 messages a second look smooth at 60 fps.
- `next` changes React state; the `<mesh>` shows a different geometry. `meshNormalMaterial` needs no lights.

## Run
pnpm dev (starts Next + the relay) → open /screen and click the /mobile link in its corner (new tab); drag with the mouse there. With a phone: pnpm dev:mobile, accept the warning at :4000 and :3000 on the phone, same Wi-Fi.

## Status / next
Written and type-checked; the screen renders. Next: one shape per phone (send an id with every message), or use tilt (see `w2/tilt`) instead of drag.
