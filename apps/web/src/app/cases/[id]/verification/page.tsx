'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Loader2,
  ArrowLeft,
  X
} from 'lucide-react';
import Link from 'next/link';
import { verificationService } from '@/services/verification';
import { VerificationSession, VerificationStats } from '@/types/verification';

interface Claim {
  id: string;
  claimNumber: string;
  patientName: string;
  patientId: string;
  practitionerName: string;
  insuranceAmount: number;
  status: string;
}

export default function VerificationQueuePage({ params }: { params: { id: string } }) {
  const caseId = params.id;
  const [searchTerm, setSearchTerm] = useState('');
  const [patientIdSearch, setPatientIdSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<VerificationStats | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedStats, fetchedQueue] = await Promise.all([
        verificationService.getVerificationStats(caseId),
        verificationService.getVerificationQueue(caseId, {
          claimNumber: searchTerm,
          patientId: patientIdSearch,
          status: statusFilter
        })
      ]);

      setStats(fetchedStats);

      setClaims(fetchedQueue.map((session: VerificationSession) => ({
        id: session.claim.id,
        claimNumber: session.claim.claim_number,
        patientName: session.claim.patient_name,
        patientId: session.claim.patient_id,
        practitionerName: session.claim.practitioner_name || 'N/A',
        insuranceAmount: session.claim.insurance_copayment || 0,
        status: session.claim.status
      })));
    } catch (error) {
      console.error('Error fetching verification queue:', error);
    } finally {
      setLoading(false);
    }
  }, [caseId, searchTerm, patientIdSearch, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF' }).format(value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPatientIdSearch('');
    setStatusFilter('ALL');
  };

  if (loading && claims.length === 0) {
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
            <div className="text-2xl font-bold">{stats?.totalClaims || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.verifiedClaims || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Flagged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.flaggedClaims || 0}</div>
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
                  placeholder="Search claim number..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant={showAdvancedFilters ? "secondary" : "outline"}
                size="icon"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
              {(searchTerm || patientIdSearch || statusFilter !== 'ALL') && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500">
                  <X className="h-4 w-4 mr-1" /> Clear
                </Button>
              )}
            </div>
          </div>

          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-slate-50 rounded-lg border">
               <div>
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Patient ID</label>
                <Input
                  placeholder="Enter Patient ID"
                  value={patientIdSearch}
                  onChange={(e) => setPatientIdSearch(e.target.value)}
                />
               </div>
               <div>
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="UNREVIEWED">Unreviewed</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="VERIFIED">Verified</SelectItem>
                    <SelectItem value="FLAGGED">Flagged</SelectItem>
                  </SelectContent>
                </Select>
               </div>
               <div className="flex items-end">
                  <p className="text-xs text-slate-500 italic">Filters apply automatically as you type.</p>
               </div>
            </div>
          )}
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
                {claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">{claim.claimNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{claim.patientName}</p>
                        <p className="text-xs text-slate-500">ID: {claim.patientId}</p>
                      </div>
                    </TableCell>
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
          {claims.length === 0 && !loading && (
            <div className="text-center py-10 text-slate-500">
              No claims found matching your criteria.
            </div>
          )}
          {loading && claims.length > 0 && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
