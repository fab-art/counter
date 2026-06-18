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
  Loader2,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { dataService } from '@/services/data';
import { downloadCSV, downloadExcel, downloadPDF } from '@/lib/export-utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ReportsPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (reportId: string, format: 'CSV' | 'EXCEL' | 'PDF') => {
    const loadKey = `${reportId}-${format}`;
    setLoading(loadKey);
    try {
        let data: any[] = [];
        let title = '';
        let fileName = '';

        if (reportId === 'daily') {
            const res = await dataService.getClaims({ startDate: new Date().toISOString().split('T')[0] });
            data = res.data || [];
            title = 'Daily Verification Report';
            fileName = `daily-report-${new Date().toISOString().split('T')[0]}`;
        } else if (reportId === 'facility') {
            const res = await dataService.getFacilities();
            data = res.data || [];
            title = 'Facility Performance Report';
            fileName = 'facility-performance-report';
        } else if (reportId === 'productivity') {
            const res = await dataService.getVerificationDashboard();
            data = (res.data as any)?.officerMetrics || [];
            title = 'Counter Productivity Report';
            fileName = 'productivity-report';
        }

        if (data.length === 0) {
            alert('No data available for this report.');
            setLoading(null);
            return;
        }

        if (format === 'CSV') downloadCSV(data as any, `${fileName}.csv`);
        else if (format === 'EXCEL') downloadExcel(data as any, `${fileName}.xlsx`);
        else if (format === 'PDF') downloadPDF(data as any, title, `${fileName}.pdf`);

    } catch (err) {
        console.error(err);
    } finally {
        setLoading(null);
    }
  };

  const reports = [
    {
      id: 'daily',
      title: 'Daily Verification Report',
      description: 'Summary of all verifications processed today.',
      icon: Calendar,
    },
    {
      id: 'facility',
      title: 'Facility Performance Report',
      description: 'Verification outcomes grouped by healthcare facility.',
      icon: Building2,
    },
    {
      id: 'productivity',
      title: 'Counter Productivity Report',
      description: 'Performance metrics for all technical officers.',
      icon: Users,
    }
  ];

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Advanced Reporting Center</h1>
        <p className="text-slate-500 mt-2">Generate, schedule, and export comprehensive operational and financial reports.</p>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="w-full" disabled={loading !== null && (loading as string).startsWith(report.id)}>
                        {loading && (loading as string).startsWith(report.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <FileDown className="h-4 w-4 mr-2" />
                        )}
                        Generate Report
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuItem onClick={() => handleExport(report.id, 'CSV')}>
                        <FileText className="mr-2 h-4 w-4" /> Export CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport(report.id, 'EXCEL')}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel (XLSX)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport(report.id, 'PDF')}>
                        <FileText className="mr-2 h-4 w-4" /> Export PDF
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Report Schedules</CardTitle>
              <CardDescription>Manage automated recurring report exports.</CardDescription>
            </div>
            <Button variant="outline" size="sm">Create Schedule</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 border-2 border-dashed rounded-lg bg-slate-50 text-slate-500">
             No report schedules configured yet.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
