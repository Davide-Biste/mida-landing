import {
  DEG, E, TAU, buildCam, clamp, hash, hop, lerp, lerpCam, m4, mulberry32, noise1, prog, project, pulse, seg, smooth, spring,
  unproject, v3, type Cam, type CamM, type Mat4, type Vec2, type Vec3,
} from "./math";
import { Pool, Program, freeTarget, makeInstances, makeTarget, makeTexture, type GL, type Instances, type Mesh, type Target } from "./gl";
import * as SH from "./shaders";
import { Fluid } from "./fluid";
import { COIN_HZ, PHONE_H, boxMesh, coinMesh, crownCanvas, phoneMesh, quadMesh } from "./meshes";
import { SANS, clearTypeCache, drawLine, label, layout, lineLeft, punchInOut, riseInOut, type Ctx, type Line } from "./type";
import type { ReelCopy } from "./copy";

// ============================================================================
// Mida — showreel. One deterministic function of time: render(t) draws frame t,
// so it can be scrubbed, looped and captured.
//
// The through-line is the coin. It starts as the app icon, falls through the
// icon's sky, fills the frame with gold, becomes the full stop of each headline,
// lands as a chart, rolls past the product and ends back inside the icon.
// ============================================================================

export const DUR = 18;

/** Cut points, in seconds. Hits sit on a 120 bpm grid wherever they can. */
export const T = {
  punch0: 0.1, punch1: 0.58,   // dive into the icon
  gold: 1.56,                  // the coin's face fills the frame
  ink: 3.0,                    // the full stop bursts into ink
  s3out: 4.68,
  coin: 5.0, land: 5.42,       // the dot grows into the coin and lands flat
  unroll0: 6.2, unroll1: 6.8,  // the crown of bars unrolls into a chart
  stand0: 6.42, stand1: 6.84,
  ph: [7.25, 8.75, 10.25],     // wallets · budgets · projections — three beats each
  pal: [11.75, 12.15, 12.55, 12.95, 13.35],
  suck: 13.85,
  rush0: 14.2, rush1: 14.44,   // through the screen
  stop: 14.48,
  lock: 15.0,                  // back into the icon
};
/** How long the camera rests on each phone before whipping on to the next. */
const DWELL = 1.2;

const hex = (h: string): Vec3 => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

// Brand colours, straight from globals.css / mida.svg.
const COL = {
  green: hex("#2fd07e"), bright: hex("#4fe39a"), deep: hex("#0a7d43"),
  red: hex("#f0453a"), dark: hex("#0a0a0c"), card: hex("#fbfbfd"), gold: hex("#F5D23E"),
};
const CSS = { ink: "#111111", white: "#f5f5f7", bright: "#4fe39a", mutedDark: "#a1a1a6", gold: "#F5D23E" };

/**
 * Surface colours for the lock-up that opens and closes the film. They come
 * from the page (--tile, --ink, --brand-ink, --muted), so embedded in the
 * landing the first and last frame look like any other card on it — in light
 * and in dark.
 */
export type ReelTheme = { card: string; ink: string; accent: string; muted: string };

// The app's four colour families (same shades the landing's carousel shows).
const PALETTES = [
  { screen: "palette-energy", shades: ["#E5614C", "#D63E55", "#C04A8E", "#E68642", "#E5B23C"] },
  { screen: "palette-calm", shades: ["#9583C4", "#7B7AC2", "#D88AA0", "#E8A789", "#B084A8"] },
  { screen: "palette-nature", shades: ["#3B9669", "#2C5F3F", "#8AAE3F", "#4FA890", "#7C9982"] },
  { screen: "palette-night", shades: ["#3B6CC9", "#4658B8", "#2A7A9E", "#27324D", "#4C5A6B"] },
];
const SCREENS = ["wallets-dark", "budgets-dark", "projection", "home-dark", ...PALETTES.map((p) => p.screen)];

// ── The icon, measured: where everything sits inside its frame (-1..1) ──────
const FOV_ICON = 2 * Math.atan(1 / 6);
const COIN_HOME: Vec3 = [-0.012, -0.205, 0];
const COIN_R = 0.487;
const LOGO_POSE = m4.mul(m4.rotZ(15 * DEG), m4.rotX(-51 * DEG));
const ICON_CLOUDS = [
  { x: -0.5, y: 0.585, z: -0.02, w: 0.94, variant: 0, from: -1.7 },
  { x: 0.655, y: 0.255, z: -0.02, w: 0.64, variant: 1, from: 1.6 },
  { x: -0.545, y: -0.165, z: -0.02, w: 0.42, variant: 2, from: -1.3 },
];
const ICON_LINES = [
  { x: -0.42, y: 0.187 }, { x: -0.232, y: 0.29 }, { x: -0.055, y: 0.356 }, { x: 0.152, y: 0.365 }, { x: 0.34, y: 0.288 },
];

// ── The dark stage ──────────────────────────────────────────────────────────
const RHO = 1.117;         // ring of bars, hugging the coin's rim
const BAR_H = Array.from({ length: 36 }, (_, i) =>
  0.14 + 0.46 * hash(i, 3) ** 2 + (i === 20 ? 1.2 : i === 12 ? 0.78 : i === 27 ? 0.86 : i === 6 ? 0.58 : i === 31 ? 0.46 : i === 16 ? 0.38 : 0)
);
const BAR_RED = Array.from({ length: 36 }, (_, i) => hash(i, 9) < 0.28);
const ROLL_R = 0.44;
const HERO_H = 3.4;

/** The trucking camera: a slow drift plus four eased whips, one per phone. */
const camX = (t: number) =>
  0.75 * (clamp(t, 6.4, T.pal[0]) - 6.4) + 0.15 * Math.max(t - T.pal[0], 0) +
  7.6 * seg(t, T.ph[0] - 0.3, T.ph[0] + 0.05) + 6.6 * seg(t, T.ph[1] - 0.26, T.ph[1] + 0.05) +
  6.6 * seg(t, T.ph[2] - 0.26, T.ph[2] + 0.05) + 6.8 * seg(t, T.pal[0] - 0.28, T.pal[0] + 0.02);
const PHONE_X = T.ph.map((p) => camX(p + 0.05 + DWELL / 2) + 0.5);
const HERO_X = camX(T.pal[0] + 0.5) + 0.5;

/** When each slate of the running HUD takes over (names come from the copy). */
const SHOTS = [0, T.gold, T.ink, T.coin, T.ph[0] - 0.2, T.ph[1] - 0.14, T.ph[2] - 0.14, T.pal[0], T.pal[4]];

type Dot = { x: number; y: number; r: number };
type TextLine = { ln: Line; x: number; b: number };
type Layout = {
  m: number; mono: number;
  iconC: Vec2; iconHalf: number; k0: number; k1: number;
  s2: { size: number; x: number; lines: TextLine[]; dot: Dot; dotOut: Dot };
  s3: { size: number; lines: TextLine[]; dot: Dot };
  s7: { size: number; line: TextLine; dot: Dot };
  lock: { wordSize: number; wordB: number; tagSize: number; tagB: number; priceB: number };
};

type CoinI = { m: Mat4; flat: number; glow: number; cheat: number };
type PhoneI = { m: Mat4; tex: WebGLTexture | null; on: number; gain: number; sweep: number };
type SpriteI = { x: number; y: number; z: number; w: number; h: number; kind: number; r: number; g: number; b: number; a: number; soft: number; variant: number };

type Frame = {
  cam: CamM;
  world: 0 | 1 | 2;                 // none · sky · dark stage
  sky: number; skyRich: number; skyFrame: Vec3; aurora: number;
  floodBase: number[]; floodWipe: number[]; floodC: Vec2; flooded: number;
  floor: number; floorFocus: Vec3; ring: number[];
  rim: Vec3;
  coins: CoinI[]; phones: PhoneI[]; sprites: SpriteI[]; nBars: number; nParts: number;
  fluidAmb: number; fluidInside: number; fluidCore: number; fluidMask: number;
  backMode: 0 | 1 | 2 | 3;          // off · plain layer · gold poster · ink mask
  posterA: number; posterShade: number; iris: Vec3;
  cardA: number; mask: Vec3; cardWipe: Vec3; outerA: number; arc: number;
  frontWipe: number[];
  bloom: number; ca: number; lens: number; grain: number; vig: number; flash: number;
  fade: number[]; ripple: number[]; zoom: Vec3; shake: Vec2;
};

export type ReelInit = { assetBase: string; mono: string; copy: ReelCopy; theme: ReelTheme; loop: boolean };

export class ReelEngine {
  loop: boolean;
  /** Multiplier on the film's own grain (the page lays its own over an embedded stage). */
  grain = 1;
  /** Backing-store pixels per CSS pixel (drives the minimum type sizes). */
  scale = 1;
  W = 2; H = 2;
  ready = false;
  readonly hdr: boolean;

  private gl: GL;
  private pool: Pool;
  private dead = false;
  private P: Record<string, Program>;
  private coin: Mesh; private phone: Mesh; private box: Mesh; private quadS: Mesh; private quadP: Mesh;
  private iCoin: Instances; private iBar: Instances; private iSprite: Instances; private iPart: Instances;
  private ms: { fbo: WebGLFramebuffer; color: WebGLRenderbuffer; depth: WebGLRenderbuffer } | null = null;
  private depthRb: WebGLRenderbuffer | null = null;
  private scene: Target | null = null;
  private down: Target[] = [];
  private up: Target[] = [];
  private tex: Record<string, WebGLTexture> = {};
  private back: HTMLCanvasElement; private front: HTMLCanvasElement;
  private bctx: Ctx; private fctx: Ctx;
  private backTex: WebGLTexture; private frontTex: WebGLTexture;
  private fluid: Fluid;
  private lay: Layout | null = null;
  private light: Vec3 = v3.norm([-0.45, 0.72, 0.55]);
  private fallClouds: { x: number; y: number; z: number; w: number; variant: number; a: number; soft: number }[] = [];
  private streaks: { x: number; y: number; z: number; w: number; len: number; sp: number; a: number }[] = [];
  private motes: { a0: number; rad: number; y: number; w: number; tx: number; ty: number; delay: number; size: number; gold: boolean }[] = [];
  private mono: string;
  private copy: ReelCopy;
  private base: string;
  private theme!: ReelTheme;
  private cardRgb: Vec3 = COL.card;
  private cardDark = false;

