'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Activity,
  Loader2
} from 'lucide-react';
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
  Cell,
} from 'recharts';
import { dataService } from '@/services/data';

const categoryData = [
  { name: 'Pharmacology', value: 2400000, color: '#4f46e5' },
  { name: 'RSSB Rules', value: 1100000, color: '#10b981' },
  { name: 'Fraud', value: 700000, color: '#ef4444' },
  { name: 'Documentation', value: 400000, color: '#f59e0b' },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    async function fetchDashboard() {
      const { data, error } = await dataService.getVerificationDashboard();
      if (!error) {
        setDashboardData(data);
      }
      setLoading(false);
    }

    fetchDashboard();

    // Auto-refresh dashboard every 30 seconds
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Claims',
      value: dashboardData?.total?.toLocaleString() || '0',
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      title: 'Verified Today',
      value: dashboardData?.verifiedToday?.toLocaleString() || '0',
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      title: 'Total Verified',
      value: dashboardData?.verified?.toLocaleString() || '0',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100'
    },
    {
      title: 'Pending Review',
      value: dashboardData?.pending?.toLocaleString() || '0',
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-100'
    },
  ];

  const officerData = dashboardData?.officerMetrics?.map((m: any, i: number) => ({
    name: `Officer ${i + 1}`,
    claims: m.claims_reviewed,
    deductions: m.adjustments_generated
  })) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-2">Welcome back, here is what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className={stat.bg + " p-2 rounded-lg"}>
                  <stat.icon className={stat.color + " h-6 w-6"} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Officer Productivity</CardTitle>
            <CardDescription>Comparison of claims reviewed and deductions identified</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {officerData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={officerData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#4f46e5" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="claims" name="Claims Reviewed" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="deductions" name="Deductions (RWF)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No productivity data available yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deduction Category Analysis</CardTitle>
            <CardDescription>Distribution of findings by category (RWF)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                   formatter={(value: number) => `${value.toLocaleString()} RWF`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
               {categoryData.map((item) => (
                 <div key={item.name} className="flex items-center gap-1.5">
                   <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                   <span className="text-xs text-slate-500">{item.name}</span>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions in the system</CardDescription>
              </div>
              <Activity className="h-5 w-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center mt-1">
                    <TrendingUp className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Verification completed for CLM-00{i}</p>
                    <p className="text-xs text-slate-500">{i} hour{i > 1 ? 's' : ''} ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Notifications</CardTitle>
            <CardDescription>Unread alerts</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-xs font-bold text-blue-800">New Assignment</p>
                  <p className="text-xs text-blue-700">You have been assigned 5 new cases</p>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
