import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { verificationService } from '@/services/verification';
import type { VerificationSession } from '@/types/verification';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF' }).format(value);
}

export default async function CaseVerificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: caseId } = await params;
  const [queue, stats] = await Promise.all([
    verificationService.getVerificationQueue(caseId),
    verificationService.getVerificationStats(caseId),
  ]);

  if (!caseId) {
    notFound();
  }

  return (
    <main className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Verification Workspace</h1>
        <p className="mt-2 text-slate-500">Case ID: {caseId}</p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Total Claims</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{stats.totalClaims}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Verified</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{stats.verifiedClaims}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Flagged</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{stats.flaggedClaims}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Adjustments</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{formatCurrency(stats.totalAdjustments)}</CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Verification Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim Number</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map((session: VerificationSession) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <Link className="font-medium text-blue-600" href={`/cases/${caseId}/verification/${session.claim.id}`}>
                      {session.claim.claim_number}
                    </Link>
                  </TableCell>
                  <TableCell>{session.claim.patient_name}</TableCell>
                  <TableCell><Badge variant="outline">{session.claim.status}</Badge></TableCell>
                  <TableCell className="text-right">{formatCurrency(session.claim.total_amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {queue.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No claims are queued for this case.</p>}
        </CardContent>
      </Card>
    </main>
  );
}
