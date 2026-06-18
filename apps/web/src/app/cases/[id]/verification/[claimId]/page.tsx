import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { verificationService } from '@/services/verification';
import type { Finding } from '@/types/verification';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF' }).format(value);
}

export default async function ClaimVerificationPage({
  params,
}: {
  params: Promise<{ id: string; claimId: string }>;
}) {
  const { id: caseId, claimId } = await params;
  const detail = await verificationService.getClaimVerificationDetail(caseId, claimId);

  if (!detail) {
    notFound();
  }

  const { claim, findings, stats } = detail;

  return (
    <main className="space-y-6 p-8">
      <div className="space-y-2">
        <Link className="text-sm text-blue-600" href={`/cases/${caseId}/verification`}>Back to verification queue</Link>
        <h1 className="text-3xl font-bold tracking-tight">Claim {claim.claim_number}</h1>
        <p className="text-slate-500">Patient: {claim.patient_name}</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Original Amount</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{formatCurrency(claim.total_amount)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Claim Adjustments</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{formatCurrency(findings.reduce((total, finding) => total + finding.adjustment_amount, 0))}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Case Verified Amount</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{formatCurrency(stats.verifiedAmount)}</CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Adjustment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {findings.map((finding: Finding) => (
                <TableRow key={finding.id}>
                  <TableCell>{finding.category}</TableCell>
                  <TableCell>{finding.finding_type}</TableCell>
                  <TableCell><Badge variant="outline">{finding.severity}</Badge></TableCell>
                  <TableCell>{finding.status}</TableCell>
                  <TableCell className="text-right">{formatCurrency(finding.adjustment_amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {findings.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No findings recorded for this claim.</p>}
        </CardContent>
      </Card>
    </main>
  );
}
