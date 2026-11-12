import { Color, Vector3 } from "three";

const NIGHT = new Color("#05060a");
const DAY = new Color("#a9bfd4");
const DUSK = new Color("#e08a5c"); // the sky when the sun is at the horizon
const NOON_SUN = new Color("#fff4e2");
const LOW_SUN = new Color("#ff9a55");

// What the sky looks like at a time of day. time: 0 = 00:00, 0.5 = 12:00, 1 = 24:00.
// The results are written into the three objects given, so nothing new is made every frame.
// Returns how much day there is: 0 = night, 1 = day.
export function skyAt(time: number, sky: Color, sun: Vector3, sunColour: Color) {
  const turn = (time - 0.25) * Math.PI * 2; // the sun rises at 06:00 and sets at 18:00
  const height = Math.sin(turn); // -1 at midnight, 0 at the horizon, 1 at noon
  const day = Math.min(1, Math.max(0, (height + 0.15) / 0.4)); // with a short dawn and dusk
  const horizon = Math.exp(-((height / 0.2) ** 2)); // 1 when the sun is at the horizon

  sky.copy(NIGHT).lerp(DAY, day).lerp(DUSK, horizon * 0.55);
  sun.set(Math.cos(turn), Math.max(height, 0.05), 0.4).normalize();
  sunColour.copy(NOON_SUN).lerp(LOW_SUN, horizon);
  return day;
}
