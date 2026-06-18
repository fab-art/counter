'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  Search,
  Filter,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { verificationService } from '@/services/verification';
import { VerificationSession, VerificationStats } from '@/types/verification';

interface Claim {
  id: string;
  claimNumber: string;
  patientName: string;
  practitionerName: string;
  insuranceAmount: number;
  status: string;
}

export default function VerificationQueuePage({ params }: { params: { id: string } }) {
  const caseId = params.id;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter] = useState('ALL');
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<VerificationStats | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedStats, fetchedQueue] = await Promise.all([
        verificationService.getVerificationStats(caseId),
        verificationService.getVerificationQueue(caseId)
      ]);

      setStats(fetchedStats);

      if (fetchedQueue.length === 0) {
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
        setClaims(fetchedQueue.map((session: VerificationSession) => ({
          id: session.claim.id,
          claimNumber: session.claim.claim_number,
          patientName: session.claim.patient_name,
          practitionerName: session.claim.practitioner_name || 'N/A',
          insuranceAmount: session.claim.insurance_copayment || 0,
          status: session.claim.status
        })));
      }
    } catch (error) {
      console.error('Error fetching verification queue:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [caseId]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF' }).format(value);
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch =
      claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.patientName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || claim.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <main className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <Link className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 mb-2" href="/cases">
            <ArrowLeft className="h-4 w-4" /> Back to Cases
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Verification Workspace</h1>
          <p className="text-slate-500">Case ID: {caseId}</p>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalClaims || claims.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.verifiedClaims || claims.filter(c => c.status === 'VERIFIED').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Flagged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.flaggedClaims || claims.filter(c => c.status === 'FLAGGED').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Adjustments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatCurrency(stats?.totalAdjustments || 0)}</div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Verification Queue</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search claims..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim Number</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Practitioner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">{claim.claimNumber}</TableCell>
                    <TableCell>{claim.patientName}</TableCell>
                    <TableCell>{claim.practitionerName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          claim.status === 'VERIFIED' ? 'default' :
                          claim.status === 'FLAGGED' ? 'destructive' :
                          claim.status === 'IN_PROGRESS' ? 'secondary' : 'outline'
                        }
                      >
                        {claim.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(claim.insuranceAmount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/cases/${caseId}/verification/${claim.id}`}>
                          Review
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredClaims.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              No claims found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
