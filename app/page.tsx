// Presentation refresh; existing demo identity actions and data contracts are preserved.
import { ArrowDown, ArrowRight, Check, Handshake, Mic, ShieldCheck, Sprout, Store, Truck } from 'lucide-react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { UserCard } from '@/components/buyer/UserCard';
import { Wordmark } from '@/components/design/BrandMark';
import { HarvestScene } from '@/components/design/HarvestScene';
import { DemoBadge } from '@/components/shared/DemoBadge';
import { getProfiles } from '@/lib/queries';
import type { Profile, Role } from '@/lib/types';

export const dynamic = 'force-dynamic';

const GROUPS: Array<{ role: Role; title: string; blurb: string; icon: ReactNode; number: string }> = [
  { role: 'farmer', title: 'I’m a farmer', blurb: 'Your harvest. Your voice. Your choice.', icon: <Sprout />, number: '01' },
  { role: 'wholesaler', title: 'I’m a wholesaler', blurb: 'Find your next harvest, with clear terms.', icon: <Store />, number: '02' },
  { role: 'admin', title: 'I’m a reviewer', blurb: 'Help both sides reach a fair resolution.', icon: <ShieldCheck />, number: '03' },
];
const STEPS = [
  { icon: Mic, title: 'Say what you’re selling', text: 'Farmers list their potatoes with guided Urdu voice prompts.' },
  { icon: Handshake, title: 'Agree before collection', text: 'Compare bids and lock in a price for each grade.' },
  { icon: Truck, title: 'Weigh. Confirm. Settle.', text: 'The final amount follows the weight and agreed grade price.' },
];

export default async function ChooseUserPage() {
  let profiles: Profile[] = [];
  let profilesUnavailable = false;
  try {
    profiles = await getProfiles();
  } catch {
    // Keep the public landing page usable when demo services are unavailable.
    // No substitute identities or transactions are introduced.
    profilesUnavailable = true;
  }
  return (
    <div className="landing-page min-h-dvh">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-6 sm:px-8">
        <Link href="/" aria-label="Pakka Sauda home" className="shrink-0"><Wordmark sub="ROOTED IN TRUST" /></Link>
        <nav aria-label="Landing page" className="flex items-center gap-6 text-sm font-medium">
          <a href="#how-it-works" className="hidden text-ink-muted transition-colors hover:text-brand sm:block">How it works</a>
          <a href="#choose-user" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand/20 bg-surface px-3 text-xs text-brand transition-colors hover:bg-brand-soft sm:px-5 sm:text-sm">Explore the demo <ArrowRight className="hidden size-4 sm:block" aria-hidden /></a>
        </nav>
      </header>
      <main id="main-content" className="mx-auto max-w-7xl px-5 sm:px-8">
        <section className="grid items-center gap-10 py-10 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:py-16" aria-labelledby="hero-title">
          <div className="flex flex-col items-start">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/15 bg-brand-soft px-3.5 py-2 text-xs font-semibold tracking-wide text-brand"><Sprout className="size-4 shrink-0" aria-hidden /> FROM OKARA’S FIELDS TO LAHORE’S BUYERS</span>
            <h1 id="hero-title" className="hero-title max-w-xl text-5xl leading-[1.08] tracking-[-0.055em] text-ink sm:text-6xl lg:text-7xl">A good harvest.<br />A <span className="text-brand">better deal.</span></h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-muted sm:text-lg">Connect farmers and wholesalers through Urdu voice. Agree on the terms before the truck arrives, and trade with clarity.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#choose-user" className="primary-link inline-flex min-h-14 items-center gap-3 rounded-full bg-brand px-7 text-sm font-semibold text-white transition-all hover:bg-brand-hover">Find your place in the market <ArrowRight className="size-4 shrink-0" aria-hidden /></a>
              <a href="#how-it-works" className="inline-flex min-h-12 items-center gap-2 text-sm font-medium text-ink-muted hover:text-brand">See how it works <ArrowDown className="size-4" aria-hidden /></a>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-ink-muted">
              {['Urdu voice guided', 'Prices agreed by grade', 'Human dispute review'].map((text) => <span key={text} className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-brand" aria-hidden />{text}</span>)}
            </div>
          </div>
          <div className="hero-art relative isolate mb-5">
            <div className="overflow-hidden rounded-[2rem] border border-brand/10 bg-brand-soft"><HarvestScene /></div>
            <div className="absolute -bottom-5 left-4 right-4 flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card sm:left-7 sm:right-7 sm:p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand"><ShieldCheck className="size-6" aria-hidden /></span>
              <div><p className="text-sm font-semibold text-ink">Clear terms. From field to final payment.</p><p className="mt-1 text-xs text-ink-muted">Weighed kg × agreed price for the grade</p></div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="scroll-mt-8 border-y border-line py-9 lg:mt-7" aria-label="How it works">
          <div className="grid gap-7 md:grid-cols-3 md:gap-8">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-earth-soft text-brand"><Icon className="size-5" strokeWidth={1.7} aria-hidden /></span>
                <div><span className="text-[10px] font-bold tracking-[0.18em] text-earth-dark">STEP 0{i + 1}</span><h2 className="mt-1 text-sm font-semibold text-ink">{title}</h2><p className="mt-2 text-sm leading-relaxed text-ink-muted">{text}</p></div>
              </div>
            ))}
          </div>
        </section>
        <section id="choose-user" className="scroll-mt-8 py-14 sm:py-16" aria-labelledby="demo-title">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div><p className="mb-2 text-xs font-semibold tracking-[0.16em] text-brand">ONE MARKET. THREE PERSPECTIVES.</p><h2 id="demo-title" className="text-3xl font-semibold tracking-tight text-ink">Make yourself at home.</h2><p className="mt-3 text-sm text-ink-muted">Choose who you are. No password: this is a demo.</p></div>
            <DemoBadge text="Demo environment: simulated payments" />
          </div>
          {profilesUnavailable ? <div role="status" className="mb-5 rounded-2xl border border-attn/20 bg-attn-soft p-4 text-sm text-attn">Demo sign-in is currently unavailable. The local app needs its Supabase environment configured to load demo users.</div> : null}
          <div className="grid gap-5 lg:grid-cols-3">
            {GROUPS.map((g) => (
              <section key={g.role} className="role-card flex min-w-0 flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
                <div className="p-6"><div className="mb-5 flex items-center justify-between"><span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand [&_svg]:size-6 [&_svg]:stroke-[1.5]">{g.icon}</span><span className="text-xs font-medium tracking-wider text-ink-muted">{g.number}</span></div><h3 className="text-xl font-semibold tracking-tight text-ink">{g.title}</h3><p className="mt-2 text-sm text-ink-muted">{g.blurb}</p></div>
                <div className="mx-3 mb-3 flex flex-1 flex-col gap-1 border-t border-line pt-2">
                  {profiles.filter((p) => p.role === g.role).map((p) => <UserCard key={p.id} profile={p} />)}
                  {profiles.filter((p) => p.role === g.role).length === 0 ? <p className="px-3 py-5 text-sm text-ink-muted">{profilesUnavailable ? 'Connect demo services to choose a user.' : 'No demo users available.'}</p> : null}
                </div>
              </section>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-line bg-surface/60"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-7 text-xs text-ink-muted sm:px-8"><span className="flex items-center gap-2"><Sprout className="size-4 text-brand" aria-hidden />Pakka Sauda · Harvest deals, clearly agreed.</span><span>All prices ILLUSTRATIVE unless marked AMIS.</span></div></footer>
    </div>
  );
}
