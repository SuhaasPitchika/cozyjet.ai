
"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer2,
  Calendar,
  AlertCircle
} from "lucide-react";

const DATA = [
  { name: 'Mon', engagement: 400, reach: 2400 },
  { name: 'Tue', engagement: 300, reach: 1398 },
  { name: 'Wed', engagement: 900, reach: 9800 },
  { name: 'Thu', engagement: 1480, reach: 3908 },
  { name: 'Fri', engagement: 1890, reach: 4800 },
  { name: 'Sat', engagement: 2390, reach: 3800 },
  { name: 'Sun', engagement: 3490, reach: 4300 },
];

const PLATFORM_DATA = [
  { name: 'LinkedIn', value: 4500, color: '#0A66C2' },
  { name: 'X', value: 3200, color: '#000000' },
  { name: 'Instagram', value: 2800, color: '#E4405F' },
  { name: 'YouTube', value: 1200, color: '#FF0000' },
];

export default function AnalyticsPage() {
  return (
    <div className="p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="font-headline text-4xl font-bold mb-2 uppercase tracking-tighter text-white">Network <span className="text-amber-500">Intelligence</span></h1>
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em]">Privacy-Preserving Distribution Analytics</p>
        </div>
        <div className="flex gap-2">
          {['7D', '30D', '90D', 'ALL'].map(t => (
            <Badge key={t} className={t === '30D' ? "bg-amber-500 text-black" : "bg-white/5 text-zinc-500 cursor-pointer hover:text-white"}>{t}</Badge>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Published', value: '42', trend: '+12%', icon: BarChart3 },
          { label: 'Impressions', value: '12.4K', trend: '+24%', icon: Eye },
          { label: 'Engagement', value: '892', trend: '+8%', icon: MousePointer2 },
          { label: 'Conversion', value: '4.2%', trend: '+1.5%', icon: TrendingUp },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="bg-zinc-900/50 border-white/5">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-lg bg-white/5 text-zinc-400"><kpi.icon className="w-4 h-4" /></div>
                  <span className="text-xs font-bold text-green-500">{kpi.trend}</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{kpi.value}</div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{kpi.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2 bg-zinc-900/50 border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-400">Engagement Velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DATA}>
                  <defs>
                    <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '8px', fontSize: '10px' }}
                    itemStyle={{ color: '#f59e0b' }}
                  />
                  <Area type="monotone" dataKey="engagement" stroke="#f59e0b" fillOpacity={1} fill="url(#colorEngage)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Platform Breakdown */}
        <Card className="bg-zinc-900/50 border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-400">Distribution Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PLATFORM_DATA} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#ffffff05' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {PLATFORM_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-amber-500/10 border-l-4 border-amber-500 rounded-xl flex gap-4">
          <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-white mb-1 uppercase">Optimal Posting Time</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">Your LinkedIn case studies get 3x more engagement than thought leadership posts. Consider shifting strategy toward deep-dives on Tuesdays at 9:00 AM.</p>
          </div>
        </div>
        <div className="p-6 bg-blue-500/10 border-l-4 border-blue-500 rounded-xl flex gap-4">
          <Calendar className="w-6 h-6 text-blue-500 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-white mb-1 uppercase">Voice Evolution</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">Your brand is trending 15% more "Authoritative" this month. Content including hard statistics is performing 40% higher than baseline.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
