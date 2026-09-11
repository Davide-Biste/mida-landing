import { Fragment } from "react";
import Image from "next/image";
import Reveal from "./Reveal";
import Background from "./Background";
import Coins from "./Coins";
import HeroGlow from "./HeroGlow";
import { Iphone } from "@/registry/magicui/iphone";
import { dictionaries, type Dictionary } from "./i18n/dictionaries";
import { getLocale } from "./i18n/getLocale";

// Renders an array of strings as separate lines (joined with <br/>).
const lines = (items: string[]) =>
  items.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ));

type IconName =
  | "shield"
  | "lock"
  | "check"
  | "apple"
  | "coffee"
  | "cloud-off"
  | "scan"
  | "repeat"
  | "trending"
  | "users"
  | "tag"
  | "globe";

const Icon = ({
  name,
  size = 22,
  stroke = 1.6,
}: {
  name: IconName;
  size?: number;
  stroke?: number;
}) => {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "shield":
      return (
        <svg {...p}>
          <path d="M12 2l9 4v6c0 5-4 9-9 11-5-2-9-6-9-11V6l9-4z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "lock":
      return (
        <svg {...p}>
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "check":
      return (
        <svg {...p}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case "apple":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
      );
    case "coffee":
      return (
        <svg {...p}>
          <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="2" x2="6" y2="4" />
          <line x1="10" y1="2" x2="10" y2="4" />
          <line x1="14" y1="2" x2="14" y2="4" />
        </svg>
      );
    case "cloud-off":
      return (
        <svg {...p}>
          <path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5l14 14" />
          <path d="M2 13a4.5 4.5 0 0 0 6.5 4.5" />
        </svg>
      );
    case "scan":
      return (
        <svg {...p}>
          <path d="M3 7V5a2 2 0 0 1 2-2h2" />
          <path d="M17 3h2a2 2 0 0 1 2 2v2" />
          <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
          <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
          <line x1="7" y1="12" x2="17" y2="12" />
        </svg>
      );
    case "repeat":
      return (
        <svg {...p}>
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      );
    case "trending":
      return (
        <svg {...p}>
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      );
    case "users":
      return (
        <svg {...p}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "tag":
      return (
        <svg {...p}>
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      );
    case "globe":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
  }
};

// iPhone mockup (magic-ui) with an optional screenshot in the screen.
const Phone = ({
  lg = false,
  src,
  alt = "",
}: {
  lg?: boolean;
  src?: string;
  alt?: string;
}) => (
  <div className={"phone-mock" + (lg ? " lg" : "")}>
    <Iphone
      src={src}
      className="iphone-svg"
      role="img"
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    />
  </div>
);

const PaletteTile = ({
  name,
  desc,
  src,
  alt,
  palette,
}: {
  name: string;
  desc: string;
  src?: string;
  alt?: string;
  palette: string[];
}) => (
  <div className="palette-tile">
    <Phone src={src} alt={alt} />
    <div className="swatches">
      {palette.map((c, i) => (
        <div key={i} className="sw" style={{ background: c }} />
      ))}
    </div>
    <div>
      <div className="pname">{name}</div>
      <div className="desc">{desc}</div>
    </div>
  </div>
);

const featureIcons: IconName[] = ["scan", "repeat", "trending", "users", "tag", "globe"];

// The app's four real colour families. Each tile shows a matching screenshot
// and the family's five swatches.
const paletteVisuals: { src: string; altKey: keyof Dictionary["alts"]; palette: string[] }[] = [
  { src: "/screens/red.png", altKey: "paletteEnergia", palette: ["#E5614C", "#D63E55", "#C04A8E", "#E68642", "#E5B23C"] },
  { src: "/screens/purple.png", altKey: "paletteCalma", palette: ["#9583C4", "#7B7AC2", "#D88AA0", "#E8A789", "#B084A8"] },
  { src: "/screens/home.png", altKey: "paletteNatura", palette: ["#3B9669", "#2C5F3F", "#8AAE3F", "#4FA890", "#7C9982"] },
  { src: "/screens/blue.png", altKey: "paletteNotte", palette: ["#3B6CC9", "#4658B8", "#2A7A9E", "#27324D", "#4C5A6B"] },
];

const privacyPills: { icon: IconName; size: number; stroke: number }[] = [
  { icon: "check", size: 14, stroke: 2.4 },
  { icon: "cloud-off", size: 14, stroke: 1.8 },
  { icon: "lock", size: 14, stroke: 1.8 },
  { icon: "check", size: 14, stroke: 2.4 },
];

export default async function Home() {
  const t = dictionaries[await getLocale()];

  return (
    <>
      <Background />
      <div className="page">
      <Coins />
      <nav className="top">
        <div className="nav-inner">
          <a className="logo" href="#">
            <span className="logo-mark">
              <Image src="/assets/mida.svg" alt="" width={28} height={28} priority />
            </span>
            Mida
          </a>
          <div className="nav-links">
            <a href="#features">{t.nav.features}</a>
            <a href="#privacy">{t.nav.privacy}</a>
            <a href="/support">{t.nav.support}</a>
            <a href="#download" className="nav-cta">{t.nav.download}</a>
          </div>
        </div>
      </nav>

      <header className="hero">
        <HeroGlow />
        <span className="hero-coin c1" aria-hidden="true">
          <Image src="/assets/mida.svg" alt="" width={64} height={64} />
        </span>
        <span className="hero-coin c2" aria-hidden="true">
          <Image src="/assets/mida.svg" alt="" width={44} height={44} />
        </span>
        <span className="hero-coin c3" aria-hidden="true">
          <Image src="/assets/mida.svg" alt="" width={52} height={52} />
        </span>
        <div className="container">
          <div className="badge hero-anim">
            <span className="dot" /> {t.hero.badge}
          </div>
          <h1 className="display h-massive hero-anim d1">
            {t.hero.titleTop}
            <br />
            <em>{t.hero.titleEm}</em>
          </h1>
          <p className="lede mute hero-anim d2">{t.hero.lede}</p>
          <div className="hero-cta hero-anim d3">
            <a href="#download" className="arrow-link">{t.hero.ctaPrimary}</a>
            <a href="#features" className="arrow-link">{t.hero.ctaSecondary}</a>
          </div>

          <div className="hero-stage">
            <div className="hero-phone-side">
              <Phone lg src="/screens/wallets.png" alt={t.alts.walletsHero} />
            </div>
            <div className="float-phone">
              <Phone lg src="/screens/home.png" alt={t.alts.home} />
            </div>
            <div className="hero-phone-side">
              <Phone lg src="/screens/budgets.png" alt={t.alts.budgetsHero} />
            </div>
          </div>
        </div>
      </header>

      <section className="spotlight" id="features">
        <div className="container">
          <div className="spot-grid">
            <Reveal variant="left">
              <div className="eyebrow">{t.multi.eyebrow}</div>
              <h2 className="display h-large">{lines(t.multi.title)}</h2>
              <p className="lede mute" style={{ marginTop: 22 }}>{t.multi.body}</p>
              <div className="copy-actions">
                <a href="#download" className="arrow-link">{t.multi.cta}</a>
              </div>
            </Reveal>
            <Reveal variant="right" className="spot-stage" delay={120}>
              <Phone lg src="/screens/wallets.png" alt={t.alts.walletsHero} />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="spotlight dark">
        <div className="container">
          <div className="spot-grid reverse">
            <Reveal variant="right">
              <div className="eyebrow invert">{t.transfer.eyebrow}</div>
              <h2 className="display h-large" style={{ color: "#fff" }}>{lines(t.transfer.title)}</h2>
              <p className="lede mute" style={{ marginTop: 22 }}>{t.transfer.body}</p>
            </Reveal>
            <Reveal variant="left" className="spot-stage" delay={120}>
              <Phone lg src="/screens/transfer.png" alt={t.alts.transfer} />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="spotlight soft">
        <div className="container">
          <div className="spot-grid">
            <Reveal variant="left">
              <div className="eyebrow">{t.kpi.eyebrow}</div>
              <h2 className="display h-large">{lines(t.kpi.title)}</h2>
              <p className="lede mute" style={{ marginTop: 22 }}>{t.kpi.body}</p>
            </Reveal>
            <Reveal variant="right" className="spot-stage" delay={120}>
              <Phone lg src="/screens/charts.png" alt={t.alts.charts} />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="spotlight">
        <div className="container">
          <div className="spot-grid reverse">
            <Reveal variant="right">
              <div className="eyebrow">{t.budget.eyebrow}</div>
              <h2 className="display h-large">{lines(t.budget.title)}</h2>
              <p className="lede mute" style={{ marginTop: 22 }}>{t.budget.body}</p>
            </Reveal>
            <Reveal variant="left" className="spot-stage" delay={120}>
              <Phone lg src="/screens/budgets.png" alt={t.alts.budgetsHero} />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="spotlight dark">
        <div className="container">
          <div className="spot-grid">
            <Reveal variant="left">
              <div className="eyebrow invert">{t.add.eyebrow}</div>
              <h2 className="display h-large" style={{ color: "#fff" }}>{lines(t.add.title)}</h2>
              <p className="lede mute" style={{ marginTop: 22 }}>{t.add.body}</p>
            </Reveal>
            <Reveal variant="right" className="spot-stage" delay={120}>
              <Phone lg src="/screens/new-transactions.png" alt={t.alts.add} />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="spotlight soft">
        <div className="container">
          <div className="spot-grid reverse">
            <Reveal variant="right">
              <div className="eyebrow">{t.search.eyebrow}</div>
              <h2 className="display h-large">{lines(t.search.title)}</h2>
              <p className="lede mute" style={{ marginTop: 22 }}>{t.search.body}</p>
            </Reveal>
            <Reveal variant="left" className="spot-stage" delay={120}>
              <Phone lg src="/screens/transactions.png" alt={t.alts.search} />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="feature-grid-section">
        <div className="container" style={{ textAlign: "center" }}>
          <Reveal variant="up">
            <div className="eyebrow">{t.features.eyebrow}</div>
            <h2 className="display h-large" style={{ margin: "0 auto", maxWidth: "16ch" }}>
              {t.features.title}
            </h2>
          </Reveal>
          <Reveal variant="up" className="feature-grid" delay={120}>
            {t.features.cards.map((card, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-ico"><Icon name={featureIcons[i]} size={22} /></div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="spotlight soft">
        <div className="container" style={{ textAlign: "center" }}>
          <Reveal variant="up">
            <div className="eyebrow">{t.palette.eyebrow}</div>
            <h2 className="display h-large" style={{ margin: "0 auto", maxWidth: "14ch" }}>
              {t.palette.title}
            </h2>
            <p className="lede mute" style={{ margin: "22px auto 0" }}>{t.palette.lede}</p>
          </Reveal>
          <Reveal variant="up" className="palette-row" delay={150}>
            {t.palette.tiles.map((tile, i) => (
              <PaletteTile
                key={i}
                name={tile.name}
                desc={tile.desc}
                src={paletteVisuals[i].src}
                alt={t.alts[paletteVisuals[i].altKey]}
                palette={paletteVisuals[i].palette}
              />
            ))}
          </Reveal>
        </div>
      </section>

      <section className="privacy" id="privacy">
        <div className="container privacy-inner">
          <Reveal variant="scale">
            <div className="privacy-glyph">
              <Icon name="shield" size={50} stroke={1.4} />
            </div>
          </Reveal>
          <Reveal variant="up" delay={120}>
            <div className="eyebrow invert">{t.privacy.eyebrow}</div>
            <h2 className="display h-large">{lines(t.privacy.title)}</h2>
            <p className="lede">{t.privacy.body}</p>
          </Reveal>
          <Reveal variant="up" className="privacy-pills" delay={250}>
            {t.privacy.pills.map((label, i) => (
              <span className="privacy-pill" key={i}>
                <Icon name={privacyPills[i].icon} size={privacyPills[i].size} stroke={privacyPills[i].stroke} /> {label}
              </span>
            ))}
          </Reveal>
          <Reveal variant="up" delay={350}>
            <a href="/privacy" className="arrow-link" style={{ color: "var(--brand-bright)" }}>
              {t.privacy.link}
            </a>
          </Reveal>
        </div>
      </section>

      <section className="free-cta" id="download">
        <div className="container free-cta-inner">
          <Reveal variant="scale">
            <div className="free-cta-coin">
              <Image src="/assets/icon.png" alt="" width={180} height={180} />
            </div>
            <div className="price-strike">{t.free.price}</div>
            <h2 className="display h-large">{t.free.title}</h2>
            <p className="lede mute" style={{ margin: "22px auto 0" }}>{t.free.lede}</p>
            <div className="ctas">
              <a href="#" className="btn btn-primary">
                <Icon name="apple" size={16} /> {t.free.ctaStore}
              </a>
              <a href="#" className="arrow-link" style={{ color: "var(--ink)" }}>
                <Icon name="coffee" size={14} stroke={1.8} />
                &nbsp;&nbsp;{t.free.ctaCoffee}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <footer>
        <div className="container footer-grid">
          <div className="footer-brand">
            <Image src="/assets/mida.svg" alt="" width={20} height={20} />
            {t.footer.brand}
          </div>
          <div className="footer-links">
            <a href="/privacy">{t.footer.links.privacy}</a>
            <a href="/terms">{t.footer.links.terms}</a>
            <a href="/support">{t.footer.links.support}</a>
            <a href="#">{t.footer.links.store}</a>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
