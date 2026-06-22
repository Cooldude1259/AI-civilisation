"use client";
import { create } from "zustand";
import { Tile, WorldConfig, Building, BuildingType } from "./worldTypes";
import { generateWorld } from "./worldGen";

export interface WorldState {
  tiles: Tile[][];
  config: WorldConfig;
  tick: number;
  selectedTile: { x: number; y: number } | null;

  // actions
  initWorld: (config?: Partial<WorldConfig>) => void;
  selectTile: (x: number, y: number) => void;
  clearSelection: () => void;
  placeBuilding: (x: number, y: number, type: BuildingType, agentId: string) => void;
  harvestResource: (x: number, y: number, resourceType: string, amount: number) => void;
  advanceTick: () => void;
}

const DEFAULT_CONFIG: WorldConfig = {
  width: 40,
  height: 30,
  seed: 42,
};

export const useWorldStore = create<WorldState>((set, get) => ({
  tiles: [],
  config: DEFAULT_CONFIG,
  tick: 0,
  selectedTile: null,

  initWorld: (overrides = {}) => {
    const config = { ...DEFAULT_CONFIG, ...overrides };
    const tiles = generateWorld(config);
    set({ tiles, config, tick: 0, selectedTile: null });
  },

  selectTile: (x, y) => set({ selectedTile: { x, y } }),
  clearSelection: () => set({ selectedTile: null }),

  placeBuilding: (x, y, type, agentId) => {
    const { tiles, tick } = get();
    const tile = tiles[y]?.[x];
    if (!tile || tile.building) return;

    const building: Building = {
      id: `${type}-${x}-${y}-${tick}`,
      type,
      builtBy: agentId,
      builtAt: tick,
      level: 1,
    };

    const newTiles = tiles.map((row, ry) =>
      row.map((t, rx) =>
        rx === x && ry === y ? { ...t, building } : t
      )
    );
    set({ tiles: newTiles });
  },

  harvestResource: (x, y, resourceType, amount) => {
    const { tiles } = get();
    const newTiles = tiles.map((row, ry) =>
      row.map((t, rx) => {
        if (rx !== x || ry !== y) return t;
        return {
          ...t,
          resources: t.resources.map((r) =>
            r.type === resourceType
              ? { ...r, amount: Math.max(0, r.amount - amount) }
              : r
          ),
        };
      })
    );
    set({ tiles: newTiles });
  },

  advanceTick: () => {
    // Resource regeneration each tick
    const { tiles, tick } = get();
    const newTiles = tiles.map((row) =>
      row.map((t) => ({
        ...t,
        resources: t.resources.map((r) => ({
          ...r,
          amount: Math.min(r.maxAmount, r.amount + (tick % 5 === 0 ? 1 : 0)),
        })),
      }))
    );
    set({ tiles: newTiles, tick: tick + 1 });
  },
}));
