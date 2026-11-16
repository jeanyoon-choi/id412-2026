import * as Tone from "tone";
import { COLS, COUNT, ROWS, rhythm } from "../grid";

// The sound of the surface. One voice per switch, 40 in all; a voice sounds while its switch is on.
//
//   row of the switch     → pitch: the near edge is low, the far edge is high (a five-note scale)
//   column of the switch  → left … right in the speakers
//   its push on the water → its loudness swells in the same rhythm (rhythm() in grid.ts)
//
// Switches in the same row play almost the same note, a few Hz apart. Two such notes together
// beat slowly: the ear hears the same interference the eye sees on the surface.
const SCALE = [0, 3, 5, 7, 10]; // semitones above the root: a minor pentatonic scale
const ROOT = 110; // Hz, the note of the near edge (A2)
const APART = 1.5; // Hz between two neighbours in a row
const LEVEL = 0.14; // loudness of one voice alone
const GLIDE = 0.1; // seconds: how quickly a voice follows its switch

export type Sound = ReturnType<typeof createSound>;

export function createSound() {
  const room = new Tone.Reverb({ decay: 5, wet: 0.4 }).toDestination();
  const out = new Tone.Limiter(-6).connect(room); // 40 voices at once must not clip

  const levels = Array.from({ length: COUNT }, (_, index) => {
    const row = Math.floor(index / COLS);
    const column = index % COLS;
    const step = ROWS - 1 - row; // the bottom row of the mobile is the near edge: the lowest note
    const semitones = Math.floor(step / SCALE.length) * 12 + SCALE[step % SCALE.length];
    const pitch = ROOT * Math.pow(2, semitones / 12) + (column - (COLS - 1) / 2) * APART;

    const level = new Tone.Gain(0).connect(out);
    const place = new Tone.Panner((column / (COLS - 1)) * 2 - 1).connect(level);
    new Tone.Oscillator(pitch, "sine").connect(place).start();
    return level;
  });

  // Called a few times a second with the switches and the simulation's time.
  function play(switches: boolean[], time: number) {
    if (Tone.getContext().state !== "running") return; // the browser is still holding the sound back
    const on = switches.filter(Boolean).length;
    const each = LEVEL / Math.sqrt(Math.max(1, on)); // more voices: each one a little quieter
    levels.forEach((level, index) => {
      const swell = 0.5 + 0.5 * Math.sin(time * rhythm(index));
      level.gain.rampTo(switches[index] ? each * swell : 0, GLIDE);
    });
  }

  function close() {
    levels.forEach((level) => level.gain.rampTo(0, 0.05));
    room.dispose();
  }

  return { play, close };
}
