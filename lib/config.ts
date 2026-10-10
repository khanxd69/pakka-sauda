// Pakka Sauda: business constants. FROZEN after Phase 0. Owner: Workstream A.
// Values marked ILLUSTRATIVE are placeholders until the team validates them with a farmer or buyer.

const num = (v: string | undefined, fallback: number) => (v && !Number.isNaN(Number(v)) ? Number(v) : fallback);

export const CONFIG = {
  FEE_PERCENT: num(process.env.PLATFORM_FEE_PERCENT, 1), // paid by the buyer on settled deals
  TOKEN_PERCENT: num(process.env.TOKEN_PERCENT, 10), // of mid-range quantity x price for the expected grade
  TOKEN_WINDOW_MINUTES: num(process.env.TOKEN_WINDOW_MINUTES, 30),
  SHORTFALL_RATIO: 0.8, // below 80% of the low estimate, the buyer may cancel
  QTY_RANGE_PERCENT: 10, // farmer says one estimate; listing range = estimate +/- 10%
  KG_PER_MANN: 40,
  // Net comparison ("what reaches your hand"):
  MANDI_COMMISSION_PERCENT: 3, // PIDE Knowledge Brief 2022:69 reports 2-4% arhti commission
  TRANSPORT_PER_KG_TO_MANDI: 2.5, // ILLUSTRATIVE: farm to Lahore mandi, rupees per kg
  LABOUR_PER_KG: 0.75, // ILLUSTRATIVE: loading/unloading, rupees per kg
  DEMO_MODE: true, // every simulated money step shows a DEMO label
} as const;

export const DEMO_IDS = {
  rashid: '00000000-0000-4000-8000-000000000101',
  naseem: '00000000-0000-4000-8000-000000000102',
  akram: '00000000-0000-4000-8000-000000000103',
  imran: '00000000-0000-4000-8000-000000000201',
  lahoreFresh: '00000000-0000-4000-8000-000000000202',
  pakAgro: '00000000-0000-4000-8000-000000000203',
  reviewer: '00000000-0000-4000-8000-000000000301',
  disputeSauda: '00000000-0000-4000-8000-000000003001',
  settledSauda: '00000000-0000-4000-8000-000000003002',
} as const;
