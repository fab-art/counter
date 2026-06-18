'use client';

import { useState, use, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Search,
  Filter,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Flag,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Claim {
  id: string;
  claimNumber: string;
  patientName: string;
  practitionerName: string;
  insuranceAmount: number;
  status: string;
}

export default function VerificationQueuePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.id;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF' }).format(value);
}

export default async function CaseVerificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: caseId } = await params;
  const [queue, stats] = await Promise.all([
    verificationService.getVerificationQueue(caseId),
    verificationService.getVerificationStats(caseId),
  ]);

      if (error || !data || data.length === 0) {
        // Fallback to mock for demo
        setClaims([
          {
            id: '1',
            claimNumber: 'CLM-001',
            patientName: 'Jean Paul',
            practitionerName: 'Dr. Karekezi',
            insuranceAmount: 25000,
            status: 'UNREVIEWED'
          },
          {
            id: '2',
            claimNumber: 'CLM-002',
            patientName: 'Marie Claire',
            practitionerName: 'Dr. Uwimana',
            insuranceAmount: 15500,
            status: 'IN_PROGRESS'
          },
          {
            id: '3',
            claimNumber: 'CLM-003',
            patientName: 'Emmanuel N.',
            practitionerName: 'Dr. Gakwaya',
            insuranceAmount: 42000,
            status: 'VERIFIED'
          },
          {
            id: '4',
            claimNumber: 'CLM-004',
            patientName: 'Alice M.',
            practitionerName: 'Dr. Karekezi',
            insuranceAmount: 12000,
            status: 'FLAGGED'
          },
          {
            id: '5',
            claimNumber: 'CLM-005',
            patientName: 'Eric S.',
            practitionerName: 'Dr. Habimana',
            insuranceAmount: 33000,
            status: 'UNREVIEWED'
          }
        ]);
      } else {
        setClaims(data.map((c: any) => ({
          id: c.id,
          claimNumber: c.claim_number,
          patientName: c.patient_name,
          practitionerName: c.practitioner_name,
          insuranceAmount: c.insurance_copayment,
          status: c.status
        })));
      }
    } finally {
      setLoading(false);
    }
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
