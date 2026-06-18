'use client';

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
  Clock,
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const stats = [
  {
    title: 'Cases Assigned',
    value: '124',
    icon: FileText,
    trend: '+12%',
    color: 'text-blue-600',
    bg: 'bg-blue-100'
  },
  {
    title: 'Claims Reviewed',
    value: '4,520',
    icon: CheckCircle2,
    trend: '+25%',
    color: 'text-green-600',
    bg: 'bg-green-100'
  },
  {
    title: 'Total Deductions',
    value: '12.4M',
    icon: TrendingUp,
    trend: '+8%',
    color: 'text-indigo-600',
    bg: 'bg-indigo-100'
  },
  {
    title: 'Urgent Cases',
    value: '12',
    icon: AlertCircle,
    trend: '+18%',
    color: 'text-red-600',
    bg: 'bg-red-100'
  },
];

const barData = [
  { name: 'Mon', completed: 4, pending: 2 },
  { name: 'Tue', completed: 7, pending: 5 },
  { name: 'Wed', completed: 5, pending: 8 },
  { name: 'Thu', completed: 10, pending: 4 },
  { name: 'Fri', completed: 12, pending: 3 },
  { name: 'Sat', completed: 2, pending: 1 },
  { name: 'Sun', completed: 1, pending: 1 },
];

const lineData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
];

const categoryData = [
  { name: 'Pharmacology', value: 2400000, color: '#4f46e5' },
  { name: 'RSSB Rules', value: 1100000, color: '#10b981' },
  { name: 'Fraud', value: 700000, color: '#ef4444' },
  { name: 'Documentation', value: 400000, color: '#f59e0b' },
];

const officerData = [
  { name: 'Officer A', claims: 200, deductions: 350000 },
  { name: 'Officer B', claims: 180, deductions: 280000 },
  { name: 'Officer C', claims: 250, deductions: 410000 },
  { name: 'Officer D', claims: 150, deductions: 190000 },
];

export default function DashboardPage() {
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
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.trend}
                </span>
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
            <CardTitle>Verification Progress</CardTitle>
            <CardDescription>Case review completion across active cases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">Case #CV-2024-001 (Pharmacy A)</span>
                <span className="text-slate-500">450/1000 claims</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">Case #CV-2024-002 (Clinic B)</span>
                <span className="text-slate-500">820/900 claims</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '91%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">Case #CV-2024-003 (Pharmacy C)</span>
                <span className="text-slate-500">120/1500 claims</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '8%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deduction Category Analysis</CardTitle>
            <CardDescription>Distribution of findings by category (RWF)</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
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

      <Card>
        <CardHeader>
          <CardTitle>Officer Productivity</CardTitle>
          <CardDescription>Comparison of claims reviewed and deductions identified</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
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
        </CardContent>
      </Card>

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
                    <p className="text-sm font-medium">Case #CV-2024-00{i} was reassigned</p>
                    <p className="text-xs text-slate-500">2 hours ago by Admin User</p>
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
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-xs font-bold text-red-800">Critical Error</p>
                  <p className="text-xs text-red-700">Deduction calculation mismatch in Case #042</p>
                </div>
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
