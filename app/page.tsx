"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import Coins from "./Coins";
import Showcase, { type Step } from "./Showcase";
import Stats from "./Stats";
import ColorCarousel, { type ColorTile } from "./ColorCarousel";
import BlurText from "./BlurText";
import SpotlightCard from "./SpotlightCard";
import HeroSpotlight from "./HeroSpotlight";
import Roadmap from "./Roadmap";
import { DONATE_URL, Flag, Icon, Phone, ShinyText, asset, type IconName } from "./ui";
import { dictionaries, defaultLocale, locales, localeNames, type Dictionary, type Locale } from "./i18n/dictionaries";

const capIcons: IconName[] = ["scan", "card", "face", "tag", "grid", "globe"];

// The app's four real colour families, each with a matching screenshot.
const paletteVisuals: { src: string; altKey: keyof Dictionary["alts"]; palette: string[] }[] = [
  { src: "/screens/palette-energy.jpg", altKey: "paletteEnergia", palette: ["#E5614C", "#D63E55", "#C04A8E", "#E68642", "#E5B23C"] },
  { src: "/screens/palette-calm.jpg", altKey: "paletteCalma", palette: ["#9583C4", "#7B7AC2", "#D88AA0", "#E8A789", "#B084A8"] },
  { src: "/screens/palette-nature.jpg", altKey: "paletteNatura", palette: ["#3B9669", "#2C5F3F", "#8AAE3F", "#4FA890", "#7C9982"] },
  { src: "/screens/palette-night.jpg", altKey: "paletteNotte", palette: ["#3B6CC9", "#4658B8", "#2A7A9E", "#27324D", "#4C5A6B"] },
];

// "And there's more" gallery — one phone per item, same order as t.more.items.
const moreVisuals: { src: string; altKey: keyof Dictionary["alts"] }[] = [
  { src: "/screens/split.jpg", altKey: "split" },
  { src: "/screens/map.jpg", altKey: "map" },
  { src: "/screens/notifications.jpg", altKey: "notifications" },
  { src: "/screens/home-dark.jpg", altKey: "dark" },
];

