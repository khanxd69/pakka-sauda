'use client';
// Pakka Sauda: F2-F7 sell wizard. One question per screen, audio first, read-back before publishing. Owner: B.
// All answers live in one state object; nothing is submitted before the F7 read-back.
import Link from 'next/link';
import { useState } from 'react';
import { createListing } from '@/app/actions/listings';
import { AudioPrompt } from '@/components/voice/AudioPrompt';
import { playUrl, schedule } from '@/components/voice/player';
import { SpeakButton } from '@/components/voice/SpeakButton';
import { VoiceNumberInput } from '@/components/voice/VoiceNumberInput';
import { estimateToRange, mannToKg, perMannToPerKg } from '@/lib/format';
import type { Grade, ReferencePrice } from '@/lib/types';
import { clipUrl, type ClipId } from '@/lib/voice/clips';
import { readBackListing, type ReadyWhen } from '@/lib/voice/phrases';
import { BigButton } from './BigButton';
import { GradeCard } from './GradeCard';
import { ListingSummary } from './ListingSummary';
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
}

/** Local calendar date + n days as YYYY-MM-DD. */
function isoPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const READY_DAYS: Record<ReadyWhen, [number, number]> = { this_week: [0, 6], next_week: [7, 13], two_weeks: [14, 20] };

const GRADES: Grade[] = ['A', 'B', 'C'];

export function SellWizard({ referencePrices }: { referencePrices: ReferencePrice[] }) {
  const [step, setStep] = useState<Step>('crop');
  const [s, setS] = useState<SellState>({ qtyValue: null, unit: 'mann', ready: null, expectedGrade: null, minPricePerMann: null, transcripts: [] });
  const [busy, setBusy] = useState(false);
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
      voiceTranscript: s.transcripts.join(' | ') || undefined,
    });
    setBusy(false);
    if (res.ok) go('done');
    else void schedule(() => playUrl(clipUrl('error_generic')), 'now');
  }

  if (step === 'done') {
    return (
      <div className="flex flex-col items-center gap-6 pt-10 text-center">
        <AudioPrompt clip="listing_published" autoPlay />
        <span className="text-8xl">✅</span>
        <Link href="/f" className="flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-[#15803d] text-3xl font-bold text-white">
          🏠
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      <div className="flex items-center justify-between py-3">
        <StepDots total={STEPS.length} current={idx} />
        {step === 'review' ? null : <AudioPrompt key={step} clip={CLIP[step]} autoPlay />}
      </div>

      <div className="flex-1">
        {step === 'crop' ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={next}
              className="col-span-2 flex min-h-40 items-center justify-center rounded-3xl border-4 border-[#15803d] bg-green-50 text-8xl active:scale-[0.98]"
              aria-label="آلو / Potato"
            >
              🥔
            </button>
            {['🧅', '🌾', '🍅', '🥕'].map((e) => (
              <div key={e} className="flex min-h-24 items-center justify-center rounded-3xl border-2 border-stone-200 bg-stone-100 text-5xl opacity-40 grayscale" aria-hidden>
                {e}
              </div>
            ))}
          </div>
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
          <div className="flex flex-col gap-3">
            {GRADES.map((g) => (
              <GradeCard
                key={g}
                grade={g}
                selected={s.expectedGrade === g}
                onSelect={() => {
                  update({ expectedGrade: g });
                  go('price');
                }}
              />
            ))}
          </div>
        ) : null}

        {step === 'price' ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <RefPriceCard refPrice={lahore} />
              </div>
              <AudioPrompt clip="price_reference" autoPlay />
            </div>
            <VoiceNumberInput
              field="price"
              unit="mann"
              value={s.minPricePerMann}
              onChange={(v, t) => update({ minPricePerMann: v, transcripts: addTranscript(t) })}
            />
          </div>
        ) : null}

        {step === 'review' && s.ready && s.expectedGrade && s.minPricePerMann ? (
          <div className="flex flex-col gap-4">
            <div className="flex justify-center gap-4">
              <SpeakButton autoPlay text={readBackListing({ estimateKg, ready: s.ready, minPricePerMann: s.minPricePerMann })} />
              <AudioPrompt clip="confirm_hint" autoPlay />
            </div>
            <ListingSummary estimateKg={estimateKg} ready={s.ready} expectedGrade={s.expectedGrade} minPricePerMann={s.minPricePerMann} />
          </div>
        ) : null}
      </div>

      <div className="sticky bottom-0 flex flex-col gap-3 bg-stone-50 py-4">
        {step === 'review' ? (
          <>
            <BigButton variant="go" icon="✓" busy={busy} onClick={publish}>
              ٹھیک ہے
            </BigButton>
            <BigButton variant="plain" icon="✎" disabled={busy} onClick={() => go('qty')}>
              بدلیں
            </BigButton>
          </>
        ) : (
          <>
            {step !== 'crop' ? (
              <BigButton variant="go" icon="✓" disabled={!canNext} onClick={next} aria-label="آگے / Next" />
            ) : null}
            {step !== 'crop' ? (
              <BigButton variant="plain" icon="→" onClick={back} aria-label="واپس / Back" />
            ) : (
              <Link href="/f" className="flex min-h-16 w-full items-center justify-center rounded-2xl border-2 border-stone-300 bg-white text-3xl" aria-label="واپس / Back">
                →
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
