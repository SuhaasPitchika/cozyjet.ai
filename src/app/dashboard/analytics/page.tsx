"use client";

import React from "react";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from "recharts";
import { 
  BarChart2, TrendingUp, Users, Target, 
  Calendar, ArrowUpRight, Share2, MoreHorizontal 
} from "lucide-react";
import { Button } from "@/components/ui/button";

const SEVEN_DAY_DATA = [
  { day: "Mon", engagement: 1200, reach: 4500 },
  { day: "Tue", engagement: 1900, reach: 5200 },
  { day: "Wed", engagement: 1500, reach: 4800 },
  { day: "Thu", engagement: 2100, reach: 6100 },
  { day: "Fri", engagement: 2400, reach: 7200 },
  { day: "Sat", engagement: 1800, reach: 5100 },
  { day: "Sun", engagement: 1400, reach: 4200 },
];

const PLATFORM_COMPARE = [
  { platform: "Twitter", posts: 45, engagement: 8.2 },
  { platform: "LinkedIn", posts: 32, engagement: 12.4 },
  { platform: "Instagram", posts: 18, engagement: 5.6 },
  { platform: "YouTube", posts: 12, engagement: 15.1 },
  { platform: "Reddit", posts: 8, engagement: 10.2 },
];

const TOP_POSTS = [
  { id: 1, title: "Building JWT Auth with Refresh Tokens", platform: "Twitter", date: "Mar 24", likes: 1200, comments: 85, shares: 12, rate: 12.4 },
  { id: 2, title: "Why founders should build in public", platform: "LinkedIn", date: "Mar 22", likes: 850, comments: 42, shares: 8, rate: 9.8 },
  { id: 3, title: "CozyJet.AI Dev Log #4", platform: "YouTube", date: "Mar 20", likes: 2100, comments: 142, shares: 45, rate: 15.2 },
];

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-8 p-8 bg-[#0a0a0c] text-white overflow-y-auto h-screen pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Analytics</h1>
          <p className="text-white/40 mt-1">Track your content momentum and growth across platforms.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">Export CSV</Button>
          <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold">Last 30 Days</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Posts", value: "115", change: "+12%", icon: Calendar },
          { label: "Avg Engagement", value: "9.4%", change: "+2.4%", icon: BarChart2 },
          { label: "Total Reach", value: "48.2K", change: "+18%", icon: Users },
          { label: "Best Platform", value: "LinkedIn", change: "Top", icon: Target },
        ].map((k) => (
          <div key={k.label} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <k.icon className="text-emerald-500/60" size={20} />
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                {k.change} <ArrowUpRight size={12} />
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold">{k.value}</div>
              <div className="text-[11px] uppercase tracking-widest text-white/30 font-medium mt-1">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8 p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="font-semibold text-lg">Engagement Growth</h3>
             <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] uppercase text-white/40 font-bold">Current Window</span>
             </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SEVEN_DAY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="day" stroke="#ffffff30" fontSize={11} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#ffffff30" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "12px", fontSize: "12px" }} 
                   itemStyle={{ color: "#10b981" }}
                />
                <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-6 text-center">
            <h3 className="font-semibold text-lg text-left">Platform Power</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PLATFORM_COMPARE} layout="vertical">
                   <XAxis type="number" hide />
                   <YAxis dataKey="platform" type="category" stroke="#ffffff30" fontSize={11} axisLine={false} tickLine={false} width={70} />
                   <Tooltip 
                     cursor={{ fill: 'transparent' }}
                     contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "12px", fontSize: "12px" }}
                   />
                   <Bar dataKey="engagement" radius={[0, 4, 4, 0]} barSize={20}>
                      {PLATFORM_COMPARE.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 1 ? "#10b981" : "#ffffff10"} />
                      ))}
                   </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Engagement Rate (%)</p>
        </div>
      </div>

      {/* Top Posts Table */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
        <h3 className="font-semibold text-lg mb-6">Top Performing Posts</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] uppercase tracking-widest text-white/30 font-bold border-b border-white/5">
              <tr>
                <th className="pb-4">Post Title</th>
                <th className="pb-4">Platform</th>
                <th className="pb-4">Likes</th>
                <th className="pb-4">Comments</th>
                <th className="pb-4">Rate</th>
                <th className="pb-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {TOP_POSTS.map((post) => (
                <tr key={post.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group">
                  <td className="py-4 font-medium max-w-xs truncate">{post.title}</td>
                  <td className="py-4"><span className="px-2 py-0.5 rounded-lg bg-white/5 text-[10px] border border-white/5">{post.platform}</span></td>
                  <td className="py-4 font-mono">{post.likes}</td>
                  <td className="py-4 font-mono">{post.comments}</td>
                  <td className="py-4 text-emerald-400 font-bold">{post.rate}%</td>
                  <td className="py-4 text-right">
                     <Button variant="ghost" size="sm" className="group-hover:bg-white/5 opacity-40 group-hover:opacity-100">
                        <Share2 size={14} />
                     </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
