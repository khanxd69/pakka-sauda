'use client';
// Pakka Sauda: F2-F7 sell wizard. One question per screen, audio first, read-back before publishing. Owner: B.
// All answers live in one state object; nothing is submitted before the F7 read-back.
import { ArrowRight, Check, CircleCheck, House, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createListing } from '@/app/actions/listings';
import { AudioPrompt } from '@/components/voice/AudioPrompt';
import { playUrl, schedule } from '@/components/voice/player';
import { SpeakButton } from '@/components/voice/SpeakButton';
import { useOnline } from '@/components/voice/useOnline';
import { VoiceNumberInput } from '@/components/voice/VoiceNumberInput';
import { estimateToRange, mannToKg, perMannToPerKg } from '@/lib/format';
import type { Grade, ReferencePrice } from '@/lib/types';
import { CLIPS, clipUrl, type ClipId } from '@/lib/voice/clips';
import { readBackListing, type ReadyWhen } from '@/lib/voice/phrases';
import { ActionBar, BigButton } from './BigButton';
import { CropStep } from './CropStep';
import { ListingSummary } from './ListingSummary';
import { PromptHeading } from './PromptHeading';
import { QualityStep } from './QualityStep';
import { ReadyTiles } from './ReadyTiles';
import { RefPriceCard } from './RefPriceCard';
import { StepDots } from './StepDots';

type Step = 'crop' | 'qty' | 'ready' | 'quality' | 'price' | 'review' | 'done';
const STEPS: Step[] = ['crop', 'qty', 'ready', 'quality', 'price', 'review'];
const CLIP: Record<Step, ClipId> = {
  crop: 'crop_ask',
  qty: 'qty_ask',
  ready: 'ready_ask',
  quality: 'quality_ask',
  price: 'price_ask',
  review: 'confirm_hint',
  done: 'listing_published',
};

interface SellState {
  qtyValue: number | null; // in `unit`
  unit: 'kg' | 'mann';
  ready: ReadyWhen | null;
  expectedGrade: Grade | null;
  minPricePerMann: number | null;
  transcripts: string[];
  qualityText?: string | null; // the farmer's own words about his potatoes (F5)
  suggestedGrade?: Grade | null; // keyword suggestion from qualityText; he confirms or changes it
}

/** Local calendar date + n days as YYYY-MM-DD. */
function isoPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const READY_DAYS: Record<ReadyWhen, [number, number]> = { this_week: [0, 6], next_week: [7, 13], two_weeks: [14, 20] };

const DRAFT_KEY = 'ps_sell_draft';
const EMPTY: SellState = { qtyValue: null, unit: 'mann', ready: null, expectedGrade: null, minPricePerMann: null, transcripts: [], qualityText: null, suggestedGrade: null };

