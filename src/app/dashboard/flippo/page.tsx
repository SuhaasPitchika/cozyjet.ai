"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Clock, Activity, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const TIMELINE_EVENTS = [
  { time: "09:15 AM", app: "Figma", action: "Redesigned Landing Hero", type: "Creative", emotion: "Focused" },
  { time: "11:30 AM", app: "VS Code", action: "Debugged Auth Context", type: "Deep Work", emotion: "Intense" },
  { time: "02:45 PM", app: "Chrome", action: "Researched VERA protocols", type: "Research", emotion: "Curious" },
];

export default function FlippoPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasData, setHasData] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setHasData(true);
    }, 2000);
  };

  return (
    <div className="p-12 space-y-16 font-pixel">
      <div className="flex justify-between items-end">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold uppercase tracking-tighter">Flippo <span className="text-black/40">Timeline</span></h1>
          <p className="text-black/40 text-[8px] font-bold uppercase tracking-[0.2em]">Emotional Productivity Engine</p>
        </div>
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="h-16 px-12 rounded-full bg-black text-white hover:bg-black/90 font-bold text-[8px] uppercase tracking-widest shadow-2xl transition-all hover:scale-105"
        >
          {isGenerating ? "Analyzing..." : "Generate Matrix"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Score & Matrix */}
        <Card className="lg:col-span-1 rounded-[3rem] overflow-hidden border-2 border-black bg-white/60 backdrop-blur-md shadow-2xl">
          <CardContent className="p-12 space-y-10">
            <div className="text-center">
              <div className="w-40 h-40 mx-auto rounded-full flex flex-col items-center justify-center bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-4xl font-bold">84</span>
                <span className="text-[6px] font-bold text-black/40 uppercase tracking-widest mt-2">Focus</span>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-black/40">
                <span>Flow State</span>
                <span className="text-black">EXCELLENT</span>
              </div>
              <div className="h-4 w-full bg-black/5 rounded-full overflow-hidden border-2 border-black/10 p-1">
                <motion.div initial={{ width: 0 }} animate={{ width: "84%" }} className="h-full bg-black rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-white border-2 border-black rounded-3xl text-center shadow-lg">
                <Zap size={20} className="mx-auto mb-3" />
                <span className="text-[8px] font-bold uppercase">Peak: 3</span>
              </div>
              <div className="p-6 bg-white border-2 border-black rounded-3xl text-center shadow-lg">
                <Activity size={20} className="mx-auto mb-3" />
                <span className="text-[8px] font-bold uppercase">Dist: 0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Visualization */}
        <div className="lg:col-span-2 space-y-10">
          <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 flex items-center gap-4">
            <Clock size={20} />
            Causal History
          </h3>
          
          <div className="space-y-6 relative pb-10">
            <div className="absolute left-5 top-0 bottom-0 w-1 bg-black/10" />
            
            {hasData ? TIMELINE_EVENTS.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="relative pl-16 group"
              >
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-4 border-black shadow-lg z-10" />
                <div className="bg-white/80 p-8 rounded-[2.5rem] border-2 border-black shadow-xl group-hover:scale-[1.02] transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[8px] font-mono text-black/40">{event.time}</span>
                    <span className="bg-black text-white text-[6px] font-bold uppercase px-4 py-2 rounded-full">{event.emotion}</span>
                  </div>
                  <h4 className="text-[10px] font-bold uppercase mb-2 tracking-tight">{event.app}: {event.action}</h4>
                  <p className="text-[8px] text-black/40 leading-relaxed uppercase">Evidence: Screen-match and keystroke analysis confirmed.</p>
                </div>
              </motion.div>
            )) : (
              <div className="h-80 flex flex-col items-center justify-center border-4 border-dashed border-black/10 rounded-[3rem] space-y-6">
                <div className="w-16 h-16 border-4 border-black/10 border-t-black rounded-full animate-spin" />
                <p className="text-[8px] font-bold text-black/20 uppercase tracking-[0.3em]">Waiting for data synchronization...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
