import Reveal from "./Reveal";
import { Phone } from "./ui";

export type Step = { src: string; alt: string; title: string; body: string };

// Full-screen scroll-snap panels. Each feature fills the viewport and snaps
// into place (scroll-snap-stop: always), so the reader has to insist on the
// scroll to advance and always sees a step in full. Native scroll = fluid.
export default function Showcase({ steps, heading }: { steps: Step[]; heading: string }) {
  return (
    <>
      <section className="sc-lead section-pad" id="features">
        <div className="container">
          <Reveal variant="up">
            <h2 className="display h-large">{heading}</h2>
          </Reveal>
        </div>
      </section>
      <div className="showcase">
        {steps.map((s) => (
          <section className="sc-panel" key={s.src}>
            <div className="container sc-panel-inner">
              <Reveal variant="up" className="sc-copy">
                <h3 className="display h-large">{s.title}</h3>
                <p className="lede">{s.body}</p>
              </Reveal>
              <Reveal variant="scale" className="sc-art" delay={90}>
                <Phone lg src={s.src} alt={s.alt} />
              </Reveal>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
