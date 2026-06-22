"use client";
import { useRef, useEffect, useCallback } from "react";
import { useWorldStore } from "@/lib/worldStore";
import { TERRAIN_META, BUILDING_META, Tile } from "@/lib/worldTypes";

const TILE_SIZE = 20;

export default function WorldMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { tiles, selectedTile, selectTile, config } = useWorldStore();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || tiles.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = config.width * TILE_SIZE;
    canvas.height = config.height * TILE_SIZE;

    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        const tile: Tile = tiles[y][x];
        const meta = TERRAIN_META[tile.terrain];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        // Base terrain colour
        ctx.fillStyle = meta.color;
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

        // Subtle elevation shading
        if (tile.elevation > 0.5) {
          ctx.fillStyle = `rgba(255,255,255,${(tile.elevation - 0.5) * 0.25})`;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        }

        // Grid lines (very faint)
        ctx.strokeStyle = "rgba(0,0,0,0.08)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);

        // Resource dot indicators (top-left area, small dots)
        tile.resources.forEach((r, i) => {
          const dotColors: Record<string, string> = {
            wood: "#8B4513",
            stone: "#888",
            food: "#90EE90",
            fish: "#87CEEB",
            ore: "#DAA520",
            berries: "#DC143C",
          };
          ctx.beginPath();
          ctx.arc(px + 3 + i * 5, py + 3, 2, 0, Math.PI * 2);
          ctx.fillStyle = dotColors[r.type] ?? "#fff";
          ctx.fill();
        });

        // Building emoji
        if (tile.building) {
          const emoji = BUILDING_META[tile.building.type]?.emoji ?? "?";
          ctx.font = `${TILE_SIZE * 0.7}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(emoji, px + TILE_SIZE / 2, py + TILE_SIZE / 2);
        }

        // Selection highlight
        if (selectedTile?.x === x && selectedTile?.y === y) {
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        }
      }
    }
  }, [tiles, selectedTile, config]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const scaleX = (canvasRef.current?.width ?? 1) / rect.width;
      const scaleY = (canvasRef.current?.height ?? 1) / rect.height;
      const x = Math.floor(((e.clientX - rect.left) * scaleX) / TILE_SIZE);
      const y = Math.floor(((e.clientY - rect.top) * scaleY) / TILE_SIZE);
      if (x >= 0 && x < config.width && y >= 0 && y < config.height) {
        selectTile(x, y);
      }
    },
    [config.width, config.height, selectTile]
  );

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="cursor-crosshair max-w-full max-h-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
