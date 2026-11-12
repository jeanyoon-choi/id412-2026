"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Edge } from "./Edge";
import { ribbons, roofs, walls } from "./geometry";
import { BUILDINGS, FADE, FLOOR, ROADS, SHOP, SOLID } from "./shibuya";
import { crossingTexture, floorTextures, groundTexture, roadTexture, shopTextures } from "./textures";

// Shibuya, built from the plan: ground, roads, then every building as a ground floor, upper floors and a roof.
// Everything here stands still, so each part is made once (useMemo) and drawn as one mesh.
const GLOW = 1.1; // how bright the lit windows are

export function City() {
  // Only buildings inside the SOLID circle are built. Beyond it, <Edge> draws points.
  const built = useMemo(() => BUILDINGS.filter((building) => building.distance < SOLID), []);

  const parts = useMemo(() => {
    const floors = floorTextures();
    const shops = shopTextures();
    const ground = groundTexture();
    ground.repeat.set(FADE / 4, FADE / 4); // one picture of paving every 8 m

    return {
      // One picture of upper floors is 32 m wide and 8 floors high; one picture of shops is 16 m wide.
      upper: walls(built, SHOP, (building) => building.height, 32, FLOOR * 8),
      lower: walls(built, 0, (building) => Math.min(SHOP, building.height), 16, SHOP),
      roofs: roofs(built),
      roads: ribbons(ROADS, "road", 0.04, 12),
      rails: ribbons(ROADS, "rail", 0.05, 12),
      crossings: ribbons(ROADS, "crossing", 0.07, 1.4),
      upperMaterial: new THREE.MeshStandardMaterial({ ...floors, emissive: "#ffffff", emissiveIntensity: GLOW, vertexColors: true, roughness: 0.75 }),
      lowerMaterial: new THREE.MeshStandardMaterial({ ...shops, emissive: "#ffffff", emissiveIntensity: GLOW, vertexColors: true, roughness: 0.75 }),
      groundMap: ground,
      roadMap: roadTexture(),
      crossingMap: crossingTexture(),
    };
  }, [built]);

  return (
    <group>
      {/* The ground: a disc as large as the city, and a far larger dark one under it that the haze hides */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[FADE, 96]} />
        <meshStandardMaterial map={parts.groundMap} roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.5}>
        <circleGeometry args={[6000, 48]} />
        <meshStandardMaterial color="#6a6a6c" roughness={1} />
      </mesh>

      {/* DoubleSide: flat things are seen from above whichever way their triangles turn */}
      <mesh geometry={parts.roads} receiveShadow>
        <meshStandardMaterial map={parts.roadMap} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={parts.rails} receiveShadow>
        <meshStandardMaterial color="#4a4640" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={parts.crossings} receiveShadow>
        <meshStandardMaterial map={parts.crossingMap} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      <mesh geometry={parts.lower} material={parts.lowerMaterial} castShadow receiveShadow />
      <mesh geometry={parts.upper} material={parts.upperMaterial} castShadow receiveShadow />
      <mesh geometry={parts.roofs} castShadow receiveShadow>
        <meshStandardMaterial color="#6c6f73" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      <Edge />
    </group>
  );
}
