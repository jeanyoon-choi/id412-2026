import * as Tone from "tone";

// The sound of the sky. Data → parameters → sound, with nothing triggered: every layer sounds all the time
// and only moves. Each mobile is one voice, and all of them together drive the wind.
//
//   one mobile            → its voice
//   x on the map          → left … right in the speakers
//   y on the map          → pitch, on a five-note scale so any number of mobiles sound well together
//   pressure (how far from 0) → loudness
//   heat                  → brightness (cold: dull, warm: open)
//
//   all the lows together → loudness of the wind
//   all the highs together → how clear the whole sound is
const SCALE = [0, 3, 5, 7, 10]; // semitones above the root: a minor pentatonic scale
const ROOT = 110; // Hz, the lowest note (A2)
const STEPS = 15; // three octaves of the scale, from the bottom of the map to the top
const GLIDE = 0.15; // seconds: how quickly the sound follows the sky

type Point = { x: number; y: number; pressure: number; heat: number };
type Voice = { tone: Tone.Oscillator; colour: Tone.Filter; place: Tone.Panner; level: Tone.Gain };

export type Sound = ReturnType<typeof createSound>;

export function createSound() {
  // Everything goes through one filter (the clearness of the sky) and one reverb (its size).
  const room = new Tone.Reverb({ decay: 6, wet: 0.45 }).toDestination();
  const sky = new Tone.Filter(2500, "lowpass").connect(room);

  // Wind: pink noise through a filter that sweeps slowly up and down (the gusts).
  const windLevel = new Tone.Gain(0).connect(sky);
  const windTone = new Tone.Filter(500, "bandpass").connect(windLevel);
  new Tone.Noise("pink").connect(windTone).start();
  new Tone.LFO(0.11, 250, 900).connect(windTone.frequency).start();

  const voices = new Map<string, Voice>(); // one per mobile, by its id

  // Moves the voice of one mobile to where that mobile is now. The first call makes the voice.
  function tune(id: string, point: Point) {
    let voice = voices.get(id);
    if (!voice) {
      const level = new Tone.Gain(0).connect(sky);
      const place = new Tone.Panner(0).connect(level);
      const colour = new Tone.Filter(800, "lowpass").connect(place);
      const tone = new Tone.Oscillator(ROOT, "sawtooth").connect(colour).start();
      voice = { tone, colour, place, level };
      voices.set(id, voice);
    }
    // The mapping. Each line: one number of the mobile → one parameter of its voice.
    const step = Math.min(STEPS - 1, Math.floor((1 - point.y) * STEPS)); // y = 0 is the top of the map
    const semitones = Math.floor(step / SCALE.length) * 12 + SCALE[step % SCALE.length];
    voice.tone.frequency.rampTo(ROOT * Math.pow(2, semitones / 12), GLIDE);
    voice.place.pan.rampTo(point.x * 2 - 1, GLIDE);
    voice.level.gain.rampTo(Math.abs(point.pressure) * 0.12, GLIDE);
    voice.colour.frequency.rampTo(900 * Math.pow(4, point.heat), GLIDE); // −1: 225 Hz … 0: 900 Hz … 1: 3600 Hz
  }

  // The mobile is gone: its voice too.
  function forget(id: string) {
    const voice = voices.get(id);
    if (!voice) return;
    voices.delete(id);
    Object.values(voice).forEach((node) => node.dispose());
  }

  // The whole sky: `lows` and `highs` are the summed pressures of all mobiles, each 0 or more.
  function weather(lows: number, highs: number) {
    windLevel.gain.rampTo(Math.min(1, lows / 2) * 0.5, GLIDE); // two full lows: full wind
    sky.frequency.rampTo(2500 * Math.pow(3, Math.min(1, highs / 2) - Math.min(1, lows / 2)), GLIDE); // overcast: 830 Hz … clear: 7500 Hz
  }

  function close() {
    for (const id of [...voices.keys()]) forget(id);
    windLevel.gain.value = 0;
    room.dispose();
  }

  return { tune, forget, weather, close };
}
