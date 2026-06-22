"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { useAgentStore } from "@/lib/agentStore";
import { useWorldStore } from "@/lib/worldStore";

function AgentCharacter({ agent }: { agent: { id: string; name: string; color: string; x: number; y: number; z: number; speech: string; currentAction: string | null } }) {
  const groupRef = useRef<THREE.Group>(null);
  const config = useWorldStore((s) => s.config);

  // Offset to match how WorldMesh centres the world
  const wx = agent.x - config.width / 2;
  const wy = agent.y;
  const wz = agent.z - config.depth / 2;

  // Gentle bob animation
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = wy + Math.sin(state.clock.elapsedTime * 2 + agent.x) * 0.05;
  });

  return (
    <group ref={groupRef} position={[wx, wy, wz]}>
      {/* Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.6, 0.7, 0.35]} />
        <meshStandardMaterial color={agent.color} roughness={0.7} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={agent.color} roughness={0.6} />
      </mesh>

      {/* Eyes (white dots) */}
      <mesh position={[-0.12, 1.15, 0.26]}>
        <boxGeometry args={[0.1, 0.08, 0.02]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[0.12, 1.15, 0.26]}>
        <boxGeometry args={[0.1, 0.08, 0.02]} />
        <meshStandardMaterial color="#fff" />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.15, -0.05, 0]} castShadow>
        <boxGeometry args={[0.25, 0.5, 0.3]} />
        <meshStandardMaterial color={agent.color} roughness={0.8} />
      </mesh>
      <mesh position={[0.15, -0.05, 0]} castShadow>
        <boxGeometry args={[0.25, 0.5, 0.3]} />
        <meshStandardMaterial color={agent.color} roughness={0.8} />
      </mesh>

      {/* Name tag */}
      <Text
        position={[0, 1.8, 0]}
        fontSize={0.35}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="black"
        renderOrder={1}
      >
        {agent.name}
      </Text>

      {/* Speech bubble */}
      {agent.speech && (
        <Text
          position={[0, 2.3, 0]}
          fontSize={0.28}
          color="#ffffcc"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#333"
          maxWidth={4}
          renderOrder={2}
        >
          {`"${agent.speech}"`}
        </Text>
      )}

      {/* Action indicator dot above head */}
      {agent.currentAction && agent.currentAction !== "rest" && (
        <mesh position={[0, 1.65, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.8} />
        </mesh>
      )}
    </group>
  );
}

export default function AgentMeshes() {
  const agents = useAgentStore((s) => s.agents);
  return (
    <>
      {agents.map((a) => (
        <AgentCharacter key={a.id} agent={a} />
      ))}
    </>
  );
}
