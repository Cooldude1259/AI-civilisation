"use client";
import { useMemo, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky } from "@react-three/drei";
import * as THREE from "three";
import { useWorldStore } from "@/lib/worldStore";
import { BlockType, BLOCK_COLORS, parseKey } from "@/lib/worldTypes";
import AgentMeshes from "./AgentMeshes";

// Block types we actually render (skip air)
const RENDERABLE: BlockType[] = [
  "grass", "dirt", "stone", "sand", "water",
  "wood_log", "leaves", "snow", "ore", "gravel",
  "planks", "cobblestone", "farmland", "thatch", "brick",
];

// Roughness / metalness per block type for material variety
const BLOCK_MATERIAL: Record<BlockType, { roughness: number; metalness: number; opacity?: number }> = {
  air:         { roughness: 1, metalness: 0 },
  grass:       { roughness: 0.9, metalness: 0 },
  dirt:        { roughness: 1,   metalness: 0 },
  stone:       { roughness: 0.8, metalness: 0.1 },
  sand:        { roughness: 1,   metalness: 0 },
  water:       { roughness: 0.1, metalness: 0, opacity: 0.75 },
  wood_log:    { roughness: 0.9, metalness: 0 },
  leaves:      { roughness: 1,   metalness: 0, opacity: 0.85 },
  snow:        { roughness: 0.6, metalness: 0 },
  ore:         { roughness: 0.4, metalness: 0.6 },
  gravel:      { roughness: 1,   metalness: 0 },
  planks:      { roughness: 0.8, metalness: 0 },
  cobblestone: { roughness: 0.9, metalness: 0.05 },
  farmland:    { roughness: 1,   metalness: 0 },
  thatch:      { roughness: 1,   metalness: 0 },
  brick:       { roughness: 0.8, metalness: 0 },
};

function InstancedBlocks({ blockType, positions }: { blockType: BlockType; positions: [number, number, number][] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const mat = BLOCK_MATERIAL[blockType];
  const color = BLOCK_COLORS[blockType];
  const isTransparent = mat.opacity !== undefined && mat.opacity < 1;

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    positions.forEach(([x, y, z], i) => {
      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  if (positions.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        roughness={mat.roughness}
        metalness={mat.metalness}
        transparent={isTransparent}
        opacity={mat.opacity ?? 1}
        side={isTransparent ? THREE.DoubleSide : THREE.FrontSide}
      />
    </instancedMesh>
  );
}

function WorldMesh() {
  const voxels = useWorldStore((s) => s.voxels);
  const config = useWorldStore((s) => s.config);

  const grouped = useMemo(() => {
    const map = new Map<BlockType, [number, number, number][]>();
    for (const t of RENDERABLE) map.set(t, []);

    for (const [key, block] of voxels) {
      if (block === "air") continue;
      const arr = map.get(block);
      if (!arr) continue;
      const [x, y, z] = parseKey(key);
      arr.push([x - config.width / 2, y, z - config.depth / 2]);
    }
    return map;
  }, [voxels, config]);

  return (
    <>
      {RENDERABLE.map((bt) => (
        <InstancedBlocks key={bt} blockType={bt} positions={grouped.get(bt) ?? []} />
      ))}
    </>
  );
}

// Floating label for compass / orientation
function GroundGrid() {
  const config = useWorldStore((s) => s.config);
  const w = config.width, d = config.depth;
  return (
    <gridHelper
      args={[Math.max(w, d) * 1.5, Math.max(w, d), "#334", "#223"]}
      position={[0, -0.51, 0]}
    />
  );
}

export default function VoxelWorld() {
  return (
    <Canvas
      shadows
      camera={{ position: [40, 35, 55], fov: 55, near: 0.1, far: 1000 }}
      gl={{ antialias: true }}
      style={{ background: "#87CEEB" }}
    >
      <Sky sunPosition={[100, 80, 100]} turbidity={8} rayleigh={0.5} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[80, 120, 60]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={300}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />
      <hemisphereLight args={["#b9d5ff", "#444", 0.3]} />

      <WorldMesh />
      <AgentMeshes />
      <GroundGrid />

      <OrbitControls
        makeDefault
        minDistance={5}
        maxDistance={200}
        maxPolarAngle={Math.PI / 2 - 0.05}
        zoomSpeed={1.2}
        panSpeed={0.8}
      />
    </Canvas>
  );
}
