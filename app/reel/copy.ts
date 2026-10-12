import type { Dictionary } from "../i18n/dictionaries";

// Every headline in the reel is the landing's own copy, pulled from the same
// dictionaries so the film follows the site's language (it / en / es).
export type ReelCopy = {
  /** "Personal finance." split per line, full stop removed (the coin is the dot). */
  titleA: string[];
  titleB: string;
  descA: string;
  pills: string;
  numbers: string[];
  numbersEyebrow: string;
  feats: { word: string; caption: string }[];
  palettes: string[];
  paletteCaption: string;
  privacy: string[];
  tagline: [string, string];
  price: string;
  free: string;
  store: string;
  /** Income / expenses of the month shown on the stats screen, formatted for the locale. */
  flows: [string, string];
  /** Slate names for the running HUD, one per shot. */
  shots: string[];
};

const caps = (s: string) => s.toUpperCase().replace(/IPHONE/g, "iPHONE");
const noStop = (s: string) => s.replace(/\.\s*$/, "");

export function reelCopy(d: Dictionary, locale: string): ReelCopy {
  const eur = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" });
  return {
    titleA: noStop(d.hero.titleTop).split(" "),
    titleB: noStop(d.hero.titleEm),
    descA: caps(noStop(d.metadata.description.split(". ")[0])),
    pills: d.privacy.pills.map(caps).join("   ·   "),
    numbers: d.kpi.title,
    numbersEyebrow: caps(d.kpi.eyebrow),
    feats: [d.multi, d.budget, d.projection].map((f) => ({ word: f.eyebrow + ".", caption: f.title.join(" ") })),
    palettes: d.palette.tiles.map((p) => p.name + "."),
    paletteCaption: caps(noStop(d.palette.lede.split(/[.,]/)[0])),
    privacy: [d.privacy.title[0], d.privacy.title[1], noStop(d.privacy.title[2])],
    tagline: [d.hero.titleTop, d.hero.titleEm],
    price: caps(d.free.price),
    free: caps(d.free.title),
    store: caps(d.free.ctaStore),
    flows: ["+" + eur.format(2496.4), "−" + eur.format(2491.99)],
    shots: [
      "DROP", caps(noStop(d.hero.titleTop)), caps(noStop(d.hero.titleEm)), caps(d.kpi.eyebrow),
      caps(d.multi.eyebrow), caps(d.budget.eyebrow), caps(d.projection.eyebrow), caps(d.palette.eyebrow), caps(d.nav.privacy),
    ],
  };
}
