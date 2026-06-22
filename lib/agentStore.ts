"use client";
import { create } from "zustand";
import { Agent, AgentAction, AGENT_TEMPLATES, Memory } from "./agentTypes";
import { BlockType, voxelKey } from "./worldTypes";

export interface AgentState {
  agents: Agent[];
  simRunning: boolean;
  simSpeed: number; // ms between ticks

  spawnAgents: (surfaceHeight: number[][], worldWidth: number, worldDepth: number) => void;
  applyAction: (
    agentId: string,
    action: AgentAction,
    tick: number,
    worldVoxels: Map<string, BlockType>,
    setBlock: (x: number, y: number, z: number, type: BlockType) => void,
    surfaceHeight: number[][]
  ) => void;
  setSimRunning: (v: boolean) => void;
  setSimSpeed: (ms: number) => void;
  clearSpeech: (tick: number) => void;
}

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: [],
  simRunning: false,
  simSpeed: 4000,

  spawnAgents: (surfaceHeight, worldWidth, worldDepth) => {
    // Spread agents around the centre of the map
    const cx = Math.floor(worldWidth / 2);
    const cz = Math.floor(worldDepth / 2);
    const offsets = [[-3, -3], [3, -3], [0, 0], [-3, 3], [3, 3]];

    const agents: Agent[] = AGENT_TEMPLATES.map((tmpl, i) => {
      const [dx, dz] = offsets[i];
      const x = clamp(cx + dx, 0, worldWidth - 1);
      const z = clamp(cz + dz, 0, worldDepth - 1);
      const y = (surfaceHeight[z]?.[x] ?? 3) + 1;
      return { ...tmpl, x, y, z };
    });

    set({ agents });
  },

  applyAction: (agentId, action, tick, worldVoxels, setBlock, surfaceHeight) => {
    set((state) => {
      const agents = state.agents.map((a) => {
        if (a.id !== agentId) return a;

        const memory: Memory = {
          tick,
          thought: action.thought,
          action: action.action,
          detail: action.message ?? action.resource ?? (action.targetX !== undefined ? `(${action.targetX},${action.targetZ})` : ""),
        };

        let { x, y, z, inventory, health, hunger, speech, speechTick } = a;
        hunger = clamp(hunger - 2, 0, 100);
        if (hunger === 0) health = clamp(health - 5, 0, 100);

        switch (action.action) {
          case "move":
          case "explore": {
            const maxX = (surfaceHeight[0]?.length ?? 1) - 1;
            const maxZ = surfaceHeight.length - 1;
            const nx = clamp(action.targetX ?? x, 0, maxX);
            const nz = clamp(action.targetZ ?? z, 0, maxZ);
            const ny = (surfaceHeight[nz]?.[nx] ?? y - 1) + 1;
            x = nx; z = nz; y = ny;
            break;
          }
          case "gather":
          case "chop": {
            inventory = { ...inventory, wood: inventory.wood + 2 };
            hunger = clamp(hunger - 1, 0, 100);
            break;
          }
          case "mine": {
            inventory = { ...inventory, stone: inventory.stone + 2 };
            if (action.resource === "ore") inventory = { ...inventory, ore: inventory.ore + 1 };
            break;
          }
          case "build": {
            const bx = action.targetX ?? x;
            const by = action.targetY ?? y;
            const bz = action.targetZ ?? z;
            const blockType = (action.buildBlock as BlockType) ?? "planks";
            setBlock(bx, by, bz, blockType);
            // deduct cost
            if (blockType === "planks" || blockType === "thatch") {
              inventory = { ...inventory, wood: Math.max(0, inventory.wood - 2) };
            } else if (blockType === "cobblestone" || blockType === "brick") {
              inventory = { ...inventory, stone: Math.max(0, inventory.stone - 2) };
            }
            break;
          }
          case "talk": {
            speech = action.message ?? "";
            speechTick = tick;
            break;
          }
          case "rest": {
            hunger = clamp(hunger + 10, 0, 100);
            if (inventory.food > 0) {
              inventory = { ...inventory, food: inventory.food - 1 };
              hunger = clamp(hunger + 20, 0, 100);
            }
            break;
          }
        }

        return {
          ...a,
          x, y, z,
          inventory,
          health,
          hunger,
          speech,
          speechTick,
          currentThought: action.thought,
          currentAction: action.action,
          age: a.age + 1,
          memories: [memory, ...a.memories].slice(0, 10),
        };
      });
      return { agents };
    });
  },

  setSimRunning: (v) => set({ simRunning: v }),
  setSimSpeed: (ms) => set({ simSpeed: ms }),

  clearSpeech: (tick) => {
    set((state) => ({
      agents: state.agents.map((a) =>
        tick - a.speechTick > 4 ? { ...a, speech: "" } : a
      ),
    }));
  },
}));
