"use client";
import { BLOCK_COLORS, BlockType } from "@/lib/worldTypes";

const NATURAL: [BlockType, string][] = [
  ["grass", "Grass"], ["dirt", "Dirt"], ["stone", "Stone"],
  ["sand", "Sand"], ["water", "Water"], ["wood_log", "Wood"],
  ["leaves", "Leaves"], ["snow", "Snow"], ["ore", "Ore"],
];

const BUILT: [BlockType, string][] = [
  ["planks", "Planks"], ["cobblestone", "Cobblestone"],
  ["brick", "Brick"], ["farmland", "Farmland"], ["thatch", "Thatch"],
];

function Swatch({ type, label }: { type: BlockType; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-300">
      <div className="w-3 h-3 rounded-sm flex-shrink-0 border border-white/10"
        style={{ backgroundColor: BLOCK_COLORS[type] }} />
      {label}
    </div>
  );
}

export default function Legend() {
  return (
    <div className="p-4 border-t border-gray-700 space-y-3">
      <div>
        <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Natural</div>
        <div className="grid grid-cols-2 gap-1">
          {NATURAL.map(([t, l]) => <Swatch key={t} type={t} label={l} />)}
        </div>
      </div>
      <div>
        <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Built by Agents</div>
        <div className="grid grid-cols-2 gap-1">
          {BUILT.map(([t, l]) => <Swatch key={t} type={t} label={l} />)}
        </div>
      </div>
    </div>
  );
}
