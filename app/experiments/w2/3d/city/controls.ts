// The controls on the mobile = the parameters of the city on the screen. Both pages import this file.

// Sliders: how much. low / high = what the two ends of the slider mean.
export const SLIDERS = [
  { key: "time", name: "Time", low: "00:00", high: "24:00", start: 0.9 }, // night at both ends, noon in the middle
  { key: "height", name: "Height", low: "Low", high: "High", start: 0.5 },
  { key: "downtown", name: "Downtown", low: "Even", high: "Centre", start: 0.6 }, // the same height everywhere ↔ towers in the centre only
  { key: "spread", name: "Spread", low: "Dense", high: "Apart", start: 0 },
  { key: "fog", name: "Fog", low: "Clear", high: "Thick", start: 0.25 },
] as const;

// Switches: on or off.
export const SWITCHES = [
  { key: "lights", name: "Lights", start: true }, // most windows lit / a few
  { key: "traffic", name: "Traffic", start: true }, // many cars / a few
  { key: "river", name: "River", start: false }, // clears a river through the city
  { key: "wave", name: "Wave", start: false }, // the heights roll across the city
  { key: "twist", name: "Twist", start: false }, // every building turned a little more than its neighbour
  { key: "wire", name: "Wireframe", start: false }, // only the edges are drawn
] as const;

export type SliderKey = (typeof SLIDERS)[number]["key"];
export type SwitchKey = (typeof SWITCHES)[number]["key"];
export type Controls = { sliders: number[]; switches: boolean[] }; // in the order above

export const START: Controls = {
  sliders: SLIDERS.map((slider) => slider.start),
  switches: SWITCHES.map((item) => item.start),
};

// The view, set in the mobile's Navigate mode like in a maps app.
export type View = {
  x: number; // the place in the city at the centre of the map
  z: number;
  zoom: number; // 1 = the whole city
  bearing: number; // radians: which direction is up on the map (0 = north)
  pitch: number; // 0 = straight down, 1 = low over the roofs
};
export const START_VIEW: View = { x: 0, z: 0, zoom: 1.1, bearing: 0, pitch: 0.75 };

// The value of a slider as text: the time as a clock (0.5 → "12:00"), the others as a percentage.
export function valueText(key: SliderKey, value: number) {
  if (key !== "time") return `${Math.round(value * 100)}%`;
  const minutes = Math.round(value * 24 * 60) % (24 * 60);
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

// The statistics, chosen in the mobile's Statistics mode: the screen colours the city by one of them.
export const LAYERS = [
  { key: "people", name: "Population", unit: "people in the city now" },
  { key: "gdp", name: "GDP", unit: "$ per year" },
  { key: "traffic", name: "Traffic", unit: "vehicles on the road" },
  { key: "freight", name: "Logistics", unit: "tonnes per hour" },
] as const;
export type LayerKey = (typeof LAYERS)[number]["key"];

// The figures the screen works out from the city and sends back to the mobile.
export type Stats = {
  people: number; // in the city now
  gdp: number; // $ per year
  traffic: number; // vehicles on the road
  freight: number; // tonnes per hour
  residents: number;
  buildings: number;
  area: number; // floor area, m²
  speed: number; // average, km/h
};
export const NO_STATS: Stats = { people: 0, gdp: 0, traffic: 0, freight: 0, residents: 0, buildings: 0, area: 0, speed: 0 };

// 151234 → "151.2K", 846.3 → "846"
export function short(value: number) {
  if (value < 1000) return String(Math.round(value));
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}
