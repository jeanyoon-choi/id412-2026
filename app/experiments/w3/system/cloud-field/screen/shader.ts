// The vertex shader places the full-screen triangle. It never changes.
export const VERTEX_SHADER = `#version 300 es
in vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// A sky of clouds that every phone bends a little. Each phone is one pressure centre:
// u_points[i] = (x, y, pressure, heat). The shader adds all of them up at every pixel, like forces:
// 1. cover: lows gather cloud, highs clear it.  2. turn: air circles each centre.  3. heat: the colour of the light.
export const FRAGMENT_SHADER = `#version 300 es
precision highp float;

const int MAX_POINTS = 16; // the same number as in screen/page.tsx

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_points[MAX_POINTS]; // x, y in 0..1 ((0,0) is bottom-left), pressure −1..1, heat −1..1
uniform int u_count;

out vec4 outputColor;

const float RADIUS = 0.32; // how far one centre reaches, in screen heights
const float COVER = 0.28;  // how much cloud a full low adds (and a full high removes)
const float SWIRL = 2.4;   // radians the air turns at the middle of a full low
const float SCALE = 2.6;   // size of the clouds; more = smaller clouds
const float WIND = 0.03;   // how fast the whole sky drifts
const int OCTAVES = 5;

float random(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
}

// Value noise and fbm, the same as in w1/glsl/noise-field.
float noise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  vec2 blend = f * f * (3.0 - 2.0 * f);
  float a = random(cell);
  float b = random(cell + vec2(1.0, 0.0));
  float c = random(cell + vec2(0.0, 1.0));
  float d = random(cell + vec2(1.0, 1.0));
  return mix(mix(a, b, blend.x), mix(c, d, blend.x), blend.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float strength = 0.5;
  for (int i = 0; i < OCTAVES; i++) {
    value += strength * noise(p);
    p *= 2.0;
    strength *= 0.5;
  }
  return value;
}

// How thick the cloud is at p, before any phone changes it. About 0..1.
float cloud(vec2 p) {
  vec2 q = p * SCALE + vec2(u_time * WIND, 0.0);
  return fbm(q + 1.2 * fbm(q * 0.6 - u_time * 0.015));
}

void main() {
  float aspect = u_resolution.x / u_resolution.y;
  vec2 uv = gl_FragCoord.xy / u_resolution.y; // x: 0..aspect, y: 0..1

  // Add up every centre. Each one counts less the further away it is (a soft bell of size RADIUS).
  float cover = 0.0;
  float heat = 0.0;
  vec2 moved = vec2(0.0); // where the turning air carries this pixel
  float marks = 0.0;
  for (int i = 0; i < MAX_POINTS; i++) {
    if (i >= u_count) break;
    vec2 away = uv - u_points[i].xy * vec2(aspect, 1.0);
    float pressure = u_points[i].z;
    float weight = exp(-dot(away, away) / (RADIUS * RADIUS));

    cover -= pressure * weight; // low pressure (−) gathers cloud, high pressure (+) clears
    heat += u_points[i].w * weight;

    // Air circles a low one way and a high the other way, fastest at the centre.
    float angle = -pressure * weight * SWIRL;
    vec2 turned = vec2(away.x * cos(angle) - away.y * sin(angle), away.x * sin(angle) + away.y * cos(angle));
    moved += turned - away;

    // A thin ring where the phone is.
    marks += smoothstep(0.003, 0.0, abs(length(away) - 0.012));
  }

  vec2 p = uv + moved;
  float thickness = cloud(p);
  // The threshold decides how much of the noise counts as cloud. The phones move it.
  float edge = 0.52 - COVER * cover;
  float amount = smoothstep(edge, edge + 0.22, thickness);

  // Light comes from above: where the cloud is thicker a little higher up, we are in its shade.
  float shade = clamp((cloud(p + vec2(0.0, 0.06)) - thickness) * 4.0, 0.0, 1.0);

  // Heat tints the light: cold blue, neutral white, warm amber.
  heat = clamp(heat, -1.0, 1.0);
  vec3 light = mix(vec3(1.0), heat > 0.0 ? vec3(1.0, 0.72, 0.5) : vec3(0.55, 0.72, 1.0), abs(heat));

  vec3 sky = mix(vec3(0.05, 0.06, 0.08), vec3(0.01, 0.012, 0.02), uv.y) * (0.6 + 0.4 * light);
  vec3 white = light * mix(1.0, 0.35, shade);
  vec3 colour = mix(sky, white, amount * 0.92);

  colour += marks * 0.6;
  outputColor = vec4(colour, 1.0);
}
`;
