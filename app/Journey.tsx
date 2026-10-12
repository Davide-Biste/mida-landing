"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Dictionary } from "./i18n/dictionaries";

// The page as a journey. Every section is a stop on one route, and a small
// coin — the one that falls through the film — marks where you are, rolling
// along the route as you scroll. Wide screens get the route as a rail on the
// left edge (labels on hover, and for a moment whenever a stop is reached);
// smaller ones fold it into a chip showing the current stop, which opens the
// list of stops. Either way there is always a "next stop" one tap away.
//
// Stops are plain anchors, so they work without JS and lean on the page's own
// smooth scroll. The scroll position is written straight to CSS variables —
// no React work per frame; state only changes when the stop does.

export type Stop = {
  /** id of the section this stop scrolls to. */
  id: string;
  label: string;
  /** Marks the stop as a sequence (the feature panels): ticks on the rail, "3/11" in the chip. */
  steps?: number;
};

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const pad = (n: number) => String(n).padStart(2, "0");

// The coin seen face-on: same gold, ink outline and crown as the brand mark.
const Coin = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10.6" fill="#F5D23E" stroke="#111" strokeWidth="1.9" />
    <path
      transform="translate(12 12.3) scale(0.043) translate(-257 -238)"
      d="M 132 320 Q 126 250 150 196 Q 184 232 214 258 Q 236 196 256 132 Q 278 198 300 256 Q 332 230 366 196 Q 388 252 382 320 Q 256 344 132 320 Z"
      fill="#F4D23C" stroke="#111" strokeWidth="26" strokeLinejoin="round"
    />
  </svg>
);

export default function Journey({ stops, t }: { stops: Stop[]; t: Dictionary["journey"] }) {
  const root = useRef<HTMLElement>(null);
  const [at, setAt] = useState(0);
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  // The effect only cares about which sections exist, not about their labels.
  const ids = stops.map((s) => s.id).join(",");

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const list = ids.split(",");
    const sections = list.map((id) => document.getElementById(id));
    const bar = document.querySelector<HTMLElement>("nav.top");
    const panels = document.getElementsByClassName("sc-panel");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, cur = -1, sub = -1, said = 0;

    const measure = () => {
      raf = 0;
      const vh = window.innerHeight, y = window.scrollY;
      // "You are here" sits 42% down the viewport — but rises from the very top,
      // so the route starts at zero instead of part-way down the first leg.
      const line = Math.min(vh * 0.42, y);
      const tops = sections.map((s) => (s ? s.getBoundingClientRect().top : Infinity));
      let i = 0;
      for (let k = 1; k < tops.length; k++) if (tops[k] <= line + 1) i = k;
      const last = tops.length - 1;
      const frac = i < last ? clamp01((line - tops[i]) / Math.max(1, tops[i + 1] - tops[i])) : 0;
      const p = (i + frac) / Math.max(1, last);
      el.style.setProperty("--p", p.toFixed(4));
      el.style.setProperty("--roll", reduce ? "0deg" : `${(p * 1440).toFixed(1)}deg`);
      const max = document.documentElement.scrollHeight - vh;
      bar?.style.setProperty("--journey", (max > 0 ? clamp01(y / max) : 0).toFixed(4));
      // Flags live in data attributes: React owns className and would wipe them.
      el.toggleAttribute("data-seen", y > 80);

      if (i !== cur) {
        cur = i;
        setAt(i);
        document.documentElement.dataset.stop = list[i];
        // Announce the stop: its label shows by the rail for a moment.
        el.setAttribute("data-announce", "");
        window.clearTimeout(said);
        said = window.setTimeout(() => el.removeAttribute("data-announce"), 2000);
      }
      // Inside the feature panels, count which one is on screen.
      let k = 0;
      if (list[i] === "features") for (let n = 0; n < panels.length; n++) if (panels[n].getBoundingClientRect().top <= vh * 0.5) k = n + 1;
      if (k !== sub) { sub = k; setStep(k); }
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(measure); };

    queue();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(said);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      bar?.style.removeProperty("--journey");
      el.removeAttribute("data-seen");
      el.removeAttribute("data-announce");
      delete document.documentElement.dataset.stop;
    };
  }, [ids]);

  // Chip menu: close on outside press or Escape, like the language menu.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const now = stops[at] ?? stops[0];
  const next = stops[at + 1];

  return (
    <nav className={"journey" + (open ? " is-open" : "")} ref={root} aria-label={t.label} style={{ "--n": stops.length } as CSSProperties}>
      <button type="button" className="j-chip" aria-expanded={open} aria-controls="journey-stops" aria-label={`${t.label}: ${now.label}`} onClick={() => setOpen((o) => !o)}>
        <span className="j-chip-coin"><Coin /></span>
        <span className="j-num">{pad(at)}</span>
        <span className="j-chip-name">{now.label}</span>
        {now.steps && step > 0 ? <span className="j-chip-step">{step}/{now.steps}</span> : null}
        <svg className="j-caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 15 12 9 18 15" /></svg>
      </button>

      <div className="j-map" id="journey-stops">
        <span className="j-fill" aria-hidden="true" />
        <span className="j-coin" aria-hidden="true"><Coin /></span>
        <ol className="j-route">
          {stops.map((s, i) => (
            <li key={s.id} className={"j-stop" + (i < at ? " is-done" : i === at ? " is-now" : "")}>
              <a href={"#" + s.id} aria-current={i === at ? "step" : undefined} onClick={() => setOpen(false)}>
                <span className="j-node" />
                <span className="j-tag"><span className="j-num">{pad(i)}</span>{s.label}</span>
              </a>
              {s.steps ? (
                <span className="j-ticks" aria-hidden="true">
                  {Array.from({ length: s.steps - 1 }, (_, k) => (
                    <i key={k} style={{ top: `${50 + ((k + 1) / s.steps!) * 100}%` }} />
                  ))}
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      {next && (
        <a className="j-next" href={"#" + next.id} aria-label={`${t.next}: ${next.label}`} onClick={() => setOpen(false)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="6 13 12 19 18 13" /></svg>
          <span className="j-tag" aria-hidden="true"><span className="j-num">{t.next}</span>{next.label}</span>
        </a>
      )}
    </nav>
  );
}
