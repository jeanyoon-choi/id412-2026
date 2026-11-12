# Projection Mapping

A test pattern mapped onto the two walls of the 1st-floor Black Room: a numbered grid and a white ball that crosses from the left wall onto the right one. The method to copy for the final: content inside a frame that is fitted to the wall.

- Route: /experiments/w3/projection-mapping?side=left · /experiments/w3/projection-mapping?side=right
- Week: W3 · Tech: CSS (a positioned frame), Canvas
- Inputs: four sliders per projector (top, left, width, height), time
- Parameters: FRAMES (the four numbers per projector, `MappingFrame.tsx`), WALL sizes 1920 × 602 and 1675 × 602, SPEED (`Content.tsx`)

## How it works
- One laptop per projector, each in a full-screen browser: `?side=left` and `?side=right`.
- `MappingFrame` paints the whole window black and puts its children in a frame placed with `top / left / width / height` in vh / vw. Outside the frame nothing is lit: that is the crop.
- Move the sliders until the red dashed outline sits on the wall's edges, then write the numbers into `FRAMES` and press hide. Click the top-left corner to get the sliders back.
- `Content` is the artwork. It sizes itself from the frame (`width: 100%; height: 100%`), never from the window (`100vw / 100vh`).
- The canvas is drawn in wall pixels. Both walls are one strip of 3595 × 602; the right wall draws the same strip shifted by 1920, so things continue across the corner.
- The ball's position comes from the clock, so the two laptops agree without a socket.

## Run
pnpm dev → open both routes. In the room: one browser per projector, full screen (F11 / Ctrl+Cmd+F).

## Status / next
Works on a laptop. The starting numbers in `FRAMES` are from an earlier set-up of the room and need re-tuning on site. Next: replace `Content` with your piece.
