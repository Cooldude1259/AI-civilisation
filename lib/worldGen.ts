import { BlockType, VoxelMap, WorldConfig, voxelKey } from "./worldTypes";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildNoiseMap(
  width: number,
  depth: number,
  rand: () => number,
  octaves = 6
): number[][] {
  const gradients: [number, number][][] = Array.from({ length: depth + 4 }, () =>
    Array.from({ length: width + 4 }, () => {
      const a = rand() * Math.PI * 2;
      return [Math.cos(a), Math.sin(a)] as [number, number];
    })
  );

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a: number, b: number, t: number) => a + t * (b - a);

  function dot(ix: number, iy: number, x: number, y: number) {
    const g = gradients[iy]?.[ix] ?? [0, 0];
    return (x - ix) * g[0] + (y - iy) * g[1];
  }

  function perlin(x: number, y: number) {
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const sx = fade(x - x0), sy = fade(y - y0);
    return lerp(
      lerp(dot(x0, y0, x, y), dot(x0 + 1, y0, x, y), sx),
      lerp(dot(x0, y0 + 1, x, y), dot(x0 + 1, y0 + 1, x, y), sx),
      sy
    );
  }

  const map: number[][] = [];
  let lo = Infinity, hi = -Infinity;

  for (let z = 0; z < depth; z++) {
    map[z] = [];
    for (let x = 0; x < width; x++) {
      let v = 0, amp = 1, freq = 1, maxAmp = 0;
      for (let o = 0; o < octaves; o++) {
        v += perlin((x / width) * freq * 4, (z / depth) * freq * 4) * amp;
        maxAmp += amp; amp *= 0.5; freq *= 2;
      }
      map[z][x] = v / maxAmp;
      if (map[z][x] < lo) lo = map[z][x];
      if (map[z][x] > hi) hi = map[z][x];
    }
  }
  // normalize
  for (let z = 0; z < depth; z++)
    for (let x = 0; x < width; x++)
      map[z][x] = (map[z][x] - lo) / (hi - lo);

  return map;
}

const SEA_LEVEL = 3;
const MAX_HEIGHT = 12;

export interface GeneratedWorld {
  voxels: VoxelMap;
  config: WorldConfig;
  // surface height at each x,z for agent spawning
  surfaceHeight: number[][];
}

export function generateWorld(config: WorldConfig): GeneratedWorld {
  const { width, depth, seed } = config;
  const rand  = mulberry32(seed);
  const rand2 = mulberry32(seed + 99991);
  const rand3 = mulberry32(seed + 31337);

  const elevMap  = buildNoiseMap(width, depth, rand);
  const moistMap = buildNoiseMap(width, depth, rand2);
  const treeMap  = buildNoiseMap(width, depth, rand3, 3);

  const voxels: VoxelMap = new Map();
  const surfaceHeight: number[][] = Array.from({ length: depth }, () => new Array(width).fill(0));

  for (let z = 0; z < depth; z++) {
    for (let x = 0; x < width; x++) {
      // Island falloff
      const nx = (x / width) * 2 - 1;
      const nz = (z / depth) * 2 - 1;
      const falloff = Math.pow(Math.sqrt(nx * nx + nz * nz), 2.5) * 0.65;
      const elev = Math.max(0, elevMap[z][x] - falloff);
      const moist = moistMap[z][x];

      const terrainHeight = Math.max(SEA_LEVEL, Math.round(elev * MAX_HEIGHT));
      surfaceHeight[z][x] = terrainHeight;

      // Fill column
      for (let y = 0; y <= terrainHeight; y++) {
        let block: BlockType;

        if (y < terrainHeight - 3) {
          block = y === 0 ? "stone" : rand() < 0.05 ? "ore" : "stone";
        } else if (y < terrainHeight) {
          block = terrainHeight <= SEA_LEVEL + 1 ? "sand" : "dirt";
        } else {
          // Surface block
          if (terrainHeight <= SEA_LEVEL + 1) {
            block = "sand";
          } else if (terrainHeight >= MAX_HEIGHT - 1) {
            block = "snow";
          } else if (terrainHeight >= MAX_HEIGHT - 3) {
            block = rand() < 0.4 ? "gravel" : "stone";
          } else if (moist > 0.55) {
            block = "grass"; // will add trees below
          } else {
            block = "grass";
          }
        }
        voxels.set(voxelKey(x, y, z), block);
      }

      // Water fill up to sea level
      if (terrainHeight < SEA_LEVEL) {
        for (let y = terrainHeight + 1; y <= SEA_LEVEL; y++) {
          voxels.set(voxelKey(x, y, z), "water");
        }
        surfaceHeight[z][x] = SEA_LEVEL;
      }

      // Trees on forested tiles
      if (
        terrainHeight > SEA_LEVEL + 2 &&
        terrainHeight < MAX_HEIGHT - 3 &&
        moist > 0.5 &&
        treeMap[z][x] > 0.62
      ) {
        const trunkH = 3 + Math.floor(rand() * 2);
        for (let t = 1; t <= trunkH; t++) {
          voxels.set(voxelKey(x, terrainHeight + t, z), "wood_log");
        }
        // Leaf canopy
        const top = terrainHeight + trunkH;
        for (let lx = -2; lx <= 2; lx++) {
          for (let lz = -2; lz <= 2; lz++) {
            for (let ly = -1; ly <= 2; ly++) {
              if (Math.abs(lx) + Math.abs(lz) + Math.abs(ly) > 3) continue;
              const key = voxelKey(x + lx, top + ly, z + lz);
              if (!voxels.has(key)) voxels.set(key, "leaves");
            }
          }
        }
      }
    }
  }

  return { voxels, config, surfaceHeight };
}
