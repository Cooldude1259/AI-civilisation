"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useWorldStore } from "@/lib/worldStore";
import WorldControls from "./components/WorldControls";
import Legend from "./components/Legend";
import AgentPanel from "./components/AgentPanel";
import SimController from "./components/SimController";

const VoxelWorld = dynamic(() => import("./components/VoxelWorld"), { ssr: false });

export default function Home() {
  const { initWorld, voxels, tick } = useWorldStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (voxels.size === 0) initWorld();
    setReady(true);
  }, []);

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-gray-800 border-r border-gray-700 overflow-y-auto">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-amber-400">AI Civilisation</h1>
          <p className="text-gray-400 text-xs mt-0.5">3D World Simulation</p>
        </div>

        <WorldControls />

        <div className="border-t border-gray-700">
          <AgentPanel />
        </div>

        <div className="flex-1" />
        <Legend />
      </aside>

      {/* 3D canvas */}
      <main className="flex-1 relative">
        <SimController />

        {ready ? (
          <VoxelWorld />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Generating world…
          </div>
        )}

        <div className="absolute bottom-4 right-4 bg-black/50 rounded px-3 py-1.5 text-xs text-gray-300 pointer-events-none">
          Tick {tick} · {voxels.size.toLocaleString()} blocks
        </div>
      </main>
    </div>
  );
}
