// Pakka Sauda: flat potato illustrations (inline SVG, earth tones). Grade A: large and clean; B: medium, a few
// marks; C: small, more marks. Replaces emoji tiles. Owner: Workstream B.
import type { Grade } from '@/lib/types';

type Tuber = { cx: number; cy: number; rx: number; ry: number; rot: number; spots?: Array<[number, number, number]> };

const SETS: Record<Grade | 'crop', Tuber[]> = {
  crop: [
    { cx: 38, cy: 52, rx: 24, ry: 17, rot: -18 },
    { cx: 64, cy: 44, rx: 21, ry: 15, rot: 12 },
    { cx: 52, cy: 66, rx: 19, ry: 13, rot: 4 },
  ],
  A: [
    { cx: 36, cy: 50, rx: 26, ry: 18, rot: -15 },
    { cx: 66, cy: 56, rx: 24, ry: 17, rot: 14 },
  ],
  B: [
    { cx: 30, cy: 46, rx: 18, ry: 13, rot: -10, spots: [[-4, 2, 2.4]] },
    { cx: 62, cy: 42, rx: 17, ry: 12, rot: 15 },
    { cx: 48, cy: 66, rx: 18, ry: 12, rot: 2, spots: [[5, -2, 2.6], [-6, 3, 1.8]] },
  ],
  C: [
    { cx: 24, cy: 42, rx: 11, ry: 8, rot: -12, spots: [[2, 1, 2]] },
    { cx: 48, cy: 38, rx: 10, ry: 7, rot: 18, spots: [[-2, 1, 1.8]] },
    { cx: 72, cy: 44, rx: 11, ry: 8, rot: -6, spots: [[3, -1, 2.2], [-3, 2, 1.4]] },
    { cx: 34, cy: 64, rx: 10, ry: 7, rot: 10, spots: [[1, 1, 2]] },
    { cx: 60, cy: 66, rx: 12, ry: 8, rot: -14, spots: [[-3, 0, 2.4], [4, 2, 1.6]] },
  ],
};

export function PotatoArt({ kind, className }: { kind: Grade | 'crop'; className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden>
      <rect width="96" height="96" rx="16" className="fill-earth-soft" />
      <ellipse cx="50" cy="84" rx="34" ry="4" className="fill-earth/25" />
      {SETS[kind].map((t, i) => (
        <g key={i} transform={`rotate(${t.rot} ${t.cx} ${t.cy})`}>
          <ellipse cx={t.cx} cy={t.cy} rx={t.rx} ry={t.ry} className="fill-earth stroke-earth-dark" strokeWidth="1.5" />
          <ellipse cx={t.cx - t.rx * 0.35} cy={t.cy - t.ry * 0.35} rx={t.rx * 0.28} ry={t.ry * 0.18} className="fill-white/35" />
          <circle cx={t.cx + t.rx * 0.3} cy={t.cy + t.ry * 0.1} r="1" className="fill-earth-dark" />
          <circle cx={t.cx - t.rx * 0.15} cy={t.cy + t.ry * 0.35} r="0.9" className="fill-earth-dark" />
          {t.spots?.map(([dx, dy, r], j) => <circle key={j} cx={t.cx + dx} cy={t.cy + dy} r={r} className="fill-earth-dark/70" />)}
        </g>
      ))}
    </svg>
  );
}
