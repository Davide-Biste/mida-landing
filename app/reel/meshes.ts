import { makeMesh, type Mesh, type Pool } from "./gl";
import { TAU } from "./math";

/** Coin half-thickness, for a radius of 1 (measured off the brand mark). */
export const COIN_HZ = 0.159;

/**
 * The coin: unit-radius cylinder, face normal +Z, crown "up" along +Y.
 * Layout: pos(3) normal(3) uv(2) part(1) — part 0 top · 1 bottom · 2 edge.
 * Caps carry disc coordinates in uv; the edge carries (angle 0..1, height 0..1).
 */
export function coinMesh(pool: Pool, seg = 128): Mesh {
  const v: number[] = [];
  const idx: number[] = [];
  const push = (x: number, y: number, z: number, nx: number, ny: number, nz: number, u: number, w: number, part: number) =>
    v.push(x, y, z, nx, ny, nz, u, w, part);

  // Edge band.
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * TAU, c = Math.cos(a), s = Math.sin(a);
    push(c, s, COIN_HZ, c, s, 0, i / seg, 1, 2);
    push(c, s, -COIN_HZ, c, s, 0, i / seg, 0, 2);
  }
  for (let i = 0; i < seg; i++) {
    const t0 = i * 2, b0 = t0 + 1, t1 = t0 + 2, b1 = t0 + 3;
    idx.push(b0, b1, t1, b0, t1, t0);
  }
  // Caps.
  for (const top of [true, false]) {
    const base = v.length / 9;
    const z = top ? COIN_HZ : -COIN_HZ, nz = top ? 1 : -1, part = top ? 0 : 1;
    push(0, 0, z, 0, 0, nz, 0, 0, part);
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * TAU, c = Math.cos(a), s = Math.sin(a);
      push(c, s, z, 0, 0, nz, top ? c : -c, s, part);
    }
    for (let i = 0; i < seg; i++) {
      if (top) idx.push(base, base + 1 + i, base + 2 + i);
      else idx.push(base, base + 2 + i, base + 1 + i);
    }
  }
  return makeMesh(pool, new Float32Array(v), [3, 3, 2, 1], new Uint16Array(idx));
}

// iPhone slab, in the same 433 × 882 unit space as the landing's SVG mockup.
export const PHONE_UNITS = 433;
export const PHONE_HALF: [number, number] = [212.5, 439];
const PHONE_R = 68;
const PHONE_T = 46;
/** Body height once scaled to a width of ~1. */
export const PHONE_H = (PHONE_HALF[1] * 2) / PHONE_UNITS;

/**
 * Layout: pos(3) normal(3) local(2) part(1) — part 0 front · 1 back · 2 side.
 * `local` is the position in mockup units so the shader can cut bezel + screen.
 */
