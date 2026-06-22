import { Tile, TerrainType, Resource, WorldConfig } from "./worldTypes";

// Simple seeded PRNG (mulberry32)
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Smoothstep noise using the seeded rng
function generateNoiseMap(
  width: number,
  height: number,
  rand: () => number,
  octaves = 6,
  persistence = 0.5,
  lacunarity = 2.0
): number[][] {
  // Store random gradient vectors on a grid
  const gradients: [number, number][][] = Array.from({ length: height + 2 }, () =>
    Array.from({ length: width + 2 }, () => {
      const angle = rand() * Math.PI * 2;
      return [Math.cos(angle), Math.sin(angle)] as [number, number];
    })
  );

  function dot(ix: number, iy: number, x: number, y: number) {
    const dx = x - ix;
    const dy = y - iy;
    const g = gradients[iy]?.[ix] ?? [0, 0];
    return dx * g[0] + dy * g[1];
  }

  function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(a: number, b: number, t: number) { return a + t * (b - a); }

  function perlin(x: number, y: number) {
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const x1 = x0 + 1, y1 = y0 + 1;
    const sx = fade(x - x0), sy = fade(y - y0);
    return lerp(
      lerp(dot(x0, y0, x, y), dot(x1, y0, x, y), sx),
      lerp(dot(x0, y1, x, y), dot(x1, y1, x, y), sx),
      sy
    );
  }

  const map: number[][] = Array.from({ length: height }, () => new Array(width).fill(0));
  let maxVal = 0, minVal = Infinity;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let amp = 1, freq = 1, value = 0, maxAmp = 0;
      for (let o = 0; o < octaves; o++) {
        value += perlin((x / width) * freq * 4, (y / height) * freq * 4) * amp;
        maxAmp += amp;
        amp *= persistence;
        freq *= lacunarity;
      }
      map[y][x] = value / maxAmp;
      if (map[y][x] > maxVal) maxVal = map[y][x];
      if (map[y][x] < minVal) minVal = map[y][x];
    }
  }

  // Normalize to [0,1]
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      map[y][x] = (map[y][x] - minVal) / (maxVal - minVal);
    }
  }

  return map;
}

function elevationToTerrain(e: number, moisture: number): TerrainType {
  if (e < 0.25) return "deep_water";
  if (e < 0.33) return "shallow_water";
  if (e < 0.37) return "sand";
  if (e < 0.65) {
    if (moisture > 0.6) return "forest";
    return "grass";
  }
  if (e < 0.78) return "hills";
  if (e < 0.88) return "mountain";
  return "snow_peak";
}

function terrainResources(terrain: TerrainType, rand: () => number): Resource[] {
  const resources: Resource[] = [];
  switch (terrain) {
    case "forest":
      resources.push({ type: "wood", amount: Math.floor(rand() * 8) + 4, maxAmount: 12 });
      if (rand() > 0.5) resources.push({ type: "berries", amount: Math.floor(rand() * 4) + 1, maxAmount: 6 });
      break;
    case "grass":
      if (rand() > 0.6) resources.push({ type: "food", amount: Math.floor(rand() * 4) + 2, maxAmount: 8 });
      if (rand() > 0.8) resources.push({ type: "berries", amount: Math.floor(rand() * 3) + 1, maxAmount: 5 });
      break;
    case "hills":
      resources.push({ type: "stone", amount: Math.floor(rand() * 6) + 3, maxAmount: 10 });
      if (rand() > 0.6) resources.push({ type: "ore", amount: Math.floor(rand() * 3) + 1, maxAmount: 6 });
      break;
    case "mountain":
      resources.push({ type: "stone", amount: Math.floor(rand() * 8) + 5, maxAmount: 15 });
      if (rand() > 0.4) resources.push({ type: "ore", amount: Math.floor(rand() * 5) + 2, maxAmount: 10 });
      break;
    case "shallow_water":
      if (rand() > 0.4) resources.push({ type: "fish", amount: Math.floor(rand() * 5) + 2, maxAmount: 8 });
      break;
    case "sand":
      if (rand() > 0.7) resources.push({ type: "stone", amount: Math.floor(rand() * 2) + 1, maxAmount: 4 });
      break;
    default:
      break;
  }
  return resources;
}

export function generateWorld(config: WorldConfig): Tile[][] {
  const { width, height, seed } = config;
  const rand = mulberry32(seed);
  const rand2 = mulberry32(seed + 1337);

  const elevMap = generateNoiseMap(width, height, rand);
  const moistMap = generateNoiseMap(width, height, rand2);

  // Add island falloff so edges are more likely water
  const tiles: Tile[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const nx = (x / width) * 2 - 1;
      const ny = (y / height) * 2 - 1;
      const distFromCenter = Math.sqrt(nx * nx + ny * ny);
      const falloff = Math.pow(distFromCenter, 2.2);
      const elevation = Math.max(0, elevMap[y][x] - falloff * 0.6);
      const moisture = moistMap[y][x];

      const terrain = elevationToTerrain(elevation, moisture);
      const resources = terrainResources(terrain, rand);

      row.push({ x, y, terrain, resources, elevation });
    }
    tiles.push(row);
  }

  return tiles;
}
