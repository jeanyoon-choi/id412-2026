"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, FogExp2, InstancedBufferAttribute, InstancedMesh, MeshBasicMaterial, Object3D, ShaderMaterial, Vector3 } from "three";
import { SLIDERS, START_VIEW, SWITCHES, short, type Controls, type LayerKey, type SliderKey, type Stats, type SwitchKey, type View } from "../controls";
import { PLAN, SIZE, inRiver } from "../plan";
import { fragmentShader, vertexShader } from "./shader";
import { skyAt } from "./sky";
import { FLOOR, LOT_AREA, OUTPUT, PER_RESIDENT, PER_WORKER, RAMPS, activity, type Mark } from "./stats";
import { Traffic } from "./Traffic";

const EASE = 3; // how fast the city follows the mobile (higher = faster)
const DATA_SKY = new Color("#090b10"); // the background while a statistic is shown

type Props = {
  controls: React.RefObject<Controls>; // the Settings mode
  view: React.RefObject<View | null>; // the Navigate mode (null until the map is touched)
  layer: React.RefObject<LayerKey | null>; // the Statistics mode (null = not shown)
  stats: React.RefObject<Stats>; // written here: the city's figures
  marks: React.RefObject<Mark[]>; // written here: the texts on the highest buildings
};

// 1,600 buildings, one per lot. Nothing is placed by hand: every frame each building's height
// and place are worked out again from the mobile's controls, and its statistics from its size.
export function City({ controls, view, layer, stats, marks }: Props) {
  const mesh = useRef<InstancedMesh>(null);
  const material = useRef<ShaderMaterial>(null);
  const ground = useRef<MeshBasicMaterial>(null);
  const frame = useRef(0);
  const shownLayer = useRef<LayerKey | null>(null);

  const { lots, heights, seeds, values, s, p, camera: cam, uniforms, fog, box } = useMemo(() => {
    const lots = PLAN.map((lot) => {
      const fromCentre = Math.hypot(lot.x, lot.z) / (SIZE / 2);
      const peak = Math.exp(-fromCentre * fromCentre * 4); // 1 in the centre of the city, 0 at its edge
      return {
        ...lot,
        peak,
        share: 0.6 + Math.random() ** 2 * 1.2, // its own luck
        offices: Math.min(0.95, 0.12 + peak * 0.85), // share of its floors that are offices: the centre works, the edge sleeps
        speed: 2 + Math.random() * 5, // how fast it grows
      };
    });
    return {
      lots,
      heights: new Float32Array(lots.length),
      seeds: new Float32Array(lots.map(() => Math.random())),
      values: new Float32Array(lots.length),
      // The eased value of every slider and switch, 0..1, by key.
      s: Object.fromEntries(SLIDERS.map((slider) => [slider.key, slider.start])) as Record<SliderKey, number>,
      p: Object.fromEntries(SWITCHES.map((item) => [item.key, Number(item.start)])) as Record<SwitchKey, number>,
      camera: { ...START_VIEW, stat: 0 }, // the eased view, and how much of the statistics is shown
      uniforms: {
        uTime: { value: 0 },
        uLights: { value: 0 },
        uWire: { value: 0 },
        uFog: { value: 0 },
        uDay: { value: 0 },
        uSun: { value: new Vector3() },
        uSunColour: { value: new Color() },
        uSky: { value: new Color() },
        uStat: { value: 0 },
        uLow: { value: new Color() },
        uMid: { value: new Color() },
        uHigh: { value: new Color() },
      },
      fog: new FogExp2("black", 0),
      box: new Object3D(),
    };
  }, []);

  useFrame(({ clock, camera, scene }, delta) => {
    const seconds = clock.elapsedTime;
    const { sliders, switches } = controls.current;
    const u = material.current!.uniforms; // the numbers the shader reads

    // 1. Every parameter glides toward its slider or switch (off = 0, on = 1).
    const ease = 1 - Math.exp(-delta * EASE);
    SLIDERS.forEach((slider, index) => (s[slider.key] += (sliders[index] - s[slider.key]) * ease));
    SWITCHES.forEach((item, index) => (p[item.key] += (Number(switches[index]) - p[item.key]) * ease));
    const river = switches[SWITCHES.findIndex((item) => item.key === "river")]; // not eased: the buildings sink instead
    const gap = 1 + s.spread * 0.7; // spread: everything moves apart

    // 2. The statistic to show, if any.
    const key = layer.current;
    cam.stat += ((key ? 1 : 0) - cam.stat) * ease;
    if (key && key !== shownLayer.current) {
      u.uLow.value.set(RAMPS[key][0]);
      u.uMid.value.set(RAMPS[key][1]);
      u.uHigh.value.set(RAMPS[key][2]);
    }
    shownLayer.current = key;
    const now = activity(s.time);
    const total = { people: 0, residents: 0, gdp: 0, buildings: 0, area: 0 };
    const pick = frame.current++ % 30 === 0; // twice a second: choose the buildings that get a text
    const top: { value: number; mark: Mark }[] = [];

    // 3. The buildings.
    lots.forEach((lot, n) => {
      // downtown: from the same height everywhere to towers in the centre only.
      const shape = 0.3 * (1 - s.downtown) + (0.05 + lot.peak * 1.5) * s.downtown;
      let target = (0.3 + s.height * 16) * shape * lot.share;
      if (lot.empty || (river && inRiver(lot.x, lot.z))) target = 0;
      heights[n] += (target - heights[n]) * (1 - Math.exp(-delta * lot.speed)); // one step toward it, at its own speed

      const height = heights[n] * (1 + p.wave * 0.7 * Math.sin(seconds * 1.6 + lot.x * 0.22 + lot.z * 0.16)); // wave: heights roll across the city
      const there = height > 0.02 ? 1 : 0;
      box.position.set(lot.x * gap, height / 2, lot.z * gap);
      box.rotation.y = p.twist * (lot.i + lot.j) * 0.1; // twist: each one turned a little more than its neighbour
      box.scale.set(lot.width * there, height, lot.depth * there);
      box.updateMatrix();
      mesh.current!.setMatrixAt(n, box.matrix);

      // Its statistics, from its size: floor area → residents and workers → people inside now, and output.
      const area = lot.width * lot.depth * (height / FLOOR) * LOT_AREA * there;
      const residents = (area * (1 - lot.offices)) / PER_RESIDENT;
      const workers = (area * lot.offices) / PER_WORKER;
      const people = residents * now.home + workers * now.work;
      const gdp = workers * OUTPUT * (0.6 + lot.peak * 0.8);
      total.people += people;
      total.residents += residents;
      total.gdp += gdp;
      total.area += area;
      total.buildings += there;

      // The value that colours it, 0..1 (the square root spreads the low values apart).
      const value = key === "people" ? people : key === "gdp" ? gdp : 0;
      values[n] = Math.sqrt(Math.min(1, value / (key === "gdp" ? 9e7 : 800)));
      if (pick && value > 0 && (top.length < 5 || value > top[top.length - 1].value)) {
        const text = key === "gdp" ? `$${short(value)} / yr` : `${Math.round(value).toLocaleString("en")} people`;
        top.push({ value, mark: { x: lot.x * gap, y: height, z: lot.z * gap, text: `B-${String(n).padStart(4, "0")} · ${text}` } });
        top.sort((a, b) => b.value - a.value).splice(5);
      }
    });
    mesh.current!.instanceMatrix.needsUpdate = true;
    (mesh.current!.geometry.attributes.aValue as InstancedBufferAttribute).needsUpdate = true;
    Object.assign(stats.current, total);
    if (pick && key !== "traffic" && key !== "freight") marks.current = top.map((item) => item.mark); // (Traffic.tsx writes the vehicles' texts)

    // 4. The time of day: the sky's colour, where the sun is, how much day there is.
    const day = skyAt(s.time, u.uSky.value, u.uSun.value, u.uSunColour.value);
    u.uSky.value.lerp(DATA_SKY, cam.stat * 0.92);
    u.uDay.value = day;
    scene.background = u.uSky.value;
    fog.color.copy(u.uSky.value);
    ground.current!.color.set("#020203").lerp(u.uSky.value, day * 0.55 * (1 - cam.stat));

    // 5. Windows, edges, fog, statistics.
    fog.density = 0.002 + s.fog * 0.014;
    scene.fog = fog;
    u.uTime.value = seconds;
    u.uLights.value = 0.1 + p.lights * 0.5;
    u.uWire.value = p.wire;
    u.uFog.value = fog.density;
    u.uStat.value = cam.stat;

    // 6. The camera: it circles the city until the mobile's map is touched, then it follows the map.
    const map = view.current;
    if (map) {
      cam.x += (map.x - cam.x) * ease;
      cam.z += (map.z - cam.z) * ease;
      cam.zoom += (map.zoom - cam.zoom) * ease;
      cam.bearing += (map.bearing - cam.bearing) * ease;
      cam.pitch += (map.pitch - cam.pitch) * ease;
    } else {
      cam.bearing += delta * 0.07;
    }
    const lift = 1.45 - cam.pitch * 1.1; // radians over the ground: pitch 0 = straight down, 1 = low
    const distance = 96 / cam.zoom;
    const flat = Math.cos(lift) * distance; // how far back, along the ground
    // Up on the map is the direction the camera looks: (sin bearing, -cos bearing).
    camera.position.set(cam.x * gap - Math.sin(cam.bearing) * flat, Math.sin(lift) * distance, cam.z * gap + Math.cos(cam.bearing) * flat);
    camera.lookAt(cam.x * gap, 1.5, cam.z * gap);
  });

  return (
    <>
      <instancedMesh ref={mesh} args={[undefined, undefined, lots.length]} frustumCulled={false}>
        <boxGeometry>
          <instancedBufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
          <instancedBufferAttribute attach="attributes-aValue" args={[values, 1]} />
        </boxGeometry>
        <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
      </instancedMesh>
      {/* The ground */}
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[800, 800]} />
        <meshBasicMaterial ref={ground} />
      </mesh>
      <Traffic s={s} p={p} layer={layer} stats={stats} marks={marks} />
    </>
  );
}
