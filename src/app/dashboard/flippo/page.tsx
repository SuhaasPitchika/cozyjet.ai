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
    <div className="p-10 space-y-12">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold uppercase tracking-tighter">Flippo <span className="text-black/40">Timeline</span></h1>
          <p className="text-black/40 text-[10px] font-bold uppercase tracking-[0.2em]">Emotional Productivity Context Engine</p>
        </div>
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="h-14 px-10 rounded-full bg-black text-white hover:bg-black/90 font-bold text-[10px] uppercase tracking-widest shadow-xl"
        >
          {isGenerating ? "Analyzing Studio Data..." : "Generate Matrix"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Score & Matrix */}
        <Card className="lg:col-span-1 rounded-[2.5rem] overflow-hidden border-black/5 bg-white/50 backdrop-blur-sm shadow-sm">
          <CardContent className="p-10 space-y-8">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto neumorphic-out rounded-full flex flex-col items-center justify-center bg-white border border-black/5">
                <span className="text-4xl font-bold">84</span>
                <span className="text-[8px] font-bold text-black/40 uppercase tracking-widest">Focus Score</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-black/40">
                <span>Deep Work State</span>
                <span className="text-black">EXCELLENT</span>
              </div>
              <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: "84%" }} className="h-full bg-black" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 neumorphic-in rounded-2xl text-center">
                <Zap size={16} className="mx-auto mb-2" />
                <span className="text-[10px] font-bold">Flow Peaks: 3</span>
              </div>
              <div className="p-4 neumorphic-in rounded-2xl text-center">
                <Activity size={16} className="mx-auto mb-2" />
                <span className="text-[10px] font-bold">Distractions: 0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Visualization */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-black/40 flex items-center gap-2">
            <Clock size={16} />
            Causal Thread History
          </h3>
          
          <div className="space-y-4 relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-black/5" />
            
            {hasData ? TIMELINE_EVENTS.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-12 group"
              >
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-black border-4 border-white shadow-sm z-10" />
                <div className="glass p-6 rounded-3xl group-hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-black/40">{event.time}</span>
                    <span className="bg-black/5 text-[8px] font-bold uppercase px-3 py-1 rounded-full">{event.emotion}</span>
                  </div>
                  <h4 className="text-xs font-bold uppercase mb-1">{event.app}: {event.action}</h4>
                  <p className="text-[10px] text-black/40">Verified via screen-match and keystroke analysis.</p>
                </div>
              </motion.div>
            )) : (
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-black/5 rounded-[2.5rem]">
                <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest">No matrix generated for current session.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}