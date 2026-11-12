# Tone Pad

The whole screen is an instrument. Press and drag: moving right raises the pitch, moving up makes the sound brighter. Let go and the note stops. The first Tone.js example.

- Route: /experiments/w3/sound/tone-pad
- Week: W3 · Tech: Tone.js
- Inputs: pointer down / up (discrete), pointer position (continuous)
- Parameters: LOW (110 Hz), HIGH (880 Hz), GLIDE (0.05 s), oscillator type (sawtooth)

## How it works
- The first press calls `await Tone.start()`: browsers only allow sound after a tap or click.
- The instrument is built once: `Tone.Synth` → `Tone.Filter` (lowpass) → speakers.
- Pointer x (0..1) → frequency between LOW and HIGH, on an exponential scale, so equal distances sound like equal steps.
- Pointer y (0..1) → the filter's cutoff, 200 Hz at the bottom to 8000 Hz at the top.
- Down = `triggerAttack`, move = `rampTo` on both values, up = `triggerRelease`.

## Run
pnpm dev → open the route, press and drag. Works with a finger on a phone too.

## Status / next
Works. Next: send x and y from a phone with `useSocket` so the laptop plays, or add `Tone.Reverb` after the filter.
