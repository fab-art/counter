'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  User,
  History,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { use } from 'react';

export default function CaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cases">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-3">
             <h1 className="text-3xl font-bold tracking-tight">CV-2024-001</h1>
             <Badge className="bg-indigo-100 text-indigo-700 shadow-none">IN PROGRESS</Badge>
             <Badge className="bg-red-50 text-red-600 border border-red-100 shadow-none">HIGH PRIORITY</Badge>
          </div>
          <p className="text-slate-500 mt-1">Pharmacy A - Voucher Discrepancy (ID: {resolvedParams.id})</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="vouchers">Vouchers (0)</TabsTrigger>
              <TabsTrigger value="findings">Findings</TabsTrigger>
              <TabsTrigger value="deductions">Deductions</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed">
                    Routine counter-verification for Pharmacy A identified a significant mismatch in the number of reported vouchers versus physically submitted vouchers for the month of February 2024. Preliminary review suggests a discrepancy of approximately 15%.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                   <CardTitle>Case Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    <div className="relative pl-10">
                      <div className="absolute left-0 top-1 h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Case Created</p>
                        <p className="text-xs text-slate-500">March 1, 2024 at 10:30 AM</p>
                      </div>
                    </div>
                    <div className="relative pl-10">
                      <div className="absolute left-0 top-1 h-9 w-9 rounded-full bg-green-100 flex items-center justify-center border-4 border-white">
                        <User className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Assigned to John Doe</p>
                        <p className="text-xs text-slate-500">March 1, 2024 at 11:15 AM</p>
                      </div>
                    </div>
                    <div className="relative pl-10">
                      <div className="absolute left-0 top-1 h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white">
                        <History className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Status changed to In Progress</p>
                        <p className="text-xs text-slate-500">March 2, 2024 at 09:00 AM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500">Referral Source</span>
                 <span className="font-medium">Monthly Audit</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500">Entity Name</span>
                 <span className="font-medium">Pharmacy A</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500">Created By</span>
                 <span className="font-medium">System Admin</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500">Last Updated</span>
                 <span className="font-medium">2 days ago</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 border rounded-md text-sm hover:bg-slate-50 cursor-pointer">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span className="flex-1 truncate">referral_report.pdf</span>
                </div>
                <Button variant="outline" className="w-full text-xs h-8">Upload Document</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
