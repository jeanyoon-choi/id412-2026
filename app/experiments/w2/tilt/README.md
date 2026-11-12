# Tilt

Tilt the phone and a white ball rolls across the laptop screen, as if the screen were a table you are holding. It bounces off the edges and leaves a short trail.

- Route: /experiments/w2/tilt/mobile (phone) · /experiments/w2/tilt/screen (laptop)
- Week: W2 · Tech: Socket.io, DeviceOrientation (phone sensor), Canvas
- Inputs: phone tilt left/right and front/back (continuous), start tap (discrete) → screen
- Parameters: SEND_INTERVAL (33 ms, mobile), GRAVITY (0.6), FRICTION (0.98), BOUNCE (0.6), RADIUS (30 px) (screen)

## How it works
- Mobile: the `deviceorientation` event gives `gamma` (left/right) and `beta` (front/back) in degrees. Each is divided by 45 and clamped to -1..1.
- The sensor needs https, and on iOS a permission pop-up that only opens inside a tap: the "start tilt" button calls `DeviceOrientationEvent.requestPermission()`.
- Mobile sends `tilt` `{ x, y }` at most every `SEND_INTERVAL` ms.
- Screen: `onMessage` stores the latest tilt in a ref. The `requestAnimationFrame` loop uses it as acceleration: speed += tilt × GRAVITY, position += speed.
- Walls reverse the speed and keep `BOUNCE` of it.

## Run
A phone is needed (a laptop has no tilt sensor): pnpm dev:mobile, open the `phone:` URL at :4000 once on the phone and accept the warning, then /mobile on the phone and /screen on the laptop. Same Wi-Fi.

## Status / next
Written and type-checked; not yet tried on a real phone. Next: one ball per phone (send an id with every message), or map tilt to colour instead of position.
