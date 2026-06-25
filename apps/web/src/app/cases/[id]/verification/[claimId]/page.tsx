'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Loader2,
  FileText,
  Calendar,
  User,
  AlertCircle,
  Plus,
  Trash2,
  Calculator,
  ArrowLeft
} from 'lucide-react';
import { verificationService, Finding } from '@/services/verification';
import { supabase } from '@/lib/supabase';
import { claimRepository } from '@/repositories/claim.repository';
import { findingRepository } from '@/repositories/finding.repository';
import { useOfflineSync } from '@/lib/offline-sync';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface UI_Finding {
  id: string | number;
  category: Finding['category'];
  type: string;
  description: string;
  adjustment: number;
}

export default function ClaimReviewPage({ params }: { params: { id: string, claimId: string } }) {
  const { id: caseId, claimId } = params;

  const [claim, setClaim] = useState<any>(null);
  const [findings, setFindings] = useState<UI_Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddFindingOpen, setIsAddFindingOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verificationComment, setVerificationComment] = useState('');
  const [newFinding, setNewFinding] = useState({
    category: '' as Finding['category'],
    type: '',
    description: '',
    adjustment: 0
  });

  const fetchClaimData = useCallback(async () => {
    setLoading(true);
    try {
      const claimData = await claimRepository.findById(claimId);
      setClaim(claimData);

      const findingsData = await findingRepository.findByClaimId(claimId);
      if (findingsData) {
        setFindings(findingsData.map((f: any) => ({
           id: f.id,
           category: f.category,
           type: f.finding_type,
           description: f.description,
           adjustment: f.adjustment_amount
        })));
      }
    } catch (error: any) {
      console.error('Error fetching claim data:', error);
      toast.error('Failed to load claim data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [claimId]);

  useEffect(() => {
    fetchClaimData();
  }, [claimId, fetchClaimData]);

  const { queueFinding, queueStatusUpdate } = useOfflineSync(fetchClaimData);

  const totalAdjustments = findings.reduce((sum, f) => sum + f.adjustment, 0);
  const verifiedAmount = (claim?.insurance_copayment || 0) - totalAdjustments;

  const handleAddFinding = async () => {
    if (!newFinding.category || !newFinding.type || !newFinding.description) {
      toast.error('Category, type, and description are required');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || '00000000-0000-0000-0000-000000000000';

      const findingData: any = {
        claimId,
        caseId,
        category: newFinding.category,
        findingType: newFinding.type,
        description: newFinding.description,
        adjustmentAmount: newFinding.adjustment,
        severity: 'MEDIUM',
        status: 'OPEN',
        createdBy: userId
      };

      if (navigator.onLine) {
        await verificationService.createFinding(findingData);
        toast.success('Finding recorded in database');
      } else {
        queueFinding(findingData);
      }

      await fetchClaimData();
      setIsAddFindingOpen(false);
      setNewFinding({ category: '' as any, type: '', description: '', adjustment: 0 });
    } catch (error: any) {
      toast.error(error.message || 'Failed to add finding');
    }
  };

  const removeFinding = async (id: string | number) => {
    try {
      if (typeof id === 'string') {
        await findingRepository.delete(id);
        await fetchClaimData();
      } else {
        setFindings(findings.filter(f => f.id !== id));
      }
      toast.success('Finding removed');
    } catch (error) {
      toast.error('Failed to remove finding');
    }
  };

  const handleSubmitVerification = async () => {
    // Data quality check: If there are findings, a comment is mandatory
    if (findings.length > 0 && verificationComment.length < 10) {
      toast.error('A detailed comment (min 10 chars) is mandatory when findings are present.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      const status = findings.length > 0 ? 'FLAGGED' : 'VERIFIED';

      if (navigator.onLine) {
        await verificationService.updateClaimStatus(claimId, status, userId);
        toast.success(`Claim ${status.toLowerCase()} successfully`);
      } else {
        queueStatusUpdate(claimId, status);
      }

      // Redirect back after short delay
      setTimeout(() => {
        window.location.href = `/cases/${caseId}/verification`;
      }, 2000);

    } catch (err: any) {
      toast.error('Failed to submit verification: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !claim) {
    return (
      <div className="h-full flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <main className="space-y-6 p-8">
      <div className="space-y-2">
        <Link className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1" href={`/cases/${caseId}/verification`}>
          <ArrowLeft className="h-4 w-4" /> Back to verification queue
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Claim {claim?.claim_number}</h1>
            <p className="text-slate-500">Patient: {claim?.patient_name}</p>
          </div>
          <Badge variant={claim?.status === 'VERIFIED' ? 'default' : claim?.status === 'FLAGGED' ? 'destructive' : 'outline'}>
            {claim?.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" /> Claim Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-y-4 text-sm sm:text-base">
                <div>
                  <p className="text-xs sm:text-sm text-slate-500">Paper Code</p>
                  <p className="font-medium text-slate-900">{claim?.paper_code}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-slate-500">Service Date</p>
                  <p className="font-medium text-slate-900 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {claim?.service_date || claim?.dispensing_date}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-slate-500">Patient</p>
                  <p className="font-medium text-slate-900 flex items-center gap-1">
                    <User className="h-3 w-3" /> {claim?.patient_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-slate-500">RAMA Number</p>
                  <p className="font-medium text-slate-900">{claim?.rama_number}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-slate-500">Practitioner</p>
                  <p className="font-medium text-slate-900">{claim?.practitioner_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" /> Verification Findings
                </CardTitle>
                <CardDescription>Record discrepancies or violations identified during review</CardDescription>
              </div>
              <Dialog open={isAddFindingOpen} onOpenChange={setIsAddFindingOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" /> Add Finding
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-white">
                  <DialogHeader>
                    <DialogTitle>Add New Finding</DialogTitle>
                    <DialogDescription>
                      Record a discrepancy for this claim.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        onValueChange={(v) => setNewFinding({...newFinding, category: v as Finding['category']})}
                        value={newFinding.category}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="PHARMACOLOGY">Pharmacology Compliance</SelectItem>
                          <SelectItem value="RSSB_RULES">RSSB Rules Compliance</SelectItem>
                          <SelectItem value="FRAUD">Fraud Detection</SelectItem>
                          <SelectItem value="DOCUMENTATION">Documentation Issues</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type">Finding Type</Label>
                      <Input
                        id="type"
                        placeholder="e.g. Overprescribing, Wrong dosage"
                        value={newFinding.type}
                        onChange={(e) => setNewFinding({...newFinding, type: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="adjustment">Adjustment Amount (RWF)</Label>
                      <Input
                        id="adjustment"
                        type="number"
                        value={newFinding.adjustment}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFinding({...newFinding, adjustment: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Detailed explanation..."
                        value={newFinding.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewFinding({...newFinding, description: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddFindingOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddFinding}>Save Finding</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {findings.length > 0 ? (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Adjustment</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {findings.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell className="text-xs">
                            <Badge variant="outline" className="font-normal">{f.category?.replace('_', ' ')}</Badge>
                          </TableCell>
                          <TableCell className="font-medium text-sm">{f.type}</TableCell>
                          <TableCell className="text-right text-red-600 font-medium">-{f.adjustment?.toLocaleString()} RWF</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => removeFinding(f.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
                  <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No findings recorded</p>
                  <p className="text-sm text-slate-400">Add a finding if you identify any discrepancies.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification Comments</CardTitle>
              <CardDescription>
                Provide context for your verification decision. Mandatory if findings are identified.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <Textarea
                placeholder="Enter verification notes..."
                className="min-h-[100px]"
                value={verificationComment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setVerificationComment(e.target.value)}
               />
               {findings.length > 0 && verificationComment.length < 10 && (
                 <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                   <AlertCircle className="h-3 w-3" /> Comment must be at least 10 characters long.
                 </p>
               )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-indigo-600" /> Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500">Total Claim Cost</span>
                 <span className="font-medium">{(claim?.total_amount || 0).toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500">Patient Copayment (15%)</span>
                 <span className="font-medium">{(claim?.patient_copayment || 0).toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold pt-2 border-t border-slate-200">
                 <span className="text-slate-900">Insurance Amount</span>
                 <span className="text-indigo-700">{(claim?.insurance_copayment || 0).toLocaleString()} RWF</span>
              </div>

              <div className="pt-4 space-y-3">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500">Total Deductions</span>
                   <span className="font-medium text-red-600">-{totalAdjustments.toLocaleString()} RWF</span>
                 </div>
                 <div className="flex justify-between items-center text-lg font-bold pt-3 border-t-2 border-white">
                   <span className="text-slate-900">Verified Amount</span>
                   <span className="text-green-600">{verifiedAmount.toLocaleString()} RWF</span>
                 </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
               <div className="w-full bg-white p-3 rounded-md border border-slate-200 text-xs text-slate-500 flex items-start gap-2">
                 <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                 <span>Submitting this verification will finalize the amounts and update the case summary.</span>
               </div>
               <Button
                 className="w-full"
                 size="lg"
                 onClick={handleSubmitVerification}
                 disabled={submitting}
               >
                 {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                 {findings.length > 0 ? 'Submit with Findings' : 'Verify Claim'}
               </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Claim Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <FileText className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">Claim imported</p>
                      <p className="text-[10px] text-slate-400">May 15, 2024</p>
                    </div>
                  </div>
                  {findings.length > 0 && (
                    <div className="flex gap-3">
                      <div className="h-6 w-6 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <AlertCircle className="h-3 w-3 text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">{findings.length} Finding(s) added</p>
                        <p className="text-[10px] text-slate-400">Just now</p>
                      </div>
                    </div>
                  )}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
