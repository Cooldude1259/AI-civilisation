export type ActionType =
  | "move"
  | "gather"
  | "build"
  | "talk"
  | "rest"
  | "explore"
  | "chop"
  | "mine";

export type ResourceType = "wood" | "stone" | "food" | "fish" | "ore" | "berries";

export interface Inventory {
  wood: number;
  stone: number;
  food: number;
  fish: number;
  ore: number;
  berries: number;
}

export interface Memory {
  tick: number;
  thought: string;
  action: ActionType;
  detail: string;
}

export interface AgentAction {
  thought: string;
  action: ActionType;
  // move/explore/build target position
  targetX?: number;
  targetZ?: number;
  targetY?: number;
  // build block type
  buildBlock?: string;
  // talk message
  message?: string;
  // gather resource
  resource?: ResourceType;
}

export interface Agent {
  id: string;
  name: string;
  color: string;        // hex, used for 3D mesh and UI
  personality: string;  // one-liner fed to LLM
  // world position (centre of a block)
  x: number;
  y: number;
  z: number;
  // stats 0-100
  health: number;
  hunger: number;
  // resources carried
  inventory: Inventory;
  // last N thoughts/actions shown in UI
  memories: Memory[];
  // what the agent is currently doing (shown in UI)
  currentThought: string;
  currentAction: ActionType | null;
  // spoken message (cleared after a few ticks)
  speech: string;
  speechTick: number;
  // ticks this agent has been alive
  age: number;
}

export const AGENT_TEMPLATES: Omit<Agent, "x" | "y" | "z">[] = [
  {
    id: "arin",
    name: "Arin",
    color: "#e74c3c",
    personality: "Ambitious and industrious. Always thinking about building and expanding the settlement.",
    health: 100, hunger: 80,
    inventory: { wood: 3, stone: 1, food: 2, fish: 0, ore: 0, berries: 0 },
    memories: [], currentThought: "Just arrived.", currentAction: null,
    speech: "", speechTick: -99, age: 0,
  },
  {
    id: "bren",
    name: "Bren",
    color: "#3498db",
    personality: "Cautious explorer. Loves mapping the land and finding hidden resources.",
    health: 100, hunger: 80,
    inventory: { wood: 1, stone: 0, food: 3, fish: 0, ore: 0, berries: 1 },
    memories: [], currentThought: "Just arrived.", currentAction: null,
    speech: "", speechTick: -99, age: 0,
  },
  {
    id: "cael",
    name: "Cael",
    color: "#2ecc71",
    personality: "Social and cooperative. Prioritises talking to others and sharing resources.",
    health: 100, hunger: 80,
    inventory: { wood: 2, stone: 0, food: 1, fish: 0, ore: 0, berries: 2 },
    memories: [], currentThought: "Just arrived.", currentAction: null,
    speech: "", speechTick: -99, age: 0,
  },
  {
    id: "dara",
    name: "Dara",
    color: "#f39c12",
    personality: "Resourceful and practical. Focuses on food and survival above all else.",
    health: 100, hunger: 80,
    inventory: { wood: 0, stone: 0, food: 4, fish: 1, ore: 0, berries: 0 },
    memories: [], currentThought: "Just arrived.", currentAction: null,
    speech: "", speechTick: -99, age: 0,
  },
  {
    id: "elan",
    name: "Elan",
    color: "#9b59b6",
    personality: "Philosophical and curious. Often wanders and asks big questions about the world.",
    health: 100, hunger: 80,
    inventory: { wood: 1, stone: 2, food: 1, fish: 0, ore: 1, berries: 0 },
    memories: [], currentThought: "Just arrived.", currentAction: null,
    speech: "", speechTick: -99, age: 0,
  },
];
