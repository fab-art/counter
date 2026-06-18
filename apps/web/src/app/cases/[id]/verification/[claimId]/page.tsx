'use client';

import { useState, useEffect } from 'react';
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
  const [newFinding, setNewFinding] = useState({
    category: '' as Finding['category'],
    type: '',
    description: '',
    adjustment: 0
  });

  const fetchClaimData = async () => {
    setLoading(true);
    try {
      // Fetch claim
      const { data: claimData, error: claimError } = await supabase
        .from('claims')
        .select('*')
        .eq('id', claimId)
        .single();

      if (claimError) {
        // Fallback to mock for demo if not in DB yet
        setClaim({
          id: claimId,
          claim_number: 'CLM-001',
          paper_code: 'PC-99821',
          patient_name: 'Jean Paul',
          rama_number: '201-009283-01',
          practitioner_name: 'Dr. Karekezi',
          service_date: '2024-02-15',
          total_cost: 25000,
          patient_copayment: 3750,
          insurance_copayment: 21250,
          status: 'IN_PROGRESS'
        });
      } else {
        setClaim(claimData);
      }

      const { data: findingsData, error: findingsError } = await supabase
        .from('findings')
        .select('*')
        .eq('claim_id', claimId);

      if (!findingsError && findingsData) {
        setFindings(findingsData.map((f: any) => ({
           id: f.id,
           category: f.category,
           type: f.finding_type,
           description: f.description,
           adjustment: f.adjustment_amount
        })));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClaimData();
  }, [claimId]);

  const handleSync = async () => {
    if (!navigator.onLine) return;

    let syncPerformed = false;

    // Sync findings
    const offlineFindings = JSON.parse(localStorage.getItem('offline_findings_queue') || '[]');
    if (offlineFindings.length > 0) {
      toast.info('Back online. Synchronizing data...');
      const remainingFindings = [];
      for (const finding of offlineFindings) {
        try {
          await verificationService.createFinding(finding);
          syncPerformed = true;
        } catch (e) {
          console.error('Failed to sync finding:', e);
          remainingFindings.push(finding);
        }
      }
      if (remainingFindings.length > 0) {
        localStorage.setItem('offline_findings_queue', JSON.stringify(remainingFindings));
      } else {
        localStorage.removeItem('offline_findings_queue');
      }
    }

    // Sync status updates
    const offlineUpdates = JSON.parse(localStorage.getItem('offline_status_updates') || '{}');
    const remainingUpdates: Record<string, string> = {};
    const updateEntries = Object.entries(offlineUpdates);

    if (updateEntries.length > 0) {
      for (const [id, status] of updateEntries) {
        try {
          await verificationService.updateClaimStatus(id, status as any);
          syncPerformed = true;
        } catch (e) {
          console.error('Failed to sync status update:', e);
          remainingUpdates[id] = status as string;
        }
      }
      if (Object.keys(remainingUpdates).length > 0) {
        localStorage.setItem('offline_status_updates', JSON.stringify(remainingUpdates));
      } else {
        localStorage.removeItem('offline_status_updates');
      }
    }

    if (syncPerformed) {
      fetchClaimData();
      toast.success('Synchronization complete');
    }
  };

  useEffect(() => {
    handleSync();
    window.addEventListener('online', handleSync);
    return () => window.removeEventListener('online', handleSync);
  }, []);

  const totalAdjustments = findings.reduce((sum, f) => sum + f.adjustment, 0);
  const verifiedAmount = (claim?.insurance_copayment || 0) - totalAdjustments;

  const handleAddFinding = async () => {
    if (!newFinding.category || !newFinding.type) {
      toast.error('Please fill in all required fields');
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
        const offlineQueue = JSON.parse(localStorage.getItem('offline_findings_queue') || '[]');
        offlineQueue.push(findingData);
        localStorage.setItem('offline_findings_queue', JSON.stringify(offlineQueue));
        toast.info('Finding saved locally (offline mode)');
      }

      await fetchClaimData();
      setIsAddFindingOpen(false);
      setNewFinding({ category: '' as any, type: '', description: '', adjustment: 0 });
    } catch (error) {
      // Fallback for UI demo
      setFindings([...findings, { ...newFinding, id: Date.now() }]);
      setIsAddFindingOpen(false);
      setNewFinding({ category: '' as any, type: '', description: '', adjustment: 0 });
      toast.info('Finding added locally (offline mode)');
    }
  };

  const removeFinding = async (id: string | number) => {
    try {
      if (typeof id === 'string') {
        // Implementation for removing finding if needed
        await supabase.from('findings').delete().eq('id', id);
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
    setSubmitting(true);
    try {
      if (navigator.onLine) {
        await verificationService.updateClaimStatus(claimId, 'VERIFIED');
        toast.success('Claim verification submitted successfully');
      } else {
        const offlineUpdates = JSON.parse(localStorage.getItem('offline_status_updates') || '{}');
        offlineUpdates[claimId] = 'VERIFIED';
        localStorage.setItem('offline_status_updates', JSON.stringify(offlineUpdates));
        toast.info('Verification queued for sync (offline mode)');
      }
    } catch (error) {
      toast.success('Claim verification submitted (demo)');
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
        <h1 className="text-3xl font-bold tracking-tight">Claim {claim?.claim_number}</h1>
        <p className="text-slate-500">Patient: {claim?.patient_name}</p>
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
                    <Calendar className="h-3 w-3" /> {claim?.service_date}
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
                  <p className="font-medium text-slate-900">Dr. {claim?.practitioner_name}</p>
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
                        onChange={(e) => setNewFinding({...newFinding, adjustment: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Detailed explanation..."
                        value={newFinding.description}
                        onChange={(e) => setNewFinding({...newFinding, description: e.target.value})}
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
                 <span className="font-medium">{(claim?.total_cost || 0).toLocaleString()} RWF</span>
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
                 Submit Verification
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
                      <Plus className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">Claim imported</p>
                      <p className="text-[10px] text-slate-400">Today, 09:00 AM</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                      <FileText className="h-3 w-3 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">Review started</p>
                      <p className="text-[10px] text-slate-400">Today, 10:15 AM</p>
                    </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
