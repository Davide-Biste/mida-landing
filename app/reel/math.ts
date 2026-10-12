// Small math kit for the reel: easing, vectors, column-major 4×4 matrices and a
// camera that supports a post-projection zoom + lens shift (used to park the
// whole 3D scene inside the app-icon squircle and to offset split layouts).

export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;

export const clamp = (x: number, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Progress of `x` through [a, b], clamped to 0..1. Safe for a = b and ±Infinity. */
export const prog = (x: number, a: number, b: number) => {
  const d = b - a;
  return d > 0 ? clamp((x - a) / d) : x >= a ? 1 : 0;
};
export const smooth = (t: number) => t * t * (3 - 2 * t);

export type Ease = (t: number) => number;
export const E = {
  lin: (t: number) => t,
  inQuad: (t: number) => t * t,
  outQuad: (t: number) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic: (t: number) => t * t * t,
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inQuart: (t: number) => t * t * t * t,
  outQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  inOutQuart: (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
  inExpo: (t: number) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  outExpo: (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutExpo: (t: number) =>
    t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  outBack: (t: number, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  inBack: (t: number, s = 1.70158) => (s + 1) * t * t * t - s * t * t,
};

/** Eased progress of `t` through [a, b]. */
export const seg = (t: number, a: number, b: number, ease: Ease = E.inOutCubic) => ease(prog(t, a, b));

/** Under-damped spring step response: 0 → 1 with overshoot. `t` in seconds. */
export function spring(t: number, freq = 3.2, damp = 0.5): number {
  if (t <= 0) return 0;
  const w = TAU * freq;
  const wd = w * Math.sqrt(1 - damp * damp);
  return 1 - Math.exp(-damp * w * t) * (Math.cos(wd * t) + ((damp * w) / wd) * Math.sin(wd * t));
}

/** A hop: 0 → 1 → 0 parabola over `dur`, starting at `t0`. */
export const hop = (t: number, t0: number, dur: number) => {
  const p = prog(t, t0, t0 + dur);
  return 4 * p * (1 - p);
};

/** Decaying impulse: 1 at `t0`, fading with rate `k`; 0 before. */
export const pulse = (t: number, t0: number, k = 8) => (t < t0 ? 0 : Math.exp(-(t - t0) * k));

// ── Deterministic randomness (the reel must render identically every pass) ──
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const hash = (i: number, salt = 0) => {
  const s = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
/** Smooth 1D value noise in -1..1. */
export const noise1 = (x: number, salt = 0) => {
  const i = Math.floor(x);
  const f = smooth(x - i);
  return lerp(hash(i, salt), hash(i + 1, salt), f) * 2 - 1;
};

// ── Vectors ────────────────────────────────────────────────────────────────
export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export const v3 = {
  add: (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  scale: (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  len: (a: Vec3) => Math.hypot(a[0], a[1], a[2]),
  norm: (a: Vec3): Vec3 => {
    const l = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  },
  lerp: (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)],
};

// ── Matrices (column-major, like WebGL) ────────────────────────────────────
export type Mat4 = Float32Array;
export const m4 = {
  ident(): Mat4 {
    const m = new Float32Array(16);
    m[0] = m[5] = m[10] = m[15] = 1;
    return m;
  },
  /** a · b (b is applied first). */
  mul(a: Mat4, b: Mat4): Mat4 {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 4; r++) {
        o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
      }
    }
    return o;
  },
  /** ms[0] · ms[1] · … (the last one is applied first). */
  chain(...ms: Mat4[]): Mat4 {
    let o = ms[0];
    for (let i = 1; i < ms.length; i++) o = m4.mul(o, ms[i]);
    return o;
  },
  translate(x: number, y: number, z: number): Mat4 {
    const m = m4.ident();
    m[12] = x; m[13] = y; m[14] = z;
    return m;
  },
  scale(x: number, y = x, z = x): Mat4 {
    const m = m4.ident();
    m[0] = x; m[5] = y; m[10] = z;
    return m;
  },
  rotX(a: number): Mat4 {
    const m = m4.ident(), c = Math.cos(a), s = Math.sin(a);
    m[5] = c; m[6] = s; m[9] = -s; m[10] = c;
    return m;
  },
  rotY(a: number): Mat4 {
    const m = m4.ident(), c = Math.cos(a), s = Math.sin(a);
    m[0] = c; m[2] = -s; m[8] = s; m[10] = c;
    return m;
  },
  rotZ(a: number): Mat4 {
    const m = m4.ident(), c = Math.cos(a), s = Math.sin(a);
    m[0] = c; m[1] = s; m[4] = -s; m[5] = c;
    return m;
  },
  point(m: Mat4, p: Vec3): Vec3 {
    return [
      m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
      m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
      m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
    ];
  },
};

// ── Camera ─────────────────────────────────────────────────────────────────
export type Cam = {
  eye: Vec3;
  target: Vec3;
  roll: number;
  /** Field of view across the *shorter* viewport side, so a square safe area
      frames identically in landscape and portrait. */
  fov: number;
  /** Post-projection zoom (a longer lens without moving the camera). */
  zoom: number;
  /** Lens shift in NDC: moves the optical centre on screen. */
  shift: Vec2;
};

export type CamM = Cam & {
  W: number; H: number;
  view: Mat4; proj: Mat4; vp: Mat4;
  right: Vec3; up: Vec3; fwd: Vec3;
  fx: number; fy: number;
};

export function buildCam(c: Cam, W: number, H: number, near = 0.02, far = 200): CamM {
  const fwd = v3.norm(v3.sub(c.target, c.eye));
  let upRef: Vec3 = Math.abs(fwd[1]) > 0.999 ? [0, 0, -1] : [0, 1, 0];
  if (c.roll) {
    const side = v3.norm(v3.cross(fwd, upRef));
    upRef = v3.add(v3.scale(upRef, Math.cos(c.roll)), v3.scale(side, Math.sin(c.roll)));
  }
  const right = v3.norm(v3.cross(fwd, upRef));
  const up = v3.cross(right, fwd);

  const view = new Float32Array(16);
  view[0] = right[0]; view[4] = right[1]; view[8] = right[2]; view[12] = -v3.dot(right, c.eye);
  view[1] = up[0]; view[5] = up[1]; view[9] = up[2]; view[13] = -v3.dot(up, c.eye);
  view[2] = -fwd[0]; view[6] = -fwd[1]; view[10] = -fwd[2]; view[14] = v3.dot(fwd, c.eye);
  view[15] = 1;

  const asp = W / H;
  const f = (1 / Math.tan(c.fov / 2)) * c.zoom;
  const fx = asp >= 1 ? f / asp : f;
  const fy = asp >= 1 ? f : f * asp;
  const proj = new Float32Array(16);
  proj[0] = fx;
  proj[5] = fy;
  proj[8] = -c.shift[0];
  proj[9] = -c.shift[1];
  proj[10] = (far + near) / (near - far);
  proj[11] = -1;
  proj[14] = (2 * far * near) / (near - far);

  return { ...c, W, H, view, proj, vp: m4.mul(proj, view), right, up, fwd, fx, fy };
}

/** World → canvas pixels (y down). `scale` is pixels per world unit at that depth. */
export function project(c: CamM, p: Vec3) {
  const rel = v3.sub(p, c.eye);
  const d = v3.dot(rel, c.fwd);
  const x = v3.dot(rel, c.right), y = v3.dot(rel, c.up);
  const dd = Math.max(d, 1e-4);
  const nx = (c.fx * x) / dd + c.shift[0];
  const ny = (c.fy * y) / dd + c.shift[1];
  return { x: (nx * 0.5 + 0.5) * c.W, y: (0.5 - ny * 0.5) * c.H, depth: d, scale: (c.fx * c.W * 0.5) / dd };
}

/** Canvas pixels (y down) at view depth `d` → world. */
export function unproject(c: CamM, px: number, py: number, d: number): Vec3 {
  const nx = (px / c.W) * 2 - 1, ny = 1 - (py / c.H) * 2;
  const x = ((nx - c.shift[0]) * d) / c.fx;
  const y = ((ny - c.shift[1]) * d) / c.fy;
  return v3.add(c.eye, v3.add(v3.add(v3.scale(c.right, x), v3.scale(c.up, y)), v3.scale(c.fwd, d)));
}

export const lerpCam = (a: Cam, b: Cam, t: number): Cam => ({
  eye: v3.lerp(a.eye, b.eye, t),
  target: v3.lerp(a.target, b.target, t),
  roll: lerp(a.roll, b.roll, t),
  fov: lerp(a.fov, b.fov, t),
  // Zoom reads perceptually linear when interpolated geometrically.
  zoom: a.zoom * Math.pow(b.zoom / a.zoom, t),
  shift: [lerp(a.shift[0], b.shift[0], t), lerp(a.shift[1], b.shift[1], t)],
});
