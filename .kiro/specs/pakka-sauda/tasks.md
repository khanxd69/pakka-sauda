# Tasks: Pakka Sauda MVP

Each task maps to a step in `context/phases/*.md`, which holds the full instructions (Read first / Files / Do / Done when). **Before you run a task, open its step and follow it exactly.** Workstream letters are in brackets. Only run tasks for your own workstream. Run A's money and state tasks one at a time.

## Phase 0: Foundation
- [ ] 0.1 [A] Scaffold, install all deps, shadcn components (step A0.1)
  - _Requirements: all_
- [ ] 0.2 [A] Copy the context pack and reference files; scripts; tsconfig/eslint excludes; root layout (step A0.2)
- [ ] 0.3 [A] Verify typecheck, 48 tests and build (step A0.3)
- [ ] 0.4 [A] Commit, tag contracts-v1, create the ws/* branches (step A0.4)
- [ ] 0.5 [A] Deploy to Vercel (step A0.5)
- [ ] 0.6 [A] Run schema, seed, prices and storage SQL; env vars (step A0.6)
- [ ] 0.7 [B] Farmer images and tooling (step B0.1)
- [ ] 0.8 [C] Uplift TTS smoke test (C0.1), phone test and STT format (C0.2), generate the MP3s (C0.3)
- [ ] 0.9 [D] AMIS prices (D0.1); Codex laptop and pitch skeleton (D0.2)

## Phase 1: Core loop (Checkpoint 1)
- [ ] 1.1 [A] Real read queries (A1.1) — _Requirements: 2, 3, 4, 10_
- [ ] 1.2 [A] Login flow on real data (A1.2) — _Requirements: 1_
- [ ] 1.3 [A] createListing (A1.3) — _Requirements: 2.3_
- [ ] 1.4 [A] placeBid and withdrawBid (A1.4) — _Requirements: 3_
- [ ] 1.5 [A] acceptBid via the accept_bid RPC (A1.5) — _Requirements: 4.3_
- [ ] 1.6 [A] payToken and transition.ts live (A1.6) — _Requirements: 5, 9_
- [ ] 1.7 [B] Farmer layout and building blocks (B1.1) — _Requirements: 2.1_
- [ ] 1.8 [B] F1 home (B1.2)
- [ ] 1.9 [B] Sell wizard F2–F6 (B1.3) — _Requirements: 2.2, 2.3_
- [ ] 1.10 [B] F7 read-back and publish (B1.4) — _Requirements: 2.4_
- [ ] 1.11 [B] F8 offers and accept (B1.5) — _Requirements: 4_
- [ ] 1.12 [B] F9 sauda card and list (B1.6) — _Requirements: 5_
- [ ] 1.13 [C] VoiceNumberInput number pad (C1.1) — _Requirements: 2.5_
- [ ] 1.14 [C] AudioPrompt final and MP3s (C1.2) — _Requirements: 2.1_
- [ ] 1.15 [C] TTS route and the real SpeakButton (C1.3) — _Requirements: 2.4, 4.1_
- [ ] 1.16 [C] Urdu wording and NUMBER_STYLE (C1.4)
- [ ] 1.17 [C] Mic input, 45-minute cap (C1.5) — _Requirements: 2.5_
- [ ] 1.18 [D] Choose-user page (D1.1) — _Requirements: 1.1_
- [ ] 1.19 [D] Buyer nav and /market (D1.2) — _Requirements: 11.1_
- [ ] 1.20 [D] /market/[id] and BidForm with preview (D1.3) — _Requirements: 3_
- [ ] 1.21 [D] /bids (D1.4)
- [ ] 1.22 [D] /saudas list and detail with Pay token (D1.5) — _Requirements: 5.2_

## Phase 2: Settlement and disputes (Checkpoint 2)
- [ ] 2.1 [A] Checkpoint 1 fixes (A2.1)
- [ ] 2.2 [A] recordCollection (A2.2) — _Requirements: 6.1_
- [ ] 2.3 [A] farmerConfirm and farmerDispute (A2.3) — _Requirements: 6.3, 6.4, 7.1_
- [ ] 2.4 [A] confirmBalanceReceived (A2.4) — _Requirements: 6.5_
- [ ] 2.5 [A] resolveDispute (A2.5) — _Requirements: 7.3_
- [ ] 2.6 [A] cancelSauda code path (A2.6) — _Requirements: 9_
- [ ] 2.7 [B] F10 collection confirm (B2.1) — _Requirements: 6.2_
- [ ] 2.8 [B] Dispute sheet and F10b (B2.2) — _Requirements: 7.1_
- [ ] 2.9 [B] F11 balance, settled and cancelled (B2.3) — _Requirements: 6.5_
- [ ] 2.10 [B] List and home polish (B2.4)
- [ ] 2.11 [C] Mic hardening (C2.1)
- [ ] 2.12 [C] Voice on F9–F11 with B (C2.2)
- [ ] 2.13 [C] Offline and error audio (C2.3)
- [ ] 2.14 [D] Collection form with settle preview (D2.1) — _Requirements: 6.1_
- [ ] 2.15 [D] Status panels (D2.2)
- [ ] 2.16 [D] /admin dashboard (D2.3) — _Requirements: 10.1_
- [ ] 2.17 [D] Dispute evidence and ruling (D2.4) — _Requirements: 7.2, 7.3_

## Phase 3: P1 trust features (freeze at 4:15)
- [ ] 3.1 [A] resetDemo (A3.5), uploadEvidence (A3.3), token expiry (A3.1), setVerified (A3.4), cancelListing/rejectBid (A3.6), cancel paths e2e (A3.2) — _Requirements: 5.3, 8, 10.2_
- [ ] 3.2 [B] Collection code (B3.1), dispute photos (B3.2), draft (B3.3), decline offer and history (B3.4) — _Requirements: 8_
- [ ] 3.3 [C] CameraCapture (C3.1), TTS budget (C3.2) — _Requirements: 8.1_
- [ ] 3.4 [D] Reset and users (D3.3), photos and evidence (D3.1), cancel buttons (D3.2), pitch (D3.4) — _Requirements: 8, 10.2_

## Phase 4: Demo prep
- [ ] 4.1 [All] Freeze merge, two rehearsals, backup video, final slides (phase-4-demo-prep.md)
