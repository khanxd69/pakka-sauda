// Pakka Sauda: route guard. Owner: Workstream A. Reads the demo role cookie only (no database call).
import { NextResponse, type NextRequest } from 'next/server';

const RULES: Array<[prefix: string, role: string]> = [
  ['/f', 'farmer'],
  ['/market', 'wholesaler'],
  ['/saudas', 'wholesaler'],
  ['/bids', 'wholesaler'],
  ['/admin', 'admin'],
];

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const rule = RULES.find(([prefix]) => path === prefix || path.startsWith(prefix + '/'));
  if (!rule) return NextResponse.next();
  const role = req.cookies.get('ps_role')?.value;
  if (role !== rule[1]) return NextResponse.redirect(new URL('/', req.url));
  return NextResponse.next();
}

export const config = { matcher: ['/f/:path*', '/market/:path*', '/saudas/:path*', '/bids/:path*', '/admin/:path*'] };
