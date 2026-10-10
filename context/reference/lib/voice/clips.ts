// Pakka Sauda: fixed Urdu prompts. Owner: Workstream C. The IDs are a FROZEN contract (B references them).
// Text lives in clips.json so scripts/generate-audio.mjs can read it. Audio files: public/audio/ur/<id>.mp3
// Urdu text should be checked by a native speaker before the demo.
import clips from './clips.json';

export const CLIPS = clips as Record<keyof typeof clips, { screen: string; ur: string; roman: string }>;
export type ClipId = keyof typeof clips;
export const clipUrl = (id: ClipId) => `/audio/ur/${id}.mp3`;
