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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { claimRepository } from '@/repositories/claim.repository';
import { verificationService } from '@/services/verification';
import { toast } from 'sonner';

export default function SupervisorReviewQueue() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviewQueue = async () => {
    setLoading(true);
    try {
      const { data } = await claimRepository.findMany({
        status: 'UNDER_SUPERVISOR_REVIEW'
      });
      setClaims(data || []);
    } catch (error) {
      console.error('Error fetching review queue:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewQueue();
  }, []);

  const handleAction = async (claimId: string, action: 'APPROVE' | 'REJECT' | 'ESCALATE') => {
    try {
      let nextStatus = '';
      if (action === 'APPROVE') nextStatus = 'SUPERVISOR_APPROVED';
      else if (action === 'REJECT') nextStatus = 'SUPERVISOR_REJECTED';
      else nextStatus = 'ESCALATED';

      await verificationService.updateClaimStatus(claimId, nextStatus);
      toast.success(`Claim ${action.toLowerCase()}d successfully`);
      fetchReviewQueue();
    } catch (error) {
      toast.error(`Failed to ${action.toLowerCase()} claim`);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Supervisor Review Queue</h1>
        <p className="text-slate-500 mt-2">Review and authorize flagged or high-risk claim verifications.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Reviews ({claims.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim Number</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.length > 0 ? (
                claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">{claim.claim_number}</TableCell>
                    <TableCell>{claim.patient_name}</TableCell>
                    <TableCell>
                      <Badge variant={claim.risk_score > 70 ? 'destructive' : 'secondary'}>
                        {claim.risk_score} - {claim.risk_category}
                      </Badge>
                    </TableCell>
                    <TableCell>{(Number(claim.total_amount || 0) - Number(claim.insurance_copayment || 0)).toLocaleString()} RWF</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" asChild>
                         <Link href={`/cases/${claim.case_id}/verification/${claim.id}`}>
                            <ExternalLink className="h-4 w-4 mr-1" /> View
                         </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="text-green-600" onClick={() => handleAction(claim.id, 'APPROVE')}>
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleAction(claim.id, 'REJECT')}>
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                    No claims currently awaiting review.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
