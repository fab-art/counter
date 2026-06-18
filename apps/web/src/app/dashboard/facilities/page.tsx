'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { supabase } from '@/lib/supabase';

export default function FacilityMonitoring() {
  const [metrics, setMetrics] = useState<any[]>([]);

  useEffect(() => {
    async function fetchFacilityMetrics() {
      const { data } = await supabase
        .from('facility_metrics')
        .select('*, facilities(name)');
      setMetrics(data || []);
    }
    fetchFacilityMetrics();
  }, []);

  const chartData = metrics.map(m => ({
    name: (m as any).facilities?.name || 'Unknown',
    rejected: m.claims_rejected,
    approved: m.claims_approved
  }));

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold tracking-tight">Facility Monitoring Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Approval vs Rejection by Facility</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="approved" fill="#10b981" name="Approved" />
                <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rejection Trends (Weekly)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
             <div className="h-full flex items-center justify-center text-slate-400 italic">
               Trend visualization coming soon...
             </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Facility Performance Table</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facility</TableHead>
                <TableHead>Total Submitted</TableHead>
                <TableHead>Approved</TableHead>
                <TableHead>Rejected</TableHead>
                <TableHead>Deduction Value</TableHead>
                <TableHead>Risk Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{(m as any).facilities?.name}</TableCell>
                  <TableCell>{m.claims_submitted}</TableCell>
                  <TableCell className="text-green-600">{m.claims_approved}</TableCell>
                  <TableCell className="text-red-600">{m.claims_rejected}</TableCell>
                  <TableCell>{m.deduction_amount.toLocaleString()} RWF</TableCell>
                  <TableCell>
                    <Badge variant={m.claims_rejected > 50 ? 'destructive' : 'outline'}>
                      {m.claims_rejected > 50 ? 'High Risk' : 'Normal'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
