"use client";

import React, { useState } from "react";
import { 
  ChevronLeft, ChevronRight, Plus, 
  Calendar as CalendarIcon, Filter, 
  Zap, TrendingUp, Sparkles, LayoutGrid, List 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CALENDAR_DAYS = Array.from({ length: 35 }, (_, i) => ({
  date: i + 1,
  current: i < 31,
  posts: i === 23 ? ['twitter', 'linkedin'] : i === 25 ? ['instagram'] : i === 28 ? ['twitter', 'reddit', 'youtube'] : []
}));

const SNOOKS_SUGGESTIONS = [
  { id: 1, title: "Building a production grade FastAPI backend", platform: "LinkedIn", type: "Tutorial", reason: "AI detected a trend in developer content." },
  { id: 2, title: "Why I switched to Gemini for Planning", platform: "Twitter", type: "Thread", reason: "Follows your recent work log." },
  { id: 3, title: "CozyJet.AI Behind the Scenes", platform: "Instagram", type: "Carousel", reason: "Top performing format for your audience." },
];

const PLATFORM_COLORS: Record<string, string> = {
  twitter: "bg-sky-400",
  linkedin: "bg-blue-400",
  instagram: "bg-pink-400",
  youtube: "bg-red-400",
  reddit: "bg-orange-400",
};

export default function CalendarPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <div className="flex-1 grid grid-cols-12 bg-[#0a0a0c] text-white overflow-hidden h-screen">
      {/* Main Calendar View */}
      <div className="col-span-12 lg:col-span-9 flex flex-col border-r border-white/5 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
               <CalendarIcon size={18} className="text-white/40" /> March 2026
            </h2>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5">
              <button 
                onClick={() => setView('grid')}
                className={cn("p-1.5 rounded-md transition-all", view === 'grid' ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5")}
              >
                <LayoutGrid size={14} />
              </button>
              <button 
                onClick={() => setView('list')}
                className={cn("p-1.5 rounded-md transition-all", view === 'list' ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5")}
              >
                <List size={14} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1 bg-white/5 border border-white/5 rounded-lg px-3 py-1.5">
                <Filter size={12} className="text-white/30" />
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Filter</span>
             </div>
             <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-9">
                <Plus size={16} /> Schedule Post
             </Button>
          </div>
        </div>

        {/* Grid Container */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-7 border-t border-l border-white/5">
             {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                <div key={d} className="p-3 border-r border-b border-white/5 text-center">
                   <span className="text-[10px] uppercase font-bold text-white/20 tracking-widest">{d}</span>
                </div>
             ))}
             {CALENDAR_DAYS.map((day, i) => (
                <div key={i} className={cn("aspect-square p-2 border-r border-b border-white/5 hover:bg-white/[0.02] transition-colors relative flex flex-col justify-between group", !day.current && "opacity-20")}>
                    <span className="text-xs font-mono text-white/30">{day.date}</span>
                    <div className="flex flex-wrap gap-1">
                       {day.posts.map(p => (
                          <div key={p} className={cn("w-1.5 h-1.5 rounded-full", PLATFORM_COLORS[p])} />
                       ))}
                    </div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar: Snooks Strategist */}
      <div className="col-span-12 lg:col-span-3 flex flex-col bg-black/40 overflow-hidden shadow-2xl">
         <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02] shrink-0">
            <h3 className="text-sm font-bold flex items-center gap-2">
               <span className="text-amber-400">⚡</span> Snooks Suggestions
            </h3>
            <Sparkles size={14} className="text-white/20" />
         </div>

         <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div className="space-y-4">
               {SNOOKS_SUGGESTIONS.map(s => (
                  <div key={s.id} className="p-5 rounded-xl bg-white/[0.03] border border-white/5 space-y-3 group hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all cursor-pointer">
                     <div className="flex items-center justify-between">
                        <span className="text-[9px] px-2 py-0.5 rounded-lg border border-white/10 text-white/40 uppercase tracking-widest font-bold">
                           {s.platform}
                        </span>
                        <TrendingUp size={12} className="text-emerald-500/40 group-hover:text-emerald-500" />
                     </div>
                     <h4 className="text-sm font-semibold leading-relaxed">{s.title}</h4>
                     <p className="text-[10px] text-white/30 leading-relaxed italic">{s.reason}</p>
                     <Button variant="ghost" className="w-full justify-between h-8 mt-2 text-[10px] px-2 hover:bg-white/5 border border-white/5 group-hover:border-emerald-500/20">
                        Generate Content <ChevronRight size={12} />
                     </Button>
                  </div>
               ))}
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/10 space-y-4 relative overflow-hidden">
               <div className="relative z-10 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-emerald-400/60 tracking-widest">Current Trend</div>
                  <h4 className="text-sm font-bold">Next.js 15 Server Components</h4>
                  <p className="text-[10px] text-white/40 leading-relaxed">Engagement for this topic is up 45% in your niche over the last 24h.</p>
               </div>
               <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                  <Zap size={64} />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
