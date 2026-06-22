"use client";
import { useEffect } from "react";
import { useWorldStore } from "@/lib/worldStore";
import WorldMap from "./components/WorldMap";
import TileInspector from "./components/TileInspector";
import WorldControls from "./components/WorldControls";
import Legend from "./components/Legend";

export default function Home() {
  const { initWorld, tiles } = useWorldStore();

  useEffect(() => {
    if (tiles.length === 0) initWorld();
  }, []);

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-gray-800 border-r border-gray-700 overflow-y-auto">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-amber-400">AI Civilisation</h1>
          <p className="text-gray-400 text-xs mt-0.5">World Simulation</p>
        </div>

        <WorldControls />

        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-gray-700">
            <div className="p-3 text-gray-400 text-xs uppercase tracking-wide">Tile Inspector</div>
            <TileInspector />
          </div>
        </div>

        <Legend />
      </aside>

      {/* Map canvas area */}
      <main className="flex-1 overflow-auto flex items-center justify-center bg-gray-950 p-4">
        {tiles.length === 0 ? (
          <div className="text-gray-500">Generating world…</div>
        ) : (
          <WorldMap />
        )}
      </main>
    </div>
  );
}
