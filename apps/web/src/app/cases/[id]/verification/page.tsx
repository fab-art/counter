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

  useEffect(() => {
    fetchClaims();
  }, [caseId]);

  async function fetchClaims() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('case_id', caseId);

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

  const filteredClaims = claims.filter(claim => {
    const matchesSearch =
      (claim.claimNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (claim.patientName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || claim.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shadow-none gap-1"><CheckCircle2 className="h-3 w-3" /> VERIFIED</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 shadow-none gap-1"><Clock className="h-3 w-3" /> IN PROGRESS</Badge>;
      case 'FLAGGED':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 shadow-none gap-1"><Flag className="h-3 w-3" /> FLAGGED</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 shadow-none gap-1"><AlertCircle className="h-3 w-3" /> UNREVIEWED</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/cases/${caseId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Verification Workspace</h1>
            <p className="text-slate-500">Case ID: {caseId} • Review and verify claims</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="gap-2">
             <Filter className="h-4 w-4" /> Filter
           </Button>
           <Button className="bg-indigo-600 hover:bg-indigo-700">
             Submit Case Verification
           </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Claim Queue</CardTitle>
              <CardDescription>Select a claim to begin verification</CardDescription>
            </div>
            <div className="flex items-center gap-3 w-full max-w-xs sm:max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search by ID or Patient..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 sm:pb-0">
            {['ALL', 'UNREVIEWED', 'IN_PROGRESS', 'VERIFIED', 'FLAGGED'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="text-xs whitespace-nowrap"
              >
                {status.replace('_', ' ')}
              </Button>
            ))}
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead className="hidden md:table-cell">Practitioner</TableHead>
                  <TableHead>Insurance Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-600" />
                    </TableCell>
                  </TableRow>
                ) : filteredClaims.length > 0 ? (
                  filteredClaims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-medium">{claim.claimNumber}</TableCell>
                      <TableCell>{claim.patientName}</TableCell>
                      <TableCell className="hidden md:table-cell">{claim.practitionerName}</TableCell>
                      <TableCell>{(claim.insuranceAmount || 0).toLocaleString()} RWF</TableCell>
                      <TableCell>{getStatusBadge(claim.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/cases/${caseId}/verification/${claim.id}`}>
                            Open Review <ExternalLink className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No claims found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