const privacyPills: { icon: IconName; size: number; stroke: number }[] = [
  { icon: "check", size: 15, stroke: 2.4 },
  { icon: "cloud-off", size: 15, stroke: 1.8 },
  { icon: "lock", size: 15, stroke: 1.8 },
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

  // Language menu: a flag button that opens a dropdown of the shipped locales.
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!langOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!langRef.current?.contains(e.target as Node)) setLangOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLangOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [langOpen]);
  const chooseLocale = (l: Locale) => {
    setLocale(l);
    setLangOpen(false);
    try { localStorage.setItem("mida-locale", l); } catch { /* ignore */ }
  };

  // "Back to top" button — appears once the hero is scrolled well out of view.
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const t = dictionaries[locale];

  const steps: Step[] = [
    { src: "/screens/wallets.jpg", srcDark: "/screens/wallets-dark.jpg", alt: t.alts.walletsHero, eyebrow: t.multi.eyebrow, title: t.multi.title.join(" "), body: t.multi.body },
    { src: "/screens/card.jpg", alt: t.alts.cards, eyebrow: t.cards.eyebrow, title: t.cards.title.join(" "), body: t.cards.body },
    { src: "/screens/add.jpg", srcDark: "/screens/add-dark.jpg", alt: t.alts.add, eyebrow: t.add.eyebrow, title: t.add.title.join(" "), body: t.add.body },
    { src: "/screens/payments.jpg", alt: t.alts.autopay, eyebrow: t.autopay.eyebrow, title: t.autopay.title.join(" "), body: t.autopay.body },
    { src: "/screens/import.jpg", alt: t.alts.importCsv, eyebrow: t.importCsv.eyebrow, title: t.importCsv.title.join(" "), body: t.importCsv.body },
    { src: "/screens/analytics.jpg", srcDark: "/screens/analytics-dark.jpg", alt: t.alts.charts, eyebrow: t.kpi.eyebrow, title: t.kpi.title.join(" "), body: t.kpi.body },
    { src: "/screens/budgets.jpg", srcDark: "/screens/budgets-dark.jpg", alt: t.alts.budgetsHero, eyebrow: t.budget.eyebrow, title: t.budget.title.join(" "), body: t.budget.body },
    { src: "/screens/widgets.jpg", alt: t.alts.widgets, eyebrow: t.widgets.eyebrow, title: t.widgets.title.join(" "), body: t.widgets.body },
    { src: "/screens/projection.jpg", alt: t.alts.projection, eyebrow: t.projection.eyebrow, title: t.projection.title.join(" "), body: t.projection.body },
    { src: "/screens/recurring.jpg", alt: t.alts.recurring, eyebrow: t.recurring.eyebrow, title: t.recurring.title.join(" "), body: t.recurring.body },
    { src: "/screens/transfers.jpg", alt: t.alts.transfer, eyebrow: t.transfer.eyebrow, title: t.transfer.title.join(" "), body: t.transfer.body },
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
              <Image src={asset("/assets/icon.png")} alt="" width={24} height={24} priority />
            </span>
            Mida
          </a>
          <div className="nav-links">
            <a href="#features">{t.nav.features}</a>
            <a href="#privacy">{t.nav.privacy}</a>
            <a href="#roadmap">{t.nav.roadmap}</a>
            <Link href="/support">{t.nav.support}</Link>
            <div className="lang-menu" ref={langRef}>
              <button
                type="button"
                className="lang-btn"
                aria-haspopup="menu"
                aria-expanded={langOpen}
                aria-label={localeNames[locale]}
                onClick={() => setLangOpen((o) => !o)}
              >
                <Flag code={locale} />
                <svg className="lang-caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              {langOpen && (
                <ul className="lang-pop" role="menu" aria-label="Lingua / Language / Idioma">
                  {locales.map((l) => (
                    <li key={l} role="none">
                      <button
                        type="button"
                        role="menuitemradio"
                        aria-checked={l === locale}
                        className={"lang-item" + (l === locale ? " on" : "")}
                        onClick={() => chooseLocale(l)}
                      >
                        <Flag code={l} />
                        <span>{localeNames[l]}</span>
                        {l === locale && (
                          <svg className="lang-check" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <a href="#download" className="nav-cta">{t.nav.download}</a>
          </div>
        </div>
      </nav>

      <header className="hero section-pad" id="top">
        <span className="hero-aurora" aria-hidden="true" />
        <HeroSpotlight />
        <div className="container">
          <span className="badge hero-anim"><span className="dot" /> <ShinyText>{t.hero.badge}</ShinyText></span>
          <h1 className="display h-massive hero-copy">
            <BlurText text={t.hero.titleTop} />
            <br />
            <BlurText
              text={t.hero.titleEm}
              className="accent"
              delay={t.hero.titleTop.split(" ").length * 90 + 140}
            />
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
            <Phone lg src="/screens/home.jpg" srcDark="/screens/home-dark.jpg" alt={t.alts.home} className="hero-phone" />
            <div className="hero-chips" aria-hidden="true">
              {t.hero.chips.map((c, i) => (
                <span className={`hero-chip chip-${i + 1} tone-${c.tone}`} key={i}>
                  <span className="hero-chip-top">{c.top}</span>
                  <span className="hero-chip-val">{c.value}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <Showcase steps={steps} heading={t.overview.title.join(" ")} />

      <Stats items={t.stats} />

      {/* More screens — small phone gallery */}
      <section className="section-pad">
        <div className="container">
          <Reveal variant="up" className="sec-head">
            <div className="eyebrow">{t.more.eyebrow}</div>
            <h2 className="display h-large"><BlurText text={t.more.title} trigger="view" /></h2>
          </Reveal>
          <Reveal variant="up" className="gallery" delay={80}>
            {t.more.items.map((item, i) => (
              <figure className="gallery-item stagger" key={moreVisuals[i].src}>
                <Phone src={moreVisuals[i].src} alt={t.alts[moreVisuals[i].altKey]} />
                <figcaption>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </figcaption>
              </figure>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Everything else — capabilities grid */}
      <section className="section-pad">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">{t.features.eyebrow}</div>
            <h2 className="display h-large"><BlurText text={t.features.title} trigger="view" /></h2>
          </div>
          <Reveal variant="up" className="caps" delay={80}>
            {t.features.cards.map((card, i) => (
              <SpotlightCard className="cap stagger" key={i}>
                <span className="cap-ico"><Icon name={capIcons[i]} size={24} /></span>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </SpotlightCard>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Colourways — auto marquee */}
      <section className="section-pad band">
        <div className="container">
          <Reveal variant="up" className="sec-head">
            <div className="eyebrow">{t.palette.eyebrow}</div>
            <h2 className="display h-large"><BlurText text={t.palette.title} trigger="view" /></h2>
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
              <h2 className="display h-large"><BlurText text={t.privacy.title} trigger="view" /></h2>
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

      <Roadmap t={t.roadmap} />

      {/* Download */}
      <section className="download section-pad band" id="download">
        <div className="container">
          <Reveal variant="scale" className="download-inner star-border">
            <div className="download-icon">
              <Image src={asset("/assets/icon.png")} alt="" width={128} height={128} />
            </div>
            <div className="price-strike">{t.free.price}</div>
            <h2 className="display h-large"><BlurText text={t.free.title} trigger="view" /></h2>
            <p className="lede mute">{t.free.lede}</p>
            <div className="download-ctas">
              <span className="btn btn-soon" aria-disabled="true">
                <Icon name="apple" size={17} /> {t.free.ctaStore}
              </span>
              <a className="btn btn-ghost" href={DONATE_URL} target="_blank" rel="noopener noreferrer">
                <Icon name="coffee" size={17} /> {t.free.ctaCoffee}
              </a>
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
            <a href={DONATE_URL} target="_blank" rel="noopener noreferrer">{t.footer.links.tip}</a>
            <a href="#">{t.footer.links.store}</a>
          </div>
        </div>
      </footer>

      <button
        type="button"
        className={"to-top" + (showTop ? " show" : "")}
        aria-label={t.nav.backToTop}
        title={t.nav.backToTop}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15" /></svg>
      </button>
    </div>
  );
}
