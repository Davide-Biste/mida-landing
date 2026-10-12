import { Pool, Program, freeTarget, makeDouble, makeTarget, type Double, type Target } from "./gl";
import * as S from "./shaders";

// GPU stable-fluids solver (Stam): curl → vorticity confinement → divergence →
// Jacobi pressure → projection → advection. Stepped at a fixed dt and fully
// re-simulated from `reset()` when the timeline is scrubbed, so the ink always
// looks the same on a given frame.
export class Fluid {
  /** False when the GPU can't render to half-float targets; the reel then
      simply skips the ink layer. */
  readonly ok: boolean;
  steps = 0;
  simW = 0; simH = 0; dyeW = 0; dyeH = 0;
  private aspect = 1;
  private vel: Double | null = null;
  private dye: Double | null = null;
  private prs: Double | null = null;
  private div: Target | null = null;
  private curl: Target | null = null;
  private p: Record<"splat" | "advect" | "div" | "curl" | "vort" | "prs" | "grad" | "scale", Program> | null = null;

  constructor(private pool: Pool, hdr: boolean, private base = 160) {
    this.ok = hdr;
    if (!hdr) return;
    const mk = (fs: string, label: string) => new Program(pool, S.VS_FLUID, fs, label);
    this.p = {
      splat: mk(S.FS_SPLAT, "fluid.splat"),
      advect: mk(S.FS_ADVECT, "fluid.advect"),
      div: mk(S.FS_DIVERGENCE, "fluid.div"),
      curl: mk(S.FS_CURL, "fluid.curl"),
      vort: mk(S.FS_VORTICITY, "fluid.vort"),
      prs: mk(S.FS_PRESSURE, "fluid.prs"),
      grad: mk(S.FS_GRADIENT, "fluid.grad"),
      scale: mk(S.FS_SCALE, "fluid.scale"),
    };
  }

  resize(aspect: number) {
    if (!this.ok) return;
    const gl = this.pool.gl;
    const short = this.base;
    const simW = aspect >= 1 ? Math.round(short * aspect) : short;
    const simH = aspect >= 1 ? short : Math.round(short / aspect);
    this.aspect = aspect;
    if (simW === this.simW && simH === this.simH) return;
    [this.vel, this.dye, this.prs].forEach((d) => { if (d) { freeTarget(this.pool, d.read); freeTarget(this.pool, d.write); } });
    freeTarget(this.pool, this.div);
    freeTarget(this.pool, this.curl);
    this.simW = simW; this.simH = simH;
    this.dyeW = simW * 4; this.dyeH = simH * 4;
    const HF = gl.HALF_FLOAT;
    this.vel = makeDouble(this.pool, simW, simH, gl.RG16F, gl.RG, HF, gl.LINEAR);
    this.dye = makeDouble(this.pool, this.dyeW, this.dyeH, gl.RGBA16F, gl.RGBA, HF, gl.LINEAR);
    this.prs = makeDouble(this.pool, simW, simH, gl.R16F, gl.RED, HF, gl.NEAREST);
    this.div = makeTarget(this.pool, simW, simH, gl.R16F, gl.RED, HF, gl.NEAREST);
    this.curl = makeTarget(this.pool, simW, simH, gl.R16F, gl.RED, HF, gl.NEAREST);
    this.steps = 0;
  }

  get dyeTex() { return this.dye ? this.dye.read.tex : null; }

  private blit(t: Target) {
    const gl = this.pool.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
    gl.viewport(0, 0, t.w, t.h);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  private begin() {
    const gl = this.pool.gl;
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.bindVertexArray(null);
  }

  reset() {
    if (!this.ok || !this.vel || !this.dye || !this.prs) return;
    const gl = this.pool.gl;
    gl.clearColor(0, 0, 0, 1);
    for (const t of [this.vel.read, this.vel.write, this.dye.read, this.dye.write, this.prs.read, this.prs.write]) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
      gl.viewport(0, 0, t.w, t.h);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    this.steps = 0;
  }

  /** Inject momentum (sim texels/s) and dye at uv (y up). */
  splat(x: number, y: number, vx: number, vy: number, color: [number, number, number], radius: number) {
    if (!this.p || !this.vel || !this.dye) return;
    this.begin();
    const sp = this.p.splat.use();
    sp.f("uTexel", 1 / this.simW, 1 / this.simH).f("uAspect", this.aspect).f("uPoint", x, y).f("uRadius", radius);
    if (vx !== 0 || vy !== 0) {
      sp.t("uTarget", 0, this.vel.read.tex).f("uColor", vx, vy, 0);
      this.blit(this.vel.write);
      this.vel.swap();
    }
    if (color[0] + color[1] + color[2] > 0) {
      sp.t("uTarget", 0, this.dye.read.tex).f("uColor", color[0], color[1], color[2]);
      this.blit(this.dye.write);
      this.dye.swap();
    }
  }

  step(dt: number, curlAmt = 30, velDiss = 0.2, dyeDiss = 0.8, iters = 20) {
    if (!this.p || !this.vel || !this.dye || !this.prs || !this.div || !this.curl) return;
    this.begin();
    const tx = 1 / this.simW, ty = 1 / this.simH;
    const p = this.p;

    p.curl.use().f("uTexel", tx, ty).t("uVelocity", 0, this.vel.read.tex);
    this.blit(this.curl);

    p.vort.use().f("uTexel", tx, ty).t("uVelocity", 0, this.vel.read.tex).t("uCurl", 1, this.curl.tex).f("uCurlAmt", curlAmt).f("uDt", dt);
    this.blit(this.vel.write);
    this.vel.swap();

    p.div.use().f("uTexel", tx, ty).t("uVelocity", 0, this.vel.read.tex);
    this.blit(this.div);

    p.scale.use().f("uTexel", tx, ty).t("uTex", 0, this.prs.read.tex).f("uValue", 0.8);
    this.blit(this.prs.write);
    this.prs.swap();

    p.prs.use().f("uTexel", tx, ty).t("uDivergence", 0, this.div.tex);
    for (let i = 0; i < iters; i++) {
      p.prs.t("uPressure", 1, this.prs.read.tex);
      this.blit(this.prs.write);
      this.prs.swap();
    }

    p.grad.use().f("uTexel", tx, ty).t("uPressure", 0, this.prs.read.tex).t("uVelocity", 1, this.vel.read.tex);
    this.blit(this.vel.write);
    this.vel.swap();

    p.advect.use().f("uTexel", tx, ty).f("uVelTexel", tx, ty).f("uDt", dt);
    p.advect.t("uVelocity", 0, this.vel.read.tex).t("uSource", 1, this.vel.read.tex).f("uDissipation", velDiss);
    this.blit(this.vel.write);
    this.vel.swap();

    p.advect.f("uTexel", 1 / this.dyeW, 1 / this.dyeH).t("uVelocity", 0, this.vel.read.tex).t("uSource", 1, this.dye.read.tex).f("uDissipation", dyeDiss);
    this.blit(this.dye.write);
    this.dye.swap();

    this.steps++;
  }
}
