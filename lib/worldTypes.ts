export type BlockType =
  | "air"
  | "grass"
  | "dirt"
  | "stone"
  | "sand"
  | "water"
  | "wood_log"
  | "leaves"
  | "snow"
  | "ore"
  | "gravel"
  // built by agents
  | "planks"
  | "cobblestone"
  | "farmland"
  | "thatch"
  | "brick";

export type ResourceType = "wood" | "stone" | "food" | "fish" | "ore" | "berries";

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

// x,y,z string key -> block type
export type VoxelMap = Map<string, BlockType>;

export function voxelKey(x: number, y: number, z: number) {
  return `${x},${y},${z}`;
}

export function parseKey(key: string): [number, number, number] {
  const [x, y, z] = key.split(",").map(Number);
  return [x, y, z];
}

export interface WorldConfig {
  width: number;   // x
  depth: number;   // z
  seed: number;
}

export const BLOCK_COLORS: Record<BlockType, string> = {
  air:         "#00000000",
  grass:       "#4a9e4a",
  dirt:        "#8B5E3C",
  stone:       "#888888",
  sand:        "#d4b96a",
  water:       "#3a7abf",
  wood_log:    "#6B4226",
  leaves:      "#2d7a2d",
  snow:        "#e8e8e8",
  ore:         "#DAA520",
  gravel:      "#999999",
  planks:      "#C8A96E",
  cobblestone: "#777777",
  farmland:    "#5C4033",
  thatch:      "#C2A44E",
  brick:       "#B55239",
};

export const BUILDING_META: Record<
  BuildingType,
  { label: string; emoji: string; cost: Partial<Record<ResourceType, number>> }
> = {
  camp:        { label: "Camp",        emoji: "⛺", cost: { wood: 2 } },
  hut:         { label: "Hut",         emoji: "🛖", cost: { wood: 5, stone: 2 } },
  house:       { label: "House",       emoji: "🏠", cost: { wood: 10, stone: 8 } },
  farm:        { label: "Farm",        emoji: "🌾", cost: { wood: 3 } },
  mine:        { label: "Mine",        emoji: "⛏️",  cost: { wood: 4, stone: 4 } },
  lumber_mill: { label: "Lumber Mill", emoji: "🪓", cost: { wood: 6, stone: 3 } },
  well:        { label: "Well",        emoji: "🪣", cost: { stone: 5 } },
  market:      { label: "Market",      emoji: "🏪", cost: { wood: 8, stone: 5 } },
  temple:      { label: "Temple",      emoji: "⛩️",  cost: { wood: 12, stone: 15 } },
  wall:        { label: "Wall",        emoji: "🧱", cost: { stone: 6 } },
};
