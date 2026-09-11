"use client";

import { useRef, type ReactNode } from "react";

// Primary CTA that leans toward the cursor. Pure pointer math + rAF writing to
// style.transform — no scroll listeners, no libraries. Disabled on coarse
// pointers and under reduced motion.
export default function MagneticButton({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const raf = useRef(0);

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(hover: none)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * 0.3;
    const y = (e.clientY - (r.top + r.height / 2)) * 0.45;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => { el.style.transform = `translate(${x}px, ${y}px)`; });
  };
  const onLeave = () => {
    const el = ref.current;
    cancelAnimationFrame(raf.current);
    if (el) el.style.transform = "";
  };

  return (
    <a ref={ref} href={href} className={className} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </a>
  );
}
