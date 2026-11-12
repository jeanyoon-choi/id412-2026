# Signature Live

Sign on the phone and the same signature appears on the laptop, stroke by stroke, while you are still writing. Black ink on white.

- Route: /experiments/w2/signature/live/mobile (phone) · /experiments/w2/signature/live/screen (laptop)
- Week: W2 · Tech: Socket.io, Canvas
- Inputs: finger strokes (continuous), stroke start and clear (discrete) → screen
- Parameters: SEND_INTERVAL (33 ms, mobile), WIDTH (0.7 of the screen), INK (5 px) (screen)

## How it works
- Both pages call `useSocket("signature-live", …)`.
- Mobile: pointer events on a canvas. Each move draws a line on the phone and adds the point to a waiting list.
- Every `SEND_INTERVAL` ms the waiting points are sent together as `points`. No point is dropped, so the signature keeps its detail.
- Positions are divided by the pad's width (x and y by the same number), so the shape is the same on any screen.
- `start` tells the screen a new stroke begins (do not connect it to the last one). `clear` wipes both.
- Screen: draws each arriving point as a line from the previous one. Nothing is redrawn; the canvas keeps the ink.

## Run
pnpm dev → open /screen and click the /mobile link in its corner (new tab); sign with the mouse there. With a phone: open the same address with your computer's IP.

## Status / next
Written and type-checked. Next: `signature/contracts` sends the finished signature in one message and does something with it.
