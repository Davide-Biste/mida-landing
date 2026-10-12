"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { asset } from "./ui";
import type { Dictionary, Locale } from "./i18n/dictionaries";

// Mida's 18-second film, inline: the coin falls out of the app icon, through
// the app, and back into it — rendered live in WebGL (see ./reel).
//
// The film is heavy next to the rest of the page (a WebGL context plus eight
// screenshots as textures), so none of it loads until the stage is about to
// scroll into view. Until then — and for good where WebGL 2 is missing — the
// stage is a plain poster matching the film's opening frame: icon and wordmark
// on the same tile colour as the page's other cards.
const Player = dynamic(() => import("./reel/Player"), { ssr: false });

export default function Reel({ locale, t }: { locale: Locale; t: Dictionary["film"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setNear(true));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) { setNear(true); io.disconnect(); } },
      { rootMargin: "900px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="reel" ref={ref} tabIndex={0} role="group" aria-label={t.eyebrow}>
      <div className="reel-poster" aria-hidden="true">
        <Image src={asset("/assets/icon.png")} alt="" width={256} height={256} />
        <span>Mida</span>
      </div>
      {near && <Player locale={locale} labels={t} />}
    </div>
  );
}
