// All GLSL for the reel. Colour maths stays in display (gamma) space on purpose:
// the brand hexes must land on screen exactly as authored, and everything
// brighter than 1.0 is treated as emissive energy for the bloom.

const HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
`;

const NOISE = `
float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++){ s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
`;

/** Fullscreen triangle; vUv is 0..1 across the visible area (y up). */
export const VS_FULL = `${HEAD}
out vec2 vUv;
void main(){
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

// ── Background: the icon's sky ⇄ the app's dark aurora, plus palette floods ──
export const FS_BG = `${HEAD}
in vec2 vUv; out vec4 o;
uniform vec2 uRes; uniform float uTime;
uniform float uSky; uniform vec3 uSkyFrame; uniform float uSkyRich;
uniform float uAurora;
uniform vec4 uFloodBase; uniform vec4 uFloodWipe; uniform vec2 uFloodC;
${NOISE}
vec3 skyGrad(float t){
  // Stops sampled from the app icon, bottom → top.
  vec3 c = mix(vec3(0.757), vec3(0.722, 0.769, 0.788), smoothstep(0.04, 0.22, t));
  c = mix(c, vec3(0.671, 0.788, 0.847), smoothstep(0.22, 0.41, t));
  c = mix(c, vec3(0.624, 0.804, 0.902), smoothstep(0.41, 0.61, t));
  c = mix(c, vec3(0.573, 0.824, 0.957), smoothstep(0.61, 0.80, t));
  c = mix(c, vec3(0.553, 0.831, 0.984), smoothstep(0.80, 0.93, t));
  return c;
}
void main(){
  float mn = min(uRes.x, uRes.y);
  vec2 px = gl_FragCoord.xy;
  vec2 p = (vUv - 0.5) * uRes / mn;

  // Dark world: near-black with slow brand-green aurora.
  vec3 dark = vec3(0.039, 0.039, 0.047);
  float t = uTime * 0.11;
  vec2 a1 = vec2(-0.62 + 0.14 * sin(t * 1.3), 0.34 + 0.08 * cos(t));
  vec2 a2 = vec2(0.66 + 0.10 * cos(t * 0.9), 0.20 + 0.10 * sin(t * 1.1));
  vec2 a3 = vec2(0.08 * sin(t * 0.7), -0.62);
  float n = fbm(p * 1.5 + t);
  vec3 bright = vec3(0.310, 0.890, 0.604), deep = vec3(0.039, 0.490, 0.263);
  vec3 au = bright * exp(-dot(p - a1, p - a1) / 0.34) * 0.17
          + mix(deep, bright, 0.45) * exp(-dot(p - a2, p - a2) / 0.30) * 0.19
          + deep * exp(-dot(p - a3, p - a3) / 0.55) * 0.26;
  dark += au * uAurora * (0.6 + 0.8 * n);

  // Sky world: the icon gradient, anchored to the icon frame so it scales with it.
  float v = (px.y - uSkyFrame.y) / max(uSkyFrame.z, 1.0);
  float tt = clamp(v * 0.5 + 0.5, 0.0, 1.0);
  vec3 sky = skyGrad(tt);
  vec3 rich = mix(vec3(0.640, 0.845, 0.970), vec3(0.400, 0.745, 0.985), smoothstep(0.0, 1.0, vUv.y));
  sky = mix(sky, rich, uSkyRich);

  vec3 col = mix(dark, sky, uSky);

  // Palette floods: a base colour plus a circle wiping the next one in.
  float shade = 1.05 - 0.20 * dot(p, p);
  col = mix(col, uFloodBase.rgb * shade, uFloodBase.a);
  float r = length(px - uFloodC) / mn;
  float m = (1.0 - smoothstep(uFloodWipe.a - 0.006, uFloodWipe.a + 0.006, r)) * step(0.0001, uFloodWipe.a);
  col = mix(col, uFloodWipe.rgb * shade, m);
  o = vec4(col, 1.0);
}`;

// ── Dot-grid floor (the app's dotted backdrop, laid down as a stage) ─────────
export const VS_FLOOR = `${HEAD}
uniform mat4 uVP; uniform vec3 uCenter; uniform float uExtent;
out vec3 vWorld;
void main(){
  vec2 q = vec2(float(gl_VertexID & 1), float((gl_VertexID >> 1) & 1)) * 2.0 - 1.0;
  vec3 w = vec3(uCenter.x + q.x * uExtent, 0.0, uCenter.z + q.y * uExtent);
  vWorld = w;
  gl_Position = uVP * vec4(w, 1.0);
}`;
export const FS_FLOOR = `${HEAD}
in vec3 vWorld; out vec4 o;
uniform vec3 uFocus; uniform float uFade; uniform vec3 uTint; uniform vec4 uRing; uniform float uRadius; uniform vec3 uEye;
void main(){
  vec2 g = vWorld.xz * 2.5;
  vec2 fw = fwidth(g);
  float aa = max(fw.x, fw.y) + 0.00001;
  float d = length(fract(g) - 0.5);
  float dotm = 1.0 - smoothstep(0.085 - aa, 0.085 + aa, d);
  dotm *= clamp(1.0 - aa * 2.4, 0.0, 1.0);          // dissolve before the grid aliases
  float dist = length(vWorld.xz - uFocus.xz);
  float fade = exp(-dist * dist / (uRadius * uRadius)) * smoothstep(1.2, 4.2, length(vWorld - uEye));
  float rr = length(vWorld.xz - uRing.xy);
  float rw = (rr - uRing.z) / 0.24;
  float ring = exp(-rw * rw) * uRing.w;
  vec3 col = uTint * (dotm * (0.55 + ring * 3.2) + ring * 0.05) * fade * uFade;
  o = vec4(col, 0.0);
}`;

// ── The coin: the brand mark rebuilt as a real cylinder, toon-shaded ─────────
export const VS_COIN = `${HEAD}
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aNrm;
layout(location=2) in vec2 aUv;
layout(location=3) in float aPart;
layout(location=4) in mat4 aModel;
layout(location=8) in vec4 aTint;
uniform mat4 uVP; uniform vec3 uCam; uniform vec3 uLight; uniform float uShell; uniform float uHalf;
out vec3 vWorld; out vec3 vNrm; out vec2 vUv; out float vPart; out vec4 vTint; out vec3 vViewL; out vec3 vLightL;
void main(){
  vec3 p = aPos;
  if (uShell > 0.0) { p.xy *= 1.0 + uShell; p.z *= 1.0 + uShell / uHalf; }
  vec4 w = aModel * vec4(p, 1.0);
  mat3 m = mat3(aModel);
  vWorld = w.xyz; vNrm = m * aNrm; vUv = aUv; vPart = aPart; vTint = aTint;
  vec3 vl = transpose(m) * (uCam - w.xyz);
  vec3 ll = transpose(m) * uLight;
  if (aPart > 0.5 && aPart < 1.5) { vl.x = -vl.x; ll.x = -ll.x; }
  vViewL = vl; vLightL = ll;
  gl_Position = uVP * w;
}`;
export const FS_COIN = `${HEAD}
in vec3 vWorld; in vec3 vNrm; in vec2 vUv; in float vPart; in vec4 vTint; in vec3 vViewL; in vec3 vLightL;
out vec4 o;
uniform vec3 uCam; uniform vec3 uLight; uniform vec3 uRim; uniform sampler2D uCrown;
uniform float uShell; uniform float uMirror;
const vec3 GOLD = vec3(0.961, 0.824, 0.243);
const vec3 INK = vec3(0.067);
void main(){
  float fade = 1.0;
  if (uMirror > 0.001) fade = exp(-max(vWorld.y, 0.0) * 1.5) * 0.34 * uMirror;
  if (uShell > 0.0) { o = vec4(INK * fade, fade); return; }
  vec3 N = normalize(vNrm);
  vec3 V = normalize(uCam - vWorld);
  float nv = dot(N, V);
  vec3 col;
  if (vPart < 1.5) {
    vec2 p = vUv;
    float r = length(p);
    col = GOLD;
    // The mark draws its crown un-foreshortened on a tilted face. Do the same:
    // stretch the art back along the direction the face is being squashed.
    vec2 q = p;
    vec3 vl = normalize(vViewL);
    float ld = length(vl.xy);
    if (ld > 0.001) {
      vec2 dv = vl.xy / ld;
      float c = mix(1.0, max(abs(vl.z), 0.45), vTint.z);
      q -= dv * dot(q, dv) * (1.0 - c);
    }
    vec4 cr = texture(uCrown, vec2(q.x / 1.1 + 0.5, 0.5 - q.y / 1.1));
    cr *= step(abs(q.x), 0.548) * step(abs(q.y), 0.548);
    col = col * (1.0 - cr.a) + cr.rgb;
    float aa = fwidth(r) * 1.2 + 0.00001;
    // A struck coin: a faintly raised lip that catches the key light on one
    // side and falls into shade on the other, plus a soft wash across the face.
    vec2 lxy = normalize(vLightL).xy;
    float lip = smoothstep(0.775, 0.80 + aa, r) * (1.0 - smoothstep(0.885, 0.91 + aa, r));
    float facing = dot(p / max(r, 0.001), lxy);
    col *= 1.0 + (lip * 0.085 * facing + 0.04 * dot(p, lxy)) * (1.0 - vTint.x);
    col = mix(col, INK, smoothstep(0.93 - aa, 0.93 + aa, r));
  } else {
    float f = abs(fract(vUv.x * 36.0) - 0.5);
    float aaf = fwidth(vUv.x * 36.0) + 0.00001;
    float tick = 1.0 - smoothstep(0.17 - aaf, 0.17 + aaf, f);
    float aay = fwidth(vUv.y) + 0.00001;
    float band = smoothstep(0.17 - aay, 0.17 + aay, vUv.y) * (1.0 - smoothstep(0.83 - aay, 0.83 + aay, vUv.y));
    col = mix(INK, mix(GOLD * 0.96, INK, tick), band);
  }
  float gold = smoothstep(0.2, 0.5, col.r);
  float tone = 0.86 + 0.14 * smoothstep(-0.15, 0.35, dot(N, uLight));
  vec3 R = reflect(-V, N);
  float glint = smoothstep(0.90, 0.985, dot(R, uLight));
  float rim = pow(max(1.0 - abs(nv), 0.0), 3.0);
  vec3 lit = col * tone + (vec3(1.0, 0.97, 0.80) * glint * 0.6 + uRim * rim) * gold;
  col = mix(lit, col, vTint.x) * (1.0 + vTint.y);
  o = vec4(col * fade, fade);
}`;

// ── iPhone: opaque rounded slab, screen/bezel resolved analytically ─────────
export const VS_PHONE = `${HEAD}
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aNrm;
layout(location=2) in vec2 aLocal;
layout(location=3) in float aPart;
uniform mat4 uVP; uniform mat4 uModel;
out vec3 vWorld; out vec3 vNrm; out vec2 vLocal; out float vPart;
void main(){
  vec4 w = uModel * vec4(aPos, 1.0);
  vWorld = w.xyz; vNrm = mat3(uModel) * aNrm; vLocal = aLocal; vPart = aPart;
  gl_Position = uVP * w;
}`;
export const FS_PHONE = `${HEAD}
in vec3 vWorld; in vec3 vNrm; in vec2 vLocal; in float vPart;
out vec4 o;
uniform sampler2D uScreen; uniform float uOn; uniform float uGain; uniform float uLod;
uniform vec3 uCam; uniform vec3 uLight; uniform float uMirror; uniform float uSweep;
float sdRR(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void main(){
  float fade = 1.0;
  if (uMirror > 0.001) fade = exp(-max(vWorld.y, 0.0) * 0.85) * 0.30 * uMirror;
  vec3 N = normalize(vNrm);
  vec3 V = normalize(uCam - vWorld);
  float nv = max(dot(N, V), 0.0);
  vec3 TI = vec3(0.165, 0.165, 0.173);
  vec3 col;
  if (vPart < 0.5) {
    vec2 q = vLocal;
    float d1 = sdRR(q, vec2(205.5, 432.0), 61.0);
    float d2 = sdRR(q, vec2(196.5, 423.0), 54.0);
    float aa = max(fwidth(d1), 0.0001);
    vec3 frame = TI * 1.25 + vec3(0.16) * (1.0 - smoothstep(0.0, 3.5, -d1));
    col = mix(vec3(0.016), frame, smoothstep(-aa, aa, d1));
    vec2 uv = vec2((q.x + 196.5) / 393.0, 0.5 + ((423.0 - q.y) / 846.0 - 0.5) / 1.0101);
    vec3 scr = texture(uScreen, uv, uLod).rgb;
    scr = mix(scr * 0.07 + 0.012, scr * uGain, uOn);
    // Glass: a soft key reflection, a travelling sheen and grazing-angle fresnel.
    vec3 R = reflect(-V, N);
    float spec = pow(max(dot(R, uLight), 0.0), 18.0);
    float sw = (dot(q, vec2(0.0016, 0.0007)) - uSweep) / 0.11;
    float sheen = exp(-sw * sw);
    scr += vec3(0.85, 0.95, 1.0) * (spec * 0.22 + sheen * 0.16 + pow(max(1.0 - nv, 0.0), 4.0) * 0.30);
    col = mix(scr, col, smoothstep(-aa, aa, d2));
  } else if (vPart < 1.5) {
    col = TI * (0.9 + 0.5 * nv);
  } else {
    float l = 0.5 + 0.5 * dot(N, uLight);
    col = TI * (0.55 + 1.5 * l * l) + vec3(0.20) * pow(max(1.0 - nv, 0.0), 2.0);
  }
  o = vec4(col * fade, fade);
}`;

// ── Chart bars (instanced boxes; the coin's ridges, grown up) ───────────────
export const VS_BAR = `${HEAD}
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aNrm;
layout(location=2) in mat4 aModel;
layout(location=6) in vec4 aColor;
uniform mat4 uVP;
out vec3 vWorld; out vec3 vNrm; out vec4 vColor; out float vH;
void main(){
  vec4 w = aModel * vec4(aPos, 1.0);
  vWorld = w.xyz; vNrm = mat3(aModel) * aNrm; vColor = aColor; vH = aPos.y;
  gl_Position = uVP * w;
}`;
export const FS_BAR = `${HEAD}
in vec3 vWorld; in vec3 vNrm; in vec4 vColor; in float vH;
out vec4 o;
uniform vec3 uLight; uniform float uMirror;
void main(){
  float fade = 1.0;
  if (uMirror > 0.001) fade = exp(-max(vWorld.y, 0.0) * 1.6) * 0.36 * uMirror;
  vec3 N = normalize(vNrm);
  float lit = 0.46 + 0.34 * max(dot(N, uLight), 0.0) + 0.34 * max(N.y, 0.0);
  vec3 col = vColor.rgb * lit * mix(0.5, 1.0, vH) * vColor.a;
  o = vec4(col * fade, fade);
}`;

// ── Sprites: cartoon clouds and speed lines from the icon ───────────────────
export const VS_SPRITE = `${HEAD}
layout(location=0) in vec2 aCorner;
layout(location=1) in vec3 aCenter;
layout(location=2) in vec4 aSize;     // w, h, rotation, kind
layout(location=3) in vec4 aColor;
layout(location=4) in vec2 aMisc;     // softness, variant
uniform mat4 uVP;
out vec2 vP; out vec4 vColor; out vec2 vMisc; out float vKind; out vec2 vSize;
void main(){
  float c = cos(aSize.z), s = sin(aSize.z);
  vec2 l = aCorner * aSize.xy * 0.5;
  vec2 r = vec2(c * l.x - s * l.y, s * l.x + c * l.y);
  vP = aCorner; vColor = aColor; vMisc = aMisc; vKind = aSize.w; vSize = aSize.xy;
  gl_Position = uVP * vec4(aCenter + vec3(r, 0.0), 1.0);
}`;
export const FS_SPRITE = `${HEAD}
in vec2 vP; in vec4 vColor; in vec2 vMisc; in float vKind; in vec2 vSize;
out vec4 o;
float smin(float a, float b, float k){ float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float cloud(vec2 p, float variant){
  // Flat-bottomed base with two or three bumps, as drawn on the icon.
  vec2 b = p - vec2(0.0, -0.20);
  float d = length(vec2(max(abs(b.x) - 0.60, 0.0), b.y)) - 0.20;
  if (variant < 0.5) {
    d = smin(d, length(p - vec2(-0.40, -0.02)) - 0.27, 0.05);
    d = smin(d, length(p - vec2(-0.02, 0.09)) - 0.34, 0.05);
    d = smin(d, length(p - vec2(0.42, -0.06)) - 0.26, 0.05);
  } else if (variant < 1.5) {
    d = smin(d, length(p - vec2(-0.22, 0.06)) - 0.35, 0.05);
    d = smin(d, length(p - vec2(0.36, -0.06)) - 0.25, 0.05);
  } else {
    d = smin(d, length(p - vec2(-0.30, -0.04)) - 0.24, 0.05);
    d = smin(d, length(p - vec2(0.14, 0.07)) - 0.33, 0.05);
  }
  return d;
}
void main(){
  if (vKind < 0.5) {
    vec2 p = vP * vec2(1.0, vSize.y / vSize.x);
    float d = cloud(p, vMisc.y);
    float aa = fwidth(d) + vMisc.x + 0.00001;
    float a = (1.0 - smoothstep(-aa, aa, d)) * vColor.a;
    vec3 col = mix(vec3(0.842, 0.918, 0.960), vec3(1.0), smoothstep(-0.36, 0.16, p.y)) * vColor.rgb;
    o = vec4(col * a, a);
  } else {
    vec2 h = vSize * 0.5;
    vec2 q = vP * h;
    float d = length(vec2(q.x, max(abs(q.y) - (h.y - h.x), 0.0))) - h.x;
    float aa = fwidth(d) + vMisc.x * h.x + 0.00001;
    float a = (1.0 - smoothstep(-aa, aa, d)) * vColor.a;
    o = vec4(vColor.rgb * a, a);
  }
}`;

// ── Particles: additive soft points with optional screen-space streak ───────
export const VS_PART = `${HEAD}
layout(location=0) in vec2 aCorner;
layout(location=1) in vec4 aPos;      // xyz + radius
layout(location=2) in vec4 aColor;
layout(location=3) in vec2 aStretch;  // view-space streak vector
uniform mat4 uV; uniform mat4 uP;
out vec2 vC; out vec4 vColor;
void main(){
  vec4 v = uV * vec4(aPos.xyz, 1.0);
  float L = length(aStretch);
  vec2 dir = L > 0.00001 ? aStretch / L : vec2(1.0, 0.0);
  vec2 perp = vec2(-dir.y, dir.x);
  v.xy += dir * aCorner.x * (aPos.w + L) + perp * aCorner.y * aPos.w;
  vC = aCorner; vColor = aColor;
  gl_Position = uP * v;
}`;
export const FS_PART = `${HEAD}
in vec2 vC; in vec4 vColor; out vec4 o;
void main(){
  float a = max(exp(-dot(vC, vC) * 3.6) - 0.027, 0.0);
  o = vec4(vColor.rgb * vColor.a * a, 0.0);
}`;

// ── 2D type layers (Canvas2D → texture) ─────────────────────────────────────
export const FS_LAYER = `${HEAD}
in vec2 vUv; out vec4 o;
uniform sampler2D uTex; uniform float uGain; uniform float uAlpha; uniform vec3 uTint;
uniform vec4 uWipe;   // centre px (y up), radius px, mode: 0 off · 1 keep outside · 2 keep inside
void main(){
  vec4 c = texture(uTex, vec2(vUv.x, 1.0 - vUv.y));
  float m = 1.0;
  if (uWipe.w > 0.5) {
    float s = smoothstep(uWipe.z - 1.5, uWipe.z + 1.5, length(gl_FragCoord.xy - uWipe.xy));
    m = uWipe.w < 1.5 ? s : 1.0 - s;
  }
  o = vec4(c.rgb * uTint * uGain, c.a) * (uAlpha * m);
}`;

// Gold poster: the coin's face as a flat field, with black type burnt in. The
// ink iris that swallows it borrows its edge from the live fluid.
export const FS_POSTER = `${HEAD}
in vec2 vUv; out vec4 o;
uniform sampler2D uTex; uniform sampler2D uDye; uniform vec2 uRes; uniform float uTime;
uniform vec3 uColor; uniform float uAlpha; uniform float uShade; uniform vec3 uIris; uniform float uUseDye;
${NOISE}
void main(){
  float mn = min(uRes.x, uRes.y);
  vec2 p = (vUv - 0.5) * uRes / mn;
  vec4 t = texture(uTex, vec2(vUv.x, 1.0 - vUv.y));
  vec3 col = uColor * (1.0 + uShade * (0.035 - 0.11 * dot(p, p)));
  col = col * (1.0 - t.a) + t.rgb;
  float a = uAlpha;
  if (uIris.z > 0.0) {
    vec2 d = (gl_FragCoord.xy - uIris.xy) / mn;
    float r = length(d);
    float n = fbm(normalize(d + 0.00001) * 2.6 + uTime * 0.9) - 0.5;
    float dye = uUseDye > 0.5 ? dot(texture(uDye, vUv).rgb, vec3(0.34)) : 0.0;
    float edge = r - n * 0.34 * uIris.z - min(dye, 1.0) * 0.16;
    a *= smoothstep(uIris.z - 0.012, uIris.z + 0.012, edge);
  }
  o = vec4(col * a, a);
}`;

// Fluid dye → lit ink. Inside the type mask it burns at full power.
export const FS_FLUID_SHOW = `${HEAD}
in vec2 vUv; out vec4 o;
uniform sampler2D uDye; uniform sampler2D uMask; uniform vec2 uTexel;
uniform float uAmbient; uniform float uInside; uniform vec3 uCore; uniform float uUseMask;
const vec3 LW = vec3(0.30, 0.50, 0.20);
void main(){
  vec3 c = texture(uDye, vUv).rgb;
  float l = dot(c, LW);
  float lx = dot(texture(uDye, vUv + vec2(uTexel.x, 0.0)).rgb - texture(uDye, vUv - vec2(uTexel.x, 0.0)).rgb, LW);
  float ly = dot(texture(uDye, vUv + vec2(0.0, uTexel.y)).rgb - texture(uDye, vUv - vec2(0.0, uTexel.y)).rgb, LW);
  vec3 n = normalize(vec3(-lx, -ly, 0.30));
  float diff = clamp(dot(n, normalize(vec3(-0.45, 0.60, 0.66))), 0.0, 1.0);
  float spec = pow(clamp(dot(n, normalize(vec3(-0.25, 0.45, 0.86))), 0.0, 1.0), 26.0);
  vec3 col = c * (0.50 + 0.85 * diff) + vec3(0.86, 1.0, 0.92) * spec * min(l, 1.2) * 0.7;
  float m = uUseMask > 0.5 ? texture(uMask, vec2(vUv.x, 1.0 - vUv.y)).a : 0.0;
  o = vec4(col * (uAmbient + m * uInside) + uCore * m, 0.0);
}`;

// White card with the icon window punched through it (superellipse). While the
// card is still wiping in, whatever lies outside both stays `uOuter` (the dark).
export const FS_CARD = `${HEAD}
in vec2 vUv; out vec4 o;
uniform vec3 uMask; uniform vec3 uCardCol; uniform float uCardA; uniform vec3 uWipe; uniform vec4 uOuter;
uniform float uArc; uniform float uTime; uniform float uShadow;
float sq(vec2 p, float a){
  vec2 q = abs(p) / a;
  return (pow(pow(q.x, 4.5) + pow(q.y, 4.5), 1.0 / 4.5) - 1.0) * a;
}
void main(){
  vec2 px = gl_FragCoord.xy;
  vec2 p = px - uMask.xy;
  float a = max(uMask.z, 0.001);
  float d = sq(p, a);
  float aa = max(fwidth(d), 0.7);
  float hole = 1.0 - smoothstep(-aa, aa, d);
  float arrived = 1.0;
  if (uWipe.z >= 0.0) arrived = 1.0 - smoothstep(uWipe.z - 1.5, uWipe.z + 1.5, length(px - uWipe.xy));
  // Soft shadow the icon casts on the card.
  float ds = sq(p - vec2(0.0, -a * 0.17), a * 0.93);
  float sh = (1.0 - smoothstep(-a * 0.16, a * 0.5, ds)) * uShadow;
  vec3 col = mix(uOuter.rgb, uCardCol * (1.0 - sh), arrived);
  float alpha = mix(uOuter.a, 1.0, arrived) * uCardA * (1.0 - hole);
  vec3 outc = col * alpha;
  // Glass rim on the window's inner edge, strongest top-left (as on the real icon).
  float rimW = max(a * 0.018, 1.2);
  float rim = smoothstep(-rimW * 2.2, 0.0, d) * hole;
  float lightSide = clamp(0.55 + 0.45 * dot(normalize(p + 0.0001), normalize(vec2(-0.5, 0.86))), 0.0, 1.0);
  float ra = rim * (0.2 + 0.5 * lightSide) * uCardA;
  outc = outc * (1.0 - ra) + vec3(1.0) * ra;
  alpha = alpha * (1.0 - ra) + ra;
  // A brand-green arc travelling round the edge (the landing's StarBorder).
  if (uArc > 0.001) {
    float h = fract(atan(p.y, p.x) / 6.2831853 + 0.5 - uTime * 0.2);
    float arc = smoothstep(0.0, 0.24, h) * (1.0 - smoothstep(0.24, 0.27, h));
    float bw = d / max(a * 0.009, 1.0);
    float band = exp(-bw * bw);
    float g = arc * arc * band * uArc * arrived * 0.55;
    outc = outc * (1.0 - g) + vec3(0.070, 0.640, 0.353) * g;
    alpha = alpha * (1.0 - g) + g;
  }
  o = vec4(outc, alpha);
}`;

// ── Post: dual-Kawase bloom, then the lens ──────────────────────────────────
export const FS_BLOOM_DOWN = `${HEAD}
in vec2 vUv; out vec4 o;
uniform sampler2D uTex; uniform vec2 uHalf; uniform float uThreshold;
void main(){
  vec3 s = texture(uTex, vUv).rgb * 4.0;
  s += texture(uTex, vUv - uHalf).rgb;
  s += texture(uTex, vUv + uHalf).rgb;
  s += texture(uTex, vUv + vec2(uHalf.x, -uHalf.y)).rgb;
  s += texture(uTex, vUv - vec2(uHalf.x, -uHalf.y)).rgb;
  s /= 8.0;
  if (uThreshold >= 0.0) {
    float br = max(s.r, max(s.g, s.b));
    float knee = 0.22;
    float soft = clamp(br - uThreshold + knee, 0.0, 2.0 * knee);
    soft = soft * soft / (4.0 * knee + 0.0001);
    s *= max(soft, br - uThreshold) / max(br, 0.0001);
  }
  o = vec4(max(s, 0.0), 1.0);
}`;
export const FS_BLOOM_UP = `${HEAD}
in vec2 vUv; out vec4 o;
uniform sampler2D uTex; uniform sampler2D uBase; uniform vec2 uHalf;
void main(){
  vec3 s = texture(uTex, vUv + vec2(-uHalf.x * 2.0, 0.0)).rgb;
  s += texture(uTex, vUv + vec2(-uHalf.x, uHalf.y)).rgb * 2.0;
  s += texture(uTex, vUv + vec2(0.0, uHalf.y * 2.0)).rgb;
  s += texture(uTex, vUv + vec2(uHalf.x, uHalf.y)).rgb * 2.0;
  s += texture(uTex, vUv + vec2(uHalf.x * 2.0, 0.0)).rgb;
  s += texture(uTex, vUv + vec2(uHalf.x, -uHalf.y)).rgb * 2.0;
  s += texture(uTex, vUv + vec2(0.0, -uHalf.y * 2.0)).rgb;
  s += texture(uTex, vUv + vec2(-uHalf.x, -uHalf.y)).rgb * 2.0;
  o = vec4(s / 12.0 + texture(uBase, vUv).rgb, 1.0);
}`;
export const FS_FINAL = `${HEAD}
in vec2 vUv; out vec4 o;
uniform sampler2D uScene; uniform sampler2D uBloom; uniform vec2 uRes; uniform float uTime;
uniform float uBloomAmt; uniform float uCA; uniform float uLens; uniform float uGrain; uniform float uVig; uniform float uFlash;
uniform vec4 uFade; uniform vec4 uRipple; uniform vec3 uZoom; uniform vec2 uShake;
${NOISE}
vec3 tap(vec2 uv){ return texture(uScene, uv).rgb + texture(uBloom, uv).rgb * uBloomAmt; }
void main(){
  float mn = min(uRes.x, uRes.y);
  vec2 asp = uRes / mn;
  vec2 uv = vUv + uShake;
  // Shockwave ring.
  vec2 dr = (uv - uRipple.xy) * asp;
  float r = length(dr);
  float w = r - uRipple.z;
  uv -= dr / max(r, 0.0001) / asp * exp(-w * w * 110.0) * uRipple.w;
  // Barrel.
  vec2 c = (uv - 0.5) * asp;
  uv = 0.5 + (uv - 0.5) * (1.0 + dot(c, c) * uLens);
  vec2 dir = (uv - 0.5) * (0.4 + dot(c, c));
  vec3 col;
  if (uZoom.z > 0.0005) {
    col = vec3(0.0);
    float j = hash21(gl_FragCoord.xy + fract(uTime) * 91.0);
    for (int i = 0; i < 10; i++) {
      float f = (float(i) + j) / 10.0;
      vec2 u = uZoom.xy + (uv - uZoom.xy) * (1.0 - uZoom.z * f);
      col.r += tap(u + dir * uCA).r;
      col.g += tap(u).g;
      col.b += tap(u - dir * uCA).b;
    }
    col /= 10.0;
  } else {
    col = vec3(tap(uv + dir * uCA).r, tap(uv).g, tap(uv - dir * uCA).b);
  }
  // Anything hotter than white burns towards white instead of clipping a hue.
  float m = max(col.r, max(col.g, col.b));
  if (m > 1.0) col = mix(col / m, vec3(1.0), clamp((m - 1.0) * 0.4, 0.0, 1.0));
  col *= 1.0 - uVig * smoothstep(0.35, 1.25, length(c));
  col += uFlash;
  col = mix(col, uFade.rgb, uFade.a);
  float g = hash21(gl_FragCoord.xy * 0.7 + fract(uTime * 7.31) * 173.0) - 0.5;
  col += g * uGrain * (0.55 + 0.45 * (1.0 - dot(col, vec3(0.333))));
  o = vec4(col, 1.0);
}`;

// ── Stable-fluids solver ────────────────────────────────────────────────────
export const VS_FLUID = `${HEAD}
uniform vec2 uTexel;
out vec2 vUv; out vec2 vL; out vec2 vR; out vec2 vT; out vec2 vB;
void main(){
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  vL = p - vec2(uTexel.x, 0.0); vR = p + vec2(uTexel.x, 0.0);
  vT = p + vec2(0.0, uTexel.y); vB = p - vec2(0.0, uTexel.y);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;
const FLUID_IN = `in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB; out vec4 o;`;
export const FS_SPLAT = `${HEAD}${FLUID_IN}
uniform sampler2D uTarget; uniform float uAspect; uniform vec3 uColor; uniform vec2 uPoint; uniform float uRadius;
void main(){
  vec2 p = vUv - uPoint; p.x *= uAspect;
  o = vec4(texture(uTarget, vUv).xyz + exp(-dot(p, p) / uRadius) * uColor, 1.0);
}`;
export const FS_ADVECT = `${HEAD}${FLUID_IN}
uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 uVelTexel; uniform float uDt; uniform float uDissipation;
void main(){
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uVelTexel;
  o = vec4(texture(uSource, coord).rgb / (1.0 + uDissipation * uDt), 1.0);
}`;
export const FS_DIVERGENCE = `${HEAD}${FLUID_IN}
uniform sampler2D uVelocity;
void main(){
  float L = texture(uVelocity, vL).x, R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y, B = texture(uVelocity, vB).y;
  vec2 C = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0) L = -C.x;
  if (vR.x > 1.0) R = -C.x;
  if (vT.y > 1.0) T = -C.y;
  if (vB.y < 0.0) B = -C.y;
  o = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;
export const FS_CURL = `${HEAD}${FLUID_IN}
uniform sampler2D uVelocity;
void main(){
  float L = texture(uVelocity, vL).y, R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x, B = texture(uVelocity, vB).x;
  o = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`;
export const FS_VORTICITY = `${HEAD}${FLUID_IN}
uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float uCurlAmt; uniform float uDt;
void main(){
  float L = texture(uCurl, vL).x, R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x, B = texture(uCurl, vB).x;
  float C = texture(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= uCurlAmt * C;
  force.y *= -1.0;
  vec2 vel = texture(uVelocity, vUv).xy + force * uDt;
  o = vec4(clamp(vel, vec2(-1000.0), vec2(1000.0)), 0.0, 1.0);
}`;
export const FS_PRESSURE = `${HEAD}${FLUID_IN}
uniform sampler2D uPressure; uniform sampler2D uDivergence;
void main(){
  float L = texture(uPressure, vL).x, R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x, B = texture(uPressure, vB).x;
  float div = texture(uDivergence, vUv).x;
  o = vec4((L + R + B + T - div) * 0.25, 0.0, 0.0, 1.0);
}`;
export const FS_GRADIENT = `${HEAD}${FLUID_IN}
uniform sampler2D uPressure; uniform sampler2D uVelocity;
void main(){
  float L = texture(uPressure, vL).x, R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x, B = texture(uPressure, vB).x;
  vec2 vel = texture(uVelocity, vUv).xy - vec2(R - L, T - B);
  o = vec4(vel, 0.0, 1.0);
}`;
export const FS_SCALE = `${HEAD}${FLUID_IN}
uniform sampler2D uTex; uniform float uValue;
void main(){ o = texture(uTex, vUv) * uValue; }`;
