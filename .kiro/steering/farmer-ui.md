---
inclusion: fileMatch
fileMatchPattern: ["app/f/**", "components/farmer/**", "components/voice/**"]
---
# Farmer UI rules (apply to every farmer-facing screen)

The farmer may not be able to read. He uses a cheap Android phone outdoors on a weak connection.

1. **Audio first.** Every screen plays its prompt on open (`<AudioPrompt clip=... autoPlay />`) and shows a large replay button. Dynamic content (amounts, offers) is spoken with `<SpeakButton text={phrases.x(...)} />`.
2. **One question per screen.** No forms with several fields. Use the wizard steps F2–F7.
3. **At most two primary actions**, and always the same two:
    - green ✓ = yes / continue (*ہاں / ٹھیک ہے*);
    - red ✗ or ✎ = no / change.

    Put them at the bottom, full width, at least 56 px tall.
4. **Pictures over words:** crop photo, grade photos (A/B/C), calendar tiles (this week / next week / two weeks). Text is a secondary label in Urdu.
5. **Numbers:** show them huge (text-5xl or more). Show quantity in kg *and* mann. Show prices per mann (Rs 1,800 / من) with per kg underneath. Use `formatRsPK` (South Asian grouping, e.g. 3,58,800).
6. **RTL:** `app/f/layout.tsx` sets `dir="rtl" lang="ur"` and the Noto Nastaliq Urdu font, with line-height 1.9 or more for Nastaliq. Numbers stay left-to-right (`dir="ltr"` on number spans).
7. **Confirm before commit.** Anything that creates or changes a deal goes through a read-back screen first (F7, accept, F10, F11).
8. **Never block on voice.** If the mic or TTS fails, play `mic_retry` / `error_generic` and keep the number pad working.
9. **Weak network:**
    - show a spinner on a button after a tap and disable double taps;
    - on error, play `error_generic` and keep the entered data.

    P1: save the listing draft to `localStorage`.
10. **Colours:** green #15803d = go, red #b91c1c = stop/dispute, amber background for audio buttons. Contrast must meet WCAG AA.
11. **Layout:** 360 px width first. No horizontal scroll. No hover-only interactions.
12. Use the **Urdu strings** from `lib/voice/clips.json` (fixed) and `lib/voice/phrases.ts` (dynamic). Don't invent new Urdu text in components. If you need a new phrase, request it from C.
