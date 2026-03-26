"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, TrendingDown, Eye, Heart, 
  MessageSquare, Share2, BarChart3, 
  Calendar as CalendarIcon, Filter, 
  Sparkles, SlidersHorizontal, Settings2,
  ArrowUpRight, ArrowDownRight, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

const KPIS = [
  { label: "Total Impressions", value: "142,501", trend: "+12.5%", status: "up", icon: Eye },
  { label: "Total Engagement", value: "8,242", trend: "+8.2%", status: "up", icon: Heart },
  { label: "Engagement Rate", value: "5.78%", trend: "-1.1%", status: "down", icon: Activity },
  { label: "Posts Published", value: "48", trend: "+33.3%", status: "up", icon: BarChart3 },
];

const VARIATION_PERFORMANCE = [
  { id: 0, label: "Emotional Storytelling", score: 7.2, color: "bg-indigo-600" },
  { id: 1, label: "Deeply Technical", score: 4.8, color: "bg-indigo-300" },
  { id: 2, label: "Measurable Outcomes", score: 6.5, color: "bg-slate-900" },
];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="flex-1 space-y-10 p-10 bg-[#fdfbf7] min-h-screen pb-40 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Performance Tracking</h1>
          <p className="text-sm text-slate-500 font-medium">Measuring the impact of your solo marketing automation.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-100 bg-white text-xs font-bold font-sans hover:bg-slate-50 transition-all shadow-sm">
              <CalendarIcon size={14} className="mr-2" /> LAST 30 DAYS
           </Button>
           <Button className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-widest uppercase shadow-xl shadow-indigo-500/10">
              <BarChart3 size={16} className="mr-2" /> EXPORT REPORT
           </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {KPIS.map((kpi, i) => (
           <motion.div 
             key={kpi.label}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col gap-6 group hover:border-indigo-100 transition-all"
           >
              <div className="flex items-center justify-between">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <kpi.icon size={24} />
                 </div>
                 <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                    kpi.status === "up" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                 )}>
                    {kpi.status === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {kpi.trend}
                 </div>
              </div>

              <div className="space-y-1">
                 <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">{kpi.label}</h3>
                 <p className="text-3xl font-headline font-bold text-slate-900 tracking-tight">{kpi.value}</p>
              </div>
           </motion.div>
         ))}
      </div>

      {/* Mid-Row Charts & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Variation Benchmark */}
         <div className="lg:col-span-2 p-10 rounded-[3rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-10 relative overflow-hidden">
            <div className="flex items-center justify-between">
               <div className="space-y-1">
                  <h3 className="text-xl font-headline font-bold text-slate-900">Variation Benchmark</h3>
                  <p className="text-xs text-slate-400 font-medium">Which Content Seed type resonates most?</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                  <Sparkles size={20} />
               </div>
            </div>

            <div className="space-y-8">
               {VARIATION_PERFORMANCE.map((item, i) => (
                 <div key={item.id} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                       <span className="text-slate-400">{item.label}</span>
                       <span className="text-slate-900">{item.score}% <span className="text-slate-300 ml-1">Engagement</span></span>
                    </div>
                    <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${item.score * 10}%` }}
                         transition={{ duration: 1.5, delay: 0.5 + i * 0.2, ease: "circOut" }}
                         className={cn("h-full rounded-full transition-all", item.color)}
                       />
                    </div>
                 </div>
               ))}
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
               <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-indigo-500 shrink-0">
                  <Activity size={18} />
               </div>
               <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  <strong>Meta Wisdom:</strong> Your <span className="text-indigo-600 font-bold">Storytelling</span> posts are currently outperforming Technical threads by 2.4%. We recommend increasing your Storytelling output on LinkedIn this week.
               </p>
            </div>
         </div>

         {/* Efficiency Summary */}
         <div className="p-10 rounded-[3rem] bg-indigo-600 text-white space-y-8 shadow-2xl shadow-indigo-600/30 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full -mr-20 -mt-20 blur-3xl opacity-20 transition-all group-hover:opacity-40" />
            
            <div className="space-y-2 relative z-10">
               <h3 className="text-2xl font-headline font-bold">CozyJet ROI</h3>
               <p className="text-indigo-100 text-xs font-medium">Time and value saved this month.</p>
            </div>

            <div className="space-y-6 relative z-10 flex-1">
               <div className="p-6 rounded-2xl bg-white/10 border border-white/20">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Time Saved</span>
                  <p className="text-4xl font-headline font-bold mt-1">42.5h</p>
                  <p className="text-[10px] font-bold text-white/50 mt-2">v.s. manual content creation</p>
               </div>
               
               <div className="p-6 rounded-2xl bg-white/10 border border-white/20">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Seeds Generated</span>
                  <p className="text-4xl font-headline font-bold mt-1">112</p>
                  <p className="text-[10px] font-bold text-white/50 mt-2">v.s. manual work tracking</p>
               </div>
            </div>

            <Button className="w-full h-14 rounded-2xl bg-white text-indigo-600 font-bold text-xs tracking-widest uppercase shadow-xl hover:bg-indigo-50 transition-all relative z-10">
               VIEW ACTIVITY LOG
            </Button>
         </div>
      </div>

      {/* Recent High-Performers */}
      <div className="space-y-6">
         <h3 className="text-xl font-headline font-bold text-slate-900 tracking-tight">Recent High-Performers</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="p-8 rounded-[2.5rem] bg-white border border-slate-100 group hover:border-indigo-100 transition-all shadow-xl shadow-slate-200/50"
              >
                 <div className="flex items-center justify-between mb-6">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-300">Published 2 Days Ago</span>
                    <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                       <ArrowUpRight size={14} />
                    </div>
                 </div>
                 <p className="text-sm font-bold text-slate-800 leading-relaxed line-clamp-3 mb-8">
                    "Just integrated the new AES-256 encryption service. The beauty of solo-builds is moving from idea to implementation in under 2 hours..."
                 </p>
                 <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex gap-4">
                       <div className="flex items-center gap-1.5 text-slate-400">
                          <Eye size={14} /> <span className="text-[10px] font-bold">1.2k</span>
                       </div>
                       <div className="flex items-center gap-1.5 text-slate-400">
                          <Heart size={14} /> <span className="text-[10px] font-bold">84</span>
                       </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[8px] font-bold uppercase tracking-widest">Storytelling</span>
                 </div>
              </motion.div>
            ))}
         </div>
      </div>
    </div>
  );
}
