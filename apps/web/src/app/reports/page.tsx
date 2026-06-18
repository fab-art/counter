'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
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
  FileDown,
  BarChart3,
  Building2,
  Users,
  Calendar,
  Loader2
} from 'lucide-react';
import { dataService } from '@/services/data';
import { convertToCSV, downloadCSV } from '@/lib/export-utils';

export default function ReportsPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const reports = [
    {
      id: 'daily',
      title: 'Daily Verification Report',
      description: 'Summary of all verifications processed today.',
      icon: Calendar,
      action: async () => {
        setLoading('daily');
        const { data } = await dataService.getClaims({ startDate: new Date().toISOString().split('T')[0] });
        if (data) {
          const csv = convertToCSV(data);
          downloadCSV(csv, `daily-report-${new Date().toISOString().split('T')[0]}.csv`);
        }
        setLoading(null);
      }
    },
    {
      id: 'facility',
      title: 'Facility Performance Report',
      description: 'Verification outcomes grouped by healthcare facility.',
      icon: Building2,
      action: async () => {
        setLoading('facility');
        const { data } = await dataService.getFacilities();
        if (data) {
          const csv = convertToCSV(data);
          downloadCSV(csv, 'facility-performance-report.csv');
        }
        setLoading(null);
      }
    },
    {
      id: 'productivity',
      title: 'Counter Productivity Report',
      description: 'Performance metrics for all technical officers.',
      icon: Users,
      action: async () => {
        setLoading('productivity');
        // This would typically call a specific reporting endpoint
        const { data } = await dataService.getVerificationDashboard();
        if (data?.officerMetrics) {
          const csv = convertToCSV(data.officerMetrics);
          downloadCSV(csv, 'productivity-report.csv');
        }
        setLoading(null);
      }
    }
  ];

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reporting Module</h1>
        <p className="text-slate-500 mt-2">Generate and export operational reports for the RSSB pilot.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                <report.icon className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>{report.title}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={report.action}
                className="w-full"
                disabled={loading !== null}
              >
                {loading === report.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileDown className="h-4 w-4 mr-2" />
                )}
                Export CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Exports</CardTitle>
              <CardDescription>A log of your recently generated reports.</CardDescription>
            </div>
            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date Generated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Daily-Verification-2024-05-20</TableCell>
                <TableCell>Daily</TableCell>
                <TableCell>May 20, 2024</TableCell>
                <TableCell>Completed</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Download</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Facility-Monthly-Summary</TableCell>
                <TableCell>Facility</TableCell>
                <TableCell>May 18, 2024</TableCell>
                <TableCell>Completed</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Download</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
