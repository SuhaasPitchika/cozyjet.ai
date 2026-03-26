"use client";

import React, { useState } from "react";
import { 
  FileText, Plus, Search, 
  MoreVertical, Copy, Edit, Trash2, 
  Star, Share2, Grid, LayoutList,
  Sparkles, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TEMPLATES = [
  { id: 1, name: "Feature Launch", description: "Standard LinkedIn template for announced software features.", text: "Excited to share that {feature_name} is finally live! We built this to solve {problem}. {cta_link}", score: 4.5, isPublic: true },
  { id: 2, name: "Technical Thread", description: "Twitter thread format for deep-dives into code or architecture.", text: "1/ {topic_title} is a common challenge for {audience} founders. Here's how we implemented it at {company_name}: {details} #buildinpublic", score: 4.8, isPublic: false },
  { id: 3, name: "Outcome Driven Post", description: "Focused on results, metrics, and case studies.", text: "In just {timeframe}, we achieved {result} using {technology}. The secret? It was all about {insight}. Check the repo: {link}", score: 4.2, isPublic: true },
  { id: 4, name: "Behind the Scenes", description: "Casual office/setup aesthetic for Instagram or Twitter.", text: "Late nights at {location} are worth it when you're building {product}. {status_update}. Follow our journey: {link}", score: 3.9, isPublic: false },
];

export default function TemplatesPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <div className="flex-1 space-y-8 p-8 bg-[#0a0a0c] text-white overflow-y-auto h-screen pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Templates</h1>
          <p className="text-white/40 mt-1">Manage and reusable your high-performing content structures.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">Browse Communitity</Button>
          <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold">
            <Plus size={16} /> New Template
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
         <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <Input 
              placeholder="Search templates..." 
              className="bg-white/5 border-white/10 pl-10 focus:border-emerald-500/50" 
            />
         </div>
         <div className="flex items-center gap-2 p-1 rounded-lg bg-white/5">
            <button 
              onClick={() => setView('grid')}
              className={cn("p-1.5 rounded-md transition-all", view === 'grid' ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5")}
            >
              <Grid size={16} />
            </button>
            <button 
              onClick={() => setView('list')}
              className={cn("p-1.5 rounded-md transition-all", view === 'list' ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5")}
            >
              <LayoutList size={16} />
            </button>
          </div>
      </div>

      {/* Grid View */}
      <div className={cn(
        "grid gap-6 transition-all",
        view === 'grid' ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
      )}>
        {TEMPLATES.map((t) => (
          <div key={t.id} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-6 hover:bg-white/[0.05] hover:border-white/10 transition-all group group relative">
             <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                   <FileText size={20} />
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-[9px] px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Star size={8} fill="currentColor" /> {t.score}
                   </span>
                   {t.isPublic && <span className="text-[9px] px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-400 font-bold uppercase tracking-widest">Public</span>}
                </div>
             </div>

             <div className="space-y-2">
                <h3 className="text-lg font-bold">{t.name}</h3>
                <p className="text-xs text-white/30 leading-relaxed">{t.description}</p>
             </div>

             {/* Template Preview Section */}
             <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono leading-relaxed text-white/50 space-y-4">
                <div className="whitespace-pre-wrap">
                   {t.text.split(/({.*?})/).map((part, i) => (
                      <span key={i} className={part.startsWith('{') ? "text-emerald-400 font-bold bg-emerald-400/10 px-1 rounded-sm" : ""}>
                         {part}
                      </span>
                   ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[9px] text-white/20 uppercase font-bold tracking-widest">
                   <span>4 placeholders detected</span>
                   <Sparkles size={10} className="text-emerald-500/40" />
                </div>
             </div>

             <div className="flex items-center justify-between pt-4 gap-3">
                <Button className="flex-1 bg-white text-black font-bold hover:bg-white/90">
                   Use Template
                </Button>
                <div className="flex gap-1">
                   <Button variant="ghost" size="icon" className="text-white/30 hover:text-white">
                      <Edit size={16} />
                   </Button>
                   <Button variant="ghost" size="icon" className="text-white/30 hover:text-red-400">
                      <Trash2 size={16} />
                   </Button>
                </div>
             </div>
          </div>
        ))}

        {/* Create Card Prompt */}
        <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer hover:bg-emerald-500/10 transition-all border-dashed">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Plus size={24} />
            </div>
            <div>
               <h4 className="font-bold">Create New Template</h4>
               <p className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest mt-1">Design your signature style</p>
            </div>
        </div>
      </div>
    </div>
  );
}
