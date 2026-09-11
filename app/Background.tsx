// Fixed, full-viewport ambient background for the landing page:
// three drifting aurora blobs, a masked grid and a faint noise layer.
// Pure CSS (animations live in globals.css) — no client JS needed.
// The cursor-following glow in the hero is handled separately by <HeroGlow/>.
export default function Background() {
  return (
    <div className="aurora" aria-hidden="true">
      <div className="aurora-blob a" />
      <div className="aurora-blob b" />
      <div className="aurora-blob c" />
      <div className="aurora-grid" />
      <div className="aurora-noise" />
    </div>
  );
}
