"use client";

import { useRef, type ReactNode } from "react";

// 3D tilt-toward-cursor wrapper (React Bits "TiltedCard", adapted). Same
// pointer-math + rAF approach as MagneticButton — no library. Disabled on
// coarse pointers and under reduced motion, so touch/keyboard users get the
// static element.
export default function Tilt({
  children,
  className = "",
  max = 8,
  scale = 1.02,
}: {
  children: ReactNode;
  className?: string;
  max?: number;   // peak rotation in degrees
  scale?: number; // hover scale
}) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(hover: none)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.transform = `perspective(1000px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) scale(${scale})`;
    });
  };
  const onLeave = () => {
    const el = ref.current;
    cancelAnimationFrame(raf.current);
    if (el) el.style.transform = "";
  };

  return (
    <div ref={ref} className={"tilt" + (className ? " " + className : "")} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}
