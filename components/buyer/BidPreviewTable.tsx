// Pakka Sauda: live bid preview (grade x value at low / mid / high), token and fee, all from lib/settle.ts. Owner: D.
import { num, th } from '@/components/design/DataTable';
import { KeyValueList } from '@/components/design/KeyValueList';
import { MoneyCell } from '@/components/design/MoneyCell';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatRs } from '@/lib/format';
import type { BidPreview } from '@/lib/settle';

export function BidPreviewTable({ preview, feePercent }: { preview: BidPreview; feePercent: number }) {
  const cell = (v: number | null) => (v == null ? <span className="text-ink-muted">Not accepted</span> : formatRs(v));
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-subtle/60 p-3">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">Deal value preview</span>
      <div className="overflow-x-auto rounded-md border border-line bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={th}>Grade</TableHead>
              <TableHead className={`${th} text-right`}>At low</TableHead>
              <TableHead className={`${th} text-right`}>At mid</TableHead>
              <TableHead className={`${th} text-right`}>At high</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.rows.map((r) => (
              <TableRow key={r.grade}>
                <TableCell className="font-medium">
                  {r.grade}
                  <span className="ms-2 text-xs font-normal text-ink-muted tabular-nums">{r.pricePerKg == null ? '' : `Rs ${r.pricePerKg}/kg`}</span>
                </TableCell>
                <TableCell className={num}>{cell(r.valueAtLow)}</TableCell>
                <TableCell className={num}>{cell(r.valueAtMid)}</TableCell>
                <TableCell className={num}>{cell(r.valueAtHigh)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <KeyValueList
        items={[
          { label: 'Token if accepted', value: <MoneyCell amount={preview.tokenAmount} demo />, numeric: true, strong: true },
          { label: `Platform fee ${feePercent}% at expected mid`, value: formatRs(preview.feeAtExpectedMid), numeric: true },
          { label: 'You pay at expected mid', value: formatRs(preview.buyerPaysAtExpectedMid), numeric: true },
        ]}
      />
    </div>
  );
}
