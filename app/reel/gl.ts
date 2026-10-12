// Thin WebGL2 helpers — just enough to keep the renderer readable. Every
// resource is tracked by `Pool` so the whole thing can be torn down on unmount
// (React strict mode mounts twice in dev on the same <canvas>).

export type GL = WebGL2RenderingContext;

export class Pool {
  programs: WebGLProgram[] = [];
  textures: WebGLTexture[] = [];
  fbos: WebGLFramebuffer[] = [];
  rbos: WebGLRenderbuffer[] = [];
  buffers: WebGLBuffer[] = [];
  vaos: WebGLVertexArrayObject[] = [];
  constructor(readonly gl: GL) {}
  dispose() {
    const gl = this.gl;
    this.programs.forEach((p) => gl.deleteProgram(p));
    this.textures.forEach((t) => gl.deleteTexture(t));
    this.fbos.forEach((f) => gl.deleteFramebuffer(f));
    this.rbos.forEach((r) => gl.deleteRenderbuffer(r));
    this.buffers.forEach((b) => gl.deleteBuffer(b));
    this.vaos.forEach((v) => gl.deleteVertexArray(v));
    this.programs = []; this.textures = []; this.fbos = []; this.rbos = []; this.buffers = []; this.vaos = [];
  }
}

function compile(gl: GL, type: number, src: string, label: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh) || "";
    const numbered = src.split("\n").map((l, i) => `${String(i + 1).padStart(3)} ${l}`).join("\n");
    gl.deleteShader(sh);
    throw new Error(`[reel] shader "${label}" failed to compile:\n${log}\n${numbered}`);
  }
  return sh;
}

export class Program {
  readonly prog: WebGLProgram;
  private locs = new Map<string, WebGLUniformLocation | null>();
  constructor(private pool: Pool, vs: string, fs: string, readonly label: string) {
    const gl = pool.gl;
    const v = compile(gl, gl.VERTEX_SHADER, vs, label + ".vs");
    const f = compile(gl, gl.FRAGMENT_SHADER, fs, label + ".fs");
    const p = gl.createProgram()!;
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.linkProgram(p);
    gl.deleteShader(v);
    gl.deleteShader(f);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(`[reel] program "${label}" failed to link: ${gl.getProgramInfoLog(p)}`);
    }
    this.prog = p;
    pool.programs.push(p);
  }
  private loc(name: string) {
    let l = this.locs.get(name);
    if (l === undefined) {
      l = this.pool.gl.getUniformLocation(this.prog, name);
      this.locs.set(name, l);
    }
    return l;
  }
  use() {
    this.pool.gl.useProgram(this.prog);
    return this;
  }
  /** Float uniform: 1–4 scalars. */
  f(name: string, a: number, b?: number, c?: number, d?: number) {
    const l = this.loc(name), gl = this.pool.gl;
    if (!l) return this;
    if (b === undefined) gl.uniform1f(l, a);
    else if (c === undefined) gl.uniform2f(l, a, b);
    else if (d === undefined) gl.uniform3f(l, a, b, c);
    else gl.uniform4f(l, a, b, c, d);
    return this;
  }
  /** Float vector uniform from an array (length 2, 3 or 4). */
  v(name: string, a: ArrayLike<number>) {
    const l = this.loc(name), gl = this.pool.gl;
    if (!l) return this;
    if (a.length === 2) gl.uniform2f(l, a[0], a[1]);
    else if (a.length === 3) gl.uniform3f(l, a[0], a[1], a[2]);
    else gl.uniform4f(l, a[0], a[1], a[2], a[3]);
    return this;
  }
  m(name: string, mat: Float32Array) {
    const l = this.loc(name);
    if (l) this.pool.gl.uniformMatrix4fv(l, false, mat);
    return this;
  }
  /** Bind `tex` to texture unit `unit` and point the sampler at it. */
  t(name: string, unit: number, tex: WebGLTexture | null) {
    const gl = this.pool.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    const l = this.loc(name);
    if (l) gl.uniform1i(l, unit);
    return this;
  }
}

