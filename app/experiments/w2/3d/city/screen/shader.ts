// One shader for all the buildings. Each building is a 1 × 1 × 1 box, stretched by its instance matrix.
export const vertexShader = /* glsl */ `
  attribute float aSeed;  // one random number per building
  attribute float aValue; // its statistic, 0..1
  varying vec3 vOnBox;    // where we are on the box, in world units from its corner
  varying vec3 vSize;     // the building's width, height, depth
  varying vec3 vNormal;   // which face of the box (not rotated)
  varying vec3 vFacing;   // where that face points in the world
  varying float vSeed;
  varying float vValue;
  varying float vDepth;

  void main() {
    vSize = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
    vOnBox = (position + 0.5) * vSize;
    vNormal = normal;
    vFacing = normalize(mat3(instanceMatrix) * normal);
    vSeed = aSeed;
    vValue = aValue;
    vec4 viewPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    vDepth = -viewPosition.z;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

export const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uLights; // 0..1: how many windows are lit
  uniform float uWire;   // 0 = buildings with windows, 1 = edges only
  uniform float uFog;
  uniform float uDay;    // 0 = night, 1 = day
  uniform vec3 uSun;     // direction to the sun
  uniform vec3 uSunColour;
  uniform vec3 uSky;
  uniform float uStat;   // 0 = the city as it looks, 1 = the city coloured by a statistic
  uniform vec3 uLow;     // the statistic's colours
  uniform vec3 uMid;
  uniform vec3 uHigh;
  varying vec3 vOnBox;
  varying vec3 vSize;
  varying vec3 vNormal;
  varying vec3 vFacing;
  varying float vSeed;
  varying float vValue;
  varying float vDepth;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    // The wall: almost black at night; by day, concrete lit by the sun and the sky.
    vec3 night = vec3(0.04, 0.044, 0.055) * (vNormal.y > 0.5 ? 1.6 : 1.0);
    vec3 day = vec3(0.8, 0.79, 0.77) * (uSky * 0.45 + uSunColour * max(dot(vFacing, uSun), 0.0));
    vec3 colour = mix(night, day, uDay);

    // Windows, on the four sides only.
    if (abs(vNormal.y) < 0.5) {
      float along = abs(vNormal.x) > 0.5 ? vOnBox.z : vOnBox.x;
      vec2 cell = vec2(along / 0.3, vOnBox.y / 0.38);
      vec2 window = floor(cell) + vSeed * 100.0 + vNormal.xz * 7.0; // a number for this window
      vec2 inCell = fract(cell);
      float glass = step(0.22, inCell.x) * step(inCell.x, 0.78) * step(0.3, inCell.y) * step(inCell.y, 0.75);
      float chance = hash(window);
      // Every window rethinks, now and then, whether it is lit. By day almost none are.
      float moment = floor(uTime * 0.08 + chance * 9.0);
      float lit = step(hash(window + moment), uLights * (1.0 - uDay * 0.92));
      vec3 lamp = mix(vec3(1.0, 0.82, 0.55), vec3(0.8, 0.9, 1.0), step(0.85, chance)) * (0.6 + chance * 0.6);
      vec3 pane = mix(vec3(0.06), uSky * 0.55, uDay); // an unlit window: dark at night, the sky's reflection by day
      colour = mix(colour, mix(pane, lamp, lit), glass * (1.0 - uWire));
    }

    // Edges: close to two sides of the box at once.
    float width = 0.012 + vDepth * 0.0009;
    vec3 near = step(min(vOnBox, vSize - vOnBox), vec3(width));
    float edge = min(1.0, near.x * near.y + near.y * near.z + near.z * near.x);
    colour += edge * mix(0.1, -0.12, uDay);

    // Statistics: the whole building takes the colour of its value, low → middle → high.
    vec3 data = mix(mix(uLow, uMid, smoothstep(0.0, 0.5, vValue)), uHigh, smoothstep(0.5, 1.0, vValue));
    data *= 0.6 + 0.4 * max(dot(vFacing, normalize(vec3(0.4, 1.0, 0.3))), 0.0); // a little shading, so the boxes keep their form
    colour = mix(colour, data + edge * 0.1, uStat);

    // wire: only the edges, white at night and black by day.
    colour = mix(colour, mix(uSky * 0.9, vec3(1.0 - uDay * (1.0 - uStat)), edge), uWire);

    // Fog: far things fade into the sky.
    float fog = 1.0 - exp(-uFog * uFog * vDepth * vDepth);
    gl_FragColor = vec4(mix(colour, uSky, fog), 1.0);
  }
`;
