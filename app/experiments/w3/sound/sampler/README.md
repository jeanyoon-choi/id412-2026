# Sampler

Four recorded sounds on four pads: bell, wood, string, breath. Press a pad to play its file; press higher in the pad and it plays faster and higher. The breath pad loops until you press it again.

- Route: /experiments/w3/sound/sampler
- Week: W3 · Tech: Tone.js (`Tone.Players`)
- Inputs: press on a pad (discrete), height of the press in the pad (continuous)
- Parameters: PADS (name, loop), speed 0.5× to 2×

## How it works
- The files are in `public/experiments/w3/sound/sampler/`. `Tone.Players` loads all four when the page opens; the pads say "loading…" until then.
- A press sets `player.playbackRate` from the height in the pad, then `player.start()`. Half speed is one octave down.
- `player.loop = true` makes a sample repeat: that is how a bed of sound is made from a short file.
- The four files are placeholders made by code, not recordings.

## Run
pnpm dev → open the route, press the pads.

## Status / next
The files load and the pads respond without errors; the sound itself has not been listened to yet. Next: replace the four `.wav` files with your own recordings (same names, or change PADS).
