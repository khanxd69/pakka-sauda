// Pakka Sauda: GET /api/voice/tts?text=... Owner: Workstream C. PHASE 0 STUB (501). Contract: context/project/04-contracts.md section 6.
// Clients treat any non-200 as "fall back to the browser voice".
export async function GET() {
  return new Response(JSON.stringify({ error: 'NOT_IMPLEMENTED' }), { status: 501, headers: { 'content-type': 'application/json' } });
}
