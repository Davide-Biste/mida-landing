"use client";

import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import Coins from "./Coins";
import Showcase, { type Step } from "./Showcase";
import Stats from "./Stats";
import ColorCarousel, { type ColorTile } from "./ColorCarousel";
import { Icon, Phone, asset, type IconName } from "./ui";
import { dictionaries, defaultLocale, locales, type Dictionary, type Locale } from "./i18n/dictionaries";

const lines = (items: string[]) =>
  items.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ));

const capIcons: IconName[] = ["scan", "repeat", "trending", "users", "tag", "globe"];

// The app's four real colour families, each with a matching screenshot.
const paletteVisuals: { src: string; altKey: keyof Dictionary["alts"]; palette: string[] }[] = [
  { src: "/screens/red.png", altKey: "paletteEnergia", palette: ["#E5614C", "#D63E55", "#C04A8E", "#E68642", "#E5B23C"] },
  { src: "/screens/purple.png", altKey: "paletteCalma", palette: ["#9583C4", "#7B7AC2", "#D88AA0", "#E8A789", "#B084A8"] },
  { src: "/screens/home.png", altKey: "paletteNatura", palette: ["#3B9669", "#2C5F3F", "#8AAE3F", "#4FA890", "#7C9982"] },
  { src: "/screens/blue.png", altKey: "paletteNotte", palette: ["#3B6CC9", "#4658B8", "#2A7A9E", "#27324D", "#4C5A6B"] },
];

const privacyPills: { icon: IconName; size: number; stroke: number }[] = [
  { icon: "check", size: 15, stroke: 2.4 },
  { icon: "cloud-off", size: 15, stroke: 1.8 },
  { icon: "lock", size: 15, stroke: 1.8 },
  { icon: "check", size: 15, stroke: 2.4 },
];

