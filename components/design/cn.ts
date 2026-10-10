// Pakka Sauda design system: tiny class joiner (no dependency).
export const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');
