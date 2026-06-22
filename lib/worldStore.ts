"use client";
import { create } from "zustand";
import { BlockType, VoxelMap, WorldConfig, voxelKey } from "./worldTypes";
import { generateWorld } from "./worldGen";

export interface WorldState {
  voxels: VoxelMap;
  surfaceHeight: number[][];
  config: WorldConfig;
  tick: number;

  initWorld: (overrides?: Partial<WorldConfig>) => void;
  setBlock: (x: number, y: number, z: number, type: BlockType) => void;
  removeBlock: (x: number, y: number, z: number) => void;
  advanceTick: () => void;
}

const DEFAULT_CONFIG: WorldConfig = { width: 48, depth: 48, seed: 42 };

export const useWorldStore = create<WorldState>((set, get) => ({
  voxels: new Map(),
  surfaceHeight: [],
  config: DEFAULT_CONFIG,
  tick: 0,

  initWorld: (overrides = {}) => {
    const config = { ...DEFAULT_CONFIG, ...overrides };
    const { voxels, surfaceHeight } = generateWorld(config);
    set({ voxels: new Map(voxels), surfaceHeight, config, tick: 0 });
  },

  setBlock: (x, y, z, type) => {
    const voxels = new Map(get().voxels);
    voxels.set(voxelKey(x, y, z), type);
    set({ voxels });
  },

  removeBlock: (x, y, z) => {
    const voxels = new Map(get().voxels);
    voxels.delete(voxelKey(x, y, z));
    set({ voxels });
  },

  advanceTick: () => set((s) => ({ tick: s.tick + 1 })),
}));
