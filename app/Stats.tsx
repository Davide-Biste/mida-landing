"use client";

import { useEffect, useRef, useState } from "react";

export type StatItem = { value: number; suffix: string; label: string };

function Stat({ item }: { item: StatItem }) {
  const ref = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || item.value === 0) { setN(item.value); return; }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const dur = 1400;
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          setN(Math.round(item.value * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });

    io.observe(el);
    return () => io.disconnect();
  }, [item.value]);

  return (
    <div className="stat" ref={ref}>
      <div className="stat-num num">{n}{item.suffix}</div>
      <div className="stat-lab">{item.label}</div>
    </div>
  );
}

export default function Stats({ items }: { items: StatItem[] }) {
  return (
    <section className="stats section-pad band">
      <div className="container stats-grid">
        {items.map((it) => (<Stat key={it.label} item={it} />))}
      </div>
    </section>
  );
}
