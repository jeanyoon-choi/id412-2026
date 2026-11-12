# 3D Particles

A slowly turning sphere of 40,000 points of light on the laptop. Put two fingers on the phone: pull them apart and the sphere crumbles into a cloud of particles; bring them together and it closes again.

- Route: /experiments/w2/3d/particles/mobile (phone) · /experiments/w2/3d/particles/screen (laptop)
- Week: W2 · Tech: Socket.io, Three.js (React Three Fiber), GLSL (ShaderMaterial)
- Inputs: distance between two fingers (continuous) → screen
- Parameters: FULL (0.8 of the diagonal = fully apart), SEND_INTERVAL (33 ms) (mobile), COUNT (40,000), RADIUS (1.5), FAR (9), EASE (0.08), SPIN (0.15 rad/s) (screen)

## How it works
- Both pages call `useSocket("3d-particles", …)`.
- Mobile: every finger on the glass is a pointer with its own id. A `Map` keeps them; each is drawn as a dot, with a dashed line between the first two.
- The distance between the two fingers, divided by the screen's diagonal, becomes `scatter` (0..1), sent at most every `SEND_INTERVAL` ms. When a finger lifts, 0 is sent.
- Screen: every particle has two positions, made once: a point on the sphere and a random point far away (`aScatter`).
- The vertex shader (`shader.ts`) mixes the two with the uniform `uScatter`. Moving 40,000 points is one number sent to the GPU, not 40,000 updates in Javascript.
- Each particle starts moving at its own moment (a delay from a hash of its position), so the sphere crumbles instead of inflating.
- `useFrame` turns the sphere a little every frame and eases `uScatter` toward the phone's latest value.

## Run
pnpm dev → open /screen. Two fingers need a touch screen: open /mobile on a phone with your computer's IP (same Wi-Fi).

## Status / next
Written and type-checked; the screen renders and turns. Two-finger input was not tried on a real phone. Next: the angle of the two fingers for rotation, or a third finger for colour.
