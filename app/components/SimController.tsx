"use client";
import { useEffect, useRef } from "react";
import { useAgentStore } from "@/lib/agentStore";
import { useWorldStore } from "@/lib/worldStore";
import { BlockType, voxelKey } from "@/lib/worldTypes";

// Snapshot a small window of voxels around a point to send to the API
function sampleVoxels(
  voxels: Map<string, BlockType>,
  cx: number, cy: number, cz: number,
  radius = 4
): Record<string, string> {
  const out: Record<string, string> = {};
  for (let dx = -radius; dx <= radius; dx++)
    for (let dz = -radius; dz <= radius; dz++)
      for (let dy = -1; dy <= 3; dy++) {
        const key = voxelKey(cx + dx, cy + dy, cz + dz);
        const b = voxels.get(key);
        if (b && b !== "air") out[key] = b;
      }
  return out;
}

export default function SimController() {
  const { agents, simRunning, simSpeed, applyAction, clearSpeech } = useAgentStore();
  const { voxels, tick, advanceTick, setBlock, surfaceHeight, config } = useWorldStore();
  const tickingRef = useRef(false);

  useEffect(() => {
    if (!simRunning || agents.length === 0) return;

    const run = async () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      advanceTick();
      clearSpeech(tick);

      // Think for each agent sequentially (keeps API calls manageable)
      for (const agent of agents) {
        try {
          const snapshot = sampleVoxels(voxels, agent.x, agent.y, agent.z);
          const otherAgents = agents
            .filter((a) => a.id !== agent.id)
            .map((a) => ({ name: a.name, x: a.x, z: a.z, speech: a.speech }));

          const res = await fetch("/api/agent/think", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              agent,
              voxelSnapshot: snapshot,
              otherAgents,
              tick,
              worldWidth: config.width,
              worldDepth: config.depth,
            }),
          });

          const { action } = await res.json();
          applyAction(agent.id, action, tick, voxels, setBlock, surfaceHeight);
        } catch (e) {
          console.error(`Agent ${agent.id} think error`, e);
        }
      }

      tickingRef.current = false;
    };

    const interval = setInterval(run, simSpeed);
    return () => clearInterval(interval);
  }, [simRunning, simSpeed, agents, voxels, tick, config]);

  return null;
}
