import type { ReactNode } from "react";
import { Iphone } from "@/registry/magicui/iphone";

// Pure, hook-free presentational components shared by server sections and the
// client motion islands.

export type IconName =
  | "shield" | "lock" | "check" | "apple" | "coffee" | "cloud-off"
  | "scan" | "repeat" | "trending" | "users" | "tag" | "globe" | "search";

export const Icon = ({ name, size = 22, stroke = 1.6 }: { name: IconName; size?: number; stroke?: number }) => {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: stroke,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "shield":
      return (<svg {...p}><path d="M12 2l9 4v6c0 5-4 9-9 11-5-2-9-6-9-11V6l9-4z" /><path d="M9 12l2 2 4-4" /></svg>);
    case "lock":
      return (<svg {...p}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
    case "check":
      return (<svg {...p}><polyline points="20 6 9 17 4 12" /></svg>);
    case "apple":
      return (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>);
    case "coffee":
      return (<svg {...p}><path d="M17 8h1a4 4 0 0 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" /><line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" /></svg>);
    case "cloud-off":
      return (<svg {...p}><path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5l14 14" /><path d="M2 13a4.5 4.5 0 0 0 6.5 4.5" /></svg>);
    case "scan":
      return (<svg {...p}><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><line x1="7" y1="12" x2="17" y2="12" /></svg>);
    case "repeat":
      return (<svg {...p}><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>);
    case "trending":
      return (<svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>);
    case "users":
      return (<svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>);
    case "tag":
      return (<svg {...p}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>);
    case "globe":
      return (<svg {...p}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>);
    case "search":
      return (<svg {...p}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
  }
};

// Prefix a public asset path with the deploy base path (empty locally, e.g.
// "/mida-landing" on GitHub Pages). Needed because neither the raw SVG <image
// href> in the iPhone mockup nor next/image (in static export) apply basePath
// on their own.
export const asset = (p: string) => (process.env.NEXT_PUBLIC_BASE_PATH || "") + p;

// A slow light sheen sweeping across brand-coloured label text (React Bits
// "ShinyText", adapted to CSS-only). The glint lives in globals.css; under
// reduced motion it falls back to a solid brand-ink fill.
export const ShinyText = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <span className={"shiny-text" + (className ? " " + className : "")}>{children}</span>
);

export const Phone = ({ lg = false, src, alt = "", className = "" }: { lg?: boolean; src?: string; alt?: string; className?: string }) => (
  <div className={"phone-mock" + (lg ? " lg" : "") + (className ? " " + className : "")}>
    <Iphone src={src ? asset(src) : src} className="iphone-svg" role="img" aria-label={alt || undefined} aria-hidden={alt ? undefined : true} />
  </div>
);
