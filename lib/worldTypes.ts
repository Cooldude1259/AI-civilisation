export type TerrainType =
  | "deep_water"
  | "shallow_water"
  | "sand"
  | "grass"
  | "forest"
  | "hills"
  | "mountain"
  | "snow_peak";

export type ResourceType =
  | "wood"
  | "stone"
  | "food"
  | "fish"
  | "ore"
  | "berries";

export type BuildingType =
  | "camp"
  | "hut"
  | "house"
  | "farm"
  | "mine"
  | "lumber_mill"
  | "well"
  | "market"
  | "temple"
  | "wall";

export interface Resource {
  type: ResourceType;
  amount: number;
  maxAmount: number;
}

export interface Building {
  id: string;
  type: BuildingType;
  builtBy: string; // agent id
  builtAt: number; // tick
  level: number;
}

export interface Tile {
  x: number;
  y: number;
  terrain: TerrainType;
  resources: Resource[];
  building?: Building;
  elevation: number; // 0-1 used during generation
}

export interface WorldConfig {
  width: number;
  height: number;
  seed: number;
}

export const TERRAIN_META: Record<
  TerrainType,
  { label: string; color: string; passable: boolean; buildable: boolean }
> = {
  deep_water:    { label: "Deep Water",    color: "#1a4e8c", passable: false, buildable: false },
  shallow_water: { label: "Shallow Water", color: "#3a7abf", passable: true,  buildable: false },
  sand:          { label: "Sand",          color: "#d4b96a", passable: true,  buildable: true  },
  grass:         { label: "Grassland",     color: "#4a9e4a", passable: true,  buildable: true  },
  forest:        { label: "Forest",        color: "#1e6b1e", passable: true,  buildable: true  },
  hills:         { label: "Hills",         color: "#8b7355", passable: true,  buildable: true  },
  mountain:      { label: "Mountain",      color: "#6b6b6b", passable: false, buildable: false },
  snow_peak:     { label: "Snow Peak",     color: "#e8e8e8", passable: false, buildable: false },
};

export const BUILDING_META: Record<
  BuildingType,
  { label: string; emoji: string; cost: Partial<Record<ResourceType, number>> }
> = {
  camp:         { label: "Camp",         emoji: "⛺", cost: { wood: 2 } },
  hut:          { label: "Hut",          emoji: "🛖", cost: { wood: 5, stone: 2 } },
  house:        { label: "House",        emoji: "🏠", cost: { wood: 10, stone: 8 } },
  farm:         { label: "Farm",         emoji: "🌾", cost: { wood: 3 } },
  mine:         { label: "Mine",         emoji: "⛏️",  cost: { wood: 4, stone: 4 } },
  lumber_mill:  { label: "Lumber Mill",  emoji: "🪓", cost: { wood: 6, stone: 3 } },
  well:         { label: "Well",         emoji: "🪣", cost: { stone: 5 } },
  market:       { label: "Market",       emoji: "🏪", cost: { wood: 8, stone: 5 } },
  temple:       { label: "Temple",       emoji: "⛩️",  cost: { wood: 12, stone: 15 } },
  wall:         { label: "Wall",         emoji: "🧱", cost: { stone: 6 } },
};