export function SellWizard({ referencePrices }: { referencePrices: ReferencePrice[] }) {
  const [step, setStep] = useState<Step>('crop');
  const [s, setS] = useState<SellState>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [restored, setRestored] = useState(false);
  const online = useOnline();

  // P1: keep the answers on the phone so a reload or a dropped connection loses nothing.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as { step?: Step; s?: SellState };
        if (d.s) setS({ ...EMPTY, ...d.s });
        if (d.step && d.step !== 'done') setStep(d.step);
      }
    } catch {
      /* no storage: start fresh */
    }
    setRestored(true);
  }, []);
  useEffect(() => {
    if (!restored) return;
    try {
      if (step === 'done') localStorage.removeItem(DRAFT_KEY);
      else localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, s }));
    } catch {
      /* ignore */
    }
  }, [restored, step, s]);
  useEffect(() => {
    if (!online && step === 'review') void schedule(() => playUrl(clipUrl('offline')), 'now');
  }, [online, step]);
  const update = (patch: Partial<SellState>) => setS((prev) => ({ ...prev, ...patch }));
  const addTranscript = (t?: string) => (t ? s.transcripts.concat(t) : s.transcripts);

  const estimateKg = s.qtyValue == null ? 0 : s.unit === 'mann' ? mannToKg(s.qtyValue) : s.qtyValue;
  const lahore = referencePrices.find((r) => r.market === 'Lahore') ?? referencePrices[0];
  const idx = STEPS.indexOf(step);
  const go = (to: Step) => setStep(to);
  const next = () => go(STEPS[Math.min(idx + 1, STEPS.length - 1)]);
  const back = () => go(STEPS[Math.max(idx - 1, 0)]);

  const canNext =
    (step === 'qty' && estimateKg > 0) ||
    (step === 'ready' && s.ready != null) ||
    (step === 'quality' && s.expectedGrade != null) ||
    (step === 'price' && (s.minPricePerMann ?? 0) > 0);

  async function publish() {
    if (!s.ready || !s.expectedGrade || !s.minPricePerMann || estimateKg <= 0) return;
    setBusy(true);
    const range = estimateToRange(estimateKg);
    const [from, to] = READY_DAYS[s.ready];
    const res = await createListing({
      qtyLowKg: range.low,
      qtyHighKg: range.high,
      expectedGrade: s.expectedGrade,
      minPricePerKg: perMannToPerKg(s.minPricePerMann),
      readyFrom: isoPlus(from),
      readyTo: isoPlus(to),
      voiceTranscript: [...s.transcripts, s.qualityText ? `معیار: ${s.qualityText}` : null].filter(Boolean).join(' | ') || undefined,
    });
    setBusy(false);
    if (res.ok) go('done');
    else void schedule(() => playUrl(clipUrl('error_generic')), 'now');
  }

  if (step === 'done') {
    return (
      <div className="flex flex-col items-center gap-6 pt-12 text-center">
        <span className="flex size-24 items-center justify-center rounded-full bg-success-soft text-success">
          <CircleCheck className="size-14" strokeWidth={1.5} aria-hidden />
        </span>
        <PromptHeading clip="listing_published" autoPlay />
        <Link
          href="/f"
          className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-brand text-xl font-semibold text-white shadow-card transition-colors hover:bg-brand-hover"
          aria-label="گھر / Home"
        >
          <House className="size-6" strokeWidth={1.5} aria-hidden />
        </Link>
      </div>
    );
  }

  const readBack = step === 'review' && s.ready && s.minPricePerMann ? readBackListing({ estimateKg, ready: s.ready, minPricePerMann: s.minPricePerMann }) : null;

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      <div className="sticky top-16 z-10 -mx-4 bg-page/95 px-4 pt-4 pb-3 backdrop-blur">
        <StepDots total={STEPS.length} current={idx} />
      </div>

      <div className="flex flex-1 flex-col gap-5 pt-2">
        {step === 'review' ? null : <PromptHeading key={step} clip={CLIP[step]} autoPlay />}

        {step === 'crop' ? (
          <CropStep
            onPotato={(t) => {
              if (t) update({ transcripts: addTranscript(`فصل: ${t}`) });
              next();
            }}
          />
        ) : null}

        {step === 'qty' ? (
          <VoiceNumberInput
            field="quantity"
            unit={s.unit}
            value={s.qtyValue}
            onUnitChange={(u) => {
              if (u === s.unit) return;
              const v = s.qtyValue == null ? null : u === 'kg' ? Math.round(s.qtyValue * 40) : Math.round(s.qtyValue / 40);
              update({ unit: u, qtyValue: v });
            }}
            onChange={(v, t) => update({ qtyValue: v, transcripts: addTranscript(t) })}
          />
        ) : null}

        {step === 'ready' ? (
          <ReadyTiles
            value={s.ready}
            onSelect={(r) => {
              update({ ready: r });
              go('quality');
            }}
          />
        ) : null}

        {step === 'quality' ? (
          <QualityStep
            description={s.qualityText ?? null}
            suggested={s.suggestedGrade ?? null}
            value={s.expectedGrade}
            onDescribe={(text, g) => update({ qualityText: text, suggestedGrade: g, expectedGrade: null })}
            onPick={(g) => {
              update({ expectedGrade: g });
              go('price');
            }}
          />
        ) : null}

        {step === 'price' ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <RefPriceCard refPrice={lahore} />
              <div className="flex items-center gap-3 px-1">
                <p className="flex-1 text-base leading-[1.9] text-ink-muted">{CLIPS.price_reference.ur}</p>
                <AudioPrompt clip="price_reference" autoPlay />
              </div>
            </div>
            <VoiceNumberInput
              field="price"
              unit="mann"
              value={s.minPricePerMann}
              onChange={(v, t) => update({ minPricePerMann: v, transcripts: addTranscript(t) })}
            />
          </div>
        ) : null}

        {step === 'review' && readBack && s.ready && s.expectedGrade && s.minPricePerMann ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-2xl border border-attn/30 bg-attn-soft p-4">
              <p className="flex-1 text-xl font-semibold leading-[2] text-ink">{readBack}</p>
              <SpeakButton autoPlay text={readBack} />
            </div>
            <ListingSummary
              estimateKg={estimateKg}
              ready={s.ready}
              expectedGrade={s.expectedGrade}
              minPricePerMann={s.minPricePerMann}
              qualityText={s.qualityText ?? null}
            />
            <PromptHeading clip="confirm_hint" autoPlay size="md" />
          </div>
        ) : null}
      </div>

      <ActionBar>
        {step === 'review' ? (
          <>
            <BigButton variant="go" icon={<Check strokeWidth={2.5} aria-hidden />} busy={busy} disabled={!online} onClick={publish}>
              ٹھیک ہے
            </BigButton>
            <BigButton variant="plain" icon={<Pencil strokeWidth={1.75} aria-hidden />} disabled={busy} onClick={() => go('qty')}>
              بدلیں
            </BigButton>
          </>
        ) : (
          <div className="flex gap-3">
            {step !== 'crop' ? (
              <BigButton variant="plain" className="!w-20 shrink-0" onClick={back} aria-label="واپس / Back" icon={<ArrowRight strokeWidth={1.75} aria-hidden />} />
            ) : (
              <Link
                href="/f"
                className="flex min-h-14 w-20 shrink-0 items-center justify-center rounded-xl border border-line-strong bg-surface text-ink"
                aria-label="واپس / Back"
              >
                <ArrowRight className="size-6" strokeWidth={1.75} aria-hidden />
              </Link>
            )}
            {step !== 'crop' ? (
              <BigButton variant="go" disabled={!canNext} onClick={next} aria-label="آگے / Next" icon={<Check strokeWidth={2.5} aria-hidden />} />
            ) : null}
          </div>
        )}
      </ActionBar>
    </div>
  );
}
