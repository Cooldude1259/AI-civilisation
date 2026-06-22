import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { Agent } from "@/lib/agentTypes";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Describe nearby blocks in plain language
function describeNearby(
  x: number, y: number, z: number,
  voxelSnapshot: Record<string, string>
): string {
  const seen: string[] = [];
  for (let dx = -3; dx <= 3; dx++) {
    for (let dz = -3; dz <= 3; dz++) {
      for (let dy = -1; dy <= 2; dy++) {
        const key = `${x + dx},${y + dy},${z + dz}`;
        const block = voxelSnapshot[key];
        if (block && block !== "air") {
          seen.push(`${block} at (${x + dx},${y + dy},${z + dz})`);
        }
      }
    }
  }
  // Deduplicate block types for brevity
  const counts: Record<string, number> = {};
  for (const b of seen) {
    const type = b.split(" at ")[0];
    counts[type] = (counts[type] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([t, n]) => `${n}x ${t}`)
    .join(", ") || "nothing notable";
}

export async function POST(req: NextRequest) {
  const { agent, voxelSnapshot, otherAgents, tick, worldWidth, worldDepth } =
    (await req.json()) as {
      agent: Agent;
      voxelSnapshot: Record<string, string>;
      otherAgents: { name: string; x: number; z: number; speech: string }[];
      tick: number;
      worldWidth: number;
      worldDepth: number;
    };

  const nearby = describeNearby(agent.x, agent.y, agent.z, voxelSnapshot);
  const nearbyAgents = otherAgents.filter(
    (o) => Math.abs(o.x - agent.x) <= 6 && Math.abs(o.z - agent.z) <= 6
  );

  const invStr = Object.entries(agent.inventory)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${v} ${k}`)
    .join(", ") || "nothing";

  const recentMemory = agent.memories
    .slice(0, 3)
    .map((m) => `  Tick ${m.tick}: ${m.thought} → ${m.action}`)
    .join("\n") || "  (none yet)";

  const prompt = `You are ${agent.name}, a settler in a newly founded civilisation.
Personality: ${agent.personality}

Current state (tick ${tick}):
- Position: (${agent.x}, ${agent.z}) on a ${worldWidth}x${worldDepth} island world
- Health: ${agent.health}/100 | Hunger: ${agent.hunger}/100
- Inventory: ${invStr}
- Nearby blocks: ${nearby}
- Nearby settlers: ${nearbyAgents.length > 0 ? nearbyAgents.map((o) => `${o.name} at (${o.x},${o.z})${o.speech ? ` saying "${o.speech}"` : ""}`).join(", ") : "none"}

Recent actions:
${recentMemory}

Choose ONE action and respond ONLY with valid JSON matching this schema:
{
  "thought": "short internal thought (max 20 words)",
  "action": one of ["move","gather","chop","mine","build","talk","rest","explore"],
  "targetX": integer (required for move/explore/build),
  "targetZ": integer (required for move/explore/build),
  "targetY": integer (only for build — the y level to place the block),
  "buildBlock": one of ["planks","cobblestone","brick","farmland","thatch"] (only for build),
  "message": "short spoken sentence (only for talk, max 15 words)",
  "resource": one of ["wood","stone","food","fish","ore","berries"] (only for gather)
}

Rules:
- move/explore targetX and targetZ must be within 1-3 steps of current position (${agent.x}, ${agent.z}) and within 0–${worldWidth - 1} / 0–${worldDepth - 1}
- build targetX/Z must be adjacent to your position; targetY is your current y (${agent.y})
- If hunger < 30, strongly prefer rest or gather food/berries
- If you have enough wood (>4) or stone (>4), consider building something
- Do not repeat the same action more than 2 ticks in a row`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      max_tokens: 200,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);

    // Sanitise
    const action = {
      thought: String(parsed.thought ?? "..."),
      action: parsed.action ?? "rest",
      targetX: parsed.targetX !== undefined ? Number(parsed.targetX) : undefined,
      targetZ: parsed.targetZ !== undefined ? Number(parsed.targetZ) : undefined,
      targetY: parsed.targetY !== undefined ? Number(parsed.targetY) : undefined,
      buildBlock: parsed.buildBlock,
      message: parsed.message,
      resource: parsed.resource,
    };

    return NextResponse.json({ action });
  } catch (err) {
    console.error("Groq error", err);
    return NextResponse.json({ action: { thought: "I feel confused.", action: "rest" } });
  }
}
