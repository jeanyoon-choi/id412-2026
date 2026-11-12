// Every particle has two positions: its place on the sphere (position) and a random
// place far away (aScatter). uScatter slides it from one to the other, on the GPU.
export const vertexShader = /* glsl */ `
  uniform float uScatter; // 0 = sphere, 1 = fully apart
  uniform float uSize;
  attribute vec3 aScatter;
  varying float vDistance;

  void main() {
    // Each particle leaves at its own moment: the sphere crumbles instead of inflating.
    float delay = fract(sin(dot(position, vec3(12.9898, 78.233, 37.719))) * 43758.5453) * 0.5;
    float amount = smoothstep(delay, delay + 0.5, uScatter);
    vec3 place = mix(position, aScatter, amount);

    vec4 viewPosition = modelViewMatrix * vec4(place, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = uSize / -viewPosition.z; // farther = smaller
    vDistance = amount;
  }
`;

export const fragmentShader = /* glsl */ `
  varying float vDistance;

  void main() {
    // A round dot instead of a square.
    float fromCentre = length(gl_PointCoord - 0.5);
    if (fromCentre > 0.5) discard;
    // White on the sphere, warm orange once it has left.
    vec3 colour = mix(vec3(1.0), vec3(1.0, 0.5, 0.2), vDistance);
    gl_FragColor = vec4(colour, 0.8);
  }
`;
