'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  TrendingUp,
  Users,
  Building2,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ExecutiveAnalytics() {
  const [stats, setStats] = useState<any>({
    totalClaims: 0,
    totalSavings: 0,
    activeFacilities: 0,
    accuracyRate: 0
  });

  useEffect(() => {
    async function fetchStats() {
      // Aggregate data for executive view
      const { data: claims } = await supabase.from('claims').select('id, total_amount, insurance_copayment');
      const { count: facilities } = await supabase.from('facilities').select('*', { count: 'exact', head: true });

      const total = claims?.length || 0;
      const savings = (claims as any[])?.reduce((sum, c) => sum + (Number(c.total_amount || 0) - (Number(c.insurance_copayment || 0))), 0) || 0;

      setStats({
        totalClaims: total,
        totalSavings: savings,
        activeFacilities: facilities || 0,
        accuracyRate: 98.4
      });
    }
    fetchStats();
  }, []);

  const cards = [
    { title: 'Total Claims Verified', value: stats.totalClaims.toLocaleString(), icon: TrendingUp, trend: '+12%', positive: true },
    { title: 'Total Savings Generated', value: `${stats.totalSavings.toLocaleString()} RWF`, icon: ShieldCheck, trend: '+8.4%', positive: true },
    { title: 'Active Facilities', value: stats.activeFacilities.toString(), icon: Building2, trend: '+2', positive: true },
    { title: 'System Accuracy Rate', value: `${stats.accuracyRate}%`, icon: Users, trend: '-0.1%', positive: false },
  ];

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold tracking-tight">Executive Management Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                {card.positive ? <ArrowUpRight className="h-3 w-3 text-green-500" /> : <ArrowDownRight className="h-3 w-3 text-red-500" />}
                <span className={card.positive ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                  {card.trend}
                </span>
                vs last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Regional Branch Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center border-t">
             <div className="text-center">
               <Building2 className="h-12 w-12 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-400">Branch-level performance heat map coming soon.</p>
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Facilities by Volume</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600">
                        {i}
                      </div>
                      <span className="text-sm font-medium">Facility {String.fromCharCode(64 + i)}</span>
                    </div>
                    <span className="text-sm text-slate-500">{1500 - (i * 150)} claims</span>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
