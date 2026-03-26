"use client";

import React, { useState } from "react";
import { 
  Sparkles, SlidersHorizontal, FileText, 
  History, CheckCircle2, Loader2, Save,
  Zap, Info, BrainCircuit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const RECENT_UPDATES = [
  { id: 1, title: "Tone Refined", details: "Detected preference for shorter sentences on Twitter.", time: "2h ago" },
  { id: 2, title: "Humor Detected", details: "Learned to use light technical humor on LinkedIn.", time: "Yesterday" },
  { id: 3, title: "Style Adjustment", details: "Avoid exclamation marks when writing for Developers.", time: "2 days ago" },
];

export default function TunePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [samples, setSamples] = useState("");

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 3000);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  return (
    <div className="flex-1 space-y-8 p-8 bg-[#fdfbf6] text-slate-900 overflow-y-auto h-screen pb-24 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold tracking-tight text-slate-900">Voice & Style Training</h1>
          <p className="text-sm text-slate-400 font-medium">Teach Meta exactly how you speak and write.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-11 rounded-2xl px-6 border-slate-100 hover:bg-white text-xs font-bold font-sans">RESET TO DEFAULT</Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="h-11 rounded-2xl px-8 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-sans shadow-xl shadow-indigo-500/20"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : "SAVE VOICE PROFILE"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Section 1: Writing Samples */}
        <div className="col-span-12 xl:col-span-7 space-y-6">
           <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-100">
                      <FileText size={20} />
                   </div>
                   <h2 className="text-lg font-bold text-slate-900">Writing Samples</h2>
                 </div>
                 <Button variant="ghost" className="text-indigo-500 text-[11px] font-bold tracking-widest uppercase hover:bg-indigo-50">IMPORT FROM SOCIALS</Button>
              </div>
              
              <div className="space-y-2">
                 <p className="text-xs text-slate-400 leading-relaxed font-medium">Paste 3-10 examples of your best posts, articles or tweets here. Meta will identify recurring patterns in your tone, vocabulary, and humor.</p>
                 <textarea 
                   className="w-full h-80 p-6 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-200 outline-none text-sm text-slate-700 leading-relaxed transition-colors placeholder:text-slate-300 font-medium" 
                   placeholder="Example: 'Excited to share that we just crossed 1,000 users! Building CozyJet has been a wild ride...'"
                   value={samples}
                   onChange={(e) => setSamples(e.target.value)}
                 />
              </div>

              <Button 
                onClick={handleAnalyze} 
                className="w-full h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-bold hover:bg-indigo-100 border border-indigo-100"
              >
                {isAnalyzing ? <Loader2 className="animate-spin" /> : "ANALYZE SAMPLES & UPDATE VOICE"}
              </Button>
           </div>
        </div>

        {/* Section 2: Voice Profile Tuning */}
        <div className="col-span-12 xl:col-span-5 space-y-8">
           <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-100">
                    <SlidersHorizontal size={20} />
                 </div>
                 <h2 className="text-lg font-bold text-slate-900">Live Voice Tuning</h2>
              </div>

              <div className="space-y-10 py-2">
                 {[
                   { label: "Formality", min: "Casual", max: "Professional", value: 40 },
                   { label: "Emoji Frequency", min: "None", max: "Heavy", value: 75 },
                   { label: "Technical Depth", min: "Beginner", max: "Expert", value: 60 },
                   { label: "Humor Level", min: "Direct", max: "Witty", value: 25 },
                 ].map((slider) => (
                    <div key={slider.label} className="space-y-4">
                       <div className="flex items-center justify-between text-[11px] uppercase font-bold tracking-widest text-slate-400">
                          <span>{slider.label}</span>
                          <span className="text-indigo-500">{slider.value}%</span>
                       </div>
                       <div className="relative h-1.5 w-full bg-slate-100 rounded-full">
                          <div 
                            className="absolute h-full bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                            style={{ width: `${slider.value}%` }} 
                          />
                          <div 
                            className="absolute w-4 h-4 rounded-full bg-white border-2 border-indigo-500 -top-1.5 shadow-md cursor-pointer" 
                            style={{ left: `calc(${slider.value}% - 8px)` }} 
                          />
                       </div>
                       <div className="flex justify-between text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                          <span>{slider.min}</span>
                          <span>{slider.max}</span>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-4">
                 <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                 <p className="text-[11px] text-indigo-500/80 leading-relaxed font-medium">Changes here will be saved instantly and influence all future platform variations generated by Meta.</p>
              </div>
           </div>

           {/* Section 3: Continuous Learning Log */}
           <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100">
                    <BrainCircuit size={20} />
                 </div>
                 <h2 className="text-lg font-bold text-slate-900">Continuous Learning</h2>
              </div>
              
              <div className="space-y-4">
                 {RECENT_UPDATES.map(u => (
                    <div key={u.id} className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-slate-100 transition-all cursor-default group">
                       <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-emerald-500 transition-colors">{u.title}</span>
                          <span className="text-[10px] text-slate-300 font-medium">{u.time}</span>
                       </div>
                       <p className="text-xs text-slate-500 font-medium leading-relaxed">{u.details}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
