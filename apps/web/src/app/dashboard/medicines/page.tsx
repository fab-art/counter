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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { supabase } from '@/lib/supabase';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function MedicineIntelligence() {
  const [metrics, setMetrics] = useState<any[]>([]);

  useEffect(() => {
    async function fetchMedicineMetrics() {
      const { data } = await supabase
        .from('medicine_metrics')
        .select('*')
        .order('utilization_count', { ascending: false })
        .limit(10);
      setMetrics(data || []);
    }
    fetchMedicineMetrics();
  }, []);

  const chartData = metrics.slice(0, 5).map(m => ({
    name: m.medicine_name.substring(0, 15),
    value: m.utilization_count
  }));

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold tracking-tight">Medicine Intelligence Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Utilized Medicines</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Frequently Flagged Medicines</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="medicine_code" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="flagged_count" fill="#f59e0b" name="Flags" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medicine Utilization & Risk Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead>Rejections</TableHead>
                <TableHead>Total Cost (RWF)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.medicine_name}</TableCell>
                  <TableCell className="font-mono text-xs">{m.medicine_code}</TableCell>
                  <TableCell>{m.utilization_count}</TableCell>
                  <TableCell className="text-amber-600 font-semibold">{m.flagged_count}</TableCell>
                  <TableCell className="text-red-600">{m.rejected_count}</TableCell>
                  <TableCell>{Number(m.total_cost || 0).toLocaleString()} RWF</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
