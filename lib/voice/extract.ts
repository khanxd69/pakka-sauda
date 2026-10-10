// Pakka Sauda: turn a speech-to-text transcript into ONE field value. Owner: Workstream C. SERVER ONLY.
// Order: deterministic parser first (free, instant); LLM only if the parser finds nothing.
// The LLM reads the Urdu transcript directly. Do NOT translate to English first (one more place for numbers to break).
// The result is never trusted on its own: the farmer always hears a read-back and confirms.
import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { detectUnit, parseUrduNumber, type SpokenUnit } from './parse-number';

export type ExtractField = 'quantity' | 'price';
export interface ExtractResult {
  value: number | null;
  unit: SpokenUnit; // what the speaker said, if anything; the UI decides how to convert
  source: 'parser' | 'llm' | 'none';
}

const LlmAnswer = z.object({ value: z.number().positive().nullable(), unit: z.enum(['kg', 'mann']).nullable() });

const PROMPT = (field: ExtractField, transcript: string) => `You read numbers out of short Urdu speech transcripts from Pakistani farmers.
The farmer was asked for the ${field === 'quantity' ? 'quantity of potatoes (kg or mann; 1 mann = 40 kg)' : 'minimum price (rupees per mann or per kg)'}.
Transcript (may contain speech-recognition errors, Urdu script, Roman Urdu or digits):
"""${transcript}"""
Reply with JSON only: {"value": <number or null>, "unit": "kg" | "mann" | null}.
Rules: convert number words (e.g. "دس ہزار" = 10000, "ڈیڑھ سو" = 150, "ساڑھے تین ہزار" = 3500). Do not convert units. If unsure, value = null.`;

export async function extractField(transcript: string, field: ExtractField): Promise<ExtractResult> {
  const unit = detectUnit(transcript);
  const parsed = parseUrduNumber(transcript);
  if (parsed != null) return { value: parsed, unit, source: 'parser' };

  if (!process.env.ANTHROPIC_API_KEY) return { value: null, unit, source: 'none' };
  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: process.env.LLM_MODEL ?? 'claude-haiku-5-5',
      max_tokens: 100,
      messages: [{ role: 'user', content: PROMPT(field, transcript) }],
    });
    const text = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
    const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const answer = LlmAnswer.parse(JSON.parse(json));
    return { value: answer.value, unit: answer.unit ?? unit, source: answer.value == null ? 'none' : 'llm' };
  } catch {
    return { value: null, unit, source: 'none' };
  }
}
