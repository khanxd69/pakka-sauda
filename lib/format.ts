// Pakka Sauda: display helpers. FROZEN after Phase 0. Owner: Workstream A. Pure functions, safe on server and client.
import { CONFIG } from './config';

const r2 = (n: number) => Math.round(n * 100) / 100;

/** 358800 -> "Rs 358,800" (buyer/admin screens). */
export const formatRs = (n: number) => `Rs ${Math.round(n).toLocaleString('en-US')}`;

/** 358800 -> "Rs 3,58,800" (South Asian grouping, used on farmer screens and in the demo script). */
export const formatRsPK = (n: number) => `Rs ${Math.round(n).toLocaleString('en-IN')}`;

export const formatKg = (kg: number) => `${Math.round(kg).toLocaleString('en-US')} kg`;

export const kgToMann = (kg: number) => r2(kg / CONFIG.KG_PER_MANN);
export const mannToKg = (mann: number) => r2(mann * CONFIG.KG_PER_MANN);

/** Rs 45/kg -> Rs 1,800 per mann (40 kg). */
export const perKgToPerMann = (rsPerKg: number) => r2(rsPerKg * CONFIG.KG_PER_MANN);
export const perMannToPerKg = (rsPerMann: number) => r2(rsPerMann / CONFIG.KG_PER_MANN);

/** One spoken estimate -> listing range, +/- QTY_RANGE_PERCENT, rounded to 100 kg. */
export function estimateToRange(estimateKg: number): { low: number; high: number } {
  const pct = CONFIG.QTY_RANGE_PERCENT / 100;
  const round100 = (n: number) => Math.round(n / 100) * 100;
  return { low: round100(estimateKg * (1 - pct)), high: round100(estimateKg * (1 + pct)) };
}

/** ISO date -> "14 Oct". */
export const formatDate = (iso: string) =>
  new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