export default function Home() {
  // Static export can't detect language on the server, so do it on the client:
  // a saved choice wins, otherwise the browser language (falls back to default).
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  useEffect(() => {
    try {
      const stored = localStorage.getItem("mida-locale");
      if (stored && (locales as readonly string[]).includes(stored)) { setLocale(stored as Locale); return; }
      const nav = navigator.language?.slice(0, 2).toLowerCase();
      if (nav && (locales as readonly string[]).includes(nav)) setLocale(nav as Locale);
    } catch { /* storage/navigator unavailable — keep default */ }
  }, []);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);

  const t = dictionaries[locale];

  const steps: Step[] = [
    { src: "/screens/wallets.png", alt: t.alts.walletsHero, title: t.multi.title.join(" "), body: t.multi.body },
    { src: "/screens/transfer.png", alt: t.alts.transfer, title: t.transfer.title.join(" "), body: t.transfer.body },
    { src: "/screens/charts.png", alt: t.alts.charts, title: t.kpi.title.join(" "), body: t.kpi.body },
    { src: "/screens/budgets.png", alt: t.alts.budgetsHero, title: t.budget.title.join(" "), body: t.budget.body },
    { src: "/screens/new-transactions.png", alt: t.alts.add, title: t.add.title.join(" "), body: t.add.body },
  ];

  const colorTiles: ColorTile[] = t.palette.tiles.map((tile, i) => ({
    name: tile.name,
    desc: tile.desc,
    src: paletteVisuals[i].src,
    alt: t.alts[paletteVisuals[i].altKey],
    palette: paletteVisuals[i].palette,
  }));

  return (
    <div className="page">
      <Coins />

      <nav className="top">
        <div className="nav-inner">
          <a className="logo" href="#top">
            <span className="logo-mark">
              <Image src={asset("/assets/mida.svg")} alt="" width={24} height={24} priority />
            </span>
            Mida
          </a>
          <div className="nav-links">
            <a href="#features">{t.nav.features}</a>
            <a href="#privacy">{t.nav.privacy}</a>
            <Link href="/support">{t.nav.support}</Link>
            <div className="lang-switch" role="group" aria-label="Lingua / Language">
              {locales.map((l) => (
                <button
                  key={l}
                  type="button"
                  className={"lang-opt" + (l === locale ? " on" : "")}
                  aria-pressed={l === locale}
                  onClick={() => {
                    setLocale(l);
                    try { localStorage.setItem("mida-locale", l); } catch { /* ignore */ }
                  }}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <a href="#download" className="nav-cta">{t.nav.download}</a>
          </div>
        </div>
      </nav>

      <header className="hero section-pad" id="top">
        <div className="container">
          <span className="badge hero-anim"><span className="dot" /> {t.hero.badge}</span>
          <h1 className="display h-massive hero-copy hero-anim d1">
            {t.hero.titleTop}
            <br />
            <span className="accent">{t.hero.titleEm}</span>
          </h1>
          <p className="lede hero-anim d2">{t.hero.lede}</p>
          <div className="hero-cta hero-anim d3">
            <span className="btn btn-soon" aria-disabled="true">
              <Icon name="apple" size={17} /> {t.hero.ctaPrimary}
            </span>
            <a href="#features" className="text-link">{t.hero.ctaSecondary}</a>
          </div>
          <div className="hero-art hero-anim d4">
            <span className="hero-glow" aria-hidden="true" />
            <Phone lg src="/screens/home.png" alt={t.alts.home} className="hero-phone" />
          </div>
        </div>
      </header>

      <Showcase steps={steps} heading={t.overview.title.join(" ")} />

      <Stats items={t.stats} />

      {/* Everything else — capabilities grid */}
      <section className="section-pad">
        <div className="container">
          <Reveal variant="up" className="sec-head">
            <h2 className="display h-large">{t.features.title}</h2>
          </Reveal>
          <Reveal variant="up" className="caps" delay={80}>
            {t.features.cards.map((card, i) => (
              <div className="cap stagger" key={i}>
                <span className="cap-ico"><Icon name={capIcons[i]} size={24} /></span>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Colourways — auto marquee */}
      <section className="section-pad band">
        <div className="container">
          <Reveal variant="up" className="sec-head">
            <div className="eyebrow">{t.palette.eyebrow}</div>
            <h2 className="display h-large">{t.palette.title}</h2>
            <p className="lede">{t.palette.lede}</p>
          </Reveal>
        </div>
        <ColorCarousel tiles={colorTiles} />
      </section>

      {/* Privacy — centred statement */}
      <section className="privacy section-pad" id="privacy">
        <div className="container">
          <div className="privacy-inner">
            <Reveal variant="scale">
              <div className="privacy-glyph"><Icon name="shield" size={44} stroke={1.5} /></div>
            </Reveal>
            <Reveal variant="up" delay={100}>
              <div className="eyebrow">{t.privacy.eyebrow}</div>
              <h2 className="display h-large">{lines(t.privacy.title)}</h2>
              <p className="lede">{t.privacy.body}</p>
            </Reveal>
            <Reveal variant="up" className="privacy-pills" delay={180}>
              {t.privacy.pills.map((label, i) => (
                <span className="privacy-pill stagger" key={i}>
                  <Icon name={privacyPills[i].icon} size={privacyPills[i].size} stroke={privacyPills[i].stroke} /> {label}
                </span>
              ))}
            </Reveal>
            <Reveal variant="up" delay={260}>
              <Link href="/privacy" className="text-link">{t.privacy.link}</Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Download */}
      <section className="download section-pad band" id="download">
        <div className="container">
          <Reveal variant="scale" className="download-inner">
            <div className="download-icon">
              <Image src={asset("/assets/icon.png")} alt="" width={128} height={128} />
            </div>
            <div className="price-strike">{t.free.price}</div>
            <h2 className="display h-large">{t.free.title}</h2>
            <p className="lede mute">{t.free.lede}</p>
            <div className="download-ctas">
              <span className="btn btn-soon" aria-disabled="true">
                <Icon name="apple" size={17} /> {t.free.ctaStore}
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <footer>
        <div className="container footer-grid">
          <div className="footer-brand">
            <Image src={asset("/assets/mida.svg")} alt="" width={20} height={20} />
            {t.footer.brand}
          </div>
          <div className="footer-links">
            <Link href="/privacy">{t.footer.links.privacy}</Link>
            <Link href="/terms">{t.footer.links.terms}</Link>
            <Link href="/support">{t.footer.links.support}</Link>
            <a href="#">{t.footer.links.store}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
