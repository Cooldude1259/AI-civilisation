"use client";
import { useState } from "react";
import { useAgentStore } from "@/lib/agentStore";
import { useWorldStore } from "@/lib/worldStore";
import { Agent } from "@/lib/agentTypes";

const ACTION_EMOJI: Record<string, string> = {
  move: "🚶", explore: "🧭", gather: "🌿", chop: "🪓",
  mine: "⛏️", build: "🔨", talk: "💬", rest: "😴",
};

function StatBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="flex-1 bg-gray-700 rounded-full h-1.5">
      <div className="h-1.5 rounded-full transition-all" style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} />
    </div>
  );
}

function AgentCard({ agent, expanded, onToggle }: { agent: Agent; expanded: boolean; onToggle: () => void }) {
  const inv = Object.entries(agent.inventory).filter(([, v]) => v > 0);

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 p-2.5 hover:bg-gray-700/50 transition-colors text-left"
      >
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: agent.color }} />
        <span className="font-medium text-white text-sm flex-1">{agent.name}</span>
        <span className="text-gray-400 text-xs">{ACTION_EMOJI[agent.currentAction ?? ""] ?? "·"}</span>
        <span className="text-gray-500 text-xs">{expanded ? "▲" : "▼"}</span>
      </button>

      {/* Stats row always visible */}
      <div className="px-2.5 pb-2 flex items-center gap-2">
        <span className="text-xs text-gray-500 w-3">❤</span>
        <StatBar value={agent.health} max={100} color="#e74c3c" />
        <span className="text-xs text-gray-500 w-3">🍞</span>
        <StatBar value={agent.hunger} max={100} color="#f39c12" />
      </div>

      {/* Thought bubble always visible */}
      {agent.currentThought && (
        <div className="px-2.5 pb-2 text-xs text-gray-400 italic leading-snug">
          "{agent.currentThought}"
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-700 p-2.5 space-y-2">
          {/* Inventory */}
          <div>
            <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Inventory</div>
            {inv.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {inv.map(([k, v]) => (
                  <span key={k} className="bg-gray-700 text-gray-200 text-xs rounded px-1.5 py-0.5">
                    {v} {k}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-gray-600 text-xs">Empty</span>
            )}
          </div>

          {/* Position */}
          <div className="text-xs text-gray-500 font-mono">
            pos ({agent.x}, {agent.y}, {agent.z}) · age {agent.age}
          </div>

          {/* Memory log */}
          {agent.memories.length > 0 && (
            <div>
              <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Recent</div>
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {agent.memories.map((m, i) => (
                  <div key={i} className="text-xs text-gray-400 leading-snug">
                    <span className="text-gray-600 font-mono mr-1">t{m.tick}</span>
                    {ACTION_EMOJI[m.action] ?? "·"} {m.thought}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AgentPanel() {
  const { agents, simRunning, simSpeed, setSimRunning, setSimSpeed, spawnAgents } = useAgentStore();
  const { surfaceHeight, config } = useWorldStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  function handleSpawn() {
    if (surfaceHeight.length > 0) {
      spawnAgents(surfaceHeight, config.width, config.depth);
    }
  }

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-sm uppercase tracking-wide">Settlers</h2>
        <span className="text-gray-500 text-xs">{agents.length}/5</span>
      </div>

      {/* Sim controls */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            onClick={handleSpawn}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded px-2 py-1.5 text-xs transition-colors"
          >
            Spawn Settlers
          </button>
          <button
            onClick={() => setSimRunning(!simRunning)}
            disabled={agents.length === 0}
            className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${
              simRunning
                ? "bg-red-700 hover:bg-red-600 text-white"
                : "bg-green-700 hover:bg-green-600 text-white"
            }`}
          >
            {simRunning ? "⏸ Pause" : "▶ Run"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">Speed</span>
          <input
            type="range" min={1000} max={10000} step={500}
            value={simSpeed}
            onChange={(e) => setSimSpeed(Number(e.target.value))}
            className="flex-1 accent-amber-400"
          />
          <span className="text-gray-400 text-xs w-10 text-right">{simSpeed / 1000}s</span>
        </div>
      </div>

      {/* Agent cards */}
      {agents.length === 0 ? (
        <p className="text-gray-600 text-xs italic">Generate a world then spawn settlers.</p>
      ) : (
        <div className="space-y-2">
          {agents.map((a) => (
            <AgentCard
              key={a.id}
              agent={a}
              expanded={expanded === a.id}
              onToggle={() => setExpanded(expanded === a.id ? null : a.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
