"use client";

import React, { useState } from "react";
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Plus, CheckCircle2, Sparkles, Filter, 
  Twitter, Linkedin, Instagram, Youtube, 
  MessageSquare, SlidersHorizontal, Settings2, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const PLATFORMS: Record<string, any> = {
  twitter: { icon: Twitter, color: "bg-sky-500" },
  linkedin: { icon: Linkedin, color: "bg-blue-600" },
  instagram: { icon: Instagram, color: "bg-pink-600" },
  youtube: { icon: Youtube, color: "bg-red-600" },
};

const MOCK_STRATEGY = [
  { day: "Tuesday", recommendation: "Educational 'How-to' thread for Developers.", status: "Missing" },
  { day: "Thursday", recommendation: "Behind-the-scenes progress on Figma.", status: "Scheduled", post_id: "1" },
  { day: "Saturday", recommendation: "Personal outcome of the weekly sprint.", status: "Missing" },
];

const MOCK_POSTS = [
  { id: "1", platform: "linkedin", title: "Figma Redesign Build", time: "10:30 AM", date: 24, status: "scheduled" },
  { id: "2", platform: "twitter", title: "Secure JWT Auth Thread", time: "02:15 PM", date: 20, status: "published" },
];

export default function CalendarPage() {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div className="flex-1 flex bg-[#fdfbf7] overflow-hidden h-screen font-sans">
      <div className="flex-1 flex flex-col p-8 gap-8 overflow-y-auto pb-40">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Content Calendar</h1>
            <p className="text-sm text-slate-500 font-medium">Manage your multi-platform presence across time.</p>
          </div>
          <div className="flex gap-3">
             <div className="flex bg-white rounded-2xl border border-slate-100 p-1 shadow-sm">
                <button 
                  onClick={() => setView("grid")}
                  className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", view === "grid" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-900")}
                >GRID</button>
                <button 
                  onClick={() => setView("list")}
                  className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", view === "list" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-900")}
                >LIST</button>
             </div>
             <Button className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-widest uppercase shadow-xl shadow-indigo-500/10">
                <Plus size={16} className="mr-2" /> NEW POST
             </Button>
          </div>
        </div>

        {/* Global Nav for Months */}
        <div className="flex items-center gap-10">
           <div className="flex items-center gap-4">
              <button className="p-2 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors"><ChevronLeft size={18} /></button>
              <h2 className="text-xl font-bold font-headline text-slate-900">November 2026</h2>
              <button className="p-2 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors"><ChevronRight size={18} /></button>
           </div>
           
           <div className="flex gap-4">
              {Object.keys(PLATFORMS).map(id => (
                 <div key={id} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-100 bg-white cursor-pointer hover:border-indigo-200 transition-colors">
                    {React.createElement(PLATFORMS[id].icon, { size: 14, className: "text-slate-400" })}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{id}</span>
                 </div>
              ))}
           </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 border border-slate-100 rounded-[2.5rem] bg-white overflow-hidden shadow-2xl shadow-slate-200/50">
           {DAYS.map(day => (
             <div key={day} className="p-4 border-b border-r border-slate-50 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 bg-slate-50/30">
                {day}
             </div>
           ))}
           
           {/* Calendar Days Rendering logic */}
           {Array.from({ length: 35 }).map((_, i) => {
             const dayNum = i - 4; // Mock start
             const dayPosts = MOCK_POSTS.filter(p => p.date === dayNum);
             
             return (
               <div key={i} className="min-h-[160px] p-4 border-b border-r border-slate-50 hover:bg-slate-50/50 transition-colors relative group">
                  {dayNum > 0 && dayNum <= 30 && (
                     <>
                        <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">{dayNum}</span>
                        <div className="mt-3 space-y-2">
                           {dayPosts.map(post => (
                             <motion.div 
                               key={post.id} 
                               layoutId={post.id}
                               className={cn(
                                 "p-2 rounded-xl border flex flex-col gap-1.5 cursor-pointer shadow-sm group/post",
                                 post.status === "published" ? "bg-emerald-50 border-emerald-100 shadow-emerald-500/5" : "bg-white border-slate-100 shadow-slate-200/50"
                               )}
                             >
                                <div className={cn("w-5 h-5 rounded-lg flex items-center justify-center text-white", PLATFORMS[post.platform].color)}>
                                   {React.createElement(PLATFORMS[post.platform].icon, { size: 10 })}
                                </div>
                                <span className={cn("text-[10px] font-bold leading-tight line-clamp-2", post.status === "published" ? "text-emerald-700" : "text-slate-900")}>
                                   {post.title}
                                </span>
                                <div className="flex items-center gap-1 mt-1 text-slate-300">
                                   <Clock size={10} />
                                   <span className="text-[8px] font-bold uppercase tracking-widest">{post.time}</span>
                                </div>
                             </motion.div>
                           ))}
                        </div>
                        <button className="absolute bottom-4 right-4 p-2 rounded-xl bg-indigo-50 text-indigo-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-100">
                           <Plus size={14} />
                        </button>
                     </>
                  )}
               </div>
             )
           })}
        </div>
      </div>

      {/* Right Sidebar: Snooks Strategy */}
      <div className="w-[400px] border-l border-slate-100 bg-[#fdfbf7] p-8 flex flex-col gap-10 overflow-y-auto h-screen pb-40">
         <div className="space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                     <CalendarIcon size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Snooks Strategist</h3>
               </div>
               <Button variant="ghost" size="icon" className="text-slate-400"><Settings2 size={18} /></Button>
            </div>
            
            <p className="text-xs text-slate-400 font-medium leading-relaxed">Snooks analyzes your activity and feed to find gaps in your narrative strategy.</p>
         </div>

         <div className="space-y-4">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Weekly Blueprint</span>
               <span className="text-[10px] font-bold text-indigo-500 cursor-pointer">Re-analyze</span>
            </div>
            
            {MOCK_STRATEGY.map((item, i) => (
               <div key={i} className={cn(
                 "p-6 rounded-[2rem] border transition-all",
                 item.status === "Missing" ? "bg-white border-amber-100 shadow-xl shadow-amber-500/5" : "bg-emerald-50 border-emerald-100"
               )}>
                  <div className="flex items-start justify-between mb-4">
                     <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.day}</span>
                     </div>
                     {item.status === "Missing" ? (
                        <div className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[8px] font-bold uppercase tracking-widest border border-amber-100">Gap Detected</div>
                     ) : (
                        <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[8px] font-bold uppercase tracking-widest"><CheckCircle2 size={10} /></div>
                     )}
                  </div>
                  <p className="text-xs font-bold text-slate-900 leading-relaxed mb-4">{item.recommendation}</p>
                  
                  {item.status === "Missing" && (
                     <Button className="w-full h-10 rounded-xl bg-slate-900 text-white font-bold text-[10px] tracking-widest uppercase flex items-center gap-2 group">
                        Fill Gap with Meta <Sparkles size={12} className="group-hover:rotate-12 transition-transform" />
                     </Button>
                  )}
               </div>
            ))}
         </div>

         {/* Meta Refinement Chat Placeholder */}
         <div className="mt-auto p-6 rounded-[2rem] bg-indigo-600 text-white space-y-4 shadow-2xl shadow-indigo-600/20">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                  <Sparkles size={16} />
               </div>
               <span className="font-bold text-sm">Meta Optimization Chat</span>
            </div>
            <p className="text-[10px] text-white/70 font-medium leading-relaxed">Meta can refine your entire weekly strategy at once. Give a high-level command below:</p>
            <div className="relative">
               <input 
                 className="w-full h-12 bg-white/10 rounded-xl border border-white/20 outline-none px-4 text-xs font-medium placeholder:text-white/40 focus:bg-white/20 transition-all pr-12" 
                 placeholder="Make this week more technical..." 
               />
               <button className="absolute right-2 top-2 w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-600">
                  <Plus size={16} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