export function phoneMesh(pool: Pool, cornerSeg = 12): Mesh {
  const k = 1 / PHONE_UNITS;
  const [hw, hh] = PHONE_HALF;
  // Outline, counter-clockwise seen from +Z.
  const pts: { x: number; y: number; nx: number; ny: number }[] = [];
  const corners: [number, number, number][] = [
    [hw - PHONE_R, hh - PHONE_R, 0],
    [-(hw - PHONE_R), hh - PHONE_R, Math.PI / 2],
    [-(hw - PHONE_R), -(hh - PHONE_R), Math.PI],
    [hw - PHONE_R, -(hh - PHONE_R), Math.PI * 1.5],
  ];
  for (const [cx, cy, a0] of corners) {
    for (let i = 0; i <= cornerSeg; i++) {
      const a = a0 + (i / cornerSeg) * (Math.PI / 2);
      pts.push({ x: cx + Math.cos(a) * PHONE_R, y: cy + Math.sin(a) * PHONE_R, nx: Math.cos(a), ny: Math.sin(a) });
    }
  }
  const n = pts.length;
  const v: number[] = [];
  const idx: number[] = [];
  const zb = -PHONE_T * k;

  // Front + back caps (fans).
  for (const front of [true, false]) {
    const base = v.length / 9;
    const z = front ? 0 : zb, nz = front ? 1 : -1, part = front ? 0 : 1;
    v.push(0, 0, z, 0, 0, nz, 0, 0, part);
    for (const p of pts) v.push(p.x * k, p.y * k, z, 0, 0, nz, p.x, p.y, part);
    for (let i = 0; i < n; i++) {
      const a = base + 1 + i, b = base + 1 + ((i + 1) % n);
      if (front) idx.push(base, a, b);
      else idx.push(base, b, a);
    }
  }
  // Side wall.
  const base = v.length / 9;
  for (const p of pts) {
    v.push(p.x * k, p.y * k, 0, p.nx, p.ny, 0, p.x, p.y, 2);
    v.push(p.x * k, p.y * k, zb, p.nx, p.ny, 0, p.x, p.y, 2);
  }
  for (let i = 0; i < n; i++) {
    const f0 = base + i * 2, b0 = f0 + 1, f1 = base + ((i + 1) % n) * 2, b1 = f1 + 1;
    idx.push(f0, b0, b1, f0, b1, f1);
  }
  return makeMesh(pool, new Float32Array(v), [3, 3, 2, 1], new Uint16Array(idx));
}

/** Box with its base on y = 0 (so bars grow upwards). Layout: pos(3) normal(3). */
export function boxMesh(pool: Pool): Mesh {
  const v: number[] = [];
  const faces: [number[], number[], number[]][] = [
    [[0, 0, 1], [1, 0, 0], [0, 1, 0]],
    [[0, 0, -1], [-1, 0, 0], [0, 1, 0]],
    [[1, 0, 0], [0, 0, -1], [0, 1, 0]],
    [[-1, 0, 0], [0, 0, 1], [0, 1, 0]],
    [[0, 1, 0], [1, 0, 0], [0, 0, -1]],
    [[0, -1, 0], [1, 0, 0], [0, 0, 1]],
  ];
  for (const [nrm, ux, uy] of faces) {
    const corner = (a: number, b: number) => {
      const p = [0, 1, 2].map((i) => nrm[i] * 0.5 + ux[i] * a * 0.5 + uy[i] * b * 0.5);
      v.push(p[0], p[1] + 0.5, p[2], nrm[0], nrm[1], nrm[2]);
    };
    corner(-1, -1); corner(1, -1); corner(1, 1);
    corner(-1, -1); corner(1, 1); corner(-1, 1);
  }
  return makeMesh(pool, new Float32Array(v), [3, 3]);
}

/** Unit quad as a 4-vertex strip, corners in -1..1. */
export function quadMesh(pool: Pool): Mesh {
  return makeMesh(pool, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), [2]);
}

/**
 * The crown, lifted straight from /assets/mida.svg, rasterised into a texture
 * that covers the central ±0.55 of the coin face.
 */
export function crownCanvas(size = 768): HTMLCanvasElement {
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const ctx = cv.getContext("2d")!;
  // Path units → face radii: the mark scales the crown by 0.72 on a 235-unit coin.
  const pxPerUnit = (size / 1.1) * (0.72 / 235);
  ctx.translate(size / 2, size / 2);
  ctx.scale(pxPerUnit, pxPerUnit);
  ctx.translate(-257, -238);
  const crown = new Path2D("M 132 320 Q 126 250 150 196 Q 184 232 214 258 Q 236 196 256 132 Q 278 198 300 256 Q 332 230 366 196 Q 388 252 382 320 Q 256 344 132 320 Z");
  const shade = new Path2D("M 200 300 Q 256 250 312 300 Q 256 322 200 300 Z");
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.fillStyle = "#F4D23C";
  ctx.fill(crown);
  ctx.fillStyle = "#E2BB2E";
  ctx.fill(shade);
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 24;
  ctx.stroke(crown);
  return cv;
}