export type Target = { fbo: WebGLFramebuffer; tex: WebGLTexture; w: number; h: number };
export type Double = { read: Target; write: Target; swap: () => void };

export function makeTarget(pool: Pool, w: number, h: number, internal: number, format: number, type: number, filter: number): Target {
  const gl = pool.gl;
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, null);
  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.viewport(0, 0, w, h);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  pool.textures.push(tex);
  pool.fbos.push(fbo);
  return { fbo, tex, w, h };
}

export function makeDouble(pool: Pool, w: number, h: number, internal: number, format: number, type: number, filter: number): Double {
  const d: Double = {
    read: makeTarget(pool, w, h, internal, format, type, filter),
    write: makeTarget(pool, w, h, internal, format, type, filter),
    swap() {
      const t = d.read;
      d.read = d.write;
      d.write = t;
    },
  };
  return d;
}

export function freeTarget(pool: Pool, t: Target | null) {
  if (!t) return;
  const gl = pool.gl;
  gl.deleteTexture(t.tex);
  gl.deleteFramebuffer(t.fbo);
  pool.textures = pool.textures.filter((x) => x !== t.tex);
  pool.fbos = pool.fbos.filter((x) => x !== t.fbo);
}

/** Upload an image/canvas as a premultiplied, mip-mapped, anisotropic texture. */
export function makeTexture(pool: Pool, src: TexImageSource | null, opts: { mips?: boolean; w?: number; h?: number } = {}) {
  const gl = pool.gl;
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  if (src) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
  else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, opts.w || 1, opts.h || 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  if (opts.mips && src) {
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    const aniso = gl.getExtension("EXT_texture_filter_anisotropic");
    if (aniso) {
      const max = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) as number;
      gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, max));
    }
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }
  pool.textures.push(tex);
  return tex;
}

export type Mesh = { vao: WebGLVertexArrayObject; count: number; indexed: boolean };

/**
 * Interleaved float mesh. `layout` lists attribute sizes in location order
 * (e.g. [3, 3, 2, 1] → pos, normal, uv, part).
 */
export function makeMesh(pool: Pool, data: Float32Array, layout: number[], indices?: Uint16Array): Mesh {
  const gl = pool.gl;
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  const vbo = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  const stride = layout.reduce((a, b) => a + b, 0);
  let off = 0;
  layout.forEach((size, i) => {
    gl.enableVertexAttribArray(i);
    gl.vertexAttribPointer(i, size, gl.FLOAT, false, stride * 4, off * 4);
    off += size;
  });
  pool.buffers.push(vbo);
  if (indices) {
    const ibo = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    pool.buffers.push(ibo);
  }
  gl.bindVertexArray(null);
  pool.vaos.push(vao);
  return { vao, count: indices ? indices.length : data.length / stride, indexed: !!indices };
}

/**
 * Per-instance stream attached to an existing mesh VAO, starting at attribute
 * location `first`. Returns an uploader for the per-frame data.
 */
export function makeInstances(pool: Pool, mesh: Mesh, first: number, layout: number[], capacity: number) {
  const gl = pool.gl;
  const stride = layout.reduce((a, b) => a + b, 0);
  const buf = gl.createBuffer()!;
  gl.bindVertexArray(mesh.vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, capacity * stride * 4, gl.DYNAMIC_DRAW);
  let off = 0, loc = first;
  layout.forEach((size) => {
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride * 4, off * 4);
    gl.vertexAttribDivisor(loc, 1);
    off += size;
    loc++;
  });
  gl.bindVertexArray(null);
  pool.buffers.push(buf);
  const data = new Float32Array(capacity * stride);
  return {
    data,
    stride,
    capacity,
    upload(count: number) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, data, 0, count * stride);
    },
  };
}
export type Instances = ReturnType<typeof makeInstances>;
