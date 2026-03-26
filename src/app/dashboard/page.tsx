"use client";

import React, { useState } from "react";
import { 
  Sparkles, Zap, ArrowRight, Eye, 
  Heart, Calendar, Plus, MessageSquare,
  Activity, BarChart3, Clock, Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_STATS = [
  { label: "Views", value: "24.5k", icon: Eye, color: "text-indigo-600", bg: "bg-indigo-50" },
  { label: "Engagement", value: "1.2k", icon: Heart, color: "text-rose-600", bg: "bg-rose-50" },
  { label: "Growth", value: "+12%", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
];

export default function DashboardHome() {
  return (
    <div className="flex-1 space-y-12 p-12 bg-[#fdfbf7] min-h-screen pb-40 font-sans">
      {/* Greetings Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-2">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-2">
             <Rocket size={12} /> Live Strategy
           </div>
           <h1 className="text-4xl font-headline font-bold text-slate-900 tracking-tight">Welcome home, Creator.</h1>
           <p className="text-slate-500 font-medium">CozyJet is silently listening. You have <span className="text-indigo-600 font-bold">12 new content seeds</span> waiting for you.</p>
        </div>
        <div className="flex gap-4">
           <Button className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-widest uppercase shadow-2xl transition-all">
              <Sparkles size={16} className="mr-2" /> CREATE CONTENT
           </Button>
        </div>
      </div>

      {/* Main Grid Tier 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Skippy Feed Preview */}
         <div className="lg:col-span-2 p-10 rounded-[3rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-8 relative overflow-hidden group">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                     <Zap size={20} />
                  </div>
                  <h3 className="text-xl font-headline font-bold text-slate-900">Skippy Feed</h3>
               </div>
               <Button variant="ghost" className="text-slate-400 group-hover:text-indigo-600 transition-colors">VIEW ALL <ArrowRight size={14} className="ml-1" /></Button>
            </div>

            <div className="space-y-6">
               {[
                 { platform: "github", title: "New Feature: AES-256 Auth", time: "2h ago", tags: ["Technical", "Security"] },
                 { platform: "notion", title: "Product Vision Q4 Update", time: "5h ago", tags: ["Storytelling", "Planning"] },
                 { platform: "figma", title: "Landing Page Redesign v2", time: "1d ago", tags: ["Design", "Outcome"] },
               ].map((seed, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.1 + i * 0.1 }}
                   className="p-6 rounded-[2rem] border border-slate-50 bg-slate-50/30 hover:bg-white hover:border-indigo-100 transition-all flex items-center gap-6 group cursor-pointer"
                 >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                       <Plus size={20} />
                    </div>
                    <div className="flex-1">
                       <h4 className="font-bold text-slate-900 mb-1">{seed.title}</h4>
                       <div className="flex gap-2">
                          {seed.tags.map(tag => (
                            <span key={tag} className="text-[8px] font-black uppercase tracking-widest text-slate-400">{tag}</span>
                          ))}
                       </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{seed.time}</span>
                 </motion.div>
               ))}
            </div>
         </div>

         {/* Weekly Strategy Status */}
         <div className="p-10 rounded-[3rem] bg-indigo-600 text-white space-y-10 shadow-2xl shadow-indigo-600/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full -mr-20 -mt-20 blur-3xl opacity-20" />
            
            <div className="space-y-2 relative z-10">
               <h3 className="text-2xl font-headline font-bold">Weekly Blueprint</h3>
               <p className="text-indigo-100 text-xs font-medium">Progress towards goals.</p>
            </div>

            <div className="space-y-8 relative z-10 flex-1">
               <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                     <span className="text-indigo-200">Educate Target</span>
                     <span className="text-white">4 / 5</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full w-[80%] bg-indigo-300 rounded-full" />
                  </div>
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                     <span className="text-indigo-200">Entertain Target</span>
                     <span className="text-white">2 / 3</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full w-[66%] bg-indigo-300 rounded-full" />
                  </div>
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                     <span className="text-indigo-200">Outcome Shares</span>
                     <span className="text-white">1 / 2</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full w-[50%] bg-indigo-300 rounded-full" />
                  </div>
               </div>
            </div>

            <Button className="w-full h-14 rounded-2xl bg-white text-indigo-600 font-bold text-xs tracking-widest uppercase shadow-xl hover:bg-indigo-50 transition-all relative z-10">
               <Calendar size={16} className="mr-2" /> GO TO CALENDAR
            </Button>
         </div>
      </div>

      {/* KPI mini-row Grid Tier 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {MOCK_STATS.map((stat, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.5 + i * 0.1 }}
             className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between group hover:border-indigo-100 transition-all border-b-4 border-b-transparent hover:border-b-indigo-200"
           >
              <div className="space-y-1">
                 <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400">{stat.label}</h4>
                 <p className="text-3xl font-headline font-bold text-slate-900 tracking-tight">{stat.value}</p>
              </div>
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110", stat.bg, stat.color)}>
                 <stat.icon size={28} />
              </div>
           </motion.div>
         ))}
      </div>

      {/* Next Up Area Tier 3 */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-slate-900/40 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/50 to-transparent pointer-events-none" />
         <div className="relative z-10 space-y-4 max-w-xl text-center md:text-left">
            <h3 className="text-3xl font-headline font-bold tracking-tight">Ready for a thread storm?</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
               Snooks recommends a technical breakdown of your encryption service to engage your developer audience on LinkedIn.
            </p>
         </div>
         <Button className="shrink-0 h-16 px-12 rounded-2xl bg-indigo-600 text-white font-bold text-sm tracking-widest uppercase shadow-xl hover:bg-indigo-500 transition-all relative z-10 flex items-center gap-4 group">
            START GENERATION <Zap size={18} className="group-hover:translate-x-1 transition-transform" />
         </Button>
      </div>
    </div>
  );
}