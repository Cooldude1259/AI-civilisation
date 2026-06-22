"use client";
import { useState } from "react";
import { useWorldStore } from "@/lib/worldStore";

export default function WorldControls() {
  const { initWorld, advanceTick, tick, config } = useWorldStore();
  const [seed, setSeed] = useState(config.seed.toString());
  const [loading, setLoading] = useState(false);

  function handleGenerate() {
    setLoading(true);
    setTimeout(() => {
      initWorld({ seed: parseInt(seed) || 42 });
      setLoading(false);
    }, 10);
  }

  return (
    <div className="p-4 space-y-4 border-b border-gray-700">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">World</h2>
        <span className="text-gray-400 text-xs font-mono">Tick {tick}</span>
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          placeholder="Seed"
          className="bg-gray-700 text-white rounded px-2 py-1 text-sm w-24 border border-gray-600 focus:outline-none focus:border-amber-400"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded px-3 py-1 text-sm font-medium transition-colors"
        >
          {loading ? "Building…" : "New World"}
        </button>
      </div>

      <button
        onClick={advanceTick}
        className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded px-3 py-1.5 text-sm transition-colors"
      >
        Advance Tick →
      </button>

      <div className="text-xs text-gray-500 space-y-0.5">
        <div>{config.width}×{config.depth} tiles · Seed {config.seed}</div>
        <div className="text-gray-600">Scroll to zoom · Drag to orbit · Right-drag to pan</div>
      </div>
    </div>
  );
}
