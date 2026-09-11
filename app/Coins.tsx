"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";

// Decorative Mida coins scattered down the page, sitting behind all content
// so they peek through between the sections. Generated on the client (in an
// effect) so the server renders nothing and there is no hydration mismatch
// from Math.random. Each coin gets a randomized position, size and a unique
// two-waypoint drift path fed to the `coinDrift` keyframe via CSS variables.
type Coin = {
  top: number; left: number; size: number; opacity: number;
  duration: number; delay: number; r0: number;
  x1: number; y1: number; r1: number;
  x2: number; y2: number; r2: number;
  hideMobile: boolean;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function makeCoin(top: number, side: "l" | "r"): Coin {
  const size = Math.round(rand(24, 54));
  const edge = rand(1, 13);
  return {
    top,
    left: side === "l" ? edge : 100 - edge,
    size,
    opacity: rand(0.5, 0.9),
    duration: rand(13, 22),
    delay: -rand(0, 22),
    r0: rand(-12, 12),
    x1: rand(-40, 40), y1: rand(-55, 55), r1: rand(-20, 20),
    x2: rand(-40, 40), y2: rand(-55, 55), r2: rand(-20, 20),
    hideMobile: size < 34 || Math.random() < 0.45,
  };
}

function buildField(count: number): Coin[] {
  return Array.from({ length: count }, (_, i) => {
    const band = ((i + 0.5) / count) * 92 + 2;
    const top = Math.max(1, Math.min(96, band + rand(-3.5, 3.5)));
    return makeCoin(top, i % 2 === 0 ? "l" : "r");
  });
}

export default function Coins() {
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    setCoins(buildField(100));
  }, []);

  return (
    <div className="page-coins" aria-hidden="true">
      {coins.map((c, i) => (
        <span
          key={i}
          className={"coin" + (c.hideMobile ? " hide-mobile" : "")}
          style={
            {
              top: `${c.top}%`,
              left: `${c.left}%`,
              width: c.size,
              opacity: c.opacity,
              animationDuration: `${c.duration}s`,
              animationDelay: `${c.delay}s`,
              "--r0": `${c.r0}deg`,
              "--x1": `${c.x1}px`, "--y1": `${c.y1}px`, "--r1": `${c.r1}deg`,
              "--x2": `${c.x2}px`, "--y2": `${c.y2}px`, "--r2": `${c.r2}deg`,
            } as CSSProperties
          }
        >
          <Image src="/assets/mida.svg" alt="" width={c.size} height={c.size} />
        </span>
      ))}
    </div>
  );
}
