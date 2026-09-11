"use client";

import { useEffect, useRef, useState } from "react";
import { Phone } from "./ui";

export type ColorTile = { name: string; desc: string; src: string; alt: string; palette: string[] };

// Auto-advancing coverflow. Each unique colourway is rendered exactly once and
// positioned relative to the active one via a wrap-aware offset (never
// duplicated on screen). Side phones are clickable, and you can swipe / drag
// left-right to change. Pauses while interacting; dots jump.
export default function ColorCarousel({ tiles }: { tiles: ColorTile[] }) {
  const n = tiles.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = () => setActive((a) => (a + 1) % n);
  const prev = () => setActive((a) => (a - 1 + n) % n);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActive((a) => (a + 1) % n), 3400);
    return () => clearInterval(id);
  }, [paused, n]);

  // Shortest circular offset from the active slide, in [-n/2, n/2].
  const offset = (i: number) => {
    let r = i - active;
    if (r > n / 2) r -= n;
    if (r < -n / 2) r += n;
    return r;
  };

  // Pointer swipe / drag.
  const startX = useRef<number | null>(null);
  const dragged = useRef(false);
  const onPointerDown = (e: React.PointerEvent) => { startX.current = e.clientX; dragged.current = false; setPaused(true); };
  const onPointerMove = (e: React.PointerEvent) => {
    if (startX.current != null && Math.abs(e.clientX - startX.current) > 8) dragged.current = true;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (startX.current != null) {
      const dx = e.clientX - startX.current;
      if (dx < -45) next();
      else if (dx > 45) prev();
    }
    startX.current = null;
  };

  const activeTile = tiles[active];

  return (
    <div
      className="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { setPaused(false); startX.current = null; }}
    >
      <div
        className="carousel-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ touchAction: "pan-y" }}
      >
        {tiles.map((t, i) => {
          const r = offset(i);
          const abs = Math.abs(r);
          const clickable = abs === 1;
          return (
            <div
              key={t.src}
              className="carousel-item"
              aria-hidden={r !== 0 || undefined}
              onClick={() => { if (!dragged.current && clickable) setActive(i); }}
              style={{
                transform: `translateX(${r * 56}%) scale(${r === 0 ? 1 : 0.72})`,
                opacity: abs > 1 ? 0 : r === 0 ? 1 : 0.4,
                zIndex: 10 - abs,
                pointerEvents: abs > 1 ? "none" : "auto",
                cursor: clickable ? "pointer" : "default",
              }}
            >
              <Phone lg src={t.src} alt={r === 0 ? t.alt : ""} />
            </div>
          );
        })}
      </div>

      <div className="carousel-meta" key={activeTile.src}>
        <div className="swatches">
          {activeTile.palette.map((c, j) => (<span key={j} className="sw" style={{ background: c }} />))}
        </div>
        <div className="pname">{activeTile.name}</div>
        <div className="desc">{activeTile.desc}</div>
      </div>

      <div className="carousel-dots">
        {tiles.map((t, i) => (
          <button
            key={t.src}
            className={"c-dot" + (i === active ? " on" : "")}
            aria-label={t.name}
            aria-current={i === active || undefined}
            onClick={() => setActive(i)}
          />
        ))}
      </div>
    </div>
  );
}
