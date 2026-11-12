import * as Tone from "tone";
import type { Controls, Stats, View } from "../controls";
import { activity } from "./stats";

const GLIDE = 0.6; // seconds: how smoothly the sound follows the city
const SCALE = ["C4", "D4", "E4", "G4", "A4", "C5", "D5", "E5", "G5"]; // the notes the windows can play

// The city's sound, made live from its numbers. Three voices:
//   road    brown noise through a filter      ← how many vehicles are out
//   hum     two sawtooth waves a fifth apart  ← the city's height (pitch) and the time of day (brightness)
//   windows short bell notes at random        ← the Lights switch and the night
// Fog adds reverb; the Wave switch makes the hum swell; zooming in on the map makes everything louder.
export async function startSound() {
  await Tone.start(); // audio may only start inside a tap or click

  const reverb = new Tone.Reverb({ decay: 5, wet: 0.3 }).toDestination();

  const roadFilter = new Tone.Filter(300, "lowpass");
  const roadGain = new Tone.Gain(0);
  const road = new Tone.Noise("brown").chain(roadFilter, roadGain, reverb).start();

  const humFilter = new Tone.Filter(200, "lowpass");
  const swell = new Tone.Tremolo(0.25, 0).start();
  const humGain = new Tone.Gain(0.16);
  const root = new Tone.Oscillator(55, "sawtooth").start();
  const fifth = new Tone.Oscillator(82.5, "sawtooth").start();
  root.chain(humFilter, swell, humGain, reverb);
  fifth.connect(humFilter);

  const bells = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sine" }, envelope: { attack: 0.005, decay: 0.6, sustain: 0, release: 0.8 }, volume: -16 }).connect(reverb);
  let chance = 0; // of a bell, every eighth of a second
  const windows = new Tone.Loop((time) => {
    if (Math.random() < chance) bells.triggerAttackRelease(SCALE[Math.floor(Math.random() * SCALE.length)], 0.2, time);
  }, 0.125).start(0);
  Tone.getTransport().start();

  return {
    // Called twice a second with the city's state.
    update(controls: Controls, stats: Stats, view: View | null) {
      const [time, height, , , fog] = controls.sliders;
      const [lights, , , wave] = controls.switches;
      const now = activity(time);
      const busy = Math.min(1, stats.traffic / 1400);

      roadGain.gain.rampTo(0.04 + busy * 0.5, GLIDE); // more vehicles: louder
      roadFilter.frequency.rampTo(220 + busy * 1800, GLIDE); // and brighter

      const pitch = 82 * Math.pow(2, -height); // a taller city hums lower: 82 Hz → 41 Hz
      root.frequency.rampTo(pitch, GLIDE);
      fifth.frequency.rampTo(pitch * 1.5, GLIDE);
      humFilter.frequency.rampTo(140 + now.work * 900, GLIDE); // dull at night, open at noon
      swell.depth.rampTo(wave ? 0.9 : 0, GLIDE);

      chance = (lights ? 0.5 : 0.06) * (1 - now.work * 0.85); // windows are a night sound
      reverb.wet.rampTo(0.15 + fog * 0.7, GLIDE); // fog: everything far away
      Tone.getDestination().volume.rampTo(-14 + 10 * Math.min(1, ((view?.zoom ?? 1) - 0.6) / 3), GLIDE); // closer: louder
    },
    stop() {
      windows.dispose();
      [road, root, fifth, bells, roadFilter, roadGain, humFilter, swell, humGain, reverb].forEach((node) => node.dispose());
    },
  };
}
