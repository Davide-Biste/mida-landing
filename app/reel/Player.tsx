"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "../ui";
import { dictionaries, defaultLocale, type Dictionary, type Locale } from "../i18n/dictionaries";
import { reelCopy } from "./copy";
import { DUR, ReelEngine, type ReelTheme } from "./reel";

// The film itself: one WebGL canvas driven by ReelEngine.render(t), plus a thin
// transport that only shows on hover or focus. <Reel> mounts it inside its
// stage (.reel) once that is about to scroll into view; like HeroSpotlight it
// attaches to its parent, so the stage simply stays a poster if this chunk —
// or WebGL 2 — never arrives. Same idiom as the other motion islands: one
// effect, rAF, direct DOM writes for anything that changes every frame.
//
// It plays while the stage is on screen and rests when it is not. Keys work
// when the stage has focus: space play/pause · ←/→ step a frame (shift: half a
// second) · R restart · F full screen. In development the bar also offers a
// 1080p export of one take.

type Transport = {
  toggle: () => void; restart: () => void; seek: (t: number) => void;
  fullscreen: () => void; record: () => void; setLocale: (l: Locale) => void;
};

// Backing-store budget in pixels: crisp type on a laptop, light on a phone GPU.
const BUDGET = 2.3e6;
// The page lays its own film grain over everything, the stage included.
const INLINE_GRAIN = 0.5;
// Preferred containers for the export, best first.
const CODECS = ["video/mp4;codecs=avc1.640033", "video/mp4", "video/webm;codecs=vp9", "video/webm"];
const DEV = process.env.NODE_ENV !== "production";

/** The lock-up that opens and closes the film sits on the page's own card colours. */
function readTheme(el: HTMLElement): ReelTheme {
  const cs = getComputedStyle(el);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return { card: v("--tile", "#fbfbfd"), ink: v("--ink", "#1d1d1f"), accent: v("--brand-ink", "#0a6a3a"), muted: v("--muted", "#6e6e73") };
}

