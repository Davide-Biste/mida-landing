import { E, prog, type Ease } from "./math";

// Kinetic type on Canvas2D. Lines are laid out glyph-by-glyph (kerning kept via
// prefix measurement, tracking added by hand) so every letter can be animated
// on its own, then the whole canvas is handed to WebGL as one texture and goes
// through the same lens, bloom and grain as the 3D.

/** The landing's own stack: SF Pro on Apple devices, the app's native face. */
export const SANS =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", system-ui, Roboto, Helvetica, Arial, sans-serif';

export type Ctx = CanvasRenderingContext2D;
export type Glyph = { ch: string; x: number; w: number };
export type Line = {
  text: string; weight: number; family: string; track: number;
  glyphs: Glyph[];
  /** All metrics are in ems: multiply by the font size. */
  width: number; asc: number; desc: number;
};

const cache = new Map<string, Line>();

export function clearTypeCache() { cache.clear(); }

/**
 * `ref` is the size the line is measured at. System faces track differently at
 * text and display sizes, so small copy should be measured small.
 */
export function layout(ctx: Ctx, text: string, weight: number, family: string, track = 0, ref = 200): Line {
  const REF = ref;
  const key = `${weight}|${track}|${ref}|${family}|${text}`;
  const hit = cache.get(key);
  if (hit) return hit;
  ctx.font = `${weight} ${REF}px ${family}`;
  const chars = Array.from(text);
  const glyphs: Glyph[] = [];
  let prev = 0;
  for (let i = 0; i < chars.length; i++) {
    const w = ctx.measureText(chars.slice(0, i + 1).join("")).width;
    glyphs.push({ ch: chars[i], x: prev / REF + i * track, w: (w - prev) / REF });
    prev = w;
  }
  const m = ctx.measureText(text);
  const ln: Line = {
    text, weight, family, track, glyphs,
    width: prev / REF + Math.max(0, chars.length - 1) * track,
    asc: (m.actualBoundingBoxAscent || REF * 0.74) / REF,
    desc: (m.actualBoundingBoxDescent || REF * 0.22) / REF,
  };
  cache.set(key, ln);
  return ln;
}

/** Per-glyph animation state. Offsets are in ems. */
export type Fx = { dx?: number; dy?: number; s?: number; a?: number; rot?: number };
export type FxFn = (i: number, n: number) => Fx | null;

export type DrawOpts = {
  color: string;
  align?: "left" | "center" | "right";
  alpha?: number;
  fx?: FxFn;
  /** Clip to the line's own box: the classic masked rise. */
  mask?: boolean;
};

/** Left edge of a line for a given anchor/alignment. */
export const lineLeft = (ln: Line, x: number, size: number, align: DrawOpts["align"] = "left") =>
  align === "center" ? x - (ln.width * size) / 2 : align === "right" ? x - ln.width * size : x;

export function drawLine(ctx: Ctx, ln: Line, x: number, baseline: number, size: number, o: DrawOpts) {
  const x0 = lineLeft(ln, x, size, o.align);
  const alpha = o.alpha ?? 1;
  if (alpha <= 0.001) return;
  ctx.save();
  if (o.mask) {
    const pad = size * 0.06;
    ctx.beginPath();
    ctx.rect(x0 - size * 0.25, baseline - ln.asc * size - pad, ln.width * size + size * 0.5, (ln.asc + ln.desc) * size + pad * 2);
    ctx.clip();
  }
  ctx.font = `${ln.weight} ${size}px ${ln.family}`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = o.color;
  const n = ln.glyphs.length;
  for (let i = 0; i < n; i++) {
    const g = ln.glyphs[i];
    if (g.ch === " ") continue;
    const f = o.fx ? o.fx(i, n) : undefined;
    if (f === null) continue;
    const a = alpha * (f?.a ?? 1);
    if (a <= 0.003) continue;
    ctx.globalAlpha = a;
    const gx = x0 + (g.x + (f?.dx ?? 0)) * size;
    const gy = baseline + (f?.dy ?? 0) * size;
    const s = f?.s ?? 1, rot = f?.rot ?? 0;
    if (s !== 1 || rot !== 0) {
      // Scale/rotate about the glyph's optical centre.
      const cx = gx + (g.w * size) / 2, cy = gy - ln.asc * size * 0.45;
      ctx.save();
      ctx.translate(cx, cy);
      if (rot) ctx.rotate(rot);
      ctx.scale(s, s);
      ctx.fillText(g.ch, -(g.w * size) / 2, ln.asc * size * 0.45);
      ctx.restore();
    } else {
      ctx.fillText(g.ch, gx, gy);
    }
  }
  ctx.restore();
}

/** Largest font size at which every line fits the box. */
export function fit(lines: Line[], maxW: number, maxH: number, leading = 1) {
  const w = Math.max(...lines.map((l) => l.width));
  return Math.min(maxW / w, maxH / (lines.length * leading));
}

// ── Reveal presets ─────────────────────────────────────────────────────────

/** Masked rise in at `tin`, masked exit upwards at `tout` (use with mask: true). */
export function riseInOut(t: number, tin: number, tout = Infinity, stagger = 0.022, dur = 0.55, dist = 1.2, ease: Ease = E.outExpo): FxFn {
  return (i) => {
    const a = ease(prog(t, tin + i * stagger, tin + i * stagger + dur));
    const b = E.inCubic(prog(t, tout + i * stagger * 0.5, tout + i * stagger * 0.5 + 0.24));
    if (a <= 0 || b >= 1) return null;
    return { dy: (1 - a) * dist - b * dist };
  };
}

/** Letters punch in from oversize, slightly rotated, with a quick fade. */
export function punchInOut(t: number, tin: number, tout = Infinity, stagger = 0.03, dur = 0.42): FxFn {
  return (i) => {
    const a = E.outExpo(prog(t, tin + i * stagger, tin + i * stagger + dur));
    const b = E.inCubic(prog(t, tout + i * stagger * 0.4, tout + i * stagger * 0.4 + 0.22));
    if (a <= 0 || b >= 1) return null;
    return { s: 1 + (1 - a) * 0.4, a: Math.min(1, a * 3) * (1 - b), dy: (1 - a) * 0.1 + b * 0.5 };
  };
}

/** Monospace label with an optional typewriter reveal (`shown` 0..1). */
export function label(
  ctx: Ctx, text: string, x: number, y: number, size: number, family: string, color: string,
  o: { align?: "left" | "center" | "right"; alpha?: number; shown?: number; track?: number; weight?: number } = {}
) {
  const alpha = o.alpha ?? 1;
  if (alpha <= 0.003) return 0;
  const ln = layout(ctx, text, o.weight ?? 500, family, o.track ?? 0.09);
  const count = Math.round((o.shown ?? 1) * ln.glyphs.length);
  if (count <= 0) return ln.width * size;
  drawLine(ctx, ln, x, y, size, { color, align: o.align, alpha, fx: (i) => (i < count ? {} : null) });
  return ln.width * size;
}

export const rgba = (r: number, g: number, b: number, a = 1) => `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
