"use client";
import { TERRAIN_META, TerrainType } from "@/lib/worldTypes";

const SHOW: TerrainType[] = [
  "deep_water", "shallow_water", "sand", "grass",
  "forest", "hills", "mountain", "snow_peak",
];

export default function Legend() {
  return (
    <div className="p-4 border-t border-gray-700">
      <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Terrain</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {SHOW.map((t) => (
          <div key={t} className="flex items-center gap-1.5 text-xs text-gray-300">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: TERRAIN_META[t].color }}
            />
            {TERRAIN_META[t].label}
          </div>
        ))}
      </div>
      <div className="text-gray-400 text-xs uppercase tracking-wide mt-3 mb-1">Resources</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-300">
        {[
          { color: "#8B4513", label: "Wood" },
          { color: "#888", label: "Stone" },
          { color: "#90EE90", label: "Food" },
          { color: "#87CEEB", label: "Fish" },
          { color: "#DAA520", label: "Ore" },
          { color: "#DC143C", label: "Berries" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
