"use client";

import { Fragment, useEffect, useState } from "react";

// Word-by-word blur-in for headings (React Bits "BlurText", adapted to the
// project's vanilla idiom). Animates on mount via a single rAF — no library,
// no IntersectionObserver, since headings using it are above the fold. Each
// word clears its blur/offset on a stagger; reduced motion shows it instantly.
type Props = {
  text: string;
  className?: string;
  delay?: number;   // ms before the first word starts
  stagger?: number; // ms between words
};

export default function BlurText({ text, className = "", delay = 0, stagger = 90 }: Props) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setOn(true); return; }
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const words = text.split(" ");

  return (
    <span className={"blur-text" + (on ? " on" : "") + (className ? " " + className : "")}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="blur-word" style={{ transitionDelay: `${delay + i * stagger}ms` }}>
            {w}
          </span>
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </span>
  );
}
