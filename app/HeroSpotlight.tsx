"use client";

import { useEffect, useRef } from "react";

// A soft brand glow that follows the cursor inside the hero, making the first
// screen feel alive. Same rAF + CSS-var approach as MagneticButton/Tilt — no
// library. Attaches to its parent (.hero); disabled on touch and reduced motion,
// where the glow simply stays hidden (--ho: 0).
export default function HeroSpotlight() {
  const ref = useRef<HTMLSpanElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const el = ref.current;
    const hero = el?.parentElement;
    if (!el || !hero) return;
    if (window.matchMedia("(hover: none)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        el.style.setProperty("--hx", `${x}%`);
        el.style.setProperty("--hy", `${y}%`);
        el.style.setProperty("--ho", "1");
      });
    };
    const onLeave = () => el.style.setProperty("--ho", "0");

    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", onLeave);
    return () => {
      hero.removeEventListener("mousemove", onMove);
      hero.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return <span ref={ref} className="hero-cursor-glow" aria-hidden="true" />;
}
