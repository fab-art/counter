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
  Line
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
    title: 'Cases Completed',
    value: '86',
    icon: CheckCircle2,
    trend: '+5%',
    color: 'text-green-600',
    bg: 'bg-green-100'
  },
  {
    title: 'Pending Review',
    value: '38',
    icon: Clock,
    trend: '-2%',
    color: 'text-amber-600',
    bg: 'bg-amber-100'
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
            <CardDescription>Cases completed vs pending this week</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Case Volume Trends</CardTitle>
            <CardDescription>Monthly referral volume</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
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
