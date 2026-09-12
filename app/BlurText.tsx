"use client";

import { Fragment, useEffect, useRef, useState } from "react";

// Word-by-word blur-in for headings (React Bits "BlurText", adapted to the
// project's vanilla idiom). `trigger="mount"` fires once on load (hero, above
// the fold); `trigger="view"` fires when the heading scrolls in, like Reveal.
// `text` may be an array — each entry becomes its own line (<br/>) while the
// stagger keeps running across lines. Reduced motion shows it instantly.
type Props = {
  text: string | string[];
  className?: string;
  delay?: number;   // ms before the first word starts
  stagger?: number; // ms between words
  trigger?: "mount" | "view";
};

export default function BlurText({ text, className = "", delay = 0, stagger = 90, trigger = "mount" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setOn(true); return; }

    if (trigger === "view") {
      const el = ref.current;
      if (!el || typeof IntersectionObserver === "undefined") { setOn(true); return; }
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) { setOn(true); io.unobserve(el); } }),
        { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
      );
      io.observe(el);
      return () => io.disconnect();
    }

    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, [trigger]);

  const linesArr = Array.isArray(text) ? text : [text];
  let wi = 0; // running word index, so the stagger is continuous across lines

  return (
    <span ref={ref} className={"blur-text" + (on ? " on" : "") + (className ? " " + className : "")}>
      {linesArr.map((line, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {line.split(" ").map((w, i, arr) => {
            const idx = wi++;
            return (
              <Fragment key={i}>
                <span className="blur-word" style={{ transitionDelay: `${delay + idx * stagger}ms` }}>{w}</span>
                {i < arr.length - 1 ? " " : ""}
              </Fragment>
            );
          })}
        </Fragment>
      ))}
    </span>
  );
}
