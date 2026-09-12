"use client";

import type { ReactNode } from "react";

// Cursor-follow spotlight glow (React Bits "SpotlightCard", adapted). Writes
// the pointer position into CSS vars the ::before overlay reads — the glow
// itself lives in globals.css and simply doesn't show on touch (no hover).
export default function SpotlightCard({ className = "", children }: { className?: string; children: ReactNode }) {
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div className={"spotlight" + (className ? " " + className : "")} onMouseMove={onMove}>
      {children}
    </div>
  );
}
