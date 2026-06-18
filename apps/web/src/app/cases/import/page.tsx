'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { importService, ImportResult } from '@/services/import';
import { authService } from '@/services/auth';
import { toast } from 'sonner';

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Authentication required');

      // Mock case ID for demo/pilot
      const caseId = '00000000-0000-0000-0000-000000000001';

      const res = await importService.processImport(file, caseId, user.id);
      setResult(res);

      if (res.errors.length === 0) {
        toast.success(`Successfully imported ${res.success} claims`);
      } else {
        toast.warning(`Imported ${res.success} claims with ${res.errors.length} errors`);
      }
    } catch (err: any) {
      toast.error('Import failed: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 p-8 max-w-4xl mx-auto">
      <div>
        <Link className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 mb-2" href="/cases">
          <ArrowLeft className="h-4 w-4" /> Back to Cases
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Bulk Data Import</h1>
        <p className="text-slate-500 mt-2">Import thousands of claim records from Excel or CSV files.</p>
      </div>

      {!result ? (
        <Card>
          <CardHeader>
            <CardTitle>Upload Claim Data</CardTitle>
            <CardDescription>
              Supported formats: .xlsx, .xls, .csv. Ensure column headers match: claim_number, patient_name, patient_id, total_amount.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <div className="border-2 border-dashed rounded-lg p-10 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center">
                  <Upload className="h-10 w-10 text-slate-400 mb-4" />
                  <p className="text-sm font-medium text-slate-900">
                    {file ? file.name : "Click to select or drag and drop"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Excel or CSV up to 50MB</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <Button variant="outline">Download Template</Button>
            <Button
                onClick={handleImport}
                disabled={!file || importing}
                className="bg-blue-600"
            >
              {importing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Start Import'
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-blue-50 border-blue-100">
              <CardContent className="pt-6">
                <p className="text-xs font-semibold text-blue-600 uppercase">Total Records</p>
                <p className="text-3xl font-bold">{result.total}</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-100">
              <CardContent className="pt-6">
                <p className="text-xs font-semibold text-green-600 uppercase">Successful</p>
                <p className="text-3xl font-bold">{result.success}</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-100">
              <CardContent className="pt-6">
                <p className="text-xs font-semibold text-red-600 uppercase">Errors</p>
                <p className="text-3xl font-bold">{result.errors.length}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.errors.length === 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                )}
                Import Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.errors.length > 0 ? (
                <div className="space-y-4">
                   <p className="text-sm text-slate-600">The following rows could not be imported:</p>
                   <div className="max-h-[300px] overflow-y-auto rounded-md border">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b">
                          <tr>
                            <th className="px-4 py-2 text-left">Row</th>
                            <th className="px-4 py-2 text-left">Error Message</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.errors.map((err, i) => (
                            <tr key={i} className="border-b last:border-0">
                              <td className="px-4 py-2 font-mono">{err.row}</td>
                              <td className="px-4 py-2 text-red-600">{err.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-600">All records were imported successfully without errors.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t p-6 gap-3">
              <Button variant="outline" onClick={() => setResult(null)}>Import Another File</Button>
              <Button asChild className="bg-blue-600">
                 <Link href="/cases">View Imported Claims</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