  constructor(private canvas: HTMLCanvasElement, init: ReelInit) {
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: "high-performance", preserveDrawingBuffer: false });
    if (!gl) throw new Error("WebGL2 is not available");
    this.gl = gl;
    this.pool = new Pool(gl);
    this.loop = init.loop;
    this.mono = init.mono;
    this.copy = init.copy;
    this.base = init.assetBase;
    this.setTheme(init.theme);
    this.hdr = !!(gl.getExtension("EXT_color_buffer_float") || gl.getExtension("EXT_color_buffer_half_float"));

    const mk = (vs: string, fs: string, label: string) => new Program(this.pool, vs, fs, label);
    this.P = {
      bg: mk(SH.VS_FULL, SH.FS_BG, "bg"),
      floor: mk(SH.VS_FLOOR, SH.FS_FLOOR, "floor"),
      coin: mk(SH.VS_COIN, SH.FS_COIN, "coin"),
      phone: mk(SH.VS_PHONE, SH.FS_PHONE, "phone"),
      bar: mk(SH.VS_BAR, SH.FS_BAR, "bar"),
      sprite: mk(SH.VS_SPRITE, SH.FS_SPRITE, "sprite"),
      part: mk(SH.VS_PART, SH.FS_PART, "part"),
      layer: mk(SH.VS_FULL, SH.FS_LAYER, "layer"),
      poster: mk(SH.VS_FULL, SH.FS_POSTER, "poster"),
      ink: mk(SH.VS_FULL, SH.FS_FLUID_SHOW, "ink"),
      card: mk(SH.VS_FULL, SH.FS_CARD, "card"),
      down: mk(SH.VS_FULL, SH.FS_BLOOM_DOWN, "bloom.down"),
      up: mk(SH.VS_FULL, SH.FS_BLOOM_UP, "bloom.up"),
      final: mk(SH.VS_FULL, SH.FS_FINAL, "final"),
    };

    this.coin = coinMesh(this.pool);
    this.phone = phoneMesh(this.pool);
    this.box = boxMesh(this.pool);
    this.quadS = quadMesh(this.pool);
    this.quadP = quadMesh(this.pool);
    this.iCoin = makeInstances(this.pool, this.coin, 4, [4, 4, 4, 4, 4], 8);
    this.iBar = makeInstances(this.pool, this.box, 2, [4, 4, 4, 4, 4], 48);
    this.iSprite = makeInstances(this.pool, this.quadS, 1, [3, 4, 4, 2], 96);
    this.iPart = makeInstances(this.pool, this.quadP, 1, [4, 4, 2], 2400);

    this.back = document.createElement("canvas");
    this.front = document.createElement("canvas");
    this.bctx = this.back.getContext("2d")!;
    this.fctx = this.front.getContext("2d")!;
    this.backTex = makeTexture(this.pool, null);
    this.frontTex = makeTexture(this.pool, null);
    this.tex.crown = makeTexture(this.pool, crownCanvas(), { mips: true });
    this.fluid = new Fluid(this.pool, this.hdr);

    // Everything random is seeded: frame t always looks the same.
    const rnd = mulberry32(20260910);
    const R = (a: number, b: number) => a + rnd() * (b - a);
    for (let i = 0; i < 15; i++) {
      const near = i % 5 < 2;
      const side = rnd() < 0.5 ? -1 : 1;
      this.fallClouds.push({
        x: near ? side * R(0.9, 2.6) : R(-3.6, 3.6), y: R(-1.9, -12.5), z: near ? R(0.7, 2.2) : R(-5.5, -1.2),
        w: near ? R(1.3, 2.4) : R(1.0, 2.6), variant: Math.floor(rnd() * 3), a: near ? 0.93 : 0.97, soft: near ? 0.035 : 0,
      });
    }
    for (let i = 0; i < 40; i++) {
      this.streaks.push({ x: R(-3, 3), y: R(-6, 6), z: R(-2.6, 1.4), w: R(0.016, 0.034), len: R(0.5, 1.5), sp: R(1.5, 2.6), a: R(0.5, 1) });
    }
    for (let i = 0; i < 1500; i++) {
      this.motes.push({
        a0: R(0, TAU), rad: R(2.0, 6.2), y: R(-1.9, 2.4), w: R(0.25, 0.9) * (rnd() < 0.5 ? -1 : 1),
        tx: R(-0.72, 0.72), ty: R(-1.6, 1.6), delay: rnd(), size: R(0.009, 0.024), gold: rnd() < 0.14,
      });
    }
  }

  // ── Assets ────────────────────────────────────────────────────────────────
  async load() {
    const load = (url: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`[reel] could not load ${url}`));
        img.src = url;
      });
    // Phones are small on screen: halve the screenshots on handhelds to keep
    // texture memory (and Safari) happy.
    const maxW = Math.min(window.screen.width, window.screen.height) < 700 ? 620 : 900;
    const shrink = (img: HTMLImageElement): TexImageSource => {
      if (img.naturalWidth <= maxW) return img;
      const cv = document.createElement("canvas");
      cv.width = maxW;
      cv.height = Math.round((img.naturalHeight * maxW) / img.naturalWidth);
      cv.getContext("2d")!.drawImage(img, 0, 0, cv.width, cv.height);
      return cv;
    };
    const imgs = await Promise.all(SCREENS.map((n) => load(`${this.base}/screens/${n}.jpg`)));
    if (this.dead) return;
    imgs.forEach((img, i) => { this.tex[SCREENS[i]] = makeTexture(this.pool, shrink(img), { mips: true }); });
    this.ready = true;
  }

  setCopy(copy: ReelCopy) {
    this.copy = copy;
    clearTypeCache();
    this.lay = null;
  }

  setTheme(theme: ReelTheme) {
    this.theme = theme;
    this.cardRgb = /^#[0-9a-f]{6}$/i.test(theme.card) ? hex(theme.card) : COL.card;
    this.cardDark = this.cardRgb[0] * 0.3 + this.cardRgb[1] * 0.59 + this.cardRgb[2] * 0.11 < 0.4;
  }

  dispose() {
    this.dead = true;
    this.ready = false;
    this.pool.dispose();
  }

  // ── Sizing ────────────────────────────────────────────────────────────────
  resize(w: number, h: number, scale: number) {
    w = Math.max(2, Math.round(w));
    h = Math.max(2, Math.round(h));
    this.scale = scale;
    if (w === this.W && h === this.H && this.scene) return;
    this.W = w; this.H = h;
    this.canvas.width = w; this.canvas.height = h;
    this.back.width = this.front.width = w;
    this.back.height = this.front.height = h;
    this.lay = null;
    this.buildTargets();
    this.fluid.resize(w / h);
    this.fluid.reset();
  }

  private buildTargets() {
    const gl = this.gl, { W, H } = this, pool = this.pool;
    freeTarget(pool, this.scene);
    this.down.forEach((t) => freeTarget(pool, t));
    this.up.forEach((t) => freeTarget(pool, t));
    this.down = []; this.up = [];
    if (this.ms) { gl.deleteFramebuffer(this.ms.fbo); gl.deleteRenderbuffer(this.ms.color); gl.deleteRenderbuffer(this.ms.depth); this.ms = null; }
    if (this.depthRb) { gl.deleteRenderbuffer(this.depthRb); this.depthRb = null; }

    const internal = this.hdr ? gl.RGBA16F : gl.RGBA8;
    const type = this.hdr ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE;
    this.scene = makeTarget(pool, W, H, internal, gl.RGBA, type, gl.LINEAR);

    // 4× MSAA for the solids' silhouettes, resolved into `scene`.
    const samples = Math.min(4, gl.getParameter(gl.MAX_SAMPLES) as number);
    const fbo = gl.createFramebuffer()!;
    const color = gl.createRenderbuffer()!;
    const depth = gl.createRenderbuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.bindRenderbuffer(gl.RENDERBUFFER, color);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, internal, W, H);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, color);
    gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.DEPTH_COMPONENT24, W, H);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);
    if (samples > 1 && gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {
      this.ms = { fbo, color, depth };
    } else {
      gl.deleteFramebuffer(fbo); gl.deleteRenderbuffer(color); gl.deleteRenderbuffer(depth);
      this.depthRb = gl.createRenderbuffer()!;
      gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthRb);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, W, H);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.scene.fbo);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthRb);
    }

    let w = W, h = H;
    for (let i = 0; i < 6; i++) {
      w = Math.max(2, w >> 1); h = Math.max(2, h >> 1);
      this.down.push(makeTarget(pool, w, h, internal, gl.RGBA, type, gl.LINEAR));
      if (i < 5) this.up.push(makeTarget(pool, w, h, internal, gl.RGBA, type, gl.LINEAR));
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  // ── Type layout (re-measured whenever the frame or the language changes) ──
  private ensureLayout(): Layout {
    if (this.lay) return this.lay;
    const { W, H } = this, S = Math.min(W, H), land = W >= H, c = this.copy, ctx = this.fctx;
    const m = S * 0.042;
    const mono = Math.max(S * 0.0152, 9.5 * this.scale);
    const DOT = 0.092, GAP = 0.075, ROOM = GAP + DOT * 2 + 0.02;
    const head = (s: string) => layout(ctx, s, 700, SANS, -0.045);

    // Shot 2 — "Personal / finance●": a left-aligned stack, centred as a block.
    const A = c.titleA.map(head);
    const wA = Math.max(...A.map((l, i) => l.width + (i === A.length - 1 ? ROOM : 0)));
    const sizeA = Math.min((W * (land ? 0.72 : 0.86)) / wA, (H * (land ? 0.6 : 0.4)) / (A.length * 0.95), S * 0.44);
    const xA = (W - wA * sizeA) / 2;
    const cyA = H * 0.5 - S * 0.024;
    const topA = cyA - ((A.length - 1) * 0.95 + 0.72) * sizeA * 0.5;
    const linesA = A.map((ln, i) => ({ ln, x: xA, b: topA + (0.72 + i * 0.95) * sizeA }));
    const lastA = linesA[linesA.length - 1];
    const rA = DOT * sizeA;
    const dotA: Dot = { x: xA + (lastA.ln.width + GAP) * sizeA + rA, y: lastA.b - rA, r: rA };
    const scOut = 1.028;   // the block has crept in by this much when it bursts
    const dotOut: Dot = { x: W / 2 + (dotA.x - W / 2) * scOut, y: cyA + (dotA.y - cyA) * scOut, r: rA * scOut };

    // Shot 3 — "Truly yours●": one line if it is bigger that way, else two.
    const words = c.titleB.split(" ");
    const one = [head(c.titleB)];
    const mid = Math.ceil(words.length / 2);
    const two = words.length > 1 ? [head(words.slice(0, mid).join(" ")), head(words.slice(mid).join(" "))] : one;
    const sizeFor = (ls: Line[]) =>
      Math.min((W * 0.8) / Math.max(...ls.map((l, i) => l.width + (i === ls.length - 1 ? ROOM : 0))), (H * 0.5) / (ls.length * 0.98), S * 0.36);
    const B = sizeFor(two) > sizeFor(one) * 1.08 ? two : one;
    const sizeB = sizeFor(B);
    const cyB = H * 0.5 - S * 0.01;
    const topB = cyB - ((B.length - 1) * 0.98 + 0.72) * sizeB * 0.5;
    const linesB = B.map((ln, i) => {
      const w = (ln.width + (i === B.length - 1 ? ROOM : 0)) * sizeB;
      return { ln, x: (W - w) / 2, b: topB + (0.72 + i * 0.98) * sizeB };
    });
    const lastB = linesB[linesB.length - 1];
    const rB = DOT * sizeB;
    const dotB: Dot = { x: lastB.x + (lastB.ln.width + GAP) * sizeB + rB, y: lastB.b - rB, r: rB };

    // Shot 7 — "Full stop●".
    const ln7 = head(c.privacy[2]);
    const size7 = Math.min((W * 0.72) / (ln7.width + ROOM), S * 0.3);
    const x7 = (W - (ln7.width + ROOM) * size7) / 2;
    const b7 = H * 0.5 + size7 * 0.3;
    const r7 = DOT * size7;
    const dot7: Dot = { x: x7 + (ln7.width + GAP) * size7 + r7, y: b7 - r7, r: r7 };

    // Lock-up.
    const iconHalf = S * (land ? 0.15 : 0.17);
    const iconC: Vec2 = [W / 2, H * (land ? 0.375 : 0.36)];
    const k0 = iconHalf / (S * 0.5);
    // Zoom at which the icon window, centred so the coin sits mid-frame, covers
    // every corner of the viewport.
    let k1 = 2;
    for (let i = 0; i < 4; i++) {
      const fx = W / 2 - k1 * S * 0.5 * COIN_HOME[0], fy = H / 2 + k1 * S * 0.5 * COIN_HOME[1];
      let need = 0;
      for (const [px, py] of [[0, 0], [W, 0], [0, H], [W, H]]) {
        need = Math.max(need, Math.pow(Math.pow(Math.abs(px - fx), 4.5) + Math.pow(Math.abs(py - fy), 4.5), 1 / 4.5));
      }
      k1 = (need * 1.06) / (S * 0.5);
    }
    const wordSize = iconHalf * 0.7;
    const wordB = iconC[1] + iconHalf + wordSize * 1.22;
    const tagSize = Math.max(iconHalf * 0.215, 13 * this.scale);
    const tagB = wordB + tagSize * 2.05;

    this.lay = {
      m, mono, iconC, iconHalf, k0, k1,
      s2: { size: sizeA, x: xA, lines: linesA, dot: dotA, dotOut },
      s3: { size: sizeB, lines: linesB, dot: dotB },
      s7: { size: size7, line: { ln: ln7, x: x7, b: b7 }, dot: dot7 },
      lock: { wordSize, wordB, tagSize, tagB, priceB: tagB + tagSize * 2.5 },
    };
    return this.lay;
  }

  // ==========================================================================
  // Composition: everything about frame t, decided before a single draw call.
  // ==========================================================================
  private compose(t: number): Frame {
    const { W, H } = this;
    this.ensureLayout();
    const f: Frame = {
      cam: buildCam({ eye: [0, 0, 6], target: [0, 0, 0], roll: 0, fov: FOV_ICON, zoom: 1, shift: [0, 0] }, W, H),
      world: 0, sky: 0, skyRich: 0, skyFrame: [W / 2, H / 2, H], aurora: 0,
      floodBase: [0, 0, 0, 0], floodWipe: [0, 0, 0, 0], floodC: [W / 2, H / 2], flooded: 0,
      floor: 0, floorFocus: [0, 0, 0], ring: [0, 0, 0, 0],
      rim: [0, 0, 0],
      coins: [], phones: [], sprites: [], nBars: 0, nParts: 0,
      fluidAmb: 0, fluidInside: 0, fluidCore: 0, fluidMask: 0,
      backMode: 0, posterA: 0, posterShade: 0, iris: [0, 0, 0],
      cardA: 0, mask: [0, 0, 1], cardWipe: [0, 0, -1], outerA: 0, arc: 0,
      frontWipe: [0, 0, 0, 0],
      bloom: 0.3, ca: 0.0015, lens: 0.02, grain: 0.035, vig: 0.2, flash: 0,
      fade: [0, 0, 0, 0], ripple: [0.5, 0.5, 0, 0], zoom: [0.5, 0.5, 0], shake: [0, 0],
    };
    if (t < T.gold + 0.02 || t >= T.lock) this.skyWorld(t, f);
    else this.darkWorld(t, f);
    this.draw2D(t, f);
    this.grade(t, f);
    return f;
  }

  // ── The icon's sky: ident, dive, fall, and the return ─────────────────────
  private skyWorld(t: number, f: Frame) {
    const { W, H } = this, S = Math.min(W, H), land = W >= H, L = this.lay!;
    const end = t >= T.lock, te = t - T.lock;
    const home = COIN_HOME;
    const iconCam = (fc: Vec2, k: number): Cam => ({
      eye: [0, 0, 6], target: [0, 0, 0], roll: 0, fov: FOV_ICON, zoom: k, shift: [(fc[0] / W) * 2 - 1, 1 - (fc[1] / H) * 2],
    });
    /** Screen offset of the coin from the icon's centre at zoom k. */
    const coinOff = (k: number): Vec2 => [k * S * 0.5 * home[0], -k * S * 0.5 * home[1]];

    const bob = 0.016 * Math.sin((TAU * t) / 1.5);
    let cam: Cam;
    let fall = 0, speed = 0, cheat = 1, flat = 0;
    let coinPos: Vec3 = [home[0], home[1] + bob, home[2]];
    let coinRot = LOGO_POSE;
    let maskC: Vec2, maskHalf: number, frameC: Vec2, frameHalf: number;

    if (!end) {
      // Dive: zoom the long icon lens until the window swallows the viewport.
      const camA: Cam = { eye: [home[0], home[1], 6], target: [home[0], home[1], 0], roll: 0, fov: FOV_ICON, zoom: L.k1, shift: [0, 0] };
      cam = lerpCam(iconCam(L.iconC, L.k0), camA, seg(t, T.punch0, T.punch1, E.inOutCubic));

      // The world starts rushing upwards: we are falling with the coin.
      const fa = prog(t, 0.34, 0.92);
      fall = 7.6 * (t < 0.92 ? 0.58 * (fa ** 3 - fa ** 4 / 2) : 0.29 + (t - 0.92));
      speed = smooth(fa);
      const sway: Vec2 = [0.11 * Math.sin((t - 0.6) * 3.3) * speed, 0.05 * Math.sin(t * 4.3 + 1) * speed];
      coinPos = [home[0] + sway[0], home[1] + bob * (1 - speed) + sway[1], 0];

      // One forward tumble that ends flat to camera, just in time to fill it.
      const e1 = seg(t, 0.6, 1.44, E.inOutCubic);
      const arc = Math.sin(Math.PI * prog(t, 0.62, 1.4));
      coinRot = m4.chain(m4.rotZ(lerp(15, 0, e1) * DEG), m4.rotY(0.2 * Math.sin((t - 0.6) * 7) * Math.sin(Math.PI * e1)), m4.rotX(lerp(-51, -360, e1) * DEG));
      cheat = 1 - prog(t, 0.6, 0.95);
      flat = prog(t, 1.46, 1.54);

      // Dolly-zoom out of the long lens into a wide one as the drop begins.
      const u = seg(t, 0.5, 1.04, E.inOutCubic);
      if (u > 0) {
        const az = 15 * DEG * arc, dist = lerp(4.2, 3.8, prog(t, 0.9, 1.5));
        const tg: Vec3 = [home[0] + sway[0] * 0.55, home[1] + sway[1] * 0.55, 0];
        const jitter = speed * 0.012;
        const camB: Cam = {
          eye: [tg[0] + Math.sin(az) * dist + noise1(t * 19, 1) * jitter, tg[1] + 0.12 + noise1(t * 23, 2) * jitter, Math.cos(az) * dist],
          target: tg, roll: -3.5 * DEG * arc, fov: 32 * DEG, zoom: 1, shift: [0, 0],
        };
        cam = lerpCam(cam, camB, u);
      }

      // …and the coin comes straight at the lens until its face is the frame.
      const er = prog(t, 1.28, T.gold);
      if (er > 0) {
        const c0 = buildCam(cam, W, H);
        const rel = v3.sub(coinPos, c0.eye);
        const d0 = v3.dot(rel, c0.fwd), x0 = v3.dot(rel, c0.right), y0 = v3.dot(rel, c0.up);
        const d = d0 * Math.pow(0.14 / d0, E.inCubic(er));
        const ea = smooth(prog(t, 1.28, 1.5));
        // Aim at a crown-free patch of gold so the cut to the poster is seamless.
        const aim: Vec2 = land ? [0, -0.6] : [0.68, 0];
        const ox = lerp((x0 * d) / d0, -aim[0] * COIN_R, ea), oy = lerp((y0 * d) / d0, -aim[1] * COIN_R, ea);
        coinPos = v3.add(c0.eye, v3.add(v3.add(v3.scale(c0.right, ox), v3.scale(c0.up, oy)), v3.scale(c0.fwd, d)));
      }
      const cm = buildCam(cam, W, H);
      const pc = project(cm, [0, 0, 0]);
      frameC = [pc.x, pc.y]; frameHalf = pc.scale;
      maskC = frameC; maskHalf = frameHalf;
      f.cardA = t < 0.66 ? 1 : 0;
      f.arc = 1 - prog(t, 0, 0.25);
    } else {
      // Return: the coin (as the full stop) grows its own sky around it.
      const dot = L.s7.dot;
      const kd = dot.r / (COIN_R * S * 0.5);
      const k = kd * Math.pow(L.k0 / kd, spring(te, 2.3, 0.6));
      const ec = seg(te, 0, 0.5, E.inOutCubic);
      const o0 = coinOff(L.k0), o = coinOff(k);
      const cs: Vec2 = [lerp(dot.x, L.iconC[0] + o0[0], ec), lerp(dot.y, L.iconC[1] + o0[1], ec)];
      frameC = [cs[0] - o[0], cs[1] - o[1]]; frameHalf = k * S * 0.5;
      cam = iconCam(frameC, k);
      const em = E.outCubic(prog(te, 0, 0.4));
      maskC = [lerp(cs[0], frameC[0], em), lerp(cs[1], frameC[1], em)];
      maskHalf = frameHalf * em;
      const ep = spring(te - 0.03, 2.2, 0.55);
      coinRot = m4.mul(m4.rotZ(15 * DEG * ep), m4.rotX(-51 * DEG * ep));
      cheat = clamp(ep);
      coinPos = [home[0], home[1] + bob * prog(te, 0.5, 1.2), home[2]];
      f.cardA = 1;
      f.outerA = 1;
      if (te < 0.56) f.cardWipe = [cs[0], H - cs[1], E.outCubic(prog(te, 0.07, 0.54)) * Math.hypot(W, H) * 1.05];
      f.frontWipe = te < 0.56 ? [cs[0], H - cs[1], f.cardWipe[2], 1] : [0, 0, 0, 0];
      f.arc = prog(te, 1.3, 2.2);
    }

    f.cam = buildCam(cam, W, H);
    f.world = 1;
    f.sky = 1;
    f.skyRich = end ? 0 : prog(t, 0.5, 1.1) * 0.9;
    f.skyFrame = [frameC[0], H - frameC[1], frameHalf];
    f.mask = [maskC[0], H - maskC[1], maskHalf];
    f.rim = [0.12, 0.2, 0.3];
    f.coins.push({ m: m4.chain(m4.translate(coinPos[0], coinPos[1], coinPos[2]), coinRot, m4.scale(COIN_R)), flat, glow: 0, cheat });

    // Clouds and speed lines — first exactly as on the icon, then streaming past.
    ICON_CLOUDS.forEach((c, i) => {
      const drift = 0.012 * Math.sin((TAU * t) / 5 + i * 2.1);
      const slide = end ? c.from * (1 - E.outExpo(prog(te, 0.2 + i * 0.07, 0.95 + i * 0.07))) : 0;
      f.sprites.push({ x: c.x + drift + slide, y: c.y + fall, z: c.z, w: c.w, h: c.w * 0.46, kind: 0, r: 1, g: 1, b: 1, a: 0.97, soft: 0, variant: c.variant });
    });
    if (fall > 0) {
      for (const c of this.fallClouds) {
        const y = c.y + fall;
        if (y < -8 || y > 8) continue;
        f.sprites.push({ x: c.x, y, z: c.z, w: c.w, h: c.w * 0.46, kind: 0, r: 1, g: 1, b: 1, a: c.a, soft: c.soft, variant: c.variant });
      }
    }
    ICON_LINES.forEach((l, i) => {
      let len = 0.4 * (1 + 0.05 * Math.sin((TAU * t) / 2.5 + i * 1.7));
      let y = l.y + 0.01 * Math.sin((TAU * t) / 3 + i);
      if (end) {
        const g = E.outCubic(prog(te, 0.34 + i * 0.05, 0.82 + i * 0.05));
        y += (len * (1 - g)) / 2;
        len *= g;
      }
      if (len > 0.03) f.sprites.push({ x: l.x, y: y + fall * 1.9, z: -0.04, w: 0.028, h: len, kind: 1, r: 0.32, g: 0.54, b: 0.71, a: 0.9, soft: 0, variant: 0 });
    });
    if (speed > 0.01) {
      for (const l of this.streaks) {
        const y = ((l.y + fall * l.sp + 60) % 12) - 6 + home[1];
        f.sprites.push({ x: l.x, y, z: l.z, w: l.w, h: l.len * (0.5 + speed), kind: 1, r: 0.32, g: 0.54, b: 0.71, a: 0.78 * speed * l.a, soft: 0, variant: 0 });
      }
    }
  }

  // ── The dark stage: toss, crown chart, phones, palettes, privacy ──────────
  private darkWorld(t: number, f: Frame) {
    const { W, H } = this, S = Math.min(W, H), land = W >= H, L = this.lay!;
    const titleCam: Cam = { eye: [0, 1.6, 8], target: [0, 1.6, 0], roll: 0, fov: 30 * DEG, zoom: 1, shift: [0, 0] };
    const tm = buildCam(titleCam, W, H);
    /** A coin of radius `rpx` at a screen position, on the title camera's z = 0 plane. */
    const place = (px: number, py: number, rpx: number) => ({ pos: unproject(tm, px, py, 8), r: rpx / ((tm.fx * W * 0.5) / 8) });

    f.sky = 0;
    f.rim = [0.1, 0.55, 0.32];
    f.aurora = t < T.ink ? 0 : lerp(0.3, 1, prog(t, 4.8, 5.7)) * (1 - 0.8 * prog(t, T.rush0, T.rush1)) * (1 - prog(t, T.stop + 0.1, T.lock));
    if (t < T.ink) { f.cam = tm; return; }     // the gold poster covers everything
    f.world = 2;

    // Camera ---------------------------------------------------------------
    const vx = (camX(t + 0.012) - camX(t - 0.012)) / 0.024;
    const vn = clamp(vx / 30, -1, 1);
    const cx = camX(t);
    let cam = titleCam;
    if (t >= T.coin && t < T.stop) {
      const az = lerp(6, -34, seg(t, 5.15, 6.5, E.inOutQuad)) * DEG;
      const el = lerp(31, 24, seg(t, 5.2, 6.4)) * DEG;
      const dist = lerp(7, 6.2, seg(t, 5.2, 6.4));
      const stage: Cam = {
        eye: [Math.sin(az) * Math.cos(el) * dist, 0.5 + Math.sin(el) * dist, Math.cos(az) * Math.cos(el) * dist],
        target: [0, 0.5, 0], roll: 0, fov: 32 * DEG, zoom: 1, shift: land ? [0.42, -0.14] : [0, -0.24],
      };
      cam = lerpCam(titleCam, stage, seg(t, T.coin, 5.5));
      const push = 0.5 * seg(t, T.pal[4], T.rush0, E.inOutQuad);
      // A slow push-in while each screen is being read; it resets inside the whip.
      const read = T.ph.reduce((a, p) => a + prog(t, p, p + DWELL) * (1 - prog(t, p + DWELL - 0.02, p + DWELL + 0.3)), 0);
      const truck: Cam = {
        eye: [cx - 0.7 + vn * 0.8, 1.74, 7 - push - 0.45 * read], target: [cx + 0.5 + vn * 1.2, 1.64, -0.3],
        roll: -vn * 2.5 * DEG, fov: 31 * DEG, zoom: land ? 1 : 1.2, shift: land ? [0.46, 0] : [0, -0.27],
      };
      const ut = seg(t, 6.3, 6.98);
      if (ut > 0) cam = lerpCam(cam, truck, ut);
      const ur = prog(t, T.rush0, T.rush1);
      if (ur > 0) {
        const rush: Cam = { eye: [HERO_X, 1.85, 0.62], target: [HERO_X, 1.85, 0], roll: 0, fov: 31 * DEG, zoom: 1, shift: [0, 0] };
        cam = lerpCam(cam, rush, E.inCubic(ur));
      }
    }
    f.cam = buildCam(cam, W, H);
    const cm = f.cam;

    // The coin -------------------------------------------------------------
    // The coin rolls just ahead of each phone: it has touched it by the time we arrive.
    const lane = 1.3;
    const rollX = (tt: number) => camX(tt - 0.035) + 0.5 + 0.64;
    let cp: Vec3, cr: number, rot: Mat4;
    if (t < T.coin) {
      // Tossed out of the burst, two flips, lands as the full stop of the line.
      const u = prog(t, T.ink, 3.78);
      const a = L.s2.dotOut, b = L.s3.dot;
      const sx = lerp(a.x, b.x, u);
      const sy = lerp(a.y, b.y, u) - S * 0.4 * 4 * u * (1 - u) - S * 0.04 * hop(t, 3.78, 0.2) - S * 0.012 * hop(t, 3.98, 0.13);
      const pl = place(sx, sy, lerp(a.r, b.r, u) * (0.4 + 0.6 * E.outBack(prog(t, T.ink, T.ink + 0.14))));
      cp = pl.pos; cr = pl.r;
      rot = m4.mul(m4.rotY(0.6 * Math.sin(Math.PI * u)), m4.rotX(TAU * 2 * (1 - E.outCubic(u))));
    } else if (t < T.land) {
      // The dot swells into the coin and tips over onto the stage.
      const p0 = place(L.s3.dot.x, L.s3.dot.y, L.s3.dot.r);
      const e = prog(t, T.coin, T.land), k = E.inOutCubic(e);
      cp = [lerp(p0.pos[0], 0, k), lerp(p0.pos[1], COIN_HZ, E.inCubic(e)) + 0.9 * Math.sin(Math.PI * e) * (1 - e), lerp(p0.pos[2], 0, k)];
      cr = p0.r * Math.pow(1 / p0.r, E.outCubic(e));
      rot = m4.mul(m4.rotX(-90 * DEG * k), m4.rotZ(TAU * 0.75 * (1 - E.outCubic(e))));
    } else if (t < T.stand0) {
      // Flat on the floor, ringing down like a dropped coin.
      const dt = t - T.land;
      const tilt = 11 * DEG * Math.exp(-dt * 6.5), psi = 24 * dt;
      cp = [0, COIN_HZ + Math.sin(tilt), 0]; cr = 1;
      rot = m4.chain(m4.rotY(psi), m4.rotX(tilt), m4.rotY(-psi), m4.rotX(-90 * DEG));
    } else if (t < T.stand1) {
      // Flips up onto its edge, hopping over the chart into the front lane.
      const e = prog(t, T.stand0, T.stand1), k = E.inOutCubic(e);
      const xr = rollX(T.stand1);
      cr = lerp(1, ROLL_R, k);
      cp = [lerp(0, xr, E.inOutQuad(e)), lerp(COIN_HZ, ROLL_R, k) + 1.25 * 4 * e * (1 - e), lerp(0, lane, E.inOutQuad(e))];
      rot = m4.mul(m4.rotZ((-xr / ROLL_R) * k), m4.rotX(-90 * DEG * (1 - k)));
    } else if (t < T.stop) {
      // Rolls — without slipping — alongside the trucking camera.
      const x = rollX(t);
      let hy = 0;
      for (const tp of T.ph) hy += 0.42 * hop(t, tp - 0.06, 0.3);
      for (const tp of T.pal) hy += 0.5 * hop(t, tp - 0.05, 0.24);
      cp = [x, ROLL_R + hy, lane]; cr = ROLL_R;
      rot = m4.rotZ(-x / ROLL_R);
    } else {
      // One last toss: it lands as the full stop of "Full stop".
      const u = prog(t, T.stop + 0.04, T.stop + 0.32);
      const b = L.s7.dot;
      const y0 = H + b.r * 3;
      const sy = lerp(y0, b.y, u) - ((y0 - b.y) * 0.5 + S * 0.12) * 4 * u * (1 - u) - S * 0.03 * hop(t, T.stop + 0.32, 0.16);
      const pl = place(lerp(b.x - S * 0.2, b.x, u), sy, b.r);
      cp = pl.pos; cr = pl.r;
      rot = m4.mul(m4.rotY(0.5 * Math.sin(Math.PI * u)), m4.rotX(TAU * 2 * (1 - E.outCubic(u))));
    }
    f.coins.push({ m: m4.chain(m4.translate(cp[0], cp[1], cp[2]), rot, m4.scale(cr)), flat: 0, glow: 0, cheat: 0 });

    // Ink ------------------------------------------------------------------
    if (t < 5.5) {
      const out = 1 - prog(t, 4.72, 5.45);
      f.fluidAmb = lerp(0.95, 0.5, prog(t, 3.15, 3.9)) * out;
      f.fluidInside = 1.5 * (1 - prog(t, T.s3out + 0.1, 5.02));
      f.fluidCore = 0.85 * (1 - prog(t, T.s3out + 0.1, 5.02));
      f.fluidMask = t >= 3.31 && t < 5.06 ? 1 : 0;
    }
    if (t >= T.stop) return;

    // Stage ----------------------------------------------------------------
    f.floor = seg(t, T.coin, 5.5) * (1 - prog(t, T.rush0, T.rush1));
    f.floorFocus = [t < 6.3 ? 0 : cm.target[0], 0, 0];
    const rings: [number, number, number, number][] = [[T.land, 0, 0, 1.4]];
    T.ph.forEach((tp) => rings.push([tp + 0.24, rollX(tp + 0.24), lane, 0.55]));
    T.pal.forEach((tp) => rings.push([tp + 0.19, rollX(tp + 0.19), lane, 0.6]));
    for (const [rt, rx, rz, rs] of rings) if (t >= rt) f.ring = [rx, rz, 0.5 + (t - rt) * 7, rs * Math.exp(-(t - rt) * 2.6)];

    // Chart bars: the coin's 36 ridges, risen into a crown, then unrolled.
    const ib = this.iBar;
    if (t >= T.land) {
      const u = seg(t, T.unroll0, T.unroll1, E.inOutCubic);
      const kap = (1 - u) / RHO;
      for (let i = 0; i < 36; i++) {
        const th = ((i + 0.5) / 36) * TAU - Math.PI;
        const s = RHO * th;
        const x = kap > 1e-4 ? Math.sin(kap * s) / kap : s;
        const z = kap > 1e-4 ? RHO - (1 - Math.cos(kap * s)) / kap : RHO;
        const t0 = T.land + 0.02 + (Math.abs(th) / Math.PI) * 0.26;
        const g = E.outBack(prog(t, t0, t0 + 0.42), 2.2);
        if (g <= 0) continue;
        const h = BAR_H[i] * g * (1 + 0.05 * Math.sin(t * 5 + i));
        const m = m4.chain(m4.translate(x, 0, z), m4.rotY(kap * s), m4.scale(0.078, h, 0.11));
        const c = BAR_RED[i] ? COL.red : COL.green;
        ib.data.set(m, f.nBars * 20);
        ib.data.set([c[0], c[1], c[2], 1.5], f.nBars * 20 + 16);
        f.nBars++;
      }
    }

    // Phones: each one wakes as the coin rolls up to it.
    if (t >= 6.6) {
      const sp = 3.3 / PHONE_H;
      for (let i = 0; i < 3; i++) {
        const ta = T.ph[i] - 0.07;
        const yaw = ([-13, 9, -8][i] + 3 * Math.sin(t * 0.9 + i)) * DEG;
        f.phones.push({
          m: m4.chain(m4.translate(PHONE_X[i], 0.1 + 1.65 - 0.28 * (1 - spring(t - ta, 2.6, 0.5)), -0.5), m4.rotY(yaw), m4.rotX(-3 * DEG), m4.scale(sp)),
          tex: this.tex[SCREENS[i]], on: E.outCubic(prog(t, ta, ta + 0.22)),
          gain: 1 + 0.5 * pulse(t, ta + 0.05, 7), sweep: lerp(-0.75, 0.95, prog(t, ta, ta + 0.7)),
        });
      }
      // The hero phone flips once per beat; each half-turn lands on a new palette.
      const order = ["home-dark", ...PALETTES.map((p) => p.screen), "home-dark"];
      let ti = 0, flip = 0;
      T.pal.forEach((tp, j) => {
        if (t < tp) return;
        const a = E.outCubic(prog(t, tp, tp + 0.23)) * Math.PI;
        flip = a < Math.PI / 2 ? a : a - Math.PI;
        ti = a < Math.PI / 2 ? j : j + 1;
      });
      const ta = T.pal[0] - 0.14;
      const absorb = pulse(t, T.suck + 0.3, 5) * prog(t, T.suck + 0.3, T.suck + 0.34);
      f.phones.push({
        m: m4.chain(m4.translate(HERO_X, 0.1 + 1.7 - 0.3 * (1 - spring(t - ta, 2.6, 0.5)), 0), m4.rotY(flip + 2 * DEG * Math.sin(t * 1.1)), m4.rotX(-2 * DEG), m4.scale(HERO_H / PHONE_H)),
        tex: this.tex[order[ti]], on: E.outCubic(prog(t, ta, ta + 0.2)) * (1 - prog(t, T.rush0 + 0.08, T.rush1 - 0.02)),
        gain: 1 + 0.4 * pulse(t, ta + 0.05, 7) + 0.6 * absorb, sweep: lerp(-0.75, 0.95, prog(t, ta, ta + 0.7)),
      });
    }

    // Palette floods: each flip wipes the stage into the palette's colour.
    const pc = project(cm, [HERO_X, 1.8, 0]);
    f.floodC = [pc.x, H - pc.y];
    let last = -1;
    T.pal.forEach((tp, j) => { if (t >= tp + 0.05) last = j; });
    if (last >= 0) {
      const col = last < 4 ? hex(PALETTES[last].shades[0]) : COL.dark;
      const old = last > 0 ? hex(PALETTES[last - 1].shades[0]) : null;
      const w = E.outCubic(prog(t, T.pal[last] + 0.05, T.pal[last] + 0.38));
      if (old) f.floodBase = [old[0], old[1], old[2], 1];
      f.floodWipe = [col[0], col[1], col[2], 2.7 * w];
      if (last === 4 && w >= 1) {
        f.floodBase = [col[0], col[1], col[2], 1 - prog(t, T.pal[4] + 0.38, T.pal[4] + 0.75)];
        f.floodWipe = [0, 0, 0, 0];
      }
      f.flooded = last < 4 ? prog(t, T.pal[0] + 0.05, T.pal[0] + 0.25) : 1 - w;
    }

    // Particles ------------------------------------------------------------
    const ip = this.iPart;
    const add = (p: Vec3, size: number, c: Vec3, a: number, sx = 0, sy = 0) => {
      if (f.nParts >= ip.capacity || a <= 0.003 || size <= 0) return;
      ip.data.set([p[0], p[1], p[2], size, c[0], c[1], c[2], a, sx, sy], f.nParts * 10);
      f.nParts++;
    };
    // A soft pool of screen light behind every phone that is awake.
    f.phones.forEach((ph, i) => {
      const x = i < 3 ? PHONE_X[i] : HERO_X;
      add([x, 1.75, i < 3 ? -1.3 : -0.8], 2.7, COL.green, 0.2 * ph.on * (1 - f.flooded));
    });
    // Sparks when the coin lands.
    if (t >= T.land && t < T.land + 0.9) {
      const dt = t - T.land;
      for (let i = 0; i < 56; i++) {
        const a = hash(i, 21) * TAU, sp = 2.2 + 3.6 * hash(i, 22);
        const d = (sp * (1 - Math.exp(-dt * 4.5))) / 4.5 + 1.05;
        const y = 0.06 + (0.9 + hash(i, 23) * 1.6) * dt - 4.2 * dt * dt;
        if (y < 0) continue;
        add([Math.sin(a) * d, y, Math.cos(a) * d], 0.03 * (1 - dt / 0.9), COL.gold, 2.4 * (1 - dt / 0.9));
      }
    }
    // Confetti in the palette's own five shades on every flip.
    T.pal.slice(0, 4).forEach((tp, j) => {
      const dt = t - (tp + 0.1);
      if (dt < 0 || dt > 0.75) return;
      for (let i = 0; i < 70; i++) {
        const a = hash(i, 31 + j) * TAU, el = (hash(i, 37 + j) - 0.25) * 1.6, sp = 3 + 5 * hash(i, 41 + j);
        const d = (sp * (1 - Math.exp(-dt * 3.2))) / 3.2;
        const p: Vec3 = [HERO_X + Math.cos(a) * Math.cos(el) * d, 1.8 + Math.sin(el) * d - 2.2 * dt * dt, 0.3 + Math.sin(a) * Math.cos(el) * d * 0.7];
        add(p, 0.05 * (1 - dt / 0.75), hex(PALETTES[j].shades[i % 5]), 1.1 * (1 - dt / 0.75));
      }
    });
    // Privacy: a cloud of data orbits the phone — then all of it goes inside.
    if (t >= T.pal[4] - 0.05 && t < T.rush1) {
      const hs = HERO_H / PHONE_H;
      for (let i = 0; i < this.motes.length; i++) {
        const mo = this.motes[i];
        const born = prog(t, T.pal[4] + mo.delay * 0.3, T.pal[4] + mo.delay * 0.3 + 0.25);
        if (born <= 0) continue;
        const orbit = (tt: number): Vec3 => {
          const a = mo.a0 + mo.w * tt;
          return [HERO_X + Math.cos(a) * mo.rad, 1.8 + mo.y + 0.15 * Math.sin(tt * 2 + i), Math.sin(a) * mo.rad * 0.55 - 0.2];
        };
        const ts = T.suck + mo.delay * 0.3;
        const e = E.inCubic(prog(t, ts, ts + 0.3));
        if (e >= 1) continue;
        const tgt: Vec3 = [HERO_X + mo.tx * hs * 0.45, 1.8 + mo.ty * hs * 0.45, 0.03];
        const at = (tt: number) => v3.lerp(orbit(tt), tgt, E.inCubic(prog(tt, ts, ts + 0.3)));
        const p = at(t), q = at(t - 0.022);
        const vel = v3.sub(p, q);
        const clear = lerp(0.3, 1, smooth(prog(p[0], HERO_X - 5, HERO_X - 1.6)));
        const st = 0.35 + 0.65 * e;
        add(p, mo.size * (1 - e * 0.5), mo.gold ? COL.gold : COL.bright, (mo.gold ? 1.7 : 1.4) * born * clear, v3.dot(vel, cm.right) * st, v3.dot(vel, cm.up) * st);
      }
    }
  }

  // ==========================================================================
  // 2D: kinetic type. `back` sits behind the 3D (or is burnt into the poster /
  // used as the ink mask); `front` sits over everything.
  // ==========================================================================
  private draw2D(t: number, f: Frame) {
    const { W, H } = this, L = this.lay!;
    this.bctx.clearRect(0, 0, W, H);
    this.fctx.clearRect(0, 0, W, H);
    if (t >= T.gold - 0.05 && t < 3.31) {
      this.drawPoster(this.bctx, t);
      f.backMode = 2;
      f.posterA = prog(t, T.gold - 0.03, T.gold);
      f.posterShade = prog(t, T.gold, 2);
      f.iris = [L.s2.dotOut.x, H - L.s2.dotOut.y, t >= T.ink ? 0.001 + 2.25 * Math.pow(prog(t, T.ink, 3.33), 1.4) : 0];
    } else if (t >= 3.31 && t < 5.06) {
      this.drawInkMask(this.bctx, t);
      f.backMode = 3;
    } else if (t >= 5.45 && t < T.stop) {
      this.drawStageType(this.bctx, t);
      f.backMode = 1;
    }
    this.drawFront(this.fctx, t, f);
  }

  /** Shot 2 — black on gold, like the coin's own outline. */
  private drawPoster(ctx: Ctx, t: number) {
    const { W, H } = this, S = Math.min(W, H), L = this.lay!, s2 = L.s2;
    const cx = W / 2, cy = H * 0.5 - S * 0.024;
    const sc = 1 + 0.085 * (1 - E.outExpo(prog(t, 1.58, 2.25))) + 0.028 * prog(t, 2.2, T.ink);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(sc, sc);
    ctx.translate(-cx, -cy);
    s2.lines.forEach((l, i) => {
      drawLine(ctx, l.ln, l.x, l.b, s2.size, { color: CSS.ink, mask: true, fx: riseInOut(t, 1.6 + i * 0.3, Infinity, 0.02, 0.55, 1.15) });
    });
    // The full stop drops in like a coin and bounces twice.
    const t0 = 1.6 + (s2.lines.length - 1) * 0.3 + 0.28;
    const td = t - t0;
    if (td > 0) {
      const d = s2.dot;
      let dy = 0;
      if (td < 0.26) dy = -(d.y + d.r * 3) * (1 - (td / 0.26) ** 2);
      else if (td < 0.52) dy = -s2.size * 0.34 * hop(td, 0.26, 0.26);
      else if (td < 0.68) dy = -s2.size * 0.1 * hop(td, 0.52, 0.16);
      const squash = 1 - 0.3 * (pulse(td, 0.26, 22) + 0.5 * pulse(td, 0.52, 26));
      // Wind-up before it bursts.
      const s = 1 - 0.26 * smooth(prog(t, 2.78, 2.92)) + 0.9 * E.inCubic(prog(t, 2.92, T.ink));
      ctx.fillStyle = CSS.ink;
      ctx.beginPath();
      ctx.ellipse(d.x, d.y + dy + d.r * (1 - squash), d.r * s * (2 - squash), d.r * s * squash, 0, 0, TAU);
      ctx.fill();
    }
    label(ctx, this.copy.descA, s2.x + s2.size * 0.012, s2.lines[0].b - s2.size * 0.9, L.mono, this.mono, CSS.ink, { shown: prog(t, 1.74, 2.2), alpha: 0.82 });
    ctx.restore();

    // The coin's milled edge, unrolled into a strip that keeps turning.
    const sy = H - S * 0.122, sh = S * 0.05, th = Math.max(2, S * 0.0058);
    const pitch = S * 0.0285, tw = S * 0.0095;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, sy - th, W * E.outExpo(prog(t, 1.62, 2.3)), sh + th * 2);
    ctx.clip();
    ctx.fillStyle = CSS.ink;
    ctx.fillRect(0, sy - th / 2, W, th);
    ctx.fillRect(0, sy + sh - th / 2, W, th);
    ctx.strokeStyle = CSS.ink;
    ctx.lineCap = "round";
    ctx.lineWidth = tw;
    ctx.beginPath();
    for (let x = -((t * S * 0.2) % pitch); x < W + pitch; x += pitch) {
      ctx.moveTo(x, sy + th + tw * 0.75);
      ctx.lineTo(x, sy + sh - th - tw * 0.75);
    }
    ctx.stroke();
    ctx.restore();
  }

  /** Shot 3 — the headline as a window onto the ink. */
  private drawInkMask(ctx: Ctx, t: number) {
    const { W, H } = this, s3 = this.lay!.s3;
    const sc = 1 + 0.03 * prog(t, 3.3, 5);
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(sc, sc);
    ctx.translate(-W / 2, -H / 2);
    s3.lines.forEach((l, i) => {
      drawLine(ctx, l.ln, l.x, l.b, s3.size, { color: "#fff", fx: punchInOut(t, 3.33 + i * 0.14, T.s3out + i * 0.04, 0.032, 0.46) });
    });
    ctx.restore();
  }

  /** Shots 4–7 — stacked headlines in one fixed zone, behind the product. */
  private drawStageType(ctx: Ctx, t: number) {
    const { W, H } = this, S = Math.min(W, H), land = W >= H, L = this.lay!, c = this.copy;
    const x = W * (land ? 0.055 : 0.065);
    const zoneW = W * (land ? 0.47 : 0.87);
    const zoneH = land ? H * 0.52 : H * 0.165;
    const cap = S * (land ? 0.3 : 0.22);
    const sub = Math.max(S * 0.027, 13 * this.scale);
    const head = (s: string) => layout(ctx, s, 700, SANS, -0.045);
    const sizeOf = (ls: Line[]) => Math.min(zoneW / Math.max(...ls.map((l) => l.width)), cap, zoneH / (ls.length * 0.94));

    /**
     * A phrase set as big as the zone allows — on one line or stacked on two,
     * whichever is larger. Rises in behind a mask, leaves upwards.
     */
    const block = (text: string | string[], tin: number, tout: number, o: { fast?: boolean; accent?: boolean; gap?: number } = {}) => {
      if (t < tin - 0.02 || t > tout + 0.5) return null;
      let lines: Line[];
      if (Array.isArray(text)) lines = text.map(head);
      else {
        const words = text.split(" ");
        const mid = Math.ceil(words.length / 2);
        const one = [head(text)];
        const two = words.length > 1 ? [head(words.slice(0, mid).join(" ")), head(words.slice(mid).join(" "))] : one;
        lines = sizeOf(two) > sizeOf(one) ? two : one;
      }
      const size = sizeOf(lines);
      const bh = ((lines.length - 1) * 0.94 + 0.72) * size;
      const top = land ? H * 0.5 - bh / 2 - size * 0.04 : H * 0.092;
      lines.forEach((ln, i) => {
        drawLine(ctx, ln, x, top + (0.72 + i * 0.94) * size, size, {
          color: o.accent && i === lines.length - 1 ? CSS.bright : CSS.white, mask: true,
          fx: riseInOut(t, tin + i * (o.gap ?? (o.fast ? 0.025 : 0.09)), tout + i * 0.03, o.fast ? 0.008 : 0.016, o.fast ? 0.26 : 0.5),
        });
      });
      return { size, top, bottom: top + bh };
    };
    type At = ReturnType<typeof block>;
    const eyebrow = (text: string, at: At, tin: number, tout: number, color: string) => {
      if (!at) return;
      label(ctx, text, x + at.size * 0.012, at.top - L.mono * 1.1, L.mono, this.mono, color, { shown: prog(t, tin, tin + 0.3), alpha: 0.9 * (1 - prog(t, tout, tout + 0.12)) });
    };
    const caption = (text: string, at: At, tin: number, tout: number) => {
      if (!at) return;
      const ln = layout(ctx, text, 500, SANS, -0.012, 40);
      const a = prog(t, tin, tin + 0.22) * (1 - prog(t, tout, tout + 0.12));
      drawLine(ctx, ln, x + at.size * 0.012, at.bottom + sub * 1.75 + (1 - E.outCubic(prog(t, tin, tin + 0.3))) * sub * 0.6, sub, { color: CSS.mutedDark, alpha: a });
    };

    // "The numbers / that matter."
    eyebrow(`04 — ${c.numbersEyebrow}`, block(c.numbers, 5.56, 6.3, { accent: true }), 5.5, 6.3, CSS.bright);

    // Wallets · Budgets · Projections.
    const fe = [...T.ph, T.pal[0] - 0.08];
    c.feats.forEach((ft, i) => {
      const tin = fe[i] - 0.13, tout = fe[i + 1] - 0.24;
      caption(ft.caption, block(ft.word, tin, tout), tin + 0.16, tout);
    });

    // Energy · Calm · Nature · Night — with the family's five shades.
    c.palettes.forEach((name, j) => {
      const tin = T.pal[j] + 0.03, tout = T.pal[j + 1] - 0.05;
      const at = block(name, tin, tout, { fast: true });
      if (!at || t < tin || t > tout + 0.1) return;
      eyebrow(c.paletteCaption, at, j === 0 ? tin : -1, j === 3 ? tout : Infinity, "#ffffff");
      const r = Math.max(S * 0.017, 7 * this.scale);
      PALETTES[j].shades.forEach((hx, k) => {
        const sc = E.outBack(prog(t, tin + 0.04 + k * 0.018, tin + 0.2 + k * 0.018), 2.4) * (1 - prog(t, tout, tout + 0.08));
        if (sc <= 0) return;
        ctx.beginPath();
        ctx.arc(x + at.size * 0.012 + r + k * r * 2.7, at.bottom + r * 2.5, r * sc, 0, TAU);
        ctx.fillStyle = hx;
        ctx.fill();
        ctx.lineWidth = Math.max(1.5, r * 0.16);
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.stroke();
      });
    });

    // "Your data." — then, as everything is pulled into the phone — "On your phone."
    block([c.privacy[0], c.privacy[1]], T.pal[4] + 0.03, T.rush0 + 0.02, { accent: true, gap: T.suck - T.pal[4] - 0.05 });
  }

  private drawFront(ctx: Ctx, t: number, f: Frame) {
    const { W, H } = this, S = Math.min(W, H), L = this.lay!, c = this.copy;

    // Running slate, in the roadmap's mono voice.
    const hud = prog(t, 0.36, 0.62) * (1 - prog(t, T.lock - 0.2, T.lock - 0.04)) * 0.62;
    if (hud > 0.003) {
      const dark = t >= T.ink + 0.16;
      const col = dark ? "#ffffff" : CSS.ink;
      const y0 = L.m + L.mono * 0.8, y1 = H - L.m;
      let si = 0;
      SHOTS.forEach((s, i) => { if (t >= s) si = i; });
      const cs = Math.floor((t % 1) * 100);
      const pad = (n: number) => String(n).padStart(2, "0");
      const r = L.mono * 0.42;
      ctx.globalAlpha = hud;
      ctx.beginPath();
      ctx.arc(L.m + r, y0 - L.mono * 0.36, r, 0, TAU);
      ctx.fillStyle = dark ? CSS.gold : CSS.ink;
      ctx.fill();
      ctx.globalAlpha = 1;
      label(ctx, "MIDA", L.m + r * 3.1, y0, L.mono, this.mono, col, { alpha: hud });
      label(ctx, "SHOWREEL — 2026", W - L.m, y0, L.mono, this.mono, col, { alpha: hud, align: "right" });
      label(ctx, `${pad(si + 1)} — ${c.shots[si]}`, L.m, y1, L.mono, this.mono, col, { alpha: hud, shown: prog(t, SHOTS[si], SHOTS[si] + 0.22) });
      label(ctx, `00:${pad(Math.floor(t))}:${pad(cs)}`, W - L.m, y1, L.mono, this.mono, col, { alpha: hud, align: "right" });
    }

    // Shot 3 — the three privacy promises, under the headline.
    if (t >= 3.8 && t < 4.82) {
      const last = L.s3.lines[L.s3.lines.length - 1];
      label(ctx, c.pills, W / 2, last.b + L.s3.size * 0.36 + L.mono, L.mono, this.mono, "#ffffff", {
        align: "center", shown: prog(t, 3.86, 4.3), alpha: 0.78 * (1 - prog(t, 4.6, 4.76)),
      });
    }

    // Shot 4 — call-outs pinned to the tallest bars, tracked through the 3D camera.
    if (t >= 5.7 && t < 6.34) {
      const tag = (i: number, text: string, color: string, tin: number, side: 1 | -1) => {
        const th = ((i + 0.5) / 36) * TAU - Math.PI;
        const p = project(f.cam, [RHO * Math.sin(th), BAR_H[i] + 0.07, RHO * Math.cos(th)]);
        const a = prog(t, tin, tin + 0.1) * (1 - prog(t, 6.22, 6.32));
        if (a <= 0) return;
        const k = L.mono, grow = E.outCubic(prog(t, tin, tin + 0.25));
        const ex = p.x + side * k * 1.5 * grow, ey = p.y - k * 1.5 * grow;
        ctx.globalAlpha = a;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = Math.max(1, S * 0.0016);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(ex, ey);
        ctx.lineTo(ex + side * k * 0.9 * grow, ey);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(p.x, p.y, k * 0.22, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
        label(ctx, text, ex + side * k * 1.4, ey + k * 0.36, k, this.mono, color, { alpha: a, shown: prog(t, tin + 0.05, tin + 0.2), align: side > 0 ? "left" : "right" });
      };
      tag(20, c.flows[0], CSS.bright, 5.74, -1);
      tag(12, c.flows[1], "#ff7a70", 5.82, 1);
    }

    // Shot 7 — "Full stop".
    if (t >= T.stop && t < T.lock + 0.56) {
      const s7 = L.s7;
      drawLine(ctx, s7.line.ln, s7.line.x, s7.line.b, s7.size, { color: CSS.white, mask: true, fx: riseInOut(t, T.stop + 0.02, Infinity, 0.024, 0.4) });
    }

    // Lock-up: wordmark under the icon at both ends, so the film loops.
    const k = L.lock;
    const open = t < 1;
    const closing = t >= T.lock + 0.4;
    if (open || closing) {
      const word = layout(ctx, "Mida", 700, SANS, -0.035);
      drawLine(ctx, word, W / 2, k.wordB, k.wordSize, {
        color: this.theme.ink, align: "center", mask: true,
        fx: open ? riseInOut(t, -9, 0.04, 0.03, 0.5) : riseInOut(t, T.lock + 0.5, Infinity, 0.035, 0.6),
      });
    }
    if (closing) {
      const out = this.loop ? 1 - prog(t, DUR - 0.3, DUR - 0.04) : 1;
      // "Personal finance. Truly yours." — second half in brand green, as on the hero.
      const a = layout(ctx, c.tagline[0] + " ", 600, SANS, -0.012, 40), b = layout(ctx, c.tagline[1], 600, SANS, -0.012, 40);
      const x0 = W / 2 - ((a.width + b.width) * k.tagSize) / 2;
      const rise = (tin: number) => ({ alpha: prog(t, tin, tin + 0.3) * out, dy: (1 - E.outCubic(prog(t, tin, tin + 0.45))) * k.tagSize * 0.7 });
      const ra = rise(T.lock + 0.86), rb = rise(T.lock + 1.0);
      drawLine(ctx, a, x0, k.tagB + ra.dy, k.tagSize, { color: this.theme.ink, alpha: ra.alpha });
      drawLine(ctx, b, x0 + a.width * k.tagSize, k.tagB + rb.dy, k.tagSize, { color: this.theme.accent, alpha: rb.alpha });

      // The price gets struck, then replaced: "Free. Forever."
      const t0 = T.lock + 1.3;
      const swap = E.inOutCubic(prog(t, t0 + 0.62, t0 + 0.86));
      const size = L.mono * 1.05;
      const lp = layout(ctx, c.price, 500, this.mono, 0.09);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, k.priceB - size * 1.15, W, size * 1.6);
      ctx.clip();
      if (swap < 1) {
        const xl = lineLeft(lp, W / 2, size, "center");
        label(ctx, c.price, W / 2, k.priceB - swap * size * 1.6, size, this.mono, this.theme.muted, { align: "center", shown: prog(t, t0, t0 + 0.26), alpha: out });
        const sw = E.outCubic(prog(t, t0 + 0.3, t0 + 0.52));
        if (sw > 0) {
          ctx.globalAlpha = out;
          ctx.fillStyle = this.theme.muted;
          ctx.fillRect(xl - size * 0.2, k.priceB - size * 0.36 - swap * size * 1.6, (lp.width * size + size * 0.4) * sw, Math.max(1.5, size * 0.09));
          ctx.globalAlpha = 1;
        }
      }
      if (swap > 0) label(ctx, c.free, W / 2, k.priceB + (1 - swap) * size * 1.6, size, this.mono, this.theme.accent, { align: "center", alpha: out, weight: 500 });
      ctx.restore();

      label(ctx, c.store, W / 2, H - L.m, L.mono, this.mono, this.theme.muted, {
        align: "center", shown: prog(t, T.lock + 2.0, T.lock + 2.5), alpha: 0.9 * out,
      });
    }
  }

  // ── Lens, light and impact: the grade for frame t ─────────────────────────
  private grade(t: number, f: Frame) {
    const { W, H } = this, L = this.lay!;
    const sky = f.sky, lock = t >= T.lock ? prog(t, T.lock, T.lock + 0.5) : t < 0.6 ? 1 - prog(t, T.punch0, T.punch1) : 0;
    const gold = f.posterA * (1 - prog(t, T.ink, 3.3));
    const dark = 1 - Math.max(sky, gold);
    f.bloom = 0.26 * sky * (1 - lock) + 0.1 * lock + 0.08 * gold + dark * lerp(1, 0.5, f.flooded);
    f.vig = 0.14 * sky * (1 - lock) + 0.03 * gold + dark * lerp(0.46, 0.16, f.flooded);
    f.grain = lerp(0.04, 0.022, lock);

    // Impacts: a chromatic kick and a shake, both decaying fast.
    const hits: [number, number][] = [[T.gold, 0.7], [T.ink, 1], [T.land, 0.9], ...T.ph.map((p): [number, number] => [p, 0.3]), ...T.pal.map((p): [number, number] => [p + 0.1, 0.16]), [T.stop, 0.5], [T.lock, 0.4]];
    let kick = 0, shake = 0;
    for (const [ht, hs] of hits) { kick += hs * pulse(t, ht, 9); shake += hs * pulse(t, ht, 12); }
    f.ca = 0.0012 + 0.009 * kick + 0.004 * prog(t, 1.3, T.gold) * (t < T.gold ? 1 : 0);
    f.lens = 0.02 + 0.05 * kick;
    f.shake = [noise1(t * 43, 5) * shake * 0.006, noise1(t * 47, 6) * shake * 0.006];
    f.flash = 0.1 * pulse(t, T.ink, 16) + 0.05 * pulse(t, T.land, 18);

    // Zoom blur: the dive, the gold fill, the burst, the whips, the screen rush.
    const coin = f.coins.length ? project(f.cam, m4.point(f.coins[0].m, [0, 0, 0])) : { x: W / 2, y: H / 2 };
    const vx = (camX(t + 0.012) - camX(t - 0.012)) / 0.024;
    const whip = t > 6.9 && t < T.pal[0] + 0.1 ? clamp((Math.abs(vx) - 3) / 26) : 0;
    const dive = 0.2 * Math.sin(Math.PI * prog(t, T.punch0, T.punch1)) ** 1.5;
    const fill = 0.2 * E.inCubic(prog(t, 1.34, T.gold)) * (1 - prog(t, T.gold, T.gold + 0.12));
    const burst = 0.085 * pulse(t, T.ink, 7);
    const rush = 0.3 * E.inQuad(prog(t, T.rush0, T.rush1)) * (1 - prog(t, T.stop, T.stop + 0.25));
    if (whip > 0.02) f.zoom = [-2.4, 0.5, 0.045 * whip];
    else if (burst > 0.002) f.zoom = [L.s2.dotOut.x / W, 1 - L.s2.dotOut.y / H, burst];
    else if (rush > 0.002) f.zoom = [0.5, 0.5, rush];
    else f.zoom = [coin.x / W, 1 - coin.y / H, Math.max(dive, fill, 0.07 * pulse(t, T.lock, 8))];

    // Shockwaves.
    if (t >= T.ink && t < T.ink + 1.2) f.ripple = [L.s2.dotOut.x / W, 1 - L.s2.dotOut.y / H, (t - T.ink) * 1.9, 0.03 * Math.exp(-(t - T.ink) * 3.4)];
    else if (t >= T.land && t < T.land + 1) f.ripple = [coin.x / W, 1 - coin.y / H, (t - T.land) * 1.5, 0.018 * Math.exp(-(t - T.land) * 3.6)];

    // Through the phone's glass: black for two frames, then the last word.
    const fd = prog(t, T.rush1 - 0.07, T.rush1) * (1 - prog(t, T.stop, T.stop + 0.1));
    f.fade = [COL.dark[0], COL.dark[1], COL.dark[2], fd];
  }

  // ── Ink: scripted splats, stepped at a fixed 60 Hz ────────────────────────
  private stepFluid(t: number) {
    const fl = this.fluid;
    if (!fl.ok) return;
    if (t < T.ink || t > 5.5) {
      if (fl.steps) fl.reset();
      return;
    }
    const target = Math.floor((t - T.ink) * 60) + 1;
    if (target < fl.steps) fl.reset();
    for (let guard = 0; fl.steps < target && guard < 400; guard++) {
      this.inkEvents(fl.steps);
      fl.step(1 / 60, 30, 0.22, 0.72);
    }
  }

  private inkEvents(n: number) {
    const fl = this.fluid, L = this.lay!, { W, H } = this;
    const cx = L.s2.dotOut.x / W, cy = 1 - L.s2.dotOut.y / H, asp = W / H;
    const dyes: Vec3[] = [[0.31, 0.89, 0.6], [0.18, 0.82, 0.49], [0.05, 0.55, 0.3], [0.1, 0.75, 0.62], [0.96, 0.82, 0.24]];
    // The burst. A fluid can't expand evenly in every direction, so the full
    // stop fires a fan of sustained jets instead — the strongest one straight
    // across the frame — and each rolls up into its own pair of vortices.
    if (n < 16) {
      const base = Math.atan2(0.5 - cy, (0.5 - cx) * asp);
      const fan = [0, 0.62, -0.62, 1.3, -1.3, 2.35, -2.5, 3.1];
      const power = [3000, 2200, 2200, 1600, 1600, 1200, 1200, 1000];
      const k = 1 - n / 16;
      fan.forEach((off, i) => {
        const a = base + off + 0.12 * Math.sin(n * 0.9 + i);
        const c = dyes[i === 3 || i === 6 ? 4 : i % 4];
        const amp = 0.17 * k + (n < 2 ? 0.2 : 0);
        fl.splat(cx + (Math.cos(a) * 0.022) / asp, cy + Math.sin(a) * 0.022, Math.cos(a) * power[i] * k, Math.sin(a) * power[i] * k, [c[0] * amp, c[1] * amp, c[2] * amp], 0.0014);
      });
    }
    // Four slow stirrers keep it turning — and fed — under the headline.
    const tt = n / 60;
    const feed = 0.1 * Math.min(1, n / 20);
    for (let k = 0; k < 4; k++) {
      const ph = tt * (1.5 + 0.3 * k) + k * 1.7;
      const c = dyes[k % 4];
      fl.splat(0.5 + 0.36 * Math.cos(ph), 0.5 + 0.3 * Math.sin(ph * 1.31 + k), -Math.sin(ph) * 420, Math.cos(ph * 1.31 + k) * 420, [c[0] * feed, c[1] * feed, c[2] * feed], 0.0016);
    }
  }

  // ==========================================================================
  // Drawing
  // ==========================================================================
  render(t: number) {
    if (!this.ready || this.dead || !this.scene) return;
    const gl = this.gl, { W, H } = this, P = this.P;
    t = clamp(t, 0, DUR);
    const f = this.compose(t);
    this.stepFluid(t);

    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    if (f.backMode) {
      gl.bindTexture(gl.TEXTURE_2D, this.backTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.back);
    }
    gl.bindTexture(gl.TEXTURE_2D, this.frontTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.front);

    const tri = () => gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.ms ? this.ms.fbo : this.scene.fbo);
    gl.viewport(0, 0, W, H);
    gl.depthMask(true);
    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);
    gl.bindVertexArray(null);

    P.bg.use().f("uRes", W, H).f("uTime", t).f("uSky", f.sky).v("uSkyFrame", f.skyFrame).f("uSkyRich", f.skyRich).f("uAurora", f.aurora)
      .v("uFloodBase", f.floodBase).v("uFloodWipe", f.floodWipe).v("uFloodC", f.floodC);
    tri();

    gl.enable(gl.BLEND);
    const over = () => gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const add = () => gl.blendFunc(gl.ONE, gl.ONE);
    over();

    if (this.fluid.ok && (f.fluidAmb > 0.002 || f.fluidInside > 0.002)) {
      add();
      P.ink.use().t("uDye", 0, this.fluid.dyeTex).t("uMask", 1, this.backTex).f("uTexel", 1 / this.fluid.dyeW, 1 / this.fluid.dyeH)
        .f("uAmbient", f.fluidAmb).f("uInside", f.fluidInside).f("uUseMask", f.fluidMask)
        .f("uCore", COL.bright[0] * f.fluidCore, COL.bright[1] * f.fluidCore, COL.bright[2] * f.fluidCore);
      tri();
      over();
    } else if (!this.fluid.ok && f.fluidMask > 0) {
      // No float targets: fall back to solid, glowing letters.
      this.layer(this.backTex, 1.5 * f.fluidCore * 2, [0, 0, 0, 0], COL.bright);
    }

    if (f.backMode === 1) this.layer(this.backTex, 1.12, [0, 0, 0, 0]);
    if (f.world) this.draw3D(f);

    gl.bindVertexArray(null);
    if (f.posterA > 0.001) {
      P.poster.use().t("uTex", 0, this.backTex).t("uDye", 1, this.fluid.dyeTex).f("uUseDye", this.fluid.ok ? 1 : 0).f("uRes", W, H).f("uTime", t)
        .v("uColor", COL.gold).f("uAlpha", f.posterA).f("uShade", f.posterShade).v("uIris", f.iris);
      tri();
    }
    if (f.cardA > 0.001) {
      P.card.use().v("uMask", f.mask).v("uCardCol", this.cardRgb).f("uShadow", this.cardDark ? 0.55 : 0.2).f("uCardA", f.cardA).v("uWipe", f.cardWipe)
        .f("uOuter", COL.dark[0], COL.dark[1], COL.dark[2], f.outerA).f("uArc", f.arc).f("uTime", t);
      tri();
    }
    this.layer(this.frontTex, 1, f.frontWipe);

    // Resolve MSAA → scene texture.
    if (this.ms) {
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.ms.fbo);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.scene.fbo);
      gl.blitFramebuffer(0, 0, W, H, 0, 0, W, H, gl.COLOR_BUFFER_BIT, gl.NEAREST);
    }

    // Bloom.
    gl.disable(gl.BLEND);
    let src: Target = this.scene;
    this.down.forEach((d, i) => {
      P.down.use().t("uTex", 0, src.tex).f("uHalf", 0.5 / src.w, 0.5 / src.h).f("uThreshold", i === 0 ? (this.hdr ? 1 : 0.82) : -1);
      gl.bindFramebuffer(gl.FRAMEBUFFER, d.fbo);
      gl.viewport(0, 0, d.w, d.h);
      tri();
      src = d;
    });
    let cur = this.down[this.down.length - 1];
    for (let i = this.up.length - 1; i >= 0; i--) {
      P.up.use().t("uTex", 0, cur.tex).t("uBase", 1, this.down[i].tex).f("uHalf", 0.5 / cur.w, 0.5 / cur.h);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.up[i].fbo);
      gl.viewport(0, 0, this.up[i].w, this.up[i].h);
      tri();
      cur = this.up[i];
    }

    // Lens.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, W, H);
    P.final.use().t("uScene", 0, this.scene.tex).t("uBloom", 1, cur.tex).f("uRes", W, H).f("uTime", t)
      .f("uBloomAmt", f.bloom * 0.3).f("uCA", f.ca).f("uLens", f.lens).f("uGrain", f.grain * this.grain).f("uVig", f.vig).f("uFlash", f.flash)
      .v("uFade", f.fade).v("uRipple", f.ripple).v("uZoom", f.zoom).v("uShake", f.shake);
    tri();
  }

  private layer(tex: WebGLTexture, gain: number, wipe: number[], tint?: Vec3) {
    const gl = this.gl;
    gl.bindVertexArray(null);
    this.P.layer.use().t("uTex", 0, tex).f("uGain", gain).f("uAlpha", 1).v("uWipe", wipe).v("uTint", tint ?? [1, 1, 1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  private draw3D(f: Frame) {
    const gl = this.gl, P = this.P, cam = f.cam;
    const over = () => gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Per-frame instance data.
    f.coins.forEach((c, i) => {
      this.iCoin.data.set(c.m, i * 20);
      this.iCoin.data.set([c.flat, c.glow, c.cheat, 0], i * 20 + 16);
    });
    this.iCoin.upload(f.coins.length);
    if (f.nBars) this.iBar.upload(f.nBars);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.depthMask(true);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    const solids = (vp: Mat4, mirror: number) => {
      if (f.nBars) {
        P.bar.use().m("uVP", vp).v("uLight", this.light).f("uMirror", mirror);
        gl.bindVertexArray(this.box.vao);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, this.box.count, f.nBars);
      }
      if (f.phones.length) {
        P.phone.use().m("uVP", vp).v("uCam", cam.eye).v("uLight", this.light).f("uMirror", mirror).f("uLod", 0);
        gl.bindVertexArray(this.phone.vao);
        for (const ph of f.phones) {
          P.phone.m("uModel", ph.m).t("uScreen", 0, ph.tex).f("uOn", ph.on).f("uGain", ph.gain).f("uSweep", ph.sweep);
          gl.drawElements(gl.TRIANGLES, this.phone.count, gl.UNSIGNED_SHORT, 0);
        }
      }
      if (f.coins.length) {
        P.coin.use().m("uVP", vp).v("uCam", cam.eye).v("uLight", this.light).v("uRim", f.rim).f("uMirror", mirror).f("uHalf", COIN_HZ).t("uCrown", 0, this.tex.crown);
        gl.bindVertexArray(this.coin.vao);
        // Outline: the same coin, slightly larger, back faces only.
        gl.cullFace(gl.FRONT);
        P.coin.f("uShell", 0.047);
        gl.drawElementsInstanced(gl.TRIANGLES, this.coin.count, gl.UNSIGNED_SHORT, 0, f.coins.length);
        gl.cullFace(gl.BACK);
        P.coin.f("uShell", 0);
        gl.drawElementsInstanced(gl.TRIANGLES, this.coin.count, gl.UNSIGNED_SHORT, 0, f.coins.length);
      }
    };

    if (f.world === 2 && f.floor > 0.01) {
      // Polished floor: draw the stage mirrored in y, fading with height…
      gl.frontFace(gl.CW);
      solids(m4.mul(cam.vp, m4.scale(1, -1, 1)), f.floor);
      gl.frontFace(gl.CCW);
      // …then the dot grid over the reflections.
      gl.depthMask(false);
      gl.disable(gl.CULL_FACE);
      gl.blendFunc(gl.ONE, gl.ONE);
      const tint: Vec3 = v3.lerp([0.16, 0.74, 0.44], [1, 1, 1], f.flooded);
      P.floor.use().m("uVP", cam.vp).v("uCenter", f.floorFocus).f("uExtent", 60).v("uFocus", f.floorFocus).f("uFade", f.floor * lerp(0.62, 0.5, f.flooded))
        .v("uTint", tint).v("uRing", f.ring).f("uRadius", 10).v("uEye", cam.eye);
      gl.bindVertexArray(null);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      over();
      gl.depthMask(true);
      gl.enable(gl.CULL_FACE);
    }
    solids(cam.vp, 0);

    // Sprites, back to front.
    gl.depthMask(false);
    gl.disable(gl.CULL_FACE);
    if (f.sprites.length) {
      const depth = (s: SpriteI) => (s.x - cam.eye[0]) * cam.fwd[0] + (s.y - cam.eye[1]) * cam.fwd[1] + (s.z - cam.eye[2]) * cam.fwd[2];
      const list = f.sprites.map((s) => ({ s, d: depth(s) })).filter((e) => e.d > 0.05).sort((a, b) => b.d - a.d).slice(0, this.iSprite.capacity);
      list.forEach(({ s }, i) => this.iSprite.data.set([s.x, s.y, s.z, s.w, s.h, 0, s.kind, s.r, s.g, s.b, s.a, s.soft, s.variant], i * 13));
      this.iSprite.upload(list.length);
      P.sprite.use().m("uVP", cam.vp);
      gl.bindVertexArray(this.quadS.vao);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, list.length);
    }
    if (f.nParts) {
      this.iPart.upload(f.nParts);
      gl.blendFunc(gl.ONE, gl.ONE);
      P.part.use().m("uV", cam.view).m("uP", cam.proj);
      gl.bindVertexArray(this.quadP.vao);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, f.nParts);
      over();
    }
    gl.depthMask(true);
    gl.disable(gl.DEPTH_TEST);
    gl.bindVertexArray(null);
  }
}