export default function Player({ locale, labels }: { locale: Locale; labels: Dictionary["film"] }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  // Transport, shared between the rAF loop and the UI handlers.
  const api = useRef<Transport | null>(null);
  const [playing, setPlaying] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [can, setCan] = useState({ exp: false, full: false });

  useEffect(() => {
    const cv = canvas.current, host = cv?.parentElement;
    if (!cv || !host) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const monoVar = getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono").trim();
    const mono = (monoVar ? monoVar + ", " : "") + "ui-monospace, SFMono-Regular, Menlo, monospace";

    let engine: ReelEngine;
    try {
      // The copy is set for real by the locale effect below, before the first frame.
      engine = new ReelEngine(cv, { assetBase: asset(""), mono, copy: reelCopy(dictionaries[defaultLocale], defaultLocale), theme: readTheme(host), loop: true });
    } catch (err) {
      console.warn(err);   // no WebGL 2: the stage stays a poster
      return;
    }
    engine.grain = INLINE_GRAIN;

    let raf = 0, last = 0, alive = true;
    let ready = false, primed = false;
    // Reduced motion: hold the closing lock-up until asked to play.
    let t = reduce ? DUR - 0.5 : 0;
    let run = false, held = false, inView = false;
    let quality = 1, slow = 0, frames = 0;
    let recorder: MediaRecorder | null = null;
    let idle = true, idleTimer = 0;

    // The bar hides while the film runs untouched, and shows whenever it is paused.
    const chrome = () => host.classList.toggle("is-idle", idle && run && !recorder);
    const size = () => {
      if (recorder) return;   // the export owns the canvas size while it runs
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const scale = Math.min(dpr, Math.sqrt((BUDGET * quality) / (w * h)));
      engine.resize(w * scale, h * scale, scale);
    };
    const paint = () => {
      engine.render(t);
      if (fill.current) fill.current.style.transform = `scaleX(${t / DUR})`;
      if (clock.current) clock.current.textContent = `${t.toFixed(2).padStart(5, "0")} / ${DUR.toFixed(2)}`;
    };
    const tick = (now: number) => {
      if (!alive || !run) return;
      raf = requestAnimationFrame(tick);
      const dt = Math.min(now - last, 100);
      last = now;
      t += dt / 1000;
      let ended = false;
      if (t >= DUR) {
        if (engine.loop) t %= DUR;
        else { t = DUR; ended = true; }
      }
      paint();
      if (ended) {
        play(false);
        // Give the encoder a beat on the held lock-up, then finalise the file.
        const r = recorder;
        if (r) window.setTimeout(() => { if (r.state !== "inactive") r.stop(); }, 200);
        return;
      }
      // Drop resolution, once or twice, if this GPU can't hold the frame rate.
      frames++;
      if (dt > 24) slow++;
      if (frames >= 90) {
        if (!recorder && slow > 40 && quality > 0.45) { quality *= 0.75; size(); }
        frames = 0; slow = 0;
      }
    };
    const play = (on: boolean) => {
      if (on === run) return;
      run = on;
      cancelAnimationFrame(raf);
      if (on) {
        if (t >= DUR) t = 0;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
      setPlaying(on);
      chrome();
    };

    // Play on screen, rest off screen — unless the visitor paused it themselves.
    const auto = () => {
      if (!primed || recorder) return;
      if (inView && !held && !reduce) play(true);
      else if (!inView) play(false);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.intersectionRatio >= 0.4) inView = true;
      else if (e.intersectionRatio <= 0.15) inView = false;
      auto();
    }, { threshold: [0, 0.15, 0.4, 0.75] });

    const wake = () => {
      idle = false;
      chrome();
      window.clearTimeout(idleTimer);
      // Stay up while a control holds keyboard focus.
      idleTimer = window.setTimeout(() => { idle = !host.querySelector(".reel-bar :focus-visible"); chrome(); }, 2200);
    };
    const leave = () => {
      window.clearTimeout(idleTimer);
      idle = true;
      chrome();
    };

    // Export (development only): one real-time take at a fixed master size —
    // 1080p in the stage's orientation — whatever size the stage happens to be.
    const record = () => {
      if (recorder || !ready || typeof MediaRecorder === "undefined") return;
      const type = CODECS.find((m) => MediaRecorder.isTypeSupported(m));
      if (!type) return;
      const land = host.clientWidth >= host.clientHeight;
      engine.loop = false;
      engine.grain = 1;
      engine.resize(land ? 1920 : 1080, land ? 1080 : 1920, 1.5);
      const rec = new MediaRecorder(cv.captureStream(60), { mimeType: type, videoBitsPerSecond: 14_000_000 });
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        recorder = null;
        engine.loop = true;
        engine.grain = document.fullscreenElement === host ? 1 : INLINE_GRAIN;
        const url = URL.createObjectURL(new Blob(chunks, { type: type.split(";")[0] }));
        const a = document.createElement("a");
        a.href = url;
        a.download = `mida-showreel-${land ? "16x9" : "9x16"}.${type.includes("mp4") ? "mp4" : "webm"}`;
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
        if (!alive) return;
        host.classList.remove("is-exporting");
        setExporting(false);
        size();
        paint();
        auto();
      };
      recorder = rec;
      host.classList.add("is-exporting");
      setExporting(true);
      play(false);
      t = 0;
      paint();
      rec.start();
      play(true);
    };

    // While exporting, the transport is locked: the take has to run clean.
    api.current = {
      toggle: () => { if (ready && !recorder) { held = run; play(!run); } },
      restart: () => { if (ready && !recorder) { t = 0; held = false; play(true); paint(); } },
      seek: (to) => { if (ready && !recorder) { t = Math.max(0, Math.min(DUR - 0.001, to)); paint(); } },
      fullscreen: () => {
        if (document.fullscreenElement) document.exitFullscreen?.();
        else host.requestFullscreen?.().catch(() => { /* not allowed — ignore */ });
      },
      record,
      setLocale: (l) => {
        engine.setCopy(reelCopy(dictionaries[l], l));
        if (ready && !run) paint();
      },
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const a = api.current;
      if (!a) return;
      if (e.code === "Space") {
        if (e.target instanceof HTMLButtonElement) return;   // the button handles its own press
        e.preventDefault();
        a.toggle();
      } else if (e.key === "ArrowRight") a.seek(t + (e.shiftKey ? 0.5 : 1 / 60));
      else if (e.key === "ArrowLeft") a.seek(t - (e.shiftKey ? 0.5 : 1 / 60));
      else if (e.key === "r" || e.key === "R") a.restart();
      else if (e.key === "f" || e.key === "F") a.fullscreen();
      else return;
      wake();
    };
    const onScheme = () => {
      engine.setTheme(readTheme(host));
      if (ready && !run) paint();
    };
    const onFull = () => { if (!recorder) engine.grain = document.fullscreenElement === host ? 1 : INLINE_GRAIN; };
    const ro = new ResizeObserver(() => { size(); if (ready && !run) paint(); });

    (async () => {
      try {
        // Canvas text can only use faces that are already loaded.
        await Promise.race([document.fonts.load(`500 16px ${mono}`), new Promise((r) => setTimeout(r, 1500))]);
        await engine.load();
      } catch (err) {
        console.warn(err);
        return;
      }
      if (!alive) return;
      ready = true;
      size();
      ro.observe(host);
      io.observe(host);
      host.addEventListener("pointermove", wake);
      host.addEventListener("pointerdown", wake);
      host.addEventListener("pointerleave", leave);
      host.addEventListener("focusin", wake);
      host.addEventListener("keydown", onKey);
      scheme.addEventListener("change", onScheme);
      document.addEventListener("fullscreenchange", onFull);
      paint();
      host.classList.add("is-ready");
      setCan({
        exp: DEV && typeof MediaRecorder !== "undefined" && typeof cv.captureStream === "function" && CODECS.some((m) => MediaRecorder.isTypeSupported(m)),
        full: !!document.fullscreenEnabled,
      });
      // Let the canvas finish fading in over the poster before the dive begins.
      window.setTimeout(() => { if (alive) { primed = true; auto(); } }, 600);
    })();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(idleTimer);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", wake);
      host.removeEventListener("pointerdown", wake);
      host.removeEventListener("pointerleave", leave);
      host.removeEventListener("focusin", wake);
      host.removeEventListener("keydown", onKey);
      scheme.removeEventListener("change", onScheme);
      document.removeEventListener("fullscreenchange", onFull);
      host.classList.remove("is-ready", "is-idle", "is-exporting");
      api.current = null;
      const r = recorder as MediaRecorder | null;
      if (r && r.state !== "inactive") { r.onstop = null; r.stop(); }
      engine.dispose();
    };
  }, []);

  // The film speaks the page's language, and follows it when it changes.
  useEffect(() => { api.current?.setLocale(locale); }, [locale]);

  const scrub = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (e.type === "pointerdown") {
      try { el.setPointerCapture(e.pointerId); } catch { /* stale pointer — seek once, without dragging */ }
    } else if (!el.hasPointerCapture(e.pointerId)) return;
    const r = el.getBoundingClientRect();
    api.current?.seek(((e.clientX - r.left) / r.width) * DUR);
  };

  return (
    <>
      <canvas ref={canvas} className="reel-canvas" onClick={() => api.current?.toggle()} aria-hidden="true" />
      <div className="reel-bar">
        <div className="reel-track" onPointerDown={scrub} onPointerMove={scrub}>
          <span className="reel-fill" ref={fill} />
        </div>
        <div className="reel-ctl">
          <button type="button" onClick={() => api.current?.toggle()} disabled={exporting} aria-label={playing ? labels.pause : labels.play}>
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="4" width="5" height="16" rx="1.5" /><rect x="14" y="4" width="5" height="16" rx="1.5" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.6v14.8a1 1 0 0 0 1.5.86l12.3-7.4a1 1 0 0 0 0-1.72L8.5 3.74A1 1 0 0 0 7 4.6z" /></svg>
            )}
          </button>
          <button type="button" onClick={() => api.current?.restart()} disabled={exporting} aria-label={labels.restart}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7" /><polyline points="3 4 3 9 8 9" /></svg>
          </button>
          {exporting && <span className="reel-rec" aria-live="polite">Rec</span>}
          <span className="reel-clock num" ref={clock} aria-hidden="true" />
          {can.exp && (
            <button type="button" onClick={() => api.current?.record()} disabled={exporting} aria-label="Export video" title="Export a 1080p take (development only)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11" /><polyline points="7 11 12 16 17 11" /><line x1="5" y1="20" x2="19" y2="20" /></svg>
            </button>
          )}
          {can.full && (
            <button type="button" onClick={() => api.current?.fullscreen()} aria-label={labels.fullscreen}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
