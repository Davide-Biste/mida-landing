"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";

// Decorative brand coins scattered down the page, sitting behind all content
// (z-index:-1) so they peek through the transparent sections.
//
// The field is generated on the client (in an effect, so the server renders
// nothing and there is no hydration mismatch from Math.random). Each coin gets
// a randomized position, size and a unique two-waypoint drift path fed into the
// `coinDrift` keyframe through CSS custom properties — so every coin wanders on
// its own track instead of bobbing in place.
type Coin = {
  top: number; // % of page height
  left: number; // % of page width
  size: number; // px
  opacity: number;
  duration: number; // s
  delay: number; // s — negative so coins start mid-cycle (desynchronised)
  r0: number; // resting rotation (deg)
  x1: number; y1: number; r1: number; // first drift waypoint
  x2: number; y2: number; r2: number; // second drift waypoint
  hideMobile: boolean;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

// One randomized coin pinned to a vertical band, hugging the left or right edge
// so the field frames the content instead of sitting behind body copy.
function makeCoin(top: number, side: "l" | "r"): Coin {
  const size = Math.round(rand(26, 58));
  const edge = rand(2, 16); // distance from the chosen edge, in %
  return {
    top,
    left: side === "l" ? edge : 100 - edge,
    size,
    opacity: rand(0.26, 0.46),
    duration: rand(12, 20),
    delay: -rand(0, 20),
    r0: rand(-12, 12),
    x1: rand(-45, 45), y1: rand(-60, 60), r1: rand(-20, 20),
    x2: rand(-45, 45), y2: rand(-60, 60), r2: rand(-20, 20),
    hideMobile: size < 36 || Math.random() < 0.4,
  };
}

// Spread `count` coins into even vertical bands (jittered) alternating sides.
function buildField(count: number): Coin[] {
  return Array.from({ length: count }, (_, i) => {
    const band = ((i + 0.5) / count) * 90 + 3; // ~3% … ~93%
    const top = Math.max(2, Math.min(95, band + rand(-3.5, 3.5)));
    return makeCoin(top, i % 2 === 0 ? "l" : "r");
  });
}

export default function Coins() {
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    setCoins(buildField(16));
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
              "--x1": `${c.x1}px`,
              "--y1": `${c.y1}px`,
              "--r1": `${c.r1}deg`,
              "--x2": `${c.x2}px`,
              "--y2": `${c.y2}px`,
              "--r2": `${c.r2}deg`,
            } as CSSProperties
          }
        >
          <Image src="/assets/mida.svg" alt="" width={c.size} height={c.size} />
        </span>
      ))}
    </div>
  );
}
