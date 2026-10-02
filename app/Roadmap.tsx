"use client";

import { useEffect, useRef } from "react";
import BlurText from "./BlurText";
import Reveal from "./Reveal";
import { DONATE_URL, Icon } from "./ui";
import type { Dictionary } from "./i18n/dictionaries";

// Vertical roadmap: a rail that fills with brand green as the reader scrolls
// through it, lighting each milestone as the fill reaches its node. The fill
// is a single CSS var (--rm-fill) written on scroll; reduced motion shows the
// rail fully drawn.
export default function Roadmap({ t }: { t: Dictionary["roadmap"] }) {
  const trackRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const nodes = Array.from(track.querySelectorAll<HTMLElement>(".rm-node"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      track.style.setProperty("--rm-fill", "1");
      nodes.forEach((n) => n.classList.add("lit"));
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const r = track.getBoundingClientRect();
      const reach = window.innerHeight * 0.62 - r.top;
      track.style.setProperty("--rm-fill", String(Math.min(1, Math.max(0, reach / r.height))));
      nodes.forEach((n) => {
        const nr = n.getBoundingClientRect();
        n.classList.toggle("lit", nr.top + nr.height / 2 < window.innerHeight * 0.62);
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section className="roadmap section-pad" id="roadmap">
      <div className="container">
        <Reveal variant="up" className="sec-head">
          <div className="eyebrow">{t.eyebrow}</div>
          <h2 className="display h-large"><BlurText text={t.title} trigger="view" /></h2>
          <p className="lede">{t.lede}</p>
        </Reveal>

        <ol className="rm-track" ref={trackRef}>
          {t.phases.map((phase, i) => (
            <li className={`rm-step is-${phase.state}`} key={i}>
              <div className="rm-meta">
                <span className="rm-status">{phase.status}</span>
                {phase.when && <span className="rm-when">{phase.when}</span>}
              </div>
              <span className="rm-node" aria-hidden="true">
                {phase.state === "done" && <Icon name="check" size={13} stroke={3} />}
              </span>
              <Reveal variant="up" className={"rm-body" + (phase.items.length > 1 ? " rm-items" : "")}>
                {phase.items.map((item) => (
                  <div className={"rm-item stagger" + (item.wide ? " wide" : "")} key={item.title}>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                    {item.chips && (
                      <ul className="rm-chips" aria-label={item.chipsLabel}>
                        {item.chips.map((c) => <li key={c}>{c}</li>)}
                        <li className="rm-chip-more">{item.chipsMore}</li>
                      </ul>
                    )}
                    {item.note && (
                      <aside className="rm-note">
                        <span className="rm-note-label"><Icon name="lock" size={13} stroke={2} /> {item.noteLabel}</span>
                        <p>{item.note}</p>
                      </aside>
                    )}
                  </div>
                ))}
              </Reveal>
            </li>
          ))}
        </ol>

        <div className="rm-step is-open">
          <div className="rm-meta">
              <span className="rm-status">{t.donate.status}</span>
            </div>
            <span className="rm-node" aria-hidden="true" />
            <Reveal variant="up" className="rm-body">
              <h3 className="rm-donate-title">{t.donate.title}</h3>
              <p>{t.donate.body}</p>
              <div className="rm-donate-cta">
                {DONATE_URL ? (
                  <a className="btn btn-primary" href={DONATE_URL} target="_blank" rel="noopener noreferrer">
                    <Icon name="coffee" size={17} /> {t.donate.cta}
                  </a>
                ) : (
                  <span className="btn btn-soon" aria-disabled="true">
                    <Icon name="coffee" size={17} /> {t.donate.soon}
                  </span>
                )}
                <span className="rm-donate-fine">{t.donate.fine}</span>
              </div>
            </Reveal>
        </div>
      </div>
    </section>
  );
}
