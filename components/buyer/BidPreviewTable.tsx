// Pakka Sauda: live bid preview (grade x value at low / mid / high), token and fee, all from lib/settle.ts. Owner: D.
import { DemoBadge } from '@/components/shared/DemoBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatRs } from '@/lib/format';
import type { BidPreview } from '@/lib/settle';

export function BidPreviewTable({ preview, feePercent }: { preview: BidPreview; feePercent: number }) {
  const cell = (v: number | null) => (v == null ? <span className="text-stone-400">not accepted</span> : formatRs(v));
  return (
    <div className="flex flex-col gap-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Grade</TableHead>
            <TableHead>Rs/kg</TableHead>
            <TableHead className="text-right">At low</TableHead>
            <TableHead className="text-right">At mid</TableHead>
            <TableHead className="text-right">At high</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {preview.rows.map((r) => (
            <TableRow key={r.grade}>
              <TableCell className="font-semibold">{r.grade}</TableCell>
              <TableCell>{r.pricePerKg ?? '–'}</TableCell>
              <TableCell className="text-right">{cell(r.valueAtLow)}</TableCell>
              <TableCell className="text-right">{cell(r.valueAtMid)}</TableCell>
              <TableCell className="text-right">{cell(r.valueAtHigh)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        Token if accepted: <span className="font-semibold">{formatRs(preview.tokenAmount)}</span> <DemoBadge />
      </div>
      <div className="text-sm text-stone-600">
        Platform fee {feePercent}% at expected mid: {formatRs(preview.feeAtExpectedMid)} (you pay {formatRs(preview.buyerPaysAtExpectedMid)})
      </div>
    </div>
  );
}
