"use client";
import { useWorldStore } from "@/lib/worldStore";
import { TERRAIN_META, BUILDING_META } from "@/lib/worldTypes";

export default function TileInspector() {
  const { tiles, selectedTile, clearSelection } = useWorldStore();

  if (!selectedTile) {
    return (
      <div className="text-gray-500 text-sm italic p-4">
        Click a tile to inspect it.
      </div>
    );
  }

  const tile = tiles[selectedTile.y]?.[selectedTile.x];
  if (!tile) return null;

  const meta = TERRAIN_META[tile.terrain];

  return (
    <div className="p-4 space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white text-base">{meta.label}</h3>
        <button onClick={clearSelection} className="text-gray-400 hover:text-white text-xs">✕</button>
      </div>

      <div className="text-gray-400 font-mono text-xs">
        ({tile.x}, {tile.y}) · elev {tile.elevation.toFixed(2)}
      </div>

      <div className="flex gap-2 text-xs">
        <span className={meta.passable ? "text-green-400" : "text-red-400"}>
          {meta.passable ? "✓ Passable" : "✗ Impassable"}
        </span>
        <span className={meta.buildable ? "text-green-400" : "text-gray-500"}>
          {meta.buildable ? "✓ Buildable" : "✗ Unbuildable"}
        </span>
      </div>

      {tile.resources.length > 0 && (
        <div>
          <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Resources</div>
          <div className="space-y-1">
            {tile.resources.map((r) => (
              <div key={r.type} className="flex items-center gap-2">
                <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-amber-400 h-1.5 rounded-full"
                    style={{ width: `${(r.amount / r.maxAmount) * 100}%` }}
                  />
                </div>
                <span className="text-gray-300 w-20 text-right">
                  {r.type} {r.amount}/{r.maxAmount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tile.building && (
        <div>
          <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Building</div>
          <div className="flex items-center gap-2 bg-gray-700 rounded p-2">
            <span className="text-xl">{BUILDING_META[tile.building.type].emoji}</span>
            <div>
              <div className="text-white font-medium">{BUILDING_META[tile.building.type].label}</div>
              <div className="text-gray-400 text-xs">Level {tile.building.level} · Built tick {tile.building.builtAt}</div>
            </div>
          </div>
        </div>
      )}

      {!tile.building && meta.buildable && (
        <div className="text-gray-500 text-xs italic">No building — agents can build here.</div>
      )}
    </div>
  );
}
